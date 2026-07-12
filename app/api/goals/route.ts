import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const goals = await prisma.goal.findMany({
    where: { userId: session.user.id },
    include: { _count: { select: { todos: true } } },
    orderBy: { createdAt: "asc" },
  });

  return Response.json(goals);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { name, color, type } = await req.json();
  if (!name?.trim()) return Response.json({ error: "Name required" }, { status: 400 });

  const goal = await prisma.goal.create({
    data: {
      userId: session.user.id,
      name: name.trim(),
      color: color ?? "#6366f1",
      type: type ?? "PERSONAL",
    },
  });

  return Response.json(goal, { status: 201 });
}
