import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const statements = [
  // ─── 1. Phiếu cọc thanh toán → giường DaCoc ────────────────────────────────
  `CREATE OR REPLACE FUNCTION fn_cap_nhat_giuong_khi_coc()
   RETURNS TRIGGER AS $$
   BEGIN
     IF NEW."trangThai" = 'DaDuyet' AND OLD."trangThai" != 'DaDuyet' THEN
       UPDATE "Giuong" g
       SET "trangThai" = 'DaCoc'
       FROM "ChiTietPhieuCoc" ct
       WHERE ct."maPC" = NEW."maPC" AND ct."maGiuong" = g."maGiuong";

       UPDATE "Phong" p
       SET "trangThai" = 'DaCoc'
       WHERE p."maPhong" IN (
         SELECT g."maPhong" FROM "Giuong" g
         JOIN "ChiTietPhieuCoc" ct ON ct."maGiuong" = g."maGiuong"
         WHERE ct."maPC" = NEW."maPC"
       ) AND p."trangThai" = 'Trong';
     END IF;
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql`,

  `DROP TRIGGER IF EXISTS trg_cap_nhat_giuong_khi_coc ON "PhieuCoc"`,

  `CREATE TRIGGER trg_cap_nhat_giuong_khi_coc
   AFTER UPDATE ON "PhieuCoc"
   FOR EACH ROW EXECUTE FUNCTION fn_cap_nhat_giuong_khi_coc()`,

  // ─── 2. Phiếu cọc bị hủy → reset giường Trong ──────────────────────────────
  `CREATE OR REPLACE FUNCTION fn_reset_giuong_khi_huy_coc()
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

       UPDATE "Phong" p
       SET "trangThai" = 'Trong'
       WHERE p."maPhong" IN (
         SELECT g."maPhong" FROM "Giuong" g
         JOIN "ChiTietPhieuCoc" ct ON ct."maGiuong" = g."maGiuong"
         WHERE ct."maPC" = NEW."maPC"
       )
       AND NOT EXISTS (
         SELECT 1 FROM "Giuong" g2
         WHERE g2."maPhong" = p."maPhong" AND g2."trangThai" != 'Trong'
       );

       -- Also handle room deposit: reset phong directly linked via maPhong
       IF NEW."maPhong" IS NOT NULL THEN
         UPDATE "Phong" p
         SET "trangThai" = 'Trong'
         WHERE p."maPhong" = NEW."maPhong"
         AND NOT EXISTS (
           SELECT 1 FROM "Giuong" g2
           WHERE g2."maPhong" = p."maPhong" AND g2."trangThai" != 'Trong'
         );
       END IF;
     END IF;
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql`,

  `DROP TRIGGER IF EXISTS trg_reset_giuong_khi_huy_coc ON "PhieuCoc"`,

  `CREATE TRIGGER trg_reset_giuong_khi_huy_coc
   AFTER UPDATE ON "PhieuCoc"
   FOR EACH ROW EXECUTE FUNCTION fn_reset_giuong_khi_huy_coc()`,

  // ─── 3. Thêm thành viên → giường DaThue ────────────────────────────────────
  `CREATE OR REPLACE FUNCTION fn_cap_nhat_giuong_khi_nhan_phong()
   RETURNS TRIGGER AS $$
   BEGIN
     UPDATE "Giuong" SET "trangThai" = 'DaThue'
     WHERE "maGiuong" = NEW."maGiuong";

     UPDATE "Phong" p SET "trangThai" = 'DaThue'
     WHERE p."maPhong" = (
       SELECT "maPhong" FROM "Giuong" WHERE "maGiuong" = NEW."maGiuong"
     )
     AND NOT EXISTS (
       SELECT 1 FROM "Giuong" g
       WHERE g."maPhong" = p."maPhong" AND g."trangThai" != 'DaThue'
     );
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql`,

  `DROP TRIGGER IF EXISTS trg_cap_nhat_giuong_khi_nhan_phong ON "ThanhVien"`,

  `CREATE TRIGGER trg_cap_nhat_giuong_khi_nhan_phong
   AFTER INSERT ON "ThanhVien"
   FOR EACH ROW EXECUTE FUNCTION fn_cap_nhat_giuong_khi_nhan_phong()`,

  // ─── 4. Thanh lý hợp đồng → reset tất cả ───────────────────────────────────
  `CREATE OR REPLACE FUNCTION fn_reset_phong_khi_thanh_ly()
   RETURNS TRIGGER AS $$
   DECLARE v_maHD TEXT;
   BEGIN
     IF NEW."trangThai" = 'HoanTat' THEN
       SELECT "maHD" INTO v_maHD
       FROM "BienBanTraPhong" WHERE "maBBTP" = NEW."maBBTP";

       UPDATE "Giuong" g SET "trangThai" = 'Trong'
       FROM "ThanhVien" tv
       WHERE tv."maHD" = v_maHD AND tv."maGiuong" = g."maGiuong";

       UPDATE "HopDong" SET "trangThai" = 'DaThanhLy'
       WHERE "maHD" = v_maHD;

       UPDATE "ThanhVien" SET "trangThai" = 0
       WHERE "maHD" = v_maHD;

       UPDATE "Phong" p SET "trangThai" = 'Trong'
       WHERE p."maPhong" IN (
         SELECT DISTINCT g."maPhong" FROM "Giuong" g
         JOIN "ThanhVien" tv ON tv."maGiuong" = g."maGiuong"
         WHERE tv."maHD" = v_maHD
       )
       AND NOT EXISTS (
         SELECT 1 FROM "Giuong" g2
         WHERE g2."maPhong" = p."maPhong" AND g2."trangThai" != 'Trong'
       );
     END IF;
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql`,

  `DROP TRIGGER IF EXISTS trg_reset_phong_khi_thanh_ly ON "ThanhLyHD"`,

  `CREATE TRIGGER trg_reset_phong_khi_thanh_ly
   AFTER INSERT ON "ThanhLyHD"
   FOR EACH ROW EXECUTE FUNCTION fn_reset_phong_khi_thanh_ly()`,

  // ─── 5. Hàm tự động hủy phiếu cọc quá hạn ──────────────────────────────────
  `CREATE OR REPLACE FUNCTION fn_tu_dong_huy_coc_qua_han()
   RETURNS void AS $$
   BEGIN
     UPDATE "PhieuCoc"
     SET "trangThai" = 'DaHuy'
     WHERE "trangThai" = 'ChoDuyet'
       AND "hanThanhToan" < NOW();
   END;
   $$ LANGUAGE plpgsql`,
];

async function main() {
  console.log("⚙️  Đang áp dụng triggers...");

  for (const sql of statements) {
    try {
      await prisma.$executeRawUnsafe(sql);
    } catch (err) {
      console.warn("  ⚠️ ", err.message.split("\n")[0]);
    }
  }

  console.log("✅ Triggers đã được áp dụng thành công!");
  console.log("─────────────────────────────────────────────");
  console.log("  trg_cap_nhat_giuong_khi_coc     (PhieuCoc → DaDuyet)");
  console.log("  trg_reset_giuong_khi_huy_coc    (PhieuCoc → DaHuy)");
  console.log("  trg_cap_nhat_giuong_khi_nhan_phong (ThanhVien INSERT)");
  console.log("  trg_reset_phong_khi_thanh_ly    (ThanhLyHD INSERT)");
  console.log("  fn_tu_dong_huy_coc_qua_han      (gọi thủ công hoặc pg_cron)");
}

main()
  .catch((e) => {
    console.error("❌ Setup thất bại:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
