const API_BASE = 'http://localhost:5000/api';

async function apiFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Request failed: ${res.statusText}`);
  }
  return res.json();
}

// ─── ROOMS ───────────────────────────────────────────────────────────────────

export interface RoomFilters {
  maCN?: string;
  gioiTinh?: string;
  minGia?: number;
  maxGia?: number;
  trangThai?: string;
  coGiuongTrong?: boolean;
  search?: string;
}

export const roomService = {
  getRooms: (filters?: RoomFilters) => {
    const p = new URLSearchParams();
    if (filters?.maCN) p.append('maCN', filters.maCN);
    if (filters?.gioiTinh) p.append('gioiTinh', filters.gioiTinh);
    if (filters?.minGia) p.append('minGia', String(filters.minGia));
    if (filters?.maxGia) p.append('maxGia', String(filters.maxGia));
    if (filters?.trangThai) p.append('trangThai', filters.trangThai);
    if (filters?.coGiuongTrong) p.append('coGiuongTrong', 'true');
    if (filters?.search) p.append('search', filters.search);
    return apiFetch(`${API_BASE}/rooms?${p}`);
  },
};

// ─── REQUESTS (YeuCauThue) ────────────────────────────────────────────────────

export interface RequestPayload {
  maKH: string;
  maNV: string;
  soNguoi?: number;
  gioiTinh?: string;
  khuVuc?: string;
  loaiPhong?: string;
  mucGia?: number;
  ngayVaoO: string;
  thoiHanThue: number;
  ghiChu?: string;
}

export const requestService = {
  getRequests: (filters?: { search?: string; status?: string; page?: number; limit?: number }) => {
    const p = new URLSearchParams();
    if (filters?.search) p.append('search', filters.search);
    if (filters?.status) p.append('status', filters.status);
    if (filters?.page) p.append('page', String(filters.page));
    if (filters?.limit) p.append('limit', String(filters.limit));
    return apiFetch(`${API_BASE}/requests?${p}`);
  },

  createRequest: (payload: RequestPayload) =>
    apiFetch(`${API_BASE}/requests`, { method: 'POST', body: JSON.stringify(payload) }),

  updateRequest: (id: string, payload: { trangThai?: string; ghiChu?: string }) =>
    apiFetch(`${API_BASE}/requests/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),

  deleteRequest: (id: string) =>
    apiFetch(`${API_BASE}/requests/${id}`, { method: 'DELETE' }),
};

// ─── APPOINTMENTS (LichHen) ───────────────────────────────────────────────────

export interface AppointmentPayload {
  maYCT: string;
  ngayHen: string;
  gioHen: string;
  ghiChu?: string;
}

export const appointmentService = {
  getAppointments: (filters?: { maYCT?: string; status?: string; page?: number; limit?: number }) => {
    const p = new URLSearchParams();
    if (filters?.maYCT) p.append('maYCT', filters.maYCT);
    if (filters?.status) p.append('status', filters.status);
    if (filters?.page) p.append('page', String(filters.page));
    if (filters?.limit) p.append('limit', String(filters.limit));
    return apiFetch(`${API_BASE}/appointments?${p}`);
  },

  createAppointment: (payload: AppointmentPayload) =>
    apiFetch(`${API_BASE}/appointments`, { method: 'POST', body: JSON.stringify(payload) }),

  updateAppointment: (id: string, payload: { trangThai?: string; ghiChu?: string }) =>
    apiFetch(`${API_BASE}/appointments/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
};
