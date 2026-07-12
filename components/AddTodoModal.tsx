"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Goal, Todo } from "@/types";

export interface TodoFormData {
  title: string;
  notes?: string;
  priority: string;
  type: string;
  dueDate?: string;
  goalId?: string;
}

interface Props {
  goals: Goal[];
  todo?: Todo;
  initialGoalId?: string;
  onSubmit: (data: TodoFormData) => Promise<void>;
  onClose: () => void;
}

export default function AddTodoModal({ goals, todo, initialGoalId, onSubmit, onClose }: Props) {
  const isEdit = !!todo;
  const [title, setTitle] = useState(todo?.title ?? "");
  const [notes, setNotes] = useState(todo?.notes ?? "");
  const [priority, setPriority] = useState<string>(todo?.priority ?? "MEDIUM");
  const [type, setType] = useState<string>(todo?.type ?? "PERSONAL");
  const [dueDate, setDueDate] = useState(todo?.dueDate ? todo.dueDate.slice(0, 10) : "");
  const [goalId, setGoalId] = useState(todo?.goalId ?? initialGoalId ?? "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    await onSubmit({ title, notes: notes || undefined, priority, type, dueDate: dueDate || undefined, goalId: goalId || undefined });
    setLoading(false);
  };

  const inputStyle = {
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    color: "var(--foreground)",
    borderRadius: "6px",
    padding: "8px 12px",
    width: "100%",
    fontSize: "14px",
    outline: "none",
  };

  const selectStyle = { ...inputStyle };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
      <div className="w-full max-w-md rounded-xl p-6 shadow-2xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold" style={{ color: "var(--foreground)" }}>{isEdit ? "Edit Todo" : "Add Todo"}</h2>
          <button onClick={onClose} style={{ color: "var(--muted)" }} className="hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            style={inputStyle}
            placeholder="What needs to be done?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />

          <textarea
            style={{ ...inputStyle, resize: "none", minHeight: "70px" }}
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs mb-1 block" style={{ color: "var(--muted)" }}>Priority</label>
              <select style={selectStyle} value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div>
              <label className="text-xs mb-1 block" style={{ color: "var(--muted)" }}>Type</label>
              <select style={selectStyle} value={type} onChange={(e) => setType(e.target.value)}>
                <option value="PERSONAL">Personal</option>
                <option value="PROFESSIONAL">Professional</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs mb-1 block" style={{ color: "var(--muted)" }}>Due Date</label>
              <input
                type="date"
                style={selectStyle}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs mb-1 block" style={{ color: "var(--muted)" }}>Goal</label>
              <select style={selectStyle} value={goalId} onChange={(e) => setGoalId(e.target.value)}>
                <option value="">No goal</option>
                {goals.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !title.trim()}
            className="w-full py-2 rounded-lg text-sm font-medium transition-all mt-1"
            style={{
              background: title.trim() ? "var(--accent)" : "var(--surface-2)",
              color: title.trim() ? "white" : "var(--muted)",
              cursor: title.trim() ? "pointer" : "not-allowed",
            }}
          >
            {loading ? (isEdit ? "Saving..." : "Adding...") : isEdit ? "Save Changes" : "Add Todo"}
          </button>
        </form>
      </div>
    </div>
  );
}
