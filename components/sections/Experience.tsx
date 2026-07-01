import type { ExperienceContent } from "@/types/content";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHead } from "@/components/ui/SectionHead";
import { RichText } from "@/components/ui/RichText";

export function Experience({ data }: { data: ExperienceContent }) {
  const experience = data;

  return (
    <section className="block" id="experience">
      <div className="wrap">
        <Reveal>
          <SectionHead heading={experience.heading} />
        </Reveal>

        <Reveal>
          {experience.items.map((item) => (
            <article className="exp-item" key={`${item.company}-${item.role}`}>
              <div className="exp-meta">
                <div className="role">{item.role}</div>
                <div className="company">{item.company}</div>
                <div className="when">{item.period}</div>
              </div>
              <div className="exp-body">
                <h3>{item.heading}</h3>
                <p className="summary">
                  <RichText text={item.summary} />
                </p>

                {item.groups.map((group) => (
                  <div className="exp-group" key={group.label}>
                    <div className="exp-group-label">{group.label}</div>
                    <ul>
                      {group.bullets.map((bullet, i) => (
                        <li key={i}>
                          <RichText text={bullet} />
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
