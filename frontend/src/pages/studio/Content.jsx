import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  Loader2,
  Globe,
  Lock,
  BarChart2,
} from "lucide-react";
import { CustomButton } from "@/components/CustomButton";
import { cn } from "@/lib/utils";
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
import DeleteConfirmModal from "@/components/studio/DeleteConfirmModal";

const StudioContent = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  // Track which course IDs are mid-toggle so we can disable the button
  const [togglingIds, setTogglingIds] = useState(new Set());
  
  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Fetch instructor courses ───────────────────────────────────────────────
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data } = await api.get("/courses/instructor/my-courses");
        setCourses(data);
      } catch (error) {
        console.error("Error fetching content:", error);
        toast({
          title: "Error",
          description: "Failed to load your content.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [toast]);

  // ── Delete course ──────────────────────────────────────────────────────────
  const openDeleteModal = (course) => {
    setItemToDelete(course);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);

    try {
      await api.delete(`/courses/${itemToDelete._id}`);
      setCourses((prev) => prev.filter((c) => c._id !== itemToDelete._id));
      toast({ title: "Course deleted successfully." });
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error("Delete failed:", error);
      toast({
        title: "Error",
        description: "Failed to delete course.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Toggle visibility (optimistic update + rollback) ──────────────────────
  const handleToggleVisibility = useCallback(
    async (courseId, currentVisibility) => {
      if (togglingIds.has(courseId)) return; // Prevent double-click race

      // 1. Optimistically update UI immediately
      const optimisticVisibility =
        currentVisibility === "public" ? "private" : "public";
      setCourses((prev) =>
        prev.map((c) =>
          c._id === courseId ? { ...c, visibility: optimisticVisibility } : c
        )
      );
      setTogglingIds((prev) => new Set(prev).add(courseId));

      try {
        // 2. Send PATCH to backend
        const { data } = await api.patch(`/courses/${courseId}/visibility`);

        // 3. Confirm with server's actual value (source of truth)
        setCourses((prev) =>
          prev.map((c) =>
            c._id === courseId ? { ...c, visibility: data.visibility } : c
          )
        );
        toast({
          title: data.visibility === "public" ? "Course published ✅" : "Course set to private 🔒",
          description: data.message,
        });
      } catch (error) {
        // 4. Rollback on error
        setCourses((prev) =>
          prev.map((c) =>
            c._id === courseId ? { ...c, visibility: currentVisibility } : c
          )
        );
        toast({
          title: "Failed to update visibility",
          description:
            error?.response?.data?.message || "Please try again.",
          variant: "destructive",
        });
      } finally {
        setTogglingIds((prev) => {
          const next = new Set(prev);
          next.delete(courseId);
          return next;
        });
      }
    },
    [togglingIds, toast]
  );

  const filteredCourses = courses.filter((course) =>
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
    <>
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Channel Content</h1>
          <p className="text-muted-foreground mt-1">
            Manage all your videos and live streams
          </p>
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
              <th className="p-4 font-medium text-sm text-foreground w-[40%]">
                Video
              </th>
              <th className="p-4 font-medium text-sm text-muted-foreground hidden md:table-cell">
                Visibility
              </th>
              <th className="p-4 font-medium text-sm text-muted-foreground hidden md:table-cell">
                Date
              </th>
              <th className="p-4 font-medium text-sm text-muted-foreground text-center">
                Views
              </th>
              <th className="p-4 font-medium text-sm text-muted-foreground text-center">
                Comments
              </th>
              <th className="p-4 font-medium text-sm text-muted-foreground text-center">
                Likes
              </th>
              <th className="p-4 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => {
                const isPublic = course.visibility !== "private";
                const isToggling = togglingIds.has(course._id);

                return (
                  <tr
                    key={course._id}
                    className="hover:bg-muted/30 transition-colors group"
                  >
                    {/* Thumbnail + Title */}
                    <td className="p-4">
                      <div className="flex gap-4">
                        <div className="relative w-32 aspect-video rounded-md overflow-hidden bg-muted flex-shrink-0">
                          <img
                            src={course.thumbnail}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1 rounded-sm">
                            {course.duration || "00:00"}
                          </div>
                        </div>
                        <div className="flex flex-col justify-center min-w-0">
                          <h3 className="font-medium text-sm line-clamp-2 md:text-base">
                            {course.title}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            {course.description}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* ── Visibility Toggle ────────────────────────────── */}
                    <td className="p-4 hidden md:table-cell">
                      <button
                        onClick={() =>
                          handleToggleVisibility(course._id, course.visibility)
                        }
                        disabled={isToggling}
                        title={
                          isPublic
                            ? "Click to make Private"
                            : "Click to Publish"
                        }
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200",
                          "border focus:outline-none focus:ring-2 focus:ring-offset-1",
                          isToggling && "opacity-60 cursor-not-allowed",
                          !isToggling && "hover:scale-105 cursor-pointer active:scale-95",
                          isPublic
                            ? "bg-green-500/10 text-green-600 border-green-500/30 hover:bg-green-500/20 focus:ring-green-500/40 dark:text-green-400"
                            : "bg-yellow-500/10 text-yellow-600 border-yellow-500/30 hover:bg-yellow-500/20 focus:ring-yellow-500/40 dark:text-yellow-400"
                        )}
                      >
                        {isToggling ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : isPublic ? (
                          <Globe className="w-3 h-3" />
                        ) : (
                          <Lock className="w-3 h-3" />
                        )}
                        {isPublic ? "Public" : "Private"}
                      </button>
                    </td>

                    {/* Date */}
                    <td className="p-4 text-xs text-muted-foreground hidden md:table-cell">
                      {new Date(course.createdAt).toLocaleDateString()}
                    </td>

                    {/* Stats */}
                    <td className="p-4 text-sm text-center font-medium">
                      {course.views || 0}
                    </td>
                    <td className="p-4 text-sm text-center text-muted-foreground">
                      {course.reviewCount || 0}
                    </td>
                    <td className="p-4 text-sm text-center text-muted-foreground">
                      {(course.rating * 10).toFixed(0) || 0}%
                    </td>

                    {/* Actions menu */}
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-2 hover:bg-muted rounded-full">
                            <MoreVertical className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onSelect={() =>
                              window.open(`/course/${course._id}`, "_blank")
                            }
                          >
                            <Eye className="w-4 h-4 mr-2" /> View on Skillfinix
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() =>
                              handleToggleVisibility(
                                course._id,
                                course.visibility
                              )
                            }
                            disabled={isToggling}
                          >
                            {isPublic ? (
                              <>
                                <Lock className="w-4 h-4 mr-2" /> Make Private
                              </>
                            ) : (
                              <>
                                <Globe className="w-4 h-4 mr-2" /> Make Public
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => navigate(`/studio/edit/${course._id}`)}
                          >
                            <Edit className="w-4 h-4 mr-2" /> Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share2 className="w-4 h-4 mr-2" /> Get Shareable
                            Link
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => navigate(`/studio/analytics/${course._id}`)}
                          >
                            <BarChart2 className="w-4 h-4 mr-2" /> Analytics
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-500 focus:text-red-500 focus:bg-red-50"
                            onSelect={() => openDeleteModal(course)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Delete Forever
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground">
                  {searchQuery
                    ? "No matching courses found."
                    : "You haven't uploaded any content yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>

    {/* Delete Confirmation Modal */}
    <DeleteConfirmModal
      isOpen={deleteModalOpen}
      onClose={() => setDeleteModalOpen(false)}
      onConfirm={handleDeleteConfirm}
      isDeleting={isDeleting}
      itemName={itemToDelete?.title}
    />
    </>
  );
};

export default StudioContent;