import { useNavigate } from "react-router";
import { useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from "../components/ui";

export function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('sale01');
  const [password, setPassword] = useState('123456');

  const handleLogin = () => {
    const userMap: Record<string, { id: string; role: string; name: string }> = {
      admin: { id: 'NV001', role: 'admin', name: 'Admin' },
      sale01: { id: 'NV002', role: 'sale', name: 'Sale 01' },
      sale02: { id: 'NV005', role: 'sale', name: 'Sale 02' },
      quanly01: { id: 'NV004', role: 'quanly', name: 'Quan ly 01' },
    };

    const user = userMap[username.trim()] || userMap.sale01;
    window.localStorage.setItem('currentUser', JSON.stringify({
      id: user.id,
      role: user.role,
      username: username.trim() || 'sale01',
      name: user.name,
    }));
    window.localStorage.setItem('userId', user.id);
    window.localStorage.setItem('userRole', user.role);

    if (!password.trim()) {
      return;
    }

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
            <Input placeholder="sale01" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Mật khẩu</label>
            <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button className="w-full" onClick={handleLogin}>Đăng nhập</Button>
        </CardContent>
      </Card>
    </div>
  );
}
