import prisma from '../db/prisma.js';

// ─── BIÊN BẢN BÀN GIAO VÀ TRẢ PHÒNG ──────────────────────────────────────────

/**
 * Tạo mã tự động cho biên bản bàn giao: BBBG001, BBBG002, ...
 */
async function generateHandoverCode() {
  const lastHandover = await prisma.bienBanBanGiao.findFirst({
    orderBy: { maBBBG: 'desc' },
  });

  if (!lastHandover) {
    return 'BBBG001';
  }

  const lastNum = parseInt(lastHandover.maBBBG.slice(4));
  return `BBBG${String(lastNum + 1).padStart(3, '0')}`;
}

/**
 * Tạo mã tự động cho biên bản trả phòng: BBTP001, BBTP002, ...
 */
async function generateCheckoutCode() {
  const lastCheckout = await prisma.bienBanTraPhong.findFirst({
    orderBy: { maBBTP: 'desc' },
  });

  if (!lastCheckout) {
    return 'BBTP001';
  }

  const lastNum = parseInt(lastCheckout.maBBTP.slice(4));
  return `BBTP${String(lastNum + 1).padStart(3, '0')}`;
}

// ─── BIÊN BẢN BÀN GIAO (HANDOVER REPORT) ────────────────────────────────────

/**
 * GET /api/handovers - Lấy danh sách biên bản bàn giao
 */
export const getHandovers = async (req, res) => {
  try {
    const { maHD, page = 1, limit = 100 } = req.query;

    const where = {};
    if (maHD) where.maHD = maHD;

    const handovers = await prisma.bienBanBanGiao.findMany({
      where,
      include: {
        hopDong: true,
        nhanVien: true,
        chiTietBanGiao: {
          include: {
            taiSan: true,
            giuong: { include: { phong: true } },
          },
        },
      },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: { ngayBanGiao: 'desc' },
    });

    const total = await prisma.bienBanBanGiao.count({ where });

    res.json({
      success: true,
      data: handovers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('❌ Error in getHandovers:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách biên bản bàn giao',
      error: error.message,
    });
  }
};

/**
 * GET /api/handovers/:id - Lấy chi tiết biên bản bàn giao
 */
export const getHandoverDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const handover = await prisma.bienBanBanGiao.findUnique({
      where: { maBBBG: id },
      include: {
        hopDong: true,
        nhanVien: true,
        chiTietBanGiao: {
          include: {
            taiSan: true,
            giuong: { include: { phong: true } },
          },
        },
      },
    });

    if (!handover) {
      return res.status(404).json({
        success: false,
        message: 'Biên bản bàn giao không tồn tại',
      });
    }

    res.json({
      success: true,
      data: handover,
    });
  } catch (error) {
    console.error('❌ Error in getHandoverDetail:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy chi tiết biên bản bàn giao',
      error: error.message,
    });
  }
};

/**
 * POST /api/handovers - Tạo biên bản bàn giao
 * UC 20: Biên bản bàn giao phòng
 * Body: {
 *   maHD, maNV, ngayBanGiao, chiSoDienDau, chiSoNuocDau,
 *   chiTiet?: [{ maTS, maGiuong, soLuong, ghiChu }]
 * }
 */
export const createHandover = async (req, res) => {
  try {
    const { maHD, maNV, ngayBanGiao, chiSoDienDau, chiSoNuocDau, ghiChu, chiTiet = [] } = req.body;

    if (!maHD || !maNV || !ngayBanGiao || chiSoDienDau === undefined || chiSoNuocDau === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc: maHD, maNV, ngayBanGiao, chiSoDienDau, chiSoNuocDau',
      });
    }

    // Verify contract and employee exist
    const [contract, employee] = await Promise.all([
      prisma.hopDong.findUnique({ where: { maHD } }),
      prisma.nhanVien.findUnique({ where: { maNV } }),
    ]);

    if (!contract) {
      return res.status(400).json({
        success: false,
        message: 'Hợp đồng không tồn tại',
      });
    }

    if (!employee) {
      return res.status(400).json({
        success: false,
        message: 'Nhân viên không tồn tại',
      });
    }

    const maBBBG = await generateHandoverCode();
    const handoverDate = new Date(ngayBanGiao);

    const handover = await prisma.bienBanBanGiao.create({
      data: {
        maBBBG,
        maHD,
        maNV,
        ngayBanGiao: handoverDate,
        chiSoDienDau: parseFloat(chiSoDienDau),
        chiSoNuocDau: parseFloat(chiSoNuocDau),
        ghiChu: ghiChu || null,
      },
    });

    // Add handover details if provided
    if (chiTiet.length > 0) {
      const details = chiTiet.map(item => ({
        maBBBG,
        maTS: item.maTS,
        maGiuong: item.maGiuong,
        soLuong: item.soLuong || 1,
        ghiChu: item.ghiChu || null,
      }));

      await prisma.chiTietBanGiao.createMany({
        data: details,
      });
    }

    const fullHandover = await prisma.bienBanBanGiao.findUnique({
      where: { maBBBG },
      include: {
        hopDong: true,
        nhanVien: true,
        chiTietBanGiao: {
          include: {
            taiSan: true,
            giuong: { include: { phong: true } },
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Tạo biên bản bàn giao thành công',
      data: fullHandover,
    });
  } catch (error) {
    console.error('❌ Error in createHandover:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi tạo biên bản bàn giao',
      error: error.message,
    });
  }
};

