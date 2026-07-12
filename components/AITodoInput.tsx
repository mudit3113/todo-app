"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Todo } from "@/types";

interface Props {
  onCreated: (todos: Todo[]) => void;
}

export default function AITodoInput({ onCreated }: Props) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create todos");
      onCreated(data);
      setText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="rounded-lg border p-3 mb-6"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <div className="flex items-start gap-2">
        <Sparkles size={16} className="mt-2 shrink-0" style={{ color: "var(--accent)" }} />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="Describe your tasks in plain English, e.g. 'finish the quarterly report by friday, urgent, and call the dentist tomorrow'"
          rows={2}
          disabled={loading}
          className="flex-1 bg-transparent outline-none resize-none text-sm py-1.5 min-w-0"
          style={{ color: "var(--foreground)" }}
        />
      </div>
      <button
        onClick={handleSubmit}
        disabled={loading || !text.trim()}
        className="w-full sm:w-auto sm:ml-6 mt-2 px-3 py-1.5 rounded-md text-sm font-medium text-white shrink-0 disabled:opacity-50"
        style={{ background: "var(--accent)" }}
      >
        {loading ? "Creating..." : "Add with AI"}
      </button>
      {error && (
        <p className="text-xs mt-2" style={{ color: "var(--danger)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
