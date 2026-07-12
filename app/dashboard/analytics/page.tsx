"use client";

import { useEffect, useState } from "react";
import { Analytics } from "@/types";
import { PRIORITY_COLORS } from "@/lib/utils";

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);

  useEffect(() => {
    fetch("/api/analytics").then((r) => r.json()).then(setData);
  }, []);

  if (!data) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-xl animate-pulse" style={{ background: "var(--surface)" }} />
        ))}
      </div>
    );
  }

  const maxBar = Math.max(...data.dailyStats.map((d) => d.total), 1);

  const priorityCompleted = data.priorityStats
    .filter((p) => p.status === "COMPLETED")
    .reduce<Record<string, number>>((acc, p) => ({ ...acc, [p.priority]: p._count }), {});

  const priorityTotal = data.priorityStats
    .reduce<Record<string, number>>((acc, p) => ({ ...acc, [p.priority]: (acc[p.priority] ?? 0) + p._count }), {});

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold" style={{ color: "var(--foreground)" }}>Analytics</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {[
          { label: "Total Tasks", value: data.totals.all },
          { label: "Completed", value: data.totals.completed, color: "var(--success)" },
          { label: "Pending", value: data.totals.pending, color: "var(--warning)" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="rounded-xl p-3 sm:p-4"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <p className="text-xs mb-1" style={{ color: "var(--muted)" }}>{label}</p>
            <p className="text-2xl sm:text-3xl font-bold" style={{ color: color ?? "var(--foreground)" }}>{value}</p>
          </div>
        ))}
      </div>

      {/* 7-day bar chart */}
      <div className="rounded-xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <h2 className="text-sm font-medium mb-4" style={{ color: "var(--foreground)" }}>Last 7 Days</h2>
        <div className="flex items-end gap-3 h-32">
          {data.dailyStats.map((day) => (
            <div key={day.date} className="flex flex-col items-center gap-1 flex-1">
              <span className="text-xs" style={{ color: "var(--muted)" }}>{day.rate}%</span>
              <div className="w-full flex flex-col gap-0.5" style={{ height: "90px" }}>
                <div style={{ flex: 1 }} />
                <div
                  className="w-full rounded-sm transition-all"
                  style={{
                    height: `${(day.total / maxBar) * 80}px`,
                    background: "var(--surface-2)",
                    position: "relative",
                    minHeight: day.total > 0 ? "4px" : "0",
                  }}
                >
                  <div
                    className="absolute bottom-0 left-0 right-0 rounded-sm"
                    style={{
                      height: `${(day.completed / Math.max(day.total, 1)) * 100}%`,
                      background: "var(--success)",
                    }}
                  />
                </div>
              </div>
              <span className="text-xs" style={{ color: "var(--muted)" }}>{day.date}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: "var(--success)" }} />
            <span className="text-xs" style={{ color: "var(--muted)" }}>Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: "var(--surface-2)" }} />
            <span className="text-xs" style={{ color: "var(--muted)" }}>Total</span>
          </div>
        </div>
      </div>

      {/* Priority breakdown */}
      <div className="rounded-xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <h2 className="text-sm font-medium mb-4" style={{ color: "var(--foreground)" }}>By Priority</h2>
        <div className="flex flex-col gap-3">
          {(["URGENT", "HIGH", "MEDIUM", "LOW"] as const).map((p) => {
            const total = priorityTotal[p] ?? 0;
            const done = priorityCompleted[p] ?? 0;
            const rate = total > 0 ? Math.round((done / total) * 100) : 0;
            return (
              <div key={p} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PRIORITY_COLORS[p] }} />
                <span className="text-xs w-14 flex-shrink-0" style={{ color: "var(--muted)" }}>
                  {p.charAt(0) + p.slice(1).toLowerCase()}
                </span>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${rate}%`, background: PRIORITY_COLORS[p] }}
                  />
                </div>
                <span className="text-xs w-16 text-right flex-shrink-0" style={{ color: "var(--muted)" }}>
                  {done}/{total} ({rate}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Work vs Personal */}
      {data.typeStats.length > 0 && (
        <div className="rounded-xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <h2 className="text-sm font-medium mb-4" style={{ color: "var(--foreground)" }}>Completed by Type</h2>
          <div className="flex gap-6 flex-wrap">
            {data.typeStats.map((t) => (
              <div key={t.type} className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                  style={{ background: t.type === "PROFESSIONAL" ? "#6366f122" : "#22c55e22", color: t.type === "PROFESSIONAL" ? "#6366f1" : "#22c55e" }}
                >
                  {t._count}
                </div>
                <span className="text-sm" style={{ color: "var(--muted)" }}>
                  {t.type === "PROFESSIONAL" ? "Work" : "Personal"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
