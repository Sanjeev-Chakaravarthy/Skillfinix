import React, { useState } from "react";
import { Volume2, Volume1, VolumeX } from "lucide-react";

const VolumeControl = ({ volume, muted, onVolumeChange, onToggleMute }) => {
  const [isHovered, setIsHovered] = useState(false);

  let VolumeIcon = Volume2;
  if (muted || volume === 0) VolumeIcon = VolumeX;
  else if (volume < 0.5) VolumeIcon = Volume1;

  return (
    <div 
      className="flex items-center gap-2 group relative h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button 
        onClick={onToggleMute}
        className="text-white hover:text-primary transition-colors focus:outline-none"
      >
        <VolumeIcon className="w-5 h-5" />
      </button>

      {/* Slider container (expands on hover) */}
      <div 
        className={`flex items-center transition-all duration-300 ease-out overflow-hidden ${
          isHovered ? "w-20 opacity-100" : "w-0 opacity-0"
        }`}
      >
        <input 
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={muted ? 0 : volume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          className="w-full h-1 bg-white/30 rounded-full appearance-none cursor-pointer accent-primary"
          style={{
            background: `linear-gradient(to right, hsl(var(--primary)) ${(muted ? 0 : volume) * 100}%, rgba(255,255,255,0.3) ${(muted ? 0 : volume) * 100}%)`
          }}
        />
      </div>
    </div>
  );
};

export default React.memo(VolumeControl);
