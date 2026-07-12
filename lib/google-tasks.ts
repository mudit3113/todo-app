import { google } from "googleapis";
import { prisma } from "./prisma";

async function getTasksClient(userId: string) {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "google" },
  });
  if (!account?.access_token) throw new Error("No Google account linked");

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  oauth2Client.setCredentials({
    access_token: account.access_token,
    refresh_token: account.refresh_token ?? undefined,
  });

  oauth2Client.on("tokens", async (tokens) => {
    if (tokens.access_token) {
      await prisma.account.update({
        where: { id: account.id },
        data: { access_token: tokens.access_token },
      });
    }
  });

  return google.tasks({ version: "v1", auth: oauth2Client });
}

export async function getOrCreateTaskList(userId: string): Promise<string> {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "google" },
  });

  const tasks = await getTasksClient(userId);
  const lists = await tasks.tasklists.list();
  const myList = lists.data.items?.find((l) => l.title === "My Todo App");

  if (myList?.id) return myList.id;

  const newList = await tasks.tasklists.insert({ requestBody: { title: "My Todo App" } });
  return newList.data.id!;
}

export async function pushTodoToGoogle(userId: string, todoId: string) {
  const todo = await prisma.todo.findUnique({ where: { id: todoId } });
  if (!todo) return;

  const tasks = await getTasksClient(userId);
  const listId = await getOrCreateTaskList(userId);

  const taskBody = {
    title: todo.title,
    notes: todo.notes ?? undefined,
    due: todo.dueDate ? todo.dueDate.toISOString() : undefined,
    status: todo.status === "COMPLETED" ? "completed" : "needsAction",
  };

  if (todo.googleTaskId) {
    await tasks.tasks.update({
      tasklist: listId,
      task: todo.googleTaskId,
      requestBody: taskBody,
    });
  } else {
    const created = await tasks.tasks.insert({
      tasklist: listId,
      requestBody: taskBody,
    });
    await prisma.todo.update({
      where: { id: todoId },
      data: { googleTaskId: created.data.id, googleTaskListId: listId },
    });
  }
}

export async function syncFromGoogle(userId: string) {
  const tasks = await getTasksClient(userId);
  const listId = await getOrCreateTaskList(userId);

  const result = await tasks.tasks.list({
    tasklist: listId,
    showCompleted: true,
    showHidden: true,
    maxResults: 100,
  });

  const googleTasks = result.data.items ?? [];

  for (const gtask of googleTasks) {
    if (!gtask.id || !gtask.title) continue;

    const existing = await prisma.todo.findFirst({
      where: { userId, googleTaskId: gtask.id },
    });

    const status =
      gtask.status === "completed" ? "COMPLETED" : "PENDING";
    const dueDate = gtask.due ? new Date(gtask.due) : null;

    if (existing) {
      await prisma.todo.update({
        where: { id: existing.id },
        data: {
          title: gtask.title,
          notes: gtask.notes ?? null,
          status,
          dueDate,
          completedAt:
            status === "COMPLETED" && !existing.completedAt
              ? new Date()
              : existing.completedAt,
        },
      });
    } else {
      await prisma.todo.create({
        data: {
          userId,
          title: gtask.title,
          notes: gtask.notes ?? null,
          status,
          dueDate,
          priority: "MEDIUM",
          type: "PERSONAL",
          googleTaskId: gtask.id,
          googleTaskListId: listId,
          completedAt: status === "COMPLETED" ? new Date() : null,
        },
      });
    }
  }
}
