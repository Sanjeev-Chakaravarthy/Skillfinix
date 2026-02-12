import React, { useState, useRef, useEffect } from "react";
import { Search, Mic, X, TrendingUp, Clock } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const recentSearches = [
  "React hooks tutorial",
  "Python data science",
  "UI/UX design fundamentals",
];

const trendingSearches = [
  "Machine Learning",
  "TypeScript",
  "Cloud Computing",
  "Figma",
];

const SearchBar = ({
  placeholder = "Search courses, skills, users...",
  className,
  onSearch,
}) => {
  const { searchQuery, setSearchQuery } = useApp();
  const [isFocused, setIsFocused] = useState(false);
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(localQuery);
    onSearch && onSearch(localQuery);
    setIsFocused(false);
    console.log("Search submitted:", localQuery);
  };

  const handleClear = () => {
    setLocalQuery("");
    setSearchQuery("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleVoiceSearch = () => {
    console.log("Voice search activated");
    // Placeholder for voice search functionality
  };

  const handleSuggestionClick = (suggestion) => {
    setLocalQuery(suggestion);
    setSearchQuery(suggestion);
    onSearch && onSearch(suggestion);
    setIsFocused(false);
    console.log("Search suggestion clicked:", suggestion);
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full max-w-2xl", className)}
    >
      <form onSubmit={handleSubmit}>
        <div
          className={cn(
            "relative flex items-center bg-muted/50 border border-border rounded-xl transition-all duration-200",
            isFocused &&
              "bg-card border-primary/50 shadow-md ring-2 ring-primary/10"
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
            {localQuery && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
            <button
              type="button"
              onClick={handleVoiceSearch}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              <Mic className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </form>

      {/* Dropdown Suggestions */}
      <AnimatePresence>
        {isFocused && !localQuery && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden"
          >
            {/* Recent Searches */}
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

            <div className="border-t border-border" />

            {/* Trending Searches */}
            <div className="p-3">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
                <TrendingUp className="h-3.5 w-3.5" />
                Trending
              </div>
              <div className="flex flex-wrap gap-2">
                {trendingSearches.map((search) => (
                  <button
                    key={search}
                    onClick={() => handleSuggestionClick(search)}
                    className="px-3 py-1.5 text-sm bg-accent text-accent-foreground hover:bg-accent/80 rounded-lg transition-colors"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
