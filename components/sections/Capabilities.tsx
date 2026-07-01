import type { SkillsContent } from "@/types/content";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHead } from "@/components/ui/SectionHead";

export function Capabilities({ data }: { data: SkillsContent }) {
  const skills = data;

  return (
    <section className="block" id="skills">
      <div className="wrap">
        <Reveal>
          <SectionHead heading={skills.heading} />
        </Reveal>

        <Reveal>
          {skills.groups.map((group) => (
            <div className="skill-group" key={group.name}>
              <div className="name">{group.name}</div>
              <div className="skill-list">
                {group.skills.map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
