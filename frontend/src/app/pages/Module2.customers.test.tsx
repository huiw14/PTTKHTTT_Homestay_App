import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

const toastErrorMock = vi.fn();

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: (...args: unknown[]) => toastErrorMock(...args),
  },
}));

vi.mock('../services/customerService', () => ({
  customerService: {
    getCustomers: vi.fn().mockResolvedValue({ data: [], pagination: { pages: 1, total: 0 } }),
    createCustomer: vi.fn(),
  },
}));

import { SalesCustomers } from './Module2';

describe('SalesCustomers validation', () => {
  beforeEach(() => {
    toastErrorMock.mockReset();
  });

  it('shows toast error when submitting empty required fields', async () => {
    const user = userEvent.setup();
    render(<SalesCustomers />);

    await user.click(screen.getByRole('button', { name: /Thêm Khách hàng/i }));
    await user.click(screen.getByRole('button', { name: /Tạo khách hàng/i }));

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalled();
    });
  });
});
