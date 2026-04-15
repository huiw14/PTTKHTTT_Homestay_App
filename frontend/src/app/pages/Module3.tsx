import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Button, Input, Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui";
import { Plus, Edit2, CheckCircle, XCircle, Send, Calculator, AlertTriangle, ArrowRight, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useDepositStore } from "../hooks/useDepositStore";
import { transformBackendDeposit, transformToBackendPayload, mapStatusToBackend } from "../utils/depositTransform";
import { depositService } from "../services/depositService";

const PageHeader = ({ title, description }: { title: string, description: string }) => (
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
    <div>
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      <p className="text-slate-500">{description}</p>
    </div>
  </div>
);

// Lập phiếu Đặt cọc
export function DepositCreate() {
  const [depositType, setDepositType] = useState("giường");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedBedIds, setSelectedBedIds] = useState<string[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [loading, setLoading] = useState(false);
  const [availableBedsInRoom, setAvailableBedsInRoom] = useState<any[]>([]);
  const [loadingBeds, setLoadingBeds] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  
  const { addDeposit } = useDepositStore();
  
  const roomInfo = availableRooms.find(r => r.roomId === selectedRoom);
  const customerInfo = customers.find(c => c.id === selectedCustomer);
  
  // Fetch customers on mount
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoadingCustomers(true);
        // For now, we'll use a simple API call - you may need to create an endpoint for this
        // Since customers endpoint may not exist, let's handle gracefully
        const API_BASE = 'http://localhost:5000/api';
        const response = await fetch(`${API_BASE}/customers`, {
          headers: { 'Content-Type': 'application/json' },
        });
        
        if (response.ok) {
          const data = await response.json();
          setCustomers(data.data || []);
        } else {
          // Fallback - customers endpoint may not exist yet
          setCustomers([]);
        }
      } catch (error) {
        console.error('Error fetching customers:', error);
        setCustomers([]);
      } finally {
        setLoadingCustomers(false);
      }
    };
    
    fetchCustomers();
  }, []);
  
  // Fetch available rooms when deposit type changes
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoadingRooms(true);
        const response = await depositService.getAvailableRooms(depositType === "giường" ? "giường" : "phòng");
        
        if (response.success) {
          setAvailableRooms(response.availableRooms || []);
        }
      } catch (error) {
        console.error('Error fetching available rooms:', error);
        setAvailableRooms([]);
      } finally {
        setLoadingRooms(false);
      }
    };
    
    fetchRooms();
  }, [depositType]);
  
  // Fetch available beds from API when room is selected
  useEffect(() => {
    if (!selectedRoom) {
      setAvailableBedsInRoom([]);
      return;
    }

    const fetchAvailableBeds = async () => {
      try {
        setLoadingBeds(true);
        const response = await depositService.getAvailableBeds(depositType === "giường" ? "giường" : "phòng", selectedRoom);
        
        if (response.success) {
          if (depositType === "giường") {
            // Map giường type response
            setAvailableBedsInRoom(response.availableBeds || []);
          } else {
            // For phòng, if not available, show empty list
            if (response.isAvailable) {
              setAvailableBedsInRoom(response.bedsInRoom || []);
            } else {
              setAvailableBedsInRoom([]);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching available beds:', error);
        setAvailableBedsInRoom([]);
      } finally {
        setLoadingBeds(false);
      }
    };

    fetchAvailableBeds();
  }, [selectedRoom, depositType]);
  
  // Calculate deposit
  let calculatedDeposit = 0;
  if (roomInfo) {
    if (depositType === "giường") {
      calculatedDeposit = (Number(roomInfo.roomPrice) * 2) * selectedBedIds.length;
    } else {
      // For "phòng" type, calculate for all beds in room
      calculatedDeposit = (Number(roomInfo.roomPrice) * 2) * (roomInfo.totalBeds || roomInfo.capacity || 0);
    }
  }

  // Toggle bed selection
  const toggleBedSelection = (bedId: string) => {
    setSelectedBedIds(prev => 
      prev.includes(bedId) 
        ? prev.filter(id => id !== bedId)
        : [...prev, bedId]
    );
  };

  // Reset selections when type changes
  const handleTypeChange = (newType: string) => {
    setDepositType(newType);
    setSelectedRoom("");
    setSelectedBedIds([]);
  };

  // Reset bed selections when room changes
  const handleRoomChange = (roomId: string) => {
    setSelectedRoom(roomId);
    setSelectedBedIds([]);
  };

  // Create deposit via API
  const handleCreateDeposit = async () => {
    // Prevent double submit
    if (loading) return;
    
    try {
      setLoading(true);

      // Validation
      if (!selectedCustomer || !selectedRoom || (depositType === "giường" && selectedBedIds.length === 0)) {
        throw new Error("Vui lòng chọn đầy đủ: khách hàng, phòng" + (depositType === "giường" ? ", và giường" : ""));
      }

      const bedCount = depositType === "giường" ? selectedBedIds.length : roomInfo?.totalBeds || 0;
      const totalDeposit = (Number(roomInfo?.roomPrice) || 0) * 2 * bedCount;

      // Call API
      const payload = {
        maKH: selectedCustomer,
        maNV: "NV001", // Current user (mock)
        maCN: "CN001", // Current branch (mock)
        tienCoc: totalDeposit,
        beds: selectedBedIds, // API will handle bed updates
      };

      const response = await depositService.createDeposit(payload);

      if (response.success) {
        toast.success(`✓ Tạo phiếu cọc thành công!\nMã: ${response.data.maPC} | Tiền: ${totalDeposit.toLocaleString()}đ`);

        // Reset form
        setSelectedCustomer("");
        setSelectedRoom("");
        setSelectedBedIds([]);
        setDepositType("giường");
        
        // Refresh available rooms
        const roomsResponse = await depositService.getAvailableRooms("giường");
        if (roomsResponse.success) {
          setAvailableRooms(roomsResponse.availableRooms || []);
        }
      } else {
        throw new Error(response.message || "Tạo phiếu cọc thất bại");
      }
    } catch (err: any) {
      const message = err.message || "Lỗi tạo phiếu cọc";
      toast.error(message);
      console.error("Create deposit error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Lập phiếu Đặt cọc" description="Tạo phiếu cọc. Hệ thống tự động tính tiền (Giá thuê 2 tháng x Số giường)." />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Thông tin phiếu cọc</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Khách hàng đại diện</label>
              <select 
                className="w-full h-12 px-4 text-sm rounded-md border border-slate-200 bg-white appearance-none cursor-pointer focus:outline-none focus:border-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                disabled={loading || loadingCustomers}
              >
                <option value="">-- Chọn khách hàng --</option>
                {loadingCustomers ? (
                  <option disabled>Đang tải...</option>
                ) : customers.length === 0 ? (
                  <option disabled>Không có khách hàng</option>
                ) : (
                  customers.map(c => (
                    <option key={c.maKH || c.id} value={c.maKH || c.id}>
                      {c.hoTen || c.name} - {c.soDienThoai || c.phone}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Loại</label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer disabled:opacity-50">
                  <input 
                    type="radio" 
                    name="depositType" 
                    value="giường" 
                    checked={depositType === "giường"}
                    onChange={(e) => handleTypeChange(e.target.value)}
                    className="w-4 h-4"
                    disabled={loading}
                  />
                  <span className="text-sm">Giường</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="depositType" 
                    value="phòng" 
                    checked={depositType === "phòng"}
                    onChange={(e) => handleTypeChange(e.target.value)}
                    className="w-4 h-4"
                    disabled={loading}
                  />
                  <span className="text-sm">Phòng</span>
                </label>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Chọn phòng</label>
              <select 
                className="w-full h-12 px-4 text-sm rounded-md border border-slate-200 bg-white appearance-none cursor-pointer focus:outline-none focus:border-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                value={selectedRoom}
                onChange={(e) => handleRoomChange(e.target.value)}
                disabled={loading || loadingRooms}
              >
                <option value="">-- Chọn phòng --</option>
                {loadingRooms ? (
                  <option disabled>Đang tải...</option>
                ) : availableRooms.length === 0 ? (
                  <option disabled>Không có phòng trống</option>
                ) : (
                  availableRooms.map(r => (
                    <option key={r.roomId} value={r.roomId}>
                      {depositType === "giường" 
                        ? `${r.roomId} - ${Number(r.roomPrice).toLocaleString()}đ/tháng (Còn ${r.availableBeds} giường trống)`
                        : `${r.roomId} - ${Number(r.roomPrice).toLocaleString()}đ/tháng (${r.totalBeds} giường)`
                      }
                    </option>
                  ))
                )}
              </select>
            </div>

            {selectedRoom && depositType === "giường" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Chọn giường</label>
                <div className="border border-slate-200 rounded-md p-3 space-y-2 max-h-48 overflow-y-auto">
                  {loadingBeds ? (
                    <div className="text-xs text-slate-500 italic py-4 text-center flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Đang tải...
                    </div>
                  ) : availableBedsInRoom.length > 0 ? (
                    availableBedsInRoom.map((bed: any) => (
                      <label key={bed.bedId} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-slate-50 rounded">
                        <input 
                          type="checkbox" 
                          checked={selectedBedIds.includes(bed.bedId)}
                          onChange={() => toggleBedSelection(bed.bedId)}
                          className="w-4 h-4"
                          disabled={loading}
                        />
                        <span className="text-sm">{bed.bedName}</span>
                      </label>
                    ))
                  ) : (
                    <div className="text-xs text-slate-500 italic py-4 text-center">
                      Không có giường trống trong phòng này
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-blue-50/50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-blue-800">
              <Calculator className="w-5 h-5" /> Bảng tính tiền cọc
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {roomInfo && (depositType === "phòng" || selectedBedIds.length > 0) ? (
              <>
                <div className="flex justify-between text-sm pb-2 border-b border-blue-100">
                  <span className="text-slate-600">Giá phòng 1 tháng:</span>
                  <span className="font-semibold">{Number(roomInfo.roomPrice).toLocaleString()} đ</span>
                </div>
                <div className="flex justify-between text-sm pb-2 border-b border-blue-100">
                  <span className="text-slate-600">Số tháng yêu cầu cọc:</span>
                  <span className="font-semibold">2 tháng</span>
                </div>
                <div className="flex justify-between text-sm pb-2 border-b border-blue-100">
                  <span className="text-slate-600">{depositType === "giường" ? "Số giường cọc:" : "Tổng giường phòng:"}</span>
                  <span className="font-semibold">{depositType === "giường" ? `${selectedBedIds.length} giường` : `${roomInfo.totalBeds || roomInfo.capacity} giường`}</span>
                </div>
                <div className="flex justify-between text-lg pt-4 pb-2 text-blue-800">
                  <span className="font-bold">Tổng tiền cọc phải đóng:</span>
                  <span className="font-bold">{calculatedDeposit.toLocaleString()} đ</span>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mt-4 text-xs text-yellow-800 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>
                    <strong>Lưu ý Hệ thống:</strong> Ngay khi lập phiếu, {depositType === "giường" ? `${selectedBedIds.length} giường này` : "tất cả giường trong phòng"} sẽ bị khóa trong 24h để chờ thanh toán. Các Sale khác sẽ không thấy {depositType === "giường" ? "giường" : "phòng"} này trên hệ thống tìm kiếm.
                  </p>
                </div>
                
                <Button 
                  className="w-full mt-4 h-12 text-base font-bold bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
                  onClick={handleCreateDeposit}
                  disabled={!selectedCustomer || !selectedRoom || (depositType === "giường" && selectedBedIds.length === 0) || loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang tạo...
                    </>
                  ) : (
                    <>
                      Tạo Phiếu & Khóa Phòng <ArrowRight className="w-4 h-4 ml-2"/>
                    </>
                  )}
                </Button>
              </>
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-400 text-sm italic text-center">
                {depositType === "giường" 
                  ? "Vui lòng chọn phòng và giường để xem công thức tính cọc"
                  : "Vui lòng chọn phòng để xem công thức tính cọc"
                }
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Quản lý Cọc
export function DepositManage() {
  const { updateDeposit, loading: storeLoading, error: storeError } = useDepositStore();
  const [allDeposits, setAllDeposits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDeposit, setSelectedDeposit] = useState<any>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "amount-desc" | "amount-asc" | "status">("date-desc");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalDeposits, setTotalDeposits] = useState(0);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [approveDepositId, setApproveDepositId] = useState<string | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [detailDeposit, setDetailDeposit] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteDepositId, setDeleteDepositId] = useState<string | null>(null);
  const LIMIT = 5;

  // Load deposits on mount
  useEffect(() => {
    loadDeposits();
  }, []);

  // Reset page when sort or status changes
  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy, statusFilter]);

  // Load deposits when currentPage, sortBy, or statusFilter changes
  useEffect(() => {
    loadDeposits();
  }, [currentPage, sortBy, statusFilter]);

  const loadDeposits = async () => {
    try {
      setLoading(true);

      // Fetch ONLY from backend API with search, sort, status filter, and pagination
      const response = await depositService.getDeposits({
        search: searchTerm,
        sortBy: sortBy,
        status: statusFilter,
        page: currentPage,
        limit: LIMIT,
      });

      if (response.success && response.data) {
        const transformed = (response.data || []).map(transformBackendDeposit);
        setAllDeposits(transformed);
        
        // Track pagination info
        if (response.pagination) {
          setTotalPages(response.pagination.pages || 0);
          setTotalDeposits(response.pagination.total || 0);
        }
      } else {
        setAllDeposits([]);
        setTotalDeposits(0);
        setTotalPages(0);
      }
    } catch (err: any) {
      toast.error("Lỗi tải danh sách phiếu cọc");
      console.error("Load deposits error:", err);
      setAllDeposits([]);
      setTotalDeposits(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (depositId: string, newStatus: string) => {
    try {
      setUpdating(depositId);
      setError(null);

      const backendStatus = mapStatusToBackend(newStatus);
      const response = await depositService.updateDeposit(depositId, {
        trangThai: backendStatus,
      });

      if (response.success) {
        const transformedDeposit = transformBackendDeposit(response.data);
        setAllDeposits((prev) =>
          prev.map((d) => (d.id === depositId ? transformedDeposit : d))
        );
      } else {
        throw new Error(response.message || "Failed to update deposit");
      }
    } catch (err: any) {
      const message = err.message || "Error updating deposit";
      setError(message);
      console.error("Update deposit error:", err);
    } finally {
      setUpdating(null);
    }
  };

  const handleSendPaymentRequest = async (depositId: string) => {
    try {
      setUpdating(depositId);
      setError(null);

      const response = await depositService.sendPaymentRequest(depositId);

      if (response.success) {
        // Show success message
        toast.success(`Yêu cầu thanh toán đã được gửi cho khách hàng (${response.data.customerEmail})`);
      } else {
        throw new Error(response.message || "Failed to send payment request");
      }
    } catch (err: any) {
      const message = err.message || "Error sending payment request";
      setError(message);
      toast.error(message);
      console.error("Send payment request error:", err);
    } finally {
      setUpdating(null);
    }
  };

  const handleApprovePaymentConfirm = async () => {
    if (!approveDepositId) return;

    try {
      setUpdating(approveDepositId);
      setError(null);

      const response = await depositService.approvePayment(approveDepositId);

      if (response.success) {
        // Update local state
        const transformedDeposit = transformBackendDeposit(response.data);
        setAllDeposits((prev) =>
          prev.map((d) => (d.id === approveDepositId ? transformedDeposit : d))
        );
        toast.success('✓ Duyệt phiếu cọc thành công. Phiếu cọc chuyển sang "Đã duyệt"');
        setApproveDialogOpen(false);
        setApproveDepositId(null);
      } else {
        throw new Error(response.message || "Failed to approve payment");
      }
    } catch (err: any) {
      const message = err.message || "Error approving payment";
      setError(message);
      toast.error(message);
      console.error("Approve payment error:", err);
    } finally {
      setUpdating(null);
    }
  };

  const handleViewDetail = async (depositId: string) => {
    try {
      setLoadingDetail(true);
      setError(null);
      const response = await depositService.getDepositDetail(depositId);
      if (response.success) {
        const transformed = transformBackendDeposit(response.data);
        setDetailDeposit(transformed);
        setDetailDialogOpen(true);
      } else {
        throw new Error(response.message || "Failed to load deposit detail");
      }
    } catch (err: any) {
      const message = err.message || "Error loading deposit detail";
      setError(message);
      toast.error(message);
      console.error("Load detail error:", err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const depositType = selectedDeposit 
    ? Array.isArray(selectedDeposit?.beds) && selectedDeposit?.beds?.length > 0 ? "giường" : "phòng" 
    : null;
  
  const bedsDetail = selectedDeposit && Array.isArray(selectedDeposit?.beds) 
    ? beds.filter(b => selectedDeposit?.beds?.includes(b.id))
    : [];
  
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Quản lý Phiếu cọc" 
        description="Theo dõi, gửi yêu cầu thanh toán, xét duyệt cọc và xử lý hủy." 
      />

      {/* Approve Payment Confirmation Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">Xác nhận duyệt phiếu cọc?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Bạn sắp duyệt phiếu cọc <strong>{approveDepositId}</strong>.
            </p>
            <p className="text-sm text-slate-600">
              Sau khi duyệt, trạng thái phiếu cọc sẽ chuyển sang <strong className="text-green-600">"Đã duyệt"</strong>.
            </p>
            <div className="flex gap-3 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setApproveDialogOpen(false)}
                disabled={updating === approveDepositId}
              >
                Hủy
              </Button>
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={handleApprovePaymentConfirm}
                disabled={updating === approveDepositId}
              >
                {updating === approveDepositId ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Xác nhận duyệt
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Deposit Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">Chi tiết phiếu cọc {detailDeposit?.id}</DialogTitle>
          </DialogHeader>
          {loadingDetail ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <span>Đang tải...</span>
            </div>
          ) : detailDeposit ? (
            <div className="space-y-6">
              {/* Khách hàng & Nhân viên */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Khách hàng</h4>
                  <p className="text-sm font-medium">{detailDeposit.customerName}</p>
                  <p className="text-xs text-slate-500">{detailDeposit.customerPhone}</p>
                  <p className="text-xs text-slate-500">{detailDeposit.customerEmail || "Chưa có email"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Nhân viên</h4>
                  <p className="text-sm font-medium">{detailDeposit.staffName}</p>
                </div>
              </div>

              {/* Phòng & Loại */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Phòng</h4>
                  <p className="text-sm font-medium">{detailDeposit.roomName}</p>
                  <p className="text-xs text-slate-500">Loại: {detailDeposit.depositType}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Trạng thái</h4>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    detailDeposit.status === 'Đã duyệt' ? 'bg-green-100 text-green-700' : 
                    detailDeposit.status === 'Chờ duyệt' ? 'bg-orange-100 text-orange-700' : 
                    'bg-red-100 text-red-700'
                  }`}>
                    {detailDeposit.status}
                  </span>
                </div>
              </div>

              {/* Tiền cọc */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Số tiền cọc</h4>
                  <p className="text-sm font-bold text-blue-600">{detailDeposit.amount.toLocaleString('vi-VN')} đ</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Ngày lập</h4>
                  <p className="text-sm">{new Date(detailDeposit.date).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>

              {/* Giường chi tiết (nếu có) */}
              {detailDeposit.bedsDetail && detailDeposit.bedsDetail.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Giường cọc</h4>
                  <div className="text-sm space-y-1">
                    {detailDeposit.bedsDetail.map((bed: any, idx: number) => (
                      <div key={idx} className="text-slate-600">• {bed.bedName}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-slate-100 border border-slate-200 rounded-md p-3 mb-6 flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
        <p className="text-xs text-slate-600">
          <strong>Tiến trình tự động:</strong> Hệ thống đang chạy ngầm kiểm tra. Các phiếu cọc quá hạn 24h chưa duyệt thanh toán sẽ tự động chuyển sang trạng thái "Đã hủy (Quá hạn)" và giải phóng phòng/giường.
        </p>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-6 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-slate-600">Đang tải danh sách...</span>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Search and Sort Controls */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="flex-1">
              <Input
                placeholder="Tìm kiếm theo mã phiếu, khách hàng hoặc phòng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    setCurrentPage(1);
                    loadDeposits();
                  }
                }}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-slate-300 rounded-md text-sm font-medium bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date-desc">Mới nhất</option>
                <option value="date-asc">Cũ nhất</option>
                <option value="amount-desc">Tiền cao nhất</option>
                <option value="amount-asc">Tiền thấp nhất</option>
                <option value="status">Trạng thái</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-md text-sm font-medium bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="ChoDuyet">Chờ duyệt</option>
                <option value="DaDuyet">Đã duyệt</option>
                <option value="DaHuy">Đã hủy</option>
              </select>
              {searchTerm && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchTerm("")}
                  className="text-slate-600"
                >
                  Xóa tìm kiếm
                </Button>
              )}
            </div>
          </div>

          {/* Results count and pagination */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="text-sm text-slate-600">
              {allDeposits.length > 0 ? (
                <>
                  Hiển thị phiếu từ <span className="font-semibold">{(currentPage - 1) * LIMIT + 1}</span> đến <span className="font-semibold">{Math.min(currentPage * LIMIT, totalDeposits)}</span> trên <span className="font-semibold">{totalDeposits}</span> tổng số phiếu cọc
                  {searchTerm && <span className="font-medium"> (Tìm kiếm: "{searchTerm}")</span>}
                </>
              ) : (
                <span>{searchTerm ? "Không tìm thấy phiếu cọc nào" : "Chưa có phiếu cọc nào"}</span>
              )}
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1 || loading}
                className="p-2"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      disabled={loading}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages || totalPages === 0 || loading}
                className="p-2"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              
              <span className="text-xs text-slate-500 ml-2">
                Trang {currentPage} / {totalPages}
              </span>
            </div>
            )}
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow><TableHead>Mã Phiếu</TableHead><TableHead>Khách hàng</TableHead><TableHead>Phòng</TableHead><TableHead>Loại</TableHead><TableHead>Số tiền (VND)</TableHead><TableHead>Ngày lập</TableHead><TableHead>Trạng thái</TableHead><TableHead>Thao tác nhanh</TableHead></TableRow></TableHeader>
                <TableBody>
                  {allDeposits.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                        {searchTerm ? "Không tìm thấy phiếu cọc nào" : "Chưa có phiếu cọc nào"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    allDeposits.map((d) => {
                      const depType = Array.isArray(d.beds) && d.beds.length > 0 ? "giường" : "phòng";
                      return (
                        <TableRow key={d.id}>
                          <TableCell className="font-medium text-blue-600">{d.id}</TableCell>
                          <TableCell>{d.customer}</TableCell>
                          <TableCell className={`font-semibold ${depType === "giường" ? "cursor-pointer text-blue-600 hover:underline" : ""}`} onClick={() => depType === "giường" && setSelectedDeposit(d)}>{d.room}</TableCell>
                          <TableCell><span className="px-2 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">{depType === "giường" ? "Giường" : "Phòng"}</span></TableCell>
                          <TableCell className="font-bold text-red-500">{d.amount.toLocaleString()} đ</TableCell>
                          <TableCell>{d.date}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-md text-xs font-semibold inline-flex items-center gap-1
                              ${d.status === 'Đã duyệt' ? 'bg-green-100 text-green-700' : 
                                d.status === 'Chờ duyệt' ? 'bg-orange-100 text-orange-700' : 
                                d.status === 'Đã thanh toán' ? 'bg-green-100 text-green-700' :
                                'bg-red-100 text-red-700'}`}>
                              {d.status === 'Đã thanh toán' && <CheckCircle className="w-3 h-3"/>}
                            {d.status === 'Đã duyệt' && <CheckCircle className="w-3 h-3"/>}
                              {d.status === 'Đã thanh toán' && <CheckCircle className="w-3 h-3"/>}
                              {d.status === 'Chờ duyệt' && <AlertTriangle className="w-3 h-3"/>}
                              {d.status.includes('hủy') && <XCircle className="w-3 h-3"/>}
                              {d.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            {d.status === 'Chờ duyệt' && (
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="text-xs bg-white text-blue-600 border-blue-200 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed" 
                                  title="Gửi Yêu cầu Thanh toán"
                                  disabled={updating === d.id}
                                  onClick={() => handleSendPaymentRequest(d.id)}
                                >
                                  {updating === d.id ? (
                                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                  ) : (
                                    <Send className="w-3 h-3 mr-1" />
                                  )}
                                  Gửi KH
                                </Button>
                                <Button 
                                  size="sm" 
                                  className="text-xs bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed" 
                                  title="Duyệt Thanh toán"
                                  disabled={updating === d.id}
                                  onClick={() => {
                                    setApproveDepositId(d.id);
                                    setApproveDialogOpen(true);
                                  }}
                                >
                                  {updating === d.id ? (
                                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                  ) : (
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                  )}
                                  Duyệt
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive" 
                                  className="text-xs disabled:opacity-50 disabled:cursor-not-allowed" 
                                  title="Hủy phiếu thủ công"
                                  disabled={updating === d.id}
                                  onClick={() => {
                                    setDeleteDepositId(d.id);
                                    setDeleteConfirmOpen(true);
                                  }}
                                >
                                  {updating === d.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <XCircle className="w-3 h-3" />
                                  )}
                                </Button>
                              </div>
                            )}
                            {d.status === 'Đã duyệt' && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-xs text-slate-500 hover:text-blue-600"
                                onClick={() => handleViewDetail(d.id)}
                                disabled={loadingDetail}
                              >
                                {loadingDetail ? (
                                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                ) : null}
                                Xem chi tiết
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-red-600">Xác nhận hủy phiếu cọc</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Bạn chắc chắn muốn hủy phiếu cọc này? Hành động này không thể hoàn tác.
            </p>
          </div>
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => {
                setDeleteConfirmOpen(false);
                setDeleteDepositId(null);
              }}
              disabled={updating === deleteDepositId}
            >
              Hủy bỏ
            </Button>
            <Button 
              variant="destructive" 
              onClick={async () => {
                if (deleteDepositId) {
                  await handleStatusUpdate(deleteDepositId, "Đã hủy (Thủ công)");
                  setDeleteConfirmOpen(false);
                  setDeleteDepositId(null);
                }
              }}
              disabled={updating === deleteDepositId}
            >
              {updating === deleteDepositId ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang xử lý...
                </>
              ) : (
                "Xác nhận hủy"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog chi tiết giường */}
      <Dialog open={!!selectedDeposit && depositType === "giường"} onOpenChange={(open: boolean) => !open && setSelectedDeposit(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Chi tiết Các Giường Được Cọc</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="text-sm text-slate-600">
              <p><strong>Mã phiếu:</strong> {selectedDeposit?.id}</p>
              <p><strong>Phòng:</strong> {selectedDeposit?.room}</p>
              <p><strong>Khách hàng:</strong> {selectedDeposit?.customer}</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-2">Danh sách giường:</h4>
              <div className="space-y-2">
                {bedsDetail.length > 0 ? (
                  bedsDetail.map(bed => (
                    <div key={bed.id} className="p-2 bg-slate-50 rounded border border-slate-200 text-sm">
                      <p><strong>{bed.bedName}</strong> (Giường {bed.bedNumber})</p>
                      <p className="text-xs text-slate-500">Mã: {bed.id}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">Không có thông tin giường</p>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}