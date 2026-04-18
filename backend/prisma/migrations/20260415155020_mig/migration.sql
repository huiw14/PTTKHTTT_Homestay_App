-- CreateTable
CREATE TABLE "NhanVien" (
    "maNV" VARCHAR(10) NOT NULL,
    "hoTen" VARCHAR(100) NOT NULL,
    "gioiTinh" VARCHAR(5) NOT NULL,
    "ngaySinh" DATE NOT NULL,
    "soDienThoai" VARCHAR(15) NOT NULL,
    "trangThai" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "NhanVien_pkey" PRIMARY KEY ("maNV")
);

-- CreateTable
CREATE TABLE "TaiKhoan" (
    "maTK" VARCHAR(10) NOT NULL,
    "maNV" VARCHAR(10) NOT NULL,
    "tenDangNhap" VARCHAR(50) NOT NULL,
    "matKhau" VARCHAR(255) NOT NULL,
    "vaiTro" VARCHAR(20) NOT NULL,
    "email" VARCHAR(100),
    "trangThai" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "TaiKhoan_pkey" PRIMARY KEY ("maTK")
);

-- CreateTable
CREATE TABLE "ChiNhanh" (
    "maCN" VARCHAR(10) NOT NULL,
    "tenCN" VARCHAR(100) NOT NULL,
    "diaChi" VARCHAR(255) NOT NULL,
    "soDT" VARCHAR(15) NOT NULL,

    CONSTRAINT "ChiNhanh_pkey" PRIMARY KEY ("maCN")
);

-- CreateTable
CREATE TABLE "KhachHang" (
    "maKH" VARCHAR(10) NOT NULL,
    "hoTen" VARCHAR(100) NOT NULL,
    "gioiTinh" VARCHAR(5) NOT NULL,
    "ngaySinh" DATE NOT NULL,
    "cccd" VARCHAR(20) NOT NULL,
    "soDienThoai" VARCHAR(15) NOT NULL,
    "email" VARCHAR(100),
    "quocTich" VARCHAR(50) NOT NULL DEFAULT 'Việt Nam',
    "trangThai" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "KhachHang_pkey" PRIMARY KEY ("maKH")
);

-- CreateTable
CREATE TABLE "LoaiPhong" (
    "maLoai" VARCHAR(10) NOT NULL,
    "tenLoai" VARCHAR(50) NOT NULL,
    "moTa" TEXT,

    CONSTRAINT "LoaiPhong_pkey" PRIMARY KEY ("maLoai")
);

-- CreateTable
CREATE TABLE "Phong" (
    "maPhong" VARCHAR(10) NOT NULL,
    "tenPhong" VARCHAR(50) NOT NULL,
    "maCN" VARCHAR(10) NOT NULL,
    "maLoai" VARCHAR(10) NOT NULL,
    "sucChua" INTEGER NOT NULL,
    "gioiTinhPhong" VARCHAR(10) NOT NULL,
    "giaThue" DECIMAL(12,0) NOT NULL,
    "trangThai" VARCHAR(20) NOT NULL,

    CONSTRAINT "Phong_pkey" PRIMARY KEY ("maPhong")
);

-- CreateTable
CREATE TABLE "Giuong" (
    "maGiuong" VARCHAR(10) NOT NULL,
    "maPhong" VARCHAR(10) NOT NULL,
    "tenGiuong" VARCHAR(50) NOT NULL,
    "trangThai" VARCHAR(20) NOT NULL,

    CONSTRAINT "Giuong_pkey" PRIMARY KEY ("maGiuong")
);

-- CreateTable
CREATE TABLE "YeuCauThue" (
    "maYCT" VARCHAR(10) NOT NULL,
    "maKH" VARCHAR(10) NOT NULL,
    "maNV" VARCHAR(10) NOT NULL,
    "ngayYC" DATE NOT NULL,
    "soNguoi" INTEGER NOT NULL,
    "gioiTinh" VARCHAR(5) NOT NULL,
    "khuVuc" VARCHAR(100),
    "loaiPhong" VARCHAR(50),
    "mucGia" DECIMAL(12,0),
    "ngayVaoO" DATE NOT NULL,
    "thoiHanThue" INTEGER NOT NULL,
    "trangThai" VARCHAR(20) NOT NULL,
    "ghiChu" TEXT,

    CONSTRAINT "YeuCauThue_pkey" PRIMARY KEY ("maYCT")
);

-- CreateTable
CREATE TABLE "LichHen" (
    "maLH" VARCHAR(10) NOT NULL,
    "maYCT" VARCHAR(10) NOT NULL,
    "ngayHen" DATE NOT NULL,
    "gioHen" VARCHAR(10) NOT NULL,
    "trangThai" VARCHAR(20) NOT NULL,
    "ghiChu" TEXT,

    CONSTRAINT "LichHen_pkey" PRIMARY KEY ("maLH")
);

-- CreateTable
CREATE TABLE "PhieuCoc" (
    "maPC" VARCHAR(10) NOT NULL,
    "maKH" VARCHAR(10) NOT NULL,
    "maNV" VARCHAR(10) NOT NULL,
    "maCN" VARCHAR(10) NOT NULL,
    "maPhong" VARCHAR(10),
    "ngayCoc" TIMESTAMP NOT NULL,
    "tienCoc" DECIMAL(12,0) NOT NULL,
    "trangThai" VARCHAR(20) NOT NULL,
    "hanThanhToan" TIMESTAMP NOT NULL,

    CONSTRAINT "PhieuCoc_pkey" PRIMARY KEY ("maPC")
);

-- CreateTable
CREATE TABLE "ChiTietPhieuCoc" (
    "maPC" VARCHAR(10) NOT NULL,
    "maGiuong" VARCHAR(10) NOT NULL,

    CONSTRAINT "ChiTietPhieuCoc_pkey" PRIMARY KEY ("maPC","maGiuong")
);

-- CreateTable
CREATE TABLE "HopDong" (
    "maHD" VARCHAR(10) NOT NULL,
    "maPC" VARCHAR(10) NOT NULL,
    "maNV" VARCHAR(10) NOT NULL,
    "ngayKy" DATE NOT NULL,
    "ngayBatDau" DATE NOT NULL,
    "ngayKetThuc" DATE NOT NULL,
    "kyThanhToan" INTEGER NOT NULL,
    "trangThai" VARCHAR(20) NOT NULL,

    CONSTRAINT "HopDong_pkey" PRIMARY KEY ("maHD")
);

-- CreateTable
CREATE TABLE "ThanhVien" (
    "maTV" VARCHAR(10) NOT NULL,
    "maHD" VARCHAR(10) NOT NULL,
    "maKH" VARCHAR(10) NOT NULL,
    "maGiuong" VARCHAR(10) NOT NULL,
    "trangThai" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "ThanhVien_pkey" PRIMARY KEY ("maTV")
);

-- CreateTable
CREATE TABLE "DichVu" (
    "maDV" VARCHAR(10) NOT NULL,
    "tenDV" VARCHAR(100) NOT NULL,
    "donViTinh" VARCHAR(20) NOT NULL,
    "donGia" DECIMAL(12,0) NOT NULL,

    CONSTRAINT "DichVu_pkey" PRIMARY KEY ("maDV")
);

-- CreateTable
CREATE TABLE "PhieuThu" (
    "maPT" VARCHAR(10) NOT NULL,
    "maHD" VARCHAR(10) NOT NULL,
    "maNV" VARCHAR(10) NOT NULL,
    "ngayThu" DATE NOT NULL,
    "tongTien" DECIMAL(12,0) NOT NULL,
    "loaiThu" VARCHAR(30) NOT NULL,
    "ghiChu" TEXT,

    CONSTRAINT "PhieuThu_pkey" PRIMARY KEY ("maPT")
);

-- CreateTable
CREATE TABLE "ChiTietPhieuThu" (
    "maPT" VARCHAR(10) NOT NULL,
    "maDV" VARCHAR(10) NOT NULL,
    "soLuong" DECIMAL(10,2) NOT NULL,
    "donGia" DECIMAL(12,0) NOT NULL,
    "thanhTien" DECIMAL(12,0) NOT NULL,

    CONSTRAINT "ChiTietPhieuThu_pkey" PRIMARY KEY ("maPT","maDV")
);

-- CreateTable
CREATE TABLE "TaiSan" (
    "maTS" VARCHAR(10) NOT NULL,
    "tenTS" VARCHAR(100) NOT NULL,
    "loaiTS" VARCHAR(50) NOT NULL,
    "moTa" TEXT,

    CONSTRAINT "TaiSan_pkey" PRIMARY KEY ("maTS")
);

-- CreateTable
CREATE TABLE "BienBanBanGiao" (
    "maBBBG" VARCHAR(10) NOT NULL,
    "maHD" VARCHAR(10) NOT NULL,
    "maNV" VARCHAR(10) NOT NULL,
    "ngayBanGiao" DATE NOT NULL,
    "chiSoDienDau" DECIMAL(10,2) NOT NULL,
    "chiSoNuocDau" DECIMAL(10,2) NOT NULL,
    "ghiChu" TEXT,

    CONSTRAINT "BienBanBanGiao_pkey" PRIMARY KEY ("maBBBG")
);

-- CreateTable
CREATE TABLE "ChiTietBanGiao" (
    "maBBBG" VARCHAR(10) NOT NULL,
    "maTS" VARCHAR(10) NOT NULL,
    "maGiuong" VARCHAR(10) NOT NULL,
    "soLuong" INTEGER NOT NULL DEFAULT 1,
    "ghiChu" TEXT,

    CONSTRAINT "ChiTietBanGiao_pkey" PRIMARY KEY ("maBBBG","maTS","maGiuong")
);

-- CreateTable
CREATE TABLE "BienBanTraPhong" (
    "maBBTP" VARCHAR(10) NOT NULL,
    "maHD" VARCHAR(10) NOT NULL,
    "maNV" VARCHAR(10) NOT NULL,
    "ngayTra" DATE NOT NULL,
    "chiSoDienCuoi" DECIMAL(10,2) NOT NULL,
    "chiSoNuocCuoi" DECIMAL(10,2) NOT NULL,
    "trangThaiPhong" VARCHAR(50) NOT NULL,
    "ghiChu" TEXT,

    CONSTRAINT "BienBanTraPhong_pkey" PRIMARY KEY ("maBBTP")
);

-- CreateTable
CREATE TABLE "KhauTru" (
    "maKT" VARCHAR(10) NOT NULL,
    "maBBTP" VARCHAR(10) NOT NULL,
    "maTS" VARCHAR(10) NOT NULL,
    "soLuong" INTEGER NOT NULL DEFAULT 1,
    "chiPhiKhauTru" DECIMAL(12,0) NOT NULL,
    "ghiChu" TEXT,

    CONSTRAINT "KhauTru_pkey" PRIMARY KEY ("maKT")
);

-- CreateTable
CREATE TABLE "ThanhLyHD" (
    "maTLHD" VARCHAR(10) NOT NULL,
    "maBBTP" VARCHAR(10) NOT NULL,
    "maNV" VARCHAR(10) NOT NULL,
    "ngayThanhLy" DATE NOT NULL,
    "tienHoanCoc" DECIMAL(12,0) NOT NULL,
    "tienThuThem" DECIMAL(12,0) NOT NULL DEFAULT 0,
    "trangThai" VARCHAR(20) NOT NULL,

    CONSTRAINT "ThanhLyHD_pkey" PRIMARY KEY ("maTLHD")
);

-- CreateIndex
CREATE UNIQUE INDEX "TaiKhoan_tenDangNhap_key" ON "TaiKhoan"("tenDangNhap");

-- CreateIndex
CREATE UNIQUE INDEX "KhachHang_cccd_key" ON "KhachHang"("cccd");

