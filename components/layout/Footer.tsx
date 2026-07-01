import { seed } from "@/db/seed";

export function Footer() {
  const { footer } = seed;
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
