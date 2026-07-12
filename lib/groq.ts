const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

export interface ParsedTodo {
  title: string;
  notes?: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  type: "PERSONAL" | "PROFESSIONAL";
  dueDate?: string | null;
}

const SYSTEM_PROMPT = `You turn a user's free-form text into a list of todo items.
Return ONLY JSON of the form {"todos": [...]}, where each todo has:
- title: string, short and actionable
- notes: string or null, any extra detail
- priority: one of LOW, MEDIUM, HIGH, URGENT (infer from urgency words; default MEDIUM)
- type: PERSONAL or PROFESSIONAL (infer from context; default PERSONAL)
- dueDate: an ISO date string (YYYY-MM-DD) if a date/day is mentioned or implied (e.g. "today", "tomorrow", "friday"), otherwise null. Today's date is ${new Date().toISOString().slice(0, 10)}.
Split distinct tasks into separate todo objects. If the text describes only one task, return one item.`;

export async function parseTodosFromText(text: string): Promise<ParsedTodo[]> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not configured");

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: text },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq request failed: ${res.status} ${errText}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Groq returned no content");

  let parsed: { todos?: ParsedTodo[] };
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("Groq returned invalid JSON");
  }

  if (!Array.isArray(parsed.todos)) throw new Error("Groq response missing todos array");

  return parsed.todos
    .filter((t) => typeof t?.title === "string" && t.title.trim().length > 0)
    .map((t) => ({
      title: t.title.trim(),
      notes: t.notes?.trim() || null,
      priority: (["LOW", "MEDIUM", "HIGH", "URGENT"] as const).includes(t.priority) ? t.priority : "MEDIUM",
      type: (["PERSONAL", "PROFESSIONAL"] as const).includes(t.type) ? t.type : "PERSONAL",
      dueDate: t.dueDate || null,
    }));
}
