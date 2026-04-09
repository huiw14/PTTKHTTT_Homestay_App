import { Link, Outlet, useLocation } from "react-router";
import { 
  Building2, Users, Receipt, CalendarCheck, Home, 
  LogOut, Settings, Bell, Search, Bed, BookOpen, UserPlus, 
  FileText, Banknote, ShieldCheck, DoorOpen 
} from "lucide-react";
import { cn } from "./ui";

const navItems = [
  {
    module: "Module 1: Quản trị Hệ thống",
    icon: Settings,
    items: [
      { name: "Tài khoản", path: "/admin/accounts" },
      { name: "Ký túc xá", path: "/admin/branches" },
      { name: "Phòng/Giường", path: "/admin/rooms" },
      { name: "Tiện ích/Tài sản", path: "/admin/assets" },
      { name: "Dịch vụ", path: "/admin/services" },
      { name: "Chính sách", path: "/admin/policies" },
    ]
  },
  {
    module: "Module 2: Đăng ký & Tư vấn",
    icon: Users,
    items: [
      { name: "Khách hàng", path: "/sales/customers" },
      { name: "Yêu cầu thuê", path: "/sales/requests" },
      { name: "Tìm phòng", path: "/sales/search" },
      { name: "Lịch hẹn", path: "/sales/appointments" },
    ]
  },
  {
    module: "Module 3: Đặt cọc",
    icon: Banknote,
    items: [
      { name: "Lập phiếu cọc", path: "/deposits/create" },
      { name: "Quản lý cọc", path: "/deposits/manage" },
    ]
  },
  {
    module: "Module 4: Hợp đồng & Nhận phòng",
    icon: FileText,
    items: [
      { name: "Thành viên", path: "/contracts/members" },
      { name: "Hợp đồng", path: "/contracts/manage" },
      { name: "Thu tiền kỳ đầu", path: "/contracts/receipts" },
      { name: "Bàn giao phòng", path: "/contracts/handover" },
    ]
  },
  {
    module: "Module 5: Trả phòng & Thanh lý",
    icon: DoorOpen,
    items: [
      { name: "Lịch trả phòng", path: "/checkout/schedules" },
      { name: "Kiểm tra hiện trạng", path: "/checkout/inspection" },
      { name: "Thanh toán", path: "/checkout/slips" },
      { name: "Thanh lý", path: "/checkout/liquidation" },
    ]
  }
];

export function Layout() {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-2 font-bold text-xl text-blue-600">
            <Building2 className="w-6 h-6" />
            <span>HomeStay Pro</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Hệ thống quản lý toàn diện</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-6">
          <Link 
            to="/" 
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium",
              location.pathname === "/" ? "bg-blue-50 text-blue-600" : "text-slate-700 hover:bg-slate-100"
            )}
          >
            <Home className="w-4 h-4" /> Tổng quan
          </Link>

          {navItems.map((group, idx) => (
            <div key={idx} className="space-y-2">
              <h4 className="flex items-center gap-2 px-3 text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2">
                <group.icon className="w-4 h-4 text-slate-500" />
                {group.module}
              </h4>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = location.pathname.startsWith(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        "block px-3 py-1.5 ml-4 rounded-md transition-colors text-sm",
                        isActive 
                          ? "bg-blue-50 text-blue-700 font-medium" 
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      )}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex-1 flex items-center">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Tìm kiếm nhanh..." 
                className="h-9 w-full rounded-md border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative text-slate-500 hover:text-slate-700">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">3</span>
            </button>
            <div className="h-6 w-px bg-slate-200 mx-2"></div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium leading-none">Hoàng Minh Tuấn</p>
                <p className="text-xs text-slate-500 mt-1">Admin</p>
              </div>
              <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                AD
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto bg-slate-50 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}