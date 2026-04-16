import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";

const ROLES = new Set(["admin", "sale", "quanly", "ketoan"]);
const ROOM_GENDERS = new Set(["Nam", "Nu", "Chung"]);

const nextCode = async (tx, modelAccessor, field, prefix, pad = 3) => {
  const record = await tx[modelAccessor].findFirst({
    select: { [field]: true },
    orderBy: { [field]: "desc" },
  });

  const current = Number.parseInt(String(record?.[field] || `${prefix}0`).replace(/\D+/g, ""), 10) || 0;
  return `${prefix}${String(current + 1).padStart(pad, "0")}`;
};

const parsePositiveInt = (value) => {
  const parsed = Number.parseInt(String(value), 10);
  if (Number.isNaN(parsed) || parsed < 1) return null;
  return parsed;
};

const parsePositiveNumber = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
};

const toRoomStatus = (beds) => {
  if (beds.every((bed) => bed.trangThai === "Trong")) return "Trong";
  if (beds.every((bed) => bed.trangThai === "DaCoc")) return "DaCoc";
  if (beds.some((bed) => bed.trangThai === "DaThue")) return "DaThue";
  if (beds.some((bed) => bed.trangThai === "DaCoc")) return "DaCoc";
  return "Trong";
};

const buildBedCode = (maPhong, index) => {
  const roomDigits = maPhong.replace(/\D+/g, "").padStart(3, "0").slice(-3);
  return `G${roomDigits}${String(index).padStart(2, "0")}`;
};

const roomInclude = {
  chiNhanh: { select: { tenCN: true } },
  loaiPhong: { select: { tenLoai: true } },
  giuong: { select: { maGiuong: true, trangThai: true } },
};

const mapRoom = (room) => {
  const occupied = room.giuong.filter((bed) => bed.trangThai === "DaThue").length;
  const reserved = room.giuong.filter((bed) => bed.trangThai === "DaCoc").length;
  const available = room.giuong.filter((bed) => bed.trangThai === "Trong").length;

  return {
    maPhong: room.maPhong,
    tenPhong: room.tenPhong,
    maCN: room.maCN,
    tenCN: room.chiNhanh?.tenCN || null,
    maLoai: room.maLoai,
    tenLoai: room.loaiPhong?.tenLoai || null,
    sucChua: room.sucChua,
    gioiTinhPhong: room.gioiTinhPhong,
    giaThue: Number(room.giaThue),
    trangThai: room.trangThai,
    occupiedBeds: occupied,
    reservedBeds: reserved,
    availableBeds: available,
  };
};

export const getCatalogMeta = async (_req, res) => {
  try {
    const [branches, roomTypes, staffs] = await Promise.all([
      prisma.chiNhanh.findMany({ orderBy: { maCN: "asc" } }),
      prisma.loaiPhong.findMany({ orderBy: { maLoai: "asc" } }),
      prisma.nhanVien.findMany({
        where: { trangThai: 1 },
        orderBy: { maNV: "asc" },
        select: { maNV: true, hoTen: true },
      }),
    ]);

    return res.status(200).json({
      data: {
        branches,
        roomTypes,
        staffs,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Không thể tải dữ liệu danh mục nền.", detail: error.message });
  }
};

export const getAccounts = async (_req, res) => {
  try {
    const rows = await prisma.taiKhoan.findMany({
      orderBy: { maTK: "asc" },
      include: {
        nhanVien: {
          select: { hoTen: true },
        },
      },
    });

    return res.status(200).json({
      data: rows.map((row) => ({
        maTK: row.maTK,
        maNV: row.maNV,
        tenDangNhap: row.tenDangNhap,
        vaiTro: row.vaiTro,
        email: row.email,
        trangThai: row.trangThai,
        nhanVienName: row.nhanVien?.hoTen || null,
      })),
    });
  } catch (error) {
    return res.status(500).json({ message: "Không thể lấy danh sách tài khoản.", detail: error.message });
  }
};

export const createAccount = async (req, res) => {
  const { maNV, tenDangNhap, matKhau, vaiTro, email } = req.body;

  if (!maNV || !tenDangNhap || !matKhau || !vaiTro) {
    return res.status(400).json({ message: "Thiếu thông tin bắt buộc để tạo tài khoản." });
  }

  if (!ROLES.has(vaiTro)) {
    return res.status(400).json({ message: "Vai trò không hợp lệ." });
  }

  if (String(matKhau).length < 6) {
    return res.status(400).json({ message: "Mật khẩu phải có ít nhất 6 ký tự." });
  }

  try {
    const created = await prisma.$transaction(async (tx) => {
      const staff = await tx.nhanVien.findUnique({ where: { maNV } });
      if (!staff) {
        throw new Error("STAFF_NOT_FOUND");
      }

      const existed = await tx.taiKhoan.findUnique({ where: { tenDangNhap } });
      if (existed) {
        throw new Error("USERNAME_EXISTS");
      }

      const maTK = await nextCode(tx, "taiKhoan", "maTK", "TK");
      const hashed = await bcrypt.hash(String(matKhau), 10);

      return tx.taiKhoan.create({
        data: {
          maTK,
          maNV,
          tenDangNhap,
          matKhau: hashed,
          vaiTro,
          email: email || null,
          trangThai: 1,
        },
        include: {
          nhanVien: { select: { hoTen: true } },
        },
      });
    });

    return res.status(201).json({
      message: "Tạo tài khoản thành công.",
      data: {
        maTK: created.maTK,
        maNV: created.maNV,
        tenDangNhap: created.tenDangNhap,
        vaiTro: created.vaiTro,
        email: created.email,
        trangThai: created.trangThai,
        nhanVienName: created.nhanVien?.hoTen || null,
      },
    });
  } catch (error) {
    if (error.message === "STAFF_NOT_FOUND") {
      return res.status(404).json({ message: "Không tìm thấy nhân viên để cấp tài khoản." });
    }
    if (error.message === "USERNAME_EXISTS") {
      return res.status(409).json({ message: "Tên đăng nhập đã tồn tại." });
    }
    return res.status(500).json({ message: "Không thể tạo tài khoản.", detail: error.message });
  }
};

export const updateAccount = async (req, res) => {
  const { maTK } = req.params;
  const { vaiTro, email, trangThai } = req.body;

  if (vaiTro !== undefined && !ROLES.has(vaiTro)) {
    return res.status(400).json({ message: "Vai trò không hợp lệ." });
  }

  const updateData = {};
  if (vaiTro !== undefined) updateData.vaiTro = vaiTro;
  if (email !== undefined) updateData.email = email || null;
  if (trangThai !== undefined) {
    const statusNumber = Number.parseInt(String(trangThai), 10);
    if (![0, 1].includes(statusNumber)) {
      return res.status(400).json({ message: "Trạng thái tài khoản không hợp lệ." });
    }
    updateData.trangThai = statusNumber;
  }

  try {
    const updated = await prisma.taiKhoan.update({
      where: { maTK },
      data: updateData,
      include: {
        nhanVien: { select: { hoTen: true } },
      },
    });

    return res.status(200).json({
      message: "Cập nhật tài khoản thành công.",
      data: {
        maTK: updated.maTK,
        maNV: updated.maNV,
        tenDangNhap: updated.tenDangNhap,
        vaiTro: updated.vaiTro,
        email: updated.email,
        trangThai: updated.trangThai,
        nhanVienName: updated.nhanVien?.hoTen || null,
      },
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Không tìm thấy tài khoản cần cập nhật." });
    }
    return res.status(500).json({ message: "Không thể cập nhật tài khoản.", detail: error.message });
  }
};

export const getBranches = async (_req, res) => {
  try {
    const rows = await prisma.chiNhanh.findMany({
      orderBy: { maCN: "asc" },
      include: {
        phong: {
          select: { maPhong: true },
        },
      },
    });

    return res.status(200).json({
      data: rows.map((row) => ({
        maCN: row.maCN,
        tenCN: row.tenCN,
        diaChi: row.diaChi,
        soDT: row.soDT,
        totalRooms: row.phong.length,
      })),
    });
  } catch (error) {
    return res.status(500).json({ message: "Không thể lấy danh sách chi nhánh.", detail: error.message });
  }
};

export const createBranch = async (req, res) => {
  const { tenCN, diaChi, soDT } = req.body;

  if (!tenCN || !diaChi || !soDT) {
    return res.status(400).json({ message: "Vui lòng nhập đủ tên chi nhánh, địa chỉ và số điện thoại." });
  }

  try {
    const created = await prisma.$transaction(async (tx) => {
      const maCN = await nextCode(tx, "chiNhanh", "maCN", "CN");
      return tx.chiNhanh.create({
        data: { maCN, tenCN, diaChi, soDT },
      });
    });

    return res.status(201).json({
      message: "Tạo chi nhánh thành công.",
      data: {
        ...created,
        totalRooms: 0,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Không thể tạo chi nhánh.", detail: error.message });
  }
};

export const updateBranch = async (req, res) => {
  const { maCN } = req.params;
  const { tenCN, diaChi, soDT } = req.body;

  const updateData = {};
  if (tenCN !== undefined) updateData.tenCN = tenCN;
  if (diaChi !== undefined) updateData.diaChi = diaChi;
  if (soDT !== undefined) updateData.soDT = soDT;

  try {
    const updated = await prisma.chiNhanh.update({
      where: { maCN },
      data: updateData,
      include: {
        phong: { select: { maPhong: true } },
      },
    });

    return res.status(200).json({
      message: "Cập nhật chi nhánh thành công.",
      data: {
        maCN: updated.maCN,
        tenCN: updated.tenCN,
        diaChi: updated.diaChi,
        soDT: updated.soDT,
        totalRooms: updated.phong.length,
      },
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Không tìm thấy chi nhánh cần cập nhật." });
    }
    return res.status(500).json({ message: "Không thể cập nhật chi nhánh.", detail: error.message });
  }
};

export const getRooms = async (_req, res) => {
  try {
    const rooms = await prisma.phong.findMany({
      orderBy: { maPhong: "asc" },
      include: roomInclude,
    });

    return res.status(200).json({ data: rooms.map(mapRoom) });
  } catch (error) {
    return res.status(500).json({ message: "Không thể lấy danh sách phòng.", detail: error.message });
  }
};

export const createRoom = async (req, res) => {
  const { tenPhong, maCN, maLoai, sucChua, gioiTinhPhong, giaThue } = req.body;

  if (!tenPhong || !maCN || !maLoai || sucChua === undefined || !gioiTinhPhong || giaThue === undefined) {
    return res.status(400).json({ message: "Thiếu thông tin bắt buộc để tạo phòng." });
  }

  const capacity = parsePositiveInt(sucChua);
  const price = parsePositiveNumber(giaThue);

  if (!capacity) {
    return res.status(400).json({ message: "Sức chứa phải là số nguyên dương." });
  }

  if (!price) {
    return res.status(400).json({ message: "Giá thuê phải lớn hơn 0." });
  }

  if (!ROOM_GENDERS.has(gioiTinhPhong)) {
    return res.status(400).json({ message: "Giới tính phòng không hợp lệ." });
  }

  try {
    const created = await prisma.$transaction(async (tx) => {
      const [branch, roomType] = await Promise.all([
        tx.chiNhanh.findUnique({ where: { maCN } }),
        tx.loaiPhong.findUnique({ where: { maLoai } }),
      ]);

      if (!branch) {
        throw new Error("BRANCH_NOT_FOUND");
      }
      if (!roomType) {
        throw new Error("ROOM_TYPE_NOT_FOUND");
      }

      const maPhong = await nextCode(tx, "phong", "maPhong", "P");

      const room = await tx.phong.create({
        data: {
          maPhong,
          tenPhong,
          maCN,
          maLoai,
          sucChua: capacity,
          gioiTinhPhong,
          giaThue: price,
          trangThai: "Trong",
        },
      });

      // Tạo giường tự động theo sức chứa.
      for (let i = 1; i <= capacity; i += 1) {
        await tx.giuong.create({
          data: {
            maGiuong: buildBedCode(maPhong, i),
            maPhong,
            tenGiuong: `Giường ${i}`,
            trangThai: "Trong",
          },
        });
      }

      const roomWithBeds = await tx.phong.findUnique({
        where: { maPhong: room.maPhong },
        include: roomInclude,
      });

      return roomWithBeds;
    });

    return res.status(201).json({
      message: "Tạo phòng thành công.",
      data: mapRoom(created),
    });
  } catch (error) {
    if (error.message === "BRANCH_NOT_FOUND") {
      return res.status(404).json({ message: "Không tìm thấy chi nhánh." });
    }
    if (error.message === "ROOM_TYPE_NOT_FOUND") {
      return res.status(404).json({ message: "Không tìm thấy loại phòng." });
    }
    return res.status(500).json({ message: "Không thể tạo phòng.", detail: error.message });
  }
};

export const updateRoom = async (req, res) => {
  const { maPhong } = req.params;
  const { tenPhong, gioiTinhPhong, giaThue, trangThai } = req.body;

  if (gioiTinhPhong !== undefined && !ROOM_GENDERS.has(gioiTinhPhong)) {
    return res.status(400).json({ message: "Giới tính phòng không hợp lệ." });
  }

  const updateData = {};
  if (tenPhong !== undefined) updateData.tenPhong = tenPhong;
  if (gioiTinhPhong !== undefined) updateData.gioiTinhPhong = gioiTinhPhong;
  if (giaThue !== undefined) {
    const parsedPrice = parsePositiveNumber(giaThue);
    if (!parsedPrice) {
      return res.status(400).json({ message: "Giá thuê phải lớn hơn 0." });
    }
    updateData.giaThue = parsedPrice;
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const current = await tx.phong.findUnique({
        where: { maPhong },
        include: { giuong: true },
      });

      if (!current) {
        throw new Error("ROOM_NOT_FOUND");
      }

      if (trangThai !== undefined) {
        updateData.trangThai = String(trangThai);
      } else {
        updateData.trangThai = toRoomStatus(current.giuong);
      }

      await tx.phong.update({
        where: { maPhong },
        data: updateData,
      });

      return tx.phong.findUnique({
        where: { maPhong },
        include: roomInclude,
      });
    });

    return res.status(200).json({
      message: "Cập nhật phòng thành công.",
      data: mapRoom(updated),
    });
  } catch (error) {
    if (error.message === "ROOM_NOT_FOUND") {
      return res.status(404).json({ message: "Không tìm thấy phòng cần cập nhật." });
    }
    return res.status(500).json({ message: "Không thể cập nhật phòng.", detail: error.message });
  }
};

export const getAssets = async (_req, res) => {
  try {
    const rows = await prisma.taiSan.findMany({ orderBy: { maTS: "asc" } });
    return res.status(200).json({ data: rows });
  } catch (error) {
    return res.status(500).json({ message: "Không thể lấy danh sách tài sản.", detail: error.message });
  }
};

export const createAsset = async (req, res) => {
  const { tenTS, loaiTS, moTa } = req.body;

  if (!tenTS || !loaiTS) {
    return res.status(400).json({ message: "Vui lòng nhập đủ tên tài sản và loại tài sản." });
  }

  try {
    const created = await prisma.$transaction(async (tx) => {
      const maTS = await nextCode(tx, "taiSan", "maTS", "TS");
      return tx.taiSan.create({
        data: {
          maTS,
          tenTS,
          loaiTS,
          moTa: moTa || null,
        },
      });
    });

    return res.status(201).json({
      message: "Tạo tài sản thành công.",
      data: created,
    });
  } catch (error) {
    return res.status(500).json({ message: "Không thể tạo tài sản.", detail: error.message });
  }
};

export const updateAsset = async (req, res) => {
  const { maTS } = req.params;
  const { tenTS, loaiTS, moTa } = req.body;

  const updateData = {};
  if (tenTS !== undefined) updateData.tenTS = tenTS;
  if (loaiTS !== undefined) updateData.loaiTS = loaiTS;
  if (moTa !== undefined) updateData.moTa = moTa || null;

  try {
    const updated = await prisma.taiSan.update({
      where: { maTS },
      data: updateData,
    });

    return res.status(200).json({ message: "Cập nhật tài sản thành công.", data: updated });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Không tìm thấy tài sản cần cập nhật." });
    }
    return res.status(500).json({ message: "Không thể cập nhật tài sản.", detail: error.message });
  }
};

export const getServices = async (_req, res) => {
  try {
    const rows = await prisma.dichVu.findMany({ orderBy: { maDV: "asc" } });
    return res.status(200).json({
      data: rows.map((row) => ({
        ...row,
        donGia: Number(row.donGia),
      })),
    });
  } catch (error) {
    return res.status(500).json({ message: "Không thể lấy danh sách dịch vụ.", detail: error.message });
  }
};

export const createService = async (req, res) => {
  const { tenDV, donViTinh, donGia } = req.body;

  if (!tenDV || !donViTinh || donGia === undefined) {
    return res.status(400).json({ message: "Vui lòng nhập đủ tên dịch vụ, đơn vị tính và đơn giá." });
  }

  const price = parsePositiveNumber(donGia);
  if (!price) {
    return res.status(400).json({ message: "Đơn giá không hợp lệ." });
  }

  try {
    const created = await prisma.$transaction(async (tx) => {
      const maDV = await nextCode(tx, "dichVu", "maDV", "DV");
      return tx.dichVu.create({
        data: {
          maDV,
          tenDV,
          donViTinh,
          donGia: price,
        },
      });
    });

    return res.status(201).json({
      message: "Tạo dịch vụ thành công.",
      data: {
        ...created,
        donGia: Number(created.donGia),
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Không thể tạo dịch vụ.", detail: error.message });
  }
};

export const updateService = async (req, res) => {
  const { maDV } = req.params;
  const { tenDV, donViTinh, donGia } = req.body;

  const updateData = {};
  if (tenDV !== undefined) updateData.tenDV = tenDV;
  if (donViTinh !== undefined) updateData.donViTinh = donViTinh;

  if (donGia !== undefined) {
    const price = parsePositiveNumber(donGia);
    if (!price) {
      return res.status(400).json({ message: "Đơn giá không hợp lệ." });
    }
    updateData.donGia = price;
  }

  try {
    const updated = await prisma.dichVu.update({
      where: { maDV },
      data: updateData,
    });

    return res.status(200).json({
      message: "Cập nhật dịch vụ thành công.",
      data: {
        ...updated,
        donGia: Number(updated.donGia),
      },
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Không tìm thấy dịch vụ cần cập nhật." });
    }
    return res.status(500).json({ message: "Không thể cập nhật dịch vụ.", detail: error.message });
  }
};

export const getPolicies = async (_req, res) => {
  try {
    const rows = await prisma.chinhSach.findMany({ orderBy: { maCS: "asc" } });
    return res.status(200).json({ data: rows });
  } catch (error) {
    return res.status(500).json({ message: "Không thể lấy danh sách chính sách.", detail: error.message });
  }
};

export const createPolicy = async (req, res) => {
  const { tieuDe, noiDung, trangThai } = req.body;

  if (!tieuDe || !noiDung) {
    return res.status(400).json({ message: "Vui lòng nhập tiêu đề và nội dung chính sách." });
  }

  try {
    const created = await prisma.$transaction(async (tx) => {
      const maCS = await nextCode(tx, "chinhSach", "maCS", "CS");
      return tx.chinhSach.create({
        data: {
          maCS,
          tieuDe,
          noiDung,
          trangThai: trangThai === 0 ? 0 : 1,
        },
      });
    });

    return res.status(201).json({ message: "Tạo chính sách thành công.", data: created });
  } catch (error) {
    return res.status(500).json({ message: "Không thể tạo chính sách.", detail: error.message });
  }
};

export const updatePolicy = async (req, res) => {
  const { maCS } = req.params;
  const { tieuDe, noiDung, trangThai } = req.body;

  const updateData = {};
  if (tieuDe !== undefined) updateData.tieuDe = tieuDe;
  if (noiDung !== undefined) updateData.noiDung = noiDung;
  if (trangThai !== undefined) {
    const statusNumber = Number.parseInt(String(trangThai), 10);
    if (![0, 1].includes(statusNumber)) {
      return res.status(400).json({ message: "Trạng thái chính sách không hợp lệ." });
    }
    updateData.trangThai = statusNumber;
  }

  try {
    const updated = await prisma.chinhSach.update({
      where: { maCS },
      data: updateData,
    });

    return res.status(200).json({ message: "Cập nhật chính sách thành công.", data: updated });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Không tìm thấy chính sách cần cập nhật." });
    }
    return res.status(500).json({ message: "Không thể cập nhật chính sách.", detail: error.message });
  }
};
