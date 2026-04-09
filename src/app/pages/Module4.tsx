import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Button, Input } from "../components/ui";
import { contracts, rooms } from "../data/mockData";
import { Plus, Edit2, CheckCircle, FileText, Banknote, ShieldCheck, DoorOpen, Users, Key, AlertTriangle } from "lucide-react";

const PageHeader = ({ title, description, btnText }: { title: string, description: string, btnText?: string }) => (
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
    <div>
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      <p className="text-slate-500">{description}</p>
    </div>
    {btnText && <Button><Plus className="w-4 h-4 mr-2" /> {btnText}</Button>}
  </div>
);

// Xét duyệt điều kiện & Quản lý thành viên
export function ContractMembers() {
  const members = [
    { id: 'M001', name: 'Đặng Việt Hùng', type: 'Đại diện', cmt: '001099123456', dob: '2001-05-12', status: 'Đã duyệt', contract: 'CT001' },
    { id: 'M002', name: 'Nguyễn Tiến Khang', type: 'Ở ghép', cmt: '001099654321', dob: '2002-11-20', status: 'Chờ duyệt', contract: 'CT001' },
    { id: 'M003', name: 'Vũ Kiều Oanh', type: 'Đại diện', cmt: '001099999888', dob: '2000-01-01', status: 'Đã duyệt', contract: 'CT002' },
  ];
  return (
    <div className="space-y-4">
      <PageHeader title="Quản lý & Xét duyệt Thành viên" description="Quản lý nhân thân và duyệt hồ sơ trước khi ký hợp đồng." btnText="Thêm thành viên" />
      <div className="flex gap-4 mb-4">
        <Input placeholder="Tìm CMND/CCCD..." className="max-w-xs" />
        <select className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm">
          <option>Tất cả Hợp đồng</option>
          {contracts.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
        </select>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Mã TV</TableHead><TableHead>Họ Tên</TableHead><TableHead>CMND/CCCD</TableHead><TableHead>Ngày sinh</TableHead><TableHead>Vai trò</TableHead><TableHead>Thuộc HĐ</TableHead><TableHead>Tình trạng</TableHead><TableHead>Thao tác</TableHead></TableRow></TableHeader>
            <TableBody>
              {members.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.id}</TableCell>
                  <TableCell>{m.name}</TableCell>
                  <TableCell>{m.cmt}</TableCell>
                  <TableCell>{m.dob}</TableCell>
                  <TableCell>
                     <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase
                        ${m.type === 'Đại diện' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'}`}>
                        {m.type}
                     </span>
                  </TableCell>
                  <TableCell className="text-blue-600 font-semibold">{m.contract}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1 w-max
                      ${m.status === 'Đã duyệt' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {m.status === 'Đã duyệt' ? <ShieldCheck className="w-3 h-3"/> : <AlertTriangle className="w-3 h-3" />}
                      {m.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                       {m.status === 'Chờ duyệt' && <Button size="sm" className="h-7 text-xs bg-green-600">Duyệt</Button>}
                       <Button variant="ghost" size="icon" className="h-7 w-7"><Edit2 className="w-3 h-3" /></Button>
                    </div>
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

// Lập Hợp đồng thuê
export function ContractManage() {
  return (
    <div className="space-y-4">
      <PageHeader title="Quản lý Hợp đồng" description="Lập hợp đồng kế thừa dữ liệu từ phiếu cọc, ghi nhận chu kỳ thanh toán." btnText="Lập Hợp đồng mới" />
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Mã HĐ</TableHead><TableHead>Người đại diện</TableHead><TableHead>Phòng</TableHead><TableHead>Số người</TableHead><TableHead>Bắt đầu ở</TableHead><TableHead>Chu kỳ đóng</TableHead><TableHead>Trạng thái</TableHead><TableHead>Thao tác</TableHead></TableRow></TableHeader>
            <TableBody>
              {contracts.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium text-blue-700">{c.id}</TableCell>
                  <TableCell>{c.customer}</TableCell>
                  <TableCell className="font-bold">{c.room}</TableCell>
                  <TableCell>
                     <div className="flex items-center gap-1"><Users className="w-4 h-4 text-slate-400"/> {c.members}</div>
                  </TableCell>
                  <TableCell>{c.startDate}</TableCell>
                  <TableCell>{c.cycle}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-md text-xs font-semibold 
                      ${c.status === 'Đang thuê' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {c.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" className="text-xs h-7"><FileText className="w-3 h-3 mr-1" /> Chi tiết</Button>
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

// Thu tiền kỳ đầu
export function ContractReceipts() {
  const receipts = [
    { id: 'PT001', contract: 'CT001', type: 'Thu tiền phòng T4 + DV', amount: 5500000, date: '2026-04-05', status: 'Chưa thu' },
    { id: 'PT002', contract: 'CT002', type: 'Thu tiền phòng T10-T12', amount: 7200000, date: '2025-10-01', status: 'Đã thu' }
  ];
  return (
    <div className="space-y-4">
      <PageHeader title="Phiếu thu tiền kỳ đầu" description="Ghi nhận thu tiền thuê tháng đầu và phí dịch vụ khi khách bắt đầu dọn vào." />
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Mã PT</TableHead><TableHead>Hợp đồng</TableHead><TableHead>Nội dung</TableHead><TableHead>Số tiền (VND)</TableHead><TableHead>Ngày lập</TableHead><TableHead>Trạng thái</TableHead><TableHead>Thao tác</TableHead></TableRow></TableHeader>
            <TableBody>
              {receipts.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium text-green-700">{r.id}</TableCell>
                  <TableCell>{r.contract}</TableCell>
                  <TableCell>{r.type}</TableCell>
                  <TableCell className="font-bold text-red-500">{r.amount.toLocaleString()} đ</TableCell>
                  <TableCell>{r.date}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-md text-xs font-semibold 
                      ${r.status === 'Đã thu' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {r.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {r.status === 'Chưa thu' && (
                       <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700"><Banknote className="w-3 h-3 mr-1" /> Ghi nhận Thu</Button>
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

// Bàn giao phòng
export function ContractHandover() {
  return (
    <div className="space-y-6">
      <PageHeader title="Biên bản Bàn giao phòng" description="Check-list tài sản cấp phát và xác nhận đổi trạng thái." />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="bg-slate-50 border-b border-slate-200">
             <CardTitle className="text-lg flex items-center gap-2"><Key className="w-5 h-5 text-blue-600"/> Lập biên bản bàn giao (CT001)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4 text-sm">
            <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-slate-50 rounded-md border border-slate-100">
               <div><span className="text-slate-500">Người nhận:</span> <br/>Đặng Việt Hùng</div>
               <div><span className="text-slate-500">Phòng nhận:</span> <br/><span className="font-bold">R101 (2 giường)</span></div>
               <div><span className="text-slate-500">Ngày bàn giao:</span> <br/>05/04/2026</div>
               <div><span className="text-slate-500">Nhân viên BG:</span> <br/>Phạm Đình Bảo</div>
            </div>

            <h4 className="font-semibold text-slate-700 border-b pb-1">Check-list Tài sản cấp phát</h4>
            
            <div className="space-y-3">
              <label className="flex items-center space-x-3 bg-white p-2 border rounded shadow-sm hover:border-blue-300 transition-colors">
                <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                <span className="flex-1">2 Thẻ từ thang máy (Mã: TM-01, TM-02)</span>
              </label>
              
              <label className="flex items-center space-x-3 bg-white p-2 border rounded shadow-sm hover:border-blue-300 transition-colors">
                <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                <span className="flex-1">2 Chìa khóa tủ cá nhân (Tủ số 1, 2)</span>
              </label>
              
              <label className="flex items-center space-x-3 bg-white p-2 border rounded shadow-sm hover:border-blue-300 transition-colors">
                <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                <span className="flex-1">Xác nhận hiện trạng giường, nệm sạch sẽ, nguyên vẹn</span>
              </label>
              
              <label className="flex items-center space-x-3 bg-white p-2 border rounded shadow-sm hover:border-blue-300 transition-colors">
                <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                <span className="flex-1">Ghi nhận chỉ số điện đầu vào: <Input className="h-6 w-20 inline-block ml-2 text-xs py-0 px-1" defaultValue="150" /> kWh</span>
              </label>
            </div>

            <Button className="w-full mt-4 h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-md">
               <DoorOpen className="w-5 h-5 mr-2" /> Hoàn tất Bàn giao & Nhận phòng
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
           <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-4 flex items-start gap-3">
                 <AlertTriangle className="w-6 h-6 text-yellow-600 shrink-0" />
                 <div>
                    <h4 className="font-bold text-yellow-800 text-sm mb-1">Cập nhật Trạng thái Nhận phòng</h4>
                    <p className="text-xs text-yellow-700">Ngay khi bạn nhấn "Hoàn tất Bàn giao", hệ thống sẽ tự động đổi trạng thái 2 giường thuộc phòng R101 thành <strong>"Đang thuê"</strong>. Hợp đồng CT001 chính thức có hiệu lực tính phí lưu trú.</p>
                 </div>
              </CardContent>
           </Card>

           <Card>
              <CardHeader className="bg-slate-50 border-b border-slate-200 py-3">
                 <CardTitle className="text-sm font-semibold text-slate-700">Lịch sử bàn giao gần đây</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                 <Table>
                    <TableBody>
                       <TableRow>
                          <TableCell className="text-xs">
                             <div className="font-bold text-slate-800">CT002 - Vũ Kiều Oanh (R102)</div>
                             <div className="text-slate-500">Đã bàn giao: 01/10/2025</div>
                          </TableCell>
                          <TableCell className="text-right">
                             <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded">Hoàn tất</span>
                          </TableCell>
                       </TableRow>
                    </TableBody>
                 </Table>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}