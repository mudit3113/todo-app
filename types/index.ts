export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type TodoType = "PERSONAL" | "PROFESSIONAL";
export type TodoStatus = "PENDING" | "COMPLETED" | "CANCELLED";
export type GoalType = "PERSONAL" | "PROFESSIONAL";

export interface Goal {
  id: string;
  name: string;
  color: string;
  type: GoalType;
  _count?: { todos: number };
}

export interface Todo {
  id: string;
  title: string;
  notes?: string | null;
  priority: Priority;
  type: TodoType;
  status: TodoStatus;
  dueDate?: string | null;
  completedAt?: string | null;
  goalId?: string | null;
  goal?: Goal | null;
  createdAt: string;
}

export interface DailyStat {
  date: string;
  total: number;
  completed: number;
  rate: number;
}

export interface Analytics {
  dailyStats: DailyStat[];
  totals: { all: number; completed: number; pending: number };
  priorityStats: { priority: string; status: string; _count: number }[];
  typeStats: { type: string; _count: number }[];
}
