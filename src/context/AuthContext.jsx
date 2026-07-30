import React, { createContext, useContext, useEffect, useState } from "react";
import api, { setCsrfToken } from "../services/api.js";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

const normalizeUser = (user) => ({ ...user, role: user?.role || "citizen" });

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      try {
        const { data } = await api.get("/auth/me");
        setCsrfToken(data.csrfToken);
        setUser(normalizeUser(data.user));
      } catch {
        setCsrfToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const persistSession = (data) => {
    const nextUser = normalizeUser(data.user);
    setCsrfToken(data.csrfToken);
    setUser(nextUser);
    return { ...data, user: nextUser };
  };

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    return persistSession(data);
  };

  const loginWithGoogle = async (credential) => {
    const { data } = await api.post("/auth/google", { credential });
    return persistSession(data);
  };

  const register = async (name, email, password, confirmPassword) => {
    const { data } = await api.post("/auth/register", {
      name,
      email,
      password,
      confirmPassword,
    });
    return persistSession(data);
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      window.google?.accounts?.id?.disableAutoSelect?.();
      setCsrfToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
