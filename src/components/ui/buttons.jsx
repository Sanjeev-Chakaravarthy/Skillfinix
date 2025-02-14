"use client";
import React from "react";
import { useNavigate } from "react-router-dom";

const Buttons = ({ route }) => {
  const navigate = useNavigate();

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full max-w-7xl mx-auto gap-10">
        <div className="flex flex-col items-center space-y-2">
          <button
            className="fixed bottom-12 right-15 bg-black text-white px-4 py-2 rounded-md transition duration-300 ease-in-out hover:bg-white hover:text-black hover:scale-105 cursor-pointer"
            onClick={() => navigate(route)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Buttons;
