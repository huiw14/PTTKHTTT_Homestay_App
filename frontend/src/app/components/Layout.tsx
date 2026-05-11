import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Settings,
  Users,
  CreditCard,
  FileText,
  Plus,
  LogOut,
  Bell,
  UserCircle,
  ShieldCheck,
  DoorOpen,
  ClipboardCheck,
  Calculator,
  FileCheck
} from "lucide-react";
import { Button } from "./ui/button";

// --- ROLE-BASED ACCESS CONTROL ---
const ROLE_PERMISSIONS = {
  admin: {
    modules: ['common', 'admin', 'sales', 'contracts'],
    visibleGroups: ['Chung', 'Quản trị (Module 1)', 'Sale & Đặt cọc (Module 2 & 3)', 'Hợp đồng & Trả phòng (Module 4 & 5)']
  },
  sale: {
    modules: ['common', 'sales', 'contracts-create'],
    visibleGroups: ['Chung', 'Sale & Đặt cọc (Module 2 & 3)', 'Hợp đồng & Trả phòng (Module 4 & 5)']
  },
  quanly: {
    modules: ['common', 'admin', 'sales-deposits', 'contracts', 'checkout'],
    visibleGroups: ['Chung', 'Quản trị (Module 1)', 'Sale & Đặt cọc (Module 2 & 3)', 'Hợp đồng & Trả phòng (Module 4 & 5)']
  },
  ketoan: {
    modules: ['common', 'sales-deposits', 'contracts-receipts', 'checkout-slips'],
    visibleGroups: ['Chung', 'Sale & Đặt cọc (Module 2 & 3)', 'Hợp đồng & Trả phòng (Module 4 & 5)']
  }
};

// --- CẤU HÌNH MENU CHUẨN THEO ROUTES ---
const MENU_GROUPS = [
  {
    title: "Chung",
    groupId: 'common',
    items: [
      { name: "Tổng quan (Dashboard)", path: "/", icon: LayoutDashboard, roles: ['admin', 'sale', 'quanly', 'ketoan'] },
    ]
  },
  {
    title: "Quản trị (Module 1)",
    groupId: 'admin',
    items: [
      { name: "Phòng / Giường", path: "/admin/rooms", icon: Settings, roles: ['admin', 'quanly'] },
      { name: "Tài sản & Tiện ích", path: "/admin/assets", icon: Settings, roles: ['admin', 'quanly'] },
      { name: "Dịch vụ", path: "/admin/services", icon: Settings, roles: ['admin', 'quanly'] },
      { name: "Tài khoản", path: "/admin/accounts", icon: Settings, roles: ['admin'] },
    ]
  },
  {
    title: "Sale & Đặt cọc (Module 2 & 3)",
    groupId: 'sales',
    items: [
      { name: "Khách hàng", path: "/sales/customers", icon: Users, roles: ['admin', 'sale'] },
      { name: "Yêu cầu thuê", path: "/sales/requests", icon: Users, roles: ['admin', 'sale'] },
      { name: "Tra cứu phòng trống", path: "/sales/search", icon: Users, roles: ['admin', 'sale'] },
      { name: "Lịch hẹn xem phòng", path: "/sales/appointments", icon: Users, roles: ['admin', 'sale'] },
      { name: "Lập phiếu Đặt cọc", path: "/deposits/create", icon: CreditCard, roles: ['admin', 'sale'] },
      { name: "Quản lý Phiếu cọc", path: "/deposits/manage", icon: CreditCard, roles: ['admin', 'sale', 'quanly', 'ketoan'] },
    ]
  },
  {
    title: "Hợp đồng & Trả phòng (Module 4 & 5)",
    groupId: 'contracts',
    items: [
      { name: "Xét duyệt thành viên", path: "/contracts/members", icon: ShieldCheck, roles: ['admin', 'quanly'] },
      { name: "Quản lý Hợp đồng", path: "/contracts/manage", icon: FileText, roles: ['admin', 'sale', 'quanly'] },
      { name: "Lập Hợp đồng mới", path: "/contracts/create", icon: Plus, roles: ['admin', 'sale', 'quanly'] },
      { name: "Thu tiền kỳ đầu", path: "/contracts/receipts", icon: CreditCard, roles: ['admin', 'ketoan', 'quanly'] },
      { name: "Bàn giao phòng", path: "/contracts/handover", icon: DoorOpen, roles: ['admin', 'sale', 'quanly'] },
      { name: "Lịch trả phòng", path: "/checkout/schedules", icon: LogOut, roles: ['admin', 'sale', 'quanly'] },
      { name: "Kiểm tra hiện trạng", path: "/checkout/inspection", icon: ClipboardCheck, roles: ['admin', 'quanly'] },
      { name: "Đối soát tài chính", path: "/checkout/slips", icon: Calculator, roles: ['admin', 'ketoan', 'quanly'] },
      { name: "Thanh lý hợp đồng", path: "/checkout/liquidation", icon: FileCheck, roles: ['admin', 'quanly'] },
    ]
  }
];

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string>('admin');
  const [userName, setUserName] = useState<string>('Thành Minh');

  // Get user info from localStorage
  useEffect(() => {
    const userRaw = localStorage.getItem('currentUser');
    if (userRaw) {
      try {
        const user = JSON.parse(userRaw);
        setUserRole(user.role || 'admin');
        setUserName(user.name || user.id || 'Thành Minh');
      } catch (e) {
        console.error('Failed to parse user info:', e);
      }
    }
  }, []);

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
          {MENU_GROUPS.map((group, index) => {
            // Filter items by user role
            const visibleItems = group.items.filter(item => 
              item.roles && item.roles.includes(userRole)
            );

            // Hide group if no items are visible
            if (visibleItems.length === 0) {
              return null;
            }

            return (
              <div key={index}>
                <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  {group.title}
                </p>
                <div className="space-y-1">
                  {visibleItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${isActive
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
            );
          })}
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
              {/* Lấy tên menu hiện tại từ tất cả các item có thể truy cập */}
              {MENU_GROUPS.flatMap(g => 
                g.items.filter(i => i.roles && i.roles.includes(userRole))
              ).find(i => i.path === location.pathname)?.name || "Bảng điều khiển"}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="rounded-full relative">
              <Bell size={18} className="text-slate-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>

            <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-slate-700">{userName}</p>
                <p className="text-xs text-slate-500">
                  {userRole === 'admin' ? 'Quản trị viên' : 
                   userRole === 'sale' ? 'Nhân viên sale' : 
                   userRole === 'quanly' ? 'Quản lý' : 
                   userRole === 'ketoan' ? 'Kế toán' : 'Người dùng'}
                </p>
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
