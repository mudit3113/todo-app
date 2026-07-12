"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Goal, Todo } from "@/types";
import TodoItem from "@/components/TodoItem";
import AddTodoModal, { TodoFormData } from "@/components/AddTodoModal";

export default function GoalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [allGoals, setAllGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  const fetchGoal = useCallback(async () => {
    const res = await fetch(`/api/goals/${id}`);
    if (res.status === 404) {
      router.push("/dashboard/goals");
      return;
    }
    setGoal(await res.json());
    setLoading(false);
  }, [id, router]);

  useEffect(() => {
    fetchGoal();
    fetch("/api/goals").then((r) => r.json()).then(setAllGoals);
  }, [fetchGoal]);

  const handleDeleteGoal = async () => {
    if (!confirm("Delete this goal? Tasks under it will be unassigned, not deleted.")) return;
    await fetch(`/api/goals/${id}`, { method: "DELETE" });
    router.push("/dashboard/goals");
  };

  const handleAdd = async (data: TodoFormData) => {
    await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, goalId: id, dueDate: data.dueDate || new Date().toISOString().slice(0, 10) }),
    });
    setShowModal(false);
    await fetchGoal();
  };

  const handleEditSubmit = async (data: TodoFormData) => {
    if (!editingTodo) return;
    await fetch(`/api/todos/${editingTodo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setEditingTodo(null);
    await fetchGoal();
  };

  const handleToggle = async (todoId: string, status: string) => {
    setGoal((prev) =>
      prev ? { ...prev, todos: prev.todos?.map((t) => (t.id === todoId ? { ...t, status: status as Todo["status"] } : t)) } : prev
    );
    await fetch(`/api/todos/${todoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  };

  const handleDelete = async (todoId: string) => {
    setGoal((prev) => (prev ? { ...prev, todos: prev.todos?.filter((t) => t.id !== todoId) } : prev));
    await fetch(`/api/todos/${todoId}`, { method: "DELETE" });
  };

  if (loading || !goal) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: "var(--surface)" }} />
        ))}
      </div>
    );
  }

  const todos = goal.todos ?? [];
  const completed = todos.filter((t) => t.status === "COMPLETED").length;
  const total = todos.length;
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <button
          onClick={() => router.push("/dashboard/goals")}
          className="flex items-center gap-1.5 text-xs mb-3"
          style={{ color: "var(--muted)" }}
        >
          <ArrowLeft size={13} /> Back to Goals
        </button>

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ background: goal.color }} />
            <h1 className="text-xl font-semibold" style={{ color: "var(--foreground)" }}>{goal.name}</h1>
            <span
              className="text-xs px-2 py-0.5 rounded-full shrink-0"
              style={{ background: "var(--surface-2)", color: "var(--muted)" }}
            >
              {goal.type === "PROFESSIONAL" ? "Work" : "Personal"}
            </span>
          </div>
          <button onClick={handleDeleteGoal} style={{ color: "var(--muted)" }} className="hover:text-red-400 transition-colors shrink-0">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Consistency stats */}
      <div className="rounded-xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-xs mb-1" style={{ color: "var(--muted)" }}>Total Tasks</p>
            <p className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>{total}</p>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: "var(--muted)" }}>Completed</p>
            <p className="text-2xl font-bold" style={{ color: "var(--success)" }}>{completed}</p>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: "var(--muted)" }}>Completion Rate</p>
            <p className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>{rate}%</p>
          </div>
        </div>
        {total > 0 && (
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${rate}%`, background: goal.color }}
            />
          </div>
        )}
      </div>

      {/* Task list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Tasks</h2>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-white"
            style={{ background: "var(--accent)" }}
          >
            <Plus size={13} /> Add Task
          </button>
        </div>

        {todos.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm" style={{ color: "var(--muted)" }}>No tasks under this goal yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {todos.map((todo) => (
              <TodoItem key={todo.id} todo={todo} onToggle={handleToggle} onDelete={handleDelete} onEdit={setEditingTodo} />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <AddTodoModal goals={allGoals} initialGoalId={goal.id} onSubmit={handleAdd} onClose={() => setShowModal(false)} />
      )}

      {editingTodo && (
        <AddTodoModal
          goals={allGoals}
          todo={editingTodo}
          onSubmit={handleEditSubmit}
          onClose={() => setEditingTodo(null)}
        />
      )}
    </div>
  );
}
