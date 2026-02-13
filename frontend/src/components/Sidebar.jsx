import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
  Send,
  Loader2,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import api from "@/api/axios";

// Helper for dynamic avatars
const getAvatarUrl = (user) => {
  if (user?.avatar) return user.avatar;
  const name = user?.name || "User";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&size=200&bold=true`;
};

const navSections = [
  {
    items: [
      { icon: Home, label: 'Home', path: '/' },
      { icon: Search, label: 'Skill Hunt', path: '/skill-hunt' },
      { icon: Repeat, label: 'Barters', path: '/barters' },
      { icon: MessageSquare, label: 'SkillChat', path: '/skill-chat' },
    ],
  },
  {
    title: 'You',
    collapsible: true,
    items: [
      { icon: History, label: 'History', path: '/history' },
      { icon: BookOpen, label: 'My Courses', path: '/my-courses' },
      { icon: Heart, label: 'Favorites', path: '/favorites' },
      { icon: Trophy, label: 'Achievements', path: '/achievements' },
      { icon: ListVideo, label: 'Playlists', path: '/playlists' },
      { icon: Video, label: 'Videos', path: '/videos' },
      { icon: Clock, label: 'Watch Later', path: '/watch-later' },
      { icon: ThumbsUp, label: 'Liked Content', path: '/liked' },
    ],
  },
  {
    title: 'Discover',
    collapsible: true,
    items: [
      { icon: Compass, label: 'Explore', path: '/explore' },
      { icon: TrendingUp, label: 'Trending', path: '/trending' },
      { icon: Radio, label: 'Live Sessions', path: '/live' },
    ],
  },
];

const Sidebar = () => {
  const { sidebarOpen, setSidebarOpen } = useApp();
  const { user } = useAuth();
  const location = useLocation();
  const [expandedSections, setExpandedSections] = React.useState([
    'You',
    'Discover',
    'Recent Courses',
    'Recent Swaps'
  ]);
  
  // Real Data State
  const [recentCourses, setRecentCourses] = useState([]);
  const [recentSwaps, setRecentSwaps] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Sidebar Data
  useEffect(() => {
    if (!user) return;

    const fetchSidebarData = async () => {
      try {
        setLoading(true);
        const [coursesRes, chatsRes] = await Promise.all([
          api.get('/enrollments/recent?limit=3'),
          api.get('/chat/conversations')
        ]);

        setRecentCourses(coursesRes.data || []);
        // Take top 3 recent conversations
        setRecentSwaps(chatsRes.data?.slice(0, 3) || []);
      } catch (error) {
        console.error("Sidebar data fetch failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSidebarData();
  }, [user]);

  const toggleSection = (title) => {
    setExpandedSections((prev) =>
      prev.includes(title)
        ? prev.filter((t) => t !== title)
        : [...prev, title]
    );
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
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
            className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-16 bottom-0 z-40 w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Mobile Close Button */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute p-1 rounded-lg top-4 right-4 hover:bg-muted lg:hidden"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        <nav className="h-full py-4 overflow-y-auto scrollbar-thin">
          {/* Static Sections */}
          {navSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-4">
              {section.title && (
                <div className="flex items-center justify-between px-4 py-2">
                  <button
                    onClick={() =>
                      section.collapsible && toggleSection(section.title)
                    }
                    className="flex items-center gap-1 text-xs font-semibold tracking-wider uppercase transition-colors text-muted-foreground hover:text-foreground"
                  >
                    {section.title}

                    {section.collapsible && (
                      <motion.span
                        animate={{
                          rotate: expandedSections.includes(section.title)
                            ? 0
                            : -90,
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-4 h-4" />
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
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <ul className="space-y-0.5 px-2">
                      {section.items.map((item) => (
                        <li key={item.path}>
                          <NavLink
                            to={item.path}
                            onClick={() => setSidebarOpen(false)}
                            className={cn(
                              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                              isActive(item.path)
                                ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                                : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                            )}
                          >
                            <item.icon
                              className={cn(
                                'h-5 w-5 flex-shrink-0 transition-colors',
                                isActive(item.path) ? 'text-primary' : ''
                              )}
                            />
                            <div className="flex flex-col flex-1">
                              <span>{item.label}</span>
                            </div>
                            {isActive(item.path) && (
                              <motion.div
                                layoutId="activeIndicator"
                                className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                              />
                            )}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="mx-4 my-3 border-t border-sidebar-border" />
            </div>
          ))}

          {/* DYNAMIC SECTION: Recent Courses */}
          {recentCourses.length > 0 && (
            <div className="mb-4">
               <div className="flex items-center justify-between px-4 py-2">
                  <button
                    onClick={() => toggleSection('Recent Courses')}
                    className="flex items-center gap-1 text-xs font-semibold tracking-wider uppercase transition-colors text-muted-foreground hover:text-foreground"
                  >
                    Recent Courses
                    <motion.span
                        animate={{ rotate: expandedSections.includes('Recent Courses') ? 0 : -90 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-4 h-4" />
                    </motion.span>
                  </button>
                  <NavLink to="/my-courses" className="text-xs font-medium text-primary hover:underline">
                      View all
                  </NavLink>
               </div>

               <AnimatePresence initial={false}>
                {expandedSections.includes('Recent Courses') && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <ul className="space-y-0.5 px-2">
                      {recentCourses.map((course) => (
                        <li key={course._id}>
                          <NavLink
                            to={`/courses/${course._id}`}
                            onClick={() => setSidebarOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                          >
                            <BookOpen className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                            <div className="flex flex-col flex-1 min-w-0">
                              <span className="truncate">{course.title}</span>
                              {typeof course.progress === 'number' && (
                                <div className="w-full h-1 mt-1 rounded-full bg-muted">
                                  <div
                                    className="h-1 transition-all rounded-full bg-primary"
                                    style={{ width: `${course.progress}%` }}
                                  />
                                </div>
                              )}
                            </div>
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
               </AnimatePresence>
               <div className="mx-4 my-3 border-t border-sidebar-border" />
            </div>
          )}

          {/* DYNAMIC SECTION: Recent Swaps */}
          {recentSwaps.length > 0 && (
            <div className="mb-4">
               <div className="flex items-center justify-between px-4 py-2">
                  <button
                    onClick={() => toggleSection('Recent Swaps')}
                    className="flex items-center gap-1 text-xs font-semibold tracking-wider uppercase transition-colors text-muted-foreground hover:text-foreground"
                  >
                    Recent Swaps
                    <motion.span
                        animate={{ rotate: expandedSections.includes('Recent Swaps') ? 0 : -90 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-4 h-4" />
                    </motion.span>
                  </button>
                  <NavLink to="/barters" className="text-xs font-medium text-primary hover:underline">
                      Find more
                  </NavLink>
               </div>

               <AnimatePresence initial={false}>
                {expandedSections.includes('Recent Swaps') && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <ul className="space-y-0.5 px-2">
                      {recentSwaps.map((chat) => (
                        <li key={chat.user._id}>
                          <NavLink
                            to="/skill-chat"
                            state={{ selectedUserId: chat.user._id, selectedUserData: chat.user }}
                            onClick={() => setSidebarOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                          >
                             <img 
                                src={getAvatarUrl(chat.user)} 
                                alt={chat.user.name}
                                className="w-6 h-6 rounded-full object-cover shrink-0"
                             />
                            <div className="flex flex-col flex-1 min-w-0">
                              <span className="truncate">{chat.user.name}</span>
                              <span className="text-[10px] text-muted-foreground truncate">
                                {chat.lastMessage?.text || "Attachment"}
                              </span>
                            </div>
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
               </AnimatePresence>
               <div className="mx-4 my-3 border-t border-sidebar-border" />
            </div>
          )}

          {/* Static Bottom Sections */}
          <div className="mb-4">
             <div className="flex items-center justify-between px-4 py-2">
                <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">Quick Actions</span>
             </div>
             <ul className="space-y-0.5 px-2">
                <li>
                   <NavLink to="/skill-hunt" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground">
                      <Play className="h-5 w-5 text-green-500" /> Start Learning
                   </NavLink>
                </li>
                <li>
                   <NavLink to="/studio/upload" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground">
                      <PlusCircle className="h-5 w-5 text-primary" /> Create New Course
                   </NavLink>
                </li>
             </ul>
             <div className="mx-4 my-3 border-t border-sidebar-border" />
          </div>

          <div className="mb-4">
             <div className="flex items-center justify-between px-4 py-2">
                <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">Help</span>
             </div>
             <ul className="space-y-0.5 px-2">
                <li>
                   <button onClick={() => alert('Help center coming soon!')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground text-left">
                      <HelpCircle className="h-5 w-5" /> Help & Support
                   </button>
                </li>
             </ul>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;