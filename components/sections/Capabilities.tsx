import type { SkillsContent } from "@/types/content";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";

export function Capabilities({ data }: { data: SkillsContent }) {
  const skills = data;

  return (
    <CollapsibleSection id="skills" heading={skills.heading}>
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
    </CollapsibleSection>
  );
}
