import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui";
import { Plus, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000";

type StaffOption = {
  maNV: string;
  hoTen: string;
};

type BranchOption = {
  maCN: string;
  tenCN: string;
};

type RoomTypeOption = {
  maLoai: string;
  tenLoai: string;
};

type AccountRecord = {
  maTK: string;
  maNV: string;
  tenDangNhap: string;
  vaiTro: string;
  email: string | null;
  trangThai: number;
  nhanVienName: string | null;
};

type BranchRecord = {
  maCN: string;
  tenCN: string;
  diaChi: string;
  soDT: string;
  totalRooms: number;
};

type RoomRecord = {
  maPhong: string;
  tenPhong: string;
  maCN: string;
  tenCN: string | null;
  maLoai: string;
  tenLoai: string | null;
  sucChua: number;
  gioiTinhPhong: string;
  giaThue: number;
  trangThai: string;
  occupiedBeds: number;
  reservedBeds: number;
  availableBeds: number;
};

type AssetRecord = {
  maTS: string;
  tenTS: string;
  loaiTS: string;
  moTa: string | null;
};

type ServiceRecord = {
  maDV: string;
  tenDV: string;
  donViTinh: string;
  donGia: number;
};

type PolicyRecord = {
  maCS: string;
  tieuDe: string;
  noiDung: string;
  trangThai: number;
  ngayCapNhat: string;
};

type CatalogMeta = {
  branches: BranchOption[];
  roomTypes: RoomTypeOption[];
  staffs: StaffOption[];
};

const roleLabel: Record<string, string> = {
  admin: "Admin",
  sale: "Sale",
  quanly: "Manager",
  ketoan: "Kế toán",
};

const PageHeader = ({
  title,
  description,
  btnText,
  onBtnClick,
}: {
  title: string;
  description: string;
  btnText?: string;
  onBtnClick?: () => void;
}) => (
  <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
    <div>
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      <p className="text-slate-500">{description}</p>
    </div>
    {btnText && (
      <Button type="button" onClick={onBtnClick}>
        <RefreshCcw className="mr-2 h-4 w-4" /> {btnText}
      </Button>
    )}
  </div>
);

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    ...init,
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.message || "Yêu cầu thất bại.");
  }

  return body.data as T;
}

