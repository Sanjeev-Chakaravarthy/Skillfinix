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
          <Loader2 className="w-8 h-8 animate-spin motion-reduce:animate-none text-primary" />
        </div>
      );
    }

  return (
    <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-8 pb-20">
      
      {/* Hallmark Header */}
      <div className="relative w-full max-w-full overflow-hidden rounded-2xl bg-secondary text-secondary-foreground border border-border p-8 sm:p-10 mb-10 flex flex-col items-center text-center shadow-xs">
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="w-12 h-12 bg-primary text-primary-foreground rounded-xl flex items-center justify-center mx-auto mb-5 shadow-xs">
            <Icons.Compass className="w-6 h-6" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-heading text-secondary-foreground mb-3 tracking-tight">
            Explore Skills
          </h1>
          <p className="text-secondary-foreground/80 text-base max-w-xl">
            Discover peer-to-peer expertise across engineering, design, and craft.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold font-heading text-foreground">Browse Categories</h2>
        <span className="text-muted-foreground text-sm font-medium">{categories.length} Categories available</span>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-20 border border-dashed rounded-2xl text-muted-foreground">
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
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (idx % 10) * 0.04 }}
                className="group relative flex flex-col items-center justify-center p-6 bg-card border border-border hover:border-primary/40 rounded-xl transition-colors h-full shadow-xs hover:shadow-md overflow-hidden active:translate-y-px"
              >
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors bg-primary/10 text-primary shadow-xs relative z-10"
                >
                  {renderIcon(cat.icon, { className: "w-6 h-6" })}
                </div>
                
                <h3 className="text-sm font-semibold text-foreground text-center relative z-10" style={{ wordBreak: 'break-word' }}>
                  {cat.name}
                </h3>
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Explore;
