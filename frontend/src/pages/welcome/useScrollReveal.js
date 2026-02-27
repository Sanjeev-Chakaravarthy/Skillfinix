import { useEffect, useRef } from "react";

/**
 * Adds `sf-visible` class to elements with `sf-fade-up`, `sf-slide-left`,
 * `sf-slide-right`, or `sf-scale-in` when they enter the viewport.
 * @param {string} selector - CSS selector for elements to observe
 * @param {number} threshold - intersection threshold (0–1)
 */
export function useScrollReveal(selector = "[data-reveal]", threshold = 0.15) {
  const observerRef = useRef(null);

  useEffect(() => {
    const elements = document.querySelectorAll(selector);
    if (!elements.length) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("sf-visible");
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );

    elements.forEach((el) => observerRef.current.observe(el));

    return () => {
      observerRef.current?.disconnect();
    };
  }, [selector, threshold]);
}
