import { getProfileForAdmin } from "@/services/admin";
import { ProfileEditor } from "@/components/admin/ProfileEditor";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const profile = await getProfileForAdmin();
  return <ProfileEditor initial={profile} />;
}
