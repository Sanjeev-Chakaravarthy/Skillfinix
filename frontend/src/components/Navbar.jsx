import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell, Plus, Menu, User, Settings, LogOut, ChevronDown,
  Video, Upload, Radio, ListPlus, BookOpen, GraduationCap,
  Check, CheckCheck, Trash2, ArrowLeftRight, Trophy, Zap, Info,
  AlertCircle, Star, X
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import SearchBar from "./SearchBar";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useSocket } from "@/context/SocketContext";

const getDefaultAvatar = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "User")}&background=6366f1&color=fff&size=200&bold=true`;

const getAvatarUrl = (avatarPath, name) => {
  if (!avatarPath) return getDefaultAvatar(name);
  if (avatarPath.startsWith("http")) return avatarPath;
  return getDefaultAvatar(name);
};

// Notification type → icon + color
const notifMeta = (type) => {
  switch (type) {
    case "success":
    case "course":      return { icon: BookOpen,       color: "text-green-500",  bg: "bg-green-500/10" };
    case "barter":      return { icon: ArrowLeftRight, color: "text-blue-500",   bg: "bg-blue-500/10" };
    case "achievement": return { icon: Trophy,          color: "text-yellow-500", bg: "bg-yellow-500/10" };
    case "warning":     return { icon: AlertCircle,     color: "text-orange-500", bg: "bg-orange-500/10" };
    case "error":       return { icon: AlertCircle,     color: "text-red-500",    bg: "bg-red-500/10" };
    case "info":
    default:            return { icon: Info,            color: "text-primary",    bg: "bg-primary/10" };
  }
};

const timeAgo = (dateStr) => {
  if (!dateStr) return "";
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const { toggleSidebar, notifications, unreadCount, markNotificationRead, markAllNotificationsRead, clearNotifications, fetchNotifications } = useApp();
  const navigate = useNavigate();

  const [showProfileMenu,  setShowProfileMenu]  = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCreateMenu,   setShowCreateMenu]   = useState(false);

  const profileRef = useRef(null);
  const notifRef   = useRef(null);
  const createRef  = useRef(null);

  // Close all dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfileMenu(false);
      if (notifRef.current   && !notifRef.current.contains(e.target))   setShowNotifications(false);
      if (createRef.current  && !createRef.current.contains(e.target))  setShowCreateMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setShowProfileMenu(false);
  };

  const handleNotifClick = useCallback((notif) => {
    markNotificationRead(notif._id);
    setShowNotifications(false);
    if (notif.link) navigate(notif.link);
  }, [markNotificationRead, navigate]);

  const handleBellClick = () => {
    setShowNotifications((prev) => {
      if (!prev) fetchNotifications(); // refresh on open
      return !prev;
    });
  };

  return (
    <header className="sticky top-0 z-40 h-16 border-b bg-card/80 backdrop-blur-xl border-border">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">

        {/* Left: Hamburger + Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="p-2 transition-colors rounded-lg hover:bg-muted lg:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>

          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center shadow-md w-9 h-9 rounded-xl gradient-primary">
              <span className="text-lg font-bold text-primary-foreground">S</span>
            </div>
            <span className="hidden text-xl font-bold sm:block font-heading gradient-text">
              Skillfinix
            </span>
          </Link>
        </div>

        {/* Center: Search */}
        <div className="justify-center flex-1 hidden max-w-2xl mx-8 md:flex">
          <SearchBar />
        </div>

        {/* Right: Create + Bell + Profile */}
        <div className="flex items-center gap-2">

          {/* ── CREATE DROPDOWN ── */}
          <div ref={createRef} className="relative">
            <button
              onClick={() => setShowCreateMenu(!showCreateMenu)}
              className="flex items-center gap-2 px-4 py-2 transition-all rounded-lg bg-primary/10 hover:bg-primary/20 text-primary"
              aria-label="Create"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden text-sm font-medium sm:inline">Create</span>
            </button>

            <AnimatePresence>
              {showCreateMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 z-50 w-56 py-2 mt-2 overflow-hidden border shadow-xl bg-popover rounded-xl border-border"
                >
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Create Content</p>
                  </div>

                  <Link
                    to="/studio/upload"
                    onClick={() => setShowCreateMenu(false)}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted group"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 group-hover:bg-primary/20">
                      <Upload className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Upload Course</p>
                      <p className="text-xs text-muted-foreground">Share your knowledge</p>
                    </div>
                  </Link>

                  {/* Go Live → /live-sessions */}
                  <Link
                    to="/live-sessions"
                    onClick={() => setShowCreateMenu(false)}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted group"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-500/10 group-hover:bg-red-500/20">
                      <Radio className="w-4 h-4 text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Go Live</p>
                      <p className="text-xs text-muted-foreground">Start live session</p>
                    </div>
                  </Link>

                  {/* New Playlist → /playlists */}
                  <Link
                    to="/playlists"
                    onClick={() => setShowCreateMenu(false)}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted group"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-500/10 group-hover:bg-green-500/20">
                      <ListPlus className="w-4 h-4 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">My Playlists</p>
                      <p className="text-xs text-muted-foreground">Organize courses</p>
                    </div>
                  </Link>

                  <div className="h-px my-2 bg-border" />

                  <Link
                    to="/studio"
                    onClick={() => setShowCreateMenu(false)}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted group"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20">
                      <GraduationCap className="w-4 h-4 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Creator Studio</p>
                      <p className="text-xs text-muted-foreground">Manage your content</p>
                    </div>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── NOTIFICATIONS ── */}
          <div ref={notifRef} className="relative">
            <button
              onClick={handleBellClick}
              className="relative p-2 transition-colors rounded-lg hover:bg-muted"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-foreground" />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs font-medium flex items-center justify-center"
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </motion.span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 z-50 mt-2 overflow-hidden border shadow-xl w-96 bg-card rounded-xl border-border"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <h3 className="font-semibold font-heading text-foreground flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      Notifications
                      {unreadCount > 0 && (
                        <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
                          {unreadCount} new
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center gap-1">
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllNotificationsRead}
                          className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 px-2 py-1 rounded hover:bg-muted"
                          title="Mark all as read"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          All read
                        </button>
                      )}
                      {notifications.length > 0 && (
                        <button
                          onClick={() => { clearNotifications(); }}
                          className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1 px-2 py-1 rounded hover:bg-muted"
                          title="Clear all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* List */}
                  <div className="overflow-y-auto max-h-80">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-10 text-center text-muted-foreground">
                        <Bell className="w-10 h-10 mx-auto mb-3 opacity-20" />
                        <p className="text-sm font-medium">You're all caught up!</p>
                        <p className="text-xs mt-1 opacity-70">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map((notif) => {
                        const meta = notifMeta(notif.type);
                        const Icon = meta.icon;
                        return (
                          <button
                            key={notif._id}
                            onClick={() => handleNotifClick(notif)}
                            className={cn(
                              "w-full px-4 py-3 hover:bg-muted transition-colors text-left border-l-2 group",
                              !notif.read ? "bg-accent/20 border-primary" : "border-transparent"
                            )}
                          >
                            <div className="flex items-start gap-3">
                              <div className={cn("w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center", meta.bg)}>
                                <Icon className={cn("w-4 h-4", meta.color)} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground line-clamp-1">{notif.title}</p>
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
                                <p className="text-xs text-muted-foreground/60 mt-1">{timeAgo(notif.createdAt)}</p>
                              </div>
                              {!notif.read && (
                                <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                              )}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div className="border-t border-border px-4 py-2">
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="text-xs text-primary hover:underline w-full text-center"
                      >
                        Close
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── PROFILE DROPDOWN ── */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1 transition-colors rounded-xl hover:bg-muted"
            >
              <img
                src={getAvatarUrl(user?.avatar, user?.name)}
                alt={user?.name || "User"}
                className="object-cover w-8 h-8 rounded-lg"
                onError={(e) => { e.target.onerror = null; e.target.src = getDefaultAvatar(user?.name); }}
              />
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform hidden sm:block",
                  showProfileMenu && "rotate-180"
                )}
              />
            </button>

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 z-50 w-64 mt-2 overflow-hidden border shadow-xl bg-card rounded-xl border-border"
                >
                  <div className="px-4 py-3 border-b border-border">
                    <div className="flex items-center gap-3">
                      <img
                        src={getAvatarUrl(user?.avatar, user?.name)}
                        alt={user?.name || "User"}
                        className="object-cover w-10 h-10 rounded-lg"
                        onError={(e) => { e.target.onerror = null; e.target.src = getDefaultAvatar(user?.name); }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-foreground">{user?.name}</p>
                        <p className="text-xs truncate text-muted-foreground">{user?.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="py-1">
                    {[
                      { to: "/profile",      icon: User,          label: "Your Profile" },
                      { to: "/achievements", icon: Trophy,         label: "Achievements" },
                      { to: "/studio",       icon: GraduationCap, label: "Creator Studio" },
                      { to: "/settings",     icon: Settings,      label: "Settings" },
                    ].map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors"
                      >
                        <item.icon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">{item.label}</span>
                      </Link>
                    ))}
                  </div>

                  <div className="py-1 border-t border-border">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors text-destructive"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm">Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default React.memo(Navbar);