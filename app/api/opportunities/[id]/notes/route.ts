import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const opportunity = await prisma.opportunity.findFirst({ where: { id, userId: session.user.id } });
  if (!opportunity) return Response.json({ error: "Not found" }, { status: 404 });

  const { content } = await req.json();
  if (!content?.trim()) return Response.json({ error: "Content required" }, { status: 400 });

  const note = await prisma.opportunityNote.create({
    data: { opportunityId: id, content: content.trim() },
  });

  return Response.json(note, { status: 201 });
}
