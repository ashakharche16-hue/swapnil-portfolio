import type { Metadata } from "next";
import { getSiteContent } from "@/services/content";
import { TopBar } from "@/components/layout/TopBar";
import { Footer } from "@/components/layout/Footer";
import { RagDemo } from "@/components/rag/RagDemo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ask my documents — RAG demo",
  description:
    "An interactive Retrieval-Augmented Generation demo: upload a PDF and ask questions answered from its contents, with citations.",
};

export default async function RagPage() {
  const content = await getSiteContent();

  return (
    <>
      <TopBar identity={content.identity} nav={content.nav} anchorPrefix="/" />
      <main className="wrap subpage">
        <RagDemo />
      </main>
      <Footer data={content.footer} />
    </>
  );
}
