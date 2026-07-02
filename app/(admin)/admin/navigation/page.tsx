import { getProfileForAdmin } from "@/services/admin";
import { NavEditor } from "@/components/admin/NavEditor";

export const dynamic = "force-dynamic";

export default async function NavigationPage() {
  const { nav } = await getProfileForAdmin();
  return <NavEditor initial={nav} />;
}
