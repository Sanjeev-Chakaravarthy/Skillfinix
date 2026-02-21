import React, { useState, useEffect } from "react";
import { BookOpen, Loader2 } from "lucide-react";
import CourseCard from "@/components/CourseCard";
import ProgressCard from "@/components/ProgressCard";
import { motion } from "framer-motion";
import api from "@/api/axios";

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        // Fetch REAL enrollment data with progress from DB
        const { data } = await api.get('/enrollments');
        setCourses(data || []);
      } catch (error) {
        console.error("Error fetching my courses:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyCourses();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const inProgress = courses.filter(c => !c.completed && c.progress < 100);
  const completed = courses.filter(c => c.completed || c.progress >= 100);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading text-foreground">My Courses 📚</h1>
        <p className="text-muted-foreground mt-2">Track your learning progress and resume where you left off.</p>
      </div>

      <div className="space-y-12">
        {/* In Progress */}
        <section>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <div className="w-1.5 h-6 bg-primary rounded-full" />
            In Progress ({inProgress.length})
          </h2>
          {inProgress.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {inProgress.map((item, idx) => {
                const courseData = { ...(item.course || item), progress: item.progress };
                return (
                  <motion.div
                    key={item._id || courseData._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <ProgressCard course={courseData} />
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-2xl border border-dashed border-border">
              <p className="text-muted-foreground">You haven't started any courses yet. Start watching to track progress!</p>
            </div>
          )}
        </section>

        {/* Completed */}
        <section>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <div className="w-1.5 h-6 bg-green-500 rounded-full" />
            Completed ({completed.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {completed.length > 0 ? (
              completed.map((item, idx) => {
                const courseData = { ...(item.course || item), progress: item.progress };
                return (
                  <motion.div
                    key={item._id || courseData._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <CourseCard course={courseData} />
                  </motion.div>
                );
              })
            ) : (
               <div className="col-span-full py-12 text-center bg-muted/30 rounded-2xl border border-dashed border-border">
                <p className="text-muted-foreground">No completed courses yet. Keep going!</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default MyCourses;
