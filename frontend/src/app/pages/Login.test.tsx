import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

const navigateMock = vi.fn();

vi.mock('react-router', () => ({
  useNavigate: () => navigateMock,
}));

import { Login } from './Login';

describe('Login page', () => {
  beforeEach(() => {
    window.localStorage.clear();
    navigateMock.mockReset();
  });

  it('stores currentUser in localStorage after login', async () => {
    const user = userEvent.setup();
    render(<Login />);

    const usernameInput = screen.getByPlaceholderText('sale01');
    const passwordInput = screen.getByPlaceholderText('••••••••');

    await user.clear(usernameInput);
    await user.type(usernameInput, 'sale01');
    await user.clear(passwordInput);
    await user.type(passwordInput, '123456');

    await user.click(screen.getByRole('button', { name: 'Đăng nhập' }));

    const saved = JSON.parse(window.localStorage.getItem('currentUser') || '{}');
    expect(saved.id).toBe('NV002');
    expect(saved.role).toBe('sale');
    expect(navigateMock).toHaveBeenCalledWith('/');
  });
});
