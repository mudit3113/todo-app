import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const opportunities = await prisma.opportunity.findMany({
    where: { userId: session.user.id },
    include: {
      _count: { select: { contacts: true, notes: true, todos: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(opportunities);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { company, role, sourceName, sourcePlatform, sourceUrl } = await req.json();
  if (!company?.trim() || !role?.trim()) {
    return Response.json({ error: "Company and role required" }, { status: 400 });
  }

  const opportunity = await prisma.opportunity.create({
    data: {
      userId: session.user.id,
      company: company.trim(),
      role: role.trim(),
      sourceName: sourceName?.trim() || null,
      sourcePlatform: sourcePlatform ?? "LINKEDIN",
      sourceUrl: sourceUrl?.trim() || null,
    },
    include: { _count: { select: { contacts: true, notes: true, todos: true } } },
  });

  return Response.json(opportunity, { status: 201 });
}
