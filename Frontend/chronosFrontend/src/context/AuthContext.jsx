import { createContext, useContext, useState, useEffect } from "react";
import api from "../api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem("userData");
      }
    }

    refreshUser().finally(() => setIsLoading(false));
  }, []);

  const saveUser = (userData) => {
    setUser(userData);
    setIsAuthenticated(!!userData);

    if (userData) {
      const safeUser = {
        name: userData.name,
        email: userData.email,
      };

      localStorage.setItem("userData", JSON.stringify(safeUser));
    } else {
      localStorage.removeItem("userData");
    }
  };

  const refreshUser = async () => {
    try {
      const res = await api.post("/auth/refresh", { withCredentials: true });
      if (res.data?.user) {
        saveUser(res.data.user);
      } else {
        saveUser(null);
      }
    } catch (error) {
      saveUser(null);
    }
  };

  const login = async (formData) => {
    try {
      const res = await api.post("/auth/login", formData);
      if (res.data?.user) {
        saveUser(res.data.user);
        console.log("Login successful:", res.data.user);
        return { success: true };
      }
      await refreshUser();
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout", {}, { withCredentials: true });
      saveUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


export const UseAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("UseAuth must be used within an AuthProvider");
  }
  return ctx;
}