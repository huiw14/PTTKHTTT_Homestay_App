import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Button, Input } from "../components/ui";
import { deposits, customers, rooms } from "../data/mockData";
import { Plus, Edit2, CheckCircle, XCircle, Send, Calculator, AlertTriangle, ArrowRight } from "lucide-react";

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
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedBeds, setSelectedBeds] = useState(1);
  
  const roomInfo = rooms.find(r => r.id === selectedRoom);
  const calculatedDeposit = roomInfo ? (roomInfo.price * 2) * selectedBeds : 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Lập phiếu Đặt cọc" description="Tạo phiếu cọc. Hệ thống tự động tính tiền (Giá thuê 2 tháng x Số giường)." />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Thông tin phiếu cọc</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Khách hàng đại diện</label>
              <select className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500">
                <option value="">-- Chọn khách hàng --</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>)}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Chọn Phòng / Giường trống</label>
              <select 
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setSelectedRoom(e.target.value)}
              >
                <option value="">-- Chọn phòng --</option>
                {rooms.filter(r => r.status === 'Còn trống').map(r => 
                  <option key={r.id} value={r.id}>{r.id} - {r.price.toLocaleString()}đ/tháng (Còn {r.capacity - r.occupied} trống)</option>
                )}
              </select>
            </div>

            {selectedRoom && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Số giường muốn cọc</label>
                <Input 
                  type="number" 
                  min="1" 
                  max={roomInfo ? roomInfo.capacity - roomInfo.occupied : 1}
                  value={selectedBeds} 
                  onChange={(e) => setSelectedBeds(parseInt(e.target.value) || 1)}
                />
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
            {roomInfo ? (
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
                  <span className="text-slate-600">Số giường cọc:</span>
                  <span className="font-semibold">{selectedBeds} giường</span>
                </div>
                <div className="flex justify-between text-lg pt-4 pb-2 text-blue-800">
                  <span className="font-bold">Tổng tiền cọc phải đóng:</span>
                  <span className="font-bold">{calculatedDeposit.toLocaleString()} đ</span>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mt-4 text-xs text-yellow-800 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>
                    <strong>Lưu ý Hệ thống:</strong> Ngay khi lập phiếu, phòng sẽ bị khóa trong 24h để chờ thanh toán. Các Sale khác sẽ không thấy giường này trên hệ thống tìm kiếm.
                  </p>
                </div>
                
                <Button className="w-full mt-4 h-12 text-base font-bold bg-blue-600 hover:bg-blue-700">Tạo Phiếu & Khóa Phòng <ArrowRight className="w-4 h-4 ml-2"/></Button>
              </>
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-400 text-sm italic text-center">
                Vui lòng chọn khách hàng và phòng<br/>để xem công thức tính cọc
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
            <TableHeader><TableRow><TableHead>Mã Phiếu</TableHead><TableHead>Khách hàng</TableHead><TableHead>Phòng</TableHead><TableHead>Số tiền (VND)</TableHead><TableHead>Ngày lập</TableHead><TableHead>Trạng thái</TableHead><TableHead>Thao tác nhanh</TableHead></TableRow></TableHeader>
            <TableBody>
              {deposits.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium text-blue-600">{d.id}</TableCell>
                  <TableCell>{d.customer}</TableCell>
                  <TableCell className="font-semibold">{d.room}</TableCell>
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}