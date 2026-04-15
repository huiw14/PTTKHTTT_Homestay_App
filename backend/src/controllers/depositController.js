import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Tạo mã tự động cho phiếu cọc: PC001, PC002, ...
 */
async function generateDepositCode() {
  const lastDeposit = await prisma.phieuCoc.findFirst({
    orderBy: { maPC: 'desc' },
  });

  if (!lastDeposit) {
    return 'PC001';
  }

  const lastNum = parseInt(lastDeposit.maPC.slice(2));
  return `PC${String(lastNum + 1).padStart(3, '0')}`;
}

/**
 * GET /api/deposits - Lấy danh sách phiếu cọc (có search & sort)
 * Query params:
 *   - search: tìm kiếm theo maPC, tên khách hàng, hoặc tên phòng
 *   - sortBy: 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc' | 'status'
 *   - status: lọc theo trangThai
 *   - maCN: lọc theo chi nhánh
 *   - page, limit: pagination
 */
export const getDeposits = async (req, res) => {
  try {
    const { search = '', status, maCN, sortBy = 'date-desc', page = 1, limit = 5 } = req.query;

    // Build where clause
    const where = {};
    if (status) where.trangThai = status;
    if (maCN) where.maCN = maCN;

    // Add search filter
    if (search && search.trim()) {
      const searchLower = search.toLowerCase().trim();
      where.OR = [
        { maPC: { contains: searchLower, mode: 'insensitive' } },
        { khachHang: { tenKH: { contains: searchLower, mode: 'insensitive' } } },
        { chiTietPhieuCoc: { some: { giuong: { phong: { tenPhong: { contains: searchLower, mode: 'insensitive' } } } } } },
      ];
    }

    // Determine sort order
    let orderBy = { ngayCoc: 'desc' };
    switch (sortBy) {
      case 'date-asc':
        orderBy = { ngayCoc: 'asc' };
        break;
      case 'amount-desc':
        orderBy = { tienCoc: 'desc' };
        break;
      case 'amount-asc':
        orderBy = { tienCoc: 'asc' };
        break;
      case 'status':
        orderBy = { trangThai: 'asc' };
        break;
      case 'date-desc':
      default:
        orderBy = { ngayCoc: 'desc' };
        break;
    }

    const deposits = await prisma.phieuCoc.findMany({
      where,
      include: {
        khachHang: true,
        nhanVien: true,
        chiNhanh: true,
        chiTietPhieuCoc: {
          include: { giuong: { include: { phong: true } } },
        },
      },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy,
    });

    const total = await prisma.phieuCoc.count({ where });

    res.json({
      success: true,
      data: deposits,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách phiếu cọc',
      error: error.message,
    });
  }
};

/**
 * GET /api/deposits/:id - Lấy chi tiết 1 phiếu cọc
 */
export const getDepositDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const deposit = await prisma.phieuCoc.findUnique({
      where: { maPC: id },
      include: {
        khachHang: true,
        nhanVien: true,
        chiNhanh: true,
        chiTietPhieuCoc: {
          include: { giuong: { include: { phong: true } } },
        },
      },
    });

    if (!deposit) {
      return res.status(404).json({
        success: false,
        message: 'Phiếu cọc không tồn tại',
      });
    }

    res.json({
      success: true,
      data: deposit,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy chi tiết phiếu cọc',
      error: error.message,
    });
  }
};

/**
 * POST /api/deposits - Tạo phiếu cọc mới
 * Body: {
 *   maKH, maNV, maCN, tienCoc,
 *   beds: ['G101A', 'G101B', ...] (danh sách maGiuong)
 * }
 */
