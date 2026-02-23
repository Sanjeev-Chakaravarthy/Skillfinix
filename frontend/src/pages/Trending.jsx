import React, { useState, useEffect } from "react";
import { Loader2, Flame, ArrowUpRight, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import api from "@/api/axios";
import CourseCard from "@/components/CourseCard";
import { Badge } from "@/components/ui/badge";

const Trending = () => {
  const [data, setData] = useState({ courses: [], trendingSkills: [], categoryStats: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: trendingData } = await api.get('/trending');
        setData(trendingData);
      } catch (error) {
        console.error("Error fetching trending:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const { courses, trendingSkills, categoryStats } = data;

  return (
    <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-8 pb-20">
      
      {/* Hero Header */}
      <div className="relative w-full max-w-full overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500/10 via-red-500/5 to-transparent border border-red-500/20 p-6 sm:p-8 mb-10 flex flex-col justify-center">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-500/20 blur-[80px] rounded-full" />
        <div className="absolute -bottom-10 right-20 w-32 h-32 bg-red-500/20 blur-[60px] rounded-full" />
        
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-orange-500/20 rounded-xl">
              <Flame className="w-7 h-7 text-orange-500" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-heading text-foreground">Trending Skills</h1>
          </div>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl">
            Discover the most highly sought-after skills on Skillfinix. These sessions are driving the most views, swaps, and interactions across the platform right now.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Left Col: Top Trending Sessions */}
        <div className="xl:col-span-3 flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Popular Sessions
            </h2>
          </div>

          {courses.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground border border-dashed rounded-2xl">
              No trending sessions active right now. Start learning!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {courses.map((course, idx) => (
                <motion.div
                  key={course._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="relative group"
                >
                  <div className="absolute -top-2.5 -left-2.5 w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white flex items-center justify-center font-bold text-sm shadow-xl z-20 shadow-orange-500/30 border-2 border-background">
                    #{idx + 1}
                  </div>
                  <CourseCard course={course} variant="featured" />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Stats & Demand */}
        <div className="flex flex-col gap-8">
          
          {/* Most Demanded Skills to Barter */}
          <div className="bg-muted/30 rounded-2xl p-5 border border-border/50">
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-foreground/90">
              <Flame className="w-4 h-4 text-orange-500" />
              Highest Swap Demand
            </h3>
            
            <div className="flex flex-col gap-3">
              {trendingSkills.slice(0, 8).map((req, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors group cursor-default">
                  <div className="flex items-center gap-3 overflow-hidden">
                     <span className="text-muted-foreground text-sm font-medium w-4">{i+1}.</span>
                     <span className="font-medium text-[15px] truncate">{req.skill}</span>
                  </div>
                  <Badge variant="secondary" className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 shrink-0">
                    {req.swapCount} requests
                  </Badge>
                </div>
              ))}
              {trendingSkills.length === 0 && <span className="text-sm text-muted-foreground p-2">No swap data available.</span>}
            </div>
          </div>

          {/* Top Categories */}
          <div className="bg-card rounded-2xl p-5 border shadow-sm">
            <h3 className="font-semibold mb-4 text-foreground/90">Top Categories</h3>
            <div className="flex flex-wrap gap-2">
              {categoryStats.slice(0, 10).map((cat, i) => (
                <div key={cat._id} className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-lg text-sm font-medium text-foreground hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer border border-border/50">
                  {cat._id}
                  <span className="opacity-60 text-xs ml-1">({cat.courseCount})</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Trending;
