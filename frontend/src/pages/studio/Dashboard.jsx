// src/pages/studio/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowUp, ArrowDown, Minus, Eye, Heart, MessageSquare, 
  TrendingUp, Upload, Clock, Users
} from "lucide-react";
import { CustomButton } from "@/components/CustomButton";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import api from "@/api/axios";

const StudioDashboard = () => {
  const { user } = useAuth();
  
  // State Management
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    subscribers: 0,
    totalViews: 0,
    totalWatchTime: 0,
    totalCourses: 0,
    last28DaysViews: 0,
    last28DaysWatchTime: 0,
    subscriberChange: 0,
  });
  const [latestCourse, setLatestCourse] = useState(null);
  const [topCourses, setTopCourses] = useState([]);

  // Fetch Dashboard Data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch user's courses
        const { data: allCourses } = await api.get('/courses');
        const myCourses = allCourses.filter(course => course.instructor === user?.name);

        if (myCourses.length === 0) {
          setLoading(false);
          return;
        }

        // Calculate Analytics
        const totalViews = myCourses.reduce((sum, course) => sum + (course.views || 0), 0);
        const totalCourses = myCourses.length;
        
        // Estimate watch time (assuming average 5 min per view)
        const estimatedWatchTime = (totalViews * 5) / 60; // in hours
        
        // Get latest course (most recent)
        const latest = myCourses.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        )[0];
        
        // Get top performing courses (by views)
        const top = myCourses
          .sort((a, b) => (b.views || 0) - (a.views || 0))
          .slice(0, 5);

        // Calculate time since latest course creation
        const hoursSinceCreation = latest 
          ? Math.floor((Date.now() - new Date(latest.createdAt).getTime()) / (1000 * 60 * 60))
          : 0;
        const daysSinceCreation = Math.floor(hoursSinceCreation / 24);
        
        // Mock subscriber data (you can add this to your backend later)
        const mockSubscribers = Math.floor(totalViews * 0.15) || 0;
        const mockSubscriberChange = Math.floor(mockSubscribers * 0.05);

        // Set Analytics
        setAnalytics({
          subscribers: mockSubscribers,
          totalViews,
          totalWatchTime: estimatedWatchTime.toFixed(1),
          totalCourses,
          last28DaysViews: totalViews,
          last28DaysWatchTime: estimatedWatchTime.toFixed(1),
          subscriberChange: mockSubscriberChange,
        });

        // Add time info to latest course
        setLatestCourse({
          ...latest,
          hoursSinceCreation,
          daysSinceCreation,
        });

        setTopCourses(top);

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  // Helper to calculate CTR (mock data)
  const calculateCTR = (views) => {
    return views > 0 ? ((views * 0.054).toFixed(1)) : "0.0";
  };

  // Helper to calculate average duration (mock)
  const calculateAvgDuration = (views) => {
    if (views === 0) return "0:00";
    const minutes = Math.floor((views * 4.5) / views);
    const seconds = Math.floor(((views * 4.5) % views) * 60 / views);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Trend Icon Component
  const TrendIcon = ({ value }) => {
    if (value > 0) {
      return <ArrowUp className="w-3 h-3 text-green-500" />;
    } else if (value < 0) {
      return <ArrowDown className="w-3 h-3 text-red-500" />;
    }
    return <Minus className="w-3 h-3 text-muted-foreground" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 rounded-full border-primary border-t-transparent animate-spin"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // No Content State
  if (!latestCourse) {
    return (
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-6 text-2xl font-bold text-foreground">Channel dashboard</h1>
        <div className="flex flex-col items-center justify-center p-16 text-center border rounded-xl bg-card border-border">
          <div className="flex items-center justify-center w-24 h-24 mb-6 rounded-full bg-muted/20">
            <Upload className="w-12 h-12 text-muted-foreground/50" />
          </div>
          <h3 className="mb-2 text-xl font-semibold text-foreground">No content yet</h3>
          <p className="max-w-md mb-6 text-muted-foreground">
            Upload your first course to see analytics and performance metrics.
          </p>
          <Link to="/studio/upload">
            <CustomButton variant="gradient" leftIcon={<Upload className="w-4 h-4" />}>
              Upload Your First Course
            </CustomButton>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-6 max-w-7xl">
      <h1 className="text-2xl font-bold text-foreground">Channel dashboard</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* LEFT COLUMN: Latest Content Performance */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden border shadow-sm border-border bg-card rounded-xl"
        >
          <div className="p-4 border-b border-border bg-muted/20">
             <h3 className="font-semibold text-foreground">Latest video performance</h3>
          </div>
          
          <div className="p-4 space-y-6">
             {/* Thumbnail & Title */}
             <Link to={`/courses/${latestCourse._id}`} className="block cursor-pointer group">
                <div className="relative mb-3 overflow-hidden rounded-lg aspect-video bg-muted">
                  <img 
                    src={latestCourse.thumbnail} 
                    alt={latestCourse.title}
                    className="object-cover w-full h-full transition-all brightness-90 group-hover:brightness-100" 
                  />
                  {/* Duration Overlay (mock) */}
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-0.5 rounded">
                    {Math.floor(Math.random() * 20) + 5}:00
                  </div>
                </div>
                <h4 className="text-lg font-medium leading-tight transition-colors line-clamp-2 group-hover:text-primary">
                  {latestCourse.title}
                </h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  {latestCourse.daysSinceCreation > 0 
                    ? `First ${latestCourse.daysSinceCreation} days ${latestCourse.hoursSinceCreation % 24} hours`
                    : `First ${latestCourse.hoursSinceCreation} hours`}
                </p>
             </Link>

             {/* Stats Grid */}
             <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                   <div className="flex items-center gap-2 text-muted-foreground">
                      <Eye className="w-4 h-4" /> Views
                   </div>
                   <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{latestCourse.views || 0}</span>
                      <TrendIcon value={latestCourse.views || 0} />
                   </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                   <div className="flex items-center gap-2 text-muted-foreground">
                      <TrendingUp className="w-4 h-4" /> Impression CTR
                   </div>
                   <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{calculateCTR(latestCourse.views || 0)}%</span>
                      <TrendIcon value={1} />
                   </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                   <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" /> Avg view duration
                   </div>
                   <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{calculateAvgDuration(latestCourse.views || 0)}</span>
                      <TrendIcon value={0} />
                   </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                   <div className="flex items-center gap-2 text-muted-foreground">
                      <MessageSquare className="w-4 h-4" /> Comments
                   </div>
                   <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{latestCourse.reviewCount || 0}</span>
                   </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                   <div className="flex items-center gap-2 text-muted-foreground">
                      <Heart className="w-4 h-4" /> Rating
                   </div>
                   <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{latestCourse.rating || 0}/5</span>
                   </div>
                </div>
             </div>

             <div className="pt-2">
                <Link to={`/studio/content`} className="text-sm font-medium text-primary hover:underline">
                   GO TO VIDEO ANALYTICS →
                </Link>
             </div>
          </div>
        </motion.div>

        {/* MIDDLE COLUMN: Channel Analytics */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col overflow-hidden border shadow-sm border-border bg-card rounded-xl"
        >
           <div className="p-4 border-b border-border bg-muted/20">
             <h3 className="font-semibold text-foreground">Channel analytics</h3>
           </div>
           
           <div className="flex flex-col justify-between flex-1 p-6">
              {/* Subscribers Section */}
              <div>
                 <p className="text-sm text-muted-foreground">Current subscribers</p>
                 <h2 className="mt-1 text-4xl font-bold text-foreground">{analytics.subscribers}</h2>
                 <div className="flex items-center gap-1 mt-1">
                   {analytics.subscriberChange > 0 && <ArrowUp className="w-3 h-3 text-green-500" />}
                   <p className="text-xs text-green-500">
                     {analytics.subscriberChange > 0 ? '+' : ''}{analytics.subscriberChange} in last 28 days
                   </p>
                 </div>
              </div>

              {/* Summary Section */}
              <div className="pt-6 mt-6 space-y-4 border-t border-border">
                 <div>
                    <h4 className="mb-3 font-medium text-foreground">Summary</h4>
                    <p className="mb-4 text-xs text-muted-foreground">Last 28 days</p>
                 </div>
                 
                 <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Courses</span>
                    <span className="font-medium text-foreground">{analytics.totalCourses}</span>
                 </div>
                 
                 <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Views</span>
                    <span className="font-medium text-foreground">{analytics.last28DaysViews}</span>
                 </div>
                 
                 <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Watch time (hours)</span>
                    <span className="font-medium text-foreground">{analytics.last28DaysWatchTime}</span>
                 </div>
              </div>

              {/* Top Videos Section */}
              <div className="pt-6 mt-6 border-t border-border">
                 <h4 className="mb-3 font-medium text-foreground">Top videos</h4>
                 <p className="mb-4 text-xs text-muted-foreground">Last 48 hours · Views</p>
                 
                 <div className="space-y-3">
                    {topCourses.slice(0, 3).map((course) => (
                      <Link
                        key={course._id}
                        to={`/courses/${course._id}`}
                        className="flex items-center justify-between text-sm cursor-pointer group"
                      >
                         <span className="truncate max-w-[200px] text-primary group-hover:underline">
                           {course.title}
                         </span>
                         <span className="font-medium text-foreground">{course.views || 0}</span>
                      </Link>
                    ))}
                    
                    {topCourses.length === 0 && (
                      <p className="text-sm text-muted-foreground">No data available yet</p>
                    )}
                 </div>

                 <div className="mt-6">
                    <Link to="/studio/analytics" className="text-sm font-medium text-primary hover:underline">
                       GO TO CHANNEL ANALYTICS →
                    </Link>
                 </div>
              </div>
           </div>
        </motion.div>

        {/* RIGHT COLUMN: Quick Actions & Tips */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
           {/* Upload Card */}
           <div className="p-6 overflow-hidden text-center border shadow-sm border-border bg-card rounded-xl">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10">
                 <Upload className="w-8 h-8 text-primary" />
              </div>
              <h3 className="mb-2 font-semibold text-foreground">Upload More Content</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                 Keep your audience engaged by uploading new courses regularly.
              </p>
              <Link to="/studio/upload">
                 <CustomButton variant="gradient" className="w-full">
                   Upload Course
                 </CustomButton>
              </Link>
           </div>

           {/* Stats Card */}
           <div className="overflow-hidden border shadow-sm border-border bg-card rounded-xl">
              <div className="p-4 border-b border-border bg-muted/20">
                 <h3 className="font-semibold text-foreground">Quick Stats</h3>
              </div>
              <div className="p-4 space-y-3">
                 <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">Subscribers</span>
                    </div>
                    <span className="text-lg font-bold text-primary">{analytics.subscribers}</span>
                 </div>
                 
                 <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium text-foreground">Total Views</span>
                    </div>
                    <span className="text-lg font-bold text-blue-500">{analytics.totalViews}</span>
                 </div>
                 
                 <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-foreground">Watch Time</span>
                    </div>
                    <span className="text-lg font-bold text-green-500">{analytics.totalWatchTime}h</span>
                 </div>
              </div>
           </div>

           {/* Tips Card */}
           <div className="overflow-hidden border shadow-sm border-border bg-card rounded-xl">
              <div className="p-4 border-b border-border bg-muted/20">
                 <h3 className="font-semibold text-foreground">Creator Tips</h3>
              </div>
              <div className="p-4">
                 <div className="mb-3 overflow-hidden rounded-lg aspect-video bg-gradient-to-br from-primary/20 to-secondary/20">
                    <div className="flex items-center justify-center w-full h-full">
                      <TrendingUp className="w-12 h-12 text-primary" />
                    </div>
                 </div>
                 <h4 className="mb-1 font-medium text-foreground">Grow Your Audience</h4>
                 <p className="mb-2 text-sm text-muted-foreground">
                   Upload consistently and engage with your learners to build a loyal community.
                 </p>
                 <Link to="/studio/analytics" className="text-sm font-medium text-primary hover:underline">
                   View Analytics →
                 </Link>
              </div>
           </div>
        </motion.div>

      </div>
    </div>
  );
};

export default StudioDashboard;