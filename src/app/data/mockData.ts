/**
 * LƯU Ý:
 * - TOÀN BỘ DATA FAKE ĐỂ VẼ UI PHẢI IMPORT TỪ FILE NÀY!
 * - Tuyệt đối không tự tạo mảng data riêng lẻ trong component của mỗi người.
 * - Ai cần thêm trường (field) nào thì vào đây sửa để cả hệ thống cùng đồng bộ.
 */

// ==========================================
// 0. PHÂN QUYỀN & NGƯỜI DÙNG HIỆN TẠI (Dùng chung)
// ==========================================
export const ROLES = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  SALE: "SALE",
  ACCOUNTANT: "ACCOUNTANT",
};

export const CURRENT_USER = {
  id: "NV01",
  name: "Thành Minh",
  role: ROLES.ADMIN, // Đổi Role ở đây để test UI phân quyền
  branchId: "CN01",
};

export const MOCK_USERS = [
  { id: "NV01", username: "admin", name: "Thành Minh", role: ROLES.ADMIN, branch: "Tất cả", status: "Hoạt động" },
  { id: "NV02", username: "vinh.sale", name: "Quang Vinh", role: ROLES.SALE, branch: "CN Q9", status: "Hoạt động" },
];

// ==========================================
// MODULE 1: QUẢN TRỊ HỆ THỐNG & DANH MỤC (Minh)
// ==========================================
export const MOCK_BRANCHES = [
  { id: "CN01", name: "Ký túc xá Sinh viên Q9", address: "Khu Công Nghệ Cao, Q9, TP.HCM", status: "Hoạt động" },
];

export const MOCK_ROOMS = [
  { id: "P101", branchId: "CN01", name: "Phòng 101 (Nam)", area: "Tầng 1", capacity: 4, gender: "Nam", price: 1500000, status: "Trống", availableBeds: 4 },
  { id: "P102", branchId: "CN01", name: "Phòng 102 (Nữ)", area: "Tầng 1", capacity: 6, gender: "Nữ", price: 1200000, status: "Đang thuê", availableBeds: 1 },
];

export const MOCK_ASSETS = [
  { id: "TS01", name: "Giường tầng sắt", quantity: 20, condition: "Tốt", compensationPrice: 1500000 },
  { id: "TS02", name: "Thẻ từ phòng", quantity: 50, condition: "Tốt", compensationPrice: 100000 },
];

export const MOCK_SERVICES = [
  { id: "DV01", name: "Điện sinh hoạt", unit: "kWh", unitPrice: 3500 },
  { id: "DV02", name: "Nước sinh hoạt", unit: "m3", unitPrice: 20000 },
  { id: "DV03", name: "Wifi & Rác", unit: "Người/Tháng", unitPrice: 100000 },
];

// ==========================================
// MODULE 2: ĐĂNG KÝ & TƯ VẤN (Vinh)
// ==========================================
export const MOCK_CUSTOMERS = [
  { id: "KH01", fullName: "Nguyễn Văn A", phone: "0901234567", cccd: "079099123456", email: "nva@gmail.com", status: "Tiềm năng" },
  { id: "KH02", fullName: "Trần Thị B", phone: "0909888777", cccd: "079099654321", email: "ttb@gmail.com", status: "Đã cọc" },
];

export const MOCK_REQUESTS = [
  { id: "YC01", customerId: "KH01", branchId: "CN01", gender: "Nam", maxBudget: 1600000, status: "Đang tư vấn", createdAt: "2024-03-20" },
];

export const MOCK_APPOINTMENTS = [
  { id: "LH01", requestId: "YC01", date: "2024-03-25T09:00", note: "Khách xem P101", status: "Chờ xem" },
];

// ==========================================
// MODULE 3: ĐẶT CỌC & GIỮ CHỖ (Khôi)
// ==========================================
export const MOCK_DEPOSITS = [
  { id: "DC01", customerId: "KH01", roomId: "P101", beds: 1, amount: 3000000, status: "Chờ thanh toán", expireAt: "2024-03-26T09:00", createdBy: "NV02" },
  { id: "DC02", customerId: "KH02", roomId: "P102", beds: 1, amount: 2400000, status: "Đã thanh toán (Giữ chỗ)", expireAt: "2024-03-20T14:00", createdBy: "NV02" },
];

// ==========================================
// MODULE 4: HỢP ĐỒNG & NHẬN PHÒNG (Đạt)
// ==========================================
export const MOCK_CONTRACTS = [
  { id: "HD01", customerId: "KH02", roomId: "P102", depositId: "DC02", startDate: "2024-04-01", cycle: "1 Tháng", status: "Đang hiệu lực" },
];

export const MOCK_MEMBERS = [
  { contractId: "HD01", fullName: "Trần Thị B", cccd: "079099654321", isRepresentative: true, isApproved: true },
];

export const MOCK_RECEIPTS = [
  { id: "PT01", contractId: "HD01", type: "Thu tiền kỳ đầu", totalAmount: 1300000, status: "Đã thu", createdAt: "2024-04-01" },
];

// ==========================================
// MODULE 5: TRẢ PHÒNG & THANH LÝ (Huy)
// ==========================================
export const MOCK_CHECKOUT_SCHEDULES = [
  { id: "LTP01", contractId: "HD01", expectedDate: "2024-10-01", reason: "Hết hạn hợp đồng", status: "Chưa kiểm tra" },
];

export const MOCK_CHECKOUT_SLIPS = [
  { id: "PC01", contractId: "HD01", depositRefund: 2400000, deduction: 200000, totalPayout: 2200000, status: "Chờ đối soát" },
];