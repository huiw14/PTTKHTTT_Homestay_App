import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Button, Input } from "../components/ui";
import { customers, rooms, branches } from "../data/mockData";
import { Plus, Edit2, Search, Calendar, Filter, Phone, Mail } from "lucide-react";

const PageHeader = ({ title, description, btnText }: { title: string, description: string, btnText?: string }) => (
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
    <div>
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      <p className="text-slate-500">{description}</p>
    </div>
    {btnText && <Button><Plus className="w-4 h-4 mr-2" /> {btnText}</Button>}
  </div>
);

// Quản lý Khách hàng
export function SalesCustomers() {
  return (
    <div className="space-y-4">
      <PageHeader title="Quản lý Khách hàng" description="Lưu trữ thông tin nhân thân cơ bản của người đại diện liên hệ/đặt cọc." btnText="Thêm Khách hàng" />
      <div className="flex gap-4 mb-4">
        <Input placeholder="Tìm theo tên hoặc số điện thoại..." className="max-w-md" />
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Mã KH</TableHead><TableHead>Họ Tên</TableHead><TableHead>Liên hệ</TableHead><TableHead>Nhu cầu ghi nhận</TableHead><TableHead>Trạng thái</TableHead><TableHead>Thao tác</TableHead></TableRow></TableHeader>
            <TableBody>
              {customers.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.id}</TableCell>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {c.phone}</span>
                      <span className="flex items-center gap-1 text-slate-500"><Mail className="w-3 h-3" /> {c.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate" title={c.demand}>{c.demand}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium 
                      ${c.status === 'Đã cọc' ? 'bg-green-100 text-green-700' : 
                        c.status === 'Hẹn xem phòng' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                      {c.status}
                    </span>
                  </TableCell>
                  <TableCell><Button variant="ghost" size="icon"><Edit2 className="w-4 h-4" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// Ghi nhận Yêu cầu thuê
export function SalesRequests() {
  const requests = [
    { id: 'RQ101', customer: 'Lê Hoàng Phúc', branch: 'Homestay Q.1', type: 'Phòng 4 Nữ', priceRange: 'Dưới 2tr5', time: 'Dự kiến 15/4 dọn vào', status: 'Đang theo dõi' },
    { id: 'RQ102', customer: 'Nguyễn Đức Anh', branch: 'Bất kỳ', type: 'Phòng 2', priceRange: 'Không quan trọng', time: 'Dự kiến đầu tháng 5', status: 'Mới' }
  ];
  return (
    <div className="space-y-4">
      <PageHeader title="Ghi nhận Yêu cầu thuê" description="Theo dõi chi tiết nhu cầu tìm phòng, tiêu chí của khách hàng." btnText="Tạo Yêu cầu mới" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {requests.map((r) => (
          <Card key={r.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-base text-blue-700">{r.id}</CardTitle>
              <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100">{r.status}</span>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex justify-between border-b pb-1"><span className="text-slate-500">Khách:</span> <span className="font-medium">{r.customer}</span></div>
              <div className="flex justify-between border-b pb-1"><span className="text-slate-500">Khu vực:</span> <span>{r.branch}</span></div>
              <div className="flex justify-between border-b pb-1"><span className="text-slate-500">Loại/Giá:</span> <span>{r.type} - {r.priceRange}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Thời gian:</span> <span>{r.time}</span></div>
              <div className="pt-2 mt-2">
                <Button variant="outline" size="sm" className="w-full">Tư vấn phòng phù hợp <Search className="w-3 h-3 ml-2" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Tra cứu Phòng/Giường trống
export function SalesSearch() {
  return (
    <div className="space-y-6">
      <PageHeader title="Tra cứu Phòng/Giường trống" description="Bộ lọc tìm kiếm phòng chưa cọc, còn trống chỗ." />
      
      <Card className="bg-white border-blue-100">
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500">Cơ sở / Chi nhánh</label>
            <select className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Tất cả cơ sở</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500">Giới tính</label>
            <select className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Tất cả</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500">Khoảng giá</label>
            <select className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Mọi mức giá</option>
              <option value="<2">Dưới 2 triệu</option>
              <option value="2-3">2 - 3 triệu</option>
              <option value=">3">Trên 3 triệu</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500">Trạng thái chỗ</label>
            <select className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">Tất cả</option>
              <option value="empty" selected>Chỉ phòng còn giường trống</option>
            </select>
          </div>
          <Button className="w-full"><Filter className="w-4 h-4 mr-2" /> Lọc</Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.filter(r => r.status === 'Còn trống').map(r => (
          <Card key={r.id} className="overflow-hidden flex flex-col">
            <div className="h-32 bg-slate-200 flex items-center justify-center relative">
               <span className="text-slate-400 font-medium">Hình ảnh phòng</span>
               <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                 {r.capacity - r.occupied} giường trống
               </div>
            </div>
            <CardContent className="p-4 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-lg">{r.id} - {r.type}</h3>
                  <p className="text-xs text-slate-500">{branches.find(b => b.id === r.branch)?.name}</p>
                </div>
                <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded font-medium">{r.gender}</span>
              </div>
              <p className="text-xl font-bold text-red-500 mt-2">{r.price.toLocaleString('vi-VN')} đ <span className="text-sm font-normal text-slate-500">/tháng/người</span></p>
              
              <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2 w-full mt-auto">
                 <Button variant="outline" className="flex-1 text-xs">Xem chi tiết</Button>
                 <Button className="flex-1 text-xs">Tiến hành cọc</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Quản lý Lịch hẹn xem phòng
export function SalesAppointments() {
  const appointments = [
    { id: 'AP01', customer: 'Lê Hoàng Phúc', room: 'R201, R202', time: '14:30 - Hôm nay', status: 'Sắp tới', sale: 'Thu Hà' },
    { id: 'AP02', customer: 'Nguyễn Đức Anh', room: 'R101', time: '09:00 - Ngày mai', status: 'Chưa xem', sale: 'Thu Hà' },
    { id: 'AP03', customer: 'Trần Phương Thảo', room: 'Bất kỳ, Q1', time: '10:00 - 01/04', status: 'Đã hoàn tất', result: 'Chốt cọc R201', sale: 'Thu Hà' },
  ];
  return (
    <div className="space-y-4">
      <PageHeader title="Quản lý Lịch hẹn xem phòng" description="Lên lịch, gửi thông báo và cập nhật kết quả xem phòng." btnText="Lên lịch hẹn mới" />
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Mã Lịch hẹn</TableHead><TableHead>Khách hàng</TableHead><TableHead>Phòng/Khu vực muốn xem</TableHead><TableHead>Thời gian hẹn</TableHead><TableHead>Trạng thái</TableHead><TableHead>Kết quả</TableHead><TableHead>Thao tác</TableHead></TableRow></TableHeader>
            <TableBody>
              {appointments.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.id}</TableCell>
                  <TableCell>{a.customer}</TableCell>
                  <TableCell>{a.room}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Calendar className="w-4 h-4 text-blue-500" /> {a.time}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-md text-xs font-semibold 
                      ${a.status === 'Sắp tới' ? 'bg-orange-100 text-orange-700' : 
                        a.status === 'Đã hoàn tất' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                      {a.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">{a.result || '-'}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" className="text-xs">Cập nhật kết quả</Button>
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