import { createContext, useContext, useEffect, useState } from "react";
import {
  getCurrentUser,
  getToken,
  fetchCurrentUserFromServer,
  logoutUser,
} from "@/services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = getToken();
    const storedUser = getCurrentUser();

    return token && storedUser ? storedUser : null;
  });

  useEffect(() => {
    let mounted = true;

    async function verifySession() {
      const token = getToken();

      if (!token) {
        if (mounted) {
          setUser(null);
        }
        return;
      }

      try {
        const currentUser = await fetchCurrentUserFromServer();

        if (mounted) {
          setUser(currentUser || null);
        }
      } catch {
        if (mounted) {
          logoutUser();
          setUser(null);
        }
      }
    }

    verifySession();

    return () => {
      mounted = false;
    };
  }, []);

  function logout() {
    logoutUser();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
