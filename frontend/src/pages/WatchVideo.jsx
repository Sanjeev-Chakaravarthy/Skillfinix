import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Play, ThumbsUp, Share2, MoreHorizontal, User, Calendar, Eye } from "lucide-react";
import { CustomButton } from "@/components/CustomButton";
import api from "@/api/axios";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import CourseCard from "@/components/CourseCard";
import RatingStars from "@/components/RatingStars";

const WatchVideo = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recommended, setRecommended] = useState([]);
  const [error, setError] = useState(null);


  const { user } = useAuth(); // Import useAuth at top

  useEffect(() => {
    const fetchCourseData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch course details
        const { data: courseData } = await api.get(`/courses/${id}`);
        setCourse(courseData);

        // Fetch recommended courses (simulated relative videos)
        const { data: recData } = await api.get('/courses/recommended');
        setRecommended(recData.filter(c => c._id !== id));

        // Save to Watch History (Local Storage)
        if (user && courseData) {
            const historyKey = `watchHistory_${user._id}`;
            const history = JSON.parse(localStorage.getItem(historyKey) || "[]");
            
            // Remove if exists to re-add at top
            const newHistory = [courseData, ...history.filter(h => h._id !== courseData._id)].slice(0, 50);
            
            localStorage.setItem(historyKey, JSON.stringify(newHistory));
        }

      } catch (err) {
        console.error("Error fetching course:", err);
        setError("Failed to load video. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
    // Scroll to top when id changes
    window.scrollTo(0, 0);
  }, [id, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 rounded-full animate-spin border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-2xl font-bold mb-4">Video not found</h2>
        <p className="text-muted-foreground mb-6">{error || "The video you are looking for does not exist."}</p>
        <Link to="/skill-hunt">
          <CustomButton variant="gradient">Back to Courses</CustomButton>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 mx-auto py-6 lg:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Video Player Wrapper */}
            <div className="relative w-full overflow-hidden bg-black rounded-xl aspect-video shadow-lg group">
              <video 
                src={course.videoUrl} 
                poster={course.thumbnail}
                controls 
                autoPlay 
                className="w-full h-full object-contain"
              >
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Video Info */}
            <div className="space-y-4">
              <h1 className="text-xl md:text-2xl font-bold font-heading text-foreground break-words">
                {course.title}
              </h1>
              
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{course.views || 0} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(course.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <CustomButton variant="outline" className="gap-2 rounded-full">
                    <ThumbsUp className="w-4 h-4" /> Like
                  </CustomButton>
                  <CustomButton variant="outline" className="gap-2 rounded-full">
                    <Share2 className="w-4 h-4" /> Share
                  </CustomButton>
                  <button className="p-2 border rounded-full hover:bg-muted">
                    <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
              </div>

              {/* Instructor & Description */}
              <div className="flex gap-4 items-start p-4 bg-card rounded-xl border border-border">
                <div className="flex-shrink-0">
                   <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                      {course.instructorAvatar ? (
                        <img src={course.instructorAvatar} alt={course.instructor} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-6 h-6 text-primary" />
                      )}
                   </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-foreground">{course.instructor}</h3>
                  <p className="text-xs text-muted-foreground mb-3">Instructor</p>
                  
                  <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
                    <p className="whitespace-pre-wrap">{course.description}</p>
                  </div>
                </div>
                <CustomButton variant="default" size="sm">Subscribe</CustomButton>
              </div>

              {/* Comments Section (Placeholder for now) */}
              <div className="pt-6">
                <h3 className="text-lg font-bold mb-4">Comments</h3>
                <div className="p-8 text-center bg-muted/30 rounded-xl border border-dashed border-border">
                  <p className="text-muted-foreground">Comments feature coming soon!</p>
                </div>
              </div>

            </div>
          </div>

          {/* Sidebar - Right Column */}
          <div className="lg:col-span-1">
             <h3 className="text-lg font-bold mb-4 px-1">Recommended</h3>
             <div className="flex flex-col gap-4">
               {recommended.length > 0 ? (
                 recommended.map(rec => (
                   <CourseCard key={rec._id} course={rec} variant="compact" />
                 ))
               ) : (
                 <p className="text-muted-foreground text-sm pl-1">No recommendations available.</p>
               )}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default WatchVideo;
