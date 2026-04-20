import { createContext, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { api, getErrorMessage } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshAuth = async () => {
    try {
      const { data } = await api.get("/api/auth/me");
      setUser(data.user);
    } catch (_error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      async login(payload) {
        try {
          const { data } = await api.post("/api/auth/login", payload);
          setUser(data.user);
          toast.success(data.message);
          return data.user;
        } catch (error) {
          toast.error(getErrorMessage(error, "Unable to log you in."));
          throw error;
        }
      },
      async signup(payload) {
        try {
          const { data } = await api.post("/api/auth/signup", payload);
          setUser(data.user);
          toast.success(data.message);
          return data.user;
        } catch (error) {
          toast.error(getErrorMessage(error, "Unable to create your account."));
          throw error;
        }
      },
      async logout() {
        await api.post("/api/auth/logout");
        setUser(null);
        toast.success("Signed out");
      },
      async updateProfile(payload) {
        const { data } = await api.put("/api/auth/profile", payload);
        setUser(data.user);
        toast.success(data.message);
        return data.user;
      },
      refreshAuth
    }),
    [loading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
