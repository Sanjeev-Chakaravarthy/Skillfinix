import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Loader2, Zap, Code, Palette, Briefcase, Camera, Music, Database, Globe } from "lucide-react";
import { motion } from "framer-motion";
import api from "@/api/axios";

const CATEGORIES = [
  { name: "Programming", icon: Code, color: "text-blue-500", bg: "bg-blue-500/10" },
  { name: "Design", icon: Palette, color: "text-purple-500", bg: "bg-purple-500/10" },
  { name: "Business", icon: Briefcase, color: "text-green-500", bg: "bg-green-500/10" },
  { name: "Photography", icon: Camera, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  { name: "Music", icon: Music, color: "text-red-500", bg: "bg-red-500/10" },
  { name: "Data Science", icon: Database, color: "text-cyan-500", bg: "bg-cyan-500/10" },
  { name: "Marketing", icon: Globe, color: "text-orange-500", bg: "bg-orange-500/10" },
  { name: "Productivity", icon: Zap, color: "text-pink-500", bg: "bg-pink-500/10" },
];

const Explore = () => {
    const [categories, setCategories] = useState([]);
    
    useEffect(() => {
        // Fetch real categories too
        api.get('/courses/categories').then(res => {
             // Merging fetched categories is possible but let's stick to the styled list for now
             // or map them to colors randomly. For UI polish, hardcoded icons + real categories is best.
        });
    }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold font-heading text-foreground mb-4">Explore Skills 🧭</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Discover a world of knowledge across diverse categories. What do you want to learn today?
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {CATEGORIES.map((cat, idx) => (
          <Link 
            to={`/skill-hunt?category=${encodeURIComponent(cat.name)}`} 
            key={cat.name}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -5 }}
              className="flex flex-col items-center justify-center p-8 bg-card border border-border rounded-2xl hover:shadow-lg transition-all cursor-pointer group h-full"
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${cat.bg} group-hover:scale-110 transition-transform`}>
                <cat.icon className={`w-8 h-8 ${cat.color}`} />
              </div>
              <h3 className="text-lg font-bold text-foreground">{cat.name}</h3>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Explore;
