import { customers, rooms, beds } from "../data/mockData";

/**
 * Transform backend PhieuCoc response to frontend format
 */
export function transformBackendDeposit(backendDeposit: any) {
  // Get customer info
  const customerInfo = customers.find(
    (c) => c.id === backendDeposit.maKH
  );

  // Get room from chiTietPhieuCoc
  let roomId = "";
  if (
    backendDeposit.chiTietPhieuCoc &&
    backendDeposit.chiTietPhieuCoc.length > 0
  ) {
    const bedId = backendDeposit.chiTietPhieuCoc[0]?.maGiuong;
    const bedInfo = beds.find((b) => b.id === bedId);
    if (bedInfo) {
      roomId = bedInfo.roomId;
    }
  }

  // Determine type (giường vs phòng)
  const isGiuong = backendDeposit.chiTietPhieuCoc?.length > 0;
  const bedIds = backendDeposit.chiTietPhieuCoc?.map(
    (ct: any) => ct.maGiuong
  ) || [];

  // Map status (backend format to frontend) - comprehensive mapping
  const statusMap: { [key: string]: string } = {
    // Backend statuses
    ChoThanhToan: "Chờ duyệt",
    DaThanhToan: "Đã duyệt",
    TuDongHuy: "Đã hủy (Quá hạn)",
    HuyThuCong: "Đã hủy (Thủ công)",
    // Frontend/mockData statuses (in case they're stored)  
    "Chờ duyệt": "Chờ duyệt",
    "Đã duyệt": "Đã duyệt",
    "Đã thanh toán": "Đã duyệt",
    "Đã hủy (Quá hạn)": "Đã hủy (Quá hạn)",
    "Đã hủy (Thủ công)": "Đã hủy (Thủ công)",
    // No-space variants
    ChoDuyet: "Chờ duyệt",
    DaDuyet: "Đã duyệt",
    DaThanhToan: "Đã duyệt",
    DaHuy: "Đã hủy",
  };

  const displayStatus = statusMap[backendDeposit.trangThai] || backendDeposit.trangThai;

  return {
    id: backendDeposit.maPC,
    customerId: backendDeposit.maKH,
    customer: customerInfo?.name || `KH ${backendDeposit.maKH}`,
    roomId,
    room: roomId || `Phòng ${backendDeposit.maCN}`,
    beds: bedIds,
    amount: Number(backendDeposit.tienCoc),
    status: displayStatus,
    backendStatus: backendDeposit.trangThai,
    date: new Date(backendDeposit.ngayCoc).toISOString().split("T")[0],
    expireAt: backendDeposit.hanThanhToan,
    createdBy: backendDeposit.maNV,
    type: isGiuong ? "giường" : "phòng",
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
    "Chờ duyệt": "ChoThanhToan",
    "Đã duyệt": "DaThanhToan",
    "Đã hủy (Quá hạn)": "TuDongHuy",
    "Đã hủy (Thủ công)": "HuyThuCong",
  };

  return statusMap[frontendStatus] || frontendStatus;
}
