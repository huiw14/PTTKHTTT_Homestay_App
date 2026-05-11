import { useState, useEffect, useSyncExternalStore } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Button, Input } from "../components/ui";
import { checkoutWorkflowService } from "../services/salesService";
import { toast } from "sonner";
import { Plus, Edit2, LogOut, CheckCircle, FileX, Calculator, ArrowRight, DollarSign, AlertTriangle, Check, Eye } from "lucide-react";

const API_BASE = 'http://localhost:5000/api';

function getAuthHeaders() {
  if (typeof window === 'undefined') return {};

  const userRaw = window.localStorage.getItem('currentUser');
  if (!userRaw) return {};

  try {
    const user = JSON.parse(userRaw);
    if (!user?.id || !user?.role) return {};
    return {
      'x-user-id': String(user.id),
      'x-user-role': String(user.role),
    };
  } catch {
    return {};
  }
}

const PageHeader = ({ title, description, btnText }: { title: string, description: string, btnText?: string }) => (
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
    <div>
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      <p className="text-slate-500">{description}</p>
    </div>
    {btnText && <Button><Plus className="w-4 h-4 mr-2" /> {btnText}</Button>}
  </div>
);

let sharedCheckoutRequests: any[] = [];
const checkoutListeners = new Set<() => void>();

const getCheckoutSnapshot = () => sharedCheckoutRequests;
const subscribeCheckoutRequests = (listener: () => void) => {
  checkoutListeners.add(listener);
  return () => checkoutListeners.delete(listener);
};

const notifyCheckoutRequests = () => {
  checkoutListeners.forEach((listener) => listener());
};

type CheckoutRequestsUpdater = typeof sharedCheckoutRequests | ((prev: typeof sharedCheckoutRequests) => typeof sharedCheckoutRequests);
const setCheckoutRequests = (updater: CheckoutRequestsUpdater) => {
  sharedCheckoutRequests = typeof updater === 'function' ? updater(sharedCheckoutRequests) : updater;
  notifyCheckoutRequests();
  checkoutWorkflowService.saveWorkflows(sharedCheckoutRequests).catch(() => {
    // ignore persistence failures for now
  });
};

const useCheckoutRequests = () => {
  const store = useSyncExternalStore(subscribeCheckoutRequests, getCheckoutSnapshot);
  return [store, setCheckoutRequests] as const;
};

type ContractOption = {
  id: string;
  customerName: string;
  roomName: string;
  bedCount: number;
  startDate: string;
  endDate: string;
  depositAmount: number;
  stayMonths: number;
};

const toDateString = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().slice(0, 10);
};

// Load persisted workflows from backend on module init
checkoutWorkflowService.getWorkflows().then((response) => {
  if (response && Array.isArray(response.data) && response.data.length > 0) {
    sharedCheckoutRequests = response.data.map((item: any) => ({ ...item }));
    notifyCheckoutRequests();
  }
}).catch(() => {
  // offline: keep empty until API is available
});

