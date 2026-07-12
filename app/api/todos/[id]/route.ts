import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pushTodoToGoogle } from "@/lib/google-tasks";
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.todo.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id)
    return Response.json({ error: "Not found" }, { status: 404 });

  const data: Record<string, unknown> = { ...body };
  if (body.status === "COMPLETED" && !existing.completedAt) {
    data.completedAt = new Date();
  }
  if (body.dueDate) data.dueDate = new Date(body.dueDate);

  const updated = await prisma.todo.update({
    where: { id },
    data,
    include: { goal: true, opportunity: true },
  });

  try {
    await pushTodoToGoogle(session.user.id, id);
  } catch {
    // best-effort
  }

  return Response.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.todo.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id)
    return Response.json({ error: "Not found" }, { status: 404 });

  await prisma.todo.delete({ where: { id } });
  return Response.json({ success: true });
}
