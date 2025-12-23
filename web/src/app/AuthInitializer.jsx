import { useEffect } from 'react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

export default function AuthInitializer({ children }) {
  const { token, user, setUser, logout, finishInit } = useAuthStore();

  useEffect(() => {
    const init = async () => {
      console.log('AuthInitializer start, token:', token);
      if (!token) {
        finishInit();
        return;
      }
  
      try {
        const res = await api.get('/auth/me');
        console.log('AuthInitializer fetched user:', res.data.data);
        setUser(res.data.data);
      } catch (err) {
        console.error('AuthInitializer error', err);
        logout();
      } finally {
        finishInit();
      }
    };
  
    init();
  }, [token]);    

  return children;
}
