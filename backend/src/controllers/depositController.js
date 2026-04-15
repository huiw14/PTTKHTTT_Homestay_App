import { PrismaClient } from '@prisma/client';
import { sendDepositPaymentRequest, sendPaymentConfirmationEmail } from '../services/emailService.js';

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
        { khachHang: { hoTen: { contains: searchLower, mode: 'insensitive' } } },
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
        phong: true,
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
    console.error('❌ Error in getDeposits:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách phiếu cọc',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
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
    
    console.log('📝 createDeposit request:', { maKH, maNV, maCN, tienCoc, beds });

    // Validate input
    if (!maKH || !maNV || !maCN || tienCoc === undefined || tienCoc === null) {
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
        tienCoc: parseInt(tienCoc),
        trangThai: 'ChoDuyet',
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

      // Update trạng thái giường → DaCoc
      await prisma.giuong.updateMany({
        where: { maGiuong: { in: beds } },
        data: { trangThai: 'DaCoc' },
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
    console.error('❌ Error in createDeposit:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Lỗi tạo phiếu cọc',
      error: error.message,
    });
  }
};

/**
 * POST /api/deposits/:id/approve - Duyệt thanh toán (chuyển từ ChoDuyet → DaDuyet)
 */
export const approvePayment = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify phiếu cọc tồn tại
    const deposit = await prisma.phieuCoc.findUnique({
      where: { maPC: id },
      include: {
        khachHang: true,
        nhanVien: true,
        chiNhanh: true,
        phong: true,
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

    // Chỉ duyệt được nếu đang ở trạng thái "ChoDuyet"
    if (deposit.trangThai !== 'ChoDuyet') {
      return res.status(400).json({
        success: false,
        message: `Chỉ có thể duyệt phiếu cọc ở trạng thái "Chờ duyệt". Trạng thái hiện tại: ${deposit.trangThai}`,
      });
    }

    // Update status to "DaDuyet"
    const updated = await prisma.phieuCoc.update({
      where: { maPC: id },
      data: { trangThai: 'DaDuyet' },
      include: {
        khachHang: true,
        nhanVien: true,
        chiNhanh: true,
        phong: true,
        chiTietPhieuCoc: {
          include: { giuong: { include: { phong: true } } },
        },
      },
    });

    res.json({
      success: true,
      message: 'Duyệt phiếu cọc thành công. Phiếu cọc chuyển sang trạng thái "Đã duyệt"',
      data: updated,
    });
  } catch (error) {
    console.error('❌ Error in approvePayment:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi duyệt thanh toán',
      error: error.message,
    });
  }
};

/**
 * PUT /api/deposits/:id - Cập nhật phiếu cọc
 * Body: { trangThai, ... }
 * Trạng thái: 'ChoDuyet' | 'DaDuyet' | 'DaHuy'
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
      'ChoDuyet',
      'DaDuyet',
      'DaHuy',
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

/**
 * POST /api/deposits/:id/send-payment-request - Gửi yêu cầu thanh toán qua email
 */
export const sendPaymentRequest = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify phiếu cọc tồn tại
    const deposit = await prisma.phieuCoc.findUnique({
      where: { maPC: id },
      include: {
        khachHang: true,
        chiTietPhieuCoc: {
          include: {
            giuong: {
              include: { phong: true },
            },
          },
        },
      },
    });

    if (!deposit) {
      return res.status(404).json({
        success: false,
        message: 'Phiếu cọc không tồn tại',
      });
    }

    // Check email tồn tại và hợp lệ
    if (!deposit.khachHang?.email) {
      return res.status(400).json({
        success: false,
        message: 'Khách hàng không có địa chỉ email. Vui lòng cập nhật email trước khi gửi yêu cầu.',
      });
    }

    if (!deposit.khachHang.email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: `Email không hợp lệ: ${deposit.khachHang.email}. Vui lòng cập nhật email hợp lệ.`,
      });
    }

    // Check nếu phiếu cọc không ở trạng thái "Chờ duyệt"
    if (deposit.trangThai !== 'ChoDuyet') {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể gửi yêu cầu thanh toán cho phiếu cọc chờ duyệt',
      });
    }

    // Get phòng thông tin
    const room = deposit.chiTietPhieuCoc?.[0]?.giuong?.phong;

    // Send email
    const emailResult = await sendDepositPaymentRequest(
      deposit.khachHang.email,
      deposit.khachHang.hoTen,
      deposit,
      room
    );

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi gửi email thanh toán',
        error: emailResult.error,
      });
    }

    res.json({
      success: true,
      message: 'Yêu cầu thanh toán đã được gửi cho khách hàng',
      data: {
        maPC: deposit.maPC,
        customerEmail: deposit.khachHang.email,
        messageId: emailResult.messageId,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi gửi yêu cầu thanh toán',
      error: error.message,
    });
  }
};

