# Cơ sở dữ liệu — HomeStay Dorm

Tài liệu mô tả cấu trúc database, cách khởi động, và luồng dữ liệu của hệ thống **HomeStay Dorm** — ứng dụng quản lý ký túc xá tư nhân.

---

## Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Database | PostgreSQL (Supabase) |
| ORM | Prisma v6 |
| Runtime | Node.js (ESM) |

---

## Cài đặt lần đầu

### 1. Tạo file `.env`

Copy file mẫu và điền mật khẩu Supabase của bạn vào:

```bash
cp .env_example .env
```

Nội dung file `.env`:

```env
# Kết nối qua connection pooling (dùng cho query thông thường)
DATABASE_URL="postgresql://postgres.<project-ref>:[PASSWORD]@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Kết nối trực tiếp (dùng cho prisma db push)
DIRECT_URL="postgresql://postgres.<project-ref>:[PASSWORD]@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres"
```

> Lưu ý: Nếu mật khẩu có ký tự đặc biệt (ví dụ `@`), hãy encode lại — `@` → `%40`

### 2. Chạy lần đầu

```bash
cd backend
npm install
npx prisma generate     # tạo Prisma Client
npx prisma db push      # tạo các bảng trên Supabase
node db/seed.js         # nhét dữ liệu mẫu
node db/setup.js        # áp dụng triggers
```

Hoặc dùng script tổng hợp (reset + seed + trigger):

```bash
npm run db:reset
```

---

## Cấu trúc thư mục

```
backend/
├── prisma/
│   └── schema.prisma     # Định nghĩa toàn bộ 22 bảng
├── db/
│   ├── seed.js           # Dữ liệu mẫu (chạy 1 lần)
│   ├── setup.js          # Áp dụng triggers lên Supabase
│   ├── triggers.sql      # SQL thuần của các trigger (tham khảo)
│   └── db.md             # File này
└── .env_example          # Mẫu biến môi trường
```

---

## Sơ đồ các bảng

Hệ thống gồm **22 bảng**, chia thành 6 nhóm theo nghiệp vụ:

### Nhóm 1 — Hệ thống & Nhân sự

| Bảng | Mô tả |
|---|---|
| `NhanVien` | Thông tin nhân viên (sale, quản lý, kế toán, admin) |
| `TaiKhoan` | Tài khoản đăng nhập, liên kết với nhân viên |
| `ChiNhanh` | Các chi nhánh/cơ sở của ký túc xá |

### Nhóm 2 — Khách hàng & Phòng

| Bảng | Mô tả |
|---|---|
| `KhachHang` | Thông tin khách thuê (CCCD, SĐT, email, quốc tịch) |
| `LoaiPhong` | Phân loại phòng: đơn, đôi, ở ghép |
| `Phong` | Danh sách phòng, giá thuê, giới tính, sức chứa |
| `Giuong` | Từng giường trong phòng, trạng thái hiện tại |

### Nhóm 3 — Đăng ký & Lịch hẹn

| Bảng | Mô tả |
|---|---|
| `YeuCauThue` | Yêu cầu thuê của khách: khu vực, loại phòng, ngày vào |
| `LichHen` | Lịch xem phòng giữa khách và nhân viên sale |

### Nhóm 4 — Đặt cọc

| Bảng | Mô tả |
|---|---|
| `PhieuCoc` | Phiếu đặt cọc, tiền cọc, hạn thanh toán 24h |
| `ChiTietPhieuCoc` | Giường được đặt cọc trong từng phiếu |

> Công thức: **Tiền cọc = Giá thuê/giường × 2 tháng × Số giường thuê**

### Nhóm 5 — Hợp đồng & Thanh toán

| Bảng | Mô tả |
|---|---|
| `HopDong` | Hợp đồng thuê, ngày bắt đầu/kết thúc, kỳ thanh toán |
| `ThanhVien` | Danh sách người ở thực tế, mỗi người gắn với 1 giường |
| `DichVu` | Bảng giá dịch vụ: điện, nước, wifi, gửi xe |
| `PhieuThu` | Phiếu thu tiền theo kỳ |
| `ChiTietPhieuThu` | Chi tiết từng dịch vụ trong phiếu thu |

### Nhóm 6 — Bàn giao & Trả phòng

| Bảng | Mô tả |
|---|---|
| `TaiSan` | Tài sản trong phòng: giường, nệm, thẻ từ, điều hoà |
| `BienBanBanGiao` | Biên bản nhận phòng: chỉ số điện/nước đầu vào |
| `ChiTietBanGiao` | Tài sản bàn giao cho từng giường |
| `BienBanTraPhong` | Biên bản trả phòng: chỉ số điện/nước cuối kỳ |
| `KhauTru` | Các khoản khấu trừ từ tiền cọc khi trả phòng |
| `ThanhLyHD` | Thanh lý hợp đồng, số tiền hoàn cọc hoặc thu thêm |

---

## Luồng nghiệp vụ chính

```
[Khách liên hệ]
      │
      ▼
[YeuCauThue] ──► [LichHen] ──► Xem phòng
      │
      ▼
[PhieuCoc] ──► Thanh toán trong 24h ──► [ChiTietPhieuCoc]
      │                  │
      │           Quá hạn → TuDongHuy (trigger tự reset giường)
      ▼
[HopDong] ──► [ThanhVien] ──► [PhieuThu] (thu tiền hàng kỳ)
      │
      ▼
[BienBanBanGiao] ──► Ghi nhận tài sản + chỉ số điện/nước
      │
      ▼
[BienBanTraPhong] ──► Kiểm tra hiện trạng
      │
      ▼
[KhauTru] ──► Tính toán khấu trừ
      │
      ▼
[ThanhLyHD] ──► Hoàn cọc / Thu thêm ──► Reset phòng về Trống
```

---

## Quy tắc hoàn cọc

| Trường hợp | Tỷ lệ hoàn |
|---|---|
| Đặt cọc nhưng chưa ký hợp đồng | 80% |
| Đã ký HĐ, lưu trú dưới 6 tháng | 50% |
| Đã ký HĐ, lưu trú trên 6 tháng | 70% |
| Hết hạn hợp đồng bình thường | 100% |

Số tiền thực hoàn = Tiền cọc × Tỷ lệ − Các khoản khấu trừ phát sinh

---

## Triggers tự động

Các trigger chạy ngầm trên Supabase, đảm bảo dữ liệu luôn nhất quán:

| Trigger | Khi nào chạy | Làm gì |
|---|---|---|
| `trg_cap_nhat_giuong_khi_coc` | Phiếu cọc → `DaThanhToan` | Giường/phòng chuyển `DaCoc` |
| `trg_reset_giuong_khi_huy_coc` | Phiếu cọc → `TuDongHuy` / `HuyThuCong` | Giường/phòng reset về `Trong` |
| `trg_cap_nhat_giuong_khi_nhan_phong` | INSERT vào `ThanhVien` | Giường chuyển `DaThue` |
| `trg_reset_phong_khi_thanh_ly` | INSERT vào `ThanhLyHD` | Reset giường, phòng, hợp đồng |

Hàm `fn_tu_dong_huy_coc_qua_han()` cần được lên lịch qua **pg_cron** trên Supabase SQL Editor:

```sql
SELECT cron.schedule(
  'huy-coc-qua-han',
  '*/15 * * * *',
  'SELECT fn_tu_dong_huy_coc_qua_han()'
);
```

---

## Dữ liệu mẫu (sau khi seed)

| Loại | Số lượng |
|---|---|
| Chi nhánh | 2 (Quận 5, Bình Thạnh) |
| Nhân viên | 5 (1 admin, 2 sale, 1 kế toán, 1 quản lý) |
| Phòng | 6 phòng / 19 giường |
| Khách hàng | 8 |
| Hợp đồng đang hiệu lực | 3 |

Tài khoản mặc định để đăng nhập thử:

| Tên đăng nhập | Vai trò | Mật khẩu |
|---|---|---|
| `admin` | Admin | `123456` |
| `sale01` | Nhân viên sale | `123456` |
| `ketoan01` | Kế toán | `123456` |
| `quanly01` | Quản lý | `123456` |

---

## Scripts

```bash
npm run dev           # Khởi động backend dev server
npm run db:generate   # Generate Prisma Client
npm run db:push       # Đồng bộ schema lên Supabase
npm run db:seed       # Chạy dữ liệu mẫu
npm run db:setup      # Áp dụng triggers
npm run db:reset      # Reset toàn bộ DB + seed + trigger
npm run db:studio     # Mở Prisma Studio (xem/sửa data trực quan)
```
