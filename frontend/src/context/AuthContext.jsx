import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import api from "@/api/axios";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null); // ✅ ADD THIS
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in on app load
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        setToken(storedToken); // ✅ SET TOKEN IN STATE
        try {
          const { data } = await api.get("/auth/me");
          setUser(data); 
        } catch (error) {
          console.error("Auth check failed", error);
          localStorage.removeItem("token");
          setToken(null); // ✅ CLEAR TOKEN ON ERROR
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", data.token);
      setToken(data.token); // ✅ SET TOKEN IN STATE
      setUser(data);
      setIsLoading(false);
      return { success: true };
    } catch (error) {
      setIsLoading(false);
      return { 
        success: false, 
        error: error.response?.data?.message || "Login failed" 
      };
    }
  }, []);

  const googleLogin = useCallback(async (googleToken) => {
    setIsLoading(true);
    try {
      const { data } = await api.post("/auth/google", { token: googleToken });
      localStorage.setItem("token", data.token);
      setToken(data.token); // ✅ SET TOKEN IN STATE
      setUser(data);
      setIsLoading(false);
      return { success: true };
    } catch (error) {
      setIsLoading(false);
      return { 
        success: false, 
        error: error.response?.data?.message || "Google Login failed" 
      };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null); // ✅ CLEAR TOKEN IN STATE
    setUser(null);
  }, []);

  const register = useCallback(async (name, email, password) => {
    setIsLoading(true);
    try {
      const { data } = await api.post("/auth/register", { name, email, password });
      localStorage.setItem("token", data.token);
      setToken(data.token); // ✅ SET TOKEN IN STATE
      setUser(data);
      setIsLoading(false);
      return { success: true };
    } catch (error) {
      setIsLoading(false);
      return { 
        success: false, 
        error: error.response?.data?.message || "Registration failed" 
      };
    }
  }, []);

  const updateProfile = useCallback((updatedUserData) => {
    console.log('🔄 Updating profile in AuthContext:', updatedUserData);

    setUser((prevUser) => {
      if (!prevUser) return updatedUserData;

      const newUser = {
        ...prevUser,
        ...updatedUserData,
        // Force avatar refresh to avoid browser cache
        avatar: updatedUserData.avatar
          ? `${updatedUserData.avatar}?t=${Date.now()}`
          : prevUser.avatar,
      };

      console.log('✅ New user state:', newUser);

      // Persist if user is stored in localStorage
      if (localStorage.getItem('user')) {
        localStorage.setItem('user', JSON.stringify(newUser));
      }

      return newUser;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token, // ✅ ADD THIS - CRITICAL FOR SOCKET!
        isAuthenticated: !!user,
        isLoading,
        login,
        googleLogin,
        logout,
        register,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};