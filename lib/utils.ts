import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const PRIORITY_COLORS: Record<string, string> = {
  URGENT: "#ef4444",
  HIGH: "#f59e0b",
  MEDIUM: "#6366f1",
  LOW: "#6b7280",
};

export const PRIORITY_LABELS: Record<string, string> = {
  URGENT: "Urgent",
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

export const OPPORTUNITY_STATUS_COLORS: Record<string, string> = {
  DISCOVERED: "#6b7280",
  OUTREACH_SENT: "#3b82f6",
  APPLIED: "#6366f1",
  INTERVIEWING: "#f59e0b",
  OFFER: "#22c55e",
  REJECTED: "#ef4444",
  CLOSED: "#666666",
};

export const OPPORTUNITY_STATUS_LABELS: Record<string, string> = {
  DISCOVERED: "Discovered",
  OUTREACH_SENT: "Outreach Sent",
  APPLIED: "Applied",
  INTERVIEWING: "Interviewing",
  OFFER: "Offer",
  REJECTED: "Rejected",
  CLOSED: "Closed",
};

export const CONTACT_STATUS_LABELS: Record<string, string> = {
  NOT_CONTACTED: "Not Contacted",
  SENT: "Sent",
  REPLIED: "Replied",
  NO_RESPONSE: "No Response",
  REFERRED: "Referred",
};

export const CONTACT_STATUS_COLORS: Record<string, string> = {
  NOT_CONTACTED: "#6b7280",
  SENT: "#3b82f6",
  REPLIED: "#22c55e",
  NO_RESPONSE: "#ef4444",
  REFERRED: "#a855f7",
};
