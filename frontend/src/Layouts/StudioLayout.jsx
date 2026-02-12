// src/layouts/StudioLayout.jsx
import React, { useState, useRef, useEffect } from "react";
import { Outlet } from "react-router-dom"; // IMPORTANT: Import Outlet
import StudioSidebar from "@/components/StudioSidebar";
import { Link } from "react-router-dom";
import { Plus, Upload, Radio, FileEdit, ListPlus, GraduationCap } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const StudioLayout = () => {  // Remove children prop
  const { user } = useAuth();
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const menuRef = useRef(null);

  // Helper function to generate a default avatar
  const getDefaultAvatar = (name) => {
    if (!name) return "https://ui-avatars.com/api/?name=User&background=6366f1&color=fff&size=200&bold=true";
    const encodedName = encodeURIComponent(name);
    return `https://ui-avatars.com/api/?name=${encodedName}&background=6366f1&color=fff&size=200&bold=true`;
  };

  // Helper function to get proper avatar URL (works with Cloudinary)
  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return getDefaultAvatar(user?.name);
    if (avatarPath.startsWith("http")) return avatarPath; // Cloudinary, Google OAuth, etc.
    return getDefaultAvatar(user?.name);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowCreateMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      {/* The Creator Sidebar */}
      <StudioSidebar />
      
      <div className="flex flex-col flex-1 min-h-screen lg:ml-64">
        {/* Studio Navbar */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 border-b border-border bg-card/80 backdrop-blur">
           <div className="flex items-center gap-3">
             <GraduationCap className="w-6 h-6 text-primary" />
             <h1 className="text-xl font-bold font-heading text-foreground">Creator Studio</h1>
           </div>
           
           <div className="flex items-center gap-4">
              
              {/* STUDIO "CREATE" BUTTON (With Enhanced Dropdown) */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowCreateMenu(!showCreateMenu)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all rounded-lg shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20"
                >
                  <Plus className="w-4 h-4"/>
                  <span>CREATE</span>
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Profile Pic */}
              <Link to="/profile">
                <img 
                   src={getAvatarUrl(user?.avatar)} 
                   className="object-cover w-8 h-8 transition-all border rounded-full border-border hover:ring-2 hover:ring-primary/50" 
                   alt={user?.name || "Profile"}
                   onError={(e) => {
                     e.target.onerror = null;
                     e.target.src = getDefaultAvatar(user?.name);
                   }}
                />
              </Link>
           </div>
        </header>

        {/* Main Content Area - CRITICAL: Use Outlet instead of children */}
        <main className="flex-1 p-6 bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudioLayout;