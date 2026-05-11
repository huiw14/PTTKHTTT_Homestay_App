import prisma from '../db/prisma.js';

// ─── PHIẾU THU (RECEIPT) ─────────────────────────────────────────────────────

/**
 * Tạo mã tự động cho phiếu thu: PT001, PT002, ...
 */
async function generateReceiptCode() {
  const lastReceipt = await prisma.phieuThu.findFirst({
    orderBy: { maPT: 'desc' },
  });

  if (!lastReceipt) {
    return 'PT001';
  }

  const lastNum = parseInt(lastReceipt.maPT.slice(2));
  return `PT${String(lastNum + 1).padStart(3, '0')}`;
}

/**
 * GET /api/receipts - Lấy danh sách phiếu thu
 */
export const getReceipts = async (req, res) => {
  try {
    const { maHD, loaiThu, page = 1, limit = 100 } = req.query;

    const where = {};
    if (maHD) where.maHD = maHD;
    if (loaiThu) where.loaiThu = loaiThu;

    const receipts = await prisma.phieuThu.findMany({
      where,
      include: {
        hopDong: true,
        nhanVien: true,
        chiTietPhieuThu: {
          include: { dichVu: true },
        },
      },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: { ngayThu: 'desc' },
    });

    const total = await prisma.phieuThu.count({ where });

    res.json({
      success: true,
      data: receipts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('❌ Error in getReceipts:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách phiếu thu',
      error: error.message,
    });
  }
};

/**
 * GET /api/receipts/:id - Lấy chi tiết phiếu thu
 */
export const getReceiptDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const receipt = await prisma.phieuThu.findUnique({
      where: { maPT: id },
      include: {
        hopDong: true,
        nhanVien: true,
        chiTietPhieuThu: {
          include: { dichVu: true },
        },
      },
    });

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: 'Phiếu thu không tồn tại',
      });
    }

    res.json({
      success: true,
      data: receipt,
    });
  } catch (error) {
    console.error('❌ Error in getReceiptDetail:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy chi tiết phiếu thu',
      error: error.message,
    });
  }
};

/**
 * POST /api/receipts - Tạo phiếu thu (Phiếu cọc kỳ đầu)
 * UC 18: Phiếu cọc kỳ đầu
 * Body: {
 *   maHD, maNV, ngayThu, tongTien, loaiThu,
 *   chiTiet?: [{ maDV, soLuong, donGia }]
 * }
 */
export const createReceipt = async (req, res) => {
  try {
    const { maHD, maNV, ngayThu, tongTien, loaiThu, ghiChu, chiTiet = [] } = req.body;

    if (!maHD || !maNV || !ngayThu || tongTien === undefined || !loaiThu) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc: maHD, maNV, ngayThu, tongTien, loaiThu',
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

    const maPT = await generateReceiptCode();
    const receiptDate = new Date(ngayThu);

    const receipt = await prisma.phieuThu.create({
      data: {
        maPT,
        maHD,
        maNV,
        ngayThu: receiptDate,
        tongTien: parseInt(tongTien),
        loaiThu,
        ghiChu: ghiChu || null,
      },
    });

    // Add receipt details if provided
    if (chiTiet.length > 0) {
      const details = chiTiet.map(item => ({
        maPT,
        maDV: item.maDV,
        soLuong: item.soLuong,
        donGia: item.donGia,
        thanhTien: item.soLuong * item.donGia,
      }));

      await prisma.chiTietPhieuThu.createMany({
        data: details,
      });
    }

    const fullReceipt = await prisma.phieuThu.findUnique({
      where: { maPT },
      include: {
        hopDong: true,
        nhanVien: true,
        chiTietPhieuThu: {
          include: { dichVu: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Tạo phiếu thu thành công',
      data: fullReceipt,
    });
  } catch (error) {
    console.error('❌ Error in createReceipt:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi tạo phiếu thu',
      error: error.message,
    });
  }
};

/**
 * POST /api/receipts/:id/confirm - Xác nhận đã thu tiền
 * UC 19: Xác nhận đã thu
 * Body: { confirmedBy: string }
 */
export const confirmReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    const { confirmedBy } = req.body;

    const receipt = await prisma.phieuThu.findUnique({
      where: { maPT: id },
    });

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: 'Phiếu thu không tồn tại',
      });
    }

    // In a real system, you might update a status field here
    // For now, we'll just return a confirmation
    res.json({
      success: true,
      message: 'Xác nhận đã thu tiền thành công',
      data: {
        maPT: id,
        confirmedBy: confirmedBy || req.user?.maNV || 'system',
        confirmedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('❌ Error in confirmReceipt:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi xác nhận phiếu thu',
      error: error.message,
    });
  }
};

export default {
  getReceipts,
  getReceiptDetail,
  createReceipt,
  confirmReceipt,
};
