"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Filter } from "lucide-react";
import { format } from "date-fns";
import { Todo, Goal } from "@/types";
import TodoItem from "@/components/TodoItem";
import AddTodoModal from "@/components/AddTodoModal";
import AITodoInput from "@/components/AITodoInput";
import { PRIORITY_COLORS } from "@/lib/utils";

const PRIORITY_ORDER: Record<string, number> = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

export default function DashboardPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<"ALL" | "PERSONAL" | "PROFESSIONAL">("ALL");
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");

  const fetchTodos = useCallback(async () => {
    const res = await fetch(`/api/todos?date=${todayStr}`);
    const data = await res.json();
    setTodos(data);
    setLoading(false);
  }, [todayStr]);

  useEffect(() => {
    fetchTodos();
    fetch("/api/goals").then((r) => r.json()).then(setGoals);
  }, [fetchTodos]);

  const handleAdd = async (data: Parameters<typeof AddTodoModal>[0]["onAdd"] extends (d: infer D) => unknown ? D : never) => {
    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, dueDate: todayStr }),
    });
    const newTodo = await res.json();
    setTodos((prev) => [newTodo, ...prev]);
    setShowModal(false);
  };

  const handleToggle = async (id: string, status: string) => {
    setTodos((prev) => prev.map((t) => t.id === id ? { ...t, status: status as Todo["status"] } : t));
    await fetch(`/api/todos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  };

  const handleDelete = async (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    await fetch(`/api/todos/${id}`, { method: "DELETE" });
  };

  const filtered = todos
    .filter((t) => filter === "ALL" || t.type === filter)
    .sort((a, b) => {
      if (a.status === "COMPLETED" && b.status !== "COMPLETED") return 1;
      if (a.status !== "COMPLETED" && b.status === "COMPLETED") return -1;
      return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    });

  const completed = todos.filter((t) => t.status === "COMPLETED").length;
  const total = todos.length;
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--foreground)" }}>
            {format(today, "EEEE, MMMM d")}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
            {total === 0 ? "No tasks today" : `${completed} of ${total} done`}
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
          style={{ background: "var(--accent)" }}
        >
          <Plus size={16} /> Add Todo
        </button>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="mb-6">
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${rate}%`, background: "var(--success)" }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs" style={{ color: "var(--muted)" }}>{rate}% complete</span>
            <span className="text-xs" style={{ color: "var(--muted)" }}>{total - completed} remaining</span>
          </div>
        </div>
      )}

      <AITodoInput onCreated={(newTodos) => setTodos((prev) => [...newTodos, ...prev])} />

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {(["ALL", "PERSONAL", "PROFESSIONAL"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="text-xs px-3 py-1.5 rounded-md transition-colors"
            style={{
              background: filter === f ? "var(--accent)" : "var(--surface-2)",
              color: filter === f ? "white" : "var(--muted)",
            }}
          >
            {f === "ALL" ? "All" : f === "PERSONAL" ? "Personal" : "Work"}
          </button>
        ))}
        <span className="ml-auto text-xs flex items-center gap-1" style={{ color: "var(--muted)" }}>
          <Filter size={11} /> sorted by priority
        </span>
      </div>

      {/* Todo list */}
      {loading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 rounded-lg animate-pulse" style={{ background: "var(--surface)" }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            {todos.length === 0 ? "Add your first task for today" : "No tasks match this filter"}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((todo) => (
            <TodoItem key={todo.id} todo={todo} onToggle={handleToggle} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Priority legend */}
      {total > 0 && (
        <div className="flex gap-4 mt-6 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
          {Object.entries(PRIORITY_COLORS).map(([k, color]) => (
            <div key={k} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: color }} />
              <span className="text-xs" style={{ color: "var(--muted)" }}>
                {k.charAt(0) + k.slice(1).toLowerCase()}
              </span>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <AddTodoModal goals={goals} onAdd={handleAdd} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
