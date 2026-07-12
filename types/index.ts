export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type TodoType = "PERSONAL" | "PROFESSIONAL";
export type TodoStatus = "PENDING" | "COMPLETED" | "CANCELLED";
export type GoalType = "PERSONAL" | "PROFESSIONAL";
export type OpportunityStatus =
  | "DISCOVERED"
  | "OUTREACH_SENT"
  | "APPLIED"
  | "INTERVIEWING"
  | "OFFER"
  | "REJECTED"
  | "CLOSED";
export type SourcePlatform = "LINKEDIN" | "REFERRAL" | "JOB_BOARD" | "OTHER";
export type ContactChannel = "LINKEDIN" | "EMAIL" | "OTHER";
export type ContactStatus = "NOT_CONTACTED" | "SENT" | "REPLIED" | "NO_RESPONSE" | "REFERRED";

export interface Goal {
  id: string;
  name: string;
  color: string;
  type: GoalType;
  _count?: { todos: number };
}

export interface OpportunitySummary {
  id: string;
  company: string;
  role: string;
}

export interface Todo {
  id: string;
  title: string;
  notes?: string | null;
  priority: Priority;
  type: TodoType;
  status: TodoStatus;
  dueDate?: string | null;
  completedAt?: string | null;
  goalId?: string | null;
  goal?: Goal | null;
  opportunityId?: string | null;
  opportunity?: OpportunitySummary | null;
  createdAt: string;
}

export interface Contact {
  id: string;
  opportunityId: string;
  name: string;
  channel: ContactChannel;
  status: ContactStatus;
  profileUrl?: string | null;
  contactedAt?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface OpportunityNote {
  id: string;
  opportunityId: string;
  content: string;
  createdAt: string;
}

export interface Opportunity {
  id: string;
  company: string;
  role: string;
  sourceName?: string | null;
  sourcePlatform: SourcePlatform;
  sourceUrl?: string | null;
  status: OpportunityStatus;
  createdAt: string;
  updatedAt: string;
  contacts?: Contact[];
  notes?: OpportunityNote[];
  todos?: Todo[];
  _count?: { contacts: number; notes: number; todos: number };
}

export interface DailyStat {
  date: string;
  total: number;
  completed: number;
  rate: number;
}

export interface Analytics {
  dailyStats: DailyStat[];
  totals: { all: number; completed: number; pending: number };
  priorityStats: { priority: string; status: string; _count: number }[];
  typeStats: { type: string; _count: number }[];
}
