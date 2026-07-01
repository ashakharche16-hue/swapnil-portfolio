"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { indefiniteArticle } from "@/utils/article";

interface RotatingTextProps {
  items: string[];
  /** Class applied to the rotating word (e.g. the accent treatment). */
  className?: string;
  intervalMs?: number;
  /**
   * Prepend the correct indefinite article ("a" / "an") for the current word.
   * The article sits outside the rotation animation, so it stays put and only
   * updates when it actually needs to change (e.g. "a" -> "an").
   */
  withArticle?: boolean;
}

export function RotatingText({
  items,
  className,
  intervalMs = 2500,
  withArticle = false,
}: RotatingTextProps) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion || items.length <= 1) return;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [reduceMotion, items.length, intervalMs]);

  const word = items[index];
  const article = withArticle ? indefiniteArticle(word) : null;

  const rotatingWord = reduceMotion ? (
    <span className={className}>{word}</span>
  ) : (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={word}
        style={{ display: "inline-block" }}
        initial={{ opacity: 0, y: "0.35em" }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: "-0.35em" }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <span className={className}>{word}</span>
      </motion.span>
    </AnimatePresence>
  );

  return (
    <span className="rotating-text">
      {article && <>{article} </>}
      {rotatingWord}
    </span>
  );
}
