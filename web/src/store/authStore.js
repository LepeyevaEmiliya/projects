import { create } from 'zustand';

const TOKEN_KEY = 'taskflow-auth';

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem(TOKEN_KEY),
  isLoading: true,

  loginSuccess: ({ user, token }) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem('taskflow-user', JSON.stringify(user)); 
    set({ user, token, isLoading: false });
  },

  setUser: (user) => set({ user }),
  finishInit: () => set({ isLoading: false }),

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('taskflow-user'); 
    set({ user: null, token: null, isLoading: false });
  },
}));
