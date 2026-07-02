import type { WorkContent } from "@/types/content";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
import { RichText } from "@/components/ui/RichText";

export function SelectedWork({ data }: { data: WorkContent }) {
  const work = data;

  return (
    <CollapsibleSection id="work" heading={work.heading}>
      <div className="cases">
        {work.cases.map((study) => (
          <article className="case" key={study.index}>
            <div className="case-head">
              <span className="case-num">{study.index}</span>
              <span className="case-tag">{study.tag}</span>
            </div>
            <h3>{study.title}</h3>
            <p>
              <RichText text={study.description} />
            </p>
            <div className="case-stack">
              {study.stack.map((tech) => (
                <span key={tech}>{tech}</span>
              ))}
            </div>
            <div className="case-impact">
              {study.impact.map((impact) => (
                <div key={impact.label}>
                  <span className="num">{impact.num}</span>
                  <span className="label">{impact.label}</span>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </CollapsibleSection>
  );
}
