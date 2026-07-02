import type { AIContent } from "@/types/content";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";

export function AIEngineering({ data }: { data: AIContent }) {
  const ai = data;

  return (
    <CollapsibleSection id="ai" heading={ai.heading}>
      <div className="ai-grid">
        {ai.patterns.map((pattern) => {
          const inner = (
            <>
              <div className="ai-num">{pattern.num}</div>
              <h3>{pattern.title}</h3>
              <p>{pattern.description}</p>
              <div className="stack">
                {pattern.stack.map((tech) => (
                  <span key={tech}>{tech}</span>
                ))}
              </div>
              {pattern.href && <span className="ai-try">Try it live →</span>}
            </>
          );
          return pattern.href ? (
            <a
              className="ai-card ai-card-link"
              key={pattern.num}
              href={pattern.href}
            >
              {inner}
            </a>
          ) : (
            <div className="ai-card" key={pattern.num}>
              {inner}
            </div>
          );
        })}
      </div>
    </CollapsibleSection>
  );
}
