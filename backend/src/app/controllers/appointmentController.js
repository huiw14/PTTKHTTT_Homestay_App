import prisma from '../db/prisma.js';

async function generateAppointmentCode() {
  const last = await prisma.lichHen.findFirst({ orderBy: { maLH: 'desc' } });
  if (!last) return 'LH001';
  const num = parseInt(last.maLH.slice(2));
  return `LH${String(num + 1).padStart(3, '0')}`;
}

export const getAppointments = async (req, res) => {
  try {
    const { maYCT, status, page = 1, limit = 5 } = req.query;

    const where = {};
    if (maYCT) where.maYCT = maYCT;
    if (status) where.trangThai = status;

    const [data, total] = await Promise.all([
      prisma.lichHen.findMany({
        where,
        include: {
          yeuCauThue: { include: { khachHang: true, nhanVien: true } },
        },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        orderBy: { ngayHen: 'desc' },
      }),
      prisma.lichHen.count({ where }),
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
    res.status(500).json({ success: false, message: 'Lỗi lấy danh sách lịch hẹn', error: error.message });
  }
};

export const createAppointment = async (req, res) => {
  try {
    const { maYCT, ngayHen, gioHen, ghiChu } = req.body;

    if (!maYCT || !ngayHen || !gioHen) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc: maYCT, ngayHen, gioHen' });
    }

    const request = await prisma.yeuCauThue.findUnique({ where: { maYCT } });
    if (!request) return res.status(404).json({ success: false, message: 'Yêu cầu thuê không tồn tại' });

    const maLH = await generateAppointmentCode();

    const appointment = await prisma.lichHen.create({
      data: {
        maLH,
        maYCT,
        ngayHen: new Date(ngayHen),
        gioHen,
        trangThai: 'ChoXacNhan',
        ghiChu: ghiChu || null,
      },
      include: { yeuCauThue: { include: { khachHang: true, nhanVien: true } } },
    });

    await prisma.yeuCauThue.update({ where: { maYCT }, data: { trangThai: 'DaHen' } });

    res.status(201).json({ success: true, message: 'Tạo lịch hẹn thành công', data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi tạo lịch hẹn', error: error.message });
  }
};

export const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { trangThai, ghiChu } = req.body;

    const existing = await prisma.lichHen.findUnique({ where: { maLH: id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Lịch hẹn không tồn tại' });

    const updated = await prisma.lichHen.update({
      where: { maLH: id },
      data: {
        ...(trangThai && { trangThai }),
        ...(ghiChu !== undefined && { ghiChu }),
      },
      include: { yeuCauThue: { include: { khachHang: true } } },
    });

    res.json({ success: true, message: 'Cập nhật lịch hẹn thành công', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi cập nhật lịch hẹn', error: error.message });
  }
};

export default { getAppointments, createAppointment, updateAppointment };
