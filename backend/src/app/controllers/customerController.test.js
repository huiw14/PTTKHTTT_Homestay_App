import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../db/prisma.js', () => ({
  default: {
    khachHang: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import prisma from '../db/prisma.js';
import { createCustomer } from './customerController.js';

function createRes() {
  const res = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  return res;
}

describe('customerController.createCustomer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 when required fields are missing', async () => {
    const req = { body: { hoTen: '', cccd: '', soDienThoai: '' } };
    const res = createRes();

    await createCustomer(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it('returns 400 when phone number already exists', async () => {
    prisma.khachHang.findFirst.mockResolvedValueOnce({ cccd: '079111111111', soDienThoai: '0909999999' });

    const req = {
      body: {
        hoTen: 'Test User',
        cccd: '079123456789',
        soDienThoai: '0909999999',
      },
    };
    const res = createRes();

    await createCustomer(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: 'Số điện thoại đã tồn tại trong hệ thống',
    }));
  });

  it('creates customer successfully when input is valid', async () => {
    prisma.khachHang.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ maKH: 'KH001' });

    prisma.khachHang.create.mockResolvedValueOnce({
      maKH: 'KH002',
      hoTen: 'Nguyen Van A',
    });

    const req = {
      body: {
        hoTen: 'Nguyen Van A',
        cccd: '079123456789',
        soDienThoai: '0901234567',
      },
    };
    const res = createRes();

    await createCustomer(req, res);

    expect(prisma.khachHang.create).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });
});
