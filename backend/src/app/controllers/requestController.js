import prisma from '../db/prisma.js';

async function generateRequestCode() {
  const last = await prisma.yeuCauThue.findFirst({ orderBy: { maYCT: 'desc' } });
  if (!last) return 'YCT001';
  const num = parseInt(last.maYCT.slice(3));
  return `YCT${String(num + 1).padStart(3, '0')}`;
}

export const getRequests = async (req, res) => {
  try {
    const { search = '', status, page = 1, limit = 5 } = req.query;

    const where = {};
    if (status) where.trangThai = status;
    if (search.trim()) {
      where.OR = [
        { maYCT: { contains: search.trim(), mode: 'insensitive' } },
        { khachHang: { hoTen: { contains: search.trim(), mode: 'insensitive' } } },
        { khuVuc: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.yeuCauThue.findMany({
        where,
        include: {
          khachHang: true,
          nhanVien: true,
          lichHen: { orderBy: { ngayHen: 'desc' }, take: 1 },
        },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        orderBy: { ngayYC: 'desc' },
      }),
      prisma.yeuCauThue.count({ where }),
    ]);

    res.json({
      success: true,
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi lấy danh sách yêu cầu', error: error.message });
  }
};

export const createRequest = async (req, res) => {
  try {
    const { maKH, maNV, soNguoi, gioiTinh, khuVuc, loaiPhong, mucGia, ngayVaoO, thoiHanThue, ghiChu } = req.body;

    if (!maKH || !maNV || !ngayVaoO || !thoiHanThue) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc: maKH, maNV, ngayVaoO, thoiHanThue' });
    }

    const [customer, employee] = await Promise.all([
      prisma.khachHang.findUnique({ where: { maKH } }),
      prisma.nhanVien.findUnique({ where: { maNV } }),
    ]);

    if (!customer) return res.status(400).json({ success: false, message: 'Khách hàng không tồn tại' });
    if (!employee) return res.status(400).json({ success: false, message: 'Nhân viên không tồn tại' });

    const maYCT = await generateRequestCode();

    const request = await prisma.yeuCauThue.create({
      data: {
        maYCT,
        maKH,
        maNV,
        ngayYC: new Date(),
        soNguoi: parseInt(soNguoi) || 1,
        gioiTinh: gioiTinh || 'Nam',
        khuVuc: khuVuc || null,
        loaiPhong: loaiPhong || null,
        mucGia: mucGia ? parseInt(mucGia) : null,
        ngayVaoO: new Date(ngayVaoO),
        thoiHanThue: parseInt(thoiHanThue),
        trangThai: 'ChoDuyet',
        ghiChu: ghiChu || null,
      },
      include: { khachHang: true, nhanVien: true },
    });

    res.status(201).json({ success: true, message: 'Tạo yêu cầu thuê thành công', data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi tạo yêu cầu thuê', error: error.message });
  }
};

export const updateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { trangThai, ghiChu } = req.body;

    const existing = await prisma.yeuCauThue.findUnique({ where: { maYCT: id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Yêu cầu không tồn tại' });

    const updated = await prisma.yeuCauThue.update({
      where: { maYCT: id },
      data: {
        ...(trangThai && { trangThai }),
        ...(ghiChu !== undefined && { ghiChu }),
      },
      include: { khachHang: true, nhanVien: true },
    });

    res.json({ success: true, message: 'Cập nhật yêu cầu thành công', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi cập nhật yêu cầu', error: error.message });
  }
};

export const deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.yeuCauThue.findUnique({ where: { maYCT: id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Yêu cầu không tồn tại' });
    if (existing.trangThai !== 'ChoDuyet') {
      return res.status(400).json({ success: false, message: 'Chỉ được xóa yêu cầu ở trạng thái Chờ duyệt' });
    }

    await prisma.lichHen.deleteMany({ where: { maYCT: id } });
    await prisma.yeuCauThue.delete({ where: { maYCT: id } });

    res.json({ success: true, message: 'Xóa yêu cầu thuê thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi xóa yêu cầu', error: error.message });
  }
};

export default { getRequests, createRequest, updateRequest, deleteRequest };
