import React, { useState, useRef, useEffect } from "react";
import { Search, X, TrendingUp, Clock, BookOpen, User, Loader2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/api/axios";

const SearchBar = ({
  placeholder = "Search courses, skills, users...",
  className,
  onSearch,
}) => {
  const { searchQuery, setSearchQuery } = useApp();
  const navigate = useNavigate();
  const [isFocused, setIsFocused] = useState(false);
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [results, setResults] = useState({ courses: [], users: [], trending: [] });
  const [searching, setSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    setRecentSearches(saved);
  }, []);

  // Save search to recent
  const saveRecentSearch = (query) => {
    const saved = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    const updated = [query, ...saved.filter(s => s !== query)].slice(0, 5);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
    setRecentSearches(updated);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced live search
  useEffect(() => {
    if (!localQuery || localQuery.trim().length < 2) {
      setResults({ courses: [], users: [], trending: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const { data } = await api.get(`/search?q=${encodeURIComponent(localQuery)}`);
        setResults(data);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (localQuery.trim()) {
      saveRecentSearch(localQuery.trim());
      setSearchQuery(localQuery);
      onSearch && onSearch(localQuery);
      setIsFocused(false);
      navigate(`/skill-hunt?keyword=${encodeURIComponent(localQuery)}`);
    }
  };

  const handleClear = () => {
    setLocalQuery("");
    setSearchQuery("");
    setResults({ courses: [], users: [], trending: [] });
    if (inputRef.current) inputRef.current.focus();
  };

  const handleSuggestionClick = (suggestion) => {
    setLocalQuery(suggestion);
    saveRecentSearch(suggestion);
    setSearchQuery(suggestion);
    onSearch && onSearch(suggestion);
    setIsFocused(false);
    navigate(`/skill-hunt?keyword=${encodeURIComponent(suggestion)}`);
  };

  const handleCourseClick = (courseId) => {
    setIsFocused(false);
    navigate(`/course/${courseId}`);
  };

  const handleUserClick = (userId) => {
    setIsFocused(false);
    navigate('/barters');
  };

  const hasResults = results.courses.length > 0 || results.users.length > 0;

  return (
    <div ref={containerRef} className={cn("relative w-full max-w-2xl", className)}>
      <form onSubmit={handleSubmit}>
        <div
          className={cn(
            "relative flex items-center bg-muted/50 border border-border rounded-xl transition-all duration-200",
            isFocused && "bg-card border-primary/50 shadow-md ring-2 ring-primary/10"
          )}
        >
          <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />

          <input
            ref={inputRef}
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder={placeholder}
            className="w-full h-11 pl-12 pr-20 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
          />

          <div className="absolute right-2 flex items-center gap-1">
            {searching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            {localQuery && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Dropdown */}
      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden max-h-[400px] overflow-y-auto"
          >
            {/* Live Search Results */}
            {localQuery && hasResults && (
              <>
                {results.courses.length > 0 && (
                  <div className="p-3">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
                      <BookOpen className="h-3.5 w-3.5" />
                      Courses
                    </div>
                    <div className="space-y-1">
                      {results.courses.slice(0, 4).map((course) => (
                        <button
                          key={course._id}
                          onClick={() => handleCourseClick(course._id)}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition-colors text-left"
                        >
                          <img src={course.thumbnail} alt="" className="w-10 h-7 rounded object-cover" />
                          <div className="flex-1 min-w-0">
                            <p className="truncate font-medium">{course.title}</p>
                            <p className="text-xs text-muted-foreground">{course.instructor} · {course.views || 0} views</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {results.users.length > 0 && (
                  <>
                    <div className="border-t border-border" />
                    <div className="p-3">
                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
                        <User className="h-3.5 w-3.5" />
                        People
                      </div>
                      <div className="space-y-1">
                        {results.users.slice(0, 3).map((u) => (
                          <button
                            key={u._id}
                            onClick={() => handleUserClick(u._id)}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition-colors text-left"
                          >
                            <img src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}`} alt="" className="w-8 h-8 rounded-full object-cover" />
                            <div className="flex-1 min-w-0">
                              <p className="truncate font-medium">{u.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{(u.skills || []).slice(0, 3).join(', ')}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {/* No results */}
            {localQuery && localQuery.length >= 2 && !searching && !hasResults && (
              <div className="p-6 text-center text-sm text-muted-foreground">
                No results found for "{localQuery}"
              </div>
            )}

            {/* Recent & Trending (when empty query) */}
            {!localQuery && (
              <>
                {recentSearches.length > 0 && (
                  <div className="p-3">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
                      <Clock className="h-3.5 w-3.5" />
                      Recent
                    </div>
                    <div className="space-y-1">
                      {recentSearches.map((search) => (
                        <button
                          key={search}
                          onClick={() => handleSuggestionClick(search)}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition-colors text-left"
                        >
                          <Search className="h-4 w-4 text-muted-foreground" />
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {results.trending?.length > 0 && (
                  <>
                    <div className="border-t border-border" />
                    <div className="p-3">
                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
                        <TrendingUp className="h-3.5 w-3.5" />
                        Trending
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {results.trending.map((t) => (
                          <button
                            key={t._id}
                            onClick={() => handleSuggestionClick(t._id)}
                            className="px-3 py-1.5 text-sm bg-accent text-accent-foreground hover:bg-accent/80 rounded-lg transition-colors"
                          >
                            {t._id} ({t.count})
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {recentSearches.length === 0 && (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Start typing to search courses, skills, and people...
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
