import { useCallback, useEffect, useMemo, useState } from "react";

import { AuthContext } from "./authContext";
import {
  getCurrentUser,
  loginUser,
  registerUser,
} from "../services/authService";

const AUTH_STORAGE_KEY = "queueless_auth";

const getStoredAuth = () => {
  try {
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    return storedAuth ? JSON.parse(storedAuth) : null;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredAuth()?.user || null);
  const [token, setToken] = useState(() => getStoredAuth()?.token || null);
  const [loading, setLoading] = useState(Boolean(getStoredAuth()?.token));

  useEffect(() => {
    const hydrateUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await getCurrentUser(token);
        setUser(data.user);
      } catch {
        setUser(null);
        setToken(null);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } finally {
        setLoading(false);
      }
    };

    hydrateUser();
  }, [token]);

  const saveAuth = useCallback((authData) => {
    setToken(authData.token);
    setUser(authData.user);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
  }, []);

  const register = useCallback(async (userData) => {
    const authData = await registerUser(userData);
    saveAuth(authData);
    return authData;
  }, [saveAuth]);

  const login = useCallback(async (credentials) => {
    const authData = await loginUser(credentials);
    saveAuth(authData);
    return authData;
  }, [saveAuth]);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      logout,
      isAuthenticated: Boolean(token && user),
    }),
    [loading, login, logout, register, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
