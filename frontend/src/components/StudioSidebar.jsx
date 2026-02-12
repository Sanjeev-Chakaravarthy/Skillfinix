// src/components/StudioSidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, PlaySquare, BarChart2, MessageSquare, 
  Settings, ArrowLeft 
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const StudioSidebar = () => {
  const location = useLocation();
  const { user } = useAuth();

  // Helper function to generate a default avatar
  const getDefaultAvatar = (name) => {
    if (!name) return "https://ui-avatars.com/api/?name=User&background=6366f1&color=fff&size=200&bold=true";
    const encodedName = encodeURIComponent(name);
    return `https://ui-avatars.com/api/?name=${encodedName}&background=6366f1&color=fff&size=200&bold=true`;
  };

  // Helper function to get proper avatar URL (works with Cloudinary)
  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return getDefaultAvatar(user?.name);
    // If it's a full URL (Cloudinary, Google OAuth, etc.), use it directly
    if (avatarPath.startsWith("http")) return avatarPath;
    // Otherwise, return default
    return getDefaultAvatar(user?.name);
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/studio" },
    { icon: PlaySquare, label: "Content", path: "/studio/content" },
    { icon: BarChart2, label: "Analytics", path: "/studio/analytics" },
    { icon: MessageSquare, label: "Comments", path: "/studio/comments" },
    { icon: Settings, label: "Settings", path: "/studio/settings" },
  ];

  return (
    <aside className="fixed top-0 left-0 z-40 flex-col hidden w-64 h-screen border-r border-border bg-card lg:flex">
      {/* Studio Header */}
      <div className="flex items-center h-16 px-6 border-b border-border">
        <Link to="/" className="flex items-center gap-2 transition-colors text-muted-foreground hover:text-primary">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back to Skillfinix</span>
        </Link>
      </div>

      {/* Creator Profile Snippet */}
      <div className="flex flex-col items-center p-6 text-center border-b border-border">
        <img 
            src={getAvatarUrl(user?.avatar)} 
            alt={user?.name || "Creator"} 
            className="object-cover w-24 h-24 mb-3 border-4 rounded-full border-muted"
            onError={(e) => {
              console.error('❌ StudioSidebar avatar load error');
              e.target.onerror = null;
              e.target.src = getDefaultAvatar(user?.name);
            }}
        />
        <h3 className="font-bold text-foreground font-heading">Your Channel</h3>
        <p className="text-sm text-muted-foreground">{user?.name || "Creator"}</p>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border-l-4",
                isActive 
                  ? "bg-primary/10 text-primary border-primary" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground border-transparent"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
         <p className="text-xs text-center text-muted-foreground">Skillfinix Studio © 2026</p>
      </div>
    </aside>
  );
};

export default StudioSidebar;