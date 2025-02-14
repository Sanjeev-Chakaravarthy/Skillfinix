/* eslint-disable react/prop-types */
"use client";
import Buttons from './buttons'

import { cn } from "../../lib/utils";
import { motion, stagger, useAnimate, useInView } from "framer-motion";
import { useEffect } from "react";
import PropTypes from "prop-types";

const Typewriter = ({ words, className, cursorClassName }) => {
  const wordsArray = words.map((word) => ({
    ...word,
    text: word.text.split(""),
  }));

  const [scope, animate] = useAnimate();
  const isInView = useInView(scope);

  useEffect(() => {
    if (isInView) {
      animate(
        "span",
        {
          display: "inline-block",
          opacity: 1,
          width: "fit-content",
        },
        {
          duration: 0.3,
          delay: stagger(0.1),
          ease: "easeInOut",
        }
      );
    }
  }, [isInView, animate]);

  const renderWords = () => {
    return (
      <>
        <p className="text-2xl mb-16">
          Exchange Knowledge, Expand Opportunities!
        </p>
        <motion.div ref={scope} className="inline">
          {wordsArray.map((word, idx) => (
            <div key={`word-${idx}`} className="inline-block">
              {word.text.map((char, index) => (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  key={`char-${index}`}
                  className={cn(
                    "dark:text-white text-black opacity-0 hidden",
                    word.className
                  )}
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
            </div>
          ))}
        </motion.div>
      </>
    );
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          "text-base sm:text-xl md:text-3xl lg:text-5xl font-bold text-center",
          className
        )}
      >
        {renderWords()}
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className={cn(
            "inline-block rounded-sm w-[4px] h-4 md:h-6 lg:h-10 ",
            cursorClassName
          )}
        ></motion.span>
      </div>

      {/* Buttons */}
      <div className="mt-16 flex space-x-4">
        <button className="px-6 py-2 text-white border border-white font-semibold rounded-lg transition">
          Login
        </button>
        <button className="px-6 py-2 bg-white text-black border border-black font-semibold rounded-lg hover:bg-gray-200 transition">
          Sign Up
        </button>
      </div>
    </div>
  );
};
export default Typewriter;

// Default props
Typewriter.defaultProps = {
  words: [],
};

// Prop validation
Typewriter.propTypes = {
  words: PropTypes.array.isRequired,
};
