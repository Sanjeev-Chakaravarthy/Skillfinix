import React, { useState, useEffect } from "react";
import { 
  Play, Pause, Maximize, Minimize, Volume2, VolumeX, 
  Settings, PictureInPicture, RectangleHorizontal, Subtitles
} from "lucide-react";
import { cn } from "@/lib/utils";
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
  playerState,
  title,
  showControls,
  onPlayPause,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onPlaybackRateChange,
  onToggleFullscreen,
  onToggleTheaterMode,
  onToggleMiniPlayer
}) => {
  const { 
    playing, currentTime, duration, volume, muted, 
    playbackRate, isFullscreen, isTheaterMode, isBuffering 
  } = playerState;

  return (
    <div 
      className={cn(
        "absolute inset-0 flex flex-col justify-between p-4 transition-opacity duration-300 z-10",
        showControls ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      {/* Top Gradient for Title */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/80 to-transparent pointer-events-none" />
      
      {/* Top Bar Area (Title usually, but optional) */}
      <div className="relative flex justify-between items-start pt-2 px-2 shrink-0">
        <h2 className="text-white font-semibold text-lg drop-shadow-md line-clamp-1">{title}</h2>
      </div>

      {/* Middle Area for Play/Pause visual feedback (Double Tap UI handled in wrapper) */}
      <div className="flex-1 flex items-center justify-center relative">
        {isBuffering && (
          <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Bottom Gradient Overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/90 via-black/60 to-transparent pointer-events-none" />

      {/* Bottom Controls Wrapper */}
      <div className="relative shrink-0 flex flex-col gap-2 pb-2 px-2">
        <ProgressBar 
          currentTime={currentTime} 
          duration={duration} 
          onSeek={onSeek} 
        />

        {/* Buttons Row */}
        <div className="flex items-center justify-between mt-1">
          {/* Left Controls */}
          <div className="flex items-center gap-4">
            <button 
              onClick={onPlayPause}
              className="text-white hover:text-primary transition-colors focus:outline-none"
            >
              {playing ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
            </button>

            <VolumeControl 
              volume={volume} 
              muted={muted} 
              onVolumeChange={onVolumeChange}
              onToggleMute={onToggleMute}
            />

            <div className="text-white/90 text-sm font-medium tracking-wide">
              {formatTime(currentTime)} <span className="text-white/50 mx-1">/</span> {formatTime(duration)}
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-4">
            <PlaybackSettings 
              playbackRate={playbackRate} 
              onPlaybackRateChange={onPlaybackRateChange}
            />

            <button 
              onClick={onToggleMiniPlayer}
              className="text-white hover:text-primary transition-colors focus:outline-none relative group"
              title="Focus Mode (MiniPlayer)"
            >
              <PictureInPicture className="w-5 h-5" />
            </button>

            <button 
              onClick={onToggleTheaterMode}
              className="text-white hover:text-primary transition-colors focus:outline-none"
              title="Deep Learn Mode (Theater Mode)"
            >
              <RectangleHorizontal className="w-5 h-5" />
            </button>

            <button 
              onClick={onToggleFullscreen}
              className="text-white hover:text-primary transition-colors focus:outline-none"
              title="Fullscreen"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(PlayerControls);
