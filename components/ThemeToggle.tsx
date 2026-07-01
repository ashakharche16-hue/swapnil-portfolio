"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { Icon } from "@/components/icons";

/**
 * Both icons are always rendered; CSS shows the right one per [data-theme].
 * This keeps server and client markup identical (no hydration mismatch) while
 * still reflecting the saved theme that the no-flash script applied pre-paint.
 */
export function ThemeToggle() {
  const { toggleTheme } = useTheme();

  return (
    <button
      type="button"
      className="icon-btn"
      onClick={toggleTheme}
      aria-label="Toggle color theme"
      title="Toggle theme"
    >
      <Icon name="moon" className="theme-moon" />
      <Icon name="sun" className="theme-sun" />
    </button>
  );
}
