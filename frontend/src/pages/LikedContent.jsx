import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import CourseCard from "@/components/CourseCard";
import { motion } from "framer-motion";
import api from "@/api/axios";

const LikedContent = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get('/interactions/like');
        setCourses(data.courses || []);
      } catch (error) {
        console.error("Error fetching liked content:", error);
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading text-foreground">Liked Content 👍</h1>
        <p className="text-muted-foreground mt-2">Courses you've liked.</p>
      </div>

      {courses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map((course, idx) => (
            <motion.div
              key={course._id}
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
          <p className="text-muted-foreground">You haven't liked any courses yet.</p>
        </div>
      )}
    </div>
  );
};

export default LikedContent;
