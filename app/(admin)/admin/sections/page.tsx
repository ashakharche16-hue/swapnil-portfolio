import { getSectionsForAdmin, SECTION_LABELS } from "@/services/sections";
import { SectionsManager } from "@/components/admin/SectionsManager";

export const dynamic = "force-dynamic";

export default async function SectionsPage() {
  const sections = await getSectionsForAdmin();
  const items = sections.map((s) => ({
    key: s.key,
    label: SECTION_LABELS[s.key],
    visible: s.visible,
  }));

  return (
    <div>
      <h1 className="font-serif text-3xl text-body">Sections</h1>
      <p className="mb-8 mt-2 text-muted">
        Reorder with the arrows, toggle visibility, or edit a section&apos;s
        content. Changes go live immediately.
      </p>
      <SectionsManager initial={items} />
    </div>
  );
}
