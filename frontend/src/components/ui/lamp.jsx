"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import { useNavigate } from "react-router-dom";
import Buttons  from "./buttons";

export function LampDemo() {
  const navigate = useNavigate();

  return (
    <LampContainer>
      <motion.h1
        initial={{ opacity: 0.5, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 1.5,
          ease: "easeInOut",
        }}
        className="mt-8 bg-gradient-to-br from-slate-300 to-slate-500 py-4 bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-5xl"
      >
        Step into a world of skill exchange - where learning meets transformation <br /><br />
        <span> Welcome to <strong>SKILLFINIX.</strong></span>
      </motion.h1>
    </LampContainer>
  );
}

export const LampContainer = ({ children, className }) => {
  return (
    <div
      className={cn(
        "relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 w-full",
        className
      )}
    >
      <div className="relative flex w-full flex-1 scale-y-125 items-center justify-center isolate z-0">
        {["from_70deg_at_center_top", "from_290deg_at_center_top"].map((pos, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0.5, width: "35rem" }}
            whileInView={{ opacity: 1, width: "50rem" }}
            transition={{ delay: 0.3, duration: 1.5, ease: "easeInOut" }}
            style={{
              backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
            }}
            className={`absolute inset-auto ${index === 0 ? "right-1/2" : "left-1/2"} h-56 w-[30rem] bg-gradient-conic ${
              index === 0 ? "from-violet-500 via-transparent to-transparent" : "from-transparent via-transparent to-violet-500"
            } text-white [--conic-position:${pos}]`}
          >
            <div className={`absolute w-[100%] ${index === 0 ? "left-0" : "right-0"} h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]`} />
            <div className={`absolute w-40 h-[100%] ${index === 0 ? "left-0" : "right-0"} bg-slate-950 bottom-0 z-20 [mask-image:linear-gradient(${index === 0 ? "to_right" : "to_left"},white,transparent)]`} />
          </motion.div>
        ))}
        <div className="absolute top-1/2 h-48 w-full translate-y-12 scale-x-150 blur-2xl"></div>
        <div className="absolute top-1/2 z-50 h-48 w-full bg-transparent opacity-10 backdrop-blur-md"></div>
        <div className="absolute inset-auto z-50 h-36 w-[1rem] -translate-y-1/2 rounded-full bg-gradient-to-r from-purple-400 to-violet-500 opacity-50 blur-3xl"></div>
        <motion.div
          initial={{ width: "33rem" }}
          whileInView={{ width: "48rem" }}
          transition={{ delay: 0.3, duration: 2, ease: "easeInOut" }}
          className="absolute inset-auto z-30 h-36 w-64 -translate-y-[10rem] rounded-full bg-gradient-to-r from-purple-400 to-violet-500 blur-2xl"
        ></motion.div>
        <motion.div
          initial={{ width: "35rem" }}
          whileInView={{ width: "50rem" }}
          transition={{ delay: 0.3, duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-auto z-50 h-0.5 w-[30rem] -translate-y-[7rem] bg-gradient-to-r from-purple-400 to-violet-500"
        ></motion.div>
        <div className="absolute inset-auto z-40 h-44 w-full -translate-y-[12.5rem] bg-slate-950"></div>
      </div>
      <div className="relative z-50 flex -translate-y-80 flex-col items-center px-5">{children}</div>
      <div className="relative flex flex-col items-center space-y-4 mt-8">
        <Buttons route="/sparklesPreview" />
      </div>
    </div>
  );
};
