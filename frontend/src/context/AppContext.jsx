import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import api from "@/api/axios";
import { useAuth } from "@/context/AuthContext";

const AppContext = createContext(undefined);

export const AppProvider = ({ children }) => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  // Fetch real notifications from DB
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      setNotificationsLoading(true);
      const { data } = await api.get('/notifications');
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setNotificationsLoading(false);
    }
  }, [user]);

  // Fetch notifications on login
  useEffect(() => {
    if (user) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user, fetchNotifications]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const addNotification = useCallback((notification) => {
    // Optimistically add to local state
    const newNotification = {
      ...notification,
      _id: Date.now().toString(),
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotification, ...prev]);
    setUnreadCount((prev) => prev + 1);
  }, []);

  const markNotificationRead = useCallback(async (id) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    // Persist to DB
    try {
      await api.put(`/notifications/${id}/read`);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);

    try {
      await api.put('/notifications/read-all');
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  }, []);

  const clearNotifications = useCallback(async () => {
    setNotifications([]);
    setUnreadCount(0);

    try {
      await api.delete('/notifications');
    } catch (error) {
      console.error("Failed to clear notifications:", error);
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        sidebarOpen,
        toggleSidebar,
        setSidebarOpen,
        searchQuery,
        setSearchQuery,
        notifications,
        notificationsLoading,
        addNotification,
        markNotificationRead,
        markAllNotificationsRead,
        clearNotifications,
        unreadCount,
        fetchNotifications,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
