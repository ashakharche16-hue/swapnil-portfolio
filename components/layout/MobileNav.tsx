"use client";

import { useEffect, useState } from "react";
import type { NavLink } from "@/types/content";
import { Icon } from "@/components/icons";
import { navHref } from "@/utils/nav";

/**
 * Mobile-only navigation: a hamburger button that toggles a full-width
 * dropdown of the section links. Hidden on desktop via CSS (the inline
 * `nav.primary` is shown there instead).
 */
export function MobileNav({
  links,
  anchorPrefix = "",
}: {
  links: NavLink[];
  anchorPrefix?: string;
}) {
  const [open, setOpen] = useState(false);

  // Close on Escape for keyboard users.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="mobile-nav">
      <button
        type="button"
        className="icon-btn"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        onClick={() => setOpen((v) => !v)}
      >
        <Icon name={open ? "close" : "menu"} />
      </button>

      {open && (
        <nav
          id="mobile-nav-panel"
          className="mobile-nav-panel"
          aria-label="Primary"
        >
          {links.map((link) => (
            <a
              key={link.href}
              href={navHref(link.href, anchorPrefix)}
              onClick={() => setOpen(false)}
              className={link.href === "/rag" ? "nav-demo" : undefined}
            >
              {link.label}
            </a>
          ))}
        </nav>
      )}
    </div>
  );
}
