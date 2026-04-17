import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/customers - Lấy danh sách khách hàng
 * Query params:
 *   - search: tìm kiếm theo tên, SĐT, hoặc mã KH
 *   - page, limit: pagination
 */
export const getCustomers = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 100 } = req.query;

    const where = {
      trangThai: 1, // Only active customers
    };

    if (search && search.trim()) {
      const searchLower = search.toLowerCase().trim();
      where.OR = [
        { maKH: { contains: searchLower, mode: 'insensitive' } },
        { hoTen: { contains: searchLower, mode: 'insensitive' } },
        { soDienThoai: { contains: searchLower, mode: 'insensitive' } },
        { cccd: { contains: searchLower, mode: 'insensitive' } },
      ];
    }

    const customers = await prisma.khachHang.findMany({
      where,
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: { hoTen: 'asc' },
    });

    const total = await prisma.khachHang.count({ where });

    res.json({
      success: true,
      data: customers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('❌ Error in getCustomers:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách khách hàng',
      error: error.message,
    });
  }
};

export default {
  getCustomers,
};
