-- ============================================================
-- ScriptDB_3.sql
-- Tong hop schema PostgreSQL va triggers cho HomeStay App.
-- ============================================================

-- ============================================================
-- 1. SCHEMA: TABLES, INDEXES, FOREIGN KEYS
-- ============================================================
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
    "maPhong" VARCHAR(10),
    "maGiuong" VARCHAR(10),
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

-- CreateIndex
CREATE INDEX "Phong_maCN_idx" ON "Phong"("maCN");

-- CreateIndex
CREATE INDEX "Phong_trangThai_idx" ON "Phong"("trangThai");

-- CreateIndex
CREATE INDEX "Phong_maCN_trangThai_idx" ON "Phong"("maCN", "trangThai");

-- CreateIndex
CREATE INDEX "Giuong_maPhong_idx" ON "Giuong"("maPhong");

-- CreateIndex
CREATE INDEX "Giuong_trangThai_idx" ON "Giuong"("trangThai");

-- CreateIndex
CREATE INDEX "Giuong_maPhong_trangThai_idx" ON "Giuong"("maPhong", "trangThai");

-- CreateIndex
CREATE INDEX "YeuCauThue_trangThai_idx" ON "YeuCauThue"("trangThai");

-- CreateIndex
CREATE INDEX "YeuCauThue_maKH_idx" ON "YeuCauThue"("maKH");

-- CreateIndex
CREATE INDEX "YeuCauThue_maNV_idx" ON "YeuCauThue"("maNV");

-- CreateIndex
CREATE INDEX "LichHen_maPhong_idx" ON "LichHen"("maPhong");

-- CreateIndex
CREATE INDEX "LichHen_maGiuong_idx" ON "LichHen"("maGiuong");

-- CreateIndex
CREATE INDEX "PhieuCoc_trangThai_idx" ON "PhieuCoc"("trangThai");

-- CreateIndex
CREATE INDEX "PhieuCoc_ngayCoc_idx" ON "PhieuCoc"("ngayCoc");

-- CreateIndex
CREATE INDEX "PhieuCoc_trangThai_ngayCoc_idx" ON "PhieuCoc"("trangThai", "ngayCoc");

-- CreateIndex
CREATE INDEX "PhieuCoc_maPhong_idx" ON "PhieuCoc"("maPhong");

-- CreateIndex
CREATE INDEX "PhieuCoc_maKH_idx" ON "PhieuCoc"("maKH");

-- CreateIndex
CREATE INDEX "PhieuCoc_maCN_idx" ON "PhieuCoc"("maCN");

-- CreateIndex
CREATE INDEX "PhieuCoc_maNV_idx" ON "PhieuCoc"("maNV");

-- CreateIndex
CREATE INDEX "ChiTietPhieuCoc_maGiuong_idx" ON "ChiTietPhieuCoc"("maGiuong");

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
ALTER TABLE "LichHen" ADD CONSTRAINT "LichHen_maPhong_fkey" FOREIGN KEY ("maPhong") REFERENCES "Phong"("maPhong") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LichHen" ADD CONSTRAINT "LichHen_maGiuong_fkey" FOREIGN KEY ("maGiuong") REFERENCES "Giuong"("maGiuong") ON DELETE SET NULL ON UPDATE CASCADE;

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

-- ============================================================
-- 2. FUNCTIONS AND TRIGGERS
-- ============================================================
-- ============================================================
-- TRIGGERS - HomeStay Dorm
-- ============================================================

-- ─── 1. Phiếu cọc được thanh toán → giường chuyển sang 'DaCoc' ───────────────
CREATE OR REPLACE FUNCTION fn_cap_nhat_giuong_khi_coc()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW."trangThai" = 'DaDuyet' AND OLD."trangThai" != 'DaDuyet' THEN
    -- Cập nhật các giường trong phiếu cọc → DaCoc
    UPDATE "Giuong" g
    SET "trangThai" = 'DaCoc'
    FROM "ChiTietPhieuCoc" ct
    WHERE ct."maPC" = NEW."maPC"
      AND ct."maGiuong" = g."maGiuong";

    -- Cập nhật trạng thái phòng → DaCoc (nếu chưa DaThue)
    UPDATE "Phong" p
    SET "trangThai" = 'DaCoc'
    WHERE p."maPhong" IN (
      SELECT g."maPhong"
      FROM "Giuong" g
      JOIN "ChiTietPhieuCoc" ct ON ct."maGiuong" = g."maGiuong"
      WHERE ct."maPC" = NEW."maPC"
    )
    AND p."trangThai" = 'Trong';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_cap_nhat_giuong_khi_coc ON "PhieuCoc";
CREATE TRIGGER trg_cap_nhat_giuong_khi_coc
AFTER UPDATE ON "PhieuCoc"
FOR EACH ROW
EXECUTE FUNCTION fn_cap_nhat_giuong_khi_coc();


