import type { AIContent } from "@/types/content";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHead } from "@/components/ui/SectionHead";

export function AIEngineering({ data }: { data: AIContent }) {
  const ai = data;

  return (
    <section className="block" id="ai">
      <div className="wrap">
        <Reveal>
          <SectionHead heading={ai.heading} />
        </Reveal>

        <Reveal className="ai-grid">
          {ai.patterns.map((pattern) => (
            <div className="ai-card" key={pattern.num}>
              <div className="ai-num">{pattern.num}</div>
              <h3>{pattern.title}</h3>
              <p>{pattern.description}</p>
              <div className="stack">
                {pattern.stack.map((tech) => (
                  <span key={tech}>{tech}</span>
                ))}
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
