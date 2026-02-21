import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Home, Search, Repeat, MessageSquare, History, BookOpen,
  Heart, Trophy, ListVideo, Video, Clock, ThumbsUp, Compass,
  TrendingUp, Radio, Play, PlusCircle, ChevronDown, X,
  HelpCircle, Globe, Users, Layers, ArrowLeftRight, Code2,
  Server, Brain, Palette, Cpu, Music, Dumbbell, Briefcase,
  Camera, BarChart2, Mic2, ChefHat, Shield, Smartphone,
  Flame
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/api/axios';

// Avatar helper
const getAvatarUrl = (user) => {
  if (user?.avatar) return user.avatar;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=6366f1&color=fff&size=200&bold=true`;
};

// Map icon-name strings (stored in DB) to Lucide components
const ICON_MAP = {
  Code2, Server, Brain, Palette, Cpu, BarChart2, Smartphone, Shield,
  Music, Dumbbell, Globe, Briefcase, Mic2, Camera, TrendingUp, Video,
  ChefHat, BookOpen, Users, Layers, Flame
};
const resolveIcon = (name) => ICON_MAP[name] || Layers;

// Static Nav sections (top + personal)
const navSections = [
  {
    items: [
      { icon: Home,          label: 'Home',      path: '/' },
      { icon: Search,        label: 'Skill Hunt', path: '/skill-hunt' },
      { icon: Repeat,        label: 'Barters',    path: '/barters' },
      { icon: MessageSquare, label: 'SkillChat',  path: '/skill-chat' },
    ],
  },
  {
    title: 'You',
    collapsible: true,
    items: [
      { icon: History,    label: 'History',       path: '/history' },
      { icon: BookOpen,   label: 'My Courses',    path: '/my-courses' },
      { icon: Heart,      label: 'Favorites',     path: '/favorites' },
      { icon: Trophy,     label: 'Achievements',  path: '/achievements' },
      { icon: ListVideo,  label: 'Playlists',     path: '/playlists' },
      { icon: Video,      label: 'Videos',        path: '/videos' },
      { icon: Clock,      label: 'Watch Later',   path: '/watch-later' },
      { icon: ThumbsUp,   label: 'Liked Content', path: '/liked' },
    ],
  },
];

const Sidebar = () => {
  const { sidebarOpen, setSidebarOpen } = useApp();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [expandedSections, setExpandedSections] = useState(['You', 'Recent Courses', 'Recent Swaps']);
  const [exploreOpen, setExploreOpen] = useState(false);

  // Dynamic data
  const [recentCourses, setRecentCourses] = useState([]);
  const [recentSwaps, setRecentSwaps] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch sidebar data
  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      try {
        setLoading(true);
        const [coursesRes, chatsRes, catsRes] = await Promise.all([
          api.get('/enrollments/recent?limit=3'),
          api.get('/chat/conversations'),
          api.get('/categories'),
        ]);
        setRecentCourses(coursesRes.data || []);
        setRecentSwaps(chatsRes.data?.slice(0, 3) || []);
        setCategories(catsRes.data || []);
      } catch (e) {
        console.error('Sidebar fetch error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user]);

  const toggleSection = (title) =>
    setExpandedSections(prev =>
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const discoverActive = ['/trending', '/live-sessions', '/my-swaps', '/communities', '/skill-hunt'].some(p =>
    location.pathname.startsWith(p)
  );

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
            className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        'fixed left-0 top-16 bottom-0 z-40 w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Mobile Close */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute p-1 rounded-lg top-4 right-4 hover:bg-muted lg:hidden"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        <nav className="h-full py-4 overflow-y-auto scrollbar-thin">

          {/* Static sections */}
          {navSections.map((section, si) => (
            <div key={si} className="mb-4">
              {section.title && (
                <div className="flex items-center justify-between px-4 py-2">
                  <button
                    onClick={() => section.collapsible && toggleSection(section.title)}
                    className="flex items-center gap-1 text-xs font-semibold tracking-wider uppercase transition-colors text-muted-foreground hover:text-foreground"
                  >
                    {section.title}
                    {section.collapsible && (
                      <motion.span
                        animate={{ rotate: expandedSections.includes(section.title) ? 0 : -90 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </motion.span>
                    )}
                  </button>
                </div>
              )}

              <AnimatePresence initial={false}>
                {(!section.collapsible || !section.title || expandedSections.includes(section.title)) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <ul className="space-y-0.5 px-2">
                      {section.items.map(item => (
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
                            <item.icon className={cn('h-5 w-5 flex-shrink-0', isActive(item.path) ? 'text-primary' : '')} />
                            <span className="flex-1">{item.label}</span>
                            {isActive(item.path) && (
                              <motion.div layoutId="activeIndicator" className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
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

          {/* ============================================
              DISCOVER SECTION with Explore Dropdown
          ============================================ */}
          <div className="mb-4">
            <div className="px-4 py-2">
              <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">Discover</span>
            </div>
            <ul className="space-y-0.5 px-2">

              {/* Explore — Dropdown */}
              <li>
                <button
                  onClick={() => setExploreOpen(o => !o)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                    (exploreOpen || discoverActive)
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                  )}
                >
                  <Compass className="h-5 w-5 flex-shrink-0 text-primary" />
                  <span className="flex-1 text-left">Explore</span>
                  <motion.span animate={{ rotate: exploreOpen ? 180 : 0 }} transition={{ duration: 0.25 }}>
                    <ChevronDown className="w-4 h-4" />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {exploreOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <ul className="mt-1 ml-4 space-y-0.5 border-l-2 border-primary/20 pl-3">

                        {/* Skill Hunt */}
                        <li>
                          <NavLink to="/skill-hunt" onClick={() => setSidebarOpen(false)}
                            className={cn(
                              'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200',
                              isActive('/skill-hunt') ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'text-sidebar-foreground hover:bg-sidebar-accent/40'
                            )}>
                            <Search className="h-4 w-4 text-blue-500 flex-shrink-0" />
                            Skill Hunt
                          </NavLink>
                        </li>

                        {/* Live Sessions */}
                        <li>
                          <NavLink to="/live-sessions" onClick={() => setSidebarOpen(false)}
                            className={cn(
                              'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200',
                              isActive('/live-sessions') ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'text-sidebar-foreground hover:bg-sidebar-accent/40'
                            )}>
                            <Radio className="h-4 w-4 text-red-500 flex-shrink-0" />
                            Live Sessions
                          </NavLink>
                        </li>

                        {/* Trending */}
                        <li>
                          <NavLink to="/trending" onClick={() => setSidebarOpen(false)}
                            className={cn(
                              'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200',
                              isActive('/trending') ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'text-sidebar-foreground hover:bg-sidebar-accent/40'
                            )}>
                            <TrendingUp className="h-4 w-4 text-amber-500 flex-shrink-0" />
                            Trending Skills
                          </NavLink>
                        </li>

                        {/* My Swaps */}
                        <li>
                          <NavLink to="/my-swaps" onClick={() => setSidebarOpen(false)}
                            className={cn(
                              'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200',
                              isActive('/my-swaps') ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'text-sidebar-foreground hover:bg-sidebar-accent/40'
                            )}>
                            <ArrowLeftRight className="h-4 w-4 text-green-500 flex-shrink-0" />
                            My Swaps
                          </NavLink>
                        </li>

                        {/* Communities */}
                        <li>
                          <NavLink to="/communities" onClick={() => setSidebarOpen(false)}
                            className={cn(
                              'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200',
                              isActive('/communities') ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'text-sidebar-foreground hover:bg-sidebar-accent/40'
                            )}>
                            <Globe className="h-4 w-4 text-violet-500 flex-shrink-0" />
                            Communities
                          </NavLink>
                        </li>

                        {/* ── Dynamic Categories from DB ── */}
                        {categories.length > 0 && (
                          <>
                            <li>
                              <div className="pt-2 pb-1 px-3">
                                <span className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground">
                                  Categories
                                </span>
                              </div>
                            </li>
                            {categories.map((cat) => {
                              const IconComp = resolveIcon(cat.icon);
                              return (
                                <li key={cat._id || cat.name}>
                                  <button
                                    onClick={() => handleCategoryNav(cat.name)}
                                    className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent/40 hover:text-sidebar-accent-foreground transition-all duration-200"
                                  >
                                    <IconComp className="h-4 w-4 flex-shrink-0" style={{ color: cat.color || '#6366f1' }} />
                                    {cat.name}
                                  </button>
                                </li>
                              );
                            })}
                          </>
                        )}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            </ul>
            <div className="mx-4 my-3 border-t border-sidebar-border" />
          </div>

          {/* Dynamic: Recent Courses */}
          {recentCourses.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between px-4 py-2">
                <button onClick={() => toggleSection('Recent Courses')}
                  className="flex items-center gap-1 text-xs font-semibold tracking-wider uppercase transition-colors text-muted-foreground hover:text-foreground"
                >
                  Recent Courses
                  <motion.span animate={{ rotate: expandedSections.includes('Recent Courses') ? 0 : -90 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-4 h-4" />
                  </motion.span>
                </button>
                <NavLink to="/my-courses" className="text-xs font-medium text-primary hover:underline">View all</NavLink>
              </div>

              <AnimatePresence initial={false}>
                {expandedSections.includes('Recent Courses') && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <ul className="space-y-0.5 px-2">
                      {recentCourses.map(course => (
                        <li key={course._id}>
                          <NavLink to={`/courses/${course._id}`} onClick={() => setSidebarOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-sidebar-foreground hover:bg-sidebar-accent/50"
                          >
                            <BookOpen className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                            <div className="flex flex-col flex-1 min-w-0">
                              <span className="truncate">{course.title}</span>
                              {typeof course.progress === 'number' && (
                                <div className="w-full h-1 mt-1 rounded-full bg-muted">
                                  <div className="h-1 rounded-full bg-primary" style={{ width: `${course.progress}%` }} />
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

          {/* Dynamic: Recent Swaps / Chats */}
          {recentSwaps.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between px-4 py-2">
                <button onClick={() => toggleSection('Recent Swaps')}
                  className="flex items-center gap-1 text-xs font-semibold tracking-wider uppercase transition-colors text-muted-foreground hover:text-foreground"
                >
                  Recent Swaps
                  <motion.span animate={{ rotate: expandedSections.includes('Recent Swaps') ? 0 : -90 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-4 h-4" />
                  </motion.span>
                </button>
                <NavLink to="/barters" className="text-xs font-medium text-primary hover:underline">Find more</NavLink>
              </div>

              <AnimatePresence initial={false}>
                {expandedSections.includes('Recent Swaps') && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <ul className="space-y-0.5 px-2">
                      {recentSwaps.map(chat => (
                        <li key={chat.user._id}>
                          <NavLink
                            to="/skill-chat"
                            state={{ selectedUserId: chat.user._id, selectedUserData: chat.user }}
                            onClick={() => setSidebarOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-sidebar-foreground hover:bg-sidebar-accent/50"
                          >
                            <img src={getAvatarUrl(chat.user)} alt={chat.user.name} className="w-6 h-6 rounded-full object-cover shrink-0" />
                            <div className="flex flex-col flex-1 min-w-0">
                              <span className="truncate">{chat.user.name}</span>
                              <span className="text-[10px] text-muted-foreground truncate">{chat.lastMessage?.text || 'Attachment'}</span>
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

          {/* Quick Actions */}
          <div className="mb-4">
            <div className="px-4 py-2">
              <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">Quick Actions</span>
            </div>
            <ul className="space-y-0.5 px-2">
              <li>
                <NavLink to="/start-learning" onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                    isActive('/start-learning') ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm' : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                  )}>
                  <Play className="h-5 w-5 text-green-500" /> Start Learning
                </NavLink>
              </li>
              <li>
                <NavLink to="/my-swaps" onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                    isActive('/my-swaps') ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm' : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                  )}>
                  <ArrowLeftRight className="h-5 w-5 text-primary" /> My Skill Swaps
                </NavLink>
              </li>
              <li>
                <NavLink to="/studio/upload" onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-sidebar-foreground hover:bg-sidebar-accent/50"
                >
                  <PlusCircle className="h-5 w-5 text-primary" /> Create New Course
                </NavLink>
              </li>
            </ul>
            <div className="mx-4 my-3 border-t border-sidebar-border" />
          </div>

          {/* Help */}
          <div className="mb-4">
            <div className="px-4 py-2">
              <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">Help</span>
            </div>
            <ul className="space-y-0.5 px-2">
              <li>
                <NavLink to="/support" onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                    isActive('/support') ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm' : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                  )}>
                  <HelpCircle className="h-5 w-5" /> Help & Support
                </NavLink>
              </li>
            </ul>
          </div>

        </nav>
      </aside>
    </>
  );
};

export default Sidebar;