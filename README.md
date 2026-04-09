# Hệ thống Quản lý Ký túc xá - HomeStay Pro

Tài liệu hướng dẫn và quy định làm việc dành cho nhóm phát triển dự án PTTKHTTT. Yêu cầu toàn bộ thành viên đọc kỹ trước khi bắt đầu viết code.

## 1. Hướng dẫn cài đặt và khởi chạy dự án

Dự án sử dụng React, Vite, Tailwind CSS v4 và shadcn/ui.

Sau khi clone source code về máy, mở Terminal tại thư mục dự án và chạy các lệnh sau:

**Bước 1: Cài đặt các thư viện cần thiết (Chỉ cần chạy lần đầu hoặc khi có thư viện mới)**
```bash
npm install
```

**Bước 2: Khởi chạy Server ở môi trường phát triển (Local)**
```bash
npm run dev
```
Truy cập vào đường dẫn `http://localhost:5173` trên trình duyệt để xem giao diện.

## 2. Quy định làm việc nhóm

Để tránh xung đột mã nguồn (conflict code) và giữ cho giao diện đồng nhất, toàn bộ thành viên phải tuân theo 3 luật sau:

### Luật phân nhánh Git (Branching Rule)
* **Tuyệt đối không viết code và push trực tiếp lên nhánh `main`.**
* Mỗi thành viên khi làm việc phải tạo một nhánh mới từ nhánh `main` theo cú pháp: `feature/<tên-module>-<tên-người>`.
  * *Ví dụ: `feature/module2-vinh`, `feature/module3-khoi`.*
* Khi hoàn thành tính năng, đẩy nhánh của mình lên GitHub và tạo Pull Request để review.

### Luật sử dụng UI Component
* Hệ thống đã được cài đặt sẵn 99% các thành phần giao diện chuẩn trong thư mục `src/app/components/ui/` (bao gồm Button, Input, Table, Dialog, Card, Checkbox...).
* **Cấm tự ý code bằng thẻ HTML thuần** (như `<button>`, `<input>`, `<table>`...) hoặc tự viết CSS riêng biệt cho các thành phần cơ bản. Phải import các component có sẵn ra để sử dụng nhằm đảm bảo toàn bộ giao diện đồng nhất 100%.

### Luật sử dụng Dữ liệu mẫu (Mock Data)
* Toàn bộ dữ liệu dùng để test giao diện (Bảng, Form, Biểu đồ) phải được lấy từ kho dữ liệu chung là file `src/app/data/mockData.ts`.
* Cấm tự tạo biến dữ liệu giả rải rác bên trong component của cá nhân. Nếu thiếu trường dữ liệu, hãy thông báo để bổ sung vào file chung.

---

## 3. Phân công nhiệm vụ chi tiết

### Thành viên 1: Thành Minh
**Phụ trách:** Core UI, Routing & Module 1 (Quản trị hệ thống).
**File làm việc chính:** `App.tsx`, `routes.tsx`, `Layout.tsx`, `Dashboard.tsx`, `Module1.tsx` và `mockData.ts`.
* **Core UI & Setup:** Xây dựng khung giao diện `Layout.tsx` (Sidebar, Topbar động). Quản lý hệ thống Router và cung cấp dữ liệu giả (`mockData.ts`).
* **Dashboard:** Sử dụng thư viện `recharts` để vẽ biểu đồ doanh thu, thống kê phòng.
* **Đăng nhập (UC01):** Hoàn thiện file `Login.tsx`, luồng xác thực giả lập và lưu thông tin người dùng (token/role).
* **Module 1 (Quản trị):** Xây dựng giao diện danh sách, Modal/Sheet thêm/sửa/xóa cho các danh mục: Tài khoản (UC02), Chi nhánh/Ký túc xá (UC05), Phòng/Giường (UC03), Tài sản (UC04), Dịch vụ (UC06), Chính sách (UC07).

