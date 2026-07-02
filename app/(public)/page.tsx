import { Fragment } from "react";
import type { SectionKey } from "@/types/content";
import { getSiteContent } from "@/services/content";
import { TopBar } from "@/components/layout/TopBar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { Metrics } from "@/components/sections/Metrics";
import { About } from "@/components/sections/About";
import { Experience } from "@/components/sections/Experience";
import { SelectedWork } from "@/components/sections/SelectedWork";
import { AIEngineering } from "@/components/sections/AIEngineering";
import { Capabilities } from "@/components/sections/Capabilities";
import { Recognition } from "@/components/sections/Recognition";
import { Contact } from "@/components/sections/Contact";
import { BackToTop } from "@/components/ui/BackToTop";
import { SectionNav } from "@/components/ui/SectionNav";

// Render per request so edits in Supabase appear on the live site immediately.
// (Perf/ISR tuning happens in Slice 8.)
export const dynamic = "force-dynamic";

export default async function Home() {
  const content = await getSiteContent();

  // Body sections render in the DB-configured order, skipping hidden ones.
  const sections: Record<SectionKey, React.ReactNode> = {
    metrics: <Metrics data={content.metrics} />,
    about: <About data={content.about} />,
    experience: <Experience data={content.experience} />,
    work: <SelectedWork data={content.work} />,
    ai: <AIEngineering data={content.ai} />,
    skills: <Capabilities data={content.skills} />,
    recognition: <Recognition data={content.recognition} />,
    contact: <Contact data={content.contact} identity={content.identity} />,
  };

  return (
    <>
      <TopBar identity={content.identity} nav={content.nav} />
      <main>
        <Hero data={content.hero} />
        {content.layout
          .filter((item) => item.visible)
          .map((item) => (
            <Fragment key={item.key}>{sections[item.key]}</Fragment>
          ))}
      </main>
      <Footer data={content.footer} />
      <BackToTop />
      <SectionNav />
    </>
  );
}