-- ─── 2. Phiếu cọc bị hủy → reset giường về 'Trong' ──────────────────────────
CREATE OR REPLACE FUNCTION fn_reset_giuong_khi_huy_coc()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW."trangThai" = 'DaHuy'
     AND OLD."trangThai" != 'DaHuy' THEN

    UPDATE "Giuong" g
    SET "trangThai" = 'Trong'
    FROM "ChiTietPhieuCoc" ct
    WHERE ct."maPC" = NEW."maPC"
      AND ct."maGiuong" = g."maGiuong"
      AND g."trangThai" = 'DaCoc';

    -- Reset phòng về Trong nếu tất cả giường đều trống
    UPDATE "Phong" p
    SET "trangThai" = 'Trong'
    WHERE p."maPhong" IN (
      SELECT g."maPhong"
      FROM "Giuong" g
      JOIN "ChiTietPhieuCoc" ct ON ct."maGiuong" = g."maGiuong"
      WHERE ct."maPC" = NEW."maPC"
    )
    AND NOT EXISTS (
      SELECT 1 FROM "Giuong" g2
      WHERE g2."maPhong" = p."maPhong"
        AND g2."trangThai" != 'Trong'
    );

    -- Room deposits may point directly to PhieuCoc.maPhong.
    IF NEW."maPhong" IS NOT NULL THEN
      UPDATE "Phong" p
      SET "trangThai" = 'Trong'
      WHERE p."maPhong" = NEW."maPhong"
      AND NOT EXISTS (
        SELECT 1 FROM "Giuong" g2
        WHERE g2."maPhong" = p."maPhong"
          AND g2."trangThai" != 'Trong'
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_reset_giuong_khi_huy_coc ON "PhieuCoc";
CREATE TRIGGER trg_reset_giuong_khi_huy_coc
AFTER UPDATE ON "PhieuCoc"
FOR EACH ROW
EXECUTE FUNCTION fn_reset_giuong_khi_huy_coc();


-- ─── 3. Thêm thành viên (nhận phòng) → giường chuyển sang 'DaThue' ───────────
CREATE OR REPLACE FUNCTION fn_cap_nhat_giuong_khi_nhan_phong()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE "Giuong"
  SET "trangThai" = 'DaThue'
  WHERE "maGiuong" = NEW."maGiuong";

  -- Nếu tất cả giường trong phòng đều DaThue → phòng chuyển DaThue
  UPDATE "Phong" p
  SET "trangThai" = 'DaThue'
  WHERE p."maPhong" = (
    SELECT "maPhong" FROM "Giuong" WHERE "maGiuong" = NEW."maGiuong"
  )
  AND NOT EXISTS (
    SELECT 1 FROM "Giuong" g
    WHERE g."maPhong" = p."maPhong"
      AND g."trangThai" != 'DaThue'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_cap_nhat_giuong_khi_nhan_phong ON "ThanhVien";
CREATE TRIGGER trg_cap_nhat_giuong_khi_nhan_phong
AFTER INSERT ON "ThanhVien"
FOR EACH ROW
EXECUTE FUNCTION fn_cap_nhat_giuong_khi_nhan_phong();


-- ─── 4. Thanh lý hợp đồng → reset giường, phòng, hợp đồng ───────────────────
CREATE OR REPLACE FUNCTION fn_reset_phong_khi_thanh_ly()
RETURNS TRIGGER AS $$
DECLARE
  v_maHD TEXT;
BEGIN
  IF NEW."trangThai" = 'HoanTat' THEN
    -- Lấy maHD từ biên bản trả phòng
    SELECT "maHD" INTO v_maHD
    FROM "BienBanTraPhong"
    WHERE "maBBTP" = NEW."maBBTP";

    -- Reset giường về Trong
    UPDATE "Giuong" g
    SET "trangThai" = 'Trong'
    FROM "ThanhVien" tv
    WHERE tv."maHD" = v_maHD
      AND tv."maGiuong" = g."maGiuong";

    -- Cập nhật hợp đồng → DaThanhLy
    UPDATE "HopDong"
    SET "trangThai" = 'DaThanhLy'
    WHERE "maHD" = v_maHD;

    -- Cập nhật thành viên → không còn ở (trangThai = 0)
    UPDATE "ThanhVien"
    SET "trangThai" = 0
    WHERE "maHD" = v_maHD;

    -- Reset phòng về Trong nếu tất cả giường trống
    UPDATE "Phong" p
    SET "trangThai" = 'Trong'
    WHERE p."maPhong" IN (
      SELECT DISTINCT g."maPhong"
      FROM "Giuong" g
      JOIN "ThanhVien" tv ON tv."maGiuong" = g."maGiuong"
      WHERE tv."maHD" = v_maHD
    )
    AND NOT EXISTS (
      SELECT 1 FROM "Giuong" g2
      WHERE g2."maPhong" = p."maPhong"
        AND g2."trangThai" != 'Trong'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_reset_phong_khi_thanh_ly ON "ThanhLyHD";
CREATE TRIGGER trg_reset_phong_khi_thanh_ly
AFTER INSERT ON "ThanhLyHD"
FOR EACH ROW
EXECUTE FUNCTION fn_reset_phong_khi_thanh_ly();


-- ─── 5. Tự động hủy phiếu cọc quá hạn 24h (pg_cron - chạy mỗi 15 phút) ─────
-- Bật extension pg_cron nếu chưa có (cần quyền superuser trên Supabase)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Hàm xử lý hủy cọc quá hạn
CREATE OR REPLACE FUNCTION fn_tu_dong_huy_coc_qua_han()
RETURNS void AS $$
BEGIN
  -- Đánh dấu hủy các phiếu cọc quá hạn
  UPDATE "PhieuCoc"
  SET "trangThai" = 'DaHuy'
  WHERE "trangThai" = 'ChoDuyet'
    AND "hanThanhToan" < NOW();
END;
$$ LANGUAGE plpgsql;

-- Đăng ký cron job (chạy mỗi 15 phút)
-- Lưu ý: Chạy lệnh này trực tiếp trong Supabase SQL Editor với quyền superuser
-- SELECT cron.schedule('huy-coc-qua-han', '*/15 * * * *', 'SELECT fn_tu_dong_huy_coc_qua_han()');