### Thành viên 2: Vinh
**Phụ trách:** Module 2 (Đăng ký & Tư vấn).
**File làm việc chính:** `Module2.tsx`.
* **Khách hàng (UC08):** Xây dựng bảng quản lý khách hàng. Tích hợp form thêm mới có validate cơ bản (SĐT, CCCD).
* **Yêu cầu thuê (UC09):** Xây dựng layout dạng thẻ (Card) hoặc lưới hiển thị các yêu cầu đang chờ xử lý.
* **Tra cứu phòng trống:** Tính năng bổ trợ cho UC09. Xây dựng bộ lọc đa điều kiện (Cơ sở, Giá, Giới tính) và kết xuất danh sách phòng phù hợp.
* **Lịch hẹn (UC10):** Quản lý lịch xem phòng, tích hợp Calendar để thao tác chọn ngày giờ trực quan.

### Thành viên 3: Khôi
**Phụ trách:** Module 3 (Đặt cọc & Giữ chỗ).
**File làm việc chính:** `Module3.tsx`.
* **Lập phiếu cọc (UC11):** Xây dựng form động tính toán tự động. Logic: Chọn phòng -> Hệ thống tự hiển thị (Giá thuê x 2 tháng x Số giường).
* **Quản lý Phiếu cọc (UC12, UC13, UC14, UC15):** Bảng tổng hợp phiếu cọc.
  * Tích hợp các nút thao tác chuyển trạng thái: Gửi yêu cầu thanh toán (UC12), Duyệt thanh toán (UC13).
  * Hủy cọc thủ công (UC15): Cần có AlertDialog xác nhận lý do trước khi hủy.
  * Tự động hủy cọc (UC14): Tạo một cơ chế giả lập (nút trigger) để demo việc hệ thống tự hủy phiếu khi quá hạn 24h.

### Thành viên 4: Đạt
**Phụ trách:** Module 4 (Ký hợp đồng & Nhận phòng).
**File làm việc chính:** `Module4.tsx`.
* **Danh sách thành viên (UC16, UC21):** Bảng cập nhật thành viên nhóm. Sử dụng Checkbox/Badge để duyệt từng điều kiện lưu trú trước khi cho phép vào ở.
* **Hợp đồng thuê (UC17):** Form hiển thị thông tin hợp đồng. Các thông tin từ phiếu cọc được kế thừa (chỉ đọc), cho phép nhập bổ sung ngày bắt đầu và chu kỳ đóng tiền.
* **Thu tiền kỳ đầu (UC18, UC19):** Bảng hiển thị thông tin thu tiền, phân tách rõ ràng khoản tiền thuê và tiền dịch vụ ban đầu.
* **Bàn giao phòng (UC20):** Xây dựng giao diện dạng Checklist để kiểm kê tài sản (Giường, Nệm, Thẻ từ) và các trường nhập chỉ số điện/nước đầu vào.

### Thành viên 5: Huy
**Phụ trách:** Module 5 (Trả phòng & Thanh lý).
**File làm việc chính:** `Module5.tsx`.
* **Lịch trả phòng (UC22):** Bảng theo dõi và ghi nhận ngày dự kiến trả phòng của khách.
* **Kiểm tra hiện trạng (UC23):** Form nhập liệu chốt số điện/nước cuối kỳ và ghi nhận các hư hỏng tài sản kèm chi phí khấu trừ.
* **Thanh toán trả phòng (UC24):** Giao diện đối soát tài chính. Cần chia rõ 2 cột hiển thị (Tiền cọc giữ vs Tiền khấu trừ) và làm nổi bật con số tổng "Hoàn lại/Thu thêm" cuối cùng.
* **Thanh lý hợp đồng (UC25):** Màn hình hoàn tất thủ tục thanh lý và reset trạng thái phòng. Sử dụng thư viện `canvas-confetti` để tạo hiệu ứng thành công khi xác nhận.