/**
 * Transform backend PhieuCoc response to frontend format
 */
export function transformBackendDeposit(backendDeposit: any) {
  // Get customer name from backend
  const customerName = backendDeposit.khachHang?.hoTen || `KH ${backendDeposit.maKH}`;
  const customerPhone = backendDeposit.khachHang?.soDienThoai || "";
  const customerEmail = backendDeposit.khachHang?.email || "";

  // Get staff name
  const staffName = backendDeposit.nhanVien?.hoTen || `NV ${backendDeposit.maNV}`;

  // Get room info - either from direct phong or from chiTietPhieuCoc
  let roomId = "";
  let roomName = "";
  
  // Check if it's a room deposit (maPhong is set)
  if (backendDeposit.phong?.maPhong) {
    roomId = backendDeposit.phong.maPhong;
    roomName = backendDeposit.phong.tenPhong;
  } 
  // Otherwise check chiTietPhieuCoc for bed deposit
  else if (
    backendDeposit.chiTietPhieuCoc &&
    backendDeposit.chiTietPhieuCoc.length > 0
  ) {
    const firstRoom = backendDeposit.chiTietPhieuCoc[0]?.giuong?.phong;
    if (firstRoom) {
      roomId = firstRoom.maPhong;
      roomName = firstRoom.tenPhong;
    }
  }

  // Determine type (giường vs phòng)
  // Room deposits have maPhong set; bed deposits only have chiTietPhieuCoc
  const isRoomDeposit = !!backendDeposit.maPhong;
  const isGiuong = !isRoomDeposit;
  const bedIds = backendDeposit.chiTietPhieuCoc?.map(
    (ct: any) => ct.maGiuong
  ) || [];
  
  // Get beds detail
  const bedsDetail = backendDeposit.chiTietPhieuCoc?.map((ct: any) => ({
    bedId: ct.maGiuong,
    bedName: ct.giuong?.tenGiuong || ct.maGiuong,
  })) || [];

  // Map status (backend format to frontend display)
  const statusMap: { [key: string]: string } = {
    ChoDuyet: "Chờ duyệt",
    DaDuyet: "Đã duyệt",
    DaHuy: "Đã hủy",
  };

  const displayStatus = statusMap[backendDeposit.trangThai] || backendDeposit.trangThai;

  return {
    id: backendDeposit.maPC,
    customerId: backendDeposit.maKH,
    customer: customerName,
    customerName,
    customerPhone,
    customerEmail,
    staffId: backendDeposit.maNV,
    staffName,
    roomId,
    room: roomName,
    roomName,
    beds: bedIds,
    bedsDetail,
    amount: Number(backendDeposit.tienCoc),
    status: displayStatus,
    backendStatus: backendDeposit.trangThai,
    date: new Date(backendDeposit.ngayCoc).toISOString().split("T")[0],
    deadline: backendDeposit.hanThanhToan,
    expireAt: backendDeposit.hanThanhToan,
    createdBy: backendDeposit.maNV,
    type: isGiuong ? "giường" : "phòng",
    depositType: isGiuong ? "Giường" : "Phòng",
  };
}

/**
 * Transform frontend form data to backend API payload
 */
export function transformToBackendPayload(formData: any) {
  return {
    maKH: formData.customerId || formData.maKH,
    maNV: formData.employeeId || "NV001", // Default to admin
    maCN: formData.branchId || "CN001", // Default to branch 1
    tienCoc: formData.amount || formData.tienCoc,
    beds: formData.beds || [],
  };
}

/**
 * Map backend status to update payload
 */
export function mapStatusToBackend(frontendStatus: string): string {
  const statusMap: { [key: string]: string } = {
    "Chờ duyệt": "ChoDuyet",
    "Đã duyệt": "DaDuyet",
    "Đã hủy": "DaHuy",
  };

  return statusMap[frontendStatus] || frontendStatus;
}
