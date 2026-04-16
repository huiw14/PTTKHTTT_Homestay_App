import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from "../components/ui";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000";

export function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    tenDangNhap: "admin",
    matKhau: "123456",
  });

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.tenDangNhap || !form.matKhau) {
      toast.error("Vui lòng nhập tên đăng nhập và mật khẩu.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.message || "Đăng nhập thất bại.");
      }

      toast.success("Đăng nhập thành công.");
      navigate("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Đăng nhập thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-slate-900">
      <Card className="w-[400px]">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-blue-600">HomeStay Pro</CardTitle>
          <p className="text-sm text-slate-500">Đăng nhập để quản lý hệ thống</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tên đăng nhập</label>
              <Input
                placeholder="admin"
                value={form.tenDangNhap}
                onChange={(event) => setForm((current) => ({ ...current, tenDangNhap: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Mật khẩu</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={form.matKhau}
                onChange={(event) => setForm((current) => ({ ...current, matKhau: event.target.value }))}
              />
            </div>
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}