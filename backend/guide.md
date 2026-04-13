# Hướng dẫn cài đặt Backend — HomeStay Dorm

## Yêu cầu

- Node.js >= 18
- npm >= 9
- Tài khoản Supabase (hỏi trưởng nhóm để lấy mật khẩu)

---

## Bước 1 — Cài dependencies

```bash
cd backend
npm install
```

---

## Bước 2 — Tạo file `.env`

```bash
cp .env_example .env
```

Mở file `.env` vừa tạo, thay `[YOUR-PASSWORD]` bằng mật khẩu Supabase của nhóm ở **cả 2 dòng** `DATABASE_URL` và `DIRECT_URL`.

> **Lưu ý:** Nếu mật khẩu có ký tự đặc biệt, phải encode trước khi dán vào URL:
> | Ký tự | Encode |
> |---|---|
> | `@` | `%40` |
> | `#` | `%23` |
> | `!` | `%21` |
> | `$` | `%24` |

---

## Bước 3 — Khởi tạo database

> Chỉ cần chạy **1 lần** khi setup lần đầu, hoặc khi cần reset sạch dữ liệu.

```bash
npx prisma generate       # tạo Prisma Client từ schema
npx prisma db push        # tạo các bảng trên Supabase
node src/db/seed.js       # nhét dữ liệu mẫu
node src/db/setup.js      # áp dụng triggers
```

Hoặc gộp lại bằng 1 lệnh (sẽ xóa sạch data cũ):

```bash
npm run db:reset
```

---

## Bước 4 — Khởi chạy server

```bash
npm run dev
```

Server chạy tại `http://localhost:5000`. Frontend gọi API qua `http://localhost:5000/api/...`

---

## Tài khoản mẫu để test

| Tên đăng nhập | Vai trò | Mật khẩu |
|---|---|---|
| `admin` | Admin | `123456` |
| `sale01` | Nhân viên sale | `123456` |
| `ketoan01` | Kế toán | `123456` |
| `quanly01` | Quản lý | `123456` |

---

## Tất cả scripts

| Script | Dùng khi nào |
|---|---|
| `npm run dev` | Phát triển hàng ngày |
| `npm run start` | Chạy production |
| `npm run db:generate` | Sau khi sửa `schema.prisma` |
| `npm run db:push` | Đồng bộ schema lên Supabase |
| `npm run db:seed` | Nhét lại dữ liệu mẫu |
| `npm run db:setup` | Áp dụng lại triggers |
| `npm run db:reset` | Reset toàn bộ DB (xóa sạch + seed lại) |
| `npm run db:studio` | Mở UI xem/sửa data trực quan |

---

## Cấu trúc thư mục

```
backend/
├── src/
│   ├── server.js          # Entry point
│   ├── app/               # Khởi tạo Express app
│   ├── routes/            # Định nghĩa API routes
│   ├── controllers/       # Xử lý logic từng route
│   ├── middlewares/       # Auth, error handler...
│   └── db/
│       ├── prisma/
│       │   └── schema.prisma   # Định nghĩa 22 bảng
│       ├── seed.js             # Dữ liệu mẫu
│       ├── setup.js            # Triggers
│       └── db.md               # Tài liệu database chi tiết
├── .env_example           # Mẫu biến môi trường
├── .env                   # Biến môi trường thật (không commit)
├── .gitignore
├── guide.md               # File này
└── package.json
```

> Xem thêm tài liệu database chi tiết tại [src/db/db.md](src/db/db.md)
