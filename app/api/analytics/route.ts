import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { subDays, startOfDay, endOfDay, format } from "date-fns";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const today = new Date();

  // Last 7 days daily completion data
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(today, 6 - i);
    return { date: format(d, "MMM d"), start: startOfDay(d), end: endOfDay(d) };
  });

  const dailyStats = await Promise.all(
    days.map(async ({ date, start, end }) => {
      const [total, completed] = await Promise.all([
        prisma.todo.count({ where: { userId, dueDate: { gte: start, lte: end } } }),
        prisma.todo.count({
          where: { userId, dueDate: { gte: start, lte: end }, status: "COMPLETED" },
        }),
      ]);
      return { date, total, completed, rate: total > 0 ? Math.round((completed / total) * 100) : 0 };
    })
  );

  // Priority breakdown
  const priorityStats = await prisma.todo.groupBy({
    by: ["priority", "status"],
    where: { userId },
    _count: true,
  });

  // Type breakdown
  const typeStats = await prisma.todo.groupBy({
    by: ["type"],
    where: { userId, status: "COMPLETED" },
    _count: true,
  });

  // Overall totals
  const [totalAll, totalCompleted, totalPending] = await Promise.all([
    prisma.todo.count({ where: { userId } }),
    prisma.todo.count({ where: { userId, status: "COMPLETED" } }),
    prisma.todo.count({ where: { userId, status: "PENDING" } }),
  ]);

  return Response.json({
    dailyStats,
    priorityStats,
    typeStats,
    totals: { all: totalAll, completed: totalCompleted, pending: totalPending },
  });
}
