import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pushTodoToGoogle } from "@/lib/google-tasks";
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const date = searchParams.get("date");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const type = searchParams.get("type");

  const where: Record<string, unknown> = { userId: session.user.id };
  if (date) {
    const d = new Date(date);
    const start = new Date(d.setHours(0, 0, 0, 0));
    const end = new Date(d.setHours(23, 59, 59, 999));
    where.dueDate = { gte: start, lte: end };
  } else if (from || to) {
    const range: Record<string, Date> = {};
    if (from) range.gte = new Date(new Date(from).setHours(0, 0, 0, 0));
    if (to) range.lte = new Date(new Date(to).setHours(23, 59, 59, 999));
    where.dueDate = range;
  }
  if (type) where.type = type;

  const todos = await prisma.todo.findMany({
    where,
    include: { goal: true, opportunity: true },
    orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
  });

  return Response.json(todos);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, notes, priority, type, dueDate, goalId, opportunityId } = body;

  if (!title?.trim()) return Response.json({ error: "Title required" }, { status: 400 });

  const todo = await prisma.todo.create({
    data: {
      userId: session.user.id,
      title: title.trim(),
      notes: notes ?? null,
      priority: priority ?? "MEDIUM",
      type: type ?? "PERSONAL",
      dueDate: dueDate ? new Date(dueDate) : null,
      goalId: goalId ?? null,
      opportunityId: opportunityId ?? null,
    },
    include: { goal: true, opportunity: true },
  });

  try {
    await pushTodoToGoogle(session.user.id, todo.id);
  } catch {
    // Google sync is best-effort
  }

  return Response.json(todo, { status: 201 });
}
