import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { 
  LayoutDashboard, 
  Settings, 
  Users, 
  CreditCard, 
  FileText, 
  LogOut,
  Bell,
  UserCircle
} from "lucide-react";
import { Button } from "./ui/button";

// --- CẤU HÌNH MENU CHUẨN THEO ROUTES ---
const MENU_GROUPS = [
  {
    title: "Chung",
    items: [
      { name: "Tổng quan (Dashboard)", path: "/", icon: LayoutDashboard },
    ]
  },
  {
    title: "Quản trị (Module 1)",
    items: [
      { name: "Phòng / Giường", path: "/admin/rooms", icon: Settings },
      { name: "Tài sản & Tiện ích", path: "/admin/assets", icon: Settings },
      { name: "Dịch vụ", path: "/admin/services", icon: Settings },
      { name: "Tài khoản", path: "/admin/accounts", icon: Settings },
    ]
  },
  {
    title: "Sale & Đặt cọc (Module 2 & 3)",
    items: [
      { name: "Khách hàng", path: "/sales/customers", icon: Users },
      { name: "Yêu cầu thuê", path: "/sales/requests", icon: Users },
      { name: "Tra cứu phòng trống", path: "/sales/search", icon: Users },
      { name: "Lịch hẹn xem phòng", path: "/sales/appointments", icon: Users },
      { name: "Lập phiếu Đặt cọc", path: "/deposits/create", icon: CreditCard },
      { name: "Quản lý Phiếu cọc", path: "/deposits/manage", icon: CreditCard },
    ]
  },
  {
    title: "Hợp đồng & Trả phòng (Module 4 & 5)",
    items: [
      { name: "Quản lý Hợp đồng", path: "/contracts/manage", icon: FileText },
      { name: "Thu tiền kỳ đầu", path: "/contracts/receipts", icon: CreditCard },
      { name: "Lịch trả phòng", path: "/checkout/schedules", icon: LogOut },
      { name: "Thanh lý & Đối soát", path: "/checkout/slips", icon: LogOut },
    ]
  }
];

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Xóa token/session ở đây (nếu có)
    navigate("/login");
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      
      {/* ================= SIDEBAR (MENU TRÁI) ================= */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col transition-all duration-300">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950">
          <span className="text-xl font-bold text-white tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">
            HomeStay Pro
          </span>
        </div>

        {/* Danh sách Menu */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar">
          {MENU_GROUPS.map((group, index) => (
            <div key={index}>
              <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                {group.title}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                        isActive 
                          ? "bg-blue-600 text-white font-medium shadow-md" 
                          : "hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <Icon size={18} className={isActive ? "text-white" : "text-slate-400"} />
                      <span className="text-sm">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User Info & Đăng xuất (Đáy Sidebar) */}
        <div className="p-4 border-t border-slate-800">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-slate-400 hover:text-red-400 hover:bg-slate-800"
            onClick={handleLogout}
          >
            <LogOut size={18} className="mr-2" />
            Đăng xuất
          </Button>
        </div>
      </aside>

      {/* ================= KHU VỰC NỘI DUNG CHÍNH ================= */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* TOPBAR (THANH TIÊU ĐỀ) */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-slate-800">
              {/* Lấy tên menu hiện tại hiển thị lên Header */}
              {MENU_GROUPS.flatMap(g => g.items).find(i => i.path === location.pathname)?.name || "Bảng điều khiển"}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="rounded-full relative">
              <Bell size={18} className="text-slate-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
            
            <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-slate-700">Thành Minh</p>
                <p className="text-xs text-slate-500">Quản trị viên</p>
              </div>
              <UserCircle size={32} className="text-slate-400" />
            </div>
          </div>
        </header>

        {/* NỘI DUNG MODULE CỦA CÁC THÀNH VIÊN SẼ RENDER Ở ĐÂY */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto h-full">
            <Outlet />
          </div>
        </div>

      </main>
    </div>
  );
}