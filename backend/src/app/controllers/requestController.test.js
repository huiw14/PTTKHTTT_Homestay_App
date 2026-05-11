import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../db/prisma.js', () => ({
  default: {
    yeuCauThue: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import prisma from '../db/prisma.js';
import { updateRequest } from './requestController.js';

function createRes() {
  const res = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  return res;
}

describe('requestController.updateRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 for invalid status transition', async () => {
    prisma.yeuCauThue.findUnique.mockResolvedValueOnce({ maYCT: 'YCT001', trangThai: 'DaCoc' });

    const req = {
      params: { id: 'YCT001' },
      body: { trangThai: 'DaHen' },
    };
    const res = createRes();

    await updateRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it('updates full rental request fields successfully', async () => {
    prisma.yeuCauThue.findUnique.mockResolvedValueOnce({ maYCT: 'YCT001', trangThai: 'ChoDuyet' });
    prisma.yeuCauThue.update.mockResolvedValueOnce({ maYCT: 'YCT001', soNguoi: 2, khuVuc: 'Quan 5' });

    const req = {
      params: { id: 'YCT001' },
      body: {
        soNguoi: 2,
        gioiTinh: 'Chung',
        khuVuc: 'Quan 5',
        loaiPhong: 'Phòng đôi',
        mucGia: 3000000,
        ngayVaoO: '2026-12-20',
        thoiHanThue: 6,
        ghiChu: 'Cap nhat nhu cau',
      },
    };
    const res = createRes();

    await updateRequest(req, res);

    expect(prisma.yeuCauThue.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { maYCT: 'YCT001' },
      data: expect.objectContaining({
        soNguoi: 2,
        gioiTinh: 'Chung',
        khuVuc: 'Quan 5',
        loaiPhong: 'Phòng đôi',
        mucGia: 3000000,
        thoiHanThue: 6,
      }),
    }));
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });
});