/**
 * GET /api/available-beds?type=giường&roomId=P101
 * Lấy danh sách giường/phòng còn trống (không bị khóa bởi phiếu cọc)
 * 
 * type: 'giường' | 'phòng'
 * roomId: optional - mã phòng để lấy giường trong phòng đó
 */
export const getAvailableBeds = async (req, res) => {
  try {
    const { type = 'giường', roomId } = req.query;

    if (!roomId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu tham số: roomId',
      });
    }

    if (type !== 'giường' && type !== 'phòng') {
      return res.status(400).json({
        success: false,
        message: 'Type không hợp lệ: chỉ "giường" hoặc "phòng"',
      });
    }

    // Get room info
    const room = await prisma.phong.findUnique({
      where: { maPhong: roomId },
      include: {
        giuong: true,
      },
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Phòng không tồn tại',
      });
    }

    if (type === 'giường') {
      // Lấy danh sách giường trống (trangThai = 'Trong')
      const availableBeds = room.giuong.filter(b => b.trangThai === 'Trong');

      return res.json({
        success: true,
        type: 'giường',
        roomId,
        roomName: room.tenPhong,
        roomPrice: room.giaThue,
        availableBeds: availableBeds.map(b => ({
          bedId: b.maGiuong,
          bedName: b.tenGiuong,
          status: b.trangThai,
        })),
        totalAvailable: availableBeds.length,
        totalInRoom: room.giuong.length,
      });
    } else {
      // Check nếu tất cả giường trong phòng đều trống
      const allEmpty = room.giuong.every(b => b.trangThai === 'Trong');

      return res.json({
        success: true,
        type: 'phòng',
        roomId,
        roomName: room.tenPhong,
        roomPrice: room.giaThue,
        isAvailable: allEmpty,
        bedsInRoom: room.giuong.map(b => ({
          bedId: b.maGiuong,
          bedName: b.tenGiuong,
          status: b.trangThai,
        })),
        totalBeds: room.giuongs.length,
      });
    }
  } catch (error) {
    console.error('❌ Error in getAvailableBeds:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách giường',
      error: error.message,
    });
  }
};

/**
 * GET /api/deposits/available-rooms?type=giường
 * Lấy danh sách phòng còn sẵn (có giường trống hoặc toàn bộ phòng trống)
 * 
 * type: 'giường' = phòng có ít nhất 1 giường trống
 * type: 'phòng' = phòng có tất cả giường trống
 */
export const getAvailableRooms = async (req, res) => {
  try {
    const { type = 'giường' } = req.query;

    if (type !== 'giường' && type !== 'phòng') {
      return res.status(400).json({
        success: false,
        message: 'Type không hợp lệ: chỉ "giường" hoặc "phòng"',
      });
    }

    // Get all rooms with their beds
    const rooms = await prisma.phong.findMany({
      include: {
        giuong: true,
      },
    });

    let availableRooms = [];

    for (const room of rooms) {
      if (type === 'giường') {
        // Phòng có ít nhất 1 giường trống
        const hasAvailableBeds = room.giuong.some(b => b.trangThai === 'Trong');
        if (hasAvailableBeds) {
          availableRooms.push({
            roomId: room.maPhong,
            roomName: room.tenPhong,
            roomPrice: room.giaThue,
            capacity: room.sucChua,
            availableBeds: room.giuong.filter(b => b.trangThai === 'Trong').length,
            totalBeds: room.giuong.length,
          });
        }
      } else {
        // Phòng có tất cả giường trống
        const allEmpty = room.giuong.every(b => b.trangThai === 'Trong');
        if (allEmpty && room.giuong.length > 0) {
          availableRooms.push({
            roomId: room.maPhong,
            roomName: room.tenPhong,
            roomPrice: room.giaThue,
            capacity: room.sucChua,
            totalBeds: room.giuong.length,
          });
        }
      }
    }

    // Sort by roomId
    availableRooms.sort((a, b) => a.roomId.localeCompare(b.roomId));

    res.json({
      success: true,
      type,
      availableRooms,
      total: availableRooms.length,
    });
  } catch (error) {
    console.error('❌ Error in getAvailableRooms:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách phòng',
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
  sendPaymentRequest,
  approvePayment,
  getAvailableBeds,
  getAvailableRooms,
};
