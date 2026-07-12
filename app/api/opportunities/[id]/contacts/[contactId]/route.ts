import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function findContact(userId: string, opportunityId: string, contactId: string) {
  return prisma.contact.findFirst({
    where: { id: contactId, opportunityId, opportunity: { userId } },
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; contactId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id, contactId } = await params;
  const existing = await findContact(session.user.id, id, contactId);
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { name, channel, status, profileUrl, notes, contactedAt } = body;

  const contact = await prisma.contact.update({
    where: { id: contactId },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(channel !== undefined && { channel }),
      ...(status !== undefined && { status }),
      ...(profileUrl !== undefined && { profileUrl: profileUrl?.trim() || null }),
      ...(notes !== undefined && { notes: notes?.trim() || null }),
      ...(contactedAt !== undefined && { contactedAt: contactedAt ? new Date(contactedAt) : null }),
    },
  });

  return Response.json(contact);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; contactId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id, contactId } = await params;
  const existing = await findContact(session.user.id, id, contactId);
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  await prisma.contact.delete({ where: { id: contactId } });
  return Response.json({ success: true });
}
