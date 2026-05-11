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
