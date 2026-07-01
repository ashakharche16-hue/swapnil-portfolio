import { seed } from "@/db/seed";
import { Reveal } from "@/components/ui/Reveal";
import { RichText } from "@/components/ui/RichText";

export function About() {
  const { about } = seed;

  return (
    <section className="block" id="about">
      <div className="wrap">
        <Reveal className="section-head">
          <div className="label">
            <h2 className="eyebrow">
              <span className="num">{about.heading.num}</span>
              {about.heading.title}
            </h2>
            <span className="meta">{about.heading.meta}</span>
          </div>
          <div className="lead">
            {about.paragraphs.map((paragraph, i) => (
              <p key={i} className={i > 0 ? "mt-5" : undefined}>
                <RichText text={paragraph} />
              </p>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
