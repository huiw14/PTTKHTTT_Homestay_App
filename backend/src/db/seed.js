import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Bắt đầu seed dữ liệu...");

  // ─── CHI NHÁNH ─────────────────────────────────────────────────────────────
  await prisma.chiNhanh.createMany({
    data: [
      { maCN: "CN001", tenCN: "Chi nhánh Quận 5",    diaChi: "227 Nguyễn Văn Cừ, Q.5, TP.HCM",     soDT: "0283835426" },
      { maCN: "CN002", tenCN: "Chi nhánh Bình Thạnh", diaChi: "15 Xô Viết Nghệ Tĩnh, Q.BT, TP.HCM", soDT: "0283556677" },
    ],
    skipDuplicates: true,
  });

  // ─── NHÂN VIÊN ─────────────────────────────────────────────────────────────
  await prisma.nhanVien.createMany({
    data: [
      { maNV: "NV001", hoTen: "Nguyễn Văn An",    gioiTinh: "Nam", ngaySinh: new Date("1990-03-15"), soDienThoai: "0901234567", trangThai: 1 },
      { maNV: "NV002", hoTen: "Trần Thị Bình",    gioiTinh: "Nu",  ngaySinh: new Date("1992-07-22"), soDienThoai: "0912345678", trangThai: 1 },
      { maNV: "NV003", hoTen: "Lê Minh Châu",     gioiTinh: "Nu",  ngaySinh: new Date("1995-11-08"), soDienThoai: "0923456789", trangThai: 1 },
      { maNV: "NV004", hoTen: "Phạm Quốc Đạt",    gioiTinh: "Nam", ngaySinh: new Date("1988-05-30"), soDienThoai: "0934567890", trangThai: 1 },
      { maNV: "NV005", hoTen: "Hoàng Thị Hương",  gioiTinh: "Nu",  ngaySinh: new Date("1993-09-14"), soDienThoai: "0945678901", trangThai: 1 },
    ],
    skipDuplicates: true,
  });

  // ─── TÀI KHOẢN ─────────────────────────────────────────────────────────────
  const hashedPw = await bcrypt.hash("123456", 10);
  await prisma.taiKhoan.createMany({
    data: [
      { maTK: "TK001", maNV: "NV001", tenDangNhap: "admin",   matKhau: hashedPw, vaiTro: "admin",   email: "admin@homestaydorm.vn",   trangThai: 1 },
      { maTK: "TK002", maNV: "NV002", tenDangNhap: "sale01",  matKhau: hashedPw, vaiTro: "sale",    email: "sale01@homestaydorm.vn",  trangThai: 1 },
      { maTK: "TK003", maNV: "NV003", tenDangNhap: "ketoan01",matKhau: hashedPw, vaiTro: "ketoan",  email: "ketoan@homestaydorm.vn",  trangThai: 1 },
      { maTK: "TK004", maNV: "NV004", tenDangNhap: "quanly01",matKhau: hashedPw, vaiTro: "quanly",  email: "quanly@homestaydorm.vn",  trangThai: 1 },
      { maTK: "TK005", maNV: "NV005", tenDangNhap: "sale02",  matKhau: hashedPw, vaiTro: "sale",    email: "sale02@homestaydorm.vn",  trangThai: 1 },
    ],
    skipDuplicates: true,
  });

  // ─── LOẠI PHÒNG ────────────────────────────────────────────────────────────
  await prisma.loaiPhong.createMany({
    data: [
      { maLoai: "LP001", tenLoai: "Phòng đơn",    moTa: "Phòng riêng 1 người" },
      { maLoai: "LP002", tenLoai: "Phòng đôi",    moTa: "Phòng riêng 2 người" },
      { maLoai: "LP003", tenLoai: "Phòng ở ghép", moTa: "Phòng ghép nhiều người" },
    ],
    skipDuplicates: true,
  });

  // ─── PHÒNG ─────────────────────────────────────────────────────────────────
  await prisma.phong.createMany({
    data: [
      { maPhong: "P101", tenPhong: "Phòng 101", maCN: "CN001", maLoai: "LP001", sucChua: 1, gioiTinhPhong: "Chung", giaThue: 3500000, trangThai: "Trong"   },
      { maPhong: "P102", tenPhong: "Phòng 102", maCN: "CN001", maLoai: "LP002", sucChua: 2, gioiTinhPhong: "Nu",    giaThue: 2500000, trangThai: "DaThue"  },
      { maPhong: "P103", tenPhong: "Phòng 103", maCN: "CN001", maLoai: "LP003", sucChua: 4, gioiTinhPhong: "Nam",   giaThue: 1800000, trangThai: "DaThue"  },
      { maPhong: "P104", tenPhong: "Phòng 104", maCN: "CN001", maLoai: "LP003", sucChua: 4, gioiTinhPhong: "Nu",    giaThue: 1800000, trangThai: "Trong"   },
      { maPhong: "P201", tenPhong: "Phòng 201", maCN: "CN002", maLoai: "LP002", sucChua: 2, gioiTinhPhong: "Chung", giaThue: 2800000, trangThai: "DaCoc"   },
      { maPhong: "P202", tenPhong: "Phòng 202", maCN: "CN002", maLoai: "LP003", sucChua: 6, gioiTinhPhong: "Nam",   giaThue: 1500000, trangThai: "DaThue"  },
    ],
    skipDuplicates: true,
  });

  // ─── GIƯỜNG ────────────────────────────────────────────────────────────────
  await prisma.giuong.createMany({
    data: [
      // P101 - 1 giường đơn
      { maGiuong: "G101A", maPhong: "P101", tenGiuong: "Giường 101A", trangThai: "Trong"  },
      // P102 - 2 giường
      { maGiuong: "G102A", maPhong: "P102", tenGiuong: "Giường 102A", trangThai: "DaThue" },
      { maGiuong: "G102B", maPhong: "P102", tenGiuong: "Giường 102B", trangThai: "DaThue" },
      // P103 - 4 giường
      { maGiuong: "G103A", maPhong: "P103", tenGiuong: "Giường 103A", trangThai: "DaThue" },
      { maGiuong: "G103B", maPhong: "P103", tenGiuong: "Giường 103B", trangThai: "DaThue" },
      { maGiuong: "G103C", maPhong: "P103", tenGiuong: "Giường 103C", trangThai: "DaThue" },
      { maGiuong: "G103D", maPhong: "P103", tenGiuong: "Giường 103D", trangThai: "Trong"  },
      // P104 - 4 giường
      { maGiuong: "G104A", maPhong: "P104", tenGiuong: "Giường 104A", trangThai: "Trong"  },
      { maGiuong: "G104B", maPhong: "P104", tenGiuong: "Giường 104B", trangThai: "Trong"  },
      { maGiuong: "G104C", maPhong: "P104", tenGiuong: "Giường 104C", trangThai: "Trong"  },
      { maGiuong: "G104D", maPhong: "P104", tenGiuong: "Giường 104D", trangThai: "Trong"  },
      // P201 - 2 giường
      { maGiuong: "G201A", maPhong: "P201", tenGiuong: "Giường 201A", trangThai: "DaCoc"  },
      { maGiuong: "G201B", maPhong: "P201", tenGiuong: "Giường 201B", trangThai: "DaCoc"  },
      // P202 - 6 giường
      { maGiuong: "G202A", maPhong: "P202", tenGiuong: "Giường 202A", trangThai: "DaThue" },
      { maGiuong: "G202B", maPhong: "P202", tenGiuong: "Giường 202B", trangThai: "DaThue" },
      { maGiuong: "G202C", maPhong: "P202", tenGiuong: "Giường 202C", trangThai: "DaThue" },
      { maGiuong: "G202D", maPhong: "P202", tenGiuong: "Giường 202D", trangThai: "Trong"  },
      { maGiuong: "G202E", maPhong: "P202", tenGiuong: "Giường 202E", trangThai: "Trong"  },
      { maGiuong: "G202F", maPhong: "P202", tenGiuong: "Giường 202F", trangThai: "Trong"  },
    ],
    skipDuplicates: true,
  });

  // ─── KHÁCH HÀNG ────────────────────────────────────────────────────────────
  await prisma.khachHang.createMany({
    data: [
      { maKH: "KH001", hoTen: "Nguyễn Thị Mai",    gioiTinh: "Nu",  ngaySinh: new Date("2002-04-10"), cccd: "079202001234", soDienThoai: "0971234567", email: "mai@gmail.com",   quocTich: "Việt Nam", trangThai: 1 },
      { maKH: "KH002", hoTen: "Trần Văn Hùng",     gioiTinh: "Nam", ngaySinh: new Date("2001-08-25"), cccd: "079201002345", soDienThoai: "0982345678", email: "hung@gmail.com",  quocTich: "Việt Nam", trangThai: 1 },
      { maKH: "KH003", hoTen: "Lê Thị Lan",        gioiTinh: "Nu",  ngaySinh: new Date("2003-01-15"), cccd: "079203003456", soDienThoai: "0993456789", email: "lan@gmail.com",   quocTich: "Việt Nam", trangThai: 1 },
      { maKH: "KH004", hoTen: "Phạm Văn Tuấn",     gioiTinh: "Nam", ngaySinh: new Date("2000-12-05"), cccd: "079200004567", soDienThoai: "0904567890", email: "tuan@gmail.com",  quocTich: "Việt Nam", trangThai: 1 },
      { maKH: "KH005", hoTen: "Hoàng Thị Thu",     gioiTinh: "Nu",  ngaySinh: new Date("2002-06-20"), cccd: "079202005678", soDienThoai: "0915678901", email: "thu@gmail.com",   quocTich: "Việt Nam", trangThai: 1 },
      { maKH: "KH006", hoTen: "Đặng Minh Khoa",    gioiTinh: "Nam", ngaySinh: new Date("2001-03-18"), cccd: "079201006789", soDienThoai: "0926789012", email: "khoa@gmail.com",  quocTich: "Việt Nam", trangThai: 1 },
      { maKH: "KH007", hoTen: "Vũ Thị Hoa",        gioiTinh: "Nu",  ngaySinh: new Date("2003-09-30"), cccd: "079203007890", soDienThoai: "0937890123", email: "hoa@gmail.com",   quocTich: "Việt Nam", trangThai: 1 },
      { maKH: "KH008", hoTen: "Bùi Văn Long",      gioiTinh: "Nam", ngaySinh: new Date("2000-07-11"), cccd: "079200008901", soDienThoai: "0948901234", email: "long@gmail.com",  quocTich: "Việt Nam", trangThai: 1 },
      { maKH: "KH009", hoTen: "Test Email User",   gioiTinh: "Nam", ngaySinh: new Date("2001-05-15"), cccd: "079201009999", soDienThoai: "0999999999", email: "obezet12@gmail.com", quocTich: "Việt Nam", trangThai: 1 },
    ],
    skipDuplicates: true,
  });

  // ─── DỊCH VỤ ───────────────────────────────────────────────────────────────
  await prisma.dichVu.createMany({
    data: [
      { maDV: "DV001", tenDV: "Tiền điện",  donViTinh: "kWh",      donGia: 3500   },
      { maDV: "DV002", tenDV: "Tiền nước",  donViTinh: "m3",       donGia: 15000  },
      { maDV: "DV003", tenDV: "Wifi",       donViTinh: "tháng",    donGia: 100000 },
      { maDV: "DV004", tenDV: "Gửi xe máy", donViTinh: "xe/tháng", donGia: 150000 },
      { maDV: "DV005", tenDV: "Gửi xe đạp", donViTinh: "xe/tháng", donGia: 50000  },
    ],
    skipDuplicates: true,
  });

  // ─── TÀI SẢN ───────────────────────────────────────────────────────────────
  await prisma.taiSan.createMany({
    data: [
      { maTS: "TS001", tenTS: "Giường tầng", loaiTS: "Nội thất",   moTa: "Giường sắt 2 tầng"     },
      { maTS: "TS002", tenTS: "Nệm",         loaiTS: "Nội thất",   moTa: "Nệm cao su 1m2"         },
      { maTS: "TS003", tenTS: "Tủ đầu giường",loaiTS: "Nội thất",  moTa: "Tủ gỗ nhỏ"             },
      { maTS: "TS004", tenTS: "Thẻ từ",      loaiTS: "Bảo mật",    moTa: "Thẻ từ ra vào phòng"   },
      { maTS: "TS005", tenTS: "Điều hoà",    loaiTS: "Thiết bị",   moTa: "Máy lạnh Daikin 1.5HP"  },
      { maTS: "TS006", tenTS: "Quạt trần",   loaiTS: "Thiết bị",   moTa: "Quạt trần 3 cánh"      },
    ],
    skipDuplicates: true,
  });

  // ─── YÊU CẦU THUÊ ──────────────────────────────────────────────────────────
  await prisma.yeuCauThue.createMany({
    data: [
      {
        maYCT: "YCT001", maKH: "KH001", maNV: "NV002",
        ngayYC: new Date("2025-11-01"), soNguoi: 1, gioiTinh: "Nu",
        khuVuc: "Quận 5", loaiPhong: "Phòng đôi", mucGia: 3000000,
        ngayVaoO: new Date("2025-12-01"), thoiHanThue: 6,
        trangThai: "DaCoc", ghiChu: null,
      },
      {
        maYCT: "YCT002", maKH: "KH002", maNV: "NV002",
        ngayYC: new Date("2025-11-05"), soNguoi: 1, gioiTinh: "Nam",
        khuVuc: "Quận 5", loaiPhong: "Phòng ở ghép", mucGia: 2000000,
        ngayVaoO: new Date("2025-12-01"), thoiHanThue: 12,
        trangThai: "DaCoc", ghiChu: null,
      },
      {
        maYCT: "YCT003", maKH: "KH007", maNV: "NV005",
        ngayYC: new Date("2025-12-10"), soNguoi: 2, gioiTinh: "Nu",
        khuVuc: "Bình Thạnh", loaiPhong: "Phòng đôi", mucGia: 3000000,
        ngayVaoO: new Date("2026-01-01"), thoiHanThue: 6,
        trangThai: "DaCoc", ghiChu: null,
      },
      {
        maYCT: "YCT004", maKH: "KH005", maNV: "NV002",
        ngayYC: new Date("2026-03-15"), soNguoi: 1, gioiTinh: "Nu",
        khuVuc: "Quận 5", loaiPhong: "Phòng ở ghép", mucGia: 2000000,
        ngayVaoO: new Date("2026-04-01"), thoiHanThue: 6,
        trangThai: "ChoDuyet", ghiChu: "Cần phòng yên tĩnh, không hút thuốc",
      },
    ],
    skipDuplicates: true,
  });

  // ─── LỊCH HẸN ──────────────────────────────────────────────────────────────
  await prisma.lichHen.createMany({
    data: [
      { maLH: "LH001", maYCT: "YCT001", ngayHen: new Date("2025-11-08"), gioHen: "09:00", trangThai: "HoanThanh", ghiChu: null },
      { maLH: "LH002", maYCT: "YCT002", ngayHen: new Date("2025-11-10"), gioHen: "14:00", trangThai: "HoanThanh", ghiChu: null },
      { maLH: "LH003", maYCT: "YCT003", ngayHen: new Date("2025-12-15"), gioHen: "10:00", trangThai: "HoanThanh", ghiChu: null },
      { maLH: "LH004", maYCT: "YCT004", ngayHen: new Date("2026-03-20"), gioHen: "15:00", trangThai: "ChoXacNhan", ghiChu: null },
    ],
    skipDuplicates: true,
  });

  // ─── PHIẾU CỌC ─────────────────────────────────────────────────────────────
  await prisma.phieuCoc.createMany({
    data: [
      // KH001 cọc 2 giường P102 (phòng đôi, 2.5tr/giường → cọc = 2tr * 2 tháng * 2 giường)
      { maPC: "PC001", maKH: "KH001", maNV: "NV002", maCN: "CN001", ngayCoc: new Date("2025-11-15T10:00:00"), tienCoc: 10000000, trangThai: "DaDuyet", hanThanhToan: new Date("2025-11-16T10:00:00") },
      // KH002 cọc 1 giường P103
      { maPC: "PC002", maKH: "KH002", maNV: "NV002", maCN: "CN001", ngayCoc: new Date("2025-11-18T14:00:00"), tienCoc: 3600000,  trangThai: "DaDuyet", hanThanhToan: new Date("2025-11-19T14:00:00") },
      // KH007 + KH008 cọc P201 (2 giường, 2.8tr/giường)
      { maPC: "PC003", maKH: "KH007", maNV: "NV005", maCN: "CN002", ngayCoc: new Date("2025-12-20T09:00:00"), tienCoc: 11200000, trangThai: "DaDuyet", hanThanhToan: new Date("2025-12-21T09:00:00") },
      // KH006 cọc 1 giường P104 - Chờ duyệt
      { maPC: "PC004", maKH: "KH006", maNV: "NV002", maCN: "CN001", ngayCoc: new Date("2026-03-10T08:00:00"), tienCoc: 3600000, trangThai: "ChoDuyet", hanThanhToan: new Date("2026-03-12T08:00:00") },
      // KH003 cọc phòng P104 (phòng rỗng, 4 giường) - Chờ duyệt
      { maPC: "PC005", maKH: "KH003", maNV: "NV002", maCN: "CN001", maPhong: "P104", ngayCoc: new Date("2026-03-05T10:30:00"), tienCoc: 7200000, trangThai: "ChoDuyet", hanThanhToan: new Date("2026-03-07T10:30:00") },
      // KH004 cọc 3 giường P202 - Đã duyệt
      { maPC: "PC006", maKH: "KH004", maNV: "NV005", maCN: "CN002", ngayCoc: new Date("2026-02-28T14:00:00"), tienCoc: 13500000, trangThai: "DaDuyet", hanThanhToan: new Date("2026-03-02T14:00:00") },
      // KH005 cọc phòng P101 (phòng đơn, 1 giường) - Đã duyệt
      { maPC: "PC007", maKH: "KH005", maNV: "NV002", maCN: "CN001", maPhong: "P101", ngayCoc: new Date("2026-02-15T09:00:00"), tienCoc: 7000000, trangThai: "DaDuyet", hanThanhToan: new Date("2026-02-17T09:00:00") },
      // KH008 cọc phòng P104 (phòng rỗng, 4 giường) - Đã hủy (Quá hạn)
      { maPC: "PC008", maKH: "KH008", maNV: "NV002", maCN: "CN001", maPhong: "P104", ngayCoc: new Date("2026-01-20T11:00:00"), tienCoc: 7200000, trangThai: "DaHuy", hanThanhToan: new Date("2026-01-22T11:00:00") },
      // KH009 (Test Email User) cọc phòng P101 - Chờ thanh toán (for email testing)
      { maPC: "PC009", maKH: "KH009", maNV: "NV002", maCN: "CN001", maPhong: "P101", ngayCoc: new Date("2026-04-15T10:00:00"), tienCoc: 7000000, trangThai: "ChoThanhToan", hanThanhToan: new Date("2026-04-17T10:00:00") },
    ],
    skipDuplicates: true,
  });

  await prisma.chiTietPhieuCoc.createMany({
    data: [
      { maPC: "PC001", maGiuong: "G102A" },
      { maPC: "PC001", maGiuong: "G102B" },
      { maPC: "PC002", maGiuong: "G103A" },
      { maPC: "PC003", maGiuong: "G201A" },
      { maPC: "PC003", maGiuong: "G201B" },
      // PC004 - KH006 cọc 1 giường G104A
      { maPC: "PC004", maGiuong: "G104A" },
      // PC005 - cọc phòng (không có chiTietPhieuCoc)
      // PC006 - KH004 cọc 3 giường P202
      { maPC: "PC006", maGiuong: "G202A" },
      { maPC: "PC006", maGiuong: "G202B" },
      { maPC: "PC006", maGiuong: "G202C" },
      // PC007 - cọc phòng (không có chiTietPhieuCoc)
      // PC008 - cọc phòng (không có chiTietPhieuCoc)
      // PC009 - cọc phòng (không có chiTietPhieuCoc)
    ],
    skipDuplicates: true,
  });

  // ─── HỢP ĐỒNG ──────────────────────────────────────────────────────────────
  await prisma.hopDong.createMany({
    data: [
      { maHD: "HD001", maPC: "PC001", maNV: "NV004", ngayKy: new Date("2025-12-01"), ngayBatDau: new Date("2025-12-01"), ngayKetThuc: new Date("2026-06-01"), kyThanhToan: 1, trangThai: "DangHieuLuc" },
      { maHD: "HD002", maPC: "PC002", maNV: "NV004", ngayKy: new Date("2025-12-01"), ngayBatDau: new Date("2025-12-01"), ngayKetThuc: new Date("2026-12-01"), kyThanhToan: 1, trangThai: "DangHieuLuc" },
      { maHD: "HD003", maPC: "PC003", maNV: "NV004", ngayKy: new Date("2026-01-02"), ngayBatDau: new Date("2026-01-02"), ngayKetThuc: new Date("2026-07-02"), kyThanhToan: 1, trangThai: "DangHieuLuc" },
    ],
    skipDuplicates: true,
  });

  // ─── THÀNH VIÊN ────────────────────────────────────────────────────────────
  await prisma.thanhVien.createMany({
    data: [
      { maTV: "TV001", maHD: "HD001", maKH: "KH001", maGiuong: "G102A", trangThai: 1 },
      { maTV: "TV002", maHD: "HD001", maKH: "KH003", maGiuong: "G102B", trangThai: 1 },
      { maTV: "TV003", maHD: "HD002", maKH: "KH002", maGiuong: "G103A", trangThai: 1 },
      { maTV: "TV004", maHD: "HD003", maKH: "KH007", maGiuong: "G201A", trangThai: 1 },
      { maTV: "TV005", maHD: "HD003", maKH: "KH008", maGiuong: "G201B", trangThai: 1 },
    ],
    skipDuplicates: true,
  });

  // ─── PHIẾU THU ─────────────────────────────────────────────────────────────
  await prisma.phieuThu.createMany({
    data: [
      { maPT: "PT001", maHD: "HD001", maNV: "NV003", ngayThu: new Date("2025-12-01"), tongTien: 5100000, loaiThu: "TienThueKyDau", ghiChu: "Tiền thuê tháng 12 + wifi + gửi xe" },
      { maPT: "PT002", maHD: "HD002", maNV: "NV003", ngayThu: new Date("2025-12-01"), tongTien: 1950000, loaiThu: "TienThueKyDau", ghiChu: "Tiền thuê tháng 12 + wifi"          },
      { maPT: "PT003", maHD: "HD003", maNV: "NV003", ngayThu: new Date("2026-01-02"), tongTien: 5800000, loaiThu: "TienThueKyDau", ghiChu: "Tiền thuê tháng 1 + dịch vụ"        },
    ],
    skipDuplicates: true,
  });

  await prisma.chiTietPhieuThu.createMany({
    data: [
      // PT001 - HD001 (2 giường P102 × 2.5tr + wifi 2 người + gửi xe 1 người)
      { maPT: "PT001", maDV: "DV003", soLuong: 2, donGia: 100000, thanhTien: 200000 },
      { maPT: "PT001", maDV: "DV004", soLuong: 1, donGia: 150000, thanhTien: 150000 },
      // PT002 - HD002 (1 giường P103 × 1.8tr + wifi)
      { maPT: "PT002", maDV: "DV003", soLuong: 1, donGia: 100000, thanhTien: 100000 },
      // PT003 - HD003 (2 giường P201 × 2.8tr + wifi 2 người + gửi xe 2 người)
      { maPT: "PT003", maDV: "DV003", soLuong: 2, donGia: 100000, thanhTien: 200000 },
      { maPT: "PT003", maDV: "DV004", soLuong: 2, donGia: 150000, thanhTien: 300000 },
    ],
    skipDuplicates: true,
  });

  // ─── BIÊN BẢN BÀN GIAO ─────────────────────────────────────────────────────
  await prisma.bienBanBanGiao.createMany({
    data: [
      { maBBBG: "BG001", maHD: "HD001", maNV: "NV004", ngayBanGiao: new Date("2025-12-01"), chiSoDienDau: 1250.5, chiSoNuocDau: 320.0, ghiChu: null },
      { maBBBG: "BG002", maHD: "HD002", maNV: "NV004", ngayBanGiao: new Date("2025-12-01"), chiSoDienDau: 850.0,  chiSoNuocDau: 180.5, ghiChu: null },
      { maBBBG: "BG003", maHD: "HD003", maNV: "NV004", ngayBanGiao: new Date("2026-01-02"), chiSoDienDau: 560.0,  chiSoNuocDau: 95.0,  ghiChu: null },
    ],
    skipDuplicates: true,
  });

  await prisma.chiTietBanGiao.createMany({
    data: [
      { maBBBG: "BG001", maTS: "TS001", maGiuong: "G102A", soLuong: 1, ghiChu: null },
      { maBBBG: "BG001", maTS: "TS002", maGiuong: "G102A", soLuong: 1, ghiChu: null },
      { maBBBG: "BG001", maTS: "TS004", maGiuong: "G102A", soLuong: 1, ghiChu: null },
      { maBBBG: "BG001", maTS: "TS001", maGiuong: "G102B", soLuong: 1, ghiChu: null },
      { maBBBG: "BG001", maTS: "TS002", maGiuong: "G102B", soLuong: 1, ghiChu: null },
      { maBBBG: "BG001", maTS: "TS004", maGiuong: "G102B", soLuong: 1, ghiChu: null },
      { maBBBG: "BG002", maTS: "TS001", maGiuong: "G103A", soLuong: 1, ghiChu: null },
      { maBBBG: "BG002", maTS: "TS002", maGiuong: "G103A", soLuong: 1, ghiChu: null },
      { maBBBG: "BG002", maTS: "TS004", maGiuong: "G103A", soLuong: 1, ghiChu: null },
      { maBBBG: "BG003", maTS: "TS001", maGiuong: "G201A", soLuong: 1, ghiChu: null },
      { maBBBG: "BG003", maTS: "TS002", maGiuong: "G201A", soLuong: 1, ghiChu: null },
      { maBBBG: "BG003", maTS: "TS004", maGiuong: "G201A", soLuong: 1, ghiChu: null },
      { maBBBG: "BG003", maTS: "TS001", maGiuong: "G201B", soLuong: 1, ghiChu: null },
      { maBBBG: "BG003", maTS: "TS002", maGiuong: "G201B", soLuong: 1, ghiChu: null },
      { maBBBG: "BG003", maTS: "TS004", maGiuong: "G201B", soLuong: 1, ghiChu: null },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Seed dữ liệu hoàn tất!");
  console.log("─────────────────────────────────");
  console.log("  Chi nhánh   : 2");
  console.log("  Nhân viên   : 5  (1 admin, 2 sale, 1 kế toán, 1 quản lý)");
  console.log("  Tài khoản   : 5  (mật khẩu mặc định: 123456)");
  console.log("  Loại phòng  : 3");
  console.log("  Phòng       : 6  |  Giường: 19");
  console.log("  Khách hàng  : 8");
  console.log("  Dịch vụ     : 5");
  console.log("  Tài sản     : 6");
  console.log("  Hợp đồng    : 3  (đang hiệu lực)");
}

main()
  .catch((e) => {
    console.error("❌ Seed thất bại:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
