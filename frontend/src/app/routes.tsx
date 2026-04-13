import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Login } from "./pages/Login"; // Sẽ tạo file này ở bước sau
import { 
  AdminAccounts, AdminBranches, AdminRooms, 
  AdminAssets, AdminServices, AdminPolicies 
} from "./pages/Module1";
import { 
  SalesCustomers, SalesRequests, SalesSearch, SalesAppointments 
} from "./pages/Module2";
import { 
  DepositCreate, DepositManage 
} from "./pages/Module3";
import { 
  ContractMembers, ContractManage, ContractReceipts, ContractHandover 
} from "./pages/Module4";
import { 
  CheckoutSchedules, CheckoutInspection, CheckoutSlips, CheckoutLiquidation 
} from "./pages/Module5";

export const router = createBrowserRouter([
  // Route đăng nhập nằm ngoài Layout (không có Sidebar/Topbar)
  {
    path: "/login",
    Component: Login,
  },
  // Các route chính nằm trong Layout
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      // Module 1: Quản trị Hệ thống
      { path: "admin/accounts", Component: AdminAccounts },
      { path: "admin/branches", Component: AdminBranches },
      { path: "admin/rooms", Component: AdminRooms },
      { path: "admin/assets", Component: AdminAssets },
      { path: "admin/services", Component: AdminServices },
      { path: "admin/policies", Component: AdminPolicies },
      // Module 2: Đăng ký & Tư vấn
      { path: "sales/customers", Component: SalesCustomers },
      { path: "sales/requests", Component: SalesRequests },
      { path: "sales/search", Component: SalesSearch },
      { path: "sales/appointments", Component: SalesAppointments },
      // Module 3: Đặt cọc
      { path: "deposits/create", Component: DepositCreate },
      { path: "deposits/manage", Component: DepositManage },
      // Module 4: Hợp đồng & Nhận phòng
      { path: "contracts/members", Component: ContractMembers },
      { path: "contracts/manage", Component: ContractManage },
      { path: "contracts/receipts", Component: ContractReceipts },
      { path: "contracts/handover", Component: ContractHandover },
      // Module 5: Trả phòng & Thanh lý
      { path: "checkout/schedules", Component: CheckoutSchedules },
      { path: "checkout/inspection", Component: CheckoutInspection },
      { path: "checkout/slips", Component: CheckoutSlips },
      { path: "checkout/liquidation", Component: CheckoutLiquidation },
    ],
  },
]);