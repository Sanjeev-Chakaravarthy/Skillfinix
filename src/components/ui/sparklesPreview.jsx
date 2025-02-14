import React from "react";
import { SparklesCore } from "./sparkles";
import { useNavigate } from "react-router-dom";
import Buttons from "./buttons";

export function SparklesPreview() {
    const navigate = useNavigate();
  
    return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center overflow-hidden">
      <h1 className="md:text-3xl text-4xl lg:text-4xl font-bold text-center text-white relative z-20">
        Give what you know, get what you need - time and talent, beautifully exchanged.
      </h1>
      <div className="w-[40rem] h-40 relative">
        {/* Gradients */}
        <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[2px] w-3/4 blur-sm" />
        <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-px w-3/4" />
        <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-[5px] w-1/4 blur-sm" />
        <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px w-1/4" />

        {/* Core component */}
        <SparklesCore
          background="transparent"
          minSize={0.4}
          maxSize={1}
          particleDensity={1200}
          className="w-full h-full"
          particleColor="#FFFFFF"
        />

        {/* Radial Gradient to prevent sharp edges */}
        <div className="absolute inset-0 w-full h-full bg-black [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)]"></div>
      </div>
      <div className="relative flex flex-col items-center space-y-4 mt-8">
        <Buttons route="/vortexPreview"/>
      </div>
    </div>
  );
}
