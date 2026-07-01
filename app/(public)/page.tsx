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

// Render per request so edits in Supabase appear on the live site immediately.
// (Perf/ISR tuning happens in Slice 8.)
export const dynamic = "force-dynamic";

export default async function Home() {
  const content = await getSiteContent();

  return (
    <>
      <TopBar identity={content.identity} nav={content.nav} />
      <main>
        <Hero data={content.hero} />
        <Metrics data={content.metrics} />
        <About data={content.about} />
        <Experience data={content.experience} />
        <SelectedWork data={content.work} />
        <AIEngineering data={content.ai} />
        <Capabilities data={content.skills} />
        <Recognition data={content.recognition} />
        <Contact data={content.contact} identity={content.identity} />
      </main>
      <Footer data={content.footer} />
      <BackToTop />
    </>
  );
}
