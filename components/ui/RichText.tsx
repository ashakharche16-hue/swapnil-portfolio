import { Fragment } from "react";

/**
 * Renders the inline emphasis markers used throughout the seed content:
 *   **bold**     -> <strong> (body color, medium weight)
 *   __accent__   -> accent-colored text
 *   `mono`       -> accent-colored monospace (data/metric treatment)
 *
 * Everything else renders as plain text. Markers do not nest.
 */
const PATTERN = /(\*\*[^*]+\*\*|__[^_]+__|`[^`]+`)/g;

export function RichText({ text }: { text: string }) {
  const parts = text.split(PATTERN).filter(Boolean);

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-medium text-body">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("__") && part.endsWith("__")) {
          return (
            <span key={i} className="text-accent">
              {part.slice(2, -2)}
            </span>
          );
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <span key={i} className="font-mono text-accent">
              {part.slice(1, -1)}
            </span>
          );
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}
