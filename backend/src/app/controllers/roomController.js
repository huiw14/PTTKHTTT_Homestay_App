import prisma from '../db/prisma.js';

export const getRooms = async (req, res) => {
  try {
    const { maCN, gioiTinh, minGia, maxGia, trangThai, coGiuongTrong, search } = req.query;

    const where = {};
    if (maCN) where.maCN = maCN;
    if (gioiTinh) where.gioiTinhPhong = gioiTinh;
    if (trangThai) where.trangThai = trangThai;
    // Filter phòng có ít nhất 1 giường trống (dùng cho trang tra cứu)
    if (coGiuongTrong === 'true') where.giuong = { some: { trangThai: 'Trong' } };

    if (minGia || maxGia) {
      where.giaThue = {};
      if (minGia) where.giaThue.gte = parseInt(minGia);
      if (maxGia) where.giaThue.lte = parseInt(maxGia);
    }

    if (search?.trim()) {
      where.OR = [
        { maPhong: { contains: search.trim(), mode: 'insensitive' } },
        { tenPhong: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    const rooms = await prisma.phong.findMany({
      where,
      include: {
        chiNhanh: true,
        loaiPhong: true,
        giuong: { select: { maGiuong: true, trangThai: true } },
      },
      orderBy: { maPhong: 'asc' },
    });

    const data = rooms.map(r => ({
      ...r,
      soGiuongTrong: r.giuong.filter(g => g.trangThai === 'Trong').length,
      tongGiuong: r.giuong.length,
      giaThue: Number(r.giaThue),
    }));

    res.json({ success: true, data, total: data.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi lấy danh sách phòng', error: error.message });
  }
};

export default { getRooms };
