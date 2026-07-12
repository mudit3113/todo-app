"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Target } from "lucide-react";
import { Goal } from "@/types";

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#3b82f6", "#a855f7", "#ec4899", "#14b8a6"];

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [type, setType] = useState<"PERSONAL" | "PROFESSIONAL">("PERSONAL");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/goals").then((r) => r.json()).then(setGoals);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, color, type }),
    });
    const newGoal = await res.json();
    setGoals((prev) => [...prev, newGoal]);
    setName("");
    setColor(COLORS[0]);
    setShowForm(false);
    setLoading(false);
  };

  const inputStyle = {
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    color: "var(--foreground)",
    borderRadius: "6px",
    padding: "8px 12px",
    fontSize: "14px",
    outline: "none",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold" style={{ color: "var(--foreground)" }}>Goals</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
          style={{ background: "var(--accent)" }}
        >
          <Plus size={16} /> New Goal
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="rounded-xl p-5 mb-6"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <h2 className="text-sm font-medium mb-4" style={{ color: "var(--foreground)" }}>Create Goal</h2>
          <div className="flex flex-col gap-3">
            <input
              style={{ ...inputStyle, width: "100%" }}
              placeholder="Goal name (e.g. Get fit, Ship product)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs mb-1.5 block" style={{ color: "var(--muted)" }}>Type</label>
                <select
                  style={{ ...inputStyle, width: "100%" }}
                  value={type}
                  onChange={(e) => setType(e.target.value as "PERSONAL" | "PROFESSIONAL")}
                >
                  <option value="PERSONAL">Personal</option>
                  <option value="PROFESSIONAL">Professional</option>
                </select>
              </div>

              <div>
                <label className="text-xs mb-1.5 block" style={{ color: "var(--muted)" }}>Color</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className="w-6 h-6 rounded-full transition-transform"
                      style={{
                        background: c,
                        transform: color === c ? "scale(1.25)" : "scale(1)",
                        outline: color === c ? `2px solid ${c}` : "none",
                        outlineOffset: "2px",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white"
                style={{ background: "var(--accent)" }}
              >
                {loading ? "Creating..." : "Create"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-lg text-sm"
                style={{ color: "var(--muted)", background: "var(--surface-2)" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {goals.length === 0 ? (
        <div className="text-center py-16">
          <Target size={32} className="mx-auto mb-3" style={{ color: "var(--muted)" }} />
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Create goals to organize your todos around what matters most
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {goals.map((goal) => (
            <Link
              key={goal.id}
              href={`/dashboard/goals/${goal.id}`}
              className="rounded-xl p-5 block transition-colors"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 rounded-full" style={{ background: goal.color }} />
                <span className="font-medium text-sm" style={{ color: "var(--foreground)" }}>{goal.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: "var(--surface-2)", color: "var(--muted)" }}
                >
                  {goal.type === "PROFESSIONAL" ? "Work" : "Personal"}
                </span>
                <span className="text-xs" style={{ color: "var(--muted)" }}>
                  {goal._count?.todos ?? 0} tasks
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
