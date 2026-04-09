import { useNavigate } from "react-router";
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from "../components/ui";

export function Login() {
  const navigate = useNavigate();

  const handleLogin = () => {
    // Tạm thời bỏ qua logic xác thực, bấm là cho vào Dashboard luôn
    navigate("/");
  };

  return (
    <div className="flex h-screen items-center justify-center bg-slate-900">
      <Card className="w-[400px]">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-blue-600">HomeStay Pro</CardTitle>
          <p className="text-sm text-slate-500">Đăng nhập để quản lý hệ thống</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tên đăng nhập</label>
            <Input placeholder="admin" defaultValue="admin" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Mật khẩu</label>
            <Input type="password" placeholder="••••••••" defaultValue="password" />
          </div>
          <Button className="w-full" onClick={handleLogin}>Đăng nhập</Button>
        </CardContent>
      </Card>
    </div>
  );
}