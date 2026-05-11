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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
  X,
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

// Xét duyệt điều kiện và Quản lý thành viên
export function ContractMembers() {
  const [members, setMembers] = useState([
    {
      id: "M001",
      name: "Nguyễn Việt Hoàng",
      type: "Đại diện",
      cmt: "001099123456",
      dob: "2001-05-12",
      status: "Chờ duyệt",
      contract: "CT001",
      conditions: {
        validDocument: true,
        residenceInfo: true,
        genderSuitable: true,
        capacitySuitable: false,
        acceptedRules: true,
        noViolation: true,
      },
    },
    {
      id: "M002",
      name: "Nguyễn Tiến Khang",
      type: "Ở ghép",
      cmt: "001099654321",
      dob: "2002-11-20",
      status: "Chờ duyệt",
      contract: "CT001",
      conditions: {
        validDocument: true,
        residenceInfo: false,
        genderSuitable: true,
        capacitySuitable: true,
        acceptedRules: true,
        noViolation: true,
      },
    },
    {
      id: "M003",
      name: "Vũ Kiều Oanh",
      type: "Đại diện",
      cmt: "001099999888",
      dob: "2000-01-01",
      status: "Chờ duyệt",
      contract: "CT002",
      conditions: {
        validDocument: true,
        residenceInfo: true,
        genderSuitable: true,
        capacitySuitable: true,
        acceptedRules: false,
        noViolation: true,
      },
    },
  ]);

  const [selectedMember, setSelectedMember] = useState<typeof members[0] | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleRowClick = (member: typeof members[0]) => {
    setSelectedMember({ ...member });
    setShowModal(true);
  };

  const handleConditionChange = (key: keyof typeof selectedMember.conditions, checked: boolean) => {
    if (selectedMember) {
      setSelectedMember(prev => prev ? { ...prev, conditions: { ...prev.conditions, [key]: checked } } : null);
    }
  };

  const isAllConditionsMet = selectedMember ? Object.values(selectedMember.conditions).every(Boolean) : false;

  const handleSaveUpdate = () => {
    if (selectedMember) {
      setMembers(prev => prev.map(m => m.id === selectedMember.id ? { ...selectedMember } : m));
      toast.success("Đã lưu cập nhật điều kiện.");
    }
  };

  const handleApprove = () => {
    if (!isAllConditionsMet) {
      toast.error("Thành viên chưa đáp ứng đủ điều kiện lưu trú.");
      return;
    }
    if (selectedMember) {
      const updatedMember = { ...selectedMember, status: "Đã duyệt" };
      setMembers(prev => prev.map(m => m.id === selectedMember.id ? updatedMember : m));
      setSelectedMember(updatedMember);
      toast.success("Đã duyệt điều kiện lưu trú cho thành viên.");
    }
  };

  const conditionLabels = {
    validDocument: "Giấy tờ tùy thân hợp lệ",
    residenceInfo: "Thông tin cư trú đầy đủ",
    genderSuitable: "Giới tính phù hợp với phòng/khu vực",
    capacitySuitable: "Số lượng thành viên phù hợp số giường/phòng đã đặt",
    acceptedRules: "Đồng ý nội quy ký túc xá",
    noViolation: "Không vi phạm điều kiện lưu trú",
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Quản lý & Xét duyệt Thành viên" description="Quản lý nhân thân và duyệt hồ sơ trước khi ký hợp đồng." btnText="Thêm thành viên" />
      <div className="mb-4 flex gap-4">
        <Input placeholder="Tìm CMND/CCCD..." className="max-w-xs" />
        <select className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm">
          <option>Tất cả Hợp đồng</option>
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
                <TableHead>Mã TV</TableHead>
                <TableHead>Họ Tên</TableHead>
                <TableHead>CMND/CCCD</TableHead>
                <TableHead>Ngày sinh</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Thuộc HĐ</TableHead>
                <TableHead>Tình trạng</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((m) => (
                <TableRow key={m.id} className="cursor-pointer hover:bg-slate-50" onClick={() => handleRowClick(m)}>
                  <TableCell className="font-medium">{m.id}</TableCell>
                  <TableCell>{m.name}</TableCell>
                  <TableCell>{m.cmt}</TableCell>
                  <TableCell>{m.dob}</TableCell>
                  <TableCell>
                    <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${m.type === "Đại diện" ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-700"}`}>
                      {m.type}
                    </span>
                  </TableCell>
                  <TableCell className="font-semibold text-blue-600">{m.contract}</TableCell>
                  <TableCell>
                    <span className={`flex w-max items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ${m.status === "Đã duyệt" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                      {m.status === "Đã duyệt" ? <ShieldCheck className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                      {m.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); handleRowClick(m); }}>
                      <Edit2 className="h-3 w-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Cập nhật thành viên nhóm</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Mã thành viên:</strong> {selectedMember.id}</div>
                <div><strong>Họ tên:</strong> {selectedMember.name}</div>
                <div><strong>CMND/CCCD:</strong> {selectedMember.cmt}</div>
                <div><strong>Ngày sinh:</strong> {selectedMember.dob}</div>
                <div><strong>Vai trò:</strong> {selectedMember.type}</div>
                <div><strong>Hợp đồng:</strong> {selectedMember.contract}</div>
                <div className="col-span-2">
                  <strong>Trạng thái:</strong>{" "}
                  <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ${selectedMember.status === "Đã duyệt" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                    {selectedMember.status === "Đã duyệt" ? <ShieldCheck className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                    {selectedMember.status}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Điều kiện lưu trú</h4>
                <div className="space-y-2">
                  {Object.entries(conditionLabels).map(([key, label]) => {
                    const conditionKey = key as keyof typeof selectedMember.conditions;
                    const checked = selectedMember.conditions[conditionKey];
                    return (
                      <div key={key} className="flex items-center justify-between">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => handleConditionChange(conditionKey, e.target.checked)}
                            className="h-4 w-4 rounded text-blue-600"
                          />
                          <span className="text-sm">{label}</span>
                        </label>
                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${checked ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {checked ? "Đạt" : "Chưa đạt"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Đóng
            </Button>
            <Button onClick={handleSaveUpdate}>
              Lưu cập nhật
            </Button>
            <Button onClick={handleApprove} disabled={!isAllConditionsMet}>
              Xác nhận duyệt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Lập Hợp đồng thuê
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
        const userId = localStorage.getItem('userId') || 'NV001';
        const userRole = localStorage.getItem('userRole') || 'sale';
        const response = await fetch(`${API_BASE_URL}/api/contracts/eligible-deposits`, {
          headers: {
            'x-user-id': userId,
            'x-user-role': userRole,
          },
        });
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

      const userId = localStorage.getItem('userId') || 'NV001';
      const userRole = localStorage.getItem('userRole') || 'sale';
      
      // Create FormData to handle file upload
      const formData = new FormData();
      formData.append('maPC', form.depositId);
      formData.append('maNV', selectedDeposit.maNV);
      formData.append('ngayKy', form.signDate);
      formData.append('ngayBatDau', form.startDate);
      formData.append('kyThanhToan', form.cycleMonths.toString());
      
      // Append file if it exists
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput?.files?.[0]) {
        formData.append('anhHD', fileInput.files[0]);
      }

      const response = await fetch(`${API_BASE_URL}/api/contracts`, {
        method: "POST",
        headers: {
          'x-user-id': userId,
          'x-user-role': userRole,
        },
        body: formData,
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

      // Reset file input
      if (fileInput) {
        fileInput.value = "";
      }

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
        const userId = localStorage.getItem('userId') || 'NV001';
        const userRole = localStorage.getItem('userRole') || 'sale';
        const response = await fetch(`${API_BASE_URL}/api/contracts`, {
          headers: {
            'x-user-id': userId,
            'x-user-role': userRole,
          },
        });
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
                        className={`rounded-md px-2 py-1 text-xs font-semibold ${contract.status === "DangHieuLuc"
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

// Thu tiền kỳ đầu
export function ContractReceipts() {
  const [receipts, setReceipts] = useState([
    { id: "PT001", contract: "CT001", type: "Tiền thuê: 5,000,000đ | Điện/nước: 300,000đ | Wifi: 100,000đ | Gửi xe: 100,000đ", amount: 5500000, date: "2026-04-05", status: "Chưa thu" },
    { id: "PT002", contract: "CT002", type: "Tiền thuê: 7,000,000đ | Điện/nước: 200,000đ | Wifi: 100,000đ | Gửi xe: 100,000đ", amount: 7200000, date: "2025-10-01", status: "Đã thu" },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    contract: "",
    rent: 0,
    electricity: 0,
    wifi: 0,
    parking: 0,
    date: getTodayInputValue(),
    note: "",
  });

  const [otherFeeName, setOtherFeeName] = useState("");
  const [otherFeeAmount, setOtherFeeAmount] = useState(0);
  const [otherFees, setOtherFees] = useState<{ id: string; name: string; amount: number }[]>([]);

  const availableContracts = ["CT001", "CT002", "CT003"];

  const totalAmount = formData.rent + formData.electricity + formData.wifi + formData.parking + otherFees.reduce((sum, fee) => sum + fee.amount, 0);

  const handleFormChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddOtherFee = () => {
    if (!otherFeeName.trim()) {
      toast.error("Vui lòng nhập nội dung khoản khác.");
      return;
    }
    if (otherFeeAmount <= 0) {
      toast.error("Số tiền khoản khác phải lớn hơn 0.");
      return;
    }
    const newFee = {
      id: `other-${Date.now()}`,
      name: otherFeeName.trim(),
      amount: otherFeeAmount,
    };
    setOtherFees(prev => [...prev, newFee]);
    setOtherFeeName("");
    setOtherFeeAmount(0);
    toast.success("Đã thêm khoản khác.");
  };

  const handleRemoveOtherFee = (id: string) => {
    setOtherFees(prev => prev.filter(fee => fee.id !== id));
  };

  const handleSaveReceipt = () => {
    if (!formData.contract) {
      toast.error("Vui lòng chọn hợp đồng!");
      return;
    }
    if (formData.rent < 0 || formData.electricity < 0 || formData.wifi < 0 || formData.parking < 0) {
      toast.error("Các khoản tiền không được âm!");
      return;
    }

    const maxId = Math.max(...receipts.map(r => parseInt(r.id.slice(2))));
    const newId = `PT${String(maxId + 1).padStart(3, "0")}`;
    let newType = `Tiền thuê: ${formData.rent.toLocaleString()}đ | Điện/nước: ${formData.electricity.toLocaleString()}đ | Wifi: ${formData.wifi.toLocaleString()}đ | Gửi xe: ${formData.parking.toLocaleString()}đ`;
    if (otherFees.length > 0) {
      const otherFeesStr = otherFees.map(fee => `${fee.name} ${fee.amount.toLocaleString()}đ`).join(", ");
      newType += ` | Khác: ${otherFeesStr}`;
    }

    const newReceipt = {
      id: newId,
      contract: formData.contract,
      type: newType,
      amount: totalAmount,
      date: formData.date,
      status: "Chưa thu" as const,
    };

    setReceipts(prev => [newReceipt, ...prev]);
    setFormData({
      contract: "",
      rent: 0,
      electricity: 0,
      wifi: 0,
      parking: 0,
      date: getTodayInputValue(),
      note: "",
    });
    setOtherFees([]);
    setShowForm(false);
    toast.success("Lập phiếu thu kỳ đầu thành công.");
  };

  const handleRecordPayment = (id: string) => {
    setReceipts(prev => prev.map(r => r.id === id ? { ...r, status: "Đã thu" } : r));
    toast.success("Đã ghi nhận thu tiền kỳ đầu.");
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Phiếu thu tiền kỳ đầu"
        description="Ghi nhận thu tiền thuê tháng đầu và phí dịch vụ khi khách bắt đầu dọn vào."
        btnText="Lập phiếu thu"
        onBtnClick={() => setShowForm(true)}
      />

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Lập phiếu thu kỳ đầu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Hợp đồng</label>
                <select
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                  value={formData.contract}
                  onChange={(e) => handleFormChange("contract", e.target.value)}
                >
                  <option value="">-- Chọn hợp đồng --</option>
                  {availableContracts.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Ngày lập</label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleFormChange("date", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tiền thuê kỳ đầu (VND)</label>
                <Input
                  type="number"
                  min={0}
                  value={formData.rent}
                  onChange={(e) => handleFormChange("rent", Number(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phí điện/nước ban đầu (VND)</label>
                <Input
                  type="number"
                  min={0}
                  value={formData.electricity}
                  onChange={(e) => handleFormChange("electricity", Number(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Phí wifi (VND)</label>
                <Input
                  type="number"
                  min={0}
                  value={formData.wifi}
                  onChange={(e) => handleFormChange("wifi", Number(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phí gửi xe (VND)</label>
                <Input
                  type="number"
                  min={0}
                  value={formData.parking}
                  onChange={(e) => handleFormChange("parking", Number(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold">Khoản khác</h4>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nội dung khoản khác</label>
                  <Input
                    value={otherFeeName}
                    onChange={(e) => setOtherFeeName(e.target.value)}
                    placeholder="Ví dụ: Phí vệ sinh, Phí làm thẻ"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Số tiền (VND)</label>
                  <Input
                    type="number"
                    min={0}
                    value={otherFeeAmount}
                    onChange={(e) => setOtherFeeAmount(Number(e.target.value) || 0)}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleAddOtherFee} className="w-full">
                    Thêm khoản
                  </Button>
                </div>
              </div>
              {otherFees.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Danh sách khoản khác:</label>
                  <div className="space-y-1">
                    {otherFees.map((fee) => (
                      <div key={fee.id} className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 p-2">
                        <span className="text-sm">{fee.name}: {fee.amount.toLocaleString()}đ</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveOtherFee(fee.id)}
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ghi chú/Nội dung thu</label>
              <Input
                value={formData.note}
                onChange={(e) => handleFormChange("note", e.target.value)}
                placeholder="Ghi chú thêm nếu có"
              />
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm font-semibold">
                Tổng tiền: {totalAmount.toLocaleString()} VND
              </div>
              <div className="space-x-2">
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Hủy
                </Button>
                <Button onClick={handleSaveReceipt}>
                  Lưu phiếu thu
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã PT</TableHead>
                <TableHead>Hợp đồng</TableHead>
                <TableHead>Nội dung</TableHead>
                <TableHead>Số tiền (VND)</TableHead>
                <TableHead>Ngày lập</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thao tác</TableHead>
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
                    <span className={`rounded-md px-2 py-1 text-xs font-semibold ${r.status === "Đã thu" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{r.status}</span>
                  </TableCell>
                  <TableCell>
                    {r.status === "Chưa thu" && (
                      <Button size="sm" className="h-7 bg-green-600 text-xs hover:bg-green-700" onClick={() => handleRecordPayment(r.id)}>
                        <Banknote className="mr-1 h-3 w-3" /> Ghi nhận Thu
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

// Bàn giao phòng
export function ContractHandover() {
  const [contracts, setContracts] = useState([
    {
      contractId: "CT001",
      customerName: "Nguyễn Việt Hoàng",
      roomName: "R101",
      bedCount: 2,
      handoverDate: getTodayInputValue(),
      staffName: "Phạm Đình Bảo",
      status: "Chưa bàn giao" as const,
    },
    {
      contractId: "CT002",
      customerName: "Vũ Kiều Oanh",
      roomName: "R102",
      bedCount: 2,
      handoverDate: "2025-10-01",
      staffName: "Nguyễn Thị Lan",
      status: "Đã bàn giao" as const,
      electricIndex: "120",
      waterIndex: "45",
      note: "Phòng sạch sẽ, thiết bị đầy đủ",
      checklist: {
        bed: true,
        mattress: true,
        personalLocker: true,
        accessCard: true,
        roomClean: true,
        rulesGuided: true,
      },
    },
    {
      contractId: "CT003",
      customerName: "Nguyễn Tiến Khang",
      roomName: "R103",
      bedCount: 1,
      handoverDate: getTodayInputValue(),
      staffName: "Trần Văn Minh",
      status: "Chưa bàn giao" as const,
    },
  ]);

  const [selectedContract, setSelectedContract] = useState<typeof contracts[0] | null>(null);

  const [checklist, setChecklist] = useState({
    bed: false,
    mattress: false,
    personalLocker: false,
    accessCard: false,
    roomClean: false,
    rulesGuided: false,
    electricityMeter: "",
    waterMeter: "",
    roomNotes: "",
  });

  const [isCompleted, setIsCompleted] = useState(false);

  const handleSelectContract = (contract: typeof contracts[0]) => {
    setSelectedContract(contract);
    setChecklist(contract.checklist || {
      bed: contract.status === "Đã bàn giao" ? true : false,
      mattress: contract.status === "Đã bàn giao" ? true : false,
      personalLocker: contract.status === "Đã bàn giao" ? true : false,
      accessCard: contract.status === "Đã bàn giao" ? true : false,
      roomClean: contract.status === "Đã bàn giao" ? true : false,
      rulesGuided: contract.status === "Đã bàn giao" ? true : false,
      electricityMeter: contract.electricIndex || "",
      waterMeter: contract.waterIndex || "",
      roomNotes: contract.note || "",
    });
    setIsCompleted(contract.status === "Đã bàn giao");
  };

  const handleChecklistChange = (key: keyof typeof checklist, value: boolean | string) => {
    setChecklist(prev => ({ ...prev, [key]: value }));
  };

  const handleComplete = () => {
    if (!selectedContract) return;

    const { bed, mattress, personalLocker, accessCard, roomClean, rulesGuided, electricityMeter, waterMeter } = checklist;
    if (!bed || !mattress || !personalLocker || !accessCard || !roomClean || !rulesGuided) {
      toast.error("Vui lòng kiểm tra đủ tài sản và nhập chỉ số điện/nước trước khi bàn giao.");
      return;
    }
    if (!electricityMeter.trim() || parseFloat(electricityMeter) < 0) {
      toast.error("Vui lòng nhập chỉ số điện đầu vào hợp lệ.");
      return;
    }
    if (!waterMeter.trim() || parseFloat(waterMeter) < 0) {
      toast.error("Vui lòng nhập chỉ số nước đầu vào hợp lệ.");
      return;
    }

    const updatedContract = {
      ...selectedContract,
      status: "Đã bàn giao" as const,
      electricIndex: electricityMeter,
      waterIndex: waterMeter,
      note: checklist.roomNotes,
      checklist: {
        bed,
        mattress,
        personalLocker,
        accessCard,
        roomClean,
        rulesGuided,
      },
    };

    setContracts(prev => prev.map(c => c.contractId === selectedContract.contractId ? updatedContract : c));
    setSelectedContract(updatedContract);
    setIsCompleted(true);
    toast.success("Hoàn tất bàn giao phòng. Khách chính thức nhận phòng.");
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Biên bản Bàn giao phòng" description="Check-list tài sản cấp phát và xác nhận đối trạng thái." />

      {/* Phần A: Danh sách hợp đồng */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Danh sách hợp đồng chờ bàn giao</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã hợp đồng</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Phòng</TableHead>
                <TableHead>Số giường</TableHead>
                <TableHead>Ngày bàn giao</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts.map((contract) => (
                <TableRow key={contract.contractId}>
                  <TableCell className="font-medium">{contract.contractId}</TableCell>
                  <TableCell>{contract.customerName}</TableCell>
                  <TableCell>{contract.roomName}</TableCell>
                  <TableCell>{contract.bedCount}</TableCell>
                  <TableCell>{contract.handoverDate}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ${contract.status === "Đã bàn giao" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                      {contract.status === "Đã bàn giao" ? <ShieldCheck className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                      {contract.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      onClick={() => handleSelectContract(contract)}
                      className={contract.status === "Đã bàn giao" ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}
                    >
                      {contract.status === "Đã bàn giao" ? "Xem biên bản" : "Lập biên bản"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Phần B: Biên bản bàn giao */}
      {!selectedContract ? (
        <Card className="border-dashed border-slate-300 bg-slate-50">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center text-slate-500">
              <Key className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">Vui lòng chọn một hợp đồng để lập hoặc xem biên bản bàn giao.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="border-b border-slate-200 bg-slate-50">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Key className="h-5 w-5 text-blue-600" /> Biên bản bàn giao ({selectedContract.contractId})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4 text-sm">
              <div className="mb-4 grid grid-cols-2 gap-2 rounded-md border border-slate-100 bg-slate-50 p-3">
                <div>
                  <span className="text-slate-500">Mã hợp đồng:</span> <br />
                  <span className="font-bold">{selectedContract.contractId}</span>
                </div>
                <div>
                  <span className="text-slate-500">Khách hàng/người đại diện:</span> <br />
                  <span className="font-bold">{selectedContract.customerName}</span>
                </div>
                <div>
                  <span className="text-slate-500">Phòng nhận:</span> <br />
                  <span className="font-bold">{selectedContract.roomName} ({selectedContract.bedCount} giường)</span>
                </div>
                <div>
                  <span className="text-slate-500">Ngày bàn giao:</span> <br />
                  <span className="font-bold">{selectedContract.handoverDate}</span>
                </div>
                <div>
                  <span className="text-slate-500">Nhân viên bàn giao:</span> <br />
                  <span className="font-bold">{selectedContract.staffName}</span>
                </div>
                <div>
                  <span className="text-slate-500">Trạng thái bàn giao:</span> <br />
                  <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ${selectedContract.status === "Đã bàn giao" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                    {selectedContract.status === "Đã bàn giao" ? <ShieldCheck className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                    {selectedContract.status}
                  </span>
                </div>
              </div>

              <h4 className="border-b pb-1 font-semibold text-slate-700">Check-list Tài sản cấp phát</h4>

              <div className="space-y-3">
                <label className="flex items-center space-x-3 rounded border bg-white p-2 shadow-sm transition-colors hover:border-blue-300">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded text-blue-600"
                    checked={checklist.bed}
                    disabled={selectedContract.status === "Đã bàn giao"}
                    onChange={(e) => handleChecklistChange("bed", e.target.checked)}
                  />
                  <span className="flex-1">Giường</span>
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${checklist.bed ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                    {checklist.bed ? "Đã kiểm tra" : "Chưa kiểm tra"}
                  </span>
                </label>

                <label className="flex items-center space-x-3 rounded border bg-white p-2 shadow-sm transition-colors hover:border-blue-300">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded text-blue-600"
                    checked={checklist.mattress}
                    disabled={selectedContract.status === "Đã bàn giao"}
                    onChange={(e) => handleChecklistChange("mattress", e.target.checked)}
                  />
                  <span className="flex-1">Nệm</span>
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${checklist.mattress ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                    {checklist.mattress ? "Đã kiểm tra" : "Chưa kiểm tra"}
                  </span>
                </label>

                <label className="flex items-center space-x-3 rounded border bg-white p-2 shadow-sm transition-colors hover:border-blue-300">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded text-blue-600"
                    checked={checklist.personalLocker}
                    disabled={selectedContract.status === "Đã bàn giao"}
                    onChange={(e) => handleChecklistChange("personalLocker", e.target.checked)}
                  />
                  <span className="flex-1">Tủ cá nhân</span>
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${checklist.personalLocker ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                    {checklist.personalLocker ? "Đã kiểm tra" : "Chưa kiểm tra"}
                  </span>
                </label>

                <label className="flex items-center space-x-3 rounded border bg-white p-2 shadow-sm transition-colors hover:border-blue-300">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded text-blue-600"
                    checked={checklist.accessCard}
                    disabled={selectedContract.status === "Đã bàn giao"}
                    onChange={(e) => handleChecklistChange("accessCard", e.target.checked)}
                  />
                  <span className="flex-1">Thẻ từ/chìa khóa</span>
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${checklist.accessCard ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                    {checklist.accessCard ? "Đã kiểm tra" : "Chưa kiểm tra"}
                  </span>
                </label>

                <label className="flex items-center space-x-3 rounded border bg-white p-2 shadow-sm transition-colors hover:border-blue-300">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded text-blue-600"
                    checked={checklist.roomClean}
                    disabled={selectedContract.status === "Đã bàn giao"}
                    onChange={(e) => handleChecklistChange("roomClean", e.target.checked)}
                  />
                  <span className="flex-1">Khu vực phòng sạch sẽ, đúng hiện trạng</span>
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${checklist.roomClean ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                    {checklist.roomClean ? "Đã kiểm tra" : "Chưa kiểm tra"}
                  </span>
                </label>

                <label className="flex items-center space-x-3 rounded border bg-white p-2 shadow-sm transition-colors hover:border-blue-300">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded text-blue-600"
                    checked={checklist.rulesGuided}
                    disabled={selectedContract.status === "Đã bàn giao"}
                    onChange={(e) => handleChecklistChange("rulesGuided", e.target.checked)}
                  />
                  <span className="flex-1">Đã hướng dẫn nội quy và sử dụng tiện ích chung</span>
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${checklist.rulesGuided ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                    {checklist.rulesGuided ? "Đã kiểm tra" : "Chưa kiểm tra"}
                  </span>
                </label>
              </div>

              <h4 className="border-b pb-1 font-semibold text-slate-700">Ghi nhận chỉ số điện/nước đầu vào</h4>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <label className="flex-1">Chỉ số điện đầu vào (kWh):</label>
                  <Input
                    type="number"
                    min={0}
                    className="w-24"
                    value={checklist.electricityMeter}
                    disabled={selectedContract.status === "Đã bàn giao"}
                    onChange={(e) => handleChecklistChange("electricityMeter", e.target.value)}
                    placeholder="150"
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <label className="flex-1">Chỉ số nước đầu vào (m³):</label>
                  <Input
                    type="number"
                    min={0}
                    className="w-24"
                    value={checklist.waterMeter}
                    disabled={selectedContract.status === "Đã bàn giao"}
                    onChange={(e) => handleChecklistChange("waterMeter", e.target.value)}
                    placeholder="50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Ghi chú hiện trạng phòng:</label>
                  <Input
                    value={checklist.roomNotes}
                    disabled={selectedContract.status === "Đã bàn giao"}
                    onChange={(e) => handleChecklistChange("roomNotes", e.target.value)}
                    placeholder="Ví dụ: Phòng sạch sẽ, thiết bị đầy đủ..."
                  />
                </div>
              </div>

              <Button
                className="mt-4 h-12 w-full bg-blue-600 text-base font-bold text-white shadow-md hover:bg-blue-700 disabled:bg-slate-400"
                disabled={isCompleted}
                onClick={handleComplete}
              >
                <DoorOpen className="mr-2 h-5 w-5" /> {isCompleted ? "Đã hoàn tất bàn giao" : "Hoàn tất Bàn giao & Nhận phòng"}
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {isCompleted && selectedContract.status === "Đã bàn giao" && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader className="border-b border-green-200 bg-green-100">
                  <CardTitle className="flex items-center gap-2 text-lg text-green-800">
                    <CheckCircle className="h-5 w-5" /> Biên bản bàn giao phòng
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-4 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div><strong>Mã hợp đồng:</strong> {selectedContract.contractId}</div>
                    <div><strong>Khách nhận phòng:</strong> {selectedContract.customerName}</div>
                    <div><strong>Phòng:</strong> {selectedContract.roomName} ({selectedContract.bedCount} giường)</div>
                    <div><strong>Ngày bàn giao:</strong> {selectedContract.handoverDate}</div>
                    <div><strong>Nhân viên bàn giao:</strong> {selectedContract.staffName}</div>
                    <div><strong>Trạng thái:</strong> <span className="text-green-700 font-semibold">Đã bàn giao</span></div>
                  </div>

                  <div>
                    <strong>Danh sách tài sản đã bàn giao:</strong>
                    <ul className="mt-1 ml-4 list-disc text-xs">
                      <li>Giường ✓</li>
                      <li>Nệm ✓</li>
                      <li>Tủ cá nhân ✓</li>
                      <li>Thẻ từ/chìa khóa ✓</li>
                      <li>Khu vực phòng sạch sẽ ✓</li>
                      <li>Đã hướng dẫn nội quy ✓</li>
                    </ul>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div><strong>Chỉ số điện đầu:</strong> {checklist.electricityMeter} kWh</div>
                    <div><strong>Chỉ số nước đầu:</strong> {checklist.waterMeter} m³</div>
                  </div>

                  {checklist.roomNotes && (
                    <div>
                      <strong>Ghi chú:</strong> {checklist.roomNotes}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="flex items-start gap-3 p-4">
                <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-yellow-600" />
                <div>
                  <h4 className="mb-1 text-sm font-bold text-yellow-800">Cập nhật Trạng thái Nhận phòng</h4>
                  <p className="text-xs text-yellow-700">
                    Ngay khi bạn nhấn "Hoàn tất Bàn giao", hệ thống sẽ tự động đổi trạng thái {selectedContract.bedCount} giường thuộc phòng {selectedContract.roomName} thành <strong>"Đang thuê"</strong>. Hợp đồng {selectedContract.contractId} chính thức có hiệu lực tính từ ngày bàn giao.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b border-slate-200 bg-slate-50 py-3">
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
                        <span className="rounded bg-green-100 px-2 py-1 text-[10px] font-bold text-green-700">Hoàn tất</span>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
