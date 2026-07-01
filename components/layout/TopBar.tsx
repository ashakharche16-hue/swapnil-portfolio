import { seed } from "@/db/seed";
import { Icon } from "@/components/icons";
import { ThemeToggle } from "@/components/ThemeToggle";

export function TopBar() {
  const { identity, nav } = seed;

  return (
    <header className="topbar">
      <div className="wrap topbar-inner">
        <a href="#top" className="mark" aria-label={`${identity.name} — home`}>
          <span className="mark-dot" aria-hidden="true" />
          <span className="mark-label">
            <span className="for">{identity.initials}</span>{" "}
            <span className="available">/ {identity.availabilityLabel}</span>
          </span>
        </a>

        <nav className="primary" aria-label="Primary">
          {nav.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="topbar-actions">
          <ThemeToggle />
          <a
            className="icon-btn"
            href={identity.resumeUrl}
            download
            aria-label="Download Resume (PDF)"
            title="Download Resume"
          >
            <Icon name="download" />
          </a>
        </div>
      </div>
    </header>
  );
}
