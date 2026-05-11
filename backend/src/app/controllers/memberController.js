import prisma from '../db/prisma.js';

/**
 * GET /api/members - Lấy danh sách thành viên
 * Query params:
 *   - maHD: lọc theo mã hợp đồng
 *   - maKH: lọc theo mã khách hàng
 *   - trangThai: lọc theo trạng thái
 */
export const getMembers = async (req, res) => {
  try {
    const { maHD, maKH, trangThai, page = 1, limit = 100 } = req.query;

    const where = {};
    if (maHD) where.maHD = maHD;
    if (maKH) where.maKH = maKH;
    if (trangThai !== undefined) where.trangThai = parseInt(trangThai);

    const members = await prisma.thanhVien.findMany({
      where,
      include: {
        hopDong: true,
        khachHang: true,
        giuong: { include: { phong: true } },
      },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: { maTV: 'asc' },
    });

    const total = await prisma.thanhVien.count({ where });

    res.json({
      success: true,
      data: members,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('❌ Error in getMembers:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách thành viên',
      error: error.message,
    });
  }
};

/**
 * GET /api/members/:id - Lấy chi tiết thành viên
 */
export const getMemberDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const member = await prisma.thanhVien.findUnique({
      where: { maTV: id },
      include: {
        hopDong: true,
        khachHang: true,
        giuong: { include: { phong: true } },
      },
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Thành viên không tồn tại',
      });
    }

    res.json({
      success: true,
      data: member,
    });
  } catch (error) {
    console.error('❌ Error in getMemberDetail:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy chi tiết thành viên',
      error: error.message,
    });
  }
};

/**
 * PUT /api/members/:id/status - Cập nhật trạng thái thành viên
 * Body: { trangThai: 0 | 1 }
 */
export const updateMemberStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { trangThai } = req.body;

    if (trangThai === undefined || ![0, 1].includes(trangThai)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ. Chỉ chấp nhận 0 (đã rời) hoặc 1 (đang ở)',
      });
    }

    const member = await prisma.thanhVien.findUnique({
      where: { maTV: id },
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Thành viên không tồn tại',
      });
    }

    // Update member status
    const updated = await prisma.thanhVien.update({
      where: { maTV: id },
      data: { trangThai },
      include: {
        hopDong: true,
        khachHang: true,
        giuong: { include: { phong: true } },
      },
    });

    res.json({
      success: true,
      message: `Cập nhật trạng thái thành viên thành công. Trạng thái: ${trangThai === 1 ? 'Đang ở' : 'Đã rời'}`,
      data: updated,
    });
  } catch (error) {
    console.error('❌ Error in updateMemberStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi cập nhật trạng thái thành viên',
      error: error.message,
    });
  }
};

/**
 * POST /api/members/review - Xét duyệt điều kiện lưu trú theo từng thành viên
 * Body: { maTV, diasApproved: true/false, notes: string }
 */
export const reviewMemberConditions = async (req, res) => {
  try {
    const { maTV, approved, notes } = req.body;

    if (!maTV || approved === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc: maTV, approved',
      });
    }

    const member = await prisma.thanhVien.findUnique({
      where: { maTV },
      include: {
        hopDong: true,
        khachHang: true,
        giuong: { include: { phong: true } },
      },
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Thành viên không tồn tại',
      });
    }

    // Store review in a log or notes field
    // For now, we'll just return a success response
    // In a full implementation, you'd have a separate table for member reviews
    const reviewResult = {
      maTV,
      maHD: member.maHD,
      maKH: member.maKH,
      approved,
      notes: notes || '',
      reviewedAt: new Date(),
      reviewedBy: req.user?.maNV || 'system', // Assuming user info is in req.user
    };

    res.json({
      success: true,
      message: approved ? 'Xét duyệt thành công' : 'Từ chối thành viên',
      data: reviewResult,
    });
  } catch (error) {
    console.error('❌ Error in reviewMemberConditions:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi xét duyệt điều kiện lưu trú',
      error: error.message,
    });
  }
};

export default {
  getMembers,
  getMemberDetail,
  updateMemberStatus,
  reviewMemberConditions,
};
