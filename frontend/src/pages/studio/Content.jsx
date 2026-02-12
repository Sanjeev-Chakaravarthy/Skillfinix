// src/pages/StudioContent.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Eye, MessageSquare, ThumbsUp, Search, MoreHorizontal, 
  PenSquare, Trash2, ExternalLink, Video, Filter, Download,
  Clock, TrendingUp, AlertCircle
} from "lucide-react";
import { CustomButton } from "@/components/CustomButton";
import { useAuth } from "@/context/AuthContext";
import api from "@/api/axios";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const StudioContent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("videos");
  const [sortBy, setSortBy] = useState("newest");
  const [showActions, setShowActions] = useState(null);

  // Fetch YOUR courses only
  useEffect(() => {
    const fetchMyContent = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/courses');
        const myCourses = data.filter(c => c.instructor === user?.name);
        setCourses(myCourses);
        setFilteredCourses(myCourses);
      } catch (error) {
        console.error("Failed to fetch content", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchMyContent();
    }
  }, [user]);

  // Filter and Sort
  useEffect(() => {
    let filtered = [...courses];

    // Search Filter
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "most-views":
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case "highest-rated":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        break;
    }

    setFilteredCourses(filtered);
  }, [searchTerm, sortBy, courses]);

  // Delete Course
  const handleDelete = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course?")) {
      return;
    }

    try {
      await api.delete(`/courses/${courseId}`);
      setCourses(courses.filter(c => c._id !== courseId));
      // You'll need to add this endpoint to your backend
    } catch (error) {
      console.error("Failed to delete course:", error);
      alert("Failed to delete course. This endpoint may not be implemented yet.");
    }
  };

  // Format Duration (mock)
  const formatDuration = () => {
    const minutes = Math.floor(Math.random() * 20) + 5;
    const seconds = Math.floor(Math.random() * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Calculate engagement rate
  const calculateEngagement = (views, comments) => {
    if (!views || views === 0) return "0%";
    const rate = ((comments || 0) / views) * 100;
    return rate.toFixed(1) + "%";
  };

  return (
    <div className="flex flex-col h-full mx-auto max-w-7xl">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-foreground">Channel content</h1>
        <Link to="/studio/upload">
          <CustomButton variant="gradient" leftIcon={<Video className="w-4 h-4" />}>
            Upload Video
          </CustomButton>
        </Link>
      </div>

      {/* Tabs */}
      <div className="mb-4 border-b border-border">
        <div className="flex gap-6">
          <button 
            onClick={() => setActiveTab("videos")}
            className={cn(
              "px-1 py-3 text-sm font-medium border-b-2 transition-colors",
              activeTab === "videos" 
                ? "border-primary text-primary" 
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Videos ({courses.length})
          </button>
          <button 
            onClick={() => setActiveTab("live")}
            className={cn(
              "px-1 py-3 text-sm font-medium border-b-2 transition-colors",
              activeTab === "live" 
                ? "border-primary text-primary" 
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Live
          </button>
          <button 
            onClick={() => setActiveTab("playlists")}
            className={cn(
              "px-1 py-3 text-sm font-medium border-b-2 transition-colors",
              activeTab === "playlists" 
                ? "border-primary text-primary" 
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Playlists
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
           <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
           <input 
             placeholder="Search your content..." 
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full h-10 pr-4 text-sm bg-transparent border rounded-lg pl-9 border-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
           />
        </div>
        
        <div className="flex gap-2">
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-10 px-4 text-sm bg-transparent border rounded-lg border-border text-foreground focus:outline-none focus:border-primary"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="most-views">Most Views</option>
            <option value="highest-rated">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Content Table */}
      {activeTab === "videos" && (
        <div className="overflow-hidden border rounded-lg border-border bg-card">
           {/* Table Header */}
           <div className="grid grid-cols-12 gap-4 p-4 text-xs font-semibold uppercase border-b border-border bg-muted/30 text-muted-foreground">
              <div className="col-span-5 pl-2">Video</div>
              <div className="col-span-2">Visibility</div>
              <div className="col-span-1">Date</div>
              <div className="col-span-1 text-right">Views</div>
              <div className="col-span-1 text-right">Comments</div>
              <div className="col-span-1 text-right">Rating</div>
              <div className="col-span-1 text-right">Actions</div>
           </div>

           {/* Content Rows */}
           {loading ? (
              <div className="p-10 text-sm text-center text-muted-foreground">
                <div className="w-8 h-8 mx-auto mb-2 border-4 rounded-full border-primary border-t-transparent animate-spin"></div>
                Loading content...
              </div>
           ) : filteredCourses.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-16 text-center">
                 <div className="flex items-center justify-center w-32 h-32 mb-4 rounded-full bg-muted/20">
                    {searchTerm ? (
                      <AlertCircle className="w-12 h-12 text-muted-foreground/50" />
                    ) : (
                      <Video className="w-12 h-12 text-muted-foreground/50" />
                    )}
                 </div>
                 <h3 className="text-lg font-medium text-foreground">
                   {searchTerm ? "No results found" : "No content available"}
                 </h3>
                 <p className="max-w-xs mb-6 text-sm text-muted-foreground">
                   {searchTerm 
                     ? `No videos match "${searchTerm}"`
                     : "Upload videos to get started with your channel."}
                 </p>
                 {!searchTerm && (
                   <Link to="/studio/upload">
                      <CustomButton variant="gradient">Upload Videos</CustomButton>
                   </Link>
                 )}
              </div>
           ) : (
              <div className="divide-y divide-border bg-card">
                 <AnimatePresence>
                   {filteredCourses.map((course, index) => (
                     <motion.div 
                       initial={{ opacity: 0, y: 20 }} 
                       animate={{ opacity: 1, y: 0 }}
                       exit={{ opacity: 0, y: -20 }}
                       transition={{ delay: index * 0.05 }}
                       key={course._id} 
                       className="grid items-center grid-cols-12 gap-4 p-4 text-sm transition-colors hover:bg-muted/30 group"
                     >
                        {/* Video Info */}
                        <div className="flex col-span-5 gap-3 overflow-hidden">
                           <div className="relative w-32 overflow-hidden bg-black border rounded-lg h-18 shrink-0 border-border">
                              <img 
                                src={course.thumbnail} 
                                alt={course.title}
                                className="object-cover w-full h-full" 
                              />
                              <div className="absolute bottom-1 right-1 bg-black/80 text-[10px] text-white px-1.5 py-0.5 rounded">
                                {formatDuration()}
                              </div>
                           </div>
                           <div className="flex flex-col justify-center min-w-0">
                              <Link 
                                to={`/courses/${course._id}`}
                                className="font-medium transition-colors cursor-pointer text-foreground hover:text-primary line-clamp-2" 
                                title={course.title}
                              >
                                {course.title}
                              </Link>
                              <p className="text-xs text-muted-foreground line-clamp-1 max-w-[250px] mt-1">
                                {course.description}
                              </p>
                              
                              {/* Tags */}
                              <div className="flex gap-1 mt-2">
                                <span className="px-2 py-0.5 text-[10px] rounded-md bg-primary/10 text-primary">
                                  {course.category}
                                </span>
                                <span className="px-2 py-0.5 text-[10px] rounded-md bg-secondary/10 text-secondary">
                                  {course.level}
                                </span>
                              </div>
                           </div>
                        </div>

                        {/* Visibility */}
                        <div className="flex items-center col-span-2 gap-2 text-muted-foreground">
                           <Eye className="w-4 h-4 text-green-500" />
                           <span className="text-sm font-medium text-foreground">Public</span>
                        </div>

                        {/* Date */}
                        <div className="col-span-1 text-xs">
                           <p className="font-medium text-foreground">Published</p>
                           <p className="text-muted-foreground">
                             {new Date(course.createdAt).toLocaleDateString('en-US', { 
                               month: 'short', 
                               day: 'numeric',
                               year: 'numeric'
                             })}
                           </p>
                        </div>

                        {/* Views */}
                        <div className="col-span-1 text-right">
                          <p className="font-medium text-foreground">{course.views || 0}</p>
                          <p className="text-[10px] text-muted-foreground">views</p>
                        </div>

                        {/* Comments */}
                        <div className="col-span-1 text-right">
                          <p className="font-medium text-foreground">{course.reviewCount || 0}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {calculateEngagement(course.views, course.reviewCount)}
                          </p>
                        </div>

                        {/* Rating */}
                        <div className="col-span-1 text-right">
                          <p className="font-medium text-foreground">{course.rating || 0}/5</p>
                          <div className="flex justify-end gap-0.5 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <div 
                                key={i}
                                className={cn(
                                  "w-2 h-2 rounded-full",
                                  i < Math.round(course.rating || 0) ? "bg-yellow-500" : "bg-muted"
                                )}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="relative col-span-1">
                          <div className="flex items-center justify-end gap-2 transition-opacity opacity-0 group-hover:opacity-100">
                             <Link
                               to={`/courses/${course._id}`}
                               title="View Course"
                               className="p-2 transition-colors rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10"
                             >
                               <ExternalLink className="w-4 h-4" />
                             </Link>
                             
                             <button
                               title="Edit"
                               className="p-2 transition-colors rounded-lg text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10"
                               onClick={() => alert('Edit feature coming soon!')}
                             >
                               <PenSquare className="w-4 h-4" />
                             </button>
                             
                             <button
                               title="Delete"
                               className="p-2 transition-colors rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                               onClick={() => handleDelete(course._id)}
                             >
                               <Trash2 className="w-4 h-4" />
                             </button>
                          </div>
                        </div>
                     </motion.div>
                   ))}
                 </AnimatePresence>
              </div>
           )}
        </div>
      )}

      {/* Other Tabs (Placeholder) */}
      {activeTab === "live" && (
        <div className="flex flex-col items-center justify-center p-16 text-center border rounded-lg bg-card border-border">
          <div className="flex items-center justify-center w-24 h-24 mb-4 rounded-full bg-red-500/10">
            <Video className="w-12 h-12 text-red-500" />
          </div>
          <h3 className="mb-2 text-lg font-medium text-foreground">No live streams yet</h3>
          <p className="text-sm text-muted-foreground">Start your first live session to engage with your audience in real-time.</p>
        </div>
      )}

      {activeTab === "playlists" && (
        <div className="flex flex-col items-center justify-center p-16 text-center border rounded-lg bg-card border-border">
          <div className="flex items-center justify-center w-24 h-24 mb-4 rounded-full bg-green-500/10">
            <TrendingUp className="w-12 h-12 text-green-500" />
          </div>
          <h3 className="mb-2 text-lg font-medium text-foreground">No playlists created</h3>
          <p className="text-sm text-muted-foreground">Organize your courses into playlists to help learners find related content.</p>
        </div>
      )}
    </div>
  );
};

export default StudioContent;