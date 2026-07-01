"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { label: "Dashboard", href: "/admin" },
  { label: "Profile", href: "/admin/profile" },
  { label: "Sections", href: "/admin/sections" },
];

const SECTIONS = [
  { label: "Metrics", key: "metrics" },
  { label: "About", key: "about" },
  { label: "Experience", key: "experience" },
  { label: "Selected Work", key: "work" },
  { label: "AI Engineering", key: "ai" },
  { label: "Capabilities", key: "skills" },
  { label: "Recognition", key: "recognition" },
  { label: "Contact", key: "contact" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  function linkClass(active: boolean) {
    return `rounded-lg px-3 py-2 text-sm transition-colors ${
      active ? "bg-soft text-body" : "text-muted hover:bg-soft hover:text-body"
    }`;
  }

  return (
    <nav className="flex flex-col gap-1" aria-label="Admin">
      {NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={pathname === item.href ? "page" : undefined}
          className={linkClass(pathname === item.href)}
        >
          {item.label}
        </Link>
      ))}

      <p className="mt-6 px-3 font-mono text-[10px] uppercase tracking-wider text-dim">
        Edit sections
      </p>
      {SECTIONS.map((s) => {
        const href = `/admin/sections/${s.key}`;
        return (
          <Link
            key={s.key}
            href={href}
            aria-current={pathname === href ? "page" : undefined}
            className={linkClass(pathname === href)}
          >
            {s.label}
          </Link>
        );
      })}
    </nav>
  );
}
