import { notFound } from "next/navigation";
import { getSectionForAdmin } from "@/services/sections";
import { SectionEditor } from "@/components/admin/SectionEditor";
import type { SectionKey } from "@/types/content";

const KEYS: SectionKey[] = [
  "metrics",
  "about",
  "experience",
  "work",
  "ai",
  "skills",
  "recognition",
  "contact",
];

export const dynamic = "force-dynamic";

export default async function SectionEditorPage({
  params,
}: {
  params: { key: string };
}) {
  if (!(KEYS as string[]).includes(params.key)) notFound();
  const key = params.key as SectionKey;
  const section = await getSectionForAdmin(key);
  return (
    <SectionEditor
      sectionKey={key}
      heading={section.heading}
      content={section.content}
    />
  );
}