// Ghi nhận Lịch trả phòng
export function CheckoutSchedules() {
  const navigate = useNavigate();
  const [requests, setRequests] = useCheckoutRequests();
  const [contractOptions, setContractOptions] = useState<ContractOption[]>([]);
  const [loadingContracts, setLoadingContracts] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    contractId: '',
    customerName: '',
    roomName: '',
    expectedCheckoutDate: '',
    reason: ''
  });

  useEffect(() => {
    let cancelled = false;

    const loadContracts = async () => {
      try {
        setLoadingContracts(true);
        const response = await fetch(`${API_BASE}/contracts`, { headers: getAuthHeaders() });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(payload.message || 'Không thể tải danh sách hợp đồng.');
        }

        const options = (payload.data || []).map((item: any) => ({
          id: item.maHD,
          customerName: item.khachHangName || 'Chưa xác định',
          roomName: item.roomSummary || 'Chưa xác định',
          bedCount: item.soThanhVien || 1,
          startDate: toDateString(item.ngayBatDau),
          endDate: toDateString(item.ngayKetThuc),
          depositAmount: Number(item.tienCoc || 0),
          stayMonths: Number(item.kyThanhToan || 0),
        })) as ContractOption[];

        if (!cancelled) {
          setContractOptions(options);
          setFormData((prev) => {
            if (prev.contractId) return prev;
            const first = options[0];
            return first ? {
              contractId: first.id,
              customerName: first.customerName,
              roomName: first.roomName,
              expectedCheckoutDate: first.endDate,
              reason: 'Khách hàng yêu cầu trả phòng',
            } : prev;
          });
        }
      } catch (error) {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : 'Không thể tải hợp đồng.';
        toast.error(message);
      } finally {
        if (!cancelled) setLoadingContracts(false);
      }
    };

    loadContracts();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!formData.contractId || contractOptions.length === 0) return;
    const selected = contractOptions.find((item) => item.id === formData.contractId);
    if (!selected) return;

    setFormData((prev) => ({
      ...prev,
      contractId: selected.id,
      customerName: selected.customerName,
      roomName: selected.roomName,
      expectedCheckoutDate: selected.endDate,
      reason: prev.reason || 'Khách hàng yêu cầu trả phòng',
    }));
  }, [contractOptions, formData.contractId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Chờ duyệt': return 'bg-orange-100 text-orange-700';
      case 'Đã xác nhận': return 'bg-blue-100 text-blue-700';
      case 'Đang kiểm tra': return 'bg-purple-100 text-purple-700';
      case 'Đã đối soát': return 'bg-yellow-100 text-yellow-700';
      case 'Đã thanh lý': return 'bg-green-100 text-green-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const handleConfirm = (id: string) => {
    setRequests(prev => prev.map(req => 
      req.id === id ? { ...req, status: 'Đã xác nhận' } : req
    ));
    toast.success('Đã xác nhận yêu cầu trả phòng.');
  };

  const handleAction = (request: any) => {
    switch (request.status) {
      case 'Đã xác nhận':
        navigate('/checkout/inspection');
        break;
      case 'Đang kiểm tra':
        navigate('/checkout/slips');
        break;
      case 'Đã đối soát':
        navigate('/checkout/liquidation');
        break;
      default:
        break;
    }
  };

  const handleCreateRequest = () => {
    if (!formData.contractId || !formData.customerName || !formData.roomName || !formData.expectedCheckoutDate || !formData.reason) {
      toast.error('Vui lòng điền đầy đủ thông tin.');
      return;
    }

    const selectedContract = contractOptions.find((item) => item.id === formData.contractId);
    if (!selectedContract) {
      toast.error('Hợp đồng đã chọn không tồn tại trong cơ sở dữ liệu.');
      return;
    }

    setRequests(prev => {
      const newRequest = {
        id: `OUT${String(prev.length + 1).padStart(3, '0')}`,
        ...formData,
        bedCount: selectedContract.bedCount,
        depositAmount: selectedContract.depositAmount,
        startDate: selectedContract.startDate,
        contractEndDate: selectedContract.endDate,
        stayMonths: selectedContract.stayMonths,
        status: 'Chờ duyệt',
        electricStart: 100,
        waterStart: 5,
        electricEnd: 200,
        waterEnd: 10,
        unpaidRent: 0,
        unpaidService: 0,
        violationFee: 0,
        refundRate: 100,
        damageItems: [],
        inspectionChecklist: {
          keyReturned: false,
          roomClean: false,
          assetsIntact: false,
          servicesPaid: false
        }
      };
      return [newRequest, ...prev];
    });

    setFormData({
      contractId: '',
      customerName: '',
      roomName: '',
      expectedCheckoutDate: '',
      reason: ''
    });
    setShowForm(false);
    toast.success('Đã tạo yêu cầu trả phòng mới.');
  };

  const getActionButton = (request: any) => {
    switch (request.status) {
      case 'Chờ duyệt':
        return (
          <Button variant="outline" size="sm" className="text-xs" onClick={() => handleConfirm(request.id)}>
            <Check className="w-3 h-3 mr-1"/> Xác nhận
          </Button>
        );
      case 'Đã xác nhận':
        return (
          <Button variant="outline" size="sm" className="text-xs" onClick={() => handleAction(request)}>
            Kiểm tra hiện trạng <ArrowRight className="w-3 h-3 ml-1"/>
          </Button>
        );
      case 'Đang kiểm tra':
        return (
          <Button variant="outline" size="sm" className="text-xs" onClick={() => handleAction(request)}>
            Đối soát <Calculator className="w-3 h-3 ml-1"/>
          </Button>
        );
      case 'Đã đối soát':
        return (
          <Button variant="outline" size="sm" className="text-xs" onClick={() => handleAction(request)}>
            Thanh lý <FileX className="w-3 h-3 ml-1"/>
          </Button>
        );
      case 'Đã thanh lý':
        return (
          <Button variant="outline" size="sm" className="text-xs">
            <Eye className="w-3 h-3 mr-1"/> Chi tiết
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Lịch trả phòng</h2>
          <p className="text-slate-500">Ghi nhận yêu cầu báo out từ khách hàng.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" /> {showForm ? "Hủy" : "Tạo Yêu cầu Trả phòng"}
        </Button>
      </div>
      
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tạo Yêu cầu Trả phòng Mới</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700">
              Danh sách hợp đồng được tải trực tiếp từ backend. Chọn hợp đồng thật trong DB để tạo yêu cầu trả phòng.
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold">Hợp đồng</label>
                <select
                  className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                  value={formData.contractId}
                  onChange={(e) => {
                    const selected = contractOptions.find((item) => item.id === e.target.value);
                    setFormData({
                      contractId: selected?.id || '',
                      customerName: selected?.customerName || '',
                      roomName: selected?.roomName || '',
                      expectedCheckoutDate: selected?.endDate || '',
                      reason: formData.reason || 'Khách hàng yêu cầu trả phòng',
                    });
                  }}
                  disabled={loadingContracts}
                >
                  <option value="">-- Chọn hợp đồng thật từ DB --</option>
                  {contractOptions.map((contract) => (
                    <option key={contract.id} value={contract.id}>
                      {contract.id} - {contract.customerName} - {contract.roomName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold">Khách hàng</label>
                <Input 
                  value={formData.customerName} 
                  onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                  placeholder="Tên khách hàng"
                />
              </div>
              <div>
                <label className="text-sm font-semibold">Phòng</label>
                <Input 
                  value={formData.roomName} 
                  onChange={(e) => setFormData({...formData, roomName: e.target.value})}
                  placeholder="VD: R101"
                />
              </div>
              <div>
                <label className="text-sm font-semibold">Ngày dự kiến trả phòng</label>
                <Input 
                  type="date"
                  value={formData.expectedCheckoutDate} 
                  onChange={(e) => setFormData({...formData, expectedCheckoutDate: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold">Lý do</label>
              <textarea 
                value={formData.reason} 
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                placeholder="Lý do trả phòng"
                rows={3}
                className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateRequest}>Lưu Yêu cầu</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Hủy</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Mã YC</TableHead><TableHead>Hợp đồng</TableHead><TableHead>Khách hàng</TableHead><TableHead>Phòng</TableHead><TableHead>Ngày báo out</TableHead><TableHead>Lý do</TableHead><TableHead>Trạng thái</TableHead><TableHead>Thao tác</TableHead></TableRow></TableHeader>
            <TableBody>
              {!loadingContracts && requests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-6 text-center text-slate-500">
                    Chưa có yêu cầu trả phòng nào.
                  </TableCell>
                </TableRow>
              )}
              {requests.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.id}</TableCell>
                  <TableCell className="text-blue-600 font-semibold">{s.contractId}</TableCell>
                  <TableCell>{s.customerName}</TableCell>
                  <TableCell>{s.roomName}</TableCell>
                  <TableCell className="font-medium text-red-600">{s.expectedCheckoutDate}</TableCell>
                  <TableCell>{s.reason}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-md text-xs font-semibold ${getStatusColor(s.status)}`}>
                      {s.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {getActionButton(s)}
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

// Kiểm tra hiện trạng
export function CheckoutInspection() {
  const [requests, setRequests] = useCheckoutRequests();
  const inspectionRequests = requests.filter(req => ['Đã xác nhận', 'Đang kiểm tra', 'Đã kiểm tra'].includes(req.status));
  const [selectedId, setSelectedId] = useState(inspectionRequests[0]?.id || '');
  const selectedRequest = requests.find(r => r.id === selectedId) || inspectionRequests[0];
  
  const [electricEnd, setElectricEnd] = useState(selectedRequest?.electricEnd || 0);
  const [waterEnd, setWaterEnd] = useState(selectedRequest?.waterEnd || 0);
  const [roomConditionNotes, setRoomConditionNotes] = useState(selectedRequest?.inspectionNote || '');
  const [damageItems, setDamageItems] = useState(selectedRequest?.damageItems || []);
  const [damageDescription, setDamageDescription] = useState('');
  const [damageAmount, setDamageAmount] = useState(0);
  const [checklist, setChecklist] = useState(selectedRequest?.inspectionChecklist || {
    keyReturned: false,
    roomClean: false,
    assetsIntact: false,
    servicesPaid: false
  });

  const handleSelectRequest = (e: any) => {
    const req = requests.find(r => r.id === e.target.value);
    if (req) {
      setSelectedId(req.id);
    }
  };

  useEffect(() => {
    if (!selectedId && inspectionRequests.length > 0) {
      setSelectedId(inspectionRequests[0].id);
    }
    if (selectedId && !inspectionRequests.some(req => req.id === selectedId) && inspectionRequests.length > 0) {
      setSelectedId(inspectionRequests[0].id);
    }
  }, [inspectionRequests, selectedId]);

  useEffect(() => {
    if (!selectedRequest) return;
    setElectricEnd(selectedRequest.electricEnd || 0);
    setWaterEnd(selectedRequest.waterEnd || 0);
    setDamageItems(selectedRequest.damageItems ? JSON.parse(JSON.stringify(selectedRequest.damageItems)) : []);
    setChecklist(selectedRequest.inspectionChecklist ? JSON.parse(JSON.stringify(selectedRequest.inspectionChecklist)) : {
      keyReturned: false,
      roomClean: false,
      assetsIntact: false,
      servicesPaid: false
    });
    setRoomConditionNotes(selectedRequest.inspectionNote || '');
    setDamageDescription('');
    setDamageAmount(0);
  }, [selectedRequest]);

  const addDamageItem = () => {
    if (!damageDescription.trim() || damageAmount <= 0) {
      alert('Vui lòng nhập đầy đủ nội dung hư hỏng và số tiền > 0');
      return;
    }
    setDamageItems([...damageItems, { description: damageDescription, amount: damageAmount }]);
    setDamageDescription('');
    setDamageAmount(0);
  };

  const removeDamageItem = (index: number) => {
    setDamageItems(damageItems.filter((_, i) => i !== index));
  };

  const totalDamage = damageItems.reduce((sum, item) => sum + (item.amount || 0), 0);

  const checklistItems = [
    { key: 'keyReturned', label: 'Đã thu hồi chìa khóa/thẻ từ' },
    { key: 'roomClean', label: 'Phòng sạch sẽ' },
    { key: 'assetsIntact', label: 'Kiểm tra giường/nệm/tủ' },
    { key: 'servicesPaid', label: 'Đã thanh toán tất cả dịch vụ' },
  ];

  const isChecklistComplete = Object.values(checklist).every(v => v === true);

  const handleSaveInspection = () => {
    if (!selectedRequest) {
      toast.error('Không có yêu cầu để lưu.');
      return;
    }

    if (electricEnd < selectedRequest.electricStart) {
      toast.error('Chỉ số điện cuối phải >= chỉ số điện đầu');
      return;
    }
    if (waterEnd < selectedRequest.waterStart) {
      toast.error('Chỉ số nước cuối phải >= chỉ số nước đầu');
      return;
    }

    const damageTotal = damageItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    (async () => {
      try {
        const payload = {
          maHD: selectedRequest.contractId,
          maNV: getAuthHeaders()['x-user-id'] || window.localStorage.getItem('userId') || 'NV001',
          ngayTra: selectedRequest.expectedCheckoutDate || new Date().toISOString().split('T')[0],
          chiSoDienCuoi: electricEnd,
          chiSoNuocCuoi: waterEnd,
          trangThaiPhong: isChecklistComplete ? 'Tot' : 'HuHong',
          ghiChu: roomConditionNotes || '',
          khauTru: [],
        };

        const resp = await fetch(`${API_BASE}/services/checkouts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          body: JSON.stringify(payload),
        });
        const result = await resp.json().catch(() => ({}));
        if (!resp.ok) throw new Error(result.message || 'Không thể tạo biên bản trả phòng');

        const maBBTP = result.data?.maBBTP || null;

        const updatedRequests = requests.map(req => {
          if (req.id === selectedId) {
            return {
              ...req,
              electricEnd,
              waterEnd,
              damageItems,
              damageTotal,
              inspectionNote: roomConditionNotes,
              inspectionChecklist: checklist,
              status: isChecklistComplete ? 'Đã kiểm tra' : 'Đang kiểm tra',
              maBBTP,
            };
          }
          return req;
        });

        setRequests(updatedRequests);
        toast.success('Đã lưu kết quả kiểm tra hiện trạng và tạo biên bản trả phòng.');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Lỗi khi lưu kiểm tra hiện trạng.');
      }
    })();
  };

  if (!selectedRequest) {
    return <div>Không có dữ liệu yêu cầu trả phòng.</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Biên bản Kiểm tra hiện trạng" description="Ghi nhận chỉ số điện/nước cuối, đánh giá hư hỏng, mất mát tài sản khi trả phòng." />
      
      {/* Selector for request */}
      <Card>
        <CardContent className="p-4">
          <label className="text-sm font-semibold">Chọn yêu cầu trả phòng:</label>
          <select 
            className="mt-1 block w-full p-2 border border-slate-300 rounded"
            value={selectedId}
            onChange={handleSelectRequest}
          >
            {inspectionRequests.map(req => (
              <option key={req.id} value={req.id}>
                {req.id} - {req.customerName} ({req.roomName}) - {req.status}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border-blue-200">
            <CardHeader className="bg-blue-50 border-b border-blue-200 pb-3">
              <CardTitle className="text-base text-blue-800 flex items-center gap-2">
                <LogOut className="w-4 h-4"/> Kiểm tra hiện trạng ({selectedRequest.contractId} - {selectedRequest.customerName} - {selectedRequest.roomName})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {/* Request Info */}
              <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded">
                <div>
                  <span className="text-xs text-slate-500">Mã yêu cầu</span>
                  <p className="font-semibold">{selectedRequest.id}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Mã hợp đồng</span>
                  <p className="font-semibold">{selectedRequest.contractId}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Phòng</span>
                  <p className="font-semibold">{selectedRequest.roomName}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Ngày dự kiến trả</span>
                  <p className="font-semibold">{selectedRequest.expectedCheckoutDate}</p>
                </div>
              </div>

              {/* Electricity and Water Readings */}
              <div className="space-y-2">
                <label className="text-sm font-semibold">Chỉ số Dịch vụ</label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3 rounded border border-slate-200">
                    <div className="text-xs text-slate-500 mb-2">Chỉ số Điện (kWh)</div>
                    <div className="flex gap-2 items-center">
                      <div className="text-xs">Đầu: {selectedRequest.electricStart}</div>
                      <div className="text-xs">Cuối:</div>
                      <Input 
                        type="number" 
                        value={electricEnd} 
                        onChange={(e) => setElectricEnd(Number(e.target.value))}
                        className="h-8 text-sm font-bold flex-1"
                      />
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded border border-slate-200">
                    <div className="text-xs text-slate-500 mb-2">Chỉ số Nước (Khối)</div>
                    <div className="flex gap-2 items-center">
                      <div className="text-xs">Đầu: {selectedRequest.waterStart}</div>
                      <div className="text-xs">Cuối:</div>
                      <Input 
                        type="number" 
                        value={waterEnd} 
                        onChange={(e) => setWaterEnd(Number(e.target.value))}
                        className="h-8 text-sm font-bold flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Room Condition Notes */}
              <div className="space-y-2">
                <label className="text-sm font-semibold">Ghi chú hiện trạng phòng</label>
                <textarea 
                  value={roomConditionNotes} 
                  onChange={(e) => setRoomConditionNotes(e.target.value)}
                  placeholder="Ghi nhận tình trạng phòng, nội thất, vệ sinh..."
                  rows={3}
                  className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Checklist */}
              <div className="space-y-2 p-3 bg-blue-50 rounded border border-blue-200">
                <label className="text-sm font-semibold text-blue-900">Checklist Kiểm tra</label>
                <div className="space-y-2">
                  {checklistItems.map(item => (
                    <div key={item.key} className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={checklist[item.key as keyof typeof checklist]} 
                        onChange={(e) => setChecklist({...checklist, [item.key]: e.target.checked})}
                        className="w-4 h-4 text-blue-600" 
                      />
                      <span className="text-sm flex-1">{item.label}</span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        checklist[item.key as keyof typeof checklist]
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {checklist[item.key as keyof typeof checklist] ? 'Đạt' : 'Chưa đạt'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Damage Items Section */}
              <div className="space-y-2 p-3 bg-red-50 rounded border border-red-200">
                <label className="text-sm font-semibold text-red-900">Hư hỏng/Khấu trừ</label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Mô tả hư hỏng" 
                    value={damageDescription} 
                    onChange={(e) => setDamageDescription(e.target.value)}
                    className="flex-1 h-9 text-sm"
                  />
                  <Input 
                    type="number" 
                    placeholder="Số tiền" 
                    value={damageAmount} 
                    onChange={(e) => setDamageAmount(Number(e.target.value))}
                    className="w-32 h-9 text-sm"
                  />
                  <Button size="sm" onClick={addDamageItem}>Thêm</Button>
                </div>

                {damageItems.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {damageItems.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-white rounded border border-red-100">
                        <div className="flex-1">
                          <p className="text-sm">{item.description}</p>
                          <p className="text-xs text-slate-500">{item.amount.toLocaleString()} đ</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => removeDamageItem(idx)}>X</Button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between bg-white p-2 rounded mt-2 border border-red-200">
                  <span className="text-sm font-bold text-red-800">Tổng hư hỏng:</span>
                  <span className="text-lg font-bold text-red-600">{totalDamage.toLocaleString()} đ</span>
                </div>
              </div>

              {/* Save Button */}
              <Button className="w-full h-10 bg-blue-600 hover:bg-blue-700" onClick={handleSaveInspection}>
                Lưu kiểm tra hiện trạng <CheckCircle className="w-4 h-4 ml-2"/>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Instruction Panel */}
        <Card className="bg-slate-50">
          <CardHeader>
            <CardTitle className="text-sm text-slate-700">Hướng dẫn Kiểm tra</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-600 space-y-3">
            <div>
              <p className="font-semibold text-slate-800 mb-1">📝 Thông tin cơ bản</p>
              <p>Ghi nhận đầy đủ mã yêu cầu, hợp đồng, khách hàng, phòng.</p>
            </div>
            <div>
              <p className="font-semibold text-slate-800 mb-1">⚡ Chỉ số Điện/Nước</p>
              <p>Ghi nhận chỉ số cuối từ công tơ/đồng hồ. Chỉ số cuối phải ≥ chỉ số đầu.</p>
            </div>
            <div>
              <p className="font-semibold text-slate-800 mb-1">✅ Checklist</p>
              <p>Kiểm tra 4 hạng mục bắt buộc. Nếu đủ tất cả → Status "Đã kiểm tra". Nếu thiếu → "Đang kiểm tra".</p>
            </div>
            <div>
              <p className="font-semibold text-slate-800 mb-1">💔 Hư hỏng</p>
              <p>Ghi nhận chi tiết hư hỏng và số tiền khấu trừ. Có thể thêm nhiều khoản.</p>
            </div>
            <div>
              <p className="font-semibold text-slate-800 mb-1">💾 Lưu</p>
              <p>Sau khi lưu, dữ liệu sẽ được sử dụng cho phiếu trả phòng ở bước tiếp theo.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Phiếu trả phòng & Thanh toán
export function CheckoutSlips() {
  const [requests, setRequests] = useCheckoutRequests();
  const slipRequests = requests.filter(req => ['Đã kiểm tra', 'Đã đối soát'].includes(req.status));
  const [selectedId, setSelectedId] = useState(slipRequests[0]?.id || '');
  const selectedRequest = requests.find(r => r.id === selectedId) || slipRequests[0];
  // Guard early: avoid running calculations when no request selected
  if (!selectedRequest) {
    return <div>Không có dữ liệu yêu cầu trả phòng.</div>;
  }
  
  const [otherDeductions, setOtherDeductions] = useState<Array<{description: string, amount: number}>>([]);
  const [deductionDescription, setDeductionDescription] = useState('');
  const [deductionAmount, setDeductionAmount] = useState(0);

  const handleSelectRequest = (e: any) => {
    const req = requests.find(r => r.id === e.target.value);
    if (req) {
      setSelectedId(req.id);
    }
  };

  useEffect(() => {
    if (!selectedId && slipRequests.length > 0) {
      setSelectedId(slipRequests[0].id);
    }
    if (selectedId && !slipRequests.some(req => req.id === selectedId) && slipRequests.length > 0) {
      setSelectedId(slipRequests[0].id);
    }
  }, [slipRequests, selectedId]);

  useEffect(() => {
    setOtherDeductions([]);
    setDeductionDescription('');
    setDeductionAmount(0);
  }, [selectedRequest?.id]);

  // Calculate refund rate based on contract status and stay duration
  const calculateRefundRate = () => {
    const stayMonths = selectedRequest.stayMonths;
    
    // Check if contract is active and not expired
    const contractEndDate = new Date(selectedRequest.contractEndDate);
    const today = new Date('2026-05-11'); // Using fixed date for demo
    const isContractExpired = contractEndDate <= today;

    if (isContractExpired) {
      // Contract ended naturally: 100% refund
      return 100;
    } else {
      // Contract ended early (before expiration)
      if (stayMonths < 6) {
        // Early checkout, less than 6 months: 50% refund
        return 50;
      } else {
        // Early checkout, 6+ months: 70% refund
        return 70;
      }
    }
  };

  const refundRate = calculateRefundRate();
  const basicRefund = selectedRequest.depositAmount * (refundRate / 100);

  const electricUsage = selectedRequest.electricEnd - selectedRequest.electricStart;
  const waterUsage = selectedRequest.waterEnd - selectedRequest.waterStart;
  const electricFee = electricUsage * 3500;
  const waterFee = waterUsage * 15000;
  const damageFee = selectedRequest.damageItems.reduce((sum, item) => sum + item.amount, 0);
  
  const totalDeduction = 
    selectedRequest.unpaidRent + 
    selectedRequest.unpaidService + 
    electricFee + 
    waterFee + 
    damageFee + 
    selectedRequest.violationFee + 
    otherDeductions.reduce((sum, item) => sum + item.amount, 0);

  const finalResult = basicRefund - totalDeduction;
  const finalAmount = finalResult;

  const getResultText = () => {
    if (finalResult > 0) return "Hoàn lại cho khách";
    if (finalResult < 0) return "Khách cần thanh toán thêm";
    return "Không phát sinh hoàn/thu thêm";
  };

  const getResultColor = () => {
    if (finalResult > 0) return "bg-green-100 text-green-800 border-green-300";
    if (finalResult < 0) return "bg-red-100 text-red-800 border-red-300";
    return "bg-slate-100 text-slate-800 border-slate-300";
  };

  const getResultBadgeColor = () => {
    if (finalResult > 0) return "bg-green-500 text-white";
    if (finalResult < 0) return "bg-red-500 text-white";
    return "bg-slate-500 text-white";
  };

  const addOtherDeduction = () => {
    if (!deductionDescription.trim() || deductionAmount <= 0) {
      alert('Vui lòng nhập đầy đủ nội dung khoản khấu trừ và số tiền > 0');
      return;
    }
    setOtherDeductions([...otherDeductions, { description: deductionDescription, amount: deductionAmount }]);
    setDeductionDescription('');
    setDeductionAmount(0);
  };

  const removeOtherDeduction = (index: number) => {
    setOtherDeductions(otherDeductions.filter((_, i) => i !== index));
  };

  const handleSaveSettlement = () => {
    if (!selectedRequest) {
      toast.error('Không có yêu cầu để đối soát.');
      return;
    }

    const damageFee = selectedRequest.damageItems.reduce((sum, item) => sum + item.amount, 0);
    const damageTotal = damageFee;
    const settlementType = finalResult > 0 ? 'Hoàn lại' : finalResult < 0 ? 'Thu thêm' : 'Không phát sinh';

    (async () => {
      try {
        const settlementType = finalResult > 0 ? 'Hoàn lại' : finalResult < 0 ? 'Thu thêm' : 'Không phát sinh';
        const dataBody = {
          maNV: getAuthHeaders()['x-user-id'] || window.localStorage.getItem('userId') || 'NV001',
          chiSoDienCuoi: selectedRequest.electricEnd,
          chiSoNuocCuoi: selectedRequest.waterEnd,
          trangThaiPhong: 'Tot',
          ghiChu: JSON.stringify({ settlementData: { finalResult, totalDeduction, refundRate }, otherDeductions }),
          khauTru: (selectedRequest.damageItems || []).map((d: any) => ({ maTS: d.maTS || null, soLuong: 1, chiPhiKhauTru: d.amount || 0, ghiChu: d.description || '' })),
        };

        // If we have maBBTP (created at inspection), call PUT to update; otherwise POST to create
        let resp;
        if (selectedRequest.maBBTP) {
          resp = await fetch(`${API_BASE}/services/checkouts/${selectedRequest.maBBTP}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
            body: JSON.stringify(dataBody),
          });
        } else {
          const payload = { ...dataBody, maHD: selectedRequest.contractId, ngayTra: selectedRequest.expectedCheckoutDate || new Date().toISOString().split('T')[0] };
          resp = await fetch(`${API_BASE}/services/checkouts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
            body: JSON.stringify(payload),
          });
        }

        const result = await resp.json().catch(() => ({}));
        if (!resp.ok) throw new Error(result.message || 'Không thể lưu đối soát');

        const maBBTP = result.data?.maBBTP || selectedRequest.maBBTP || null;

        const updatedRequests = requests.map(req => {
          if (req.id === selectedId) {
            return {
              ...req,
              status: 'Đã đối soát',
              refundRate,
              refundBase: basicRefund,
              unpaidRent: selectedRequest.unpaidRent,
              unpaidService: selectedRequest.unpaidService,
              violationFee: selectedRequest.violationFee,
              damageTotal,
              otherDeductions,
              totalDeduction,
              finalAmount,
              settlementType,
              settlementData: {
                depositAmount: selectedRequest.depositAmount,
                refundRate,
                basicRefund,
                totalDeduction,
                finalResult,
                resultText: getResultText(),
                otherDeductions
              },
              maBBTP,
            };
          }
          return req;
        });

        setRequests(updatedRequests);
        toast.success('Đã lưu kết quả đối soát tài chính và cập nhật vào cơ sở dữ liệu.');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Lỗi khi lưu đối soát.');
      }
    })();
  };


  return (
    <div className="space-y-6">
      <PageHeader title="Phiếu trả phòng & Thanh toán" description="Đối soát dữ liệu, khấu trừ và lập phiếu hoàn cọc/thu nợ." />
      
      {/* Selector for request */}
      <Card>
        <CardContent className="p-4">
          <label className="text-sm font-semibold">Chọn yêu cầu trả phòng:</label>
          <select 
            className="mt-1 block w-full p-2 border border-slate-300 rounded"
            value={selectedId}
            onChange={handleSelectRequest}
          >
            {slipRequests.map(req => (
              <option key={req.id} value={req.id}>
                {req.id} - {req.customerName} ({req.roomName}) - {req.status}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {/* Contract & Customer Info */}
      <Card className="bg-slate-50">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-xs text-slate-500 font-semibold">Mã hợp đồng</span>
              <p className="font-bold text-slate-800">{selectedRequest.contractId}</p>
            </div>
            <div>
              <span className="text-xs text-slate-500 font-semibold">Khách hàng</span>
              <p className="font-bold text-slate-800">{selectedRequest.customerName}</p>
            </div>
            <div>
              <span className="text-xs text-slate-500 font-semibold">Phòng</span>
              <p className="font-bold text-slate-800">{selectedRequest.roomName}</p>
            </div>
            <div>
              <span className="text-xs text-slate-500 font-semibold">Thời gian lưu trú</span>
              <p className="font-bold text-slate-800">{selectedRequest.stayMonths} tháng</p>
            </div>
            <div>
              <span className="text-xs text-slate-500 font-semibold">Tiền cọc</span>
              <p className="font-bold text-slate-800">{selectedRequest.depositAmount.toLocaleString()} đ</p>
            </div>
            <div>
              <span className="text-xs text-slate-500 font-semibold">Tỷ lệ hoàn</span>
              <p className="font-bold text-blue-700">{refundRate}%</p>
            </div>
            <div>
              <span className="text-xs text-slate-500 font-semibold">Ngày kết thúc HĐ</span>
              <p className="font-bold text-slate-800">{selectedRequest.contractEndDate}</p>
            </div>
            <div>
              <span className="text-xs text-slate-500 font-semibold">Trạng thái HĐ</span>
              <p className="font-bold text-slate-800">{refundRate === 100 ? 'Hết hạn' : refundRate === 50 ? 'Chưa hết (< 6 tháng)' : 'Chưa hết (≥ 6 tháng)'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Deposit & Refund */}
        <Card className="border-green-200">
          <CardHeader className="bg-green-50 border-b border-green-200 pb-3">
            <CardTitle className="text-base text-green-800">Tiền cọc giữ / Khoản được hoàn</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
              <span className="text-sm font-semibold">Tiền cọc ban đầu:</span>
              <span className="text-lg font-bold text-green-700">{selectedRequest.depositAmount.toLocaleString()} đ</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
              <span className="text-sm font-semibold">Tỷ lệ hoàn cọc:</span>
              <span className="text-lg font-bold text-blue-700">{refundRate}%</span>
            </div>
            <div className="border-t border-slate-200 pt-3 mt-3">
              <div className="flex justify-between items-center p-3 bg-green-100 rounded border border-green-300">
                <span className="text-sm font-bold text-green-800">Số tiền hoàn cơ bản:</span>
                <span className="text-2xl font-black text-green-700">{basicRefund.toLocaleString()} đ</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Deductions */}
        <Card className="border-red-200">
          <CardHeader className="bg-red-50 border-b border-red-200 pb-3">
            <CardTitle className="text-base text-red-800">Khoản khấu trừ / Phải thu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-4">
            <div className="flex justify-between text-sm">
              <span>Tiền thuê còn nợ:</span>
              <span className="font-semibold">{selectedRequest.unpaidRent.toLocaleString()} đ</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tiền dịch vụ cơ bản:</span>
              <span className="font-semibold">{selectedRequest.unpaidService.toLocaleString()} đ</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tiền điện ({electricUsage} kWh):</span>
              <span className="font-semibold">{electricFee.toLocaleString()} đ</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tiền nước ({waterUsage} khối):</span>
              <span className="font-semibold">{waterFee.toLocaleString()} đ</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Hư hỏng tài sản:</span>
              <span className="font-semibold text-red-600">{damageFee.toLocaleString()} đ</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Phạt vi phạm HĐ:</span>
              <span className="font-semibold">{selectedRequest.violationFee.toLocaleString()} đ</span>
            </div>

            {/* Other Deductions */}
            {otherDeductions.length > 0 && (
              <div className="border-t border-slate-200 pt-2 mt-2">
                {otherDeductions.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm mb-1">
                    <span>{item.description}:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{item.amount.toLocaleString()} đ</span>
                      <Button variant="outline" size="sm" onClick={() => removeOtherDeduction(idx)} className="h-5 w-5 p-0">X</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Other Deduction */}
            <div className="border-t border-slate-200 pt-2 mt-2 space-y-2">
              <label className="text-xs font-semibold text-slate-700">Thêm khoản khấu trừ khác:</label>
              <div className="flex gap-2">
                <Input 
                  placeholder="Nội dung"
                  value={deductionDescription}
                  onChange={(e) => setDeductionDescription(e.target.value)}
                  className="flex-1 h-8 text-sm"
                />
                <Input 
                  type="number"
                  placeholder="Số tiền"
                  value={deductionAmount}
                  onChange={(e) => setDeductionAmount(Number(e.target.value))}
                  className="w-24 h-8 text-sm"
                />
                <Button size="sm" onClick={addOtherDeduction}>Thêm</Button>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-3 mt-3">
              <div className="flex justify-between items-center p-3 bg-red-100 rounded border border-red-300">
                <span className="text-sm font-bold text-red-800">Tổng khấu trừ:</span>
                <span className="text-2xl font-black text-red-700">{totalDeduction.toLocaleString()} đ</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Result Summary */}
      <Card className={`border-4 ${getResultColor()}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Công thức tính:</p>
              <p className="text-xs text-slate-500">{basicRefund.toLocaleString()} đ (hoàn cơ bản) - {totalDeduction.toLocaleString()} đ (khấu trừ) = {Math.abs(finalResult).toLocaleString()} đ</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-600 font-semibold mb-2">KẾT QUẢ ĐỐI SOÁT:</p>
              <div className="space-y-1">
                <p className="text-lg font-bold">{getResultText()}</p>
                <p className={`text-4xl font-black ${finalResult > 0 ? 'text-green-700' : finalResult < 0 ? 'text-red-700' : 'text-slate-700'}`}>
                  {Math.abs(finalResult).toLocaleString()} đ
                </p>
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getResultBadgeColor()}`}>
                  {finalResult > 0 ? '↙️ Hoàn lại' : finalResult < 0 ? '↗️ Thu thêm' : '➡️ Không phát sinh'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" className="h-10 text-slate-700 border-slate-300"><FileX className="w-4 h-4 mr-2" /> Lưu Nháp</Button>
        <Button className="h-10 bg-blue-600 hover:bg-blue-700 font-bold" onClick={handleSaveSettlement}><DollarSign className="w-4 h-4 mr-2" /> Lưu đối soát tài chính</Button>
      </div>
    </div>
  );
}

// Thanh lý Hợp đồng & Trả phòng
export function CheckoutLiquidation() {
  const [requests, setRequests] = useCheckoutRequests();
  const liquidationRequests = requests.filter(r => ['Đã đối soát', 'Đã thanh lý'].includes(r.status));
  const [selectedId, setSelectedId] = useState('');
  const selectedRequest = requests.find(r => r.id === selectedId) || liquidationRequests[0];

  // Liquidation form state
  const [paymentMethod, setPaymentMethod] = useState('');
  const [liquidationNotes, setLiquidationNotes] = useState('');
  const [checklist, setChecklist] = useState({
    customerAgreed: false,
    keysReturned: false,
    refundProcessed: false,
    additionalPaymentCollected: false,
    documentSigned: false,
    roomStatusUpdated: false
  });
  const [isCompleted, setIsCompleted] = useState(false);
  const [completionTime, setCompletionTime] = useState('');

  const handleSelectRequest = (e: any) => {
    const reqId = e.target.value;
    const req = requests.find(r => r.id === reqId);
    if (req) {
      setSelectedId(reqId);
      setPaymentMethod('');
      setLiquidationNotes('');
      setChecklist({
        customerAgreed: false,
        keysReturned: false,
        refundProcessed: false,
        additionalPaymentCollected: false,
        documentSigned: false,
        roomStatusUpdated: false
      });
      setIsCompleted(false);
    }
  };

  useEffect(() => {
    if (!selectedId && liquidationRequests.length > 0) {
      setSelectedId(liquidationRequests[0].id);
    }
    if (selectedId && !liquidationRequests.some(req => req.id === selectedId) && liquidationRequests.length > 0) {
      setSelectedId(liquidationRequests[0].id);
    }
  }, [liquidationRequests, selectedId]);

  useEffect(() => {
    setPaymentMethod('');
    setLiquidationNotes('');
    setChecklist({
      customerAgreed: false,
      keysReturned: false,
      refundProcessed: false,
      additionalPaymentCollected: false,
      documentSigned: false,
      roomStatusUpdated: false
    });
    setIsCompleted(false);
  }, [selectedRequest?.id]);

  const handleCheckboxChange = (key: string) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const calculateSettlementData = () => {
    if (!selectedRequest) return null;
    
    const electricUsage = selectedRequest.electricEnd - selectedRequest.electricStart;
    const waterUsage = selectedRequest.waterEnd - selectedRequest.waterStart;
    const electricFee = electricUsage * 3500;
    const waterFee = waterUsage * 15000;
    const damageFee = selectedRequest.damageItems.reduce((sum, item) => sum + item.amount, 0);
    
    const stayMonths = selectedRequest.stayMonths;
    const contractEndDate = new Date(selectedRequest.contractEndDate);
    const today = new Date('2026-05-11');
    const isContractExpired = contractEndDate <= today;
    
    let refundRate = 100;
    if (!isContractExpired) {
      refundRate = stayMonths < 6 ? 50 : 70;
    }

    const basicRefund = selectedRequest.depositAmount * (refundRate / 100);
    const totalDeduction = 
      selectedRequest.unpaidRent + 
      selectedRequest.unpaidService + 
      electricFee + 
      waterFee + 
      damageFee + 
      selectedRequest.violationFee;

    const finalResult = basicRefund - totalDeduction;

    return {
      depositAmount: selectedRequest.depositAmount,
      totalDeduction,
      finalResult,
      resultText: finalResult > 0 ? 'Hoàn lại' : finalResult < 0 ? 'Thu thêm' : 'Không phát sinh'
    };
  };

  const settlementData = calculateSettlementData();

  const handleCompleteLiquidation = () => {
    if (!selectedRequest) {
      toast.error('Không có yêu cầu để thanh lý.');
      return;
    }

    if (!paymentMethod) {
      toast.error('Vui lòng chọn phương thức xử lý tiền.');
      return;
    }

    const allChecklistsChecked = Object.values(checklist).every(v => v === true);
    if (!allChecklistsChecked) {
      toast.error('Vui lòng xác nhận đầy đủ điều kiện thanh lý.');
      return;
    }

    const completionDate = new Date().toISOString().split('T')[0];
    const updatedRequests = requests.map(req => {
      if (req.id === selectedId) {
        return {
          ...req,
          status: 'Đã thanh lý',
          contractStatus: 'Đã thanh lý',
          roomStatus: 'Trống',
          liquidationDate: completionDate,
          liquidationNote: liquidationNotes,
          paymentMethod,
          liquidationData: {
            paymentMethod,
            liquidationNotes,
            completionDate,
            checklist
          }
        };
      }
      return req;
    });

    setRequests(updatedRequests);
    setIsCompleted(true);
    setCompletionTime(new Date().toLocaleString('vi-VN'));
    toast.success('Hoàn tất thanh lý hợp đồng.');
  };

  if (!selectedRequest) {
    return (
      <div className="space-y-6">
        <PageHeader title="Thanh lý hợp đồng" description="Hoàn tất quy trình thanh lý hợp đồng và giải phóng phòng." />
        <Card>
          <CardContent className="p-4">
            <p className="text-slate-600">Không có yêu cầu trả phòng nào đã "Đã đối soát" chờ thanh lý.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Completion screen
  if (isCompleted) {
    return (
      <div className="space-y-6">
        <PageHeader title="Thanh lý hợp đồng" description="Hoàn tất quy trình thanh lý hợp đồng và giải phóng phòng." />
        
        <div className="max-w-3xl mx-auto">
          <Card className="border-green-300 bg-green-50">
            <CardContent className="p-8 text-center space-y-6">
              <div className="w-24 h-24 bg-green-200 text-green-700 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-14 h-14" />
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-green-800 mb-2">Thanh lý thành công!</h3>
                <p className="text-slate-600">Hợp đồng đã được xử lý và phòng trả lại trệu trạng sẵn sàng cho khách mới.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left bg-white rounded-lg p-4 border border-green-200">
                <div>
                  <span className="text-xs text-slate-500 font-semibold">Mã yêu cầu</span>
                  <p className="font-bold text-slate-800">{selectedRequest.id}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-semibold">Mã hợp đồng</span>
                  <p className="font-bold text-slate-800">{selectedRequest.contractId}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-semibold">Khách hàng</span>
                  <p className="font-bold text-slate-800">{selectedRequest.customerName}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-semibold">Phòng</span>
                  <p className="font-bold text-slate-800">{selectedRequest.roomName}</p>
                </div>
                <div className="md:col-span-2">
                  <span className="text-xs text-slate-500 font-semibold">Ngày hoàn tất thanh lý</span>
                  <p className="font-bold text-slate-800">{completionTime}</p>
                </div>
                <div className="md:col-span-2">
                  <span className="text-xs text-slate-500 font-semibold">Trạng thái phòng</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">Trống</span>
                    <span className="text-xs text-slate-500">Sẵn sàng cho khách mới</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-100 border border-green-300 rounded p-4 text-left space-y-2">
                <p className="text-sm font-semibold text-green-800">✓ Đã hoàn tất:</p>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>✓ Khách hàng đồng ý kết quả đối soát</li>
                  <li>✓ Thu hồi chìa khóa/thẻ ra vào</li>
                  <li>✓ Xử lý thanh toán ({paymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'})</li>
                  <li>✓ Ký biên bản trả phòng/thanh lý</li>
                  <li>✓ Cập nhật trạng thái phòng → Trống</li>
                  <li>✓ Đóng hợp đồng: {selectedRequest.contractId}</li>
                </ul>
              </div>

              <Button 
                className="w-full h-10 bg-slate-600 hover:bg-slate-700"
                onClick={() => {
                  setSelectedId('');
                  setIsCompleted(false);
                  setPaymentMethod('');
                  setLiquidationNotes('');
                  setChecklist({
                    customerAgreed: false,
                    keysReturned: false,
                    refundProcessed: false,
                    additionalPaymentCollected: false,
                    documentSigned: false,
                    roomStatusUpdated: false
                  });
                }}
              >
                Quay lại danh sách
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Main liquidation form
  return (
    <div className="space-y-6">
      <PageHeader title="Thanh lý hợp đồng" description="Hoàn tất quy trình thanh lý hợp đồng và giải phóng phòng." />
      
      {/* Request Selector */}
      <Card>
        <CardContent className="p-4">
          <label className="text-sm font-semibold">Chọn yêu cầu trả phòng chờ thanh lý:</label>
          <select 
            className="mt-1 block w-full p-2 border border-slate-300 rounded"
            value={selectedId}
            onChange={handleSelectRequest}
          >
            {liquidationRequests.map(req => (
              <option key={req.id} value={req.id}>
                {req.id} - {req.customerName} ({req.roomName})
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Settlement Summary Card */}
          <Card className="bg-slate-50">
            <CardHeader>
              <CardTitle className="text-base">Tóm tắt Kết quả Đối soát</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-slate-500 font-semibold">Tiền cọc ban đầu</span>
                  <p className="text-lg font-bold text-slate-800">{settlementData?.depositAmount?.toLocaleString()} đ</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-semibold">Tổng khấu trừ</span>
                  <p className="text-lg font-bold text-red-700">{settlementData?.totalDeduction?.toLocaleString()} đ</p>
                </div>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-xs text-slate-500 font-semibold">Kết quả cuối cùng</span>
                <div className="flex items-end justify-between mt-2">
                  <p className="text-2xl font-black text-slate-800">{Math.abs(settlementData?.finalResult || 0).toLocaleString()} đ</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    (settlementData?.finalResult || 0) > 0 ? 'bg-green-100 text-green-700' :
                    (settlementData?.finalResult || 0) < 0 ? 'bg-red-100 text-red-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {settlementData?.resultText}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Phương thức xử lý tiền</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-3 border border-slate-200 rounded cursor-pointer hover:bg-slate-50"
                   onClick={() => setPaymentMethod('cash')}>
                <input 
                  type="radio" 
                  checked={paymentMethod === 'cash'}
                  onChange={() => setPaymentMethod('cash')}
                  className="w-4 h-4"
                />
                <div>
                  <p className="text-sm font-semibold">Tiền mặt</p>
                  <p className="text-xs text-slate-500">Thu thêm hoặc hoàn trực tiếp</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border border-slate-200 rounded cursor-pointer hover:bg-slate-50"
                   onClick={() => setPaymentMethod('transfer')}>
                <input 
                  type="radio" 
                  checked={paymentMethod === 'transfer'}
                  onChange={() => setPaymentMethod('transfer')}
                  className="w-4 h-4"
                />
                <div>
                  <p className="text-sm font-semibold">Chuyển khoản</p>
                  <p className="text-xs text-slate-500">Ghi tài khoản ngân hàng</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liquidation Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ghi chú thanh lý</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea 
                value={liquidationNotes}
                onChange={(e) => setLiquidationNotes(e.target.value)}
                placeholder="Ghi chú thêm về quá trình thanh lý (nếu có)..."
                rows={4}
                className="flex min-h-[100px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </CardContent>
          </Card>

          {/* Checklist */}
          <Card className="border-blue-200">
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-base text-blue-900">Danh sách xác nhận thanh lý</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              {[
                { key: 'customerAgreed', label: 'Khách hàng đã đồng ý kết quả đối soát', icon: '👤' },
                { key: 'keysReturned', label: 'Đã thu hồi chìa khóa/thẻ ra vào', icon: '🔑' },
                { key: 'refundProcessed', label: 'Đã hoàn cọc cho khách (nếu có)', icon: '💰' },
                { key: 'additionalPaymentCollected', label: 'Đã thu thêm tiền (nếu phát sinh)', icon: '💳' },
                { key: 'documentSigned', label: 'Đã ký biên bản trả phòng/thanh lý', icon: '📝' },
                { key: 'roomStatusUpdated', label: 'Đã cập nhật trạng thái phòng/giường', icon: '🏠' }
              ].map(item => (
                <div 
                  key={item.key}
                  className="flex items-center gap-3 p-3 border border-slate-200 rounded cursor-pointer hover:bg-slate-50"
                  onClick={() => handleCheckboxChange(item.key)}
                >
                  <input 
                    type="checkbox" 
                    checked={checklist[item.key as keyof typeof checklist]}
                    onChange={() => handleCheckboxChange(item.key)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm">{item.icon} {item.label}</span>
                  <span className={`ml-auto px-2 py-1 rounded text-xs font-bold ${
                    checklist[item.key as keyof typeof checklist]
                      ? 'bg-green-100 text-green-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {checklist[item.key as keyof typeof checklist] ? '✓ Đã xác nhận' : '○ Chưa xác nhận'}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Action Button */}
          <Button 
            className="w-full h-12 text-base font-bold bg-green-600 hover:bg-green-700"
            onClick={handleCompleteLiquidation}
          >
            <CheckCircle className="w-5 h-5 mr-2" /> Hoàn tất thanh lý
          </Button>
        </div>

        {/* Info Panel */}
        <Card className="bg-yellow-50 h-fit">
          <CardHeader>
            <CardTitle className="text-sm text-yellow-900">Thông tin hợp đồng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <span className="text-xs text-slate-600 font-semibold">Mã yêu cầu</span>
              <p className="font-bold text-slate-800">{selectedRequest.id}</p>
            </div>
            <div>
              <span className="text-xs text-slate-600 font-semibold">Mã hợp đồng</span>
              <p className="font-bold text-slate-800">{selectedRequest.contractId}</p>
            </div>
            <div>
              <span className="text-xs text-slate-600 font-semibold">Khách hàng</span>
              <p className="font-bold text-slate-800">{selectedRequest.customerName}</p>
            </div>
            <div>
              <span className="text-xs text-slate-600 font-semibold">Phòng</span>
              <p className="font-bold text-slate-800">{selectedRequest.roomName}</p>
            </div>
            <div>
              <span className="text-xs text-slate-600 font-semibold">Số giường</span>
              <p className="font-bold text-slate-800">{selectedRequest.bedCount}</p>
            </div>
            <div>
              <span className="text-xs text-slate-600 font-semibold">Ngày vào</span>
              <p className="font-bold text-slate-800">{selectedRequest.startDate}</p>
            </div>
            <div>
              <span className="text-xs text-slate-600 font-semibold">Ngày dự kiến ra</span>
              <p className="font-bold text-slate-800">{selectedRequest.expectedCheckoutDate}</p>
            </div>

            <div className="border-t border-yellow-200 pt-4">
              <p className="text-xs text-yellow-800 font-semibold mb-2">⚠️ Nhắc nhở:</p>
              <ul className="text-xs text-yellow-700 space-y-1">
                <li>• Kiểm tra lại chỉ số điện/nước</li>
                <li>• Xác nhận hư hỏng tài sản</li>
                <li>• Lưu ý phương thức thanh toán</li>
                <li>• Cập nhật trạng thái phòng</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}