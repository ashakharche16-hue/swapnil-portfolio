import type { SectionHeading } from "@/types/content";
import { RichText } from "@/components/ui/RichText";

/**
 * Shared two-column section header (label + lead). The visible title renders as
 * an <h2> styled with the eyebrow treatment, so the document outline stays
 * correct for accessibility/SEO while matching the reference's minimal look.
 */
export function SectionHead({ heading }: { heading: SectionHeading }) {
  return (
    <div className="section-head">
      <div className="label">
        <h2 className="eyebrow">
          <span className="num">{heading.num}</span>
          {heading.title}
        </h2>
        <span className="meta">{heading.meta}</span>
      </div>
      <div className="lead">
        {heading.lead ? (
          <p>
            <RichText text={heading.lead} />
          </p>
        ) : null}
      </div>
    </div>
  );
}
