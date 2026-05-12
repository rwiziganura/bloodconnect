import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const AlertContext = createContext(null);

export const AlertProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    if (!token || !user) return;
    try {
      const { data } = await api.get('/notifications/unread-count');
      setUnreadCount(Number(data.count) || 0);
    } catch {
      // silently ignore — badge just won't update
    }
  }, [token, user]);

  useEffect(() => {
    fetchUnreadCount();
    const id = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(id);
  }, [fetchUnreadCount]);

  return (
    <AlertContext.Provider value={{ unreadCount, setUnreadCount, fetchUnreadCount }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlerts = () => {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error('useAlerts must be used within AlertProvider');
  return ctx;
};

export default AlertContext;
