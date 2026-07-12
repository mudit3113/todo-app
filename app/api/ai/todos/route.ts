import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pushTodoToGoogle } from "@/lib/google-tasks";
import { parseTodosFromText } from "@/lib/groq";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const text: string = body.text;
  if (!text?.trim()) return Response.json({ error: "Text required" }, { status: 400 });

  let parsedTodos;
  try {
    parsedTodos = await parseTodosFromText(text);
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "AI parsing failed" }, { status: 502 });
  }

  if (parsedTodos.length === 0) {
    return Response.json({ error: "No todos could be extracted from that text" }, { status: 422 });
  }

  const created = await Promise.all(
    parsedTodos.map((t) =>
      prisma.todo.create({
        data: {
          userId: session.user.id,
          title: t.title,
          notes: t.notes,
          priority: t.priority,
          type: t.type,
          dueDate: new Date(t.dueDate || new Date().toISOString().slice(0, 10)),
        },
        include: { goal: true },
      })
    )
  );

  await Promise.all(
    created.map((todo) => pushTodoToGoogle(session.user.id, todo.id).catch(() => {}))
  );

  return Response.json(created, { status: 201 });
}
