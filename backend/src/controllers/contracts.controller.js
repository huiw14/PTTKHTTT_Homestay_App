import { prisma } from "../lib/prisma.js";

const CONTRACT_STATUSES = new Set(["DangHieuLuc", "HetHan", "DaThanhLy"]);

const parseDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date;
};

const addMonths = (date, months) => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

const normalizeRooms = (deposit) => {
  const names = (deposit?.chiTietPhieuCoc || [])
    .map((item) => item.giuong?.phong?.tenPhong || item.giuong?.maPhong)
    .filter(Boolean);

  return [...new Set(names)].join(", ");
};

const mapContract = (item) => ({
  maHD: item.maHD,
  maPC: item.maPC,
  maNV: item.maNV,
  ngayKy: item.ngayKy,
  ngayBatDau: item.ngayBatDau,
  ngayKetThuc: item.ngayKetThuc,
  kyThanhToan: item.kyThanhToan,
  trangThai: item.trangThai,
  anhHD: item.anhHD ?? null,
  khachHangName: item.phieuCoc?.khachHang?.hoTen || null,
  tienCoc: item.phieuCoc?.tienCoc || null,
  roomSummary: normalizeRooms(item.phieuCoc),
  soThanhVien: item.thanhVien?.length || 0,
});

const getNextContractId = async (tx) => {
  const lastContract = await tx.hopDong.findFirst({
    select: { maHD: true },
    orderBy: { maHD: "desc" },
  });

  const current = Number.parseInt((lastContract?.maHD || "HD000").replace(/\D+/g, ""), 10) || 0;
  return `HD${String(current + 1).padStart(3, "0")}`;
};

