import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Button, Input } from "../components/ui";
import { contracts, rooms } from "../data/mockData";
import { Plus, Edit2, LogOut, CheckCircle, FileX, Calculator, ArrowRight, DollarSign, AlertTriangle } from "lucide-react";

const PageHeader = ({ title, description, btnText }: { title: string, description: string, btnText?: string }) => (
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
    <div>
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      <p className="text-slate-500">{description}</p>
    </div>
    {btnText && <Button><Plus className="w-4 h-4 mr-2" /> {btnText}</Button>}
  </div>
);

// Ghi nhận Lịch trả phòng
export function CheckoutSchedules() {
  const schedules = [
    { id: 'OUT01', contract: 'CT002', customer: 'Vũ Kiều Oanh', room: 'R102', date: '2026-05-01', reason: 'Hết hạn HĐ', status: 'Đã xác nhận' },
    { id: 'OUT02', contract: 'CT001', customer: 'Đặng Việt Hùng', room: 'R101', date: '2026-04-10', reason: 'Chuyển chỗ làm', status: 'Chờ duyệt', penalty: 'Mất cọc' }
  ];
  return (
    <div className="space-y-4">
      <PageHeader title="Lịch trả phòng" description="Ghi nhận yêu cầu báo out từ khách hàng." btnText="Tạo Yêu cầu Trả phòng" />
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Mã YC</TableHead><TableHead>Hợp đồng</TableHead><TableHead>Khách hàng</TableHead><TableHead>Phòng</TableHead><TableHead>Ngày báo out</TableHead><TableHead>Lý do</TableHead><TableHead>Trạng thái</TableHead><TableHead>Thao tác</TableHead></TableRow></TableHeader>
            <TableBody>
              {schedules.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.id}</TableCell>
                  <TableCell className="text-blue-600 font-semibold">{s.contract}</TableCell>
                  <TableCell>{s.customer}</TableCell>
                  <TableCell>{s.room}</TableCell>
                  <TableCell className="font-medium text-red-600">{s.date}</TableCell>
                  <TableCell>{s.reason}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-md text-xs font-semibold 
                      ${s.status === 'Đã xác nhận' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {s.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" className="text-xs">Tiến hành Check-out <ArrowRight className="w-3 h-3 ml-1"/></Button>
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
  return (
    <div className="space-y-6">
      <PageHeader title="Biên bản Kiểm tra hiện trạng" description="Ghi nhận chỉ số điện/nước cuối, đánh giá hư hỏng, mất mát tài sản khi trả phòng." />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-red-200">
          <CardHeader className="bg-red-50 border-b border-red-200 pb-3">
            <CardTitle className="text-base text-red-800 flex items-center gap-2"><LogOut className="w-4 h-4"/> Báo cáo hư hỏng (CT002 - Vũ Kiều Oanh - R102)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Ghi nhận chỉ số Dịch vụ cuối cùng</label>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                   <div className="text-xs text-slate-500 mb-1">Chỉ số Điện (kWh)</div>
                   <Input type="number" defaultValue="345" className="h-8 text-sm font-bold"/>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                   <div className="text-xs text-slate-500 mb-1">Chỉ số Nước (Khối)</div>
                   <Input type="number" defaultValue="12" className="h-8 text-sm font-bold"/>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-sm font-semibold">Tình trạng Tài sản</label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-red-600" />
                  <span className="text-sm">Thất lạc chìa khóa / Thẻ từ (-50,000đ/cái)</span>
                  <Input type="number" defaultValue="1" className="h-7 w-16 ml-auto" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-red-600" />
                  <span className="text-sm">Hư hỏng nội thất (giường, tủ...)</span>
                </div>
                <Input placeholder="Nhập chi tiết hư hỏng..." defaultValue="Rách đệm giường số 2" className="h-8 text-sm"/>
                <div className="flex items-center justify-between bg-red-50 p-2 rounded mt-2">
                   <span className="text-sm font-bold text-red-800">Tổng phạt tài sản tạm tính:</span>
                   <Input type="text" defaultValue="350,000" className="h-7 w-32 font-bold text-red-600 text-right" />
                </div>
              </div>
            </div>

            <Button className="w-full h-10 mt-2 bg-red-600 hover:bg-red-700">Lưu Biên bản Kiểm tra <CheckCircle className="w-4 h-4 ml-2"/></Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-50 opacity-75">
           <CardHeader>
              <CardTitle className="text-sm text-slate-500">Hướng dẫn Check-out</CardTitle>
           </CardHeader>
           <CardContent className="text-xs text-slate-600 space-y-2">
              <p>1. Manager đến phòng ghi nhận tình trạng thực tế và các chỉ số.</p>
              <p>2. So sánh đối chiếu với <strong>Biên bản Bàn giao phòng</strong> ban đầu.</p>
              <p>3. Dữ liệu hư hỏng và điện nước ở đây sẽ được chuyển sang cho Kế toán để thực hiện <strong>Phiếu trả phòng</strong>.</p>
           </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Phiếu trả phòng & Thanh toán
export function CheckoutSlips() {
  return (
    <div className="space-y-6">
      <PageHeader title="Phiếu trả phòng & Thanh toán" description="Đối soát dữ liệu, khấu trừ và lập phiếu hoàn cọc/thu nợ." />
      
      <Card className="border-blue-200">
        <CardHeader className="bg-blue-50 border-b border-blue-200 pb-3 flex flex-row justify-between items-center">
          <CardTitle className="text-base text-blue-800 flex items-center gap-2"><Calculator className="w-4 h-4"/> Bảng Tính toán Khấu trừ (Phiếu trả phòng - PT002)</CardTitle>
          <span className="px-2 py-1 bg-white border border-blue-200 rounded text-xs font-bold text-blue-800">HĐ: CT002</span>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-8 mb-6 border-b border-slate-200 pb-6">
            <div>
              <h4 className="font-bold text-slate-700 mb-3 border-b pb-1 flex items-center justify-between">
                 <span>Các Khoản Phải Thu (Khách nợ)</span>
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Tiền phòng (chưa đóng):</span> <span className="font-semibold text-slate-800">0 đ</span></div>
                <div className="flex justify-between"><span>Điện (150kWh x 3,500đ):</span> <span className="font-semibold text-slate-800">525,000 đ</span></div>
                <div className="flex justify-between"><span>Nước, Rác, Wifi (cố định):</span> <span className="font-semibold text-slate-800">170,000 đ</span></div>
                <div className="flex justify-between text-red-600"><span>Phạt hư hỏng tài sản:</span> <span className="font-bold">350,000 đ</span></div>
                <div className="flex justify-between"><span>Phí vi phạm HĐ (nếu có):</span> <span className="font-semibold text-slate-800">0 đ</span></div>
                
                <div className="flex justify-between font-bold text-base pt-2 border-t">
                  <span className="text-red-700">Tổng nợ phải thu (A):</span> 
                  <span className="text-red-700">1,045,000 đ</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-700 mb-3 border-b pb-1 flex items-center justify-between">
                 <span>Các Khoản Phải Trả (Đã thu giữ)</span>
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Tiền cọc giữ chỗ:</span> <span className="font-semibold text-slate-800">4,400,000 đ</span></div>
                <div className="flex justify-between text-slate-400 italic"><span>Tiền đóng dư (nếu có):</span> <span>0 đ</span></div>
                
                <div className="flex justify-between font-bold text-base pt-2 border-t mt-auto">
                  <span className="text-green-700">Tổng đang giữ (B):</span> 
                  <span className="text-green-700">4,400,000 đ</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-100 p-4 rounded-lg flex items-center justify-between border border-slate-300">
             <div>
                <h3 className="text-lg font-bold text-slate-800">Kết quả Đối soát: <span className="text-blue-600">(B) - (A)</span></h3>
                <p className="text-sm text-slate-600 mt-1">4,400,000đ - 1,045,000đ = 3,355,000đ</p>
             </div>
             <div className="text-right">
                <div className="text-sm font-semibold text-slate-500 mb-1">Cần lập Phiếu Chi hoàn cọc</div>
                <div className="text-3xl font-black text-blue-700 flex items-center justify-end gap-2">
                   3,355,000 đ
                </div>
             </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
             <Button variant="outline" className="h-10 text-slate-700 border-slate-300"><FileX className="w-4 h-4 mr-2" /> Lưu Nháp</Button>
             <Button className="h-10 bg-blue-600 hover:bg-blue-700 font-bold"><DollarSign className="w-4 h-4 mr-2" /> Tạo Phiếu Chi Hoàn Tiền (3.3tr)</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Thanh lý Hợp đồng & Trả phòng
export function CheckoutLiquidation() {
  return (
    <div className="space-y-6">
      <PageHeader title="Thanh lý Hợp đồng & Trả phòng" description="Thu hồi chìa khóa và giải phóng hệ thống tự động reset trạng thái phòng về trống." />
      
      <div className="max-w-3xl mx-auto mt-8">
        <Card className="border-green-200 text-center py-10 px-6 shadow-md">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
             <FileX className="w-10 h-10" />
          </div>
          <CardTitle className="text-2xl text-slate-800 mb-2">Thanh lý Hợp đồng CT002</CardTitle>
          <p className="text-slate-600 mb-8">
            Khách hàng <strong>Vũ Kiều Oanh</strong> (R102). <br/>
            Các nghĩa vụ tài chính và biên bản bàn giao tài sản đã hoàn tất. <br/>
            Thu hồi chìa khóa/thẻ từ hoàn tất.
          </p>

          <div className="bg-yellow-50 border border-yellow-200 rounded p-4 text-left mb-8 flex items-start gap-3">
             <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
             <div className="text-sm text-yellow-800 space-y-1">
                <strong>Hành động hệ thống sẽ thực thi:</strong>
                <ul className="list-disc pl-5">
                   <li>Đóng hồ sơ hợp đồng CT002, trạng thái thành "Đã thanh lý".</li>
                   <li>Hệ thống tự động reset trạng thái các giường của R102 về lại <strong>"Trống"</strong>.</li>
                   <li>Phòng sẽ xuất hiện lại trên kết quả Tra cứu cho Sales khác chốt đơn.</li>
                </ul>
             </div>
          </div>

          <Button size="lg" className="w-full max-w-sm h-14 text-lg font-bold bg-green-600 hover:bg-green-700 shadow-lg">
             Xác nhận Thanh lý & Giải phóng Phòng
          </Button>
        </Card>
      </div>
    </div>
  );
}