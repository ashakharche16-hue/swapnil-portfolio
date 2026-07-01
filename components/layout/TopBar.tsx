import { seed } from "@/db/seed";
import { Icon } from "@/components/icons";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MobileNav } from "@/components/layout/MobileNav";

export function TopBar() {
  const { identity, nav } = seed;

  return (
    <header className="topbar">
      <div className="wrap topbar-inner">
        <MobileNav links={nav} />

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
            aria-label="Download résumé (PDF)"
            title="Download résumé"
          >
            <Icon name="download" />
          </a>
        </div>
      </div>
    </header>
  );
}
