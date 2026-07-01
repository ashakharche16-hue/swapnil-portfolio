"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { label: "Dashboard", href: "/admin" },
  { label: "Profile", href: "/admin/profile" },
];

// Editors added in Slice 4.
const SOON = [
  "About",
  "Experience",
  "Work",
  "AI",
  "Skills",
  "Recognition",
  "Contact",
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1" aria-label="Admin">
      {NAV.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-lg px-3 py-2 text-sm transition-colors ${
              active
                ? "bg-soft text-body"
                : "text-muted hover:bg-soft hover:text-body"
            }`}
          >
            {item.label}
          </Link>
        );
      })}

      <p className="mt-6 px-3 font-mono text-[10px] uppercase tracking-wider text-dim">
        Coming in Slice 4
      </p>
      {SOON.map((label) => (
        <span
          key={label}
          className="cursor-not-allowed px-3 py-2 text-sm text-dim"
          title="Available in Slice 4"
        >
          {label}
        </span>
      ))}
    </nav>
  );
}
