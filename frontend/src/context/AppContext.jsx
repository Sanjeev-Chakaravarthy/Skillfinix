import React, { createContext, useContext, useState, useCallback } from "react";

const AppContext = createContext(undefined);

const initialNotifications = [
  {
    id: "1",
    title: "Course Update",
    message: 'New lesson added to "React Masterclass"',
    type: "info",
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Achievement Unlocked",
    message: 'You earned the "Quick Learner" badge!',
    type: "success",
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Barter Request",
    message: "Maya Patel wants to exchange skills with you",
    type: "info",
    read: false,
    createdAt: new Date().toISOString(),
  },
];

export const AppProvider = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState(initialNotifications);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const addNotification = useCallback((notification) => {
    const newNotification = {
      ...notification,
      id: Date.now().toString(),
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotification, ...prev]);
  }, []);

  const markNotificationRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        sidebarOpen,
        toggleSidebar,
        setSidebarOpen,
        searchQuery,
        setSearchQuery,
        notifications,
        addNotification,
        markNotificationRead,
        clearNotifications,
        unreadCount,
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
