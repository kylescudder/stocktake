import { writable } from "svelte/store";
import { browser } from "$app/environment";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

const createAuthStore = () => {
  const { subscribe, set, update } = writable<AuthStore>({
    user: null,
    token: null,
    isAuthenticated: false,
  });

  return {
    subscribe,
    login: (token: string, user: User) => {
      if (browser) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
      }
      set({ user, token, isAuthenticated: true });
    },
    logout: () => {
      if (browser) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      set({ user: null, token: null, isAuthenticated: false });
    },
    init: () => {
      if (browser) {
        const token = localStorage.getItem("token");
        const userStr = localStorage.getItem("user");
        if (token && userStr) {
          const user = JSON.parse(userStr);
          set({ user, token, isAuthenticated: true });
        }
      }
    },
  };
};

export const auth = createAuthStore();
