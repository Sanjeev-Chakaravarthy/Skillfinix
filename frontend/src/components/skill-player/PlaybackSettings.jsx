import React, { useState } from "react";
import { Settings, Check, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const PlaybackSettings = ({ playbackRate, onPlaybackRateChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menu, setMenu] = useState("main"); // main, speed

  const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  return (
    <div className="relative flex items-center h-full">
      <button 
        onClick={() => { setIsOpen(!isOpen); setMenu("main"); }}
        className={cn(
          "text-white hover:text-primary transition-transform duration-300 focus:outline-none",
          isOpen ? "rotate-90 text-primary" : ""
        )}
      >
        <Settings className="w-5 h-5" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Overlay to close */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          <div className="absolute bottom-12 right-0 bg-black/90 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl z-50 w-48 text-sm overflow-hidden text-white font-medium animate-in fade-in zoom-in-95 origin-bottom-right">
            {menu === "main" && (
              <div className="py-2">
                <button 
                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/10 transition-colors"
                  onClick={() => setMenu("speed")}
                >
                  <span>Session Speed</span>
                  <span className="text-white/70">{playbackRate === 1 ? "Normal" : `${playbackRate}x`}</span>
                </button>
              </div>
            )}

            {menu === "speed" && (
              <div className="py-2 max-h-60 overflow-y-auto scrollbar-thin">
                <button 
                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-white/10 transition-colors border-b border-white/10 mb-1"
                  onClick={() => setMenu("main")}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Session Speed</span>
                </button>
                {speeds.map(rate => (
                  <button 
                    key={rate}
                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-white/10 transition-colors"
                    onClick={() => {
                      onPlaybackRateChange(rate);
                      setIsOpen(false);
                    }}
                  >
                    <div className="w-4 flex justify-center">
                      {playbackRate === rate && <Check className="w-4 h-4 text-primary" />}
                    </div>
                    <span>{rate === 1 ? "Normal" : `${rate}x`}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default React.memo(PlaybackSettings);
