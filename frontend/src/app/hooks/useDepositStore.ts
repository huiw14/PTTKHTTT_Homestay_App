import { useState, useCallback } from "react";
import { depositService } from "../services/depositService";

// Session storage for newly created deposits (before API success)
let globalDeposits: any[] = [];

export function useDepositStore() {
  const [deposits, setDeposits] = useState(globalDeposits);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Create deposit via API
   */
  const addDeposit = useCallback(async (newDeposit: any) => {
    try {
      setLoading(true);
      setError(null);

      // Call backend API
      const payload = {
        maKH: newDeposit.customerId || newDeposit.khachHang?.maKH,
        maNV: newDeposit.employeeId || newDeposit.nhanVien?.maNV || "NV001", // Default to admin
        maCN: newDeposit.branchId || newDeposit.chiNhanh?.maCN || "CN001", // Default to branch 1
        tienCoc: newDeposit.amount || newDeposit.tienCoc,
        beds: newDeposit.beds || [],
      };

      const response = await depositService.createDeposit(payload);

      if (response.success) {
        // Optionally keep in session for immediate UI update
        globalDeposits = [response.data, ...globalDeposits];
        setDeposits([...globalDeposits]);
        return response.data;
      } else {
        throw new Error(response.message || "Failed to create deposit");
      }
    } catch (err: any) {
      const message = err.message || "Error creating deposit";
      setError(message);
      console.error("Add deposit error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update deposit status via API
   */
  const updateDeposit = useCallback(async (depositId: string, updates: any) => {
    try {
      setLoading(true);
      setError(null);

      const response = await depositService.updateDeposit(depositId, updates);

      if (response.success) {
        // Update session storage
        globalDeposits = globalDeposits.map((d) =>
          d.maPC === depositId ? { ...d, ...updates } : d
        );
        setDeposits([...globalDeposits]);
        return response.data;
      } else {
        throw new Error(response.message || "Failed to update deposit");
      }
    } catch (err: any) {
      const message = err.message || "Error updating deposit";
      setError(message);
      console.error("Update deposit error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Delete deposit via API
   */
  const removeDeposit = useCallback(async (depositId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await depositService.deleteDeposit(depositId);

      if (response.success) {
        globalDeposits = globalDeposits.filter((d) => d.maPC !== depositId);
        setDeposits([...globalDeposits]);
        return response;
      } else {
        throw new Error(response.message || "Failed to delete deposit");
      }
    } catch (err: any) {
      const message = err.message || "Error deleting deposit";
      setError(message);
      console.error("Remove deposit error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch all deposits from backend
   */
  const fetchDeposits = useCallback(async (filters?: any) => {
    try {
      setLoading(true);
      setError(null);

      const response = await depositService.getDeposits(filters);

      if (response.success) {
        // Merge with session deposits
        const backendDeposits = response.data || [];
        globalDeposits = [...globalDeposits, ...backendDeposits];
        setDeposits([...globalDeposits]);
        return response;
      } else {
        throw new Error(response.message || "Failed to fetch deposits");
      }
    } catch (err: any) {
      const message = err.message || "Error fetching deposits";
      setError(message);
      console.error("Fetch deposits error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Reset session deposits
   */
  const resetDeposits = useCallback(() => {
    globalDeposits = [];
    setDeposits([]);
    setError(null);
  }, []);

  return {
    deposits,
    loading,
    error,
    addDeposit,
    updateDeposit,
    removeDeposit,
    fetchDeposits,
    resetDeposits,
  };
}
