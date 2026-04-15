import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Button, Input, Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui";
import { deposits as mockDeposits, customers, rooms, beds } from "../data/mockData";
import { Plus, Edit2, CheckCircle, XCircle, Send, Calculator, AlertTriangle, ArrowRight } from "lucide-react";
import { useDepositStore } from "../hooks/useDepositStore";

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
  
  const { addDeposit } = useDepositStore();
  
  const roomInfo = rooms.find(r => r.id === selectedRoom);
  const customerInfo = customers.find(c => c.id === selectedCustomer);
  
  // Get available beds for selected room
  const availableBedsInRoom = selectedRoom 
    ? beds.filter(b => b.roomId === selectedRoom && b.status === "Trống")
    : [];
  
  // Filter rooms based on type
  const availableRooms = depositType === "giường" 
    ? rooms.filter(r => beds.some(b => b.roomId === r.id && b.status === "Trống"))
    : rooms.filter(r => beds.every(b => b.roomId !== r.id || b.status === "Trống")); // Only rooms with ALL beds empty
  
  // Calculate deposit
  let calculatedDeposit = 0;
  if (roomInfo) {
    if (depositType === "giường") {
      calculatedDeposit = (roomInfo.price * 2) * selectedBedIds.length;
    } else {
      // For "phòng" type, calculate for all beds in room
      calculatedDeposit = (roomInfo.price * 2) * roomInfo.capacity;
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

  // Mock create deposit
  const handleCreateDeposit = () => {
    if (!selectedCustomer || !selectedRoom || (depositType === "giường" && selectedBedIds.length === 0)) {
      alert("Vui lòng chọn đầy đủ: khách hàng, phòng" + (depositType === "giường" ? ", và giường" : ""));
      return;
    }

    const newDepositId = `DC${Math.floor(Math.random() * 1000).toString().padStart(2, "0")}`;
    const bedCount = depositType === "giường" ? selectedBedIds.length : roomInfo?.capacity || 0;
    const totalDeposit = (roomInfo?.price || 0) * 2 * bedCount;

    const newDeposit = {
      id: newDepositId,
      customerId: selectedCustomer,
      customer: customerInfo?.name || "",
      roomId: selectedRoom,
      room: selectedRoom,
      beds: selectedBedIds,
      amount: totalDeposit,
      status: "Chờ duyệt",
      date: new Date().toISOString().split("T")[0],
      expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      createdBy: "NV02"
    };

    // Add to session store
    addDeposit(newDeposit);

    // Show success message
    alert(`✓ Tạo phiếu cọc thành công!\n\nMã phiếu: ${newDepositId}\nKhách: ${customerInfo?.name}\nPhòng: ${selectedRoom}\nSố giường: ${bedCount}\nTổng tiền: ${totalDeposit.toLocaleString()}đ`);
    
    // Reset form
    setSelectedCustomer("");
    setSelectedRoom("");
    setSelectedBedIds([]);
    setDepositType("giường");
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
                className="w-full h-12 px-4 text-sm rounded-md border border-slate-200 bg-white appearance-none cursor-pointer focus:outline-none focus:border-blue-500"
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
              >
                <option value="">-- Chọn khách hàng --</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Loại</label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="depositType" 
                    value="giường" 
                    checked={depositType === "giường"}
                    onChange={(e) => handleTypeChange(e.target.value)}
                    className="w-4 h-4"
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
                  />
                  <span className="text-sm">Phòng</span>
                </label>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Chọn phòng</label>
              <select 
                className="w-full h-12 px-4 text-sm rounded-md border border-slate-200 bg-white appearance-none cursor-pointer focus:outline-none focus:border-blue-500"
                value={selectedRoom}
                onChange={(e) => handleRoomChange(e.target.value)}
              >
                <option value="">-- Chọn phòng --</option>
                {availableRooms.map(r => (
                  <option key={r.id} value={r.id}>
                    {depositType === "giường" 
                      ? `${r.id} - ${r.price.toLocaleString()}đ/tháng (Còn ${beds.filter(b => b.roomId === r.id && b.status === "Trống").length} trống)`
                      : `${r.id} - ${r.price.toLocaleString()}đ/tháng (${r.capacity} giường)`
                    }
                  </option>
                ))}
              </select>
            </div>

            {selectedRoom && depositType === "giường" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Chọn giường</label>
                <div className="border border-slate-200 rounded-md p-3 space-y-2 max-h-48 overflow-y-auto">
                  {availableBedsInRoom.length > 0 ? (
                    availableBedsInRoom.map(bed => (
                      <label key={bed.id} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-slate-50 rounded">
                        <input 
                          type="checkbox" 
                          checked={selectedBedIds.includes(bed.id)}
                          onChange={() => toggleBedSelection(bed.id)}
                          className="w-4 h-4"
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
                  <span className="font-semibold">{roomInfo.price.toLocaleString()} đ</span>
                </div>
                <div className="flex justify-between text-sm pb-2 border-b border-blue-100">
                  <span className="text-slate-600">Số tháng yêu cầu cọc:</span>
                  <span className="font-semibold">2 tháng</span>
                </div>
                <div className="flex justify-between text-sm pb-2 border-b border-blue-100">
                  <span className="text-slate-600">{depositType === "giường" ? "Số giường cọc:" : "Tổng giường phòng:"}</span>
                  <span className="font-semibold">{depositType === "giường" ? `${selectedBedIds.length} giường` : `${roomInfo.capacity} giường`}</span>
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
                  disabled={!selectedCustomer || !selectedRoom || (depositType === "giường" && selectedBedIds.length === 0)}
                >
                  Tạo Phiếu & Khóa Phòng <ArrowRight className="w-4 h-4 ml-2"/>
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
  const { deposits: sessionDeposits } = useDepositStore();
  const allDeposits = [...sessionDeposits, ...mockDeposits];
  const [selectedDeposit, setSelectedDeposit] = useState<any>(null);
  
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
      
      <div className="bg-slate-100 border border-slate-200 rounded-md p-3 mb-6 flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
        <p className="text-xs text-slate-600">
          <strong>Tiến trình tự động:</strong> Hệ thống đang chạy ngầm kiểm tra. Các phiếu cọc quá hạn 24h chưa duyệt thanh toán sẽ tự động chuyển sang trạng thái "Đã hủy (Quá hạn)" và giải phóng phòng/giường.
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Mã Phiếu</TableHead><TableHead>Khách hàng</TableHead><TableHead>Phòng</TableHead><TableHead>Loại</TableHead><TableHead>Số tiền (VND)</TableHead><TableHead>Ngày lập</TableHead><TableHead>Trạng thái</TableHead><TableHead>Thao tác nhanh</TableHead></TableRow></TableHeader>
            <TableBody>
              {allDeposits.map((d) => {
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
                        'bg-red-100 text-red-700'}`}>
                      {d.status === 'Đã duyệt' && <CheckCircle className="w-3 h-3"/>}
                      {d.status === 'Chờ duyệt' && <AlertTriangle className="w-3 h-3"/>}
                      {d.status.includes('hủy') && <XCircle className="w-3 h-3"/>}
                      {d.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {d.status === 'Chờ duyệt' && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-xs bg-white text-blue-600 border-blue-200 hover:bg-blue-50" title="Gửi Yêu cầu TT">
                           <Send className="w-3 h-3 mr-1" /> Gửi KH
                        </Button>
                        <Button size="sm" className="text-xs bg-green-600 hover:bg-green-700" title="Duyệt Thanh toán">
                           <CheckCircle className="w-3 h-3 mr-1" /> Duyệt
                        </Button>
                        <Button size="sm" variant="destructive" className="text-xs" title="Hủy phiếu thủ công">
                           <XCircle className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                    {d.status === 'Đã duyệt' && (
                       <Button size="sm" variant="outline" className="text-xs text-slate-500">
                          Xem chi tiết
                       </Button>
                    )}
                  </TableCell>
                </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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