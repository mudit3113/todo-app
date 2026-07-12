import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id, noteId } = await params;
  const note = await prisma.opportunityNote.findFirst({
    where: { id: noteId, opportunityId: id, opportunity: { userId: session.user.id } },
  });
  if (!note) return Response.json({ error: "Not found" }, { status: 404 });

  await prisma.opportunityNote.delete({ where: { id: noteId } });
  return Response.json({ success: true });
}
