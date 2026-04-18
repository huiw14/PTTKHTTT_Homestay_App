import prisma from '../db/prisma.js';
import { sendAppointmentConfirmationEmail } from '../services/emailService.js';

async function generateAppointmentCode(db = prisma) {
  const last = await db.lichHen.findFirst({ orderBy: { maLH: 'desc' } });
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
          phong: true,
          giuong: true,
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
    const { maYCT, maPhong, maGiuong, ngayHen, gioHen, ghiChu } = req.body;

    if (!maYCT || !maPhong || !ngayHen || !gioHen) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc: maYCT, maPhong, ngayHen, gioHen' });
    }

    const appointmentDate = new Date(ngayHen);
    if (Number.isNaN(appointmentDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Ngày hẹn không hợp lệ' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (appointmentDate < today) {
      return res.status(400).json({ success: false, message: 'Ngày hẹn phải từ hôm nay trở đi' });
    }

    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(gioHen)) {
      return res.status(400).json({ success: false, message: 'Giờ hẹn không hợp lệ (định dạng HH:mm)' });
    }

    let txResult;
    try {
      txResult = await prisma.$transaction(async (tx) => {
        const request = await tx.yeuCauThue.findUnique({
          where: { maYCT },
          include: { khachHang: true, nhanVien: true },
        });

        if (!request) {
          const err = new Error('Yêu cầu thuê không tồn tại');
          err.status = 404;
          throw err;
        }

        const requestMoveInDate = new Date(request.ngayVaoO);
        requestMoveInDate.setHours(0, 0, 0, 0);
        if (appointmentDate > requestMoveInDate) {
          const err = new Error('Ngày hẹn xem phòng không được sau ngày vào ở dự kiến');
          err.status = 400;
          throw err;
        }

        const room = await tx.phong.findUnique({ where: { maPhong } });
        if (!room) {
          const err = new Error('Phong khong ton tai');
          err.status = 400;
          throw err;
        }

        if (maGiuong) {
          const bed = await tx.giuong.findUnique({ where: { maGiuong } });
          if (!bed) {
            const err = new Error('Giuong khong ton tai');
            err.status = 400;
            throw err;
          }

          if (bed.maPhong !== maPhong) {
            const err = new Error('Giuong khong thuoc phong da chon');
            err.status = 400;
            throw err;
          }

          if (bed.trangThai !== 'Trong') {
            const err = new Error('Giuong da duoc dat hoac dang su dung');
            err.status = 400;
            throw err;
          }
        }

        const duplicateAppointment = await tx.lichHen.findFirst({
          where: {
            maYCT,
            ngayHen: appointmentDate,
            gioHen,
            trangThai: { not: 'Huy' },
          },
        });

        if (duplicateAppointment) {
          const err = new Error('Đã tồn tại lịch hẹn trùng ngày giờ cho yêu cầu này');
          err.status = 400;
          throw err;
        }

        const maLH = await generateAppointmentCode(tx);

        const appointment = await tx.lichHen.create({
          data: {
            maLH,
            maYCT,
            maPhong,
            maGiuong: maGiuong || null,
            ngayHen: appointmentDate,
            gioHen,
            trangThai: 'ChoXacNhan',
            ghiChu: ghiChu || null,
          },
          include: {
            yeuCauThue: { include: { khachHang: true, nhanVien: true } },
            phong: true,
            giuong: true,
          },
        });

        await tx.yeuCauThue.update({ where: { maYCT }, data: { trangThai: 'DaHen' } });

        return { appointment, request };
      });
    } catch (txError) {
      const status = txError?.status || 500;
      return res.status(status).json({ success: false, message: txError.message || 'Lỗi tạo lịch hẹn' });
    }

    const { appointment, request } = txResult;
    const customer = request?.khachHang;

    let notifyEmailOk = true;
    let notifyMessage = '';

    if (!customer?.email) {
      notifyEmailOk = false;
      notifyMessage = 'Khách hàng chưa có email để nhận thông báo lịch hẹn';
    } else {
      const emailResult = await sendAppointmentConfirmationEmail(
        customer.email,
        customer.hoTen,
        appointment,
        request
      );
      notifyEmailOk = emailResult.success;
      if (!notifyEmailOk) notifyMessage = emailResult.message;
    }

    if (!notifyEmailOk) {
      await prisma.$transaction([
        prisma.lichHen.delete({ where: { maLH: appointment.maLH } }),
        prisma.yeuCauThue.update({ where: { maYCT }, data: { trangThai: 'ChoDuyet' } }),
      ]);

      return res.status(500).json({
        success: false,
        message: 'Gửi thông báo lịch hẹn thất bại, hệ thống đã rollback dữ liệu',
        error: notifyMessage || null,
      });
    }

    res.status(201).json({ success: true, message: 'Tạo lịch hẹn thành công', data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi tạo lịch hẹn', error: error.message });
  }
};

export const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { trangThai, ghiChu } = req.body;

    if (trangThai !== undefined && !['ChoXacNhan', 'DaHen', 'HoanThanh', 'Huy'].includes(trangThai)) {
      return res.status(400).json({ success: false, message: 'Trạng thái lịch hẹn không hợp lệ' });
    }

    const existing = await prisma.lichHen.findUnique({ where: { maLH: id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Lịch hẹn không tồn tại' });

    const validTransitions = {
      ChoXacNhan: ['DaHen', 'Huy'],
      DaHen: ['HoanThanh', 'Huy'],
      HoanThanh: [],
      Huy: [],
    };

    if (trangThai && !validTransitions[existing.trangThai]?.includes(trangThai)) {
      return res.status(400).json({
        success: false,
        message: `Không thể chuyển trạng thái từ ${existing.trangThai} sang ${trangThai}`,
      });
    }

    const updated = await prisma.lichHen.update({
      where: { maLH: id },
      data: {
        ...(trangThai && { trangThai }),
        ...(ghiChu !== undefined && { ghiChu }),
      },
      include: { yeuCauThue: { include: { khachHang: true } }, phong: true, giuong: true },
    });

    res.json({ success: true, message: 'Cập nhật lịch hẹn thành công', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi cập nhật lịch hẹn', error: error.message });
  }
};

export default { getAppointments, createAppointment, updateAppointment };
