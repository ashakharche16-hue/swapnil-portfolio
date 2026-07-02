import type { SectionHeading } from "@/types/content";
import { RichText } from "@/components/ui/RichText";

/**
 * A content section that collapses to its title + a brief teaser, and expands
 * to reveal the full body. Uses a native <details>/<summary> so it's keyboard
 * accessible, needs no client JS, and keeps the body in the DOM for SEO.
 */
export function CollapsibleSection({
  id,
  heading,
  teaser,
  defaultOpen = false,
  children,
}: {
  id: string;
  heading: SectionHeading;
  /** Short teaser shown when collapsed. Falls back to the heading lead. */
  teaser?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const teaserText = teaser ?? heading.lead;

  return (
    <section className="block" id={id}>
      <div className="wrap">
        <details className="section-collapsible" open={defaultOpen}>
          <summary className="section-summary">
            <div className="head-main">
              <div className="label">
                <h2 className="eyebrow">
                  <span className="num">{heading.num}</span>
                  {heading.title}
                </h2>
                {heading.meta && <span className="meta">{heading.meta}</span>}
              </div>
              <div className="summary-lead">
                {teaserText && (
                  <p>
                    <RichText text={teaserText} />
                  </p>
                )}
              </div>
            </div>
            <span className="section-chevron" aria-hidden="true">
              ▸
            </span>
          </summary>
          <div className="section-body">{children}</div>
        </details>
      </div>
    </section>
  );
}
