"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, Plus, Trash2, ExternalLink, Link2, Mail, MoreHorizontal } from "lucide-react";
import { Opportunity, OpportunityStatus, Contact, ContactChannel, ContactStatus, Todo } from "@/types";
import {
  OPPORTUNITY_STATUS_COLORS,
  OPPORTUNITY_STATUS_LABELS,
  CONTACT_STATUS_COLORS,
  CONTACT_STATUS_LABELS,
} from "@/lib/utils";

const STATUSES: OpportunityStatus[] = [
  "DISCOVERED",
  "OUTREACH_SENT",
  "APPLIED",
  "INTERVIEWING",
  "OFFER",
  "REJECTED",
  "CLOSED",
];
const CONTACT_CHANNELS: ContactChannel[] = ["LINKEDIN", "EMAIL", "OTHER"];
const CONTACT_STATUSES: ContactStatus[] = ["NOT_CONTACTED", "SENT", "REPLIED", "NO_RESPONSE", "REFERRED"];

const inputStyle = {
  background: "var(--surface-2)",
  border: "1px solid var(--border)",
  color: "var(--foreground)",
  borderRadius: "6px",
  padding: "7px 10px",
  fontSize: "13px",
  outline: "none",
};

export default function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [opp, setOpp] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);

  const [contactName, setContactName] = useState("");
  const [contactChannel, setContactChannel] = useState<ContactChannel>("LINKEDIN");
  const [addingContact, setAddingContact] = useState(false);

  const [noteText, setNoteText] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  const [todoTitle, setTodoTitle] = useState("");
  const [todoDueDate, setTodoDueDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [addingTodo, setAddingTodo] = useState(false);

  const fetchOpp = useCallback(async () => {
    const res = await fetch(`/api/opportunities/${id}`);
    if (res.status === 404) {
      router.push("/dashboard/opportunities");
      return;
    }
    setOpp(await res.json());
    setLoading(false);
  }, [id, router]);

  useEffect(() => {
    fetchOpp();
  }, [fetchOpp]);

  const updateStatus = async (status: OpportunityStatus) => {
    setOpp((prev) => (prev ? { ...prev, status } : prev));
    await fetch(`/api/opportunities/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  };

  const handleDeleteOpportunity = async () => {
    if (!confirm("Delete this opportunity? This removes its contacts and notes too.")) return;
    await fetch(`/api/opportunities/${id}`, { method: "DELETE" });
    router.push("/dashboard/opportunities");
  };

  const addContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim()) return;
    setAddingContact(true);
    const res = await fetch(`/api/opportunities/${id}/contacts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: contactName, channel: contactChannel, status: "SENT", contactedAt: new Date().toISOString() }),
    });
    const contact = await res.json();
    setOpp((prev) => (prev ? { ...prev, contacts: [...(prev.contacts ?? []), contact] } : prev));
    setContactName("");
    setAddingContact(false);
  };

  const updateContactStatus = async (contactId: string, status: ContactStatus) => {
    setOpp((prev) =>
      prev
        ? { ...prev, contacts: prev.contacts?.map((c) => (c.id === contactId ? { ...c, status } : c)) }
        : prev
    );
    await fetch(`/api/opportunities/${id}/contacts/${contactId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  };

  const deleteContact = async (contactId: string) => {
    setOpp((prev) => (prev ? { ...prev, contacts: prev.contacts?.filter((c) => c.id !== contactId) } : prev));
    await fetch(`/api/opportunities/${id}/contacts/${contactId}`, { method: "DELETE" });
  };

  const addNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setAddingNote(true);
    const res = await fetch(`/api/opportunities/${id}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: noteText }),
    });
    const note = await res.json();
    setOpp((prev) => (prev ? { ...prev, notes: [note, ...(prev.notes ?? [])] } : prev));
    setNoteText("");
    setAddingNote(false);
  };

  const deleteNote = async (noteId: string) => {
    setOpp((prev) => (prev ? { ...prev, notes: prev.notes?.filter((n) => n.id !== noteId) } : prev));
    await fetch(`/api/opportunities/${id}/notes/${noteId}`, { method: "DELETE" });
  };

  const addFollowUpTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!todoTitle.trim() || !opp) return;
    setAddingTodo(true);
    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: todoTitle,
        priority: "MEDIUM",
        type: "PROFESSIONAL",
        dueDate: todoDueDate,
        opportunityId: opp.id,
      }),
    });
    const todo = await res.json();
    setOpp((prev) => (prev ? { ...prev, todos: [todo, ...(prev.todos ?? [])] } : prev));
    setTodoTitle("");
    setTodoDueDate(new Date().toISOString().slice(0, 10));
    setAddingTodo(false);
  };

  const toggleTodo = async (todoId: string, status: string) => {
    setOpp((prev) =>
      prev ? { ...prev, todos: prev.todos?.map((t) => (t.id === todoId ? { ...t, status: status as Todo["status"] } : t)) } : prev
    );
    await fetch(`/api/todos/${todoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  };

  if (loading || !opp) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: "var(--surface)" }} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <button
          onClick={() => router.push("/dashboard/opportunities")}
          className="flex items-center gap-1.5 text-xs mb-3"
          style={{ color: "var(--muted)" }}
        >
          <ArrowLeft size={13} /> Back to Jobs
        </button>

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold" style={{ color: "var(--foreground)" }}>
              {opp.role} <span style={{ color: "var(--muted)" }}>@ {opp.company}</span>
            </h1>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap text-xs" style={{ color: "var(--muted)" }}>
              {opp.sourceName && <span>Posted by {opp.sourceName}</span>}
              <span>· {opp.sourcePlatform === "JOB_BOARD" ? "Job Board" : opp.sourcePlatform.charAt(0) + opp.sourcePlatform.slice(1).toLowerCase()}</span>
              {opp.sourceUrl && (
                <a href={opp.sourceUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline" style={{ color: "var(--accent)" }}>
                  View post <ExternalLink size={11} />
                </a>
              )}
            </div>
          </div>
          <button onClick={handleDeleteOpportunity} style={{ color: "var(--muted)" }} className="hover:text-red-400 transition-colors shrink-0">
            <Trash2 size={16} />
          </button>
        </div>

        <div className="flex gap-2 flex-wrap mt-4">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => updateStatus(s)}
              className="text-xs px-3 py-1.5 rounded-full transition-colors"
              style={{
                background: opp.status === s ? OPPORTUNITY_STATUS_COLORS[s] : "var(--surface-2)",
                color: opp.status === s ? "white" : "var(--muted)",
              }}
            >
              {OPPORTUNITY_STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Contacts */}
      <section className="rounded-xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <h2 className="text-sm font-medium mb-3" style={{ color: "var(--foreground)" }}>Outreach Log</h2>

        <form onSubmit={addContact} className="flex flex-col sm:flex-row gap-2 mb-4">
          <input
            style={{ ...inputStyle, flex: 1 }}
            placeholder="Name (e.g. E1)"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
          />
          <select style={inputStyle} value={contactChannel} onChange={(e) => setContactChannel(e.target.value as ContactChannel)}>
            {CONTACT_CHANNELS.map((c) => (
              <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>
            ))}
          </select>
          <button
            type="submit"
            disabled={addingContact || !contactName.trim()}
            className="px-3 py-1.5 rounded-md text-xs font-medium text-white shrink-0 disabled:opacity-50"
            style={{ background: "var(--accent)" }}
          >
            <Plus size={13} className="inline -mt-0.5" /> Add
          </button>
        </form>

        {opp.contacts && opp.contacts.length > 0 ? (
          <div className="flex flex-col gap-2">
            {opp.contacts.map((c: Contact) => (
              <div key={c.id} className="flex items-center gap-2 p-2 rounded-lg flex-wrap" style={{ background: "var(--surface-2)" }}>
                {c.channel === "LINKEDIN" ? <Link2 size={13} style={{ color: "var(--muted)" }} /> : c.channel === "EMAIL" ? <Mail size={13} style={{ color: "var(--muted)" }} /> : <MoreHorizontal size={13} style={{ color: "var(--muted)" }} />}
                <span className="text-sm flex-1 min-w-[80px]" style={{ color: "var(--foreground)" }}>{c.name}</span>
                {c.contactedAt && (
                  <span className="text-xs" style={{ color: "var(--muted)" }}>{format(new Date(c.contactedAt), "MMM d")}</span>
                )}
                <select
                  value={c.status}
                  onChange={(e) => updateContactStatus(c.id, e.target.value as ContactStatus)}
                  className="text-xs px-2 py-1 rounded-full border-0"
                  style={{ background: CONTACT_STATUS_COLORS[c.status] + "22", color: CONTACT_STATUS_COLORS[c.status] }}
                >
                  {CONTACT_STATUSES.map((s) => (
                    <option key={s} value={s}>{CONTACT_STATUS_LABELS[s]}</option>
                  ))}
                </select>
                <button onClick={() => deleteContact(c.id)} style={{ color: "var(--muted)" }} className="hover:text-red-400 transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs" style={{ color: "var(--muted)" }}>No outreach logged yet.</p>
        )}
      </section>

      {/* Follow-up todos */}
      <section className="rounded-xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <h2 className="text-sm font-medium mb-3" style={{ color: "var(--foreground)" }}>Follow-up Todos</h2>

        <form onSubmit={addFollowUpTodo} className="flex flex-col sm:flex-row gap-2 mb-4">
          <input
            style={{ ...inputStyle, flex: 1 }}
            placeholder="e.g. Follow up with E2 on LinkedIn"
            value={todoTitle}
            onChange={(e) => setTodoTitle(e.target.value)}
          />
          <input
            type="date"
            style={inputStyle}
            value={todoDueDate}
            onChange={(e) => setTodoDueDate(e.target.value)}
          />
          <button
            type="submit"
            disabled={addingTodo || !todoTitle.trim()}
            className="px-3 py-1.5 rounded-md text-xs font-medium text-white shrink-0 disabled:opacity-50"
            style={{ background: "var(--accent)" }}
          >
            <Plus size={13} className="inline -mt-0.5" /> Add
          </button>
        </form>

        {opp.todos && opp.todos.length > 0 ? (
          <div className="flex flex-col gap-2">
            {opp.todos.map((t) => (
              <div key={t.id} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: "var(--surface-2)" }}>
                <button
                  onClick={() => toggleTodo(t.id, t.status === "COMPLETED" ? "PENDING" : "COMPLETED")}
                  className="w-4 h-4 rounded border flex items-center justify-center flex-shrink-0"
                  style={t.status === "COMPLETED" ? { background: "var(--success)", borderColor: "transparent" } : { borderColor: "var(--muted)" }}
                >
                  {t.status === "COMPLETED" && (
                    <svg width="8" height="6" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
                <span
                  className="text-sm flex-1"
                  style={{ color: t.status === "COMPLETED" ? "var(--muted)" : "var(--foreground)", textDecoration: t.status === "COMPLETED" ? "line-through" : "none" }}
                >
                  {t.title}
                </span>
                {t.dueDate && (
                  <span className="text-xs shrink-0" style={{ color: "var(--muted)" }}>
                    {format(new Date(t.dueDate), "MMM d")}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs" style={{ color: "var(--muted)" }}>No follow-ups yet — add one and it&apos;ll show on today&apos;s dashboard too.</p>
        )}
      </section>

      {/* Notes */}
      <section className="rounded-xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <h2 className="text-sm font-medium mb-3" style={{ color: "var(--foreground)" }}>Notes</h2>

        <form onSubmit={addNote} className="flex flex-col gap-2 mb-4">
          <textarea
            style={{ ...inputStyle, resize: "none", minHeight: "60px" }}
            placeholder="Progress update, e.g. 'E2 replied, said they'd refer me by Friday'"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
          />
          <button
            type="submit"
            disabled={addingNote || !noteText.trim()}
            className="self-start px-3 py-1.5 rounded-md text-xs font-medium text-white disabled:opacity-50"
            style={{ background: "var(--accent)" }}
          >
            Add note
          </button>
        </form>

        {opp.notes && opp.notes.length > 0 ? (
          <div className="flex flex-col gap-3">
            {opp.notes.map((n) => (
              <div key={n.id} className="flex items-start justify-between gap-2 pb-3" style={{ borderBottom: "1px solid var(--border)" }}>
                <div>
                  <p className="text-sm" style={{ color: "var(--foreground)" }}>{n.content}</p>
                  <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>{format(new Date(n.createdAt), "MMM d, yyyy 'at' h:mm a")}</p>
                </div>
                <button onClick={() => deleteNote(n.id)} style={{ color: "var(--muted)" }} className="hover:text-red-400 transition-colors shrink-0">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs" style={{ color: "var(--muted)" }}>No notes yet.</p>
        )}
      </section>
    </div>
  );
}
