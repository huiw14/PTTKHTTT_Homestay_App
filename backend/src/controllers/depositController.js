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
        { phong: { tenPhong: { contains: searchLower, mode: 'insensitive' } } },
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
    const { maKH, maNV, maCN, tienCoc, beds = [], maPhong } = req.body;
    
    console.log('📝 createDeposit request:', { maKH, maNV, maCN, tienCoc, beds, maPhong });

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

    // Determine beds to lock
    let bedsToLock = [...beds];

    // If room deposit (maPhong provided), lock ALL beds in the room
    if (maPhong) {
      const room = await prisma.phong.findUnique({
        where: { maPhong },
        include: { giuong: true },
      });

      if (!room) {
        return res.status(400).json({
          success: false,
          message: 'Phòng không tồn tại',
        });
      }

      // For room deposit, lock all beds in the room
      bedsToLock = room.giuong.map(g => g.maGiuong);

      // Verify all beds are available
      const unavailableBeds = room.giuong.filter(g => g.trangThai !== 'Trong');
      if (unavailableBeds.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Phòng ${maPhong} có ${unavailableBeds.length} giường đã được cọc/thuê, không thể cọc nguyên phòng`,
        });
      }
    }

    // Create phiếu cọc
    const deposit = await prisma.phieuCoc.create({
      data: {
        maPC,
        maKH,
        maNV,
        maCN,
        maPhong: maPhong || null, // Set maPhong for room deposits
        tienCoc: parseInt(tienCoc),
        trangThai: 'ChoDuyet',
        ngayCoc,
        hanThanhToan,
      },
    });

    // Thêm chi tiết giường (bed-deposit hoặc room-deposit đều có)
    if (bedsToLock.length > 0) {
      // Verify tất cả giường tồn tại
      const existingBeds = await prisma.giuong.findMany({
        where: { maGiuong: { in: bedsToLock } },
      });

      if (existingBeds.length !== bedsToLock.length) {
        // Rollback
        await prisma.phieuCoc.delete({ where: { maPC } });
        return res.status(400).json({
          success: false,
          message: 'Một số giường không tồn tại',
        });
      }

      // Verify tất cả giường đang trống (chống race condition)
      const unavailableBeds = existingBeds.filter(b => b.trangThai !== 'Trong');
      if (unavailableBeds.length > 0) {
        // Rollback
        await prisma.phieuCoc.delete({ where: { maPC } });
        return res.status(400).json({
          success: false,
          message: `Giường ${unavailableBeds.map(b => b.maGiuong).join(', ')} đã được cọc/thuê, không thể cọc`,
        });
      }

      // Create chi tiết phiếu cọc
      await prisma.chiTietPhieuCoc.createMany({
        data: bedsToLock.map((maGiuong) => ({
          maPC,
          maGiuong,
        })),
      });

      // Update trạng thái giường → DaCoc
      await prisma.giuong.updateMany({
        where: { maGiuong: { in: bedsToLock } },
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
        phong: true,
        chiTietPhieuCoc: {
          include: { giuong: { include: { phong: true } } },
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
      include: {
        chiTietPhieuCoc: {
          include: { giuong: true },
        },
      },
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

    // If cancelling, validate and release beds and room resources
    if (trangThai === 'DaHuy' && deposit.trangThai !== 'DaHuy') {
      // VALIDATION: Chỉ được hủy nếu trạng thái là "ChoDuyet" (chờ duyệt)
      if (deposit.trangThai !== 'ChoDuyet') {
        return res.status(400).json({
          success: false,
          message: `Chỉ có thể hủy phiếu cọc ở trạng thái "Chờ duyệt". Trạng thái hiện tại: ${deposit.trangThai}`,
        });
      }

      // VALIDATION: Kiểm tra tất cả giường/phòng có trạng thái khác bằng DaCoc không
      // (tức là giường phải still trong trạng thái DaCoc để có thể hủy cọc)
      let bedIds = deposit.chiTietPhieuCoc.map(ct => ct.maGiuong);
      
      // If room deposit but no chiTietPhieuCoc (phòng được tạo mà không có chi tiết), fetch giường từ phòng
      if (deposit.maPhong && bedIds.length === 0) {
        const room = await prisma.phong.findUnique({
          where: { maPhong: deposit.maPhong },
          include: { giuong: true },
        });
        if (room) {
          bedIds = room.giuong.map(g => g.maGiuong);
        }
      }
      
      if (bedIds.length > 0) {
        // Kiểm tra xem có giường nào không còn ở trạng thái DaCoc không
        // Cần fetch giường từ DB để check trạng thái hiện tại
        const currentBeds = await prisma.giuong.findMany({
          where: { maGiuong: { in: bedIds } },
        });
        
        const bedsNotInDaCoc = currentBeds.filter(b => b.trangThai !== 'DaCoc');
        if (bedsNotInDaCoc.length > 0) {
          const bedsInfo = bedsNotInDaCoc.map(b => `${b.maGiuong} (${b.trangThai})`).join(', ');
          return res.status(400).json({
            success: false,
            message: `Không thể hủy phiếu cọc. Các giường/phòng không còn ở trạng thái cọc (DaCoc): ${bedsInfo}. Phiếu cọc chỉ có thể hủy nếu các giường/phòng của nó vẫn ở trạng thái DaCoc.`,
          });
        }

        // Release all beds associated with this deposit
        const updateResult = await prisma.giuong.updateMany({
          where: {
            maGiuong: { in: bedIds },
            trangThai: 'DaCoc', // Only release beds that are still in DaCoc state
          },
          data: { trangThai: 'Trong' },
        });
      }

      // Release room if it was a room deposit (maPhong set)
      if (deposit.maPhong) {
        // Fetch lại trạng thái mới của các giường sau khi release
        const updatedRoomBeds = await prisma.giuong.findMany({
          where: { maPhong: deposit.maPhong },
        });
        
        // Check if all beds in the room are now Trong
        const allEmpty = updatedRoomBeds.every(b => b.trangThai === 'Trong');
        if (allEmpty) {
          await prisma.phong.update({
            where: { maPhong: deposit.maPhong },
            data: { trangThai: 'Trong' },
          });
        }
      }
    }

    // Update status
    const updated = await prisma.phieuCoc.update({
      where: { maPC: id },
      data: trangThai ? { trangThai } : {},
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
 * Chỉ được xóa phiếu cọc ở trạng thái "ChoDuyet" và giường/phòng vẫn ở trạng thái "DaCoc"
 */
export const deleteDeposit = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify phiếu cọc tồn tại
    const deposit = await prisma.phieuCoc.findUnique({
      where: { maPC: id },
      include: {
        chiTietPhieuCoc: {
          include: { giuong: true },
        },
      },
    });

    if (!deposit) {
      return res.status(404).json({
        success: false,
        message: 'Phiếu cọc không tồn tại',
      });
    }

    console.log(`🔍 DEBUG deleteDeposit ${id}: deposit found, maPhong=${deposit.maPhong}, chiTietPhieuCoc count=${deposit.chiTietPhieuCoc?.length || 0}`);
    console.log(`🔍 DEBUG deposit.chiTietPhieuCoc:`, JSON.stringify(deposit.chiTietPhieuCoc, null, 2));

    // VALIDATION: Chỉ được xóa nếu trạng thái là "ChoDuyet"
    if (deposit.trangThai !== 'ChoDuyet') {
      return res.status(400).json({
        success: false,
        message: `Chỉ có thể xóa phiếu cọc ở trạng thái "Chờ duyệt". Trạng thái hiện tại: ${deposit.trangThai}`,
      });
    }

    // VALIDATION: Kiểm tra tất cả giường/phòng có trạng thái khác bằng DaCoc không
    let bedIds = deposit.chiTietPhieuCoc.map(ct => ct.maGiuong);
    
    // If room deposit but no chiTietPhieuCoc (phòng được tạo mà không có chi tiết), fetch giường từ phòng
    if (deposit.maPhong && bedIds.length === 0) {
      const room = await prisma.phong.findUnique({
        where: { maPhong: deposit.maPhong },
        include: { giuong: true },
      });
      if (room) {
        bedIds = room.giuong.map(g => g.maGiuong);
      }
    }
    
    if (bedIds.length > 0) {
      // Cần fetch giường từ DB để check trạng thái hiện tại
      const currentBeds = await prisma.giuong.findMany({
        where: { maGiuong: { in: bedIds } },
      });
      
      const bedsNotInDaCoc = currentBeds.filter(b => b.trangThai !== 'DaCoc');
      if (bedsNotInDaCoc.length > 0) {
        const bedsInfo = bedsNotInDaCoc.map(b => `${b.maGiuong} (${b.trangThai})`).join(', ');
        return res.status(400).json({
          success: false,
          message: `Không thể xóa phiếu cọc. Các giường/phòng không còn ở trạng thái cọc (DaCoc): ${bedsInfo}. Phiếu cọc chỉ có thể xóa nếu các giường/phòng của nó vẫn ở trạng thái DaCoc.`,
        });
      }
    }

    // Release beds before deleting
    console.log(`🔍 DEBUG deleteDeposit ${id}: bedIds = ${JSON.stringify(bedIds)}, maPhong = ${deposit.maPhong}`);
    
    if (bedIds.length > 0) {
      const updateResult = await prisma.giuong.updateMany({
        where: {
          maGiuong: { in: bedIds },
          trangThai: 'DaCoc',
        },
        data: { trangThai: 'Trong' },
      });
      console.log(`✅ Updated ${updateResult.count} beds to "Trong"`);
    } else {
      console.log(`⚠️  No beds found to release`);
    }

    // Release room if it was a room deposit
    if (deposit.maPhong) {
      // Fetch lại trạng thái mới của các giường sau khi release
      const updatedRoomBeds = await prisma.giuong.findMany({
        where: { maPhong: deposit.maPhong },
      });
      // Check if all beds in the room are now Trong
      const allEmpty = updatedRoomBeds.every(b => b.trangThai === 'Trong');
      if (allEmpty) {
        await prisma.phong.update({
          where: { maPhong: deposit.maPhong },
          data: { trangThai: 'Trong' },
        });
      }
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
        totalBeds: room.giuong.length,
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

    let availableRooms = [];

    if (type === 'giường') {
      // Fetch rooms with at least 1 available bed
      const rooms = await prisma.phong.findMany({
        where: {
          giuong: {
            some: { trangThai: 'Trong' }
          }
        },
        include: {
          giuong: {
            where: { trangThai: 'Trong' },
            select: { maGiuong: true }
          },
          _count: {
            select: { giuong: true }
          }
        },
        orderBy: { maPhong: 'asc' }
      });

      availableRooms = rooms.map(room => ({
        roomId: room.maPhong,
        roomName: room.tenPhong,
        roomPrice: room.giaThue,
        capacity: room.sucChua,
        availableBeds: room.giuong.length,
        totalBeds: room._count.giuong,
      }));
    } else {
      // Fetch rooms where all beds are available (all beds status = 'Trong')
      const rooms = await prisma.phong.findMany({
        where: {
          giuong: {
            none: { trangThai: { not: 'Trong' } }
          }
        },
        include: {
          _count: {
            select: { giuong: true }
          }
        },
        orderBy: { maPhong: 'asc' }
      });

      availableRooms = rooms
        .filter(room => room._count.giuong > 0) // Only rooms with beds
        .map(room => ({
          roomId: room.maPhong,
          roomName: room.tenPhong,
          roomPrice: room.giaThue,
          capacity: room.sucChua,
          totalBeds: room._count.giuong,
        }));
    }

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