// ─── BIÊN BẢN TRẢ PHÒNG (CHECKOUT REPORT) ───────────────────────────────────

/**
 * GET /api/checkouts - Lấy danh sách biên bản trả phòng
 */
export const getCheckouts = async (req, res) => {
  try {
    const { maHD, page = 1, limit = 100 } = req.query;

    const where = {};
    if (maHD) where.maHD = maHD;

    const checkouts = await prisma.bienBanTraPhong.findMany({
      where,
      include: {
        hopDong: true,
        nhanVien: true,
        khauTru: { include: { taiSan: true } },
      },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: { ngayTra: 'desc' },
    });

    const total = await prisma.bienBanTraPhong.count({ where });

    res.json({
      success: true,
      data: checkouts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('❌ Error in getCheckouts:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách biên bản trả phòng',
      error: error.message,
    });
  }
};

/**
 * GET /api/checkouts/:id - Lấy chi tiết biên bản trả phòng
 */
export const getCheckoutDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const checkout = await prisma.bienBanTraPhong.findUnique({
      where: { maBBTP: id },
      include: {
        hopDong: true,
        nhanVien: true,
        khauTru: { include: { taiSan: true } },
      },
    });

    if (!checkout) {
      return res.status(404).json({
        success: false,
        message: 'Biên bản trả phòng không tồn tại',
      });
    }

    res.json({
      success: true,
      data: checkout,
    });
  } catch (error) {
    console.error('❌ Error in getCheckoutDetail:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy chi tiết biên bản trả phòng',
      error: error.message,
    });
  }
};

/**
 * POST /api/checkouts - Tạo biên bản trả phòng
 * UC 21: Biên bản trả phòng + cập nhật trạng thái hợp đồng/phòng
 * Body: {
 *   maHD, maNV, ngayTra, chiSoDienCuoi, chiSoNuocCuoi, trangThaiPhong,
 *   khauTru?: [{ maTS, soLuong, chiPhiKhauTru, ghiChu }]
 * }
 */
export const createCheckout = async (req, res) => {
  try {
    const { maHD, maNV, ngayTra, chiSoDienCuoi, chiSoNuocCuoi, trangThaiPhong, ghiChu, khauTru = [] } = req.body;

    if (!maHD || !maNV || !ngayTra || chiSoDienCuoi === undefined || chiSoNuocCuoi === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc: maHD, maNV, ngayTra, chiSoDienCuoi, chiSoNuocCuoi',
      });
    }

    // Verify contract and employee exist
    const [contract, employee] = await Promise.all([
      prisma.hopDong.findUnique({
        where: { maHD },
        include: { phieuCoc: { include: { phong: true } } },
      }),
      prisma.nhanVien.findUnique({ where: { maNV } }),
    ]);

    if (!contract) {
      return res.status(400).json({
        success: false,
        message: 'Hợp đồng không tồn tại',
      });
    }

    if (!employee) {
      return res.status(400).json({
        success: false,
        message: 'Nhân viên không tồn tại',
      });
    }

    const maBBTP = await generateCheckoutCode();
    const checkoutDate = new Date(ngayTra);

    const checkout = await prisma.bienBanTraPhong.create({
      data: {
        maBBTP,
        maHD,
        maNV,
        ngayTra: checkoutDate,
        chiSoDienCuoi: parseFloat(chiSoDienCuoi),
        chiSoNuocCuoi: parseFloat(chiSoNuocCuoi),
        trangThaiPhong: trangThaiPhong || 'Tot',
        ghiChu: ghiChu || null,
      },
    });

    // Add deductions if provided
    if (khauTru.length > 0) {
      const details = khauTru.map(item => ({
        maKT: `KT${Date.now()}${Math.random().toString(36).substr(2, 9)}`, // Generate unique ID
        maBBTP,
        maTS: item.maTS,
        soLuong: item.soLuong || 1,
        chiPhiKhauTru: parseInt(item.chiPhiKhauTru),
        ghiChu: item.ghiChu || null,
      }));

      await prisma.khauTru.createMany({
        data: details,
      });
    }

    // Update contract status to "HetHan"
    await prisma.hopDong.update({
      where: { maHD },
      data: { trangThai: 'HetHan' },
    });

    // Update room status based on trangThaiPhong
    if (contract.phieuCoc?.phong) {
      const newStatus = trangThaiPhong === 'Tot' ? 'Trong' : 'BaoDuong';
      await prisma.phong.update({
        where: { maPhong: contract.phieuCoc.phong.maPhong },
        data: { trangThai: newStatus },
      });
    }

    const fullCheckout = await prisma.bienBanTraPhong.findUnique({
      where: { maBBTP },
      include: {
        hopDong: true,
        nhanVien: true,
        khauTru: { include: { taiSan: true } },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Tạo biên bản trả phòng thành công',
      data: fullCheckout,
    });
  } catch (error) {
    console.error('❌ Error in createCheckout:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi tạo biên bản trả phòng',
      error: error.message,
    });
  }
};

