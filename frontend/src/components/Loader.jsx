import React from "react";
import { cn } from "@/lib/utils";

const Loader = ({ size = "md", className, text }) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        className
      )}
    >
      <div className="relative">
        <div
          className={cn(
            "rounded-full border-2 border-muted animate-spin",
            sizeClasses[size]
          )}
          style={{
            borderTopColor: "hsl(var(--primary))",
            borderRightColor: "hsl(var(--secondary))",
          }}
        />
        <div
          className={cn(
            "absolute inset-0 rounded-full border-2 border-transparent animate-spin",
            sizeClasses[size]
          )}
          style={{
            borderTopColor: "hsl(var(--primary) / 0.3)",
            animationDirection: "reverse",
            animationDuration: "1.5s",
          }}
        />
      </div>
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

export const FullPageLoader = ({ text = "Loading..." }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Loader size="lg" text={text} />
    </div>
  );
};

export const SkeletonCard = ({ className }) => {
  return (
    <div className={cn("rounded-2xl bg-card p-4 shadow-card", className)}>
      <div className="skeleton-pulse mb-4 h-40 rounded-xl" />
      <div className="skeleton-pulse mb-2 h-4 w-3/4" />
      <div className="skeleton-pulse mb-4 h-3 w-1/2" />
      <div className="flex items-center gap-2">
        <div className="skeleton-pulse h-8 w-8 rounded-full" />
        <div className="skeleton-pulse h-3 w-20" />
      </div>
    </div>
  );
};

export const SkeletonText = ({ lines = 3, className }) => {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton-pulse h-4"
          style={{ width: `${Math.random() * 40 + 60}%` }}
        />
      ))}
    </div>
  );
};

export default Loader;
