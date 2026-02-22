import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/api/axios";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { ChevronDown, ChevronUp } from "lucide-react";

// Modular Components
import SkillVideoPlayer from "@/components/player/SkillVideoPlayer";
import SkillStats from "@/components/SkillStats";
import SkillActions from "@/components/SkillActions";
import SkillOwnerCard from "@/components/SkillOwnerCard";
import DiscussionSection from "@/components/DiscussionSection";
import RecommendedSkills from "@/components/RecommendedSkills";

const WatchVideo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [showFullDesc, setShowFullDesc] = useState(false);

  // Interaction states
  const [liked, setLiked] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [watchLater, setWatchLater] = useState(false);

  useEffect(() => {
    const fetchCourseData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: courseData } = await api.get(`/courses/${id}`);
        setCourse(courseData);

        const { data: recData } = await api.get('/courses/recommended');
        setRecommended(recData || []);

        // Record history quietly
        try { await api.post('/interactions/history', { courseId: id }); } catch (e) {}
        
        // Auto-enroll in DB when arriving on page quietly
        try { await api.post('/enrollments', { courseId: id }); } catch (e) {}

        // Check toggles quietly
        try {
          const [likeRes, favRes, wlRes] = await Promise.all([
            api.get(`/interactions/check/${id}/like`),
            api.get(`/interactions/check/${id}/favorite`),
            api.get(`/interactions/check/${id}/watch_later`),
          ]);
          setLiked(likeRes.data.active);
          setFavorited(favRes.data.active);
          setWatchLater(wlRes.data.active);
        } catch (e) {}

      } catch (err) {
        console.error("Error fetching skill session:", err);
        setError("Failed to load skill session. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id, user]);

  const handleToggle = async (type) => {
    try {
      const { data } = await api.post('/interactions', { courseId: id, type });
      if (type === 'like') setLiked(data.active);
      if (type === 'favorite') setFavorited(data.active);
      if (type === 'watch_later') setWatchLater(data.active);
      toast({ title: data.message });
    } catch (err) {
      toast({ title: "Error", description: "Failed to update preference", variant: "destructive" });
    }
  };

  const handleRequestSwap = () => {
    if (!course?.user) return;
    // Redirect to SkillChat to start negotiation or swap page
    navigate('/skill-chat', { state: { selectedUserId: course.user, message: `Hi! I found your skill session "${course.title}" and would love to propose a skill swap.` }});
  };

  const handleMessageClick = () => {
    if (!course?.user) return;
    navigate('/skill-chat', { state: { selectedUserId: course.user }});
  };

  return (
    <div className="max-w-[1600px] mx-auto p-4 lg:p-6 flex flex-col xl:flex-row gap-8 lg:gap-10 min-h-screen">
      
      {/* Left Column (Main Content) */}
      <div className="w-full xl:w-[72%] max-w-[1100px] mx-auto xl:mx-0 flex flex-col gap-5">
        
        {/* The YouTube-like Skill Player */}
        <SkillVideoPlayer course={course} loading={loading} error={error} />
        
        {!loading && course && (
          <div className="flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-500">
            {/* Title */}
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold font-heading text-foreground leading-tight">
              {course.title}
            </h1>
            
            {/* Stats & Actions Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
              <SkillStats course={course} />
              <SkillActions 
                liked={liked} 
                favorited={favorited} 
                watchLater={watchLater} 
                onToggle={handleToggle}
                onRequestSwap={handleRequestSwap}
              />
            </div>

            {/* Profile Bar */}
            <SkillOwnerCard course={course} onMessageClick={handleMessageClick} />

            {/* Expandable Description */}
            {course.description && (
              <div className="bg-muted/40 hover:bg-muted/60 transition-colors rounded-2xl p-4 sm:p-5 border border-border/40 text-sm mt-2 shadow-sm relative">
                <div className={`text-foreground/90 whitespace-pre-wrap leading-relaxed ${!showFullDesc ? "line-clamp-2" : ""}`}>
                   {course.description}
                </div>
                {course.description.length > 150 && (
                  <button 
                    onClick={() => setShowFullDesc(!showFullDesc)}
                    className="mt-2 font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                  >
                    {showFullDesc ? "Show Less" : "Show More"}
                    {showFullDesc ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
                  </button>
                )}
              </div>
            )}

            {/* Discussions / Comments */}
            <DiscussionSection courseId={id} />
          </div>
        )}
      </div>

      {/* Right Column (Sidebar Recommendations) */}
      <div className="w-full xl:w-[28%] xl:min-w-[350px]">
        <div className="xl:sticky xl:top-24 space-y-6">
          <RecommendedSkills courses={recommended} currentId={id} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default WatchVideo;
