/**
 * LƯU Ý:
 * - TOÀN BỘ DATA FAKE ĐỂ VẼ UI PHẢI IMPORT TỪ FILE NÀY!
 * - Tuyệt đối không tự tạo mảng data riêng lẻ trong component của mỗi người.
 * - Ai cần thêm trường (field) nào thì vào đây sửa để cả hệ thống cùng đồng bộ.
 * - ĐỒNG BỘ VỚI BACKEND seed.js - MỌI THAY ĐỔI PHẢI CẬP NHẬT Ở CẢ 2 NƠI!
 */

// ==========================================
// 0. PHÂN QUYỀN & NGƯỜI DÙNG HIỆN TẠI (Dùng chung)
// ==========================================
export const ROLES = {
  ADMIN: "admin",
  MANAGER: "quanly",
  SALE: "sale",
  ACCOUNTANT: "ketoan",
};

export const CURRENT_USER = {
  id: "NV001",
  name: "Nguyễn Văn An",
  role: ROLES.ADMIN, // Đổi Role ở đây để test UI phân quyền
  branchId: "CN001",
};

export const MOCK_USERS = [
  { id: "NV001", username: "admin", name: "Nguyễn Văn An", role: ROLES.ADMIN, branch: "Tất cả", status: "Hoạt động" },
  { id: "NV002", username: "sale01", name: "Trần Thị Bình", role: ROLES.SALE, branch: "CN001", status: "Hoạt động" },
  { id: "NV003", username: "ketoan01", name: "Lê Minh Châu", role: ROLES.ACCOUNTANT, branch: "CN001", status: "Hoạt động" },
  { id: "NV004", username: "quanly01", name: "Phạm Quốc Đạt", role: ROLES.MANAGER, branch: "CN001", status: "Hoạt động" },
  { id: "NV005", username: "sale02", name: "Hoàng Thị Hương", role: ROLES.SALE, branch: "CN002", status: "Hoạt động" },
];

// ==========================================
// MODULE 1: QUẢN TRỊ HỆ THỐNG & DANH MỤC
// ==========================================
export const MOCK_BRANCHES = [
  { id: "CN001", name: "Chi nhánh Quận 5", address: "227 Nguyễn Văn Cừ, Q.5, TP.HCM", phone: "0283835426", status: "Hoạt động" },
  { id: "CN002", name: "Chi nhánh Bình Thạnh", address: "15 Xô Viết Nghệ Tĩnh, Q.BT, TP.HCM", phone: "0283556677", status: "Hoạt động" },
];

export const MOCK_ROOM_TYPES = [
  { id: "LP001", name: "Phòng đơn", description: "Phòng riêng 1 người" },
  { id: "LP002", name: "Phòng đôi", description: "Phòng riêng 2 người" },
  { id: "LP003", name: "Phòng ở ghép", description: "Phòng ghép nhiều người" },
];

export const MOCK_ROOMS = [
  // CN001 - Quận 5
  { id: "P101", branchId: "CN001", name: "Phòng 101", type: "Phòng đơn", capacity: 1, gender: "Chung", price: 3500000, status: "Trống" },
  { id: "P102", branchId: "CN001", name: "Phòng 102", type: "Phòng đôi", capacity: 2, gender: "Nữ", price: 2500000, status: "Đã thuê" },
  { id: "P103", branchId: "CN001", name: "Phòng 103", type: "Phòng ở ghép", capacity: 4, gender: "Nam", price: 1800000, status: "Đã thuê" },
  { id: "P104", branchId: "CN001", name: "Phòng 104", type: "Phòng ở ghép", capacity: 4, gender: "Nữ", price: 1800000, status: "Trống" },
  // CN002 - Bình Thạnh
  { id: "P201", branchId: "CN002", name: "Phòng 201", type: "Phòng đôi", capacity: 2, gender: "Chung", price: 2800000, status: "Đã cọc" },
  { id: "P202", branchId: "CN002", name: "Phòng 202", type: "Phòng ở ghép", capacity: 6, gender: "Nam", price: 1500000, status: "Đã thuê" },
];

export const MOCK_BEDS = [
  // P101 - 1 giường đơn (trống)
  { id: "G101A", roomId: "P101", bedNumber: 1, bedName: "Giường 101A", status: "Trống" },
  // P102 - 2 giường (đã thuê)
  { id: "G102A", roomId: "P102", bedNumber: 1, bedName: "Giường 102A", status: "Đã thuê" },
  { id: "G102B", roomId: "P102", bedNumber: 2, bedName: "Giường 102B", status: "Đã thuê" },
  // P103 - 4 giường (3 đã thuê, 1 trống)
  { id: "G103A", roomId: "P103", bedNumber: 1, bedName: "Giường 103A", status: "Đã thuê" },
  { id: "G103B", roomId: "P103", bedNumber: 2, bedName: "Giường 103B", status: "Đã thuê" },
  { id: "G103C", roomId: "P103", bedNumber: 3, bedName: "Giường 103C", status: "Đã thuê" },
  { id: "G103D", roomId: "P103", bedNumber: 4, bedName: "Giường 103D", status: "Trống" },
  // P104 - 4 giường (tất cả trống)
  { id: "G104A", roomId: "P104", bedNumber: 1, bedName: "Giường 104A", status: "Trống" },
  { id: "G104B", roomId: "P104", bedNumber: 2, bedName: "Giường 104B", status: "Trống" },
  { id: "G104C", roomId: "P104", bedNumber: 3, bedName: "Giường 104C", status: "Trống" },
  { id: "G104D", roomId: "P104", bedNumber: 4, bedName: "Giường 104D", status: "Trống" },
  // P201 - 2 giường (đã cọc)
  { id: "G201A", roomId: "P201", bedNumber: 1, bedName: "Giường 201A", status: "Đã cọc" },
  { id: "G201B", roomId: "P201", bedNumber: 2, bedName: "Giường 201B", status: "Đã cọc" },
  // P202 - 6 giường (3 đã thuê, 3 trống)
  { id: "G202A", roomId: "P202", bedNumber: 1, bedName: "Giường 202A", status: "Đã thuê" },
  { id: "G202B", roomId: "P202", bedNumber: 2, bedName: "Giường 202B", status: "Đã thuê" },
  { id: "G202C", roomId: "P202", bedNumber: 3, bedName: "Giường 202C", status: "Đã thuê" },
  { id: "G202D", roomId: "P202", bedNumber: 4, bedName: "Giường 202D", status: "Trống" },
  { id: "G202E", roomId: "P202", bedNumber: 5, bedName: "Giường 202E", status: "Trống" },
  { id: "G202F", roomId: "P202", bedNumber: 6, bedName: "Giường 202F", status: "Trống" },
];

export const MOCK_ASSETS = [
  { id: "TS001", name: "Giường tầng", type: "Nội thất", description: "Giường sắt 2 tầng" },
  { id: "TS002", name: "Nệm", type: "Nội thất", description: "Nệm cao su 1m2" },
  { id: "TS003", name: "Tủ đầu giường", type: "Nội thất", description: "Tủ gỗ nhỏ" },
  { id: "TS004", name: "Thẻ từ", type: "Bảo mật", description: "Thẻ từ ra vào phòng" },
  { id: "TS005", name: "Điều hoà", type: "Thiết bị", description: "Máy lạnh Daikin 1.5HP" },
  { id: "TS006", name: "Quạt trần", type: "Thiết bị", description: "Quạt trần 3 cánh" },
];

export const MOCK_SERVICES = [
  { id: "DV001", name: "Tiền điện", unit: "kWh", unitPrice: 3500 },
  { id: "DV002", name: "Tiền nước", unit: "m3", unitPrice: 15000 },
  { id: "DV003", name: "Wifi", unit: "tháng", unitPrice: 100000 },
  { id: "DV004", name: "Gửi xe máy", unit: "xe/tháng", unitPrice: 150000 },
  { id: "DV005", name: "Gửi xe đạp", unit: "xe/tháng", unitPrice: 50000 },
];

// ==========================================
// MODULE 2: ĐĂNG KÝ & TƯ VẤN
// ==========================================
export const MOCK_CUSTOMERS = [
  { id: "KH001", fullName: "Nguyễn Thị Mai", name: "Nguyễn Thị Mai", phone: "0971234567", cccd: "079202001234", email: "mai@gmail.com", gender: "Nữ", status: "Tiềm năng" },
  { id: "KH002", fullName: "Trần Văn Hùng", name: "Trần Văn Hùng", phone: "0982345678", cccd: "079201002345", email: "hung@gmail.com", gender: "Nam", status: "Đã cọc" },
  { id: "KH003", fullName: "Lê Thị Lan", name: "Lê Thị Lan", phone: "0993456789", cccd: "079203003456", email: "lan@gmail.com", gender: "Nữ", status: "Đang thuê" },
  { id: "KH004", fullName: "Phạm Văn Tuấn", name: "Phạm Văn Tuấn", phone: "0904567890", cccd: "079200004567", email: "tuan@gmail.com", gender: "Nam", status: "Đang thuê" },
  { id: "KH005", fullName: "Hoàng Thị Thu", name: "Hoàng Thị Thu", phone: "0915678901", cccd: "079202005678", email: "thu@gmail.com", gender: "Nữ", status: "Tiềm năng" },
  { id: "KH006", fullName: "Đặng Minh Khoa", name: "Đặng Minh Khoa", phone: "0926789012", cccd: "079201006789", email: "khoa@gmail.com", gender: "Nam", status: "Tiềm năng" },
  { id: "KH007", fullName: "Vũ Thị Hoa", name: "Vũ Thị Hoa", phone: "0937890123", cccd: "079203007890", email: "hoa@gmail.com", gender: "Nữ", status: "Đã cọc" },
  { id: "KH008", fullName: "Bùi Văn Long", name: "Bùi Văn Long", phone: "0948901234", cccd: "079200008901", email: "long@gmail.com", gender: "Nam", status: "Đã cọc" },
];

export const MOCK_REQUESTS = [
  { id: "YCT001", customerId: "KH001", branchId: "CN001", gender: "Nữ", maxBudget: 3000000, status: "Đang tư vấn", createdAt: "2025-11-01" },
  { id: "YCT002", customerId: "KH002", branchId: "CN001", gender: "Nam", maxBudget: 2000000, status: "Đang tư vấn", createdAt: "2025-11-05" },
  { id: "YCT003", customerId: "KH007", branchId: "CN002", gender: "Nữ", maxBudget: 3000000, status: "Đang tư vấn", createdAt: "2025-12-10" },
  { id: "YCT004", customerId: "KH005", branchId: "CN001", gender: "Nữ", maxBudget: 2000000, status: "Chờ duyệt", createdAt: "2026-03-15" },
];

export const MOCK_APPOINTMENTS = [
  { id: "LH001", requestId: "YCT001", date: "2025-11-08T09:00", status: "Hoàn thành", note: "Khách xem P102, yêu cầu cọc" },
  { id: "LH002", requestId: "YCT002", date: "2025-11-10T14:00", status: "Hoàn thành", note: "Khách xem P103, chưa quyết định" },
  { id: "LH003", requestId: "YCT003", date: "2025-12-15T10:00", status: "Hoàn thành", note: "Khách xem P201, đồng ý cọc" },
  { id: "LH004", requestId: "YCT004", date: "2026-03-20T15:00", status: "Chờ xác nhận", note: null },
];

// ==========================================
// MODULE 3: ĐẶT CỌC & GIỮ CHỖ
// ==========================================
// MOCK_DEPOSITS format: {id, customerId, customer, roomId, room, beds: [bedIds...], amount, status, date, expireAt, createdBy}
// - beds: Array of bed IDs (for bed-type deposits) or empty array (for room-type deposits)
export const MOCK_DEPOSITS = [
  // ── LOẠI GIƯỜNG (beds array không rỗng) ──
  // KH001 cọc 2 giường P102 (giường type)
  { id: "PC001", customerId: "KH001", customer: "Nguyễn Thị Mai", roomId: "P102", room: "P102", beds: ["G102A", "G102B"], amount: 10000000, status: "Đã thanh toán", date: "2025-11-15", expireAt: "2025-11-17", createdBy: "NV002" },
  // KH002 cọc 1 giường P103 (giường type)
  { id: "PC002", customerId: "KH002", customer: "Trần Văn Hùng", roomId: "P103", room: "P103", beds: ["G103A"], amount: 3600000, status: "Đã thanh toán", date: "2025-11-18", expireAt: "2025-11-20", createdBy: "NV002" },
  // KH007 & KH008 cọc 2 giường P201 (giường type)
  { id: "PC003", customerId: "KH007", customer: "Vũ Thị Hoa", roomId: "P201", room: "P201", beds: ["G201A", "G201B"], amount: 11200000, status: "Đã thanh toán", date: "2025-12-20", expireAt: "2025-12-23", createdBy: "NV005" },
  // KH006 cọc 1 giường P104 (giường type) - Chờ duyệt
  { id: "PC004", customerId: "KH006", customer: "Đặng Minh Khoa", roomId: "P104", room: "P104", beds: ["G104A"], amount: 3600000, status: "Chờ duyệt", date: "2026-03-10", expireAt: "2026-03-12", createdBy: "NV002" },
  // KH004 cọc 3 giường P202 (giường type) - Đã duyệt
  { id: "PC006", customerId: "KH004", customer: "Phạm Văn Tuấn", roomId: "P202", room: "P202", beds: ["G202A", "G202B", "G202C"], amount: 13500000, status: "Đã duyệt", date: "2026-02-28", expireAt: "2026-03-02", createdBy: "NV005" },
  
  // ── LOẠI PHÒNG (beds array rỗng) ──
  // KH003 cọc phòng P104 (phòng type) - Chờ duyệt
  { id: "PC005", customerId: "KH003", customer: "Lê Thị Lan", roomId: "P104", room: "P104", beds: [], amount: 7200000, status: "Chờ duyệt", date: "2026-03-05", expireAt: "2026-03-07", createdBy: "NV002" },
  // KH005 cọc phòng P101 (phòng type) - Đã duyệt
  { id: "PC007", customerId: "KH005", customer: "Hoàng Thị Thu", roomId: "P101", room: "P101", beds: [], amount: 7000000, status: "Đã duyệt", date: "2026-02-15", expireAt: "2026-02-17", createdBy: "NV002" },
  // KH008 cọc phòng P104 (phòng type) - Đã hủy (Quá hạn)
  { id: "PC008", customerId: "KH008", customer: "Bùi Văn Long", roomId: "P104", room: "P104", beds: [], amount: 7200000, status: "Đã hủy (Quá hạn)", date: "2026-01-20", expireAt: "2026-01-22", createdBy: "NV002" },
];

// ==========================================
// MODULE 4: HỢP ĐỒNG & NHẬN PHÒNG
// ==========================================
export const MOCK_CONTRACTS = [
  { id: "HD001", depositId: "PC001", customerId: "KH001", roomId: "P102", startDate: "2025-12-01", endDate: "2026-06-01", cycle: 1, status: "Đang hiệu lực", createdBy: "NV004" },
  { id: "HD002", depositId: "PC002", customerId: "KH002", roomId: "P103", startDate: "2025-12-01", endDate: "2026-12-01", cycle: 1, status: "Đang hiệu lực", createdBy: "NV004" },
  { id: "HD003", depositId: "PC003", customerId: "KH007", roomId: "P201", startDate: "2026-01-02", endDate: "2026-07-02", cycle: 1, status: "Đang hiệu lực", createdBy: "NV004" },
];

export const MOCK_MEMBERS = [
  { contractId: "HD001", customerId: "KH001", bedId: "G102A", isRepresentative: true, isApproved: true },
  { contractId: "HD001", customerId: "KH003", bedId: "G102B", isRepresentative: false, isApproved: true },
  { contractId: "HD002", customerId: "KH002", bedId: "G103A", isRepresentative: true, isApproved: true },
  { contractId: "HD003", customerId: "KH007", bedId: "G201A", isRepresentative: true, isApproved: true },
  { contractId: "HD003", customerId: "KH008", bedId: "G201B", isRepresentative: false, isApproved: true },
];

export const MOCK_RECEIPTS = [
  { id: "PT001", contractId: "HD001", createdBy: "NV003", date: "2025-12-01", totalAmount: 5100000, type: "Thu tiền kỳ đầu", status: "Đã thu", note: "Tiền thuê tháng 12 + wifi + gửi xe" },
  { id: "PT002", contractId: "HD002", createdBy: "NV003", date: "2025-12-01", totalAmount: 1950000, type: "Thu tiền kỳ đầu", status: "Đã thu", note: "Tiền thuê tháng 12 + wifi" },
  { id: "PT003", contractId: "HD003", createdBy: "NV003", date: "2026-01-02", totalAmount: 5800000, type: "Thu tiền kỳ đầu", status: "Đã thu", note: "Tiền thuê tháng 1 + dịch vụ" },
];

