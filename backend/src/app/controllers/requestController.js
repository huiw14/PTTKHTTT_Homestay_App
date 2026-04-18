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

    const moveInDate = new Date(ngayVaoO);
    if (Number.isNaN(moveInDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Ngày vào ở không hợp lệ' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (moveInDate < today) {
      return res.status(400).json({ success: false, message: 'Ngày vào ở phải từ hôm nay trở đi' });
    }

    const term = parseInt(thoiHanThue);
    if (Number.isNaN(term) || term < 1) {
      return res.status(400).json({ success: false, message: 'Thời hạn thuê phải lớn hơn hoặc bằng 1 tháng' });
    }

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
        ngayVaoO: moveInDate,
        thoiHanThue: term,
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
    const {
      trangThai,
      ghiChu,
      soNguoi,
      gioiTinh,
      khuVuc,
      loaiPhong,
      mucGia,
      ngayVaoO,
      thoiHanThue,
    } = req.body;

    if (trangThai !== undefined && !['ChoDuyet', 'DaHen', 'DaCoc', 'Huy'].includes(trangThai)) {
      return res.status(400).json({ success: false, message: 'Trạng thái yêu cầu không hợp lệ' });
    }

    const existing = await prisma.yeuCauThue.findUnique({ where: { maYCT: id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Yêu cầu không tồn tại' });

    const validTransitions = {
      ChoDuyet: ['DaHen', 'Huy'],
      DaHen: ['DaCoc', 'Huy'],
      DaCoc: [],
      Huy: [],
    };

    if (trangThai && !validTransitions[existing.trangThai]?.includes(trangThai)) {
      return res.status(400).json({
        success: false,
        message: `Không thể chuyển trạng thái từ ${existing.trangThai} sang ${trangThai}`,
      });
    }

    const updateData = {
      ...(trangThai && { trangThai }),
      ...(ghiChu !== undefined && { ghiChu }),
    };

    if (soNguoi !== undefined) {
      const people = parseInt(soNguoi);
      if (Number.isNaN(people) || people < 1) {
        return res.status(400).json({ success: false, message: 'Số người phải lớn hơn hoặc bằng 1' });
      }
      updateData.soNguoi = people;
    }

    if (gioiTinh !== undefined) {
      if (!['Nam', 'Nu', 'Chung'].includes(gioiTinh)) {
        return res.status(400).json({ success: false, message: 'Giới tính phòng không hợp lệ' });
      }
      updateData.gioiTinh = gioiTinh;
    }

    if (khuVuc !== undefined) updateData.khuVuc = khuVuc || null;
    if (loaiPhong !== undefined) updateData.loaiPhong = loaiPhong || null;

    if (mucGia !== undefined) {
      if (mucGia === null || mucGia === '') {
        updateData.mucGia = null;
      } else {
        const budget = parseInt(mucGia);
        if (Number.isNaN(budget) || budget < 0) {
          return res.status(400).json({ success: false, message: 'Mức giá không hợp lệ' });
        }
        updateData.mucGia = budget;
      }
    }

    if (ngayVaoO !== undefined) {
      const moveInDate = new Date(ngayVaoO);
      if (Number.isNaN(moveInDate.getTime())) {
        return res.status(400).json({ success: false, message: 'Ngày vào ở không hợp lệ' });
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (moveInDate < today) {
        return res.status(400).json({ success: false, message: 'Ngày vào ở phải từ hôm nay trở đi' });
      }
      updateData.ngayVaoO = moveInDate;
    }

    if (thoiHanThue !== undefined) {
      const term = parseInt(thoiHanThue);
      if (Number.isNaN(term) || term < 1) {
        return res.status(400).json({ success: false, message: 'Thời hạn thuê phải lớn hơn hoặc bằng 1 tháng' });
      }
      updateData.thoiHanThue = term;
    }

    const updated = await prisma.yeuCauThue.update({
      where: { maYCT: id },
      data: updateData,
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
