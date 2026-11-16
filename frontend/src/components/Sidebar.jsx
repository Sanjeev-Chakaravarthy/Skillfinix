import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Search,
  Repeat,
  MessageSquare,
  History,
  BookOpen,
  Heart,
  Trophy,
  ListVideo,
  Video,
  Clock,
  ThumbsUp,
  Compass,
  TrendingUp,
  Radio,
  Play,
  PlusCircle,
  ChevronDown,
  X,
  HelpCircle,
  Globe,
  Users,
  Layers,
  ArrowLeftRight,
  Code2,
  Server,
  Brain,
  Palette,
  Cpu,
  Music,
  Dumbbell,
  Briefcase,
  Camera,
  BarChart2,
  Mic2,
  ChefHat,
  Shield,
  Smartphone,
  Flame,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/api/axios";

import { resolveAvatarUrl } from "@/lib/avatar";

// Avatar helper (Hallmark clean atelier stamp)
const getAvatarUrl = (user) => {
  return resolveAvatarUrl(user?.avatar, user?.name);
};

// Map icon-name strings (stored in DB) to Lucide components
const ICON_MAP = {
  Code2,
  Server,
  Brain,
  Palette,
  Cpu,
  BarChart2,
  Smartphone,
  Shield,
  Music,
  Dumbbell,
  Globe,
  Briefcase,
  Mic2,
  Camera,
  TrendingUp,
  Video,
  ChefHat,
  BookOpen,
  Users,
  Layers,
  Flame,
};
const resolveIcon = (name) => ICON_MAP[name] || Layers;

const navSections = [
  {
    title: "Core",
    items: [
      { icon: Home, label: "Home", path: "/" },
      { icon: Search, label: "Skill Hunt", path: "/skill-hunt" },
      { icon: Repeat, label: "Barters", path: "/barters" },
      { icon: MessageSquare, label: "SkillChat", path: "/skill-chat" },
    ],
  },
  {
    title: "Workspace",
    collapsible: true,
    items: [
      { icon: History, label: "History", path: "/history" },
      { icon: BookOpen, label: "My Courses", path: "/my-courses" },
      { icon: Heart, label: "Favorites", path: "/favorites" },
      { icon: Trophy, label: "Achievements", path: "/achievements" },
      { icon: ListVideo, label: "Playlists", path: "/playlists" },
      { icon: Video, label: "Videos", path: "/videos" },
      { icon: Clock, label: "Watch Later", path: "/watch-later" },
      { icon: ThumbsUp, label: "Liked Content", path: "/liked" },
    ],
  },
];

const Sidebar = () => {
  const { sidebarOpen, setSidebarOpen } = useApp();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [expandedSections, setExpandedSections] = useState([
    "Workspace",
    "Recent Courses",
    "Recent Swaps",
  ]);
  const [exploreOpen, setExploreOpen] = useState(false);

  // Dynamic data
  const [recentCourses, setRecentCourses] = useState([]);
  const [recentSwaps, setRecentSwaps] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      try {
        setLoading(true);
        const [coursesRes, chatsRes, catsRes] = await Promise.all([
          api.get("/enrollments/recent?limit=3"),
          api.get("/chat/conversations"),
          api.get("/categories"),
        ]);
        setRecentCourses(coursesRes.data || []);
        setRecentSwaps(chatsRes.data?.slice(0, 3) || []);
        setCategories(catsRes.data || []);
      } catch (e) {
        console.error("Sidebar fetch error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user]);

  const toggleSection = (title) =>
    setExpandedSections((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const discoverActive = [
    "/trending",
    "/live-sessions",
    "/my-swaps",
    "/communities",
    "/skill-hunt",
  ].some((p) => location.pathname.startsWith(p));

  const handleCategoryNav = (catName) => {
    setSidebarOpen(false);
    navigate(`/skill-hunt?category=${encodeURIComponent(catName)}`);
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-foreground/40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <aside
        className={cn(
          "w-[240px] min-w-[240px] max-w-[240px] flex-shrink-0 z-40 h-full bg-card border-r border-border flex flex-col lg:static lg:translate-x-0",
          mounted ? "transition-transform duration-300 ease-out motion-reduce:transition-none" : "",
          sidebarOpen
            ? "fixed inset-y-0 left-0 translate-x-0 shadow-lg"
            : "fixed inset-y-0 left-0 -translate-x-full"
        )}
      >
        {/* Mobile Close Button */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute p-1.5 rounded-lg top-4 right-4 text-muted-foreground hover:bg-muted hover:text-foreground active:translate-y-px disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-primary lg:hidden"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>

        <nav className="h-full py-4 overflow-y-auto scrollbar-thin px-2 space-y-4">
          {/* Static Core & Workspace Sections */}
          {navSections.map((section, si) => (
            <div key={si} className="space-y-1">
              {section.title && (
                <div className="flex items-center justify-between px-3 py-1">
                  <button
                    onClick={() => section.collapsible && toggleSection(section.title)}
                    className="flex items-center gap-1 text-xs font-semibold transition-colors text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    {section.title}
                    {section.collapsible && (
                      <motion.span
                        animate={{
                          rotate: expandedSections.includes(section.title) ? 0 : -90,
                        }}
                        transition={{ duration: 0.15 }}
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </motion.span>
                    )}
                  </button>
                </div>
              )}

              <AnimatePresence initial={false}>
                {(!section.collapsible ||
                  !section.title ||
                  expandedSections.includes(section.title)) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden space-y-0.5"
                  >
                    {section.items.map((item) => {
                      const active = isActive(item.path);
                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          onClick={() => setSidebarOpen(false)}
                          className={cn(
                            "relative flex items-center gap-3 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-primary",
                            active
                              ? "bg-primary/10 text-primary font-semibold shadow-xs"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                          )}
                        >
                          {/* Active left accent bar */}
                          {active && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-primary" />
                          )}
                          <item.icon
                            className={cn(
                              "h-4 w-4 flex-shrink-0 transition-colors",
                              active ? "text-primary" : "text-muted-foreground"
                            )}
                          />
                          <span className="truncate">{item.label}</span>
                        </NavLink>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mx-2 my-2 border-t border-border/60" />
            </div>
          ))}

          {/* ── DISCOVER SECTION ───────────────────────────────────────── */}
          <div className="space-y-1">
            <div className="px-3 py-1">
              <span className="text-xs font-semibold text-muted-foreground">
                Discover
              </span>
            </div>

            <button
              onClick={() => setExploreOpen((o) => !o)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-primary",
                exploreOpen || discoverActive
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Compass className="h-4 w-4 flex-shrink-0 text-primary" />
              <span className="flex-1 text-left">Explore Network</span>
              <motion.span
                animate={{ rotate: exploreOpen ? 180 : 0 }}
                transition={{ duration: 0.15 }}
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {exploreOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-hidden pl-3 border-l-2 border-primary/20 ml-4 space-y-0.5 mt-1"
                >
                  <NavLink
                    to="/skill-hunt"
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors",
                      isActive("/skill-hunt")
                        ? "text-primary font-semibold bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    )}
                  >
                    <Search className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                    Skill Hunt
                  </NavLink>

                  <NavLink
                    to="/live-sessions"
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors",
                      isActive("/live-sessions")
                        ? "text-primary font-semibold bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    )}
                  >
                    <Radio className="h-3.5 w-3.5 text-destructive flex-shrink-0" />
                    Live Sessions
                  </NavLink>

                  <NavLink
                    to="/trending"
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors",
                      isActive("/trending")
                        ? "text-primary font-semibold bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    )}
                  >
                    <TrendingUp className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" />
                    Trending Skills
                  </NavLink>

                  <NavLink
                    to="/my-swaps"
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors",
                      isActive("/my-swaps")
                        ? "text-primary font-semibold bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    )}
                  >
                    <ArrowLeftRight className="h-3.5 w-3.5 text-teach flex-shrink-0" />
                    My Swaps
                  </NavLink>

                  <NavLink
                    to="/communities"
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors",
                      isActive("/communities")
                        ? "text-primary font-semibold bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    )}
                  >
                    <Globe className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                    Communities
                  </NavLink>

                  {/* Dynamic Categories */}
                  {categories.length > 0 && (
                    <>
                      <div className="pt-2 pb-1 px-2.5 text-xs font-semibold text-muted-foreground">
                        Categories
                      </div>
                      {categories.map((cat) => {
                        const IconComp = resolveIcon(cat.icon);
                        return (
                          <button
                            key={cat._id || cat.name}
                            onClick={() => handleCategoryNav(cat.name)}
                            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors focus-visible:outline-2 focus-visible:outline-primary"
                          >
                            <IconComp
                              className="h-3.5 w-3.5 flex-shrink-0 text-primary"
                            />
                            <span className="truncate">{cat.name}</span>
                          </button>
                        );
                      })}
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mx-2 my-2 border-t border-border/60" />
          </div>

          {/* ── RECENT COURSES ─────────────────────────────────────────── */}
          {recentCourses.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between px-3 py-1">
                <button
                  onClick={() => toggleSection("Recent Courses")}
                  className="flex items-center gap-1 text-xs font-semibold transition-colors text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
                >
                  Recent courses
                  <motion.span
                    animate={{
                      rotate: expandedSections.includes("Recent Courses") ? 0 : -90,
                    }}
                    transition={{ duration: 0.15 }}
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </motion.span>
                </button>
                <NavLink
                  to="/my-courses"
                  className="text-[11px] font-semibold text-primary hover:underline"
                >
                  All
                </NavLink>
              </div>

              <AnimatePresence initial={false}>
                {expandedSections.includes("Recent Courses") && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden space-y-0.5"
                  >
                    {recentCourses.map((course) => (
                      <NavLink
                        key={course._id}
                        to={`/courses/${course._id}`}
                        onClick={() => setSidebarOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-primary"
                      >
                        <BookOpen className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="truncate">{course.title}</span>
                          {typeof course.progress === "number" && (
                            <div className="w-full h-1 mt-1 rounded-full bg-muted">
                              <div
                                className="h-1 rounded-full bg-primary"
                                style={{ width: `${course.progress}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </NavLink>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mx-2 my-2 border-t border-border/60" />
            </div>
          )}

          {/* ── RECENT SWAPS ───────────────────────────────────────────── */}
          {recentSwaps.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between px-3 py-1">
                <button
                  onClick={() => toggleSection("Recent Swaps")}
                  className="flex items-center gap-1 text-xs font-semibold transition-colors text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
                >
                  Recent swaps
                  <motion.span
                    animate={{
                      rotate: expandedSections.includes("Recent Swaps") ? 0 : -90,
                    }}
                    transition={{ duration: 0.15 }}
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </motion.span>
                </button>
                <NavLink
                  to="/barters"
                  className="text-xs font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary"
                >
                  Find
                </NavLink>
              </div>

              <AnimatePresence initial={false}>
                {expandedSections.includes("Recent Swaps") && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden space-y-0.5"
                  >
                    {recentSwaps.map((chat) => (
                      <NavLink
                        key={chat.user._id}
                        to="/skill-chat"
                        state={{
                          selectedUserId: chat.user._id,
                          selectedUserData: chat.user,
                        }}
                        onClick={() => setSidebarOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-primary"
                      >
                        <img
                          src={getAvatarUrl(chat.user)}
                          alt={chat.user.name}
                          className="w-5 h-5 rounded-full object-cover shrink-0"
                        />
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="truncate">{chat.user.name}</span>
                          <span className="text-[10px] text-muted-foreground truncate">
                            {chat.lastMessage?.text || "Attachment"}
                          </span>
                        </div>
                      </NavLink>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mx-2 my-2 border-t border-border/60" />
            </div>
          )}

          {/* Quick Help Link */}
          <div className="px-2 pt-2">
            <NavLink
              to="/support"
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-primary",
                isActive("/support") ? "bg-primary/10 text-primary font-bold" : ""
              )}
            >
              <HelpCircle className="h-4 w-4" />
              <span>Help & Support</span>
            </NavLink>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