// ==========================================
// MODULE 5: TRẢ PHÒNG & THANH LÝ
// ==========================================
export const MOCK_CHECKOUT_SCHEDULES = [
  { id: "LTP01", contractId: "HD001", expectedDate: "2026-06-01", reason: "Hết hạn hợp đồng", status: "Chưa kiểm tra" },
  { id: "LTP02", contractId: "HD002", expectedDate: "2026-12-01", reason: "Hết hạn hợp đồng", status: "Chưa kiểm tra" },
  { id: "LTP03", contractId: "HD003", expectedDate: "2026-07-02", reason: "Hết hạn hợp đồng", status: "Chưa kiểm tra" },
];

export const MOCK_CHECKOUT_SLIPS = [
  { id: "PC01", contractId: "HD001", depositRefund: 10000000, deduction: 500000, totalPayout: 9500000, status: "Chờ đối soát" },
];

export const MOCK_CHECKOUT_REQUESTS = [
  {
    id: "OUT001",
    contractId: "CT001",
    customerName: "Nguyễn Việt Hoàng",
    roomName: "R101",
    bedCount: 2,
    depositAmount: 6000000,
    startDate: "2026-01-01",
    contractEndDate: "2026-12-31",
    expectedCheckoutDate: "2026-05-20",
    reason: "Chuyển chỗ làm",
    stayMonths: 5,
    status: "Chờ duyệt",
    electricStart: 120,
    waterStart: 5,
    electricEnd: 280,
    waterEnd: 12,
    unpaidRent: 0,
    unpaidService: 150000,
    violationFee: 0,
    refundRate: 100, // %
    damageItems: [],
    inspectionChecklist: {
      keyReturned: false,
      roomClean: false,
      assetsIntact: false,
      servicesPaid: false
    }
  },
  {
    id: "OUT002",
    contractId: "CT002",
    customerName: "Vũ Kiều Oanh",
    roomName: "R102",
    bedCount: 2,
    depositAmount: 7200000,
    startDate: "2025-10-01",
    contractEndDate: "2026-10-01",
    expectedCheckoutDate: "2026-10-01",
    reason: "Hết hạn hợp đồng",
    stayMonths: 12,
    status: "Đã xác nhận",
    electricStart: 100,
    waterStart: 3,
    electricEnd: 450,
    waterEnd: 15,
    unpaidRent: 0,
    unpaidService: 200000,
    violationFee: 0,
    refundRate: 100, // %
    damageItems: [
      { description: "Thất lạc chìa khóa", amount: 50000 },
      { description: "Rách đệm giường số 2", amount: 300000 }
    ],
    inspectionChecklist: {
      keyReturned: true,
      roomClean: true,
      assetsIntact: false,
      servicesPaid: false
    }
  },
  {
    id: "OUT003",
    contractId: "CT003",
    customerName: "Nguyễn Tiến Khang",
    roomName: "R103",
    bedCount: 1,
    depositAmount: 3000000,
    startDate: "2026-03-01",
    contractEndDate: "2026-09-01",
    expectedCheckoutDate: "2026-04-15",
    reason: "Hủy thuê sớm",
    stayMonths: 1,
    status: "Đang kiểm tra",
    electricStart: 80,
    waterStart: 2,
    electricEnd: 150,
    waterEnd: 8,
    unpaidRent: 1800000,
    unpaidService: 100000,
    violationFee: 500000,
    refundRate: 50, // % do hủy sớm
    damageItems: [
      { description: "Hư hỏng tủ đầu giường", amount: 150000 }
    ],
    inspectionChecklist: {
      keyReturned: true,
      roomClean: false,
      assetsIntact: false,
      servicesPaid: false
    }
  },
  // ✅ TEST UC25: Thanh lý - Hoàn lại (Hợp đồng hết hạn, 70% refund)
  {
    id: "OUT004",
    contractId: "CT004",
    customerName: "Trần Minh Tuấn",
    roomName: "R104",
    bedCount: 1,
    depositAmount: 5000000,
    startDate: "2025-11-01",
    contractEndDate: "2026-05-01",
    expectedCheckoutDate: "2026-05-01",
    reason: "Hết hạn hợp đồng",
    stayMonths: 6,
    status: "Đã đối soát",
    electricStart: 150,
    waterStart: 10,
    electricEnd: 450,
    waterEnd: 35,
    unpaidRent: 0,
    unpaidService: 300000,
    violationFee: 0,
    refundRate: 70, // % - Chưa hết hạn, lưu trú ≥ 6 tháng
    damageItems: [
      { description: "Rửa sạch góc bẩn", amount: 0 }
    ],
    inspectionChecklist: {
      keyReturned: true,
      roomClean: true,
      assetsIntact: true,
      servicesPaid: true
    },
    settlementData: {
      depositAmount: 5000000,
      refundRate: 70,
      basicRefund: 3500000,
      totalDeduction: 1342500,
      finalResult: 2157500,
      resultText: "Hoàn lại"
    }
  },
  // ✅ TEST UC25: Thanh lý - Thu thêm (Hợp đồng chưa hết hạn, 50% refund, nợ tiền)
  {
    id: "OUT005",
    contractId: "CT005",
    customerName: "Lê Hoàng Phương",
    roomName: "R105",
    bedCount: 2,
    depositAmount: 4500000,
    startDate: "2026-01-15",
    contractEndDate: "2026-12-15",
    expectedCheckoutDate: "2026-05-10",
    reason: "Hủy hợp đồng sớm",
    stayMonths: 4,
    status: "Đã đối soát",
    electricStart: 200,
    waterStart: 15,
    electricEnd: 620,
    waterEnd: 45,
    unpaidRent: 900000,
    unpaidService: 250000,
    violationFee: 500000,
    refundRate: 50, // % - Hủy sớm < 6 tháng
    damageItems: [
      { description: "Bong sơn tường", amount: 200000 },
      { description: "Hỏng khóa cửa", amount: 400000 }
    ],
    inspectionChecklist: {
      keyReturned: true,
      roomClean: true,
      assetsIntact: false,
      servicesPaid: false
    },
    settlementData: {
      depositAmount: 4500000,
      refundRate: 50,
      basicRefund: 2250000,
      totalDeduction: 3695000,
      finalResult: -1445000,
      resultText: "Thu thêm"
    }
  },
  // ✅ TEST UC25: Thanh lý - Không phát sinh (Hoàn lại = Khấu trừ)
  {
    id: "OUT006",
    contractId: "CT006",
    customerName: "Đặng Thị Hương Giang",
    roomName: "R106",
    bedCount: 1,
    depositAmount: 2500000,
    startDate: "2025-12-01",
    contractEndDate: "2026-06-01",
    expectedCheckoutDate: "2026-06-01",
    reason: "Hết hạn hợp đồng",
    stayMonths: 6,
    status: "Đã đối soát",
    electricStart: 300,
    waterStart: 20,
    electricEnd: 500,
    waterEnd: 35,
    unpaidRent: 0,
    unpaidService: 200000,
    violationFee: 0,
    refundRate: 100, // % - Hợp đồng hết hạn
    basicRefund: 2500000,
    totalDeduction: 2500000,
    finalResult: 0,
    damageItems: [],
    inspectionChecklist: {
      keyReturned: true,
      roomClean: true,
      assetsIntact: true,
      servicesPaid: true
    },
    settlementData: {
      depositAmount: 2500000,
      refundRate: 100,
      basicRefund: 2500000,
      totalDeduction: 2500000,
      finalResult: 0,
      resultText: "Không phát sinh"
    }
  }
];

// ==========================================
// EXPORTS ALIASES (without MOCK_ prefix for easier imports)
// ==========================================
export const users = MOCK_USERS;
export const branches = MOCK_BRANCHES;
export const roomTypes = MOCK_ROOM_TYPES;
export const rooms = MOCK_ROOMS;
export const beds = MOCK_BEDS;
export const assets = MOCK_ASSETS;
export const services = MOCK_SERVICES;
export const customers = MOCK_CUSTOMERS;
export const requests = MOCK_REQUESTS;
export const appointments = MOCK_APPOINTMENTS;
export const deposits = MOCK_DEPOSITS;
export const mockDeposits = MOCK_DEPOSITS;
export const contracts = MOCK_CONTRACTS;
export const members = MOCK_MEMBERS;
export const receipts = MOCK_RECEIPTS;
export const checkoutSchedules = MOCK_CHECKOUT_SCHEDULES;
export const checkoutSlips = MOCK_CHECKOUT_SLIPS;
export const checkoutRequests = MOCK_CHECKOUT_REQUESTS;