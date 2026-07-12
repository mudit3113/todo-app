import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const opportunity = await prisma.opportunity.findFirst({ where: { id, userId: session.user.id } });
  if (!opportunity) return Response.json({ error: "Not found" }, { status: 404 });

  const { name, channel, status, profileUrl, notes, contactedAt } = await req.json();
  if (!name?.trim()) return Response.json({ error: "Name required" }, { status: 400 });

  const contact = await prisma.contact.create({
    data: {
      opportunityId: id,
      name: name.trim(),
      channel: channel ?? "LINKEDIN",
      status: status ?? "NOT_CONTACTED",
      profileUrl: profileUrl?.trim() || null,
      notes: notes?.trim() || null,
      contactedAt: contactedAt ? new Date(contactedAt) : null,
    },
  });

  return Response.json(contact, { status: 201 });
}
