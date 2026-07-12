"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2, ChevronDown, ChevronUp, Calendar, Briefcase, Pencil } from "lucide-react";
import { Todo } from "@/types";
import { PRIORITY_COLORS, PRIORITY_LABELS, cn } from "@/lib/utils";
import { format } from "date-fns";

interface Props {
  todo: Todo;
  onToggle: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  onEdit?: (todo: Todo) => void;
}

export default function TodoItem({ todo, onToggle, onDelete, onEdit }: Props) {
  const [expanded, setExpanded] = useState(false);
  const isDone = todo.status === "COMPLETED";

  return (
    <div
      className={cn(
        "rounded-lg border transition-all",
        isDone ? "opacity-50" : "opacity-100"
      )}
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      <div className="flex items-start sm:items-center gap-3 p-3 flex-wrap sm:flex-nowrap">
        {/* Priority dot */}
        <div
          className="w-2 h-2 rounded-full flex-shrink-0 mt-2 sm:mt-0"
          style={{ background: PRIORITY_COLORS[todo.priority] }}
        />

        {/* Checkbox */}
        <button
          onClick={() => onToggle(todo.id, isDone ? "PENDING" : "COMPLETED")}
          className={cn(
            "w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-all",
            isDone ? "border-transparent" : "border-gray-600 hover:border-indigo-500"
          )}
          style={isDone ? { background: "var(--success)" } : {}}
        >
          {isDone && (
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        {/* Title */}
        <span
          className={cn("flex-1 text-sm min-w-[50%] sm:min-w-0", isDone && "line-through")}
          style={{ color: isDone ? "var(--muted)" : "var(--foreground)" }}
        >
          {todo.title}
        </span>

        {/* Actions (always inline with title) */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-auto sm:ml-0 order-2 sm:order-none">
          {todo.notes && (
            <button
              onClick={() => setExpanded(!expanded)}
              style={{ color: "var(--muted)" }}
              className="hover:text-white transition-colors"
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}

          {onEdit && (
            <button
              onClick={() => onEdit(todo)}
              style={{ color: "var(--muted)" }}
              className="hover:text-white transition-colors"
            >
              <Pencil size={13} />
            </button>
          )}

          <button
            onClick={() => onDelete(todo.id)}
            style={{ color: "var(--muted)" }}
            className="hover:text-red-400 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* Meta badges: wrap onto their own row on mobile */}
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto pl-8 sm:pl-0 order-3 sm:order-none">
          {todo.opportunity && (
            <Link
              href={`/dashboard/opportunities/${todo.opportunity.id}`}
              className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1 hover:underline"
              style={{ background: "var(--accent)" + "22", color: "var(--accent)" }}
            >
              <Briefcase size={10} /> {todo.opportunity.company}
            </Link>
          )}
          {todo.goal && (
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: todo.goal.color + "22", color: todo.goal.color }}
            >
              {todo.goal.name}
            </span>
          )}
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{
              background: PRIORITY_COLORS[todo.priority] + "22",
              color: PRIORITY_COLORS[todo.priority],
            }}
          >
            {PRIORITY_LABELS[todo.priority]}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ background: "var(--surface-2)", color: "var(--muted)" }}
          >
            {todo.type === "PROFESSIONAL" ? "Work" : "Personal"}
          </span>
        </div>
      </div>

      {/* Due date */}
      {todo.dueDate && (
        <div className="px-3 pb-2 flex items-center gap-1" style={{ color: "var(--muted)" }}>
          <Calendar size={11} />
          <span className="text-xs">{format(new Date(todo.dueDate), "MMM d, yyyy")}</span>
        </div>
      )}

      {/* Notes */}
      {expanded && todo.notes && (
        <div className="px-3 pb-3">
          <p className="text-xs rounded p-2" style={{ color: "var(--muted)", background: "var(--surface-2)" }}>
            {todo.notes}
          </p>
        </div>
      )}
    </div>
  );
}
