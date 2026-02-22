import React, { useState, useEffect } from "react";
import { 
  Play, Pause, Maximize, Minimize, PictureInPicture, 
  RectangleHorizontal, Forward, Rewind
} from "lucide-react";
import ProgressBar from "./ProgressBar";
import VolumeControl from "./VolumeControl";
import PlaybackSettings from "./PlaybackSettings";

const formatTime = (timeInSeconds) => {
  if (isNaN(timeInSeconds) || timeInSeconds < 0) return "00:00";
  const h = Math.floor(timeInSeconds / 3600);
  const m = Math.floor((timeInSeconds % 3600) / 60);
  const s = Math.floor(timeInSeconds % 60);
  if (h > 0) return `${h}:${m < 10 ? "0" + m : m}:${s < 10 ? "0" + s : s}`;
  return `${m}:${s < 10 ? "0" + s : s}`;
};

const PlayerControls = ({ 
  videoRef,
  title, 
  showControls, 
  isFullscreen, 
  isTheaterMode, 
  togglePlayPause, 
  toggleFullscreen, 
  toggleTheaterMode,
  toggleMiniPlayer
}) => {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Instead of updating React state precisely (which lags), we only sync UI clock strings here.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let frameId;
    const syncTime = () => {
      setCurrentTime(video.currentTime || 0);
      frameId = requestAnimationFrame(syncTime);
    };

    const handlePlay = () => {
      setPlaying(true);
      frameId = requestAnimationFrame(syncTime);
    };

    const handlePause = () => {
      setPlaying(false);
      cancelAnimationFrame(frameId);
    };

    const handleMeta = () => setDuration(video.duration);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('loadedmetadata', handleMeta);
    video.addEventListener('durationchange', handleMeta);

    // Initial check
    if (!video.paused) handlePlay();
    if (video.readyState >= 1) handleMeta();

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('loadedmetadata', handleMeta);
      video.removeEventListener('durationchange', handleMeta);
      cancelAnimationFrame(frameId);
    };
  }, [videoRef]);

  return (
    <div 
      className={`absolute inset-0 flex flex-col justify-between z-20 transition-opacity duration-300 pointer-events-none ${
        showControls ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Top Bar Wrapper (Shadow) */}
      <div className="absolute top-0 left-0 w-full h-[120px] bg-gradient-to-b from-black/80 to-transparent pointer-events-none" />
      
      {/* Top Content */}
      <div className="relative pt-4 px-4 sm:px-6 w-full flex justify-between items-start pointer-events-auto shrink-0">
        <h2 className="text-white/95 font-semibold text-base sm:text-lg drop-shadow-md line-clamp-1 flex-1 pr-4 tracking-wide shadow-black">
          {title}
        </h2>
      </div>

      {/* Bottom Bar Wrapper (Shadow) */}
      <div className="absolute bottom-0 left-0 w-full h-[140px] bg-gradient-to-t from-black/95 via-black/50 to-transparent pointer-events-none" />
      
      {/* Bottom Content Row */}
      <div className="relative pb-3 px-3 sm:px-5 w-full shrink-0 pointer-events-auto flex flex-col gap-2">
        <ProgressBar videoRef={videoRef} />
        
        <div className="flex items-center justify-between">
          
          {/* Left Actions */}
          <div className="flex items-center gap-3 sm:gap-5">
            <button 
              onClick={togglePlayPause}
              className="text-white hover:text-primary transition-transform hover:scale-110 p-1 rounded-full hover:bg-white/10 focus:outline-none"
            >
               {playing ? (
                  <svg className="w-[26px] h-[26px] fill-current" viewBox="0 0 24 24"><path d="M6 4h4v16H6zm8 0h4v16h-4z"/></svg>
                ) : (
                  <svg className="w-[26px] h-[26px] fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                )}
            </button>
            <VolumeControl videoRef={videoRef} />

            <div className="text-white/90 text-[13px] font-medium tracking-wider hidden sm:block pointer-events-none drop-shadow-sm ml-1">
              {formatTime(currentTime)}<span className="opacity-40 mx-[5px]">/</span>{formatTime(duration)}
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 shrink-0 pr-1">
            <PlaybackSettings videoRef={videoRef} />

            {/* Deep Learn Mode (Theater) */}
            <button 
              onClick={toggleTheaterMode}
              className="text-white hover:text-primary transition-all hover:scale-110 p-1.5 rounded-full hover:bg-white/10 hidden sm:block focus:outline-none"
              title="Deep Learn Mode (Theater)"
            >
               <RectangleHorizontal className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] stroke-[1.5]" />
            </button>

            {/* Fullscreen */}
            <button 
              onClick={toggleFullscreen}
              className="text-white hover:text-primary transition-all hover:scale-110 p-1.5 rounded-full hover:bg-white/10 focus:outline-none"
              title="Fullscreen (F)"
            >
               {isFullscreen ? (
                  <Minimize className="w-[18px] h-[18px] sm:w-[22px] sm:h-[22px] stroke-[1.5]" />
                ) : (
                  <Maximize className="w-[18px] h-[18px] sm:w-[22px] sm:h-[22px] stroke-[1.5]" />
                )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(PlayerControls);
