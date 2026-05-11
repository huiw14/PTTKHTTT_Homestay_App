# HomeStay — Hệ thống quản lý ký túc xá

HomeStay là một hệ thống quản lý ký túc xá / homestay dùng cho demo nghiệp vụ (đặt cọc, lập hợp đồng, thu tiền, bàn giao, trả phòng). Dự án gồm hai phần chính:

- `backend/`: API server bằng Node.js + Express, dùng Prisma ORM và cơ sở dữ liệu PostgreSQL.
- `frontend/`: SPA bằng React + TypeScript, khởi tạo bằng Vite, sử dụng Tailwind CSS và thành phần UI từ shadcn/ui.

Mục tiêu: cung cấp bộ module cho luồng nghiệp vụ từ đặt cọc → lập hợp đồng → thu tiền kỳ đầu → bàn giao phòng → trả phòng.

## Nền tảng & công nghệ

- Frontend: React, TypeScript, Vite, Tailwind CSS, shadcn/ui.
- Backend: Node.js, Express, Prisma (Prisma Client).
- Database: PostgreSQL (được cấu hình qua `backend/prisma/schema.prisma`).
- Kiến trúc: monorepo nhẹ với thư mục `backend/` và `frontend/`.

## Cấu trúc dự án (tóm tắt)

- `backend/` — mã nguồn API, Prisma schema, seed và migration.
- `frontend/` — mã React, các trang/Module (Module1..Module5), thành phần UI và mock data.
- `README.md`, `BACKEND_SETUP.md` — hướng dẫn cài đặt bổ sung.

## Thiết lập nhanh (development)

Yêu cầu: Node.js >= 18, npm, PostgreSQL.

1) Chuẩn bị biến môi trường

- Tạo file `.env` trong `backend/` với biến chính:

```
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/<db_name>?schema=public
```

- (Tuỳ chọn) Trong `frontend/`, `.env` có thể chứa:

```
VITE_API_BASE_URL=http://localhost:5000
```

2) Cài đặt và khởi chạy Backend

```
cd backend
npm install
npx prisma generate
# Nếu cần tạo/migrate schema (chạy migration có trong repo):
npx prisma migrate dev --name init
# (tuỳ repo) hoặc áp dụng migration đã có
npm run dev
```

Server backend mặc định lắng nghe ở `http://localhost:5000` (kiểm tra `backend/package.json` scripts).

3) Cài đặt và khởi chạy Frontend

```
cd frontend
npm install
npm run dev
```

Truy cập giao diện tại `http://localhost:5173` (Vite mặc định).

## Database & seed

- Schema Prisma dùng PostgreSQL (xem `backend/prisma/schema.prisma`).
- Repo có file seed trong `backend/src/db/seed.js` — sau khi `prisma migrate` có thể chạy seed (nếu script được cấu hình):

```
npm run seed
```

## Lưu ý khi phát triển

- API yêu cầu header `x-user-id` và `x-user-role` cho kiểm soát quyền; frontend sử dụng helper `getAuthHeaders()` để lấy giá trị mẫu từ `localStorage`.
- Một số module có dữ liệu mock (xem `frontend/src/app/data/mockData.ts`) để phát triển giao diện khi backend chưa hoàn tất.

## Chạy test (nếu có)

- Frontend uses Vitest (xem `frontend/vitest.config.ts`). Chạy:

```
cd frontend
npm run test
```