function useCatalogMeta() {
  const [meta, setMeta] = useState<CatalogMeta>({
    branches: [],
    roomTypes: [],
    staffs: [],
  });

  const loadMeta = async () => {
    try {
      const data = await apiRequest<CatalogMeta>("/api/catalog/meta");
      setMeta(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể tải dữ liệu nền.");
    }
  };

  useEffect(() => {
    loadMeta();
  }, []);

  return { meta, reloadMeta: loadMeta };
}

export function AdminAccounts() {
  const { meta, reloadMeta } = useCatalogMeta();
  const [rows, setRows] = useState<AccountRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    maNV: "",
    tenDangNhap: "",
    matKhau: "",
    vaiTro: "sale",
    email: "",
  });

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const data = await apiRequest<AccountRecord[]>("/api/catalog/accounts");
      setRows(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể tải tài khoản.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.maNV || !form.tenDangNhap || !form.matKhau || !form.vaiTro) {
      toast.error("Vui lòng nhập đầy đủ thông tin bắt buộc.");
      return;
    }

    if (form.matKhau.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    try {
      setSaving(true);
      const created = await apiRequest<AccountRecord>("/api/catalog/accounts", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setRows((current) => [created, ...current]);
      setForm({ maNV: "", tenDangNhap: "", matKhau: "", vaiTro: "sale", email: "" });
      toast.success("Tạo tài khoản thành công.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể tạo tài khoản.");
    } finally {
      setSaving(false);
    }
  };

  const toggleAccountStatus = async (row: AccountRecord) => {
    try {
      const updated = await apiRequest<AccountRecord>(`/api/catalog/accounts/${row.maTK}`, {
        method: "PUT",
        body: JSON.stringify({ trangThai: row.trangThai === 1 ? 0 : 1 }),
      });
      setRows((current) => current.map((item) => (item.maTK === row.maTK ? updated : item)));
      toast.success("Cập nhật trạng thái tài khoản thành công.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể cập nhật tài khoản.");
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Quản lý Tài khoản & Phân quyền"
        description="Admin tạo, cập nhật, khóa hoặc mở khóa tài khoản nhân viên."
        btnText="Tải lại dữ liệu"
        onBtnClick={() => {
          loadAccounts();
          reloadMeta();
        }}
      />

      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-lg">Thêm tài khoản</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {meta.staffs.length === 0 && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
              Chưa có nhân viên hoạt động để cấp tài khoản. Hãy kiểm tra dữ liệu nhân viên rồi tải lại.
            </div>
          )}

          <form className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Nhân viên</label>
              <select
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none ring-offset-background transition-colors focus:ring-2 focus:ring-blue-500"
                value={form.maNV}
                onChange={(event) => setForm((current) => ({ ...current, maNV: event.target.value }))}
              >
                <option value="">Chọn nhân viên</option>
                {meta.staffs.map((staff) => (
                  <option key={staff.maNV} value={staff.maNV}>
                    {staff.maNV} - {staff.hoTen}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Tên đăng nhập</label>
              <Input
                placeholder="VD: sale03"
                value={form.tenDangNhap}
                onChange={(event) => setForm((current) => ({ ...current, tenDangNhap: event.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Mật khẩu</label>
              <Input
                type="password"
                placeholder="Tối thiểu 6 ký tự"
                value={form.matKhau}
                onChange={(event) => setForm((current) => ({ ...current, matKhau: event.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Vai trò</label>
              <select
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none ring-offset-background transition-colors focus:ring-2 focus:ring-blue-500"
                value={form.vaiTro}
                onChange={(event) => setForm((current) => ({ ...current, vaiTro: event.target.value }))}
              >
                <option value="admin">Admin</option>
                <option value="sale">Sale</option>
                <option value="quanly">Manager</option>
                <option value="ketoan">Kế toán</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Email</label>
              <Input
                placeholder="email@domain.com (không bắt buộc)"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              />
            </div>

            <Button type="submit" className="md:col-span-2 lg:col-span-5" disabled={saving || meta.staffs.length === 0}>
              <Plus className="mr-2 h-4 w-4" /> Lưu tài khoản
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã TK</TableHead>
                <TableHead>Nhân viên</TableHead>
                <TableHead>Tên đăng nhập</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!loading && rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-slate-500">
                    Chưa có dữ liệu tài khoản.
                  </TableCell>
                </TableRow>
              )}
              {rows.map((row) => (
                <TableRow key={row.maTK}>
                  <TableCell className="font-medium">{row.maTK}</TableCell>
                  <TableCell>{row.nhanVienName || row.maNV}</TableCell>
                  <TableCell>{row.tenDangNhap}</TableCell>
                  <TableCell>{roleLabel[row.vaiTro] || row.vaiTro}</TableCell>
                  <TableCell>{row.email || "-"}</TableCell>
                  <TableCell>
                    <span className={row.trangThai === 1 ? "font-medium text-green-600" : "font-medium text-red-600"}>
                      {row.trangThai === 1 ? "Hoạt động" : "Bị khóa"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button type="button" size="sm" variant="outline" onClick={() => toggleAccountStatus(row)}>
                      {row.trangThai === 1 ? "Khóa" : "Mở khóa"}
                    </Button>
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

export function AdminBranches() {
  const [rows, setRows] = useState<BranchRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ tenCN: "", diaChi: "", soDT: "" });

  const loadBranches = async () => {
    setLoading(true);
    try {
      const data = await apiRequest<BranchRecord[]>("/api/catalog/branches");
      setRows(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể tải chi nhánh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBranches();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.tenCN || !form.diaChi || !form.soDT) {
      toast.error("Vui lòng nhập đầy đủ thông tin chi nhánh.");
      return;
    }

    try {
      setSaving(true);
      const created = await apiRequest<BranchRecord>("/api/catalog/branches", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setRows((current) => [created, ...current]);
      setForm({ tenCN: "", diaChi: "", soDT: "" });
      toast.success("Tạo chi nhánh thành công.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể tạo chi nhánh.");
    } finally {
      setSaving(false);
    }
  };

  const updatePhone = async (row: BranchRecord) => {
    const nextPhone = window.prompt("Nhập số điện thoại mới", row.soDT);
    if (!nextPhone) return;

    try {
      const updated = await apiRequest<BranchRecord>(`/api/catalog/branches/${row.maCN}`, {
        method: "PUT",
        body: JSON.stringify({ soDT: nextPhone }),
      });
      setRows((current) => current.map((item) => (item.maCN === row.maCN ? updated : item)));
      toast.success("Cập nhật chi nhánh thành công.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể cập nhật chi nhánh.");
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Quản lý Danh mục Ký túc xá" description="Thêm và cập nhật thông tin chi nhánh." btnText="Tải lại dữ liệu" onBtnClick={loadBranches} />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Thêm chi nhánh</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid grid-cols-1 gap-3 md:grid-cols-4" onSubmit={handleSubmit}>
            <Input placeholder="Tên chi nhánh" value={form.tenCN} onChange={(event) => setForm((current) => ({ ...current, tenCN: event.target.value }))} />
            <Input placeholder="Địa chỉ" value={form.diaChi} onChange={(event) => setForm((current) => ({ ...current, diaChi: event.target.value }))} />
            <Input placeholder="Số điện thoại" value={form.soDT} onChange={(event) => setForm((current) => ({ ...current, soDT: event.target.value }))} />
            <Button type="submit" disabled={saving}>
              <Plus className="mr-2 h-4 w-4" /> Lưu chi nhánh
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã CN</TableHead>
                <TableHead>Tên chi nhánh</TableHead>
                <TableHead>Địa chỉ</TableHead>
                <TableHead>SĐT</TableHead>
                <TableHead>Số phòng</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!loading && rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-slate-500">
                    Chưa có dữ liệu chi nhánh.
                  </TableCell>
                </TableRow>
              )}
              {rows.map((row) => (
                <TableRow key={row.maCN}>
                  <TableCell className="font-medium">{row.maCN}</TableCell>
                  <TableCell>{row.tenCN}</TableCell>
                  <TableCell>{row.diaChi}</TableCell>
                  <TableCell>{row.soDT}</TableCell>
                  <TableCell>{row.totalRooms}</TableCell>
                  <TableCell>
                    <Button type="button" size="sm" variant="outline" onClick={() => updatePhone(row)}>
                      Cập nhật SĐT
                    </Button>
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

export function AdminRooms() {
  const { meta, reloadMeta } = useCatalogMeta();
  const [rows, setRows] = useState<RoomRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    tenPhong: "",
    maCN: "",
    maLoai: "",
    sucChua: "",
    gioiTinhPhong: "Chung",
    giaThue: "",
  });

  const loadRooms = async () => {
    setLoading(true);
    try {
      const data = await apiRequest<RoomRecord[]>("/api/catalog/rooms");
      setRows(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể tải phòng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.tenPhong || !form.maCN || !form.maLoai || !form.sucChua || !form.giaThue) {
      toast.error("Vui lòng nhập đủ thông tin phòng.");
      return;
    }

    const capacity = Number(form.sucChua);
    const price = Number(form.giaThue);

    if (!Number.isFinite(capacity) || capacity < 1) {
      toast.error("Sức chứa phải là số nguyên dương.");
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      toast.error("Giá thuê phải lớn hơn 0.");
      return;
    }

    try {
      setSaving(true);
      const created = await apiRequest<RoomRecord>("/api/catalog/rooms", {
        method: "POST",
        body: JSON.stringify({
          tenPhong: form.tenPhong,
          maCN: form.maCN,
          maLoai: form.maLoai,
          sucChua: capacity,
          gioiTinhPhong: form.gioiTinhPhong,
          giaThue: price,
        }),
      });
      setRows((current) => [created, ...current]);
      setForm({ tenPhong: "", maCN: "", maLoai: "", sucChua: "", gioiTinhPhong: "Chung", giaThue: "" });
      toast.success("Tạo phòng thành công, giường đã được sinh tự động.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể tạo phòng.");
    } finally {
      setSaving(false);
    }
  };

  const toggleMaintenance = async (row: RoomRecord) => {
    const nextStatus = row.trangThai === "BaoDuong" ? "Trong" : "BaoDuong";

    try {
      const updated = await apiRequest<RoomRecord>(`/api/catalog/rooms/${row.maPhong}`, {
        method: "PUT",
        body: JSON.stringify({ trangThai: nextStatus }),
      });
      setRows((current) => current.map((item) => (item.maPhong === row.maPhong ? updated : item)));
      toast.success("Cập nhật trạng thái phòng thành công.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể cập nhật trạng thái phòng.");
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Quản lý Danh mục Phòng/Giường"
        description="Tạo phòng, sinh giường tự động theo sức chứa và cập nhật trạng thái phòng."
        btnText="Tải lại dữ liệu"
        onBtnClick={() => {
          loadRooms();
          reloadMeta();
        }}
      />

      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-lg">Thêm phòng mới</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(meta.branches.length === 0 || meta.roomTypes.length === 0) && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
              Chưa tải đủ danh mục chi nhánh hoặc loại phòng. Hãy bấm "Tải lại dữ liệu" để làm mới.
            </div>
          )}

          <form className="grid grid-cols-1 gap-3 md:grid-cols-6" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Tên phòng</label>
              <Input
                placeholder="VD: Phòng 105"
                value={form.tenPhong}
                onChange={(event) => setForm((current) => ({ ...current, tenPhong: event.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Chi nhánh</label>
              <select
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none ring-offset-background transition-colors focus:ring-2 focus:ring-blue-500"
                value={form.maCN}
                onChange={(event) => setForm((current) => ({ ...current, maCN: event.target.value }))}
              >
                <option value="">Chọn chi nhánh</option>
                {meta.branches.map((branch) => (
                  <option key={branch.maCN} value={branch.maCN}>
                    {branch.tenCN}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Loại phòng</label>
              <select
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none ring-offset-background transition-colors focus:ring-2 focus:ring-blue-500"
                value={form.maLoai}
                onChange={(event) => setForm((current) => ({ ...current, maLoai: event.target.value }))}
              >
                <option value="">Chọn loại phòng</option>
                {meta.roomTypes.map((roomType) => (
                  <option key={roomType.maLoai} value={roomType.maLoai}>
                    {roomType.tenLoai}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Sức chứa</label>
              <Input
                placeholder="VD: 4"
                type="number"
                min={1}
                value={form.sucChua}
                onChange={(event) => setForm((current) => ({ ...current, sucChua: event.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Giới tính phòng</label>
              <select
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none ring-offset-background transition-colors focus:ring-2 focus:ring-blue-500"
                value={form.gioiTinhPhong}
                onChange={(event) => setForm((current) => ({ ...current, gioiTinhPhong: event.target.value }))}
              >
                <option value="Nam">Nam</option>
                <option value="Nu">Nữ</option>
                <option value="Chung">Chung</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Giá thuê</label>
              <Input
                placeholder="VD: 1800000"
                type="number"
                min={1}
                value={form.giaThue}
                onChange={(event) => setForm((current) => ({ ...current, giaThue: event.target.value }))}
              />
            </div>

            <Button type="submit" className="md:col-span-6" disabled={saving}>
              <Plus className="mr-2 h-4 w-4" /> Lưu phòng
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã phòng</TableHead>
                <TableHead>Tên phòng</TableHead>
                <TableHead>Chi nhánh</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Giá thuê</TableHead>
                <TableHead>Giường trống</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!loading && rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-slate-500">
                    Chưa có dữ liệu phòng.
                  </TableCell>
                </TableRow>
              )}
              {rows.map((row) => (
                <TableRow key={row.maPhong}>
                  <TableCell className="font-medium">{row.maPhong}</TableCell>
                  <TableCell>{row.tenPhong}</TableCell>
                  <TableCell>{row.tenCN || row.maCN}</TableCell>
                  <TableCell>{row.tenLoai || row.maLoai}</TableCell>
                  <TableCell>{row.giaThue.toLocaleString("vi-VN")} đ</TableCell>
                  <TableCell>
                    {row.availableBeds}/{row.sucChua}
                  </TableCell>
                  <TableCell>{row.trangThai}</TableCell>
                  <TableCell>
                    <Button type="button" size="sm" variant="outline" onClick={() => toggleMaintenance(row)}>
                      {row.trangThai === "BaoDuong" ? "Bỏ bảo dưỡng" : "Bảo dưỡng"}
                    </Button>
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

export function AdminAssets() {
  const [rows, setRows] = useState<AssetRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ tenTS: "", loaiTS: "", moTa: "" });

  const loadAssets = async () => {
    setLoading(true);
    try {
      const data = await apiRequest<AssetRecord[]>("/api/catalog/assets");
      setRows(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể tải tài sản.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.tenTS || !form.loaiTS) {
      toast.error("Vui lòng nhập đủ tên tài sản và loại tài sản.");
      return;
    }

    try {
      setSaving(true);
      const created = await apiRequest<AssetRecord>("/api/catalog/assets", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setRows((current) => [created, ...current]);
      setForm({ tenTS: "", loaiTS: "", moTa: "" });
      toast.success("Tạo tài sản thành công.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể tạo tài sản.");
    } finally {
      setSaving(false);
    }
  };

  const renameAsset = async (row: AssetRecord) => {
    const nextName = window.prompt("Nhập tên tài sản mới", row.tenTS);
    if (!nextName) return;

    try {
      const updated = await apiRequest<AssetRecord>(`/api/catalog/assets/${row.maTS}`, {
        method: "PUT",
        body: JSON.stringify({ tenTS: nextName }),
      });
      setRows((current) => current.map((item) => (item.maTS === row.maTS ? updated : item)));
      toast.success("Cập nhật tài sản thành công.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể cập nhật tài sản.");
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Quản lý Danh mục Tiện ích/Tài sản" description="Quản lý danh mục tài sản dùng trong phòng." btnText="Tải lại dữ liệu" onBtnClick={loadAssets} />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Thêm tài sản</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid grid-cols-1 gap-3 md:grid-cols-4" onSubmit={handleSubmit}>
            <Input placeholder="Tên tài sản" value={form.tenTS} onChange={(event) => setForm((current) => ({ ...current, tenTS: event.target.value }))} />
            <Input placeholder="Loại tài sản" value={form.loaiTS} onChange={(event) => setForm((current) => ({ ...current, loaiTS: event.target.value }))} />
            <Input placeholder="Mô tả" value={form.moTa} onChange={(event) => setForm((current) => ({ ...current, moTa: event.target.value }))} />
            <Button type="submit" disabled={saving}>
              <Plus className="mr-2 h-4 w-4" /> Lưu tài sản
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã TS</TableHead>
                <TableHead>Tên tài sản</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!loading && rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-slate-500">
                    Chưa có dữ liệu tài sản.
                  </TableCell>
                </TableRow>
              )}
              {rows.map((row) => (
                <TableRow key={row.maTS}>
                  <TableCell className="font-medium">{row.maTS}</TableCell>
                  <TableCell>{row.tenTS}</TableCell>
                  <TableCell>{row.loaiTS}</TableCell>
                  <TableCell>{row.moTa || "-"}</TableCell>
                  <TableCell>
                    <Button type="button" size="sm" variant="outline" onClick={() => renameAsset(row)}>
                      Sửa tên
                    </Button>
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

export function AdminServices() {
  const [rows, setRows] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ tenDV: "", donViTinh: "", donGia: "" });

  const loadServices = async () => {
    setLoading(true);
    try {
      const data = await apiRequest<ServiceRecord[]>("/api/catalog/services");
      setRows(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể tải dịch vụ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.tenDV || !form.donViTinh || !form.donGia) {
      toast.error("Vui lòng nhập đủ thông tin dịch vụ.");
      return;
    }

    const price = Number(form.donGia);
    if (!Number.isFinite(price) || price <= 0) {
      toast.error("Đơn giá không hợp lệ.");
      return;
    }

    try {
      setSaving(true);
      const created = await apiRequest<ServiceRecord>("/api/catalog/services", {
        method: "POST",
        body: JSON.stringify({
          tenDV: form.tenDV,
          donViTinh: form.donViTinh,
          donGia: price,
        }),
      });
      setRows((current) => [created, ...current]);
      setForm({ tenDV: "", donViTinh: "", donGia: "" });
      toast.success("Tạo dịch vụ thành công.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể tạo dịch vụ.");
    } finally {
      setSaving(false);
    }
  };

  const updatePrice = async (row: ServiceRecord) => {
    const nextPrice = window.prompt("Nhập đơn giá mới", String(row.donGia));
    if (!nextPrice) return;

    const parsed = Number(nextPrice);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      toast.error("Đơn giá không hợp lệ.");
      return;
    }

    try {
      const updated = await apiRequest<ServiceRecord>(`/api/catalog/services/${row.maDV}`, {
        method: "PUT",
        body: JSON.stringify({ donGia: parsed }),
      });
      setRows((current) => current.map((item) => (item.maDV === row.maDV ? updated : item)));
      toast.success("Cập nhật đơn giá thành công.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể cập nhật đơn giá.");
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Quản lý Danh mục Dịch vụ" description="Thiết lập giá dịch vụ và cập nhật định kỳ." btnText="Tải lại dữ liệu" onBtnClick={loadServices} />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Thêm dịch vụ</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid grid-cols-1 gap-3 md:grid-cols-4" onSubmit={handleSubmit}>
            <Input placeholder="Tên dịch vụ" value={form.tenDV} onChange={(event) => setForm((current) => ({ ...current, tenDV: event.target.value }))} />
            <Input placeholder="Đơn vị tính" value={form.donViTinh} onChange={(event) => setForm((current) => ({ ...current, donViTinh: event.target.value }))} />
            <Input placeholder="Đơn giá" type="number" min={1} value={form.donGia} onChange={(event) => setForm((current) => ({ ...current, donGia: event.target.value }))} />
            <Button type="submit" disabled={saving}>
              <Plus className="mr-2 h-4 w-4" /> Lưu dịch vụ
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã DV</TableHead>
                <TableHead>Tên dịch vụ</TableHead>
                <TableHead>Đơn vị tính</TableHead>
                <TableHead>Đơn giá</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!loading && rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-slate-500">
                    Chưa có dữ liệu dịch vụ.
                  </TableCell>
                </TableRow>
              )}
              {rows.map((row) => (
                <TableRow key={row.maDV}>
                  <TableCell className="font-medium">{row.maDV}</TableCell>
                  <TableCell>{row.tenDV}</TableCell>
                  <TableCell>{row.donViTinh}</TableCell>
                  <TableCell>{row.donGia.toLocaleString("vi-VN")} đ</TableCell>
                  <TableCell>
                    <Button type="button" size="sm" variant="outline" onClick={() => updatePrice(row)}>
                      Sửa giá
                    </Button>
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

export function AdminPolicies() {
  const [rows, setRows] = useState<PolicyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ tieuDe: "", noiDung: "" });

  const loadPolicies = async () => {
    setLoading(true);
    try {
      const data = await apiRequest<PolicyRecord[]>("/api/catalog/policies");
      setRows(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể tải chính sách.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPolicies();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.tieuDe || !form.noiDung) {
      toast.error("Vui lòng nhập tiêu đề và nội dung chính sách.");
      return;
    }

    try {
      setSaving(true);
      const created = await apiRequest<PolicyRecord>("/api/catalog/policies", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setRows((current) => [created, ...current]);
      setForm({ tieuDe: "", noiDung: "" });
      toast.success("Tạo chính sách thành công.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể tạo chính sách.");
    } finally {
      setSaving(false);
    }
  };

  const togglePolicy = async (row: PolicyRecord) => {
    try {
      const updated = await apiRequest<PolicyRecord>(`/api/catalog/policies/${row.maCS}`, {
        method: "PUT",
        body: JSON.stringify({ trangThai: row.trangThai === 1 ? 0 : 1 }),
      });
      setRows((current) => current.map((item) => (item.maCS === row.maCS ? updated : item)));
      toast.success("Cập nhật chính sách thành công.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể cập nhật chính sách.");
    }
  };

  const sortedRows = useMemo(
    () => [...rows].sort((a, b) => new Date(b.ngayCapNhat).getTime() - new Date(a.ngayCapNhat).getTime()),
    [rows],
  );

  return (
    <div className="space-y-4">
      <PageHeader title="Quản lý Danh mục Chính sách" description="Thêm mới và bật/tắt hiệu lực chính sách lưu trú." btnText="Tải lại dữ liệu" onBtnClick={loadPolicies} />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Thêm chính sách</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid grid-cols-1 gap-3 md:grid-cols-3" onSubmit={handleSubmit}>
            <Input placeholder="Tiêu đề chính sách" value={form.tieuDe} onChange={(event) => setForm((current) => ({ ...current, tieuDe: event.target.value }))} />
            <Input placeholder="Nội dung chính sách" value={form.noiDung} onChange={(event) => setForm((current) => ({ ...current, noiDung: event.target.value }))} />
            <Button type="submit" disabled={saving}>
              <Plus className="mr-2 h-4 w-4" /> Lưu chính sách
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã CS</TableHead>
                <TableHead>Tiêu đề</TableHead>
                <TableHead>Nội dung</TableHead>
                <TableHead>Cập nhật</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!loading && sortedRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-slate-500">
                    Chưa có dữ liệu chính sách.
                  </TableCell>
                </TableRow>
              )}
              {sortedRows.map((row) => (
                <TableRow key={row.maCS}>
                  <TableCell className="font-medium">{row.maCS}</TableCell>
                  <TableCell>{row.tieuDe}</TableCell>
                  <TableCell className="max-w-96 truncate">{row.noiDung}</TableCell>
                  <TableCell>{new Date(row.ngayCapNhat).toLocaleDateString("vi-VN")}</TableCell>
                  <TableCell>
                    <span className={row.trangThai === 1 ? "font-medium text-green-600" : "font-medium text-orange-600"}>
                      {row.trangThai === 1 ? "Đang áp dụng" : "Tạm ngưng"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button type="button" size="sm" variant="outline" onClick={() => togglePolicy(row)}>
                      {row.trangThai === 1 ? "Tạm ngưng" : "Kích hoạt"}
                    </Button>
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
