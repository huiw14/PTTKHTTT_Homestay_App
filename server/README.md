# Hướng dẫn kết nối Database và chạy Backend
---

## 1. Thiết lập SQL Server
### Bước 1.1 — Chạy Script Database

1. Mở **SQL Server Management Studio (SSMS)**.
2. Mở file `ScriptDB_03.sql` trong repo.
3. Nhấn **Execute** để tạo Database `HomeStayPro`.

---

### Bước 1.2 — Cấu hình Port 1433

1. Mở ứng dụng **SQL Server Configuration Manager**.
2. Điều hướng đến: **SQL Server Network Configuration** → **Protocols for MSSQLSERVER** (hoặc `SQLEXPRESS`).
3. Chuột phải vào **TCP/IP** → chọn **Enable**.
4. Chuột phải vào **TCP/IP** → chọn **Properties** → chuyển sang tab **IP Addresses**:
   - Kéo xuống cuối cùng, tìm mục **IPAll**.
   - Xóa trắng ô **TCP Dynamic Ports**.
   - Điền chính xác giá trị `1433` vào ô **TCP Port**.
5. Nhấn **OK**.
6. Vào mục **SQL Server Services** → **Restart** lại dịch vụ SQL Server để áp dụng thay đổi.

---

## 2. Cấu hình Backend

### Bước 2.1 — Cài đặt thư viện

Mở Terminal tại thư mục `server/` và chạy:

```bash
npm install
```

---

### Bước 2.2 — Thiết lập file `.env`

Tạo file `.env` bên trong thư mục `server/` và dán nội dung sau:

```env
DATABASE_URL="sqlserver://localhost:1433;database=HomeStayPro;integratedSecurity=true;trustServerCertificate=true;encrypt=true;"
```

---

### Bước 2.3 — Đồng bộ Prisma

Chạy lệnh sau để code Node.js nhận diện được các bảng trong SQL Server:

```bash
npx prisma generate
```

---

## 3. Khởi chạy hệ thống

Sau khi hoàn tất tất cả các bước trên, khởi động Backend bằng lệnh:

```bash
npm run dev
```

**Dấu hiệu thành công:** Terminal hiển thị dòng:

```
[Server]: Hệ thống Backend đang chạy tại http://localhost:5000
```