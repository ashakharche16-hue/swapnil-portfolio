import type { FooterContent } from "@/types/content";

export function Footer({ data }: { data: FooterContent }) {
  const footer = data;
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="wrap footer-inner">
        <div>
          © {year} {footer.copyrightName}. All rights reserved.
        </div>
        <div className="build">
          <span className="dot" aria-hidden="true" /> {footer.build}
        </div>
      </div>
    </footer>
  );
}
