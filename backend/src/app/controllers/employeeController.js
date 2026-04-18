import prisma from '../db/prisma.js';

export const getEmployees = async (req, res) => {
  try {
    const { role = 'sale' } = req.query;

    const where = {
      trangThai: 1,
      ...(role && role !== 'all' ? { vaiTro: role } : {}),
    };

    const accounts = await prisma.taiKhoan.findMany({
      where,
      include: { nhanVien: true },
      orderBy: { maNV: 'asc' },
    });

    const data = accounts
      .filter((account) => !!account.nhanVien)
      .map((account) => ({
        maNV: account.maNV,
        hoTen: account.nhanVien.hoTen,
        vaiTro: account.vaiTro,
        soDienThoai: account.nhanVien.soDienThoai,
        email: account.email || null,
      }));

    res.json({ success: true, data, total: data.length });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Loi lay danh sach nhan vien',
      error: error.message,
    });
  }
};

export default { getEmployees };
