import React from "react";
import { Vortex } from "./vortex";
import { useNavigate } from "react-router-dom";
import Buttons  from "./buttons";

export function VortexDemo() {
    const navigate = useNavigate();
    
  return (
    <div className="min-h-screen min-w-screen w-[calc(100%-4rem)] mx-auto h-[30rem] overflow-hidden">
      <Vortex
        backgroundColor="black"
        className="flex items-center flex-col justify-center px-2 md:px-10 py-4 w-full h-full"
      >
        <h2 className="text-white text-2xl md:text-6xl font-bold text-center">
          A world where your skills are currency - trade, learn, and succeed together
        </h2>
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-6">
          <Buttons route="/vortexPreview"/>
        </div>
      </Vortex>
    </div>
  );
}
