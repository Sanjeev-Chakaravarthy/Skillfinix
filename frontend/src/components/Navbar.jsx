// src/components/Navbar.jsx
import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell, Plus, Menu, User, Settings, LogOut, ChevronDown,
  Video, Upload, Radio, FileEdit, ListPlus, BookOpen, GraduationCap
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import SearchBar from "./SearchBar";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const { user, logout } = useAuth();
  const {
    toggleSidebar,
    notifications,
    unreadCount,
    markNotificationRead,
  } = useApp();
  const navigate = useNavigate();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const createRef = useRef(null);

  // Helper function to generate a default avatar
  const getDefaultAvatar = (name) => {
    if (!name) return "https://ui-avatars.com/api/?name=User&background=6366f1&color=fff&size=200&bold=true";
    const encodedName = encodeURIComponent(name);
    return `https://ui-avatars.com/api/?name=${encodedName}&background=6366f1&color=fff&size=200&bold=true`;
  };

  // Helper to resolve avatar URL (works with Cloudinary)
  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return getDefaultAvatar(user?.name);
    // If it's a full URL (Cloudinary, Google OAuth, etc.), use it directly
    if (avatarPath.startsWith("http")) return avatarPath;
    // Otherwise, return default
    return getDefaultAvatar(user?.name);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (createRef.current && !createRef.current.contains(event.target)) {
        setShowCreateMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setShowProfileMenu(false);
  };

  return (
    <header className="sticky top-0 z-40 h-16 border-b bg-card/80 backdrop-blur-xl border-border">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="p-2 transition-colors rounded-lg hover:bg-muted lg:hidden"
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

        {/* Center - Search */}
        <div className="justify-center flex-1 hidden max-w-2xl mx-8 md:flex">
          <SearchBar />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          
          {/* CREATE BUTTON WITH DROPDOWN */}
          <div ref={createRef} className="relative">
            <button
              onClick={() => setShowCreateMenu(!showCreateMenu)}
              className="flex items-center gap-2 px-4 py-2 transition-all rounded-lg bg-primary/10 hover:bg-primary/20 text-primary group"
              title="Create"
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

                  <button 
                    className="flex items-center w-full gap-3 px-4 py-3 transition-colors hover:bg-muted group"
                    onClick={() => setShowCreateMenu(false)}
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-500/10 group-hover:bg-red-500/20">
                      <Radio className="w-4 h-4 text-red-500" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-foreground">Go Live</p>
                      <p className="text-xs text-muted-foreground">Start live session</p>
                    </div>
                  </button>

                  <button 
                    className="flex items-center w-full gap-3 px-4 py-3 transition-colors hover:bg-muted group"
                    onClick={() => setShowCreateMenu(false)}
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20">
                      <FileEdit className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-foreground">New Post</p>
                      <p className="text-xs text-muted-foreground">Share an update</p>
                    </div>
                  </button>

                  <button 
                    className="flex items-center w-full gap-3 px-4 py-3 transition-colors hover:bg-muted group"
                    onClick={() => setShowCreateMenu(false)}
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-500/10 group-hover:bg-green-500/20">
                      <ListPlus className="w-4 h-4 text-green-500" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-foreground">New Playlist</p>
                      <p className="text-xs text-muted-foreground">Organize courses</p>
                    </div>
                  </button>

                  <div className="h-px my-2 bg-border" />

                  <Link
                    to="/studio"
                    onClick={() => setShowCreateMenu(false)}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted group"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20">
                      <GraduationCap className="w-4 h-4 text-purple-500" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-foreground">Creator Studio</p>
                      <p className="text-xs text-muted-foreground">Manage your content</p>
                    </div>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 transition-colors rounded-lg hover:bg-muted"
            >
              <Bell className="w-5 h-5 text-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs font-medium flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 z-50 mt-2 overflow-hidden border shadow-xl w-80 bg-card rounded-xl border-border"
                >
                  <div className="px-4 py-3 border-b border-border">
                    <h3 className="font-semibold font-heading text-foreground">Notifications</h3>
                  </div>
                  <div className="overflow-y-auto max-h-80">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-muted-foreground">
                        <Bell className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <button
                          key={notif._id}
                          onClick={() => markNotificationRead(notif._id)}
                          className={cn(
                            "w-full px-4 py-3 hover:bg-muted transition-colors text-left border-l-2",
                            !notif.read ? "bg-accent/30 border-primary" : "border-transparent"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={cn(
                                "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                                notif.type === "success" && "bg-success",
                                notif.type === "info" && "bg-info",
                                notif.type === "warning" && "bg-warning",
                                notif.type === "error" && "bg-destructive"
                              )}
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground">{notif.title}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{notif.message}</p>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Dropdown */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1 transition-colors rounded-xl hover:bg-muted"
            >
              <img
                src={getAvatarUrl(user?.avatar)}
                alt={user?.name || "User"}
                className="object-cover w-8 h-8 rounded-lg"
                onError={(e) => {
                  console.error('❌ Navbar avatar load error');
                  e.target.onerror = null;
                  e.target.src = getDefaultAvatar(user?.name);
                }}
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
                        src={getAvatarUrl(user?.avatar)}
                        alt={user?.name || "User"}
                        className="object-cover w-10 h-10 rounded-lg"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = getDefaultAvatar(user?.name);
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-foreground">{user?.name}</p>
                        <p className="text-xs truncate text-muted-foreground">{user?.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors"
                    >
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">Your Profile</span>
                    </Link>
                    <Link
                      to="/studio"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors"
                    >
                      <GraduationCap className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">Creator Studio</span>
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors"
                    >
                      <Settings className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">Settings</span>
                    </Link>
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

export default Navbar;