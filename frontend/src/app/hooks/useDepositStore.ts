import { useState, useCallback } from "react";

// Mock deposit store - persists only during current session
let globalDeposits: any[] = [];

export function useDepositStore() {
  const [deposits, setDeposits] = useState(globalDeposits);

  const addDeposit = useCallback((newDeposit: any) => {
    globalDeposits = [newDeposit, ...globalDeposits];
    setDeposits([...globalDeposits]);
  }, []);

  const updateDeposit = useCallback((depositId: string, updates: any) => {
    globalDeposits = globalDeposits.map(d => 
      d.id === depositId ? { ...d, ...updates } : d
    );
    setDeposits([...globalDeposits]);
  }, []);

  const removeDeposit = useCallback((depositId: string) => {
    globalDeposits = globalDeposits.filter(d => d.id !== depositId);
    setDeposits([...globalDeposits]);
  }, []);

  const resetDeposits = useCallback(() => {
    globalDeposits = [];
    setDeposits([]);
  }, []);

  return {
    deposits,
    addDeposit,
    updateDeposit,
    removeDeposit,
    resetDeposits
  };
}
