import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Button, Input } from "../components/ui";
import { users, branches, rooms, services } from "../data/mockData";
import { Plus, Edit2, Trash2 } from "lucide-react";

const PageHeader = ({ title, description, btnText }: { title: string, description: string, btnText: string }) => (
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
    <div>
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      <p className="text-slate-500">{description}</p>
    </div>
    <Button><Plus className="w-4 h-4 mr-2" /> {btnText}</Button>
  </div>
);

// Quản lý Tài khoản & Phân quyền
export function AdminAccounts() {
  return (
    <div className="space-y-4">
      <PageHeader title="Quản lý Tài khoản & Phân quyền" description="Cấp tài khoản cho Sale, Quản lý, Kế toán." btnText="Thêm Tài khoản" />
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Mã NV</TableHead><TableHead>Họ Tên</TableHead><TableHead>Vai trò</TableHead><TableHead>Email</TableHead><TableHead>Trạng thái</TableHead><TableHead>Thao tác</TableHead></TableRow></TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.id}</TableCell>
                  <TableCell>{u.name}</TableCell>
                  <TableCell><span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">{u.role}</span></TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell><span className="text-green-600 font-medium">{u.status}</span></TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon"><Edit2 className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-red-500"><Trash2 className="w-4 h-4" /></Button>
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

// Quản lý danh mục Ký túc xá
export function AdminBranches() {
  return (
    <div className="space-y-4">
      <PageHeader title="Quản lý Danh mục Ký túc xá" description="Khai báo các cơ sở/chi nhánh của hệ thống." btnText="Thêm Cơ sở" />
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Mã Cơ sở</TableHead><TableHead>Tên Cơ sở</TableHead><TableHead>Địa chỉ</TableHead><TableHead>Sức chứa</TableHead><TableHead>Trạng thái</TableHead><TableHead>Thao tác</TableHead></TableRow></TableHeader>
            <TableBody>
              {branches.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.id}</TableCell>
                  <TableCell>{b.name}</TableCell>
                  <TableCell>{b.address}</TableCell>
                  <TableCell>{b.capacity} người</TableCell>
                  <TableCell>
                    <span className={`font-medium ${b.status === 'Hoạt động' ? 'text-green-600' : 'text-orange-500'}`}>{b.status}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon"><Edit2 className="w-4 h-4" /></Button>
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

// Quản lý Danh mục Phòng/Giường
export function AdminRooms() {
  return (
    <div className="space-y-4">
      <PageHeader title="Quản lý Danh mục Phòng/Giường" description="Quản lý thông tin phòng, quy định sức chứa, giá thuê." btnText="Thêm Phòng" />
      <div className="flex gap-4 mb-4">
        <Input placeholder="Tìm kiếm phòng..." className="max-w-sm" />
        <Button variant="outline">Lọc theo Cơ sở</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Mã Phòng</TableHead><TableHead>Cơ sở</TableHead><TableHead>Loại Phòng</TableHead><TableHead>Giá (VND)</TableHead><TableHead>Giới tính</TableHead><TableHead>Sức chứa (Đã ở/Max)</TableHead><TableHead>Trạng thái</TableHead><TableHead>Thao tác</TableHead></TableRow></TableHeader>
            <TableBody>
              {rooms.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.id}</TableCell>
                  <TableCell>{r.branch}</TableCell>
                  <TableCell>{r.type}</TableCell>
                  <TableCell>{r.price.toLocaleString('vi-VN')} đ</TableCell>
                  <TableCell>{r.gender}</TableCell>
                  <TableCell>{r.occupied} / {r.capacity}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-md text-xs font-semibold ${r.status === 'Còn trống' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {r.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon"><Edit2 className="w-4 h-4" /></Button>
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

// Quản lý Danh mục Tiện ích/Tài sản
export function AdminAssets() {
  const assets = [
    { id: 'TS01', name: 'Giường tầng', qty: 200, unit: 'Cái', condition: 'Tốt' },
    { id: 'TS02', name: 'Máy lạnh Daikin 1.5HP', qty: 50, unit: 'Cái', condition: 'Tốt' },
    { id: 'TS03', name: 'Tủ cá nhân 3 ngăn', qty: 150, unit: 'Cái', condition: 'Cũ' }
  ];
  return (
    <div className="space-y-4">
      <PageHeader title="Quản lý Danh mục Tiện ích/Tài sản" description="Khai báo các tài sản có trong hệ thống và phòng." btnText="Thêm Tài sản" />
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Mã TS</TableHead><TableHead>Tên Tài sản</TableHead><TableHead>Số lượng tổng</TableHead><TableHead>Đơn vị</TableHead><TableHead>Tình trạng chung</TableHead><TableHead>Thao tác</TableHead></TableRow></TableHeader>
            <TableBody>
              {assets.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.id}</TableCell>
                  <TableCell>{a.name}</TableCell>
                  <TableCell>{a.qty}</TableCell>
                  <TableCell>{a.unit}</TableCell>
                  <TableCell>{a.condition}</TableCell>
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

// Quản lý danh mục Dịch vụ
export function AdminServices() {
  return (
    <div className="space-y-4">
      <PageHeader title="Quản lý Danh mục Dịch vụ" description="Thiết lập thông tin, mức giá dịch vụ điện, nước, wifi..." btnText="Thêm Dịch vụ" />
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Mã DV</TableHead><TableHead>Tên Dịch vụ</TableHead><TableHead>Đơn giá (VND)</TableHead><TableHead>Đơn vị tính</TableHead><TableHead>Cách tính</TableHead><TableHead>Thao tác</TableHead></TableRow></TableHeader>
            <TableBody>
              {services.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.id}</TableCell>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{s.price.toLocaleString('vi-VN')} đ</TableCell>
                  <TableCell>{s.unit}</TableCell>
                  <TableCell>{s.type}</TableCell>
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

// Quản lý danh mục Chính sách
export function AdminPolicies() {
  const policies = [
    { id: 'CS01', name: 'Nội quy ký túc xá', type: 'Nội quy', lastUpdated: '10/01/2026' },
    { id: 'CS02', name: 'Điều kiện hủy cọc', type: 'Điều kiện thuê', lastUpdated: '15/02/2026' },
    { id: 'CS03', name: 'Điều kiện lưu trú cho sinh viên', type: 'Điều kiện lưu trú', lastUpdated: '01/03/2026' }
  ];
  return (
    <div className="space-y-4">
      <PageHeader title="Quản lý Danh mục Chính sách" description="Soạn thảo và lưu trữ các quy định của hệ thống." btnText="Soạn Chính sách" />
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Mã CS</TableHead><TableHead>Tên Chính sách</TableHead><TableHead>Phân loại</TableHead><TableHead>Cập nhật lần cuối</TableHead><TableHead>Thao tác</TableHead></TableRow></TableHeader>
            <TableBody>
              {policies.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.id}</TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell><span className="px-2 py-1 bg-slate-100 rounded text-xs">{p.type}</span></TableCell>
                  <TableCell>{p.lastUpdated}</TableCell>
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