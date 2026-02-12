import React from 'react';
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
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

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
  {
    title: 'Recent Courses',
    action: { label: 'View all', path: '/my-courses' },
    items: [
      {
        icon: BookOpen,
        label: 'JavaScript Fundamentals',
        path: '/courses/javascript',
        progress: 65,
      },
      {
        icon: BookOpen,
        label: 'UI Design Essentials',
        path: '/courses/ui-design',
        progress: 30,
      },
    ],
  },
  {
    title: 'Recent Swaps',
    action: { label: 'Find more', path: '/barters' },
    items: [
      { icon: Repeat, label: 'Abhinav Rahul (JavaScript)', path: '/swaps/abhinav' },
      { icon: Repeat, label: 'Akshit Sharma (UI Design)', path: '/swaps/akshit' },
    ],
  },
  {
    title: 'Quick Actions',
    items: [
      { icon: Play, label: 'Start Learning', path: '/start-learning' },
      { icon: PlusCircle, label: 'Create New Course', path: '/create-course' },
    ],
  },
  {
    title: 'Help',
    items: [
      { icon: HelpCircle, label: 'Help & Support', path: '/help' },
      { icon: Send, label: 'Send Feedback', path: '/feedback' },
    ],
  },
];

const Sidebar = () => {
  const { sidebarOpen, setSidebarOpen } = useApp();
  const location = useLocation();
  const [expandedSections, setExpandedSections] = React.useState([
    'You',
    'Discover',
  ]);

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

                  {section.action && (
                    <NavLink
                      to={section.action.path}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      {section.action.label}
                    </NavLink>
                  )}
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

                              {typeof item.progress === 'number' && (
                                <div className="w-full h-1 mt-1 rounded-full bg-muted">
                                  <div
                                    className="h-1 transition-all rounded-full bg-primary"
                                    style={{ width: `${item.progress}%` }}
                                  />
                                </div>
                              )}
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

              {sectionIndex < navSections.length - 1 &&
                section.title && (
                  <div className="mx-4 my-3 border-t border-sidebar-border" />
                )}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;