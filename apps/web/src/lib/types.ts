import { Id } from "@packages/backend/convex/_generated/dataModel";

// ─── Entry ──────────────────────────────────────────────────
export type EntryType = "income" | "expense";
export type ExpenseReason = "predaj" | "darovanie" | "spotreba" | "kazene";

export interface Entry {
  _id: Id<"entries">;
  _creationTime: number;
  orgId: string;
  moduleId: string;
  date: string;
  value: number;
  note?: string;
  type?: EntryType;
  reason?: ExpenseReason;
  loggedBy: string;
  updatedAt?: number;
}

// ─── Chicken ────────────────────────────────────────────────
export interface Chicken {
  _id: Id<"chickens">;
  _creationTime: number;
  orgId: string;
  name: string;
  count: number;
  color: string;
  notes?: string;
  storageId?: string;
  presetId?: string;
  imageUrl?: string;
  hatchedDate?: string;
}

// ─── Dashboard Data ─────────────────────────────────────────
export interface DashboardData {
  todayValue: number;
  todayEntry: Entry | null;
  todayExpenseEntry: Entry | null;
  todayExpense: number;
  recentEntries: Entry[];
  stock: number;
  totalIncome: number;
  totalExpense: number;
}

// ─── Expense Reason Labels ──────────────────────────────────
export const EXPENSE_REASON_LABELS: Record<ExpenseReason, string> = {
  predaj: "Predaj",
  darovanie: "Darované",
  spotreba: "Vlastná spotreba",
  kazene: "Kazené / stratené",
};

export const EXPENSE_REASONS: { value: ExpenseReason; label: string }[] = [
  { value: "predaj", label: "Predaj" },
  { value: "darovanie", label: "Darované" },
  { value: "spotreba", label: "Vlastná spotreba" },
  { value: "kazene", label: "Kazené / stratené" },
];
