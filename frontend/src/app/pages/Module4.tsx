import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Button,
  Input,
} from "../components/ui";
import { contracts } from "../data/mockData";
import { toast } from "sonner";
import {
  Plus,
  Edit2,
  CheckCircle,
  FileText,
  Banknote,
  ShieldCheck,
  DoorOpen,
  Users,
  Key,
  AlertTriangle,
  Upload,
  ArrowLeft,
  Save,
  Sparkles,
  CircleAlert,
  CalendarDays,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000";

type ApiContractRecord = {
  maHD: string;
  maPC: string;
  maNV: string;
  ngayKy: string;
  ngayBatDau: string;
  ngayKetThuc: string;
  kyThanhToan: number;
  trangThai: string;
  anhHD: string | null;
  khachHangName: string | null;
  roomSummary: string;
  soThanhVien: number;
  tienCoc: number | null;
};

type EligibleDeposit = {
  maPC: string;
  maKH: string;
  maNV: string;
  ngayCoc: string;
  tienCoc: number;
  khachHangName: string | null;
  roomSummary: string;
  soGiuong: number;
};

type ContractRecord = {
  id: string;
  depositId: string;
  customer: string;
  room: string;
  members: number;
  signDate: string;
  startDate: string;
  endDate: string;
  cycleMonths: number;
  cycle: string;
  status: string;
  signedFileName: string;
  createdBy: string;
  depositAmount: number | null;
  staffId: string;
};

type ContractFormState = {
  depositId: string;
  signDate: string;
  startDate: string;
  cycleMonths: number;
  members: number;
  signedFileName: string;
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
        <Plus className="mr-2 h-4 w-4" /> {btnText}
      </Button>
    )}
  </div>
);

const toDateInputValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getTodayInputValue = () => toDateInputValue(new Date());

const addMonthsToDate = (value: string, months: number) => {
  if (!value) return "";

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setMonth(date.getMonth() + months);

  return toDateInputValue(date);
};

const normalizeDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return toDateInputValue(date);
};

const formatCurrency = (value: number) => `${value.toLocaleString()} d`;

const mapApiContract = (item: ApiContractRecord): ContractRecord => ({
  id: item.maHD,
  depositId: item.maPC,
  customer: item.khachHangName ?? "Chưa xác định",
  room: item.roomSummary || "Chưa xác định",
  members: item.soThanhVien,
  signDate: normalizeDate(item.ngayKy),
  startDate: normalizeDate(item.ngayBatDau),
  endDate: normalizeDate(item.ngayKetThuc),
  cycleMonths: item.kyThanhToan,
  cycle: `${item.kyThanhToan} tháng`,
  status: item.trangThai,
  signedFileName: item.anhHD ?? "",
  createdBy: item.maNV,
  depositAmount: item.tienCoc,
  staffId: item.maNV,
});

