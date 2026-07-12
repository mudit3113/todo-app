import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function assertOwnership(userId: string, id: string) {
  const opportunity = await prisma.opportunity.findFirst({ where: { id, userId } });
  return opportunity;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const opportunity = await prisma.opportunity.findFirst({
    where: { id, userId: session.user.id },
    include: {
      contacts: { orderBy: { createdAt: "asc" } },
      notes: { orderBy: { createdAt: "desc" } },
      todos: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!opportunity) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(opportunity);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await assertOwnership(session.user.id, id);
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { company, role, sourceName, sourcePlatform, sourceUrl, status } = body;

  const opportunity = await prisma.opportunity.update({
    where: { id },
    data: {
      ...(company !== undefined && { company: company.trim() }),
      ...(role !== undefined && { role: role.trim() }),
      ...(sourceName !== undefined && { sourceName: sourceName?.trim() || null }),
      ...(sourcePlatform !== undefined && { sourcePlatform }),
      ...(sourceUrl !== undefined && { sourceUrl: sourceUrl?.trim() || null }),
      ...(status !== undefined && { status }),
    },
    include: {
      contacts: { orderBy: { createdAt: "asc" } },
      notes: { orderBy: { createdAt: "desc" } },
      todos: { orderBy: { createdAt: "desc" } },
    },
  });

  return Response.json(opportunity);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await assertOwnership(session.user.id, id);
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  await prisma.opportunity.delete({ where: { id } });
  return Response.json({ success: true });
}
