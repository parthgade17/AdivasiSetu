import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';

// Live admin analytics from the backend (cached for offline viewing).
export function useAdminSummary() {
  const { online, role, toast } = useApp();
  const [data, setData] = useState(() => {
    try { return JSON.parse(localStorage.getItem('as_c_admin') || 'null'); } catch { return null; }
  });
  const reload = useCallback(async () => {
    if (!online || role !== 'admin') return;
    try {
      const d = await api.adminSummary();
      setData(d);
      localStorage.setItem('as_c_admin', JSON.stringify(d));
    } catch (e) { toast(e.message, 'error'); }
  }, [online, role, toast]);
  useEffect(() => { reload(); }, [reload]);
  return { data, reload };
}