-- AddForeignKey
ALTER TABLE "TaiKhoan" ADD CONSTRAINT "TaiKhoan_maNV_fkey" FOREIGN KEY ("maNV") REFERENCES "NhanVien"("maNV") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phong" ADD CONSTRAINT "Phong_maCN_fkey" FOREIGN KEY ("maCN") REFERENCES "ChiNhanh"("maCN") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phong" ADD CONSTRAINT "Phong_maLoai_fkey" FOREIGN KEY ("maLoai") REFERENCES "LoaiPhong"("maLoai") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Giuong" ADD CONSTRAINT "Giuong_maPhong_fkey" FOREIGN KEY ("maPhong") REFERENCES "Phong"("maPhong") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YeuCauThue" ADD CONSTRAINT "YeuCauThue_maKH_fkey" FOREIGN KEY ("maKH") REFERENCES "KhachHang"("maKH") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YeuCauThue" ADD CONSTRAINT "YeuCauThue_maNV_fkey" FOREIGN KEY ("maNV") REFERENCES "NhanVien"("maNV") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LichHen" ADD CONSTRAINT "LichHen_maYCT_fkey" FOREIGN KEY ("maYCT") REFERENCES "YeuCauThue"("maYCT") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhieuCoc" ADD CONSTRAINT "PhieuCoc_maKH_fkey" FOREIGN KEY ("maKH") REFERENCES "KhachHang"("maKH") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhieuCoc" ADD CONSTRAINT "PhieuCoc_maNV_fkey" FOREIGN KEY ("maNV") REFERENCES "NhanVien"("maNV") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhieuCoc" ADD CONSTRAINT "PhieuCoc_maCN_fkey" FOREIGN KEY ("maCN") REFERENCES "ChiNhanh"("maCN") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhieuCoc" ADD CONSTRAINT "PhieuCoc_maPhong_fkey" FOREIGN KEY ("maPhong") REFERENCES "Phong"("maPhong") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChiTietPhieuCoc" ADD CONSTRAINT "ChiTietPhieuCoc_maPC_fkey" FOREIGN KEY ("maPC") REFERENCES "PhieuCoc"("maPC") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChiTietPhieuCoc" ADD CONSTRAINT "ChiTietPhieuCoc_maGiuong_fkey" FOREIGN KEY ("maGiuong") REFERENCES "Giuong"("maGiuong") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HopDong" ADD CONSTRAINT "HopDong_maPC_fkey" FOREIGN KEY ("maPC") REFERENCES "PhieuCoc"("maPC") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HopDong" ADD CONSTRAINT "HopDong_maNV_fkey" FOREIGN KEY ("maNV") REFERENCES "NhanVien"("maNV") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThanhVien" ADD CONSTRAINT "ThanhVien_maHD_fkey" FOREIGN KEY ("maHD") REFERENCES "HopDong"("maHD") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThanhVien" ADD CONSTRAINT "ThanhVien_maKH_fkey" FOREIGN KEY ("maKH") REFERENCES "KhachHang"("maKH") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThanhVien" ADD CONSTRAINT "ThanhVien_maGiuong_fkey" FOREIGN KEY ("maGiuong") REFERENCES "Giuong"("maGiuong") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhieuThu" ADD CONSTRAINT "PhieuThu_maHD_fkey" FOREIGN KEY ("maHD") REFERENCES "HopDong"("maHD") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhieuThu" ADD CONSTRAINT "PhieuThu_maNV_fkey" FOREIGN KEY ("maNV") REFERENCES "NhanVien"("maNV") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChiTietPhieuThu" ADD CONSTRAINT "ChiTietPhieuThu_maPT_fkey" FOREIGN KEY ("maPT") REFERENCES "PhieuThu"("maPT") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChiTietPhieuThu" ADD CONSTRAINT "ChiTietPhieuThu_maDV_fkey" FOREIGN KEY ("maDV") REFERENCES "DichVu"("maDV") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BienBanBanGiao" ADD CONSTRAINT "BienBanBanGiao_maHD_fkey" FOREIGN KEY ("maHD") REFERENCES "HopDong"("maHD") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BienBanBanGiao" ADD CONSTRAINT "BienBanBanGiao_maNV_fkey" FOREIGN KEY ("maNV") REFERENCES "NhanVien"("maNV") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChiTietBanGiao" ADD CONSTRAINT "ChiTietBanGiao_maBBBG_fkey" FOREIGN KEY ("maBBBG") REFERENCES "BienBanBanGiao"("maBBBG") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChiTietBanGiao" ADD CONSTRAINT "ChiTietBanGiao_maTS_fkey" FOREIGN KEY ("maTS") REFERENCES "TaiSan"("maTS") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChiTietBanGiao" ADD CONSTRAINT "ChiTietBanGiao_maGiuong_fkey" FOREIGN KEY ("maGiuong") REFERENCES "Giuong"("maGiuong") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BienBanTraPhong" ADD CONSTRAINT "BienBanTraPhong_maHD_fkey" FOREIGN KEY ("maHD") REFERENCES "HopDong"("maHD") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BienBanTraPhong" ADD CONSTRAINT "BienBanTraPhong_maNV_fkey" FOREIGN KEY ("maNV") REFERENCES "NhanVien"("maNV") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KhauTru" ADD CONSTRAINT "KhauTru_maBBTP_fkey" FOREIGN KEY ("maBBTP") REFERENCES "BienBanTraPhong"("maBBTP") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KhauTru" ADD CONSTRAINT "KhauTru_maTS_fkey" FOREIGN KEY ("maTS") REFERENCES "TaiSan"("maTS") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThanhLyHD" ADD CONSTRAINT "ThanhLyHD_maBBTP_fkey" FOREIGN KEY ("maBBTP") REFERENCES "BienBanTraPhong"("maBBTP") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThanhLyHD" ADD CONSTRAINT "ThanhLyHD_maNV_fkey" FOREIGN KEY ("maNV") REFERENCES "NhanVien"("maNV") ON DELETE RESTRICT ON UPDATE CASCADE;
