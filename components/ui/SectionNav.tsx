"use client";

import { useEffect } from "react";

/**
 * When a same-page anchor (e.g. #experience) is navigated to — via the top nav,
 * a hero CTA, or a hash on initial load — expand that section's collapsible
 * panel and smooth-scroll to it. The section can still be collapsed/expanded
 * normally afterward; this only forces it open on navigation.
 */
export function SectionNav() {
  useEffect(() => {
    function openTarget(id: string) {
      if (!id) return;
      const el = document.getElementById(id);
      if (!el) return;
      const details = el.matches("details.section-collapsible")
        ? (el as HTMLDetailsElement)
        : el.querySelector<HTMLDetailsElement>("details.section-collapsible");
      if (details) details.open = true;
      requestAnimationFrame(() =>
        el.scrollIntoView({ behavior: "smooth", block: "start" }),
      );
    }

    function onHashChange() {
      openTarget(decodeURIComponent(location.hash.slice(1)));
    }

    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey)
        return;
      const anchor = (
        e.target as HTMLElement | null
      )?.closest<HTMLAnchorElement>('a[href*="#"]');
      if (!anchor) return;
      const href = anchor.getAttribute("href") ?? "";
      const hashIdx = href.indexOf("#");
      if (hashIdx < 0) return;
      const path = href.slice(0, hashIdx);
      const id = href.slice(hashIdx + 1);
      // Only handle anchors that resolve to this page (e.g. "#work" or "/#work").
      const samePage =
        path === "" || (path === "/" && location.pathname === "/");
      if (!samePage || !id || !document.getElementById(id)) return;
      e.preventDefault();
      if (location.hash !== `#${id}`) history.pushState(null, "", `#${id}`);
      openTarget(id);
    }

    // Handle a hash present on initial load (e.g. arriving from /rag → /#work).
    if (location.hash) requestAnimationFrame(onHashChange);
    window.addEventListener("hashchange", onHashChange);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("hashchange", onHashChange);
      document.removeEventListener("click", onClick);
    };
  }, []);

  return null;
}
