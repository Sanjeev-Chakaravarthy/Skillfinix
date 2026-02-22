import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Loader2, ArrowRight } from "lucide-react";
import * as Icons from "lucide-react";
import { motion } from "framer-motion";
import api from "@/api/axios";

// Helper to safely render lucide icons dynamically
const renderIcon = (iconName, props) => {
  const IconComponent = Icons[iconName] || Icons['Layers'];
  return <IconComponent {...props} />;
};

const Explore = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        api.get('/categories')
          .then(res => setCategories(res.data))
          .catch(err => console.error("Failed to load categories", err))
          .finally(() => setLoading(false));
    }, []);

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      );
    }

  return (
    <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-8 pb-20">
      
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/20 px-8 py-16 sm:px-16 mb-12 flex flex-col items-center text-center">
        <div className="absolute top-0 left-10 w-64 h-64 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-64 h-64 bg-purple-500/20 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-500/20">
            <Icons.Compass className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold font-heading text-foreground mb-4 tracking-tight">
            Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Skills</span>
          </h1>
          <p className="text-muted-foreground text-lg sm:text-xl">
            Discover a world of knowledge across diverse categories. Master development, design, soft skills, or find entirely new communities to engage with.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold font-heading text-foreground">Browse Categories</h2>
        <span className="text-muted-foreground text-sm font-medium">{categories.length} Categories available</span>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-20 border border-dashed rounded-3xl text-muted-foreground">
          No categories found.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {categories.map((cat, idx) => (
            <Link 
              to={`/skill-hunt?category=${encodeURIComponent(cat.name)}`} 
              key={cat._id || cat.name}
            >
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (idx % 10) * 0.05 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="group relative flex flex-col items-center justify-center p-6 sm:p-8 bg-card border border-border/50 hover:border-indigo-500/30 rounded-3xl transition-all h-full shadow-sm hover:shadow-xl overflow-hidden"
              >
                {/* Background Hover glow */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
                  style={{ backgroundColor: cat.color || '#6366f1' }}
                />

                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-500 group-hover:scale-110 shadow-sm group-hover:shadow-md relative z-10"
                  style={{ backgroundColor: `${cat.color || '#6366f1'}15`, color: cat.color || '#6366f1' }}
                >
                  {renderIcon(cat.icon, { className: "w-8 h-8" })}
                </div>
                
                <h3 className="text-base sm:text-lg font-bold text-foreground text-center relative z-10" style={{ wordBreak: 'break-word' }}>
                  {cat.name}
                </h3>
                
                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Explore;
