import { Fragment } from "react";
import type { ContactContent, SiteIdentity } from "@/types/content";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHead } from "@/components/ui/SectionHead";
import { Icon } from "@/components/icons";
import { ContactForm } from "@/components/sections/ContactForm";

export function Contact({
  data,
  identity,
}: {
  data: ContactContent;
  identity: SiteIdentity;
}) {
  const contact = data;

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
                className="btn"
                href={identity.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon name="linkedin" />
                LinkedIn
              </a>
              <a className="btn" href={identity.resumeUrl} download>
                <Icon name="download" />
                Resume
              </a>
            </div>
          </div>

          <div>
            <ContactForm />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
