import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";

const ROLES = new Set(["admin", "sale", "quanly", "ketoan"]);

export const login = async (req, res) => {
  const { tenDangNhap, matKhau } = req.body;

  if (!tenDangNhap || !matKhau) {
    return res.status(400).json({
      message: "Vui lòng nhập tên đăng nhập và mật khẩu.",
    });
  }

  try {
    const account = await prisma.taiKhoan.findUnique({
      where: { tenDangNhap },
      include: {
        nhanVien: {
          select: {
            maNV: true,
            hoTen: true,
            trangThai: true,
          },
        },
      },
    });

    if (!account) {
      return res.status(401).json({ message: "Thông tin đăng nhập không chính xác." });
    }

    if (account.trangThai === 0) {
      return res.status(423).json({
        message: "Tài khoản của bạn đã bị khóa, vui lòng liên hệ Admin.",
      });
    }

    if (!ROLES.has(account.vaiTro)) {
      return res.status(403).json({ message: "Vai trò tài khoản không hợp lệ." });
    }

    const isMatch = await bcrypt.compare(matKhau, account.matKhau);
    if (!isMatch) {
      return res.status(401).json({ message: "Thông tin đăng nhập không chính xác." });
    }

    return res.status(200).json({
      message: "Đăng nhập thành công.",
      data: {
        maTK: account.maTK,
        maNV: account.maNV,
        hoTen: account.nhanVien?.hoTen || null,
        tenDangNhap: account.tenDangNhap,
        vaiTro: account.vaiTro,
        email: account.email,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Không thể đăng nhập.", detail: error.message });
  }
};

export const changePassword = async (req, res) => {
  const { tenDangNhap, matKhauCu, matKhauMoi } = req.body;

  if (!tenDangNhap || !matKhauCu || !matKhauMoi) {
    return res.status(400).json({ message: "Vui lòng nhập đủ tên đăng nhập, mật khẩu cũ và mật khẩu mới." });
  }

  if (String(matKhauMoi).length < 6) {
    return res.status(400).json({ message: "Mật khẩu mới phải có ít nhất 6 ký tự." });
  }

  try {
    const account = await prisma.taiKhoan.findUnique({ where: { tenDangNhap } });
    if (!account) {
      return res.status(404).json({ message: "Không tìm thấy tài khoản." });
    }

    if (account.trangThai === 0) {
      return res.status(423).json({
        message: "Tài khoản của bạn đã bị khóa, vui lòng liên hệ Admin.",
      });
    }

    const isMatch = await bcrypt.compare(matKhauCu, account.matKhau);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu cũ không chính xác." });
    }

    const hashed = await bcrypt.hash(matKhauMoi, 10);

    await prisma.taiKhoan.update({
      where: { maTK: account.maTK },
      data: { matKhau: hashed },
    });

    return res.status(200).json({ message: "Đổi mật khẩu thành công." });
  } catch (error) {
    return res.status(500).json({ message: "Không thể đổi mật khẩu.", detail: error.message });
  }
};

export const logout = async (_req, res) => {
  return res.status(200).json({ message: "Đăng xuất thành công." });
};
