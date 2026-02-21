import React from "react";
import { ThumbsUp, Heart, BookmarkPlus, ArrowRightLeft, Share2 } from "lucide-react";
import { CustomButton } from "./CustomButton";

const SkillActions = ({ liked, favorited, watchLater, onToggle, onRequestSwap }) => {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <CustomButton
        onClick={() => onToggle('like')}
        variant={liked ? 'default' : 'outline'}
        size="sm"
        className={`rounded-full shadow-sm hover:shadow-md transition-all ${liked ? 'bg-primary text-primary-foreground' : 'text-foreground'}`}
      >
        <ThumbsUp className={`mr-2 h-4 w-4 ${liked ? "fill-current" : ""}`} />
        {liked ? "Appreciated" : "Appreciate"}
      </CustomButton>

      <CustomButton
        onClick={() => onToggle('watch_later')}
        variant={watchLater ? 'secondary' : 'outline'}
        size="sm"
        className="rounded-full shadow-sm hover:shadow-md transition-all"
      >
        <BookmarkPlus className={`mr-2 h-4 w-4 ${watchLater ? 'text-primary' : ''}`} />
        {watchLater ? 'Saved for Practice' : 'Save Skill'}
      </CustomButton>

      <CustomButton
        onClick={() => onToggle('favorite')}
        variant={favorited ? 'secondary' : 'outline'}
        size="sm"
        className="rounded-full shadow-sm hover:shadow-md transition-all"
        title="Add to Favorites"
      >
        <Heart className={`mr-2 h-4 w-4 ${favorited ? "fill-rose-500 text-rose-500" : ""}`} />
        Favorite
      </CustomButton>

      <CustomButton
        onClick={onRequestSwap}
        variant="default"
        size="sm"
        className="rounded-full bg-violet-600 hover:bg-violet-700 text-white shadow-xl hover:shadow-violet-600/30 transition-all font-semibold ml-auto sm:ml-0"
      >
        <ArrowRightLeft className="mr-2 h-4 w-4" />
        Request Swap
      </CustomButton>

      <CustomButton
        variant="ghost"
        size="icon"
        className="rounded-full hover:bg-muted"
        title="Share Skill"
        onClick={() => {
          navigator.clipboard.writeText(window.location.href);
          alert("Link copied to clipboard!"); // Ideally toast
        }}
      >
        <Share2 className="h-4 w-4" />
      </CustomButton>
    </div>
  );
};

export default React.memo(SkillActions);
