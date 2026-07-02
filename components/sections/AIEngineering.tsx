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
        </Reveal>
      </div>
    </section>
  );
}
