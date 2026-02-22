import React, { useState, useEffect } from "react";
import { Settings, Check, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2.0];

const PlaybackSettings = ({ videoRef }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menu, setMenu] = useState("main"); // "main" or "speed"
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleRateChange = () => {
      setPlaybackRate(video.playbackRate);
    };

    video.addEventListener("ratechange", handleRateChange);
    return () => video.removeEventListener("ratechange", handleRateChange);
  }, [videoRef]);

  const changeSpeed = (rate) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = rate;
    setIsOpen(false);
  };

  return (
    <div className="relative flex items-center h-full">
      <button 
        onClick={() => { setIsOpen(!isOpen); setMenu("main"); }}
        className={cn(
          "text-white hover:text-primary transition-transform duration-300 focus:outline-none p-1 rounded-full hover:bg-white/10",
          isOpen ? "rotate-90 text-primary" : ""
        )}
      >
        <Settings className="w-[22px] h-[22px] stroke-[1.5]" />
      </button>

      {/* Flyout Menu */}
      {isOpen && (
        <>
          {/* Overlay to close when clicking outside */}
          <div 
            className="fixed inset-0 z-40 bg-transparent" 
            onClick={() => setIsOpen(false)}
          />
          
          <div className="absolute right-0 bottom-[125%] mb-2 z-50 w-52 bg-black/80 backdrop-blur-xl border border-white/5 shadow-[0_0_30px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden font-medium text-white/90 animate-in fade-in zoom-in-95 origin-bottom-right">
            {menu === "main" && (
              <div className="py-2 text-[13px]">
                <button 
                  className="w-full flex justify-between items-center px-4 py-2 hover:bg-white/10 transition-colors"
                  onClick={() => setMenu("speed")}
                >
                  <span>Session Speed</span>
                  <span className="text-white/50">{playbackRate === 1 ? 'Normal' : `${playbackRate}x`}</span>
                </button>
                <div className="border-t border-white/10 mt-1 mb-1" />
                <button 
                  className="w-full flex justify-between items-center px-4 py-2 hover:bg-white/10 transition-colors"
                  disabled
                >
                  <span>Quality</span>
                  <span className="text-white/50">Auto</span>
                </button>
              </div>
            )}

            {menu === "speed" && (
              <div className="py-2 max-h-[300px] overflow-y-auto scrollbar-thin text-[13px]">
                <button 
                  className="w-full flex items-center gap-2 px-4 py-2 border-b border-white/10 mb-1 hover:bg-white/10 transition-colors"
                  onClick={() => setMenu("main")}
                >
                  <ChevronLeft className="w-4 h-4 ml-[-6px]" />
                  <span>Session Speed</span>
                </button>
                {speeds.map(rate => (
                  <button 
                    key={rate}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-white/10 transition-colors relative"
                    onClick={() => changeSpeed(rate)}
                  >
                    <div className="w-3">
                      {playbackRate === rate && <Check className="w-4 h-4 text-primary absolute left-3 top-2.5" />}
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
