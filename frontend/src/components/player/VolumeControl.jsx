import React, { useState, useEffect } from "react";
import { Volume2, Volume1, VolumeX } from "lucide-react";

const VolumeControl = ({ videoRef }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateVolumeState = () => {
      setVolume(video.volume);
      setMuted(video.muted);
    };

    video.addEventListener('volumechange', updateVolumeState);
    return () => video.removeEventListener('volumechange', updateVolumeState);
  }, [videoRef]);

  const handleToggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
  };

  const handleVolumeChange = (e) => {
    if (!videoRef.current) return;
    const val = parseFloat(e.target.value);
    videoRef.current.volume = val;
    if (val > 0 && videoRef.current.muted) {
      videoRef.current.muted = false;
    }
  };

  let VolumeIcon = Volume2;
  if (muted || volume === 0) VolumeIcon = VolumeX;
  else if (volume < 0.5) VolumeIcon = Volume1;

  return (
    <div 
      className="flex items-center gap-1.5 group relative h-full shrink-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button 
        onClick={handleToggleMute}
        className="text-white hover:text-primary transition-colors focus:outline-none p-1 rounded-full hover:bg-white/10"
      >
        <VolumeIcon className="w-[22px] h-[22px] stroke-[1.5]" />
      </button>

      {/* Slider container (expands on hover) */}
      <div 
        className={`flex items-center transition-all duration-300 ease-out overflow-hidden origin-left ${
          isHovered ? "w-src w-20 opacity-100" : "w-0 opacity-0"
        }`}
      >
        <input 
          type="range"
          min="0"
          max="1"
          step="0.02"
          value={muted ? 0 : volume}
          onChange={handleVolumeChange}
          className="w-[70px] h-[3px] bg-white/30 rounded-full appearance-none cursor-pointer accent-primary ml-1 outline-none"
          style={{
            background: `linear-gradient(to right, hsl(var(--primary)) ${(muted ? 0 : volume) * 100}%, rgba(255,255,255,0.3) ${(muted ? 0 : volume) * 100}%)`
          }}
        />
      </div>
    </div>
  );
};

export default React.memo(VolumeControl);
