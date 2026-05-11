type CurrentUser = {
  id: string;
  role: string;
};

const seededRoleByEmployeeId: Record<string, string> = {
  NV001: "admin",
  NV002: "sale",
  NV003: "ketoan",
  NV004: "quanly",
  NV005: "sale",
};

const fallbackEmployeeIdByRole: Record<string, string> = {
  admin: "NV001",
  sale: "NV002",
  ketoan: "NV003",
  quanly: "NV004",
};

function normalizeUser(id: unknown, role: unknown): CurrentUser | null {
  const normalizedRole = typeof role === "string" ? role.trim() : "";
  const normalizedId = typeof id === "string" ? id.trim() : "";

  if (!normalizedRole) return null;

  const expectedRole = seededRoleByEmployeeId[normalizedId];
  if (normalizedId && (!expectedRole || expectedRole === normalizedRole)) {
    return { id: normalizedId, role: normalizedRole };
  }

  const fallbackId = fallbackEmployeeIdByRole[normalizedRole];
  return fallbackId ? { id: fallbackId, role: normalizedRole } : null;
}

export function getCurrentUser(): CurrentUser {
  if (typeof window === "undefined") {
    return { id: "NV002", role: "sale" };
  }

  const userRaw = window.localStorage.getItem("currentUser");
  if (userRaw) {
    try {
      const user = JSON.parse(userRaw);
      const normalized = normalizeUser(user?.id ?? user?.maNV, user?.role ?? user?.vaiTro);
      if (normalized) return normalized;
    } catch {
      // Ignore malformed local storage and fall back to the seeded sale account.
    }
  }

  const legacyUser = normalizeUser(
    window.localStorage.getItem("userId"),
    window.localStorage.getItem("userRole"),
  );

  return legacyUser ?? { id: "NV002", role: "sale" };
}

export function getAuthHeaders() {
  const user = getCurrentUser();
  return {
    "x-user-id": user.id,
    "x-user-role": user.role,
  };
}
