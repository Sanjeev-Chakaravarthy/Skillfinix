import React, { useState, useEffect } from "react";
import { 
  Users, 
  Eye, 
  Clock, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  MoreVertical,
  PlayCircle,
  BarChart2,
  Calendar,
  Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import { CustomButton } from "@/components/CustomButton";
import { cn } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";
import api from "@/api/axios";

// Mock chart data (since we don't store historical daily data yet)
const viewsData = [
  { name: "Mon", value: 400 },
  { name: "Tue", value: 300 },
  { name: "Wed", value: 550 },
  { name: "Thu", value: 450 },
  { name: "Fri", value: 600 },
  { name: "Sat", value: 700 },
  { name: "Sun", value: 800 },
];

const StatCard = ({ title, value, change, icon: Icon, trend }) => (
  <div className="p-6 bg-card border border-border rounded-xl">
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 bg-primary/10 rounded-lg">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <span className={cn(
        "flex items-center text-xs font-medium px-2 py-1 rounded-full",
        trend === "up" ? "text-green-600 bg-green-500/10" : "text-red-600 bg-red-500/10"
      )}>
        {trend === "up" ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
        {change}
      </span>
    </div>
    <h3 className="text-2xl font-bold text-foreground">{value}</h3>
    <p className="text-sm text-muted-foreground mt-1">{title}</p>
  </div>
);

const StudioDashboard = () => {
  const [stats, setStats] = useState({
    totalViews: 0,
    totalCourses: 0,
    totalStudents: 0,
    totalWatchTime: 0,
    recentCourses: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data } = await api.get('/courses/studio/analytics');
        setStats({
            totalViews: data.totalViews,
            totalCourses: data.totalCourses,
            totalStudents: data.totalStudents,
            totalWatchTime: (data.totalWatchTime / 3600).toFixed(1), // Convert seconds to hours
            recentCourses: data.courses ? data.courses.slice(0, 5) : []
        });
      } catch (error) {
        console.error("Error fetching studio analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
     return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
     );
  }

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold font-heading text-foreground">Channel Dashboard</h1>
        <p className="text-muted-foreground mt-2">Here's what's happening with your content today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Views" 
          value={stats.totalViews} 
          change="+12% vs last week" 
          icon={Eye} 
          trend="up" 
        />
        <StatCard 
          title="Total Watch Time (Hrs)" 
          value={stats.totalWatchTime} 
          change="+5% vs last week" 
          icon={Clock} 
          trend="up" 
        />
        <StatCard 
          title="Total Students" 
          value={stats.totalStudents} 
          change="+18% vs last week" 
          icon={Users} 
          trend="up" 
        />
        <StatCard 
          title="Avg. CTR (Est.)" 
          value={`${((stats.totalViews / 100) || 0).toFixed(1)}%`} 
          change="-2% vs last week" 
          icon={TrendingUp} 
          trend="down" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold">Analytics Overview</h2>
            <select className="bg-muted border-none text-sm rounded-lg px-3 py-1 focus:ring-0">
              <option>Last 7 days</option>
              <option>Last 28 days</option>
              <option>Last 90 days</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={viewsData}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Latest Video Performance */}
        <div className="bg-card border border-border rounded-xl p-6">
           <h2 className="text-lg font-bold mb-4">Recent Uploads</h2>
           {stats.recentCourses.length > 0 ? (
             <div className="space-y-6">
                {stats.recentCourses.map(course => (
                  <div key={course._id} className="group">
                     <div className="relative aspect-video rounded-lg overflow-hidden mb-3 bg-muted">
                        <img 
                          src={course.thumbnail} 
                          alt={course.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                     </div>
                     <h3 className="font-semibold line-clamp-2 md:text-sm">{course.title}</h3>
                     <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {course.views}</span>
                        <span className="flex items-center gap-1"><BarChart2 className="w-3 h-3" /> {course.rating?.toFixed(1) || 0}</span>
                     </div>
                  </div>
                ))}
                <Link to="/studio/content" className="block text-center text-sm text-primary hover:underline mt-4">
                  View all content
                </Link>
             </div>
           ) : (
             <div className="text-center py-8 text-muted-foreground text-sm">
                No videos uploaded yet.
                <div className="mt-4">
                   <Link to="/studio/upload">
                     <CustomButton size="sm">Upload Video</CustomButton>
                   </Link>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default StudioDashboard;