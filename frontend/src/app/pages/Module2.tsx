import React, { useState, useEffect } from "react";
import {
  Card, CardContent, CardHeader, CardTitle,
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
  Button, Input,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "../components/ui";
import { MOCK_BRANCHES, CURRENT_USER } from "../data/mockData";
import { Plus, Edit2, Search, Calendar, Filter, Phone, Mail, Loader2, Trash2, X } from "lucide-react";
import { customerService, type CustomerPayload } from "../services/customerService";
import { roomService, requestService, appointmentService, type RequestPayload, type AppointmentPayload } from "../services/salesService";
import { toast } from "sonner";

// ─── Shared helpers ────────────────────────────────────────────────────────────

function fmtDate(d?: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('vi-VN');
}

function fmtMoney(n?: number | null) {
  if (!n) return '—';
  return n.toLocaleString('vi-VN') + ' đ';
}

const SEL_CLASS = "flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

function Sel({ value, onChange, children, className = '' }: {
  value: string; onChange: (v: string) => void; children: React.ReactNode; className?: string;
}) {
  return (
    <select className={`${SEL_CLASS} ${className}`} value={value} onChange={e => onChange(e.target.value)}>
      {children}
    </select>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    ChoDuyet: 'bg-yellow-100 text-yellow-700',
    DaHen: 'bg-blue-100 text-blue-700',
    DaCoc: 'bg-green-100 text-green-700',
    Huy: 'bg-red-100 text-red-700',
    ChoXacNhan: 'bg-yellow-100 text-yellow-700',
    HoanThanh: 'bg-green-100 text-green-700',
  };
  const label: Record<string, string> = {
    ChoDuyet: 'Chờ duyệt', DaHen: 'Đã hẹn', DaCoc: 'Đã cọc', Huy: 'Đã hủy',
    ChoXacNhan: 'Chờ xác nhận', HoanThanh: 'Hoàn thành',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${map[status] ?? 'bg-slate-100 text-slate-600'}`}>
      {label[status] ?? status}
    </span>
  );
}

function PageHeader({ title, description, btnText, onBtnClick }: {
  title: string; description: string; btnText?: string; onBtnClick?: () => void;
}) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <p className="text-slate-500">{description}</p>
      </div>
      {btnText && <Button onClick={onBtnClick}><Plus className="w-4 h-4 mr-2" />{btnText}</Button>}
    </div>
  );
}

function Pagination({ page, totalPages, total, label, onPage }: {
  page: number; totalPages: number; total: number; label: string; onPage: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-2">
      <span className="text-sm text-slate-500">Trang {page}/{totalPages} · {total} {label}</span>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" disabled={page === 1} onClick={() => onPage(page - 1)}>‹ Trước</Button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
          <Button key={p} variant={p === page ? 'default' : 'outline'} size="sm" className="w-9" onClick={() => onPage(p)}>{p}</Button>
        ))}
        <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => onPage(page + 1)}>Sau ›</Button>
      </div>
    </div>
  );
}

// ─── 1. Quản lý Khách hàng ────────────────────────────────────────────────────

const EMPTY_CUSTOMER: CustomerPayload = {
  hoTen: '', gioiTinh: 'Nam', ngaySinh: '', cccd: '', soDienThoai: '', email: '', quocTich: 'Việt Nam',
};

export function SalesCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CustomerPayload>(EMPTY_CUSTOMER);
  const [submitting, setSubmitting] = useState(false);

  const load = async (q: string, p: number) => {
    setLoading(true);
    try {
      const res = await customerService.getCustomers({ search: q, page: p, limit: 5 });
      setCustomers(res.data ?? []);
      setTotalPages(res.pagination?.pages ?? 1);
      setTotal(res.pagination?.total ?? 0);
    } catch { setCustomers([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { setPage(1); }, [search]);
  useEffect(() => {
    const t = setTimeout(() => load(search, page), 300);
    return () => clearTimeout(t);
  }, [search, page]);

  const f = (k: keyof CustomerPayload, v: string) => setForm(p => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await customerService.createCustomer(form);
      toast.success('Tạo khách hàng thành công');
      setOpen(false); setForm(EMPTY_CUSTOMER); load(search, page);
    } catch (err: any) { toast.error(err.message); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Quản lý Khách hàng" description="Lưu trữ thông tin nhân thân cơ bản của người đại diện liên hệ/đặt cọc." btnText="Thêm Khách hàng" onBtnClick={() => setOpen(true)} />
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input placeholder="Tìm theo tên, SĐT, CCCD..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã KH</TableHead><TableHead>Họ Tên</TableHead><TableHead>Giới tính</TableHead>
                <TableHead>Ngày sinh</TableHead><TableHead>CCCD</TableHead><TableHead>Liên hệ</TableHead>
                <TableHead>Quốc tịch</TableHead><TableHead>Trạng thái</TableHead><TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-slate-400"><Loader2 className="w-4 h-4 animate-spin inline mr-2" />Đang tải...</TableCell></TableRow>
              ) : customers.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-slate-400">Không tìm thấy khách hàng</TableCell></TableRow>
              ) : customers.map(c => (
                <TableRow key={c.maKH}>
                  <TableCell className="font-medium">{c.maKH}</TableCell>
                  <TableCell>{c.hoTen}</TableCell>
                  <TableCell>{c.gioiTinh === 'Nu' ? 'Nữ' : c.gioiTinh}</TableCell>
                  <TableCell>{fmtDate(c.ngaySinh)}</TableCell>
                  <TableCell className="font-mono text-sm">{c.cccd}</TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm gap-0.5">
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" />{c.soDienThoai}</span>
                      {c.email && <span className="flex items-center gap-1 text-slate-500"><Mail className="w-3 h-3" />{c.email}</span>}
                    </div>
                  </TableCell>
                  <TableCell>{c.quocTich || '—'}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.trangThai === 1 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {c.trangThai === 1 ? 'Hoạt động' : 'Ngừng HĐ'}
                    </span>
                  </TableCell>
                  <TableCell><Button variant="ghost" size="icon"><Edit2 className="w-4 h-4" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Pagination page={page} totalPages={totalPages} total={total} label="khách hàng" onPage={setPage} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Thêm Khách hàng mới</DialogTitle></DialogHeader>
          <form onSubmit={submit}>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="col-span-2 space-y-1">
                <label className="text-sm font-medium">Họ tên <span className="text-red-500">*</span></label>
                <Input placeholder="Nguyễn Văn A" value={form.hoTen} onChange={e => f('hoTen', e.target.value)} required />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Giới tính</label>
                <Sel value={form.gioiTinh ?? 'Nam'} onChange={v => f('gioiTinh', v)}>
                  <option value="Nam">Nam</option><option value="Nu">Nữ</option>
                </Sel>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Ngày sinh</label>
                <Input type="date" value={form.ngaySinh} onChange={e => f('ngaySinh', e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">CCCD <span className="text-red-500">*</span></label>
                <Input placeholder="079xxxxxxxxx" value={form.cccd} onChange={e => f('cccd', e.target.value)} required />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Số điện thoại <span className="text-red-500">*</span></label>
                <Input placeholder="09xxxxxxxx" value={form.soDienThoai} onChange={e => f('soDienThoai', e.target.value)} required />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-sm font-medium">Email</label>
                <Input type="email" placeholder="example@gmail.com" value={form.email} onChange={e => f('email', e.target.value)} />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-sm font-medium">Quốc tịch</label>
                <Input placeholder="Việt Nam" value={form.quocTich} onChange={e => f('quocTich', e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
              <Button type="submit" disabled={submitting}>{submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Tạo khách hàng</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── 2. Ghi nhận Yêu cầu thuê ────────────────────────────────────────────────

const EMPTY_REQUEST: RequestPayload = {
  maKH: '', maNV: CURRENT_USER.id, soNguoi: 1, gioiTinh: 'Nam',
  khuVuc: '', loaiPhong: '', mucGia: undefined, ngayVaoO: '', thoiHanThue: 6, ghiChu: '',
};

export function SalesRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<RequestPayload>(EMPTY_REQUEST);
  const [submitting, setSubmitting] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [updateTarget, setUpdateTarget] = useState<any>(null);
  const [newStatus, setNewStatus] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const load = async (q: string, s: string, p: number) => {
    setLoading(true);
    try {
      const res = await requestService.getRequests({ search: q, status: s || undefined, page: p, limit: 5 });
      setRequests(res.data ?? []);
      setTotalPages(res.pagination?.pages ?? 1);
      setTotal(res.pagination?.total ?? 0);
    } catch { setRequests([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { setPage(1); }, [search, statusFilter]);
  useEffect(() => {
    const t = setTimeout(() => load(search, statusFilter, page), 300);
    return () => clearTimeout(t);
  }, [search, statusFilter, page]);

  useEffect(() => {
    customerService.getCustomers({ limit: 200 }).then(r => setCustomers(r.data ?? [])).catch(() => {});
  }, []);

  const f = (k: keyof RequestPayload, v: any) => setForm(p => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await requestService.createRequest(form);
      toast.success('Tạo yêu cầu thuê thành công');
      setCreateOpen(false); setForm(EMPTY_REQUEST); load(search, statusFilter, page);
    } catch (err: any) { toast.error(err.message); }
    finally { setSubmitting(false); }
  };

  const handleUpdate = async () => {
    if (!updateTarget || !newStatus) return;
    try {
      await requestService.updateRequest(updateTarget.maYCT, { trangThai: newStatus });
      toast.success('Cập nhật trạng thái thành công');
      setUpdateTarget(null); load(search, statusFilter, page);
    } catch (err: any) { toast.error(err.message); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await requestService.deleteRequest(deleteTarget);
      toast.success('Xóa yêu cầu thành công');
      setDeleteTarget(null); load(search, statusFilter, page);
    } catch (err: any) { toast.error(err.message); }
  };

  const nextStatuses: Record<string, string[]> = {
    ChoDuyet: ['DaHen', 'Huy'],
    DaHen: ['DaCoc', 'Huy'],
    DaCoc: [],
    Huy: [],
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Ghi nhận Yêu cầu thuê" description="Theo dõi chi tiết nhu cầu tìm phòng, tiêu chí của khách hàng." btnText="Tạo Yêu cầu mới" onBtnClick={() => setCreateOpen(true)} />

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Tìm theo tên KH, khu vực..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Sel value={statusFilter} onChange={setStatusFilter} className="w-44">
          <option value="">Tất cả trạng thái</option>
          <option value="ChoDuyet">Chờ duyệt</option>
          <option value="DaHen">Đã hẹn</option>
          <option value="DaCoc">Đã cọc</option>
          <option value="Huy">Đã hủy</option>
        </Sel>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã YC</TableHead><TableHead>Khách hàng</TableHead><TableHead>Khu vực / Loại</TableHead>
                <TableHead>Ngày vào ở</TableHead><TableHead>Thời hạn</TableHead><TableHead>Mức giá</TableHead>
                <TableHead>Trạng thái</TableHead><TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-slate-400"><Loader2 className="w-4 h-4 animate-spin inline mr-2" />Đang tải...</TableCell></TableRow>
              ) : requests.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-slate-400">Không có yêu cầu nào</TableCell></TableRow>
              ) : requests.map(r => (
                <TableRow key={r.maYCT}>
                  <TableCell className="font-medium">{r.maYCT}</TableCell>
                  <TableCell>
                    <div className="font-medium">{r.khachHang?.hoTen}</div>
                    <div className="text-xs text-slate-500">{r.khachHang?.soDienThoai}</div>
                  </TableCell>
                  <TableCell>
                    <div>{r.khuVuc || '—'}</div>
                    <div className="text-xs text-slate-500">{r.loaiPhong || '—'} · {r.soNguoi} người</div>
                  </TableCell>
                  <TableCell>{fmtDate(r.ngayVaoO)}</TableCell>
                  <TableCell>{r.thoiHanThue} tháng</TableCell>
                  <TableCell>{r.mucGia ? fmtMoney(Number(r.mucGia)) : '—'}</TableCell>
                  <TableCell><StatusBadge status={r.trangThai} /></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {(nextStatuses[r.trangThai]?.length ?? 0) > 0 && (
                        <Button variant="outline" size="sm" className="text-xs"
                          onClick={() => { setUpdateTarget(r); setNewStatus(nextStatuses[r.trangThai][0]); }}>
                          Cập nhật
                        </Button>
                      )}
                      {r.trangThai === 'ChoDuyet' && (
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700"
                          onClick={() => setDeleteTarget(r.maYCT)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Pagination page={page} totalPages={totalPages} total={total} label="yêu cầu" onPage={setPage} />

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Tạo Yêu cầu thuê mới</DialogTitle></DialogHeader>
          <form onSubmit={submit}>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="col-span-2 space-y-1">
                <label className="text-sm font-medium">Khách hàng <span className="text-red-500">*</span></label>
                <Sel value={form.maKH} onChange={v => f('maKH', v)}>
                  <option value="">-- Chọn khách hàng --</option>
                  {customers.map(c => <option key={c.maKH} value={c.maKH}>{c.hoTen} ({c.soDienThoai})</option>)}
                </Sel>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Số người</label>
                <Input type="number" min={1} value={form.soNguoi} onChange={e => f('soNguoi', parseInt(e.target.value))} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Giới tính phòng</label>
                <Sel value={form.gioiTinh ?? 'Nam'} onChange={v => f('gioiTinh', v)}>
                  <option value="Nam">Nam</option><option value="Nu">Nữ</option><option value="Chung">Chung</option>
                </Sel>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Khu vực mong muốn</label>
                <Input placeholder="VD: Quận 5, Bình Thạnh..." value={form.khuVuc} onChange={e => f('khuVuc', e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Loại phòng</label>
                <Sel value={form.loaiPhong ?? ''} onChange={v => f('loaiPhong', v)}>
                  <option value="">-- Không yêu cầu --</option>
                  <option value="Phòng đơn">Phòng đơn</option>
                  <option value="Phòng đôi">Phòng đôi</option>
                  <option value="Phòng ở ghép">Phòng ở ghép</option>
                </Sel>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Ngày vào ở <span className="text-red-500">*</span></label>
                <Input type="date" value={form.ngayVaoO} onChange={e => f('ngayVaoO', e.target.value)} required />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Thời hạn thuê (tháng) <span className="text-red-500">*</span></label>
                <Input type="number" min={1} value={form.thoiHanThue} onChange={e => f('thoiHanThue', parseInt(e.target.value))} required />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-sm font-medium">Mức giá tối đa (đ)</label>
                <Input type="number" placeholder="VD: 3000000" value={form.mucGia ?? ''} onChange={e => f('mucGia', e.target.value ? parseInt(e.target.value) : undefined)} />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-sm font-medium">Ghi chú</label>
                <textarea className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[72px]"
                  placeholder="Yêu cầu đặc biệt..." value={form.ghiChu} onChange={e => f('ghiChu', e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Hủy</Button>
              <Button type="submit" disabled={submitting || !form.maKH}>{submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Tạo yêu cầu</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Update status Dialog */}
      <Dialog open={!!updateTarget} onOpenChange={v => !v && setUpdateTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Cập nhật trạng thái</DialogTitle></DialogHeader>
          <div className="py-4 space-y-3">
            <p className="text-sm text-slate-600">Yêu cầu: <span className="font-medium">{updateTarget?.maYCT}</span> — {updateTarget?.khachHang?.hoTen}</p>
            <div className="space-y-1">
              <label className="text-sm font-medium">Trạng thái mới</label>
              <Sel value={newStatus} onChange={setNewStatus}>
                {(nextStatuses[updateTarget?.trangThai] ?? []).map(s => (
                  <option key={s} value={s}>{s === 'DaHen' ? 'Đã hẹn' : s === 'DaCoc' ? 'Đã cọc' : 'Đã hủy'}</option>
                ))}
              </Sel>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateTarget(null)}>Hủy</Button>
            <Button onClick={handleUpdate}>Xác nhận</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleteTarget} onOpenChange={v => !v && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Xóa yêu cầu thuê</DialogTitle></DialogHeader>
          <p className="py-4 text-sm text-slate-600">Bạn có chắc muốn xóa yêu cầu <span className="font-medium">{deleteTarget}</span>? Hành động này không thể hoàn tác.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Hủy</Button>
            <Button variant="destructive" onClick={handleDelete}>Xóa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── 3. Tra cứu Phòng/Giường trống ───────────────────────────────────────────

export function SalesSearch() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ maCN: '', gioiTinh: '', priceRange: '', trangThai: '' });

  const load = async () => {
    setLoading(true);
    try {
      const priceMap: Record<string, { minGia?: number; maxGia?: number }> = {
        '<2': { maxGia: 2000000 },
        '2-3': { minGia: 2000000, maxGia: 3000000 },
        '>3': { minGia: 3000000 },
      };
      const priceFilter = priceMap[filters.priceRange] ?? {};
      const res = await roomService.getRooms({
        maCN: filters.maCN || undefined,
        gioiTinh: filters.gioiTinh || undefined,
        trangThai: filters.trangThai || undefined,
        coGiuongTrong: !filters.trangThai, // mặc định chỉ lấy phòng có giường trống
        ...priceFilter,
      });
      setRooms(res.data ?? []);
    } catch { setRooms([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const ff = (k: string, v: string) => setFilters(p => ({ ...p, [k]: v }));

  const trangThaiLabel: Record<string, string> = {
    Trong: 'Còn trống', DaThue: 'Đã thuê', DaCoc: 'Đã cọc', BaoDuong: 'Bảo dưỡng',
  };
  const trangThaiColor: Record<string, string> = {
    Trong: 'bg-green-100 text-green-700', DaThue: 'bg-red-100 text-red-700',
    DaCoc: 'bg-yellow-100 text-yellow-700', BaoDuong: 'bg-slate-100 text-slate-600',
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Tra cứu Phòng/Giường trống" description="Tìm kiếm phòng còn chỗ trống theo tiêu chí." />

      <Card className="border-blue-100">
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500">Cơ sở</label>
            <Sel value={filters.maCN} onChange={v => ff('maCN', v)}>
              <option value="">Tất cả cơ sở</option>
              {MOCK_BRANCHES.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </Sel>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500">Giới tính</label>
            <Sel value={filters.gioiTinh} onChange={v => ff('gioiTinh', v)}>
              <option value="">Tất cả</option>
              <option value="Nam">Nam</option>
              <option value="Nu">Nữ</option>
              <option value="Chung">Chung</option>
            </Sel>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500">Khoảng giá</label>
            <Sel value={filters.priceRange} onChange={v => ff('priceRange', v)}>
              <option value="">Mọi mức giá</option>
              <option value="<2">Dưới 2 triệu</option>
              <option value="2-3">2 – 3 triệu</option>
              <option value=">3">Trên 3 triệu</option>
            </Sel>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500">Trạng thái</label>
            <Sel value={filters.trangThai} onChange={v => ff('trangThai', v)}>
              <option value="">Tất cả</option>
              <option value="Trong">Còn trống</option>
              <option value="DaCoc">Đã cọc</option>
              <option value="DaThue">Đã thuê</option>
            </Sel>
          </div>
          <Button className="w-full" onClick={load} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Filter className="w-4 h-4 mr-2" />}Lọc
          </Button>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-12 text-slate-400"><Loader2 className="w-6 h-6 animate-spin inline mr-2" />Đang tải...</div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-12 text-slate-400">Không tìm thấy phòng phù hợp</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map(r => (
            <Card key={r.maPhong} className="overflow-hidden flex flex-col">
              <div className="h-28 bg-gradient-to-br from-slate-100 to-blue-50 flex items-center justify-center relative">
                <span className="text-slate-400 text-sm">Hình ảnh phòng</span>
                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {r.soGiuongTrong}/{r.tongGiuong} trống
                </div>
                <div className={`absolute top-2 left-2 text-xs font-medium px-2 py-0.5 rounded ${trangThaiColor[r.trangThai] ?? 'bg-slate-100'}`}>
                  {trangThaiLabel[r.trangThai] ?? r.trangThai}
                </div>
              </div>
              <CardContent className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3 className="font-bold text-base">{r.maPhong} – {r.tenPhong}</h3>
                    <p className="text-xs text-slate-500">{r.chiNhanh?.tenCN}</p>
                  </div>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded font-medium">
                    {r.gioiTinhPhong === 'Nu' ? 'Nữ' : r.gioiTinhPhong}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-2">{r.loaiPhong?.tenLoai} · {r.sucChua} chỗ</p>
                <p className="text-lg font-bold text-red-500">{r.giaThue.toLocaleString('vi-VN')} đ <span className="text-xs font-normal text-slate-500">/giường/tháng</span></p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── 4. Quản lý Lịch hẹn xem phòng ──────────────────────────────────────────

const EMPTY_APPT: AppointmentPayload = { maYCT: '', ngayHen: '', gioHen: '09:00', ghiChu: '' };

export function SalesAppointments() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<AppointmentPayload>(EMPTY_APPT);
  const [submitting, setSubmitting] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [updateTarget, setUpdateTarget] = useState<any>(null);
  const [newStatus, setNewStatus] = useState('');
  const [newNote, setNewNote] = useState('');

  const load = async (s: string, p: number) => {
    setLoading(true);
    try {
      const res = await appointmentService.getAppointments({ status: s || undefined, page: p, limit: 5 });
      setAppointments(res.data ?? []);
      setTotalPages(res.pagination?.pages ?? 1);
      setTotal(res.pagination?.total ?? 0);
    } catch { setAppointments([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { setPage(1); }, [statusFilter]);
  useEffect(() => { load(statusFilter, page); }, [statusFilter, page]);

  useEffect(() => {
    requestService.getRequests({ limit: 200 }).then(r => setRequests(r.data ?? [])).catch(() => {});
  }, []);

  const f = (k: keyof AppointmentPayload, v: string) => setForm(p => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await appointmentService.createAppointment(form);
      toast.success('Tạo lịch hẹn thành công');
      setCreateOpen(false); setForm(EMPTY_APPT); load(statusFilter, page);
    } catch (err: any) { toast.error(err.message); }
    finally { setSubmitting(false); }
  };

  const handleUpdate = async () => {
    if (!updateTarget) return;
    try {
      await appointmentService.updateAppointment(updateTarget.maLH, { trangThai: newStatus, ghiChu: newNote });
      toast.success('Cập nhật lịch hẹn thành công');
      setUpdateTarget(null); load(statusFilter, page);
    } catch (err: any) { toast.error(err.message); }
  };

  const apptStatusNext: Record<string, string[]> = {
    ChoXacNhan: ['DaHen', 'Huy'],
    DaHen: ['HoanThanh', 'Huy'],
    HoanThanh: [],
    Huy: [],
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Quản lý Lịch hẹn xem phòng" description="Lên lịch, theo dõi và cập nhật kết quả xem phòng." btnText="Lên lịch hẹn mới" onBtnClick={() => setCreateOpen(true)} />

      <div className="flex gap-3">
        <Sel value={statusFilter} onChange={setStatusFilter} className="w-52">
          <option value="">Tất cả trạng thái</option>
          <option value="ChoXacNhan">Chờ xác nhận</option>
          <option value="DaHen">Đã hẹn</option>
          <option value="HoanThanh">Hoàn thành</option>
          <option value="Huy">Đã hủy</option>
        </Sel>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã LH</TableHead><TableHead>Khách hàng</TableHead><TableHead>Mã YC</TableHead>
                <TableHead>Ngày hẹn</TableHead><TableHead>Giờ hẹn</TableHead><TableHead>Trạng thái</TableHead>
                <TableHead>Ghi chú</TableHead><TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-slate-400"><Loader2 className="w-4 h-4 animate-spin inline mr-2" />Đang tải...</TableCell></TableRow>
              ) : appointments.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-slate-400">Không có lịch hẹn nào</TableCell></TableRow>
              ) : appointments.map(a => (
                <TableRow key={a.maLH}>
                  <TableCell className="font-medium">{a.maLH}</TableCell>
                  <TableCell>
                    <div className="font-medium">{a.yeuCauThue?.khachHang?.hoTen}</div>
                    <div className="text-xs text-slate-500">{a.yeuCauThue?.khachHang?.soDienThoai}</div>
                  </TableCell>
                  <TableCell className="text-blue-600 font-medium">{a.maYCT}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="w-3.5 h-3.5 text-blue-400" />{fmtDate(a.ngayHen)}
                    </div>
                  </TableCell>
                  <TableCell>{a.gioHen}</TableCell>
                  <TableCell><StatusBadge status={a.trangThai} /></TableCell>
                  <TableCell className="text-sm text-slate-500 max-w-[140px] truncate" title={a.ghiChu ?? ''}>{a.ghiChu || '—'}</TableCell>
                  <TableCell>
                    {(apptStatusNext[a.trangThai]?.length ?? 0) > 0 && (
                      <Button variant="outline" size="sm" className="text-xs"
                        onClick={() => { setUpdateTarget(a); setNewStatus(apptStatusNext[a.trangThai][0]); setNewNote(a.ghiChu ?? ''); }}>
                        Cập nhật
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Pagination page={page} totalPages={totalPages} total={total} label="lịch hẹn" onPage={setPage} />

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Lên lịch hẹn xem phòng</DialogTitle></DialogHeader>
          <form onSubmit={submit}>
            <div className="space-y-4 py-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Yêu cầu thuê <span className="text-red-500">*</span></label>
                <Sel value={form.maYCT} onChange={v => f('maYCT', v)}>
                  <option value="">-- Chọn yêu cầu --</option>
                  {requests.filter(r => ['ChoDuyet', 'DaHen'].includes(r.trangThai)).map(r => (
                    <option key={r.maYCT} value={r.maYCT}>{r.maYCT} – {r.khachHang?.hoTen} ({r.khuVuc || 'Chưa rõ'})</option>
                  ))}
                </Sel>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Ngày hẹn <span className="text-red-500">*</span></label>
                  <Input type="date" value={form.ngayHen} onChange={e => f('ngayHen', e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Giờ hẹn <span className="text-red-500">*</span></label>
                  <Input type="time" value={form.gioHen} onChange={e => f('gioHen', e.target.value)} required />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Ghi chú</label>
                <textarea className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[64px]"
                  placeholder="Phòng muốn xem, yêu cầu đặc biệt..." value={form.ghiChu} onChange={e => f('ghiChu', e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Hủy</Button>
              <Button type="submit" disabled={submitting || !form.maYCT}>{submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Tạo lịch hẹn</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Update Dialog */}
      <Dialog open={!!updateTarget} onOpenChange={v => !v && setUpdateTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Cập nhật lịch hẹn</DialogTitle></DialogHeader>
          <div className="py-4 space-y-3">
            <p className="text-sm text-slate-600">Lịch hẹn: <span className="font-medium">{updateTarget?.maLH}</span> — {updateTarget?.yeuCauThue?.khachHang?.hoTen}</p>
            <div className="space-y-1">
              <label className="text-sm font-medium">Kết quả / Trạng thái</label>
              <Sel value={newStatus} onChange={setNewStatus}>
                {(apptStatusNext[updateTarget?.trangThai] ?? []).map(s => (
                  <option key={s} value={s}>{s === 'DaHen' ? 'Xác nhận – Đã hẹn' : s === 'HoanThanh' ? 'Hoàn thành' : 'Hủy lịch'}</option>
                ))}
              </Sel>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Ghi chú kết quả</label>
              <textarea className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[64px]"
                placeholder="VD: Khách xem P104, đồng ý cọc..." value={newNote} onChange={e => setNewNote(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateTarget(null)}>Hủy</Button>
            <Button onClick={handleUpdate}>Lưu kết quả</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
