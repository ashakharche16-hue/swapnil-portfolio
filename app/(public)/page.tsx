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

export default function Home() {
  return (
    <>
      <TopBar />
      <main>
        <Hero />
        <Metrics />
        <About />
        <Experience />
        <SelectedWork />
        <AIEngineering />
        <Capabilities />
        <Recognition />
        <Contact />
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}
