import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const goal = await prisma.goal.findFirst({
    where: { id, userId: session.user.id },
    include: {
      todos: {
        include: { opportunity: true },
        orderBy: [{ dueDate: "desc" }, { createdAt: "desc" }],
      },
      _count: { select: { todos: true } },
    },
  });

  if (!goal) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(goal);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const goal = await prisma.goal.findFirst({ where: { id, userId: session.user.id } });
  if (!goal) return Response.json({ error: "Not found" }, { status: 404 });

  await prisma.goal.delete({ where: { id } });
  return Response.json({ success: true });
}