export const getContracts = async (_req, res) => {
  try {
    const records = await prisma.hopDong.findMany({
      orderBy: { ngayKy: "desc" },
      include: {
        thanhVien: true,
        phieuCoc: {
          include: {
            khachHang: true,
            chiTietPhieuCoc: {
              include: {
                giuong: {
                  include: {
                    phong: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    res.status(200).json({ data: records.map(mapContract) });
  } catch (error) {
    res.status(500).json({ message: "Không thể lấy danh sách hợp đồng.", detail: error.message });
  }
};

export const getEligibleDeposits = async (_req, res) => {
  try {
    const deposits = await prisma.phieuCoc.findMany({
      where: {
        trangThai: "DaThanhToan",
        hopDong: {
          none: {},
        },
      },
      orderBy: { ngayCoc: "desc" },
      include: {
        khachHang: true,
        chiTietPhieuCoc: {
          include: {
            giuong: {
              include: {
                phong: true,
              },
            },
          },
        },
      },
    });

    const data = deposits.map((item) => ({
      maPC: item.maPC,
      maKH: item.maKH,
      maNV: item.maNV,
      ngayCoc: item.ngayCoc,
      tienCoc: item.tienCoc,
      khachHangName: item.khachHang?.hoTen || null,
      roomSummary: normalizeRooms(item),
      soGiuong: item.chiTietPhieuCoc.length,
    }));

    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ message: "Không thể lấy danh sách phiếu cọc đủ điều kiện.", detail: error.message });
  }
};

export const createContract = async (req, res) => {
  const { maPC, maNV, ngayKy, ngayBatDau, kyThanhToan, anhHD } = req.body;

  if (!maPC || !maNV || !ngayKy || !ngayBatDau || kyThanhToan === undefined) {
    return res.status(400).json({
      message: "Thiếu thông tin bắt buộc. Cần có maPC, maNV, ngayKy, ngayBatDau, kyThanhToan.",
    });
  }

  const signDate = parseDate(ngayKy);
  const startDate = parseDate(ngayBatDau);
  const paymentCycle = Number.parseInt(String(kyThanhToan), 10);

  if (!signDate || !startDate) {
    return res.status(400).json({ message: "Ngày ký hoặc ngày bắt đầu không hợp lệ." });
  }

  if (startDate.getTime() < signDate.getTime()) {
    return res.status(400).json({ message: "Ngày bắt đầu phải bằng hoặc sau ngày ký hợp đồng." });
  }

  if (Number.isNaN(paymentCycle) || paymentCycle < 1) {
    return res.status(400).json({ message: "Kỳ thanh toán phải là số nguyên dương." });
  }

  try {
    const created = await prisma.$transaction(async (tx) => {
      const deposit = await tx.phieuCoc.findUnique({
        where: { maPC },
        include: { hopDong: true },
      });

      if (!deposit) {
        throw new Error("DEPOSIT_NOT_FOUND");
      }

      if (deposit.trangThai !== "DaThanhToan") {
        throw new Error("DEPOSIT_NOT_PAID");
      }

      if (deposit.hopDong.length > 0) {
        throw new Error("DEPOSIT_ALREADY_USED");
      }

      const staff = await tx.nhanVien.findUnique({ where: { maNV } });
      if (!staff) {
        throw new Error("STAFF_NOT_FOUND");
      }

      const maHD = await getNextContractId(tx);

      // Nghiệp vụ hiện tại: ngày kết thúc được tính theo số tháng của kỳ thanh toán.
      const ngayKetThuc = addMonths(startDate, paymentCycle);

      let anhHDValue = null;
      if (anhHD) {
        if (typeof anhHD === 'object' && anhHD.url) {
          anhHDValue = anhHD.url;
        } else if (typeof anhHD === 'string') {
          anhHDValue = anhHD;
        }
      }

      const contract = await tx.hopDong.create({
        data: {
          maHD,
          maPC,
          maNV,
          ngayKy: signDate,
          ngayBatDau: startDate,
          ngayKetThuc,
          kyThanhToan: paymentCycle,
          trangThai: "DangHieuLuc",
          anhHD: anhHDValue,
        },
        include: {
          thanhVien: true,
          phieuCoc: {
            include: {
              khachHang: true,
              chiTietPhieuCoc: {
                include: {
                  giuong: {
                    include: {
                      phong: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      return contract;
    });

    return res.status(201).json({
      message: "Tạo hợp đồng thành công.",
      data: mapContract(created),
    });
  } catch (error) {
    if (error.message === "DEPOSIT_NOT_FOUND") {
      return res.status(404).json({ message: "Không tìm thấy phiếu cọc." });
    }
    if (error.message === "DEPOSIT_NOT_PAID") {
      return res.status(400).json({ message: "Phiếu cọc chưa ở trạng thái đã thanh toán." });
    }
    if (error.message === "DEPOSIT_ALREADY_USED") {
      return res.status(409).json({ message: "Phiếu cọc đã được dùng để tạo hợp đồng." });
    }
    if (error.message === "STAFF_NOT_FOUND") {
      return res.status(404).json({ message: "Không tìm thấy nhân viên lập hợp đồng." });
    }

    return res.status(500).json({ message: "Không thể tạo hợp đồng.", detail: error.message });
  }
};

export const updateContract = async (req, res) => {
  const { maHD } = req.params;
  const { trangThai, kyThanhToan, ngayBatDau, anhHD } = req.body;

  if (trangThai !== undefined && !CONTRACT_STATUSES.has(trangThai)) {
    return res.status(400).json({ message: "Trạng thái hợp đồng không hợp lệ." });
  }

  const updateData = {};
  if (trangThai !== undefined) updateData.trangThai = trangThai;
  if (anhHD !== undefined) updateData.anhHD = anhHD;

  try {
    const current = await prisma.hopDong.findUnique({
      where: { maHD },
      select: { maHD: true, ngayBatDau: true, kyThanhToan: true },
    });

    if (!current) {
      return res.status(404).json({ message: "Không tìm thấy hợp đồng cần cập nhật." });
    }

    let nextStartDate = current.ngayBatDau;
    if (ngayBatDau !== undefined) {
      const parsedStart = parseDate(ngayBatDau);
      if (!parsedStart) {
        return res.status(400).json({ message: "Ngày bắt đầu không hợp lệ." });
      }
      nextStartDate = parsedStart;
      updateData.ngayBatDau = parsedStart;
    }

    let nextCycle = current.kyThanhToan;
    if (kyThanhToan !== undefined) {
      const parsedCycle = Number.parseInt(String(kyThanhToan), 10);
      if (Number.isNaN(parsedCycle) || parsedCycle < 1) {
        return res.status(400).json({ message: "Kỳ thanh toán phải là số nguyên dương." });
      }
      nextCycle = parsedCycle;
      updateData.kyThanhToan = parsedCycle;
    }

    if (ngayBatDau !== undefined || kyThanhToan !== undefined) {
      updateData.ngayKetThuc = addMonths(nextStartDate, nextCycle);
    }

    const updated = await prisma.hopDong.update({
      where: { maHD },
      data: updateData,
      include: {
        thanhVien: true,
        phieuCoc: {
          include: {
            khachHang: true,
            chiTietPhieuCoc: {
              include: {
                giuong: {
                  include: {
                    phong: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return res.status(200).json({
      message: "Cập nhật hợp đồng thành công.",
      data: mapContract(updated),
    });
  } catch (error) {
    return res.status(500).json({ message: "Không thể cập nhật hợp đồng.", detail: error.message });
  }
};
