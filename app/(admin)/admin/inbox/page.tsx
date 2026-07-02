import { getSubmissions } from "@/services/inbox";
import { Inbox } from "@/components/admin/Inbox";

export const dynamic = "force-dynamic";

export default async function InboxPage() {
  const submissions = await getSubmissions();
  return <Inbox initial={submissions} />;
}
