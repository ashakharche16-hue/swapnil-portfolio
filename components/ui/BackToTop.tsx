"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Icon } from "@/components/icons";

/**
 * Floating "back to top" button. Appears after scrolling down and smoothly
 * returns to the top of the page (instantly under prefers-reduced-motion).
 */
export function BackToTop() {
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toTop = () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  return (
    <button
      type="button"
      className={visible ? "back-to-top is-visible" : "back-to-top"}
      onClick={toTop}
      aria-label="Back to top"
      title="Back to top"
    >
      <Icon name="arrow-up" />
    </button>
  );
}