export const createDeposit = async (req, res) => {
  try {
    const { maKH, maNV, maCN, tienCoc, beds = [] } = req.body;

    // Validate input
    if (!maKH || !maNV || !maCN || !tienCoc) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc: maKH, maNV, maCN, tienCoc',
      });
    }

    // Verify khách hàng, nhân viên, chi nhánh tồn tại
    const [customer, employee, branch] = await Promise.all([
      prisma.khachHang.findUnique({ where: { maKH } }),
      prisma.nhanVien.findUnique({ where: { maNV } }),
      prisma.chiNhanh.findUnique({ where: { maCN } }),
    ]);

    if (!customer || !employee || !branch) {
      return res.status(400).json({
        success: false,
        message: 'Khách hàng, nhân viên hoặc chi nhánh không tồn tại',
      });
    }

    // Generate mã phiếu cọc
    const maPC = await generateDepositCode();

    // Tính hạn thanh toán: 24 giờ từ bây giờ
    const ngayCoc = new Date();
    const hanThanhToan = new Date(ngayCoc.getTime() + 24 * 60 * 60 * 1000);

    // Create phiếu cọc
    const deposit = await prisma.phieuCoc.create({
      data: {
        maPC,
        maKH,
        maNV,
        maCN,
        tienCoc: BigInt(tienCoc),
        trangThai: 'ChoThanhToan',
        ngayCoc,
        hanThanhToan,
      },
    });

    // Thêm chi tiết giường (nếu có)
    if (beds.length > 0) {
      // Verify tất cả giường tồn tại
      const existingBeds = await prisma.giuong.findMany({
        where: { maGiuong: { in: beds } },
      });

      if (existingBeds.length !== beds.length) {
        // Rollback
        await prisma.phieuCoc.delete({ where: { maPC } });
        return res.status(400).json({
          success: false,
          message: 'Một số giường không tồn tại',
        });
      }

      // Create chi tiết phiếu cọc
      await prisma.chiTietPhieuCoc.createMany({
        data: beds.map((maGiuong) => ({
          maPC,
          maGiuong,
        })),
      });
    }

    // Get full deposit info
    const fullDeposit = await prisma.phieuCoc.findUnique({
      where: { maPC },
      include: {
        khachHang: true,
        nhanVien: true,
        chiNhanh: true,
        chiTietPhieuCoc: {
          include: { giuong: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Tạo phiếu cọc thành công',
      data: fullDeposit,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi tạo phiếu cọc',
      error: error.message,
    });
  }
};

/**
 * PUT /api/deposits/:id - Cập nhật phiếu cọc
 * Body: { trangThai, ... }
 * Trạng thái: 'ChoThanhToan' | 'DaThanhToan' | 'TuDongHuy' | 'HuyThuCong'
 */
export const updateDeposit = async (req, res) => {
  try {
    const { id } = req.params;
    const { trangThai } = req.body;

    // Verify phiếu cọc tồn tại
    const deposit = await prisma.phieuCoc.findUnique({
      where: { maPC: id },
    });

    if (!deposit) {
      return res.status(404).json({
        success: false,
        message: 'Phiếu cọc không tồn tại',
      });
    }

    // Danh sách trạng thái hợp lệ
    const validStatuses = [
      'ChoThanhToan',
      'DaThanhToan',
      'TuDongHuy',
      'HuyThuCong',
    ];

    if (trangThai && !validStatuses.includes(trangThai)) {
      return res.status(400).json({
        success: false,
        message: `Trạng thái không hợp lệ. Cho phép: ${validStatuses.join(', ')}`,
      });
    }

    // Update status
    const updated = await prisma.phieuCoc.update({
      where: { maPC: id },
      data: trangThai ? { trangThai } : {},
      include: {
        khachHang: true,
        nhanVien: true,
        chiNhanh: true,
        chiTietPhieuCoc: {
          include: { giuong: true },
        },
      },
    });

    res.json({
      success: true,
      message: 'Cập nhật phiếu cọc thành công',
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi cập nhật phiếu cọc',
      error: error.message,
    });
  }
};

/**
 * DELETE /api/deposits/:id - Xóa phiếu cọc
 */
export const deleteDeposit = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify phiếu cọc tồn tại
    const deposit = await prisma.phieuCoc.findUnique({
      where: { maPC: id },
    });

    if (!deposit) {
      return res.status(404).json({
        success: false,
        message: 'Phiếu cọc không tồn tại',
      });
    }

    // Delete chi tiết phiếu cọc trước
    await prisma.chiTietPhieuCoc.deleteMany({
      where: { maPC: id },
    });

    // Delete phiếu cọc
    await prisma.phieuCoc.delete({
      where: { maPC: id },
    });

    res.json({
      success: true,
      message: 'Xóa phiếu cọc thành công',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi xóa phiếu cọc',
      error: error.message,
    });
  }
};

export default {
  getDeposits,
  getDepositDetail,
  createDeposit,
  updateDeposit,
  deleteDeposit,
};
