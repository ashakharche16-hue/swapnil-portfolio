import { Fragment } from "react";
import { seed } from "@/db/seed";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHead } from "@/components/ui/SectionHead";
import { Icon } from "@/components/icons";

export function Contact() {
  const { contact, identity } = seed;

  return (
    <section className="block" id="contact">
      <div className="wrap">
        <Reveal>
          <SectionHead heading={contact.heading} />
        </Reveal>

        <Reveal className="contact-panel">
          <div className="contact-panel-copy">
            <span className="contact-avail">
              <span className="dot" aria-hidden="true" />
              {contact.availability}
            </span>

            <p className="contact-lead">
              {contact.lead.map((seg, i) =>
                seg.accent || seg.italic ? (
                  <span key={i} className="accent">
                    {seg.text}
                  </span>
                ) : (
                  <Fragment key={i}>{seg.text}</Fragment>
                ),
              )}
            </p>
            <p className="contact-blurb">{contact.blurb}</p>

            <div className="cta-row contact-cta">
              <a
                className="btn btn-primary"
                href={contact.cta.href}
                {...(contact.cta.download ? { download: true } : {})}
              >
                {contact.cta.icon && <Icon name={contact.cta.icon} />}
                {contact.cta.label}
              </a>
              <a className="btn" href={identity.resumeUrl} download>
                <Icon name="download" />
                Download Resume
              </a>
            </div>
          </div>

          <div className="contact-methods">
            {contact.rows.map((row) => {
              const inner = (
                <>
                  <span className="ci" aria-hidden="true">
                    <Icon name={row.icon} />
                  </span>
                  <span className="cmeta">
                    <span className="ck">{row.label}</span>
                    <span className="cv">{row.value}</span>
                  </span>
                  {row.href && (
                    <span className="cgo" aria-hidden="true">
                      <Icon name="arrow-up-right" />
                    </span>
                  )}
                </>
              );

              return row.href ? (
                <a
                  key={row.label}
                  className="contact-method"
                  href={row.href}
                  aria-label={`${row.label}: ${row.value}`}
                  {...(row.href.startsWith("http")
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  {inner}
                </a>
              ) : (
                <div key={row.label} className="contact-method">
                  {inner}
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