/**
 * PUT /api/checkouts/:id - Cập nhật biên bản trả phòng (đối soát/khấu trừ)
 */
export const updateCheckout = async (req, res) => {
  try {
    const { id } = req.params; // maBBTP
    const { maNV, ngayTra, chiSoDienCuoi, chiSoNuocCuoi, trangThaiPhong, ghiChu, khauTru = [] } = req.body;

    const existing = await prisma.bienBanTraPhong.findUnique({
      where: { maBBTP: id },
      include: { hopDong: { include: { phieuCoc: { include: { phong: true } } } } },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Biên bản trả phòng không tồn tại' });
    }

    if (maNV) {
      const nv = await prisma.nhanVien.findUnique({ where: { maNV } });
      if (!nv) return res.status(400).json({ success: false, message: 'Nhân viên không tồn tại' });
    }

    const updateData = {};
    if (maNV) updateData.maNV = maNV;
    if (ngayTra) updateData.ngayTra = new Date(ngayTra);
    if (chiSoDienCuoi !== undefined) updateData.chiSoDienCuoi = parseFloat(chiSoDienCuoi);
    if (chiSoNuocCuoi !== undefined) updateData.chiSoNuocCuoi = parseFloat(chiSoNuocCuoi);
    if (trangThaiPhong) updateData.trangThaiPhong = trangThaiPhong;
    if (ghiChu) updateData.ghiChu = ghiChu;

    await prisma.bienBanTraPhong.update({ where: { maBBTP: id }, data: updateData });

    // Replace khấu trừ entries only when valid maTS provided. Skip entries without maTS to avoid FK errors.
    if (Array.isArray(khauTru) && khauTru.length > 0) {
      await prisma.khauTru.deleteMany({ where: { maBBTP: id } }).catch(() => null);
      const validDetails = khauTru
        .filter((k) => k.maTS)
        .map((item) => ({
          maKT: `KT${Date.now()}${Math.random().toString(36).substr(2, 6)}`,
          maBBTP: id,
          maTS: item.maTS,
          soLuong: item.soLuong || 1,
          chiPhiKhauTru: parseInt(item.chiPhiKhauTru || 0),
          ghiChu: item.ghiChu || null,
        }));

      if (validDetails.length > 0) {
        await prisma.khauTru.createMany({ data: validDetails });
      }
    }

    // Update contract status and room status similar to createCheckout
    await prisma.hopDong.update({ where: { maHD: existing.maHD }, data: { trangThai: 'HetHan' } }).catch(() => null);

    if (existing.hopDong?.phieuCoc?.phong && trangThaiPhong) {
      const newStatus = trangThaiPhong === 'Tot' ? 'Trong' : 'BaoDuong';
      await prisma.phong.update({ where: { maPhong: existing.hopDong.phieuCoc.phong.maPhong }, data: { trangThai: newStatus } }).catch(() => null);
    }

    const full = await prisma.bienBanTraPhong.findUnique({ where: { maBBTP: id }, include: { hopDong: true, nhanVien: true, khauTru: { include: { taiSan: true } } } });
    res.json({ success: true, data: full });
  } catch (error) {
    console.error('❌ Error in updateCheckout:', error);
    res.status(500).json({ success: false, message: 'Lỗi cập nhật biên bản trả phòng', error: error.message });
  }
};

export default {
  getHandovers,
  getHandoverDetail,
  createHandover,
  getCheckouts,
  getCheckoutDetail,
  createCheckout,
  updateCheckout,
};
