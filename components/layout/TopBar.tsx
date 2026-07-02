import type { NavLink, SiteIdentity } from "@/types/content";
import { Icon } from "@/components/icons";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MobileNav } from "@/components/layout/MobileNav";
import { navHref } from "@/utils/nav";

export function TopBar({
  identity,
  nav,
  anchorPrefix = "",
}: {
  identity: SiteIdentity;
  nav: NavLink[];
  /** Set to "/" on non-home pages so "#work" becomes "/#work". */
  anchorPrefix?: string;
}) {
  return (
    <header className="topbar">
      <div className="wrap topbar-inner">
        <MobileNav links={nav} anchorPrefix={anchorPrefix} />

        <nav className="primary" aria-label="Primary">
          {nav.map((link) => (
            <a
              key={link.href}
              href={navHref(link.href, anchorPrefix)}
              className={link.href === "/rag" ? "nav-demo" : undefined}
            >
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
