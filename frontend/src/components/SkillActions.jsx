import React from "react";
import { ThumbsUp, ThumbsDown, Share2, Download, BarChart2, Edit, Trash2 } from "lucide-react";
import { CustomButton } from "./CustomButton";
import { useNavigate } from "react-router-dom";

const SkillActions = ({ 
  isOwner, 
  courseId,
  liked, 
  disliked,
  likesCount,
  onToggleLike, 
  onToggleDislike,
  onDownload,
  onOpenDeleteModal
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-wrap items-center gap-2">
      {isOwner ? (
        <>
          <CustomButton
            onClick={() => navigate(`/studio/analytics/${courseId}`)}
            variant="outline"
            size="sm"
            className="rounded-full shadow-sm hover:shadow-md transition-all font-semibold"
          >
            <BarChart2 className="mr-2 h-4 w-4" />
            Analytics
          </CustomButton>
          
          <CustomButton
            onClick={() => navigate(`/studio/edit/${courseId}`)}
            variant="outline"
            size="sm"
            className="rounded-full shadow-sm hover:shadow-md transition-all font-semibold"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Video
          </CustomButton>

          <CustomButton
            onClick={onOpenDeleteModal}
            variant="outline"
            size="sm"
            className="rounded-full shadow-sm hover:shadow-md transition-all text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 font-semibold"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </CustomButton>
        </>
      ) : (
        <>
          {/* Like / Dislike Pill */}
          <div className="flex items-center bg-card border border-border/60 rounded-full shadow-sm hover:shadow-md transition-all overflow-hidden">
            <button
              onClick={onToggleLike}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted ${liked ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <ThumbsUp className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
              {likesCount || 0}
            </button>
            <div className="w-px h-5 bg-border/60" />
            <button
              onClick={onToggleDislike}
              className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors hover:bg-muted ${disliked ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <ThumbsDown className={`h-4 w-4 mt-1 ${disliked ? "fill-current" : ""}`} />
            </button>
          </div>

          <CustomButton
            variant="outline"
            size="sm"
            className="rounded-full shadow-sm hover:shadow-md transition-all font-semibold bg-card text-foreground border-border/60"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert("Link copied to clipboard!"); // Ideally toast
            }}
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </CustomButton>

          <CustomButton
            variant="outline"
            size="sm"
            className="rounded-full shadow-sm hover:shadow-md transition-all font-semibold bg-card text-foreground border-border/60"
            onClick={onDownload}
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </CustomButton>
        </>
      )}
    </div>
  );
};

export default React.memo(SkillActions);
