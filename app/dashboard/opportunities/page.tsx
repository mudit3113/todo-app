"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Briefcase, Users, MessageSquare } from "lucide-react";
import { Opportunity, SourcePlatform } from "@/types";
import { OPPORTUNITY_STATUS_COLORS, OPPORTUNITY_STATUS_LABELS } from "@/lib/utils";

const SOURCE_PLATFORMS: SourcePlatform[] = ["LINKEDIN", "REFERRAL", "JOB_BOARD", "OTHER"];

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [sourceName, setSourceName] = useState("");
  const [sourcePlatform, setSourcePlatform] = useState<SourcePlatform>("LINKEDIN");
  const [sourceUrl, setSourceUrl] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetch("/api/opportunities")
      .then((r) => r.json())
      .then((data) => {
        setOpportunities(data);
        setLoading(false);
      });
  }, []);

  const inputStyle = {
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    color: "var(--foreground)",
    borderRadius: "6px",
    padding: "8px 12px",
    fontSize: "14px",
    outline: "none",
    width: "100%",
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !role.trim()) return;
    setCreating(true);
    const res = await fetch("/api/opportunities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company, role, sourceName, sourcePlatform, sourceUrl }),
    });
    const newOpp = await res.json();
    setOpportunities((prev) => [newOpp, ...prev]);
    setCompany("");
    setRole("");
    setSourceName("");
    setSourceUrl("");
    setSourcePlatform("LINKEDIN");
    setShowForm(false);
    setCreating(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold" style={{ color: "var(--foreground)" }}>Jobs</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
          style={{ background: "var(--accent)" }}
        >
          <Plus size={16} /> New Opportunity
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="rounded-xl p-5 mb-6"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <h2 className="text-sm font-medium mb-4" style={{ color: "var(--foreground)" }}>New Opportunity</h2>
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs mb-1 block" style={{ color: "var(--muted)" }}>Company</label>
                <input style={inputStyle} value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Amazon" autoFocus />
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: "var(--muted)" }}>Role</label>
                <input style={inputStyle} value={role} onChange={(e) => setRole(e.target.value)} placeholder="Associate PM" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs mb-1 block" style={{ color: "var(--muted)" }}>Posted by</label>
                <input style={inputStyle} value={sourceName} onChange={(e) => setSourceName(e.target.value)} placeholder="Pushpender" />
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: "var(--muted)" }}>Source</label>
                <select style={inputStyle} value={sourcePlatform} onChange={(e) => setSourcePlatform(e.target.value as SourcePlatform)}>
                  {SOURCE_PLATFORMS.map((p) => (
                    <option key={p} value={p}>{p === "JOB_BOARD" ? "Job Board" : p.charAt(0) + p.slice(1).toLowerCase()}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs mb-1 block" style={{ color: "var(--muted)" }}>Post URL (optional)</label>
              <input style={inputStyle} value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://linkedin.com/..." />
            </div>

            <div className="flex gap-2 mt-1">
              <button
                type="submit"
                disabled={creating || !company.trim() || !role.trim()}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white"
                style={{ background: "var(--accent)" }}
              >
                {creating ? "Creating..." : "Create"}
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

      {loading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: "var(--surface)" }} />
          ))}
        </div>
      ) : opportunities.length === 0 ? (
        <div className="text-center py-16">
          <Briefcase size={32} className="mx-auto mb-3" style={{ color: "var(--muted)" }} />
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Track job postings, outreach, and follow-ups here
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {opportunities.map((opp) => (
            <Link
              key={opp.id}
              href={`/dashboard/opportunities/${opp.id}`}
              className="rounded-xl p-4 flex items-center justify-between transition-colors"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm" style={{ color: "var(--foreground)" }}>{opp.role}</span>
                  <span className="text-sm" style={{ color: "var(--muted)" }}>@ {opp.company}</span>
                </div>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      background: OPPORTUNITY_STATUS_COLORS[opp.status] + "22",
                      color: OPPORTUNITY_STATUS_COLORS[opp.status],
                    }}
                  >
                    {OPPORTUNITY_STATUS_LABELS[opp.status]}
                  </span>
                  {opp.sourceName && (
                    <span className="text-xs" style={{ color: "var(--muted)" }}>via {opp.sourceName}</span>
                  )}
                  <span className="text-xs flex items-center gap-1" style={{ color: "var(--muted)" }}>
                    <Users size={11} /> {opp._count?.contacts ?? 0}
                  </span>
                  <span className="text-xs flex items-center gap-1" style={{ color: "var(--muted)" }}>
                    <MessageSquare size={11} /> {opp._count?.notes ?? 0}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
