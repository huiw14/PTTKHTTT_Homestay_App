import prisma from '../db/prisma.js';

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

export const createCustomer = async (req, res) => {
  try {
    const { hoTen, gioiTinh, ngaySinh, cccd, soDienThoai, email, quocTich } = req.body;
    const normalizedHoTen = hoTen?.trim();
    const normalizedCccd = cccd?.trim();
    const normalizedPhone = soDienThoai?.trim();
    const normalizedEmail = email?.trim();

    if (!normalizedHoTen || !normalizedCccd || !normalizedPhone) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc: hoTen, cccd, soDienThoai',
      });
    }

    const existingCustomer = await prisma.khachHang.findFirst({
      where: {
        OR: [
          { cccd: normalizedCccd },
          { soDienThoai: normalizedPhone },
        ],
      },
    });

    if (existingCustomer) {
      const isDuplicateCccd = existingCustomer.cccd === normalizedCccd;
      return res.status(400).json({
        success: false,
        message: isDuplicateCccd
          ? 'CCCD đã tồn tại trong hệ thống'
          : 'Số điện thoại đã tồn tại trong hệ thống',
      });
    }

    const lastCustomer = await prisma.khachHang.findFirst({
      orderBy: { maKH: 'desc' },
    });

    const lastNum = lastCustomer ? parseInt(lastCustomer.maKH.slice(2)) : 0;
    const maKH = `KH${String(lastNum + 1).padStart(3, '0')}`;

    const customer = await prisma.khachHang.create({
      data: {
        maKH,
        hoTen: normalizedHoTen,
        gioiTinh: gioiTinh || 'Nam',
        ngaySinh: ngaySinh ? new Date(ngaySinh) : null,
        cccd: normalizedCccd,
        soDienThoai: normalizedPhone,
        email: normalizedEmail || null,
        quocTich: quocTich || 'Việt Nam',
        trangThai: 1,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Tạo khách hàng thành công',
      data: customer,
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'CCCD đã tồn tại trong hệ thống',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Lỗi tạo khách hàng',
      error: error.message,
    });
  }
};

export default {
  getCustomers,
  createCustomer,
};