// X�t duy?t di?u ki?n & Qu?n l� th�nh vi�n
export function ContractMembers() {
  const members = [
    { id: "M001", name: "�?ng Vi?t H�ng", type: "�?i di?n", cmt: "001099123456", dob: "2001-05-12", status: "�� duy?t", contract: "CT001" },
    { id: "M002", name: "Nguy?n Ti?n Khang", type: "? gh�p", cmt: "001099654321", dob: "2002-11-20", status: "Ch? duy?t", contract: "CT001" },
    { id: "M003", name: "Vu Ki?u Oanh", type: "�?i di?n", cmt: "001099999888", dob: "2000-01-01", status: "�� duy?t", contract: "CT002" },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Qu?n l� & X�t duy?t Th�nh vi�n" description="Qu?n l� nh�n th�n v� duy?t h? so tru?c khi k� h?p d?ng." btnText="Th�m th�nh vi�n" />
      <div className="mb-4 flex gap-4">
        <Input placeholder="T�m CMND/CCCD..." className="max-w-xs" />
        <select className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm">
          <option>T?t c? H?p d?ng</option>
          {contracts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.id}
            </option>
          ))}
        </select>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>M� TV</TableHead>
                <TableHead>H? T�n</TableHead>
                <TableHead>CMND/CCCD</TableHead>
                <TableHead>Ng�y sinh</TableHead>
                <TableHead>Vai tr�</TableHead>
                <TableHead>Thu?c H�</TableHead>
                <TableHead>T�nh tr?ng</TableHead>
                <TableHead>Thao t�c</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.id}</TableCell>
                  <TableCell>{m.name}</TableCell>
                  <TableCell>{m.cmt}</TableCell>
                  <TableCell>{m.dob}</TableCell>
                  <TableCell>
                    <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${m.type === "�?i di?n" ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-700"}`}>
                      {m.type}
                    </span>
                  </TableCell>
                  <TableCell className="font-semibold text-blue-600">{m.contract}</TableCell>
                  <TableCell>
                    <span className={`flex w-max items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ${m.status === "�� duy?t" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                      {m.status === "�� duy?t" ? <ShieldCheck className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                      {m.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {m.status === "Ch? duy?t" && (
                        <Button size="sm" className="h-7 bg-green-600 text-xs">
                          Duy?t
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Edit2 className="h-3 w-3" />
                      </Button>
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

// L?p H?p d?ng thu�
export function ContractCreate() {
  const navigate = useNavigate();
  const [availableDeposits, setAvailableDeposits] = useState<EligibleDeposit[]>([]);
  const [loadingDeposits, setLoadingDeposits] = useState(true);
  const [form, setForm] = useState<ContractFormState>({
    depositId: "",
    signDate: getTodayInputValue(),
    startDate: getTodayInputValue(),
    cycleMonths: 1,
    members: 1,
    signedFileName: "",
  });
  const [formError, setFormError] = useState("");
  const [successContract, setSuccessContract] = useState<ContractRecord | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchEligibleDeposits = async () => {
      setLoadingDeposits(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/contracts/eligible-deposits`);
        if (!response.ok) {
          const errorBody = await response.json().catch(() => ({}));
          throw new Error(errorBody.message || "Không thể tải dữ liệu phiếu cọc.");
        }

        const payload = await response.json();
        setAvailableDeposits(payload.data || []);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Không thể tải dữ liệu phiếu cọc.";
        toast.error(message);
      } finally {
        setLoadingDeposits(false);
      }
    };

    fetchEligibleDeposits();
  }, []);

  const selectedDeposit = availableDeposits.find((deposit) => deposit.maPC === form.depositId);
  const contractEndDate = addMonthsToDate(form.startDate, form.cycleMonths);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (!form.depositId) {
      const message = "Vui lòng chọn phiếu cọc đã được thanh toán để tạo hợp đồng.";
      setFormError(message);
      toast.error(message);
      return;
    }

    if (!selectedDeposit) {
      const message = "Phiếu cọc đã chọn không tồn tại trong hệ thống.";
      setFormError(message);
      toast.error(message);
      return;
    }

    if (!form.signDate || !form.startDate) {
      const message = "Vui lòng nhập đầy đủ ngày ký và ngày bắt đầu.";
      setFormError(message);
      toast.error(message);
      return;
    }

    if (new Date(form.startDate).getTime() < new Date(form.signDate).getTime()) {
      const message = "Ngày bắt đầu phải bằng hoặc sau ngày ký hợp đồng.";
      setFormError(message);
      toast.error(message);
      return;
    }

    if (!Number.isFinite(form.cycleMonths) || form.cycleMonths < 1) {
      const message = "Chu kỳ thanh toán phải lớn hơn 0 tháng.";
      setFormError(message);
      toast.error(message);
      return;
    }

    if (form.members < 1) {
      const message = "Số thành viên phải lớn hơn 0.";
      setFormError(message);
      toast.error(message);
      return;
    }

    if (!form.signedFileName) {
      const message = "Vui lòng tải lên ảnh hoặc file hợp đồng giấy đã ký.";
      setFormError(message);
      toast.error(message);
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(`${API_BASE_URL}/api/contracts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          maPC: form.depositId,
          maNV: selectedDeposit.maNV,
          ngayKy: form.signDate,
          ngayBatDau: form.startDate,
          kyThanhToan: form.cycleMonths,
          anhHD: form.signedFileName,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.message || "Không thể tạo hợp đồng.");
      }

      const created = mapApiContract(payload.data);
      setSuccessContract(created);
      setForm({
        depositId: "",
        signDate: getTodayInputValue(),
        startDate: getTodayInputValue(),
        cycleMonths: 1,
        members: 1,
        signedFileName: "",
      });

      setAvailableDeposits((current) => current.filter((deposit) => deposit.maPC !== created.depositId));
      toast.success("Tạo hợp đồng thành công.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể tạo hợp đồng.";
      setFormError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Tạo hợp đồng mới" description="Chọn phiếu cọc đã thanh toán, nhập ngày ký và tải lên hợp đồng giấy đã ký." />

      <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div>
          <p className="text-sm font-semibold text-slate-800">Luồng nghiệp vụ</p>
          <p className="text-xs text-slate-500">Hợp đồng mới chỉ được tạo khi phiếu cọc đã đủ điều kiện và file hợp đồng giấy đã được tải lên.</p>
        </div>
        <Button type="button" variant="outline" onClick={() => navigate("/contracts/manage")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại quản lý
        </Button>
      </div>

      {formError && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</div>}

      {successContract && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-5 w-5 text-emerald-600" />
            <div className="space-y-1">
              <p className="font-semibold text-emerald-800">Tạo hợp đồng thành công</p>
              <p className="text-sm text-emerald-700">
                Hợp đồng {successContract.id} đã được lưu từ phiếu cọc {successContract.depositId}, hiệu lực từ {successContract.startDate} đến {successContract.endDate}.
              </p>
              <Button type="button" className="mt-2 bg-emerald-600 hover:bg-emerald-700" onClick={() => navigate("/contracts/manage")}>
                <FileText className="mr-2 h-4 w-4" /> Xem danh sách hợp đồng
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Thông tin hợp đồng</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phiếu cọc đã duyệt</label>
                <select
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  value={form.depositId}
                  onChange={(event) => setForm((current) => ({ ...current, depositId: event.target.value }))}
                  disabled={loadingDeposits}
                >
                  <option value="">-- Chọn phiếu cọc --</option>
                  {availableDeposits.map((deposit) => (
                    <option key={deposit.maPC} value={deposit.maPC}>
                      {deposit.maPC} - {deposit.khachHangName ?? deposit.maKH} - {deposit.roomSummary} ({formatCurrency(deposit.tienCoc)})
                    </option>
                  ))}
                </select>
                {loadingDeposits && <p className="text-xs text-slate-500">Đang tải phiếu cọc đủ điều kiện...</p>}
                {availableDeposits.length === 0 && !loadingDeposits && (
                  <p className="text-xs text-amber-600">Không còn phiếu cọc đã thanh toán nào chưa được lập hợp đồng.</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ngày ký hợp đồng</label>
                  <Input type="date" value={form.signDate} onChange={(event) => setForm((current) => ({ ...current, signDate: event.target.value }))} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ngày bắt đầu ở</label>
                  <Input type="date" value={form.startDate} onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Chu kỳ thanh toán (tháng)</label>
                  <Input
                    type="number"
                    min={1}
                    value={form.cycleMonths}
                    onChange={(event) => setForm((current) => ({ ...current, cycleMonths: Math.max(1, Number(event.target.value) || 1) }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Số thành viên theo hợp đồng</label>
                  <Input
                    type="number"
                    min={1}
                    value={form.members}
                    onChange={(event) => setForm((current) => ({ ...current, members: Math.max(1, Number(event.target.value) || 1) }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <Upload className="h-4 w-4 text-slate-500" /> Ảnh hoặc file hợp đồng giấy
                </label>
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(event) => setForm((current) => ({ ...current, signedFileName: event.target.files?.[0]?.name ?? "" }))}
                />
                <p className="text-xs text-slate-500">Tệp được lưu dưới dạng tên file để mô phỏng bước tải lên hợp đồng giấy đã ký.</p>
                {form.signedFileName && <p className="text-xs font-medium text-blue-600">Đã chọn: {form.signedFileName}</p>}
              </div>

              <Button type="submit" className="h-11 w-full bg-blue-600 font-semibold hover:bg-blue-700" disabled={submitting}>
                <Save className="mr-2 h-4 w-4" /> Tạo hợp đồng
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-blue-200 bg-blue-50/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-blue-800">
                <CalendarDays className="h-5 w-5" /> Xem trước hợp đồng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {selectedDeposit ? (
                <>
                  <div className="flex justify-between border-b border-blue-100 pb-2">
                    <span className="text-slate-600">Khách hàng:</span>
                    <span className="font-semibold">{selectedDeposit.khachHangName ?? selectedDeposit.maKH}</span>
                  </div>
                  <div className="flex justify-between border-b border-blue-100 pb-2">
                    <span className="text-slate-600">Phòng / giường:</span>
                    <span className="font-semibold">{selectedDeposit.roomSummary}</span>
                  </div>
                  <div className="flex justify-between border-b border-blue-100 pb-2">
                    <span className="text-slate-600">Tiền cọc:</span>
                    <span className="font-semibold">{formatCurrency(selectedDeposit.tienCoc)}</span>
                  </div>
                  <div className="flex justify-between border-b border-blue-100 pb-2">
                    <span className="text-slate-600">Ngày ký:</span>
                    <span className="font-semibold">{form.signDate || "--"}</span>
                  </div>
                  <div className="flex justify-between border-b border-blue-100 pb-2">
                    <span className="text-slate-600">Ngày bắt đầu:</span>
                    <span className="font-semibold">{form.startDate || "--"}</span>
                  </div>
                  <div className="flex justify-between border-b border-blue-100 pb-2">
                    <span className="text-slate-600">Ngày kết thúc dự kiến:</span>
                    <span className="font-semibold">{contractEndDate || "--"}</span>
                  </div>
                  <div className="flex justify-between border-b border-blue-100 pb-2">
                    <span className="text-slate-600">Chu kỳ thanh toán:</span>
                    <span className="font-semibold">{form.cycleMonths} tháng</span>
                  </div>
                  <div className="flex justify-between border-b border-blue-100 pb-2">
                    <span className="text-slate-600">Số thành viên:</span>
                    <span className="font-semibold">{form.members} người</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-600">Người lập:</span>
                    <span className="font-semibold">{selectedDeposit.maNV}</span>
                  </div>
                </>
              ) : (
                <div className="flex min-h-64 items-center justify-center rounded-md border border-dashed border-blue-200 bg-white/70 px-6 text-center text-slate-500">
                  Chọn phiếu cọc đã thanh toán để xem trước thông tin hợp đồng, ngày kết thúc và file giấy đã ký.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-slate-700">Điều kiện lưu hợp đồng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <div className="flex items-start gap-2 rounded-md bg-slate-50 p-3">
                <CircleAlert className="mt-0.5 h-4 w-4 text-slate-500" />
                <p>Phiếu cọc phải ở trạng thái đã thanh toán và chưa từng được dùng để lập hợp đồng.</p>
              </div>
              <div className="flex items-start gap-2 rounded-md bg-slate-50 p-3">
                <CircleAlert className="mt-0.5 h-4 w-4 text-slate-500" />
                <p>Ngày bắt đầu ở phải bằng hoặc sau ngày ký hợp đồng, chu kỳ thanh toán phải lớn hơn 0 tháng.</p>
              </div>
              <div className="flex items-start gap-2 rounded-md bg-slate-50 p-3">
                <CircleAlert className="mt-0.5 h-4 w-4 text-slate-500" />
                <p>File hợp đồng giấy đã ký là bắt buộc để hoàn tất bước lưu thông tin hợp đồng.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function ContractManage() {
  const navigate = useNavigate();
  const [contractRows, setContractRows] = useState<ContractRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContracts = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/contracts`);
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(payload.message || "Không thể tải danh sách hợp đồng.");
        }

        setContractRows((payload.data || []).map(mapApiContract));
      } catch (error) {
        const message = error instanceof Error ? error.message : "Không thể tải danh sách hợp đồng.";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, []);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Quản lý Hợp đồng"
        description="Lập hợp đồng kế thừa dữ liệu từ phiếu cọc, ghi nhận chu kỳ thanh toán."
        btnText="Lập Hợp đồng mới"
        onBtnClick={() => navigate("/contracts/create")}
      />

      <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
        Hợp đồng được lấy trực tiếp từ API backend, đồng bộ theo dữ liệu đã lưu trong cơ sở dữ liệu.
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã HĐ</TableHead>
                <TableHead>Người đại diện</TableHead>
                <TableHead>Phòng</TableHead>
                <TableHead>Số người</TableHead>
                <TableHead>Bắt đầu ở</TableHead>
                <TableHead>Chu kỳ đóng</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-slate-500">
                    Đang tải danh sách hợp đồng...
                  </TableCell>
                </TableRow>
              )}

              {!loading && contractRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-slate-500">
                    Chưa có hợp đồng nào trong hệ thống.
                  </TableCell>
                </TableRow>
              )}

              {!loading &&
                contractRows.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell className="font-medium text-blue-700">{contract.id}</TableCell>
                    <TableCell>{contract.customer}</TableCell>
                    <TableCell className="font-bold">{contract.room}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-slate-400" /> {contract.members}
                      </div>
                    </TableCell>
                    <TableCell>{contract.startDate}</TableCell>
                    <TableCell>{contract.cycle}</TableCell>
                    <TableCell>
                      <span
                        className={`rounded-md px-2 py-1 text-xs font-semibold ${
                          contract.status === "DangHieuLuc"
                            ? "bg-green-100 text-green-700"
                            : contract.status === "DaThanhLy"
                              ? "bg-slate-200 text-slate-700"
                              : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {contract.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" className="h-7 text-xs">
                        <FileText className="mr-1 h-3 w-3" /> Chi tiết
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

// Thu ti?n k? d?u
export function ContractReceipts() {
  const receipts = [
    { id: "PT001", contract: "CT001", type: "Thu ti?n ph�ng T4 + DV", amount: 5500000, date: "2026-04-05", status: "Chua thu" },
    { id: "PT002", contract: "CT002", type: "Thu ti?n ph�ng T10-T12", amount: 7200000, date: "2025-10-01", status: "�� thu" },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Phi?u thu ti?n k? d?u" description="Ghi nh?n thu ti?n thu� th�ng d?u v� ph� d?ch v? khi kh�ch b?t d?u d?n v�o." />
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>M� PT</TableHead>
                <TableHead>H?p d?ng</TableHead>
                <TableHead>N?i dung</TableHead>
                <TableHead>S? ti?n (VND)</TableHead>
                <TableHead>Ng�y l?p</TableHead>
                <TableHead>Tr?ng th�i</TableHead>
                <TableHead>Thao t�c</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receipts.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium text-green-700">{r.id}</TableCell>
                  <TableCell>{r.contract}</TableCell>
                  <TableCell>{r.type}</TableCell>
                  <TableCell className="font-bold text-red-500">{r.amount.toLocaleString()} d</TableCell>
                  <TableCell>{r.date}</TableCell>
                  <TableCell>
                    <span className={`rounded-md px-2 py-1 text-xs font-semibold ${r.status === "�� thu" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{r.status}</span>
                  </TableCell>
                  <TableCell>
                    {r.status === "Chua thu" && (
                      <Button size="sm" className="h-7 bg-green-600 text-xs hover:bg-green-700">
                        <Banknote className="mr-1 h-3 w-3" /> Ghi nh?n Thu
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

// B�n giao ph�ng
export function ContractHandover() {
  return (
    <div className="space-y-6">
      <PageHeader title="Bi�n b?n B�n giao ph�ng" description="Check-list t�i s?n c?p ph�t v� x�c nh?n d?i tr?ng th�i." />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="border-b border-slate-200 bg-slate-50">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Key className="h-5 w-5 text-blue-600" /> L?p bi�n b?n b�n giao (CT001)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4 text-sm">
            <div className="mb-4 grid grid-cols-2 gap-2 rounded-md border border-slate-100 bg-slate-50 p-3">
              <div>
                <span className="text-slate-500">Ngu?i nh?n:</span> <br />�?ng Vi?t H�ng
              </div>
              <div>
                <span className="text-slate-500">Ph�ng nh?n:</span> <br />
                <span className="font-bold">R101 (2 giu?ng)</span>
              </div>
              <div>
                <span className="text-slate-500">Ng�y b�n giao:</span> <br />05/04/2026
              </div>
              <div>
                <span className="text-slate-500">Nh�n vi�n BG:</span> <br />Ph?m ��nh B?o
              </div>
            </div>

            <h4 className="border-b pb-1 font-semibold text-slate-700">Check-list T�i s?n c?p ph�t</h4>

            <div className="space-y-3">
              <label className="flex items-center space-x-3 rounded border bg-white p-2 shadow-sm transition-colors hover:border-blue-300">
                <input type="checkbox" className="h-4 w-4 rounded text-blue-600" />
                <span className="flex-1">2 Th? t? thang m�y (M�: TM-01, TM-02)</span>
              </label>

              <label className="flex items-center space-x-3 rounded border bg-white p-2 shadow-sm transition-colors hover:border-blue-300">
                <input type="checkbox" className="h-4 w-4 rounded text-blue-600" />
                <span className="flex-1">2 Ch�a kh�a t? c� nh�n (T? s? 1, 2)</span>
              </label>

              <label className="flex items-center space-x-3 rounded border bg-white p-2 shadow-sm transition-colors hover:border-blue-300">
                <input type="checkbox" className="h-4 w-4 rounded text-blue-600" />
                <span className="flex-1">X�c nh?n hi?n tr?ng giu?ng, n?m s?ch s?, nguy�n v?n</span>
              </label>

              <label className="flex items-center space-x-3 rounded border bg-white p-2 shadow-sm transition-colors hover:border-blue-300">
                <input type="checkbox" className="h-4 w-4 rounded text-blue-600" />
                <span className="flex-1">
                  Ghi nh?n ch? s? di?n d?u v�o: <Input className="ml-2 inline-block h-6 w-20 px-1 py-0 text-xs" defaultValue="150" /> kWh
                </span>
              </label>
            </div>

            <Button className="mt-4 h-12 w-full bg-blue-600 text-base font-bold text-white shadow-md hover:bg-blue-700">
              <DoorOpen className="mr-2 h-5 w-5" /> Ho�n t?t B�n giao & Nh?n ph�ng
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="flex items-start gap-3 p-4">
              <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-yellow-600" />
              <div>
                <h4 className="mb-1 text-sm font-bold text-yellow-800">C?p nh?t Tr?ng th�i Nh?n ph�ng</h4>
                <p className="text-xs text-yellow-700">
                  Ngay khi b?n nh?n "Ho�n t?t B�n giao", h? th?ng s? t? d?ng d?i tr?ng th�i 2 giu?ng thu?c ph�ng R101 th�nh <strong>"�ang thu�"</strong>. H?p d?ng CT001 ch�nh th?c c� hi?u l?c t�nh ph� luu tr�.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-slate-200 bg-slate-50 py-3">
              <CardTitle className="text-sm font-semibold text-slate-700">L?ch s? b�n giao g?n d�y</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="text-xs">
                      <div className="font-bold text-slate-800">CT002 - Vu Ki?u Oanh (R102)</div>
                      <div className="text-slate-500">�� b�n giao: 01/10/2025</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="rounded bg-green-100 px-2 py-1 text-[10px] font-bold text-green-700">Ho�n t?t</span>
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
