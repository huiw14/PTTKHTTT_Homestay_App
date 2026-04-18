import prisma from '../db/prisma.js';

export function requireRoles(...allowedRoles) {
  return async (req, res, next) => {
    try {
      const maNV = req.headers['x-user-id'];
      const vaiTro = req.headers['x-user-role'];

      if (!maNV || !vaiTro) {
        return res.status(401).json({
          success: false,
          message: 'Ban chua dang nhap hoac thieu thong tin xac thuc',
        });
      }

      if (!allowedRoles.includes(vaiTro)) {
        return res.status(403).json({
          success: false,
          message: 'Ban khong co quyen truy cap chuc nang nay',
        });
      }

      const account = await prisma.taiKhoan.findFirst({
        where: {
          maNV: String(maNV),
          vaiTro: String(vaiTro),
          trangThai: 1,
        },
        include: { nhanVien: true },
      });

      if (!account || !account.nhanVien || account.nhanVien.trangThai !== 1) {
        return res.status(401).json({
          success: false,
          message: 'Tai khoan khong hop le hoac da bi khoa',
        });
      }

      req.user = {
        maNV: account.maNV,
        vaiTro: account.vaiTro,
        hoTen: account.nhanVien.hoTen,
      };

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Loi xac thuc nguoi dung',
        error: error.message,
      });
    }
  };
}

export default { requireRoles };
