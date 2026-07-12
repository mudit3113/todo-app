import { auth } from "@/lib/auth";
import { syncFromGoogle } from "@/lib/google-tasks";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await syncFromGoogle(session.user.id);
    return Response.json({ success: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Sync failed";
    return Response.json({ error: msg }, { status: 500 });
  }
}
