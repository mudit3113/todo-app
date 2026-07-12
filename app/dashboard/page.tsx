"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Filter, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { format, addDays, parseISO, isToday, isYesterday, isTomorrow } from "date-fns";
import { Todo, Goal } from "@/types";
import TodoItem from "@/components/TodoItem";
import AddTodoModal, { TodoFormData } from "@/components/AddTodoModal";
import AITodoInput from "@/components/AITodoInput";
import { PRIORITY_COLORS } from "@/lib/utils";

const PRIORITY_ORDER: Record<string, number> = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
const UPCOMING_DAYS = 7;

function dayLabel(dateStr: string) {
  const d = parseISO(dateStr);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  if (isTomorrow(d)) return "Tomorrow";
  return format(d, "EEEE, MMMM d");
}

export default function DashboardPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [upcoming, setUpcoming] = useState<Todo[]>([]);
  const [showUpcoming, setShowUpcoming] = useState(true);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [filter, setFilter] = useState<"ALL" | "PERSONAL" | "PROFESSIONAL">("ALL");
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const fetchTodos = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/todos?date=${selectedDate}`);
    const data = await res.json();
    setTodos(data);
    setLoading(false);
  }, [selectedDate]);

  const fetchUpcoming = useCallback(async () => {
    const from = format(addDays(today, 1), "yyyy-MM-dd");
    const to = format(addDays(today, UPCOMING_DAYS), "yyyy-MM-dd");
    const res = await fetch(`/api/todos?from=${from}&to=${to}`);
    const data = await res.json();
    setUpcoming(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayStr]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  useEffect(() => {
    fetchUpcoming();
    fetch("/api/goals").then((r) => r.json()).then(setGoals);
  }, [fetchUpcoming]);

  const goToDate = (dateStr: string) => setSelectedDate(dateStr);
  const shiftDate = (deltaDays: number) => {
    setSelectedDate(format(addDays(parseISO(selectedDate), deltaDays), "yyyy-MM-dd"));
  };

  const handleAdd = async (data: TodoFormData) => {
    const dueDate = data.dueDate || selectedDate;
    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, dueDate }),
    });
    const newTodo = await res.json();
    if (dueDate === selectedDate) {
      setTodos((prev) => [newTodo, ...prev]);
    } else if (dueDate > todayStr) {
      setUpcoming((prev) => [newTodo, ...prev]);
    }
    setShowModal(false);
  };

  const handleEditSubmit = async (data: TodoFormData) => {
    if (!editingTodo) return;
    await fetch(`/api/todos/${editingTodo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setEditingTodo(null);
    await Promise.all([fetchTodos(), fetchUpcoming()]);
  };

  const handleToggle = async (id: string, status: string) => {
    setTodos((prev) => prev.map((t) => t.id === id ? { ...t, status: status as Todo["status"] } : t));
    setUpcoming((prev) => prev.map((t) => t.id === id ? { ...t, status: status as Todo["status"] } : t));
    await fetch(`/api/todos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  };

  const handleDelete = async (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    setUpcoming((prev) => prev.filter((t) => t.id !== id));
    await fetch(`/api/todos/${id}`, { method: "DELETE" });
  };

  const filtered = todos
    .filter((t) => filter === "ALL" || t.type === filter)
    .sort((a, b) => {
      if (a.status === "COMPLETED" && b.status !== "COMPLETED") return 1;
      if (a.status !== "COMPLETED" && b.status === "COMPLETED") return -1;
      return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    });

  const upcomingFiltered = upcoming.filter((t) => filter === "ALL" || t.type === filter);
  const upcomingByDate = upcomingFiltered.reduce<Record<string, Todo[]>>((acc, t) => {
    const key = t.dueDate ? format(new Date(t.dueDate), "yyyy-MM-dd") : "no-date";
    acc[key] = [...(acc[key] ?? []), t];
    return acc;
  }, {});
  const upcomingDates = Object.keys(upcomingByDate).sort();

  const completed = todos.filter((t) => t.status === "COMPLETED").length;
  const total = todos.length;
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-3 gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold" style={{ color: "var(--foreground)" }}>
            {dayLabel(selectedDate)}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
            {total === 0 ? "No tasks" : `${completed} of ${total} done`}
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white shrink-0"
          style={{ background: "var(--accent)" }}
        >
          <Plus size={16} /> Add Todo
        </button>
      </div>

      {/* Date navigation */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => shiftDate(-1)}
          className="p-1.5 rounded-md"
          style={{ background: "var(--surface-2)", color: "var(--muted)" }}
          title="Previous day"
        >
          <ChevronLeft size={15} />
        </button>
        <button
          onClick={() => shiftDate(1)}
          className="p-1.5 rounded-md"
          style={{ background: "var(--surface-2)", color: "var(--muted)" }}
          title="Next day"
        >
          <ChevronRight size={15} />
        </button>

        <label
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md cursor-pointer relative"
          style={{ background: "var(--surface-2)", color: "var(--muted)" }}
        >
          <CalendarDays size={13} />
          {selectedDate}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => goToDate(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </label>

        {selectedDate !== todayStr && (
          <button
            onClick={() => goToDate(todayStr)}
            className="text-xs px-3 py-1.5 rounded-md"
            style={{ background: "var(--accent)" + "22", color: "var(--accent)" }}
          >
            Today
          </button>
        )}
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
            {todos.length === 0 ? `No tasks for ${dayLabel(selectedDate).toLowerCase()}` : "No tasks match this filter"}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((todo) => (
            <TodoItem key={todo.id} todo={todo} onToggle={handleToggle} onDelete={handleDelete} onEdit={setEditingTodo} />
          ))}
        </div>
      )}

      {/* Upcoming */}
      {upcomingDates.length > 0 && (
        <div className="mt-6 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
          <button
            onClick={() => setShowUpcoming(!showUpcoming)}
            className="flex items-center gap-1.5 text-sm font-medium mb-3"
            style={{ color: "var(--foreground)" }}
          >
            Upcoming ({upcomingFiltered.length})
            {showUpcoming ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showUpcoming && (
            <div className="flex flex-col gap-4">
              {upcomingDates.map((dateKey) => (
                <div key={dateKey}>
                  <p className="text-xs mb-2" style={{ color: "var(--muted)" }}>
                    {dateKey === "no-date" ? "No date" : format(new Date(dateKey), "EEEE, MMMM d")}
                  </p>
                  <div className="flex flex-col gap-2">
                    {upcomingByDate[dateKey].map((todo) => (
                      <TodoItem key={todo.id} todo={todo} onToggle={handleToggle} onDelete={handleDelete} onEdit={setEditingTodo} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
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
        <AddTodoModal goals={goals} onSubmit={handleAdd} onClose={() => setShowModal(false)} />
      )}

      {editingTodo && (
        <AddTodoModal
          goals={goals}
          todo={editingTodo}
          onSubmit={handleEditSubmit}
          onClose={() => setEditingTodo(null)}
        />
      )}
    </div>
  );
}
