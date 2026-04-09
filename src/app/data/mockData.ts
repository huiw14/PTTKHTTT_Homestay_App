export const branches = [
  { id: 'B01', name: 'Homestay Quận 1 (Cơ sở chính)', address: '123 Lê Lợi, Q.1, TP.HCM', status: 'Hoạt động', capacity: 150 },
  { id: 'B02', name: 'Homestay Phú Nhuận', address: '45 Phan Xích Long, Phú Nhuận', status: 'Hoạt động', capacity: 80 },
  { id: 'B03', name: 'Homestay Gò Vấp', address: '12 Quang Trung, Gò Vấp', status: 'Đang bảo trì', capacity: 120 },
];

export const rooms = [
  { id: 'R101', branch: 'B01', type: 'Phòng 4 giường', price: 2500000, capacity: 4, occupied: 2, status: 'Còn trống', gender: 'Nữ' },
  { id: 'R102', branch: 'B01', type: 'Phòng 6 giường', price: 2000000, capacity: 6, occupied: 6, status: 'Đã đầy', gender: 'Nam' },
  { id: 'R201', branch: 'B02', type: 'Phòng 2 giường (VIP)', price: 3500000, capacity: 2, occupied: 0, status: 'Còn trống', gender: 'Nam/Nữ' },
  { id: 'R202', branch: 'B02', type: 'Phòng 4 giường', price: 2200000, capacity: 4, occupied: 1, status: 'Còn trống', gender: 'Nữ' },
];

export const users = [
  { id: 'U001', name: 'Hoàng Minh Tuấn', role: 'Admin', email: 'admin@homestay.vn', status: 'Active' },
  { id: 'U002', name: 'Nguyễn Thu Hà', role: 'Sale', email: 'sale1@homestay.vn', status: 'Active' },
  { id: 'U003', name: 'Lê Thị Thanh Mai', role: 'Kế toán', email: 'ketoan@homestay.vn', status: 'Active' },
  { id: 'U004', name: 'Phạm Đình Bảo', role: 'Manager', email: 'manager@homestay.vn', status: 'Active' },
];

export const services = [
  { id: 'S01', name: 'Điện', unit: 'kWh', price: 3500, type: 'Theo đồng hồ' },
  { id: 'S02', name: 'Nước', unit: 'Khối', price: 20000, type: 'Theo đồng hồ' },
  { id: 'S03', name: 'Rác', unit: 'Phòng/Tháng', price: 50000, type: 'Cố định' },
  { id: 'S04', name: 'Wifi', unit: 'Phòng/Tháng', price: 100000, type: 'Cố định' },
];

export const customers = [
  { id: 'C001', name: 'Nguyễn Đức Anh', phone: '0901234567', email: 'anh.nd@gmail.com', demand: 'Phòng 4 Nữ Q.1', status: 'Đang tư vấn' },
  { id: 'C002', name: 'Trần Phương Thảo', phone: '0987654321', email: 'thao.tp@gmail.com', demand: 'Phòng 2 VIP Phú Nhuận', status: 'Đã cọc' },
  { id: 'C003', name: 'Lê Hoàng Phúc', phone: '0912345678', email: 'phuc.lh@gmail.com', demand: 'Bất kỳ', status: 'Hẹn xem phòng' },
];

export const deposits = [
  { id: 'D001', customer: 'Trần Phương Thảo', room: 'R201', amount: 7000000, date: '2026-04-01', status: 'Chờ duyệt', sale: 'Nguyễn Thu Hà' },
  { id: 'D002', customer: 'Đặng Việt Hùng', room: 'R101', amount: 5000000, date: '2026-03-25', status: 'Đã duyệt', sale: 'Nguyễn Thu Hà' },
  { id: 'D003', customer: 'Phan Ngọc Trâm', room: 'R202', amount: 4400000, date: '2026-03-20', status: 'Đã hủy (Quá hạn)', sale: 'Nguyễn Thu Hà' },
];

export const contracts = [
  { id: 'CT001', customer: 'Đặng Việt Hùng', room: 'R101', members: 2, startDate: '2026-04-05', cycle: '1 tháng', status: 'Chưa thu tiền kỳ đầu' },
  { id: 'CT002', customer: 'Vũ Kiều Oanh', room: 'R102', members: 1, startDate: '2025-10-01', cycle: '3 tháng', status: 'Đang thuê' },
];