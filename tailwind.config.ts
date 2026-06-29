import type { Config } from "tailwindcss";

/**
 * Brand tokens are exposed as CSS variables (see app/globals.css) so they can
 * become database-driven in Slice 2 without touching component code.
 */
const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./contexts/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "var(--color-ink)",
        elevated: "var(--color-elevated)",
        hairline: "var(--color-border)",
        body: "var(--color-text)",
        muted: "var(--color-muted)",
        accent: "var(--color-accent)",
        signal: "var(--color-signal)",
      },
      fontFamily: {
        serif: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
