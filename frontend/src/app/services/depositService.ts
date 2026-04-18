// API service for deposits
const API_BASE = 'http://localhost:5000/api';

export interface DepositPayload {
  maKH: string;
  maNV: string;
  maCN: string;
  tienCoc: number;
  beds?: string[];
  maPhong?: string;
}

export interface DepositUpdatePayload {
  trangThai?: string;
}

export const depositService = {
  /**
   * GET /api/deposits - List all deposits with search & sort
   */
  async getDeposits(filters?: {
    search?: string;
    sortBy?: "date-desc" | "date-asc" | "amount-desc" | "amount-asc" | "status";
    status?: string;
    maCN?: string;
    page?: number;
    limit?: number;
  }) {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.maCN) params.append('maCN', filters.maCN);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await fetch(`${API_BASE}/deposits?${params}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch deposits: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * GET /api/deposits/:id - Get single deposit
   */
  async getDepositDetail(id: string) {
    const response = await fetch(`${API_BASE}/deposits/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch deposit: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * POST /api/deposits - Create new deposit
   */
  async createDeposit(payload: DepositPayload) {
    const response = await fetch(`${API_BASE}/deposits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create deposit');
    }

    return response.json();
  },

  /**
   * PUT /api/deposits/:id - Update deposit status
   */
  async updateDeposit(id: string, payload: DepositUpdatePayload) {
    const response = await fetch(`${API_BASE}/deposits/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update deposit');
    }

    return response.json();
  },

  /**
   * DELETE /api/deposits/:id - Delete deposit
   */
  async deleteDeposit(id: string) {
    const response = await fetch(`${API_BASE}/deposits/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete deposit');
    }

    return response.json();
  },

  /**
   * POST /api/deposits/:id/send-payment-request - Send payment request email
   */
  async sendPaymentRequest(id: string) {
    const response = await fetch(`${API_BASE}/deposits/${id}/send-payment-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send payment request');
    }

    return response.json();
  },

  /**
   * POST /api/deposits/:id/approve - Approve payment (change status to DaDuyet)
   */
  async approvePayment(id: string) {
    const response = await fetch(`${API_BASE}/deposits/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to approve payment');
    }

    return response.json();
  },

  /**
   * GET /api/deposits/available-rooms - Get available rooms from database
   */
  async getAvailableRooms(type: 'giường' | 'phòng') {
    const params = new URLSearchParams();
    params.append('type', type);

    const response = await fetch(`${API_BASE}/deposits/available-rooms?${params}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch available rooms');
    }

    return response.json();
  },

  /**
   * GET /api/deposits/available-beds - Get available beds/rooms from database
   */
  async getAvailableBeds(type: 'giường' | 'phòng', roomId: string) {
    const params = new URLSearchParams();
    params.append('type', type);
    params.append('roomId', roomId);

    const response = await fetch(`${API_BASE}/deposits/available-beds?${params}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch available beds');
    }

    return response.json();
  },
};
