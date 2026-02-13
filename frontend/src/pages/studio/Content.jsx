import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  MessageSquare, 
  ThumbsUp, 
  Calendar,
  Edit,
  Trash2,
  Share2,
  Video,
  Loader2
} from "lucide-react";
import { CustomButton } from "@/components/CustomButton";
import { useAuth } from "@/context/AuthContext";
import api from "@/api/axios";
import { useToast } from "@/components/ui/use-toast";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const StudioContent = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Fetch Instructor Courses
    useEffect(() => {
        const fetchContent = async () => {
          try {
            const { data } = await api.get('/courses/instructor/my-courses');
            setCourses(data);
          } catch (error) {
            console.error("Error fetching content:", error);
            toast({
                title: "Error",
                description: "Failed to load your content.",
                variant: "destructive"
            });
          } finally {
            setLoading(false);
          }
        };
        fetchContent();
    }, [toast]);

    const handleDelete = async (courseId) => {
        if (!window.confirm("Are you sure you want to delete this course? This cannot be undone.")) return;

        try {
            await api.delete(`/courses/${courseId}`);
            setCourses(prev => prev.filter(c => c._id !== courseId));
            toast({
                title: "Success",
                description: "Course deleted successfully."
            });
        } catch (error) {
            console.error("Delete failed:", error);
            toast({
                title: "Error",
                description: "Failed to delete course.",
                variant: "destructive"
            });
        }
    };

    const filteredCourses = courses.filter(course => 
        course.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
       return (
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
       );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                   <h1 className="text-2xl font-bold">Channel Content</h1>
                   <p className="text-muted-foreground mt-1">Manage all your videos and live streams</p>
                </div>
                <Link to="/studio/upload">
                   <CustomButton>
                      <Video className="w-4 h-4 mr-2" />
                      Create New
                   </CustomButton>
                </Link>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 bg-card p-4 rounded-lg border border-border">
                <div className="relative flex-1 max-w-sm">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                   <input 
                      type="text" 
                      placeholder="Filter videos..." 
                      className="w-full pl-9 pr-4 py-2 bg-muted rounded-md text-sm border-none focus:ring-1 focus:ring-primary"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                   />
                </div>
                <CustomButton variant="outline" size="icon">
                   <Filter className="w-4 h-4" />
                </CustomButton>
            </div>

            {/* Content Table */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-muted/50 border-b border-border">
                        <tr>
                            <th className="p-4 font-medium text-sm text-foreground w-[40%]">Video</th>
                            <th className="p-4 font-medium text-sm text-muted-foreground hidden md:table-cell">Visibility</th>
                            <th className="p-4 font-medium text-sm text-muted-foreground hidden md:table-cell">Date</th>
                            <th className="p-4 font-medium text-sm text-muted-foreground text-center">Views</th>
                            <th className="p-4 font-medium text-sm text-muted-foreground text-center">Comments</th>
                            <th className="p-4 font-medium text-sm text-muted-foreground text-center">Likes</th> 
                            <th className="p-4 w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {filteredCourses.length > 0 ? (
                           filteredCourses.map((course) => (
                             <tr key={course._id} className="hover:bg-muted/30 transition-colors group">
                                 <td className="p-4">
                                     <div className="flex gap-4">
                                        <div className="relative w-32 aspect-video rounded-md overflow-hidden bg-muted flex-shrink-0">
                                            <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                                            <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1 rounded-sm">
                                                {course.duration || "00:00"}
                                            </div>
                                        </div>
                                        <div className="flex flex-col justify-center min-w-0">
                                            <h3 className="font-medium text-sm line-clamp-2 md:text-base">{course.title}</h3>
                                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{course.description}</p>
                                        </div>
                                     </div>
                                 </td>
                                 <td className="p-4 hidden md:table-cell">
                                     <span className={cn(
                                        "px-2 py-1 rounded-full text-xs font-medium",
                                        course.visibility === 'public' ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"
                                     )}>
                                        {course.visibility || 'Public'}
                                     </span>
                                 </td>
                                 <td className="p-4 text-xs text-muted-foreground hidden md:table-cell">
                                     {new Date(course.createdAt).toLocaleDateString()}
                                 </td>
                                 <td className="p-4 text-sm text-center font-medium">{course.views || 0}</td>
                                 <td className="p-4 text-sm text-center text-muted-foreground">{course.reviewCount || 0}</td>
                                 <td className="p-4 text-sm text-center text-muted-foreground">{(course.rating * 10).toFixed(0) || 0}%</td>
                                 <td className="p-4 text-right">
                                     <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="p-2 hover:bg-muted rounded-full">
                                                <MoreVertical className="w-4 h-4 text-muted-foreground" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onSelect={() => window.open(`/course/${course._id}`, '_blank')}>
                                                <Eye className="w-4 h-4 mr-2" /> View on Skillfinix
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Edit className="w-4 h-4 mr-2" /> Edit Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Share2 className="w-4 h-4 mr-2" /> Get Shareable Link
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem 
                                                className="text-red-500 focus:text-red-500 focus:bg-red-50"
                                                onSelect={() => handleDelete(course._id)}
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" /> Delete Forever
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                     </DropdownMenu>
                                 </td>
                             </tr> 
                           ))
                        ) : (
                           <tr>
                              <td colSpan={7} className="p-8 text-center text-muted-foreground">
                                 {searchQuery ? "No matching courses found." : "You haven't uploaded any content yet."}
                              </td>
                           </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StudioContent;