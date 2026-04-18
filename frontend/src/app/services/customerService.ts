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

export interface CustomerPayload {
  hoTen: string;
  gioiTinh?: 'Nam' | 'Nu';
  ngaySinh?: string;
  cccd: string;
  soDienThoai: string;
  email?: string;
  quocTich?: string;
}

export const customerService = {
  async getCustomers(filters?: { search?: string; page?: number; limit?: number }) {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await fetch(`${API_BASE}/customers?${params}`, {
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    });

    if (!response.ok) throw new Error(`Lỗi tải danh sách khách hàng: ${response.statusText}`);
    return response.json();
  },

  async createCustomer(payload: CustomerPayload) {
    const response = await fetch(`${API_BASE}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Lỗi tạo khách hàng');
    }
    return response.json();
  },
};
