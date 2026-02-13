import React, { useState, useEffect } from "react";
import { Loader2, Trash2 } from "lucide-react";
import CourseCard from "@/components/CourseCard";
import { CustomButton } from "@/components/CustomButton";
import { motion } from "framer-motion";
import api from "@/api/axios";

const History = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const { data } = await api.get('/interactions/history');
      setCourses(data.courses || []);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const clearHistory = async () => {
    if(!window.confirm("Are you sure you want to clear your entire watch history?")) return;
    try {
      await api.delete('/interactions/history');
      setCourses([]);
    } catch (error) {
      console.error("Failed to clear history");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold font-heading text-foreground">Watch History 🕒</h1>
          <p className="text-muted-foreground mt-2">Courses you've watched recently.</p>
        </div>
        {courses.length > 0 && (
          <CustomButton variant="outline" onClick={clearHistory} className="text-red-500 hover:text-red-600 hover:bg-red-50">
            <Trash2 className="w-4 h-4 mr-2" /> Clear History
          </CustomButton>
        )}
      </div>

      {courses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map((course, idx) => (
            <motion.div
              key={course._id + idx} // duplicate protection
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <CourseCard course={course} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-muted/30 rounded-2xl border border-dashed border-border">
          <p className="text-muted-foreground">No watch history found.</p>
        </div>
      )}
    </div>
  );
};

export default History;
