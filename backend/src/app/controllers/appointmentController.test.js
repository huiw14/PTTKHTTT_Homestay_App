import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../db/prisma.js', () => ({
  default: {
    $transaction: vi.fn(),
    lichHen: {
      delete: vi.fn(),
    },
    yeuCauThue: {
      update: vi.fn(),
    },
  },
}));

vi.mock('../services/emailService.js', () => ({
  sendAppointmentConfirmationEmail: vi.fn(),
}));

import prisma from '../db/prisma.js';
import { sendAppointmentConfirmationEmail } from '../services/emailService.js';
import { createAppointment } from './appointmentController.js';

function createRes() {
  const res = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  return res;
}

describe('appointmentController.createAppointment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 when duplicate appointment exists', async () => {
    const tx = {
      yeuCauThue: {
        findUnique: vi.fn().mockResolvedValue({
          maYCT: 'YCT001',
          ngayVaoO: '2026-12-30',
          khachHang: { email: 'test@example.com', hoTen: 'A' },
          nhanVien: {},
        }),
      },
      phong: { findUnique: vi.fn().mockResolvedValue({ maPhong: 'P101' }) },
      giuong: { findUnique: vi.fn() },
      lichHen: {
        findFirst: vi.fn().mockResolvedValue({ maLH: 'LH009' }),
        create: vi.fn(),
      },
    };

    prisma.$transaction.mockImplementationOnce(async (cb) => cb(tx));

    const req = {
      body: {
        maYCT: 'YCT001',
        maPhong: 'P101',
        ngayHen: '2026-12-10',
        gioHen: '09:00',
      },
    };
    const res = createRes();

    await createAppointment(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it('rolls back when appointment email fails', async () => {
    const tx = {
      yeuCauThue: {
        findUnique: vi.fn().mockResolvedValue({
          maYCT: 'YCT001',
          ngayVaoO: '2026-12-30',
          khuVuc: 'Quan 5',
          khachHang: { email: 'test@example.com', hoTen: 'A' },
          nhanVien: {},
        }),
        update: vi.fn().mockResolvedValue({}),
      },
      phong: { findUnique: vi.fn().mockResolvedValue({ maPhong: 'P101' }) },
      giuong: { findUnique: vi.fn() },
      lichHen: {
        findFirst: vi
          .fn()
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce({ maLH: 'LH009' }),
        create: vi.fn().mockResolvedValue({ maLH: 'LH010', ngayHen: '2026-12-10', gioHen: '09:00' }),
      },
    };

    prisma.$transaction
      .mockImplementationOnce(async (cb) => cb(tx))
      .mockResolvedValueOnce([]);

    sendAppointmentConfirmationEmail.mockResolvedValueOnce({ success: false, message: 'Email failed' });

    const req = {
      body: {
        maYCT: 'YCT001',
        maPhong: 'P101',
        ngayHen: '2026-12-10',
        gioHen: '09:00',
      },
    };
    const res = createRes();

    await createAppointment(req, res);

    expect(sendAppointmentConfirmationEmail).toHaveBeenCalled();
    expect(prisma.$transaction).toHaveBeenCalledTimes(2);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });
});
