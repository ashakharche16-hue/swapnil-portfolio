import type { AboutContent } from "@/types/content";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
import { RichText } from "@/components/ui/RichText";

export function About({ data }: { data: AboutContent }) {
  const about = data;
  // The first paragraph is the teaser (shown in the summary). The body renders
  // the rest, so nothing is duplicated when the section is expanded.
  const [, ...rest] = about.paragraphs;

  return (
    <CollapsibleSection
      id="about"
      heading={about.heading}
      teaser={about.paragraphs[0]}
      defaultOpen
    >
      {rest.length > 0 && (
        <div className="about-body">
          {rest.map((paragraph, i) => (
            <p key={i} className={i > 0 ? "mt-5" : undefined}>
              <RichText text={paragraph} />
            </p>
          ))}
        </div>
      )}
    </CollapsibleSection>
  );
}
