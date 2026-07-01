import { Fragment } from "react";
import { seed } from "@/db/seed";
import { Icon } from "@/components/icons";
import { RichText } from "@/components/ui/RichText";
import { RotatingText } from "@/components/ui/RotatingText";

export function Hero() {
  const { hero } = seed;

  return (
    <section className="hero wrap" id="top" aria-label="Introduction">
      <div className="hero-eyebrow">
        {hero.eyebrow.map((item, i) => (
          <Fragment key={item}>
            {i > 0 && <span className="sep">/</span>}
            <span>{item}</span>
          </Fragment>
        ))}
      </div>

      <h1 className="display hero-name">
        {hero.name.map((seg, i) =>
          seg.accent || seg.italic ? (
            <span key={i} className="underscore">
              {seg.text}
            </span>
          ) : (
            <Fragment key={i}>{seg.text}</Fragment>
          ),
        )}
        <span className="hero-roleline">
          <RotatingText
            items={hero.rotatingRoles}
            className="underscore"
            withArticle
          />
        </span>
      </h1>

      <p className="hero-role">
        <RichText text={hero.role} />
      </p>
      <p className="hero-sub">{hero.sub}</p>

      <div className="chips">
        {hero.chips.map((chip) => (
          <span className="chip" key={chip.label}>
            <Icon name={chip.icon} />
            {chip.label}
          </span>
        ))}
      </div>

      <div className="cta-row">
        {hero.ctas.map((cta) => (
          <a
            key={cta.label}
            className={cta.primary ? "btn btn-primary" : "btn"}
            href={cta.href}
            {...(cta.download ? { download: true } : {})}
          >
            {cta.icon && <Icon name={cta.icon} />}
            {cta.label}
          </a>
        ))}
      </div>
    </section>
  );
}
