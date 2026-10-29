import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, PlayCircle, Eye, Clock, Users, TrendingUp } from "lucide-react";
import { CustomButton } from "@/components/CustomButton";
import api from "@/api/axios";
import { useToast } from "@/components/ui/use-toast";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const StatCard = ({ title, value, subtitle }) => (
  <div className="p-4 bg-card border border-border rounded-xl">
    <p className="text-sm text-muted-foreground">{title}</p>
    <h3 className="text-2xl font-bold text-foreground mt-1">{value}</h3>
    {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
  </div>
);

const VideoAnalytics = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        setLoading(true);
        // Fetch course details for title/thumbnail
        const { data: courseData } = await api.get(`/courses/${id}`);
        setCourse(courseData);
        
        const { data: analyticsData } = await api.get(`/courses/analytics/${id}`);
        setAnalytics(analyticsData);

      } catch (error) {
        toast({
          title: "Error completely loading analytics",
          description: error?.response?.data?.message || "Please try again later.",
          variant: "destructive"
        });
        navigate("/studio/content");
      } finally {
        setLoading(false);
      }
    };
    
    fetchVideoData();
  }, [id, navigate, toast]);

  if (loading && !course) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border pb-6 gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/studio/content")}
            className="p-2 hover:bg-muted rounded-full transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-4">
             {course?.thumbnail && (
               <div className="relative w-20 aspect-video rounded-md overflow-hidden bg-muted shrink-0 hidden sm:block">
                  <img src={course.thumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
               </div>
             )}
             <div>
               <h1 className="text-xl md:text-2xl font-bold line-clamp-1">Video analytics</h1>
               <p className="text-muted-foreground text-sm line-clamp-1">{course?.title || "Video title"}</p>
             </div>
          </div>
        </div>
        
        <div className="flex shrink-0">
           {/* Lifetime analytics view */}
        </div>
      </div>

      {loading && course && (
          <div className="flex items-center justify-center py-12">
             <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
      )}

      {!loading && analytics && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard 
              title="Total Views" 
              value={(analytics.totalViews || 0).toLocaleString()} 
            />
          </div>

          {/* Main Chart */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-bold mb-6">Views</h2>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCumulativeViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} 
                    minTickGap={30}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    name="Views"
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#colorCumulativeViews)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <p className="text-xs text-muted-foreground mt-4 text-center">
               Data reflects views recorded over the selected period.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default VideoAnalytics;
