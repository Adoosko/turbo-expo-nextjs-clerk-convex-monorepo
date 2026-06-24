import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, Filter, Pencil, Search, Trash2 } from "lucide-react";
import React, { useState, useMemo } from "react";
import { Entry, EXPENSE_REASON_LABELS } from "@/lib/types";
import { formatDateSlovakFull, getWeekDayName, formatDateSlovakNumeric, formatDateSlovakShort } from "./utils";

// ─── Types ──────────────────────────────────────────────────
type TypeFilter = "all" | "income" | "expense";

interface DennikTabProps {
  activeModuleId: string;
  setActiveModuleId: (id: string) => void;
  allEntries: Entry[] | undefined;
  todayDate: string;
  userId: string | undefined;
  handleDeleteEntry: (entryId: string) => void;
  onStartEdit: (entry: Entry) => void;
  memberships: any;
  user: any;
}

// ─── Filter Pill Button ─────────────────────────────────────
function FilterPill({
  active,
  onClick,
  children,
  variant = "neutral",
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  variant?: "neutral" | "income" | "expense";
}) {
  const base =
    "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer border-none select-none whitespace-nowrap";

  const variants = {
    neutral: active
      ? "bg-text-primary text-white shadow-sm"
      : "bg-bg-surface-raised/60 text-text-muted hover:bg-bg-surface-raised",
    income: active
      ? "bg-accent-primary text-white shadow-sm"
      : "bg-accent-light/50 text-accent-primary hover:bg-accent-light",
    expense: active
      ? "bg-accent-warm text-white shadow-sm"
      : "bg-amber-50 text-accent-warm hover:bg-amber-100/60",
  };

  return (
    <button type="button" onClick={onClick} className={cn(base, variants[variant])}>
      {children}
    </button>
  );
}

// ─── Stat Pill ──────────────────────────────────────────────
function StatPill({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: string | number;
  unit: string;
  color: "green" | "amber" | "muted";
}) {
  const colorClasses = {
    green: "text-accent-primary",
    amber: "text-accent-warm",
    muted: "text-text-primary",
  };

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider">{label}</span>
      <span className={cn("font-inter text-sm font-bold tabular-nums", colorClasses[color])}>
        {value}
      </span>
      <span className="text-[10px] font-medium text-text-muted">{unit}</span>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────
export default function DennikTab({
  activeModuleId,
  setActiveModuleId,
  allEntries,
  todayDate,
  userId,
  handleDeleteEntry,
  onStartEdit,
  memberships,
  user,
}: DennikTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMonth, setFilterMonth] = useState("all");
  const [filterType, setFilterType] = useState<TypeFilter>("all");

  // ─── Member resolution ──────────────────────────────────
  const getMemberDetails = (loggedBy: string) => {
    if (loggedBy === userId && user) {
      const initials =
        [user.firstName?.[0], user.lastName?.[0]].filter(Boolean).join("") ||
        user.username?.[0]?.toUpperCase() ||
        user.primaryEmailAddress?.emailAddress?.[0]?.toUpperCase() ||
        "?";
      const name =
        user.fullName ||
        (user.firstName || user.lastName ? [user.firstName, user.lastName].filter(Boolean).join(" ") : "") ||
        user.username ||
        user.primaryEmailAddress?.emailAddress ||
        "Vy";
      return { imageUrl: user.imageUrl, name, initials };
    }

    const membership = memberships?.data?.find(
      (m: any) => m.publicUserData?.userId === loggedBy
    );
    if (membership) {
      const member = membership.publicUserData;
      const initials =
        [member.firstName?.[0], member.lastName?.[0]].filter(Boolean).join("") ||
        member.identifier?.[0]?.toUpperCase() ||
        "?";
      const name =
        member.firstName || member.lastName
          ? [member.firstName, member.lastName].filter(Boolean).join(" ")
          : member.identifier;
      return { imageUrl: member.imageUrl, name, initials };
    }

    return null;
  };

  const renderAvatar = (loggedBy: string) => {
    const memberInfo = getMemberDetails(loggedBy);
    if (memberInfo) {
      return memberInfo.imageUrl ? (
        <img
          src={memberInfo.imageUrl}
          alt={memberInfo.name}
          className="w-6 h-6 rounded-full object-cover ring-1 ring-border-default/50"
          title={memberInfo.name}
        />
      ) : (
        <div
          className="w-6 h-6 rounded-full bg-accent-light flex items-center justify-center"
          title={memberInfo.name}
        >
          <span className="font-inter text-[10px] font-semibold text-accent-primary">
            {memberInfo.initials}
          </span>
        </div>
      );
    }
    return (
      <div className="w-6 h-6 rounded-full bg-bg-surface-raised/60 flex items-center justify-center" title="Neznámy člen">
        <span className="text-[9px] text-text-muted font-semibold">?</span>
      </div>
    );
  };

  // ─── Data pipeline ──────────────────────────────────────
  const moduleEntries = allEntries ? allEntries.filter((e) => e.moduleId === activeModuleId) : [];

  const uniqueMonths = useMemo(
    () =>
      Array.from(
        new Set(moduleEntries.map((e) => e.date.substring(0, 7)))
      ).sort((a, b) => b.localeCompare(a)),
    [moduleEntries]
  );

  const formatMonthYearLabel = (ymStr: string) => {
    const [y, m] = ymStr.split("-").map(Number);
    const date = new Date(y, m - 1, 1);
    const formatted = date.toLocaleDateString("sk-SK", { month: "long", year: "numeric" });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  // ─── Filtering ──────────────────────────────────────────
  const filteredEntries = useMemo(() => {
    return moduleEntries.filter((entry) => {
      // Month filter
      if (filterMonth !== "all" && entry.date.substring(0, 7) !== filterMonth) return false;

      // Type filter
      if (filterType !== "all") {
        const entryType = entry.type || "income";
        if (entryType !== filterType) return false;
      }

      // Search
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      const memberName = getMemberDetails(entry.loggedBy)?.name || "";
      const dayName = getWeekDayName(entry.date);
      const dateSlovakNum = formatDateSlovakNumeric(entry.date);
      const dateSlovakFull = formatDateSlovakFull(entry.date);
      const typeLabel = entry.type === "expense" ? "výdaj" : "znáška príjem";
      const reasonLabel = entry.type === "expense" && entry.reason ? EXPENSE_REASON_LABELS[entry.reason] || "" : "";

      return (
        (entry.note && entry.note.toLowerCase().includes(term)) ||
        entry.value.toString().includes(term) ||
        memberName.toLowerCase().includes(term) ||
        dayName.toLowerCase().includes(term) ||
        dateSlovakNum.toLowerCase().includes(term) ||
        dateSlovakFull.toLowerCase().includes(term) ||
        typeLabel.toLowerCase().includes(term) ||
        reasonLabel.toLowerCase().includes(term)
      );
    });
  }, [moduleEntries, filterMonth, filterType, searchTerm]);

  // ─── Statistics ─────────────────────────────────────────
  const stats = useMemo(() => {
    const income = filteredEntries.filter((e) => !e.type || e.type === "income");
    const expense = filteredEntries.filter((e) => e.type === "expense");
    const totalIncome = income.reduce((s, e) => s + e.value, 0);
    const totalExpense = expense.reduce((s, e) => s + e.value, 0);
    const incomeDays = new Set(income.map((e) => e.date)).size;
    const avg = incomeDays > 0 ? totalIncome / incomeDays : 0;
    const maxIncome = income.length > 0 ? Math.max(...income.map((e) => e.value)) : 0;
    return { totalIncome, totalExpense, avg, maxIncome, entryCount: filteredEntries.length };
  }, [filteredEntries]);

  // ─── Grouped by month ───────────────────────────────────
  const groupedEntries = useMemo(() => {
    const grouped: { monthKey: string; monthLabel: string; entries: Entry[]; monthIncome: number; monthExpense: number }[] = [];

    filteredEntries.forEach((entry) => {
      const monthKey = entry.date.substring(0, 7);
      let mGroup = grouped.find((g) => g.monthKey === monthKey);
      if (!mGroup) {
        const [y, m] = monthKey.split("-").map(Number);
        const date = new Date(y, m - 1, 1);
        const raw = date.toLocaleDateString("sk-SK", { month: "long", year: "numeric" });
        mGroup = {
          monthKey,
          monthLabel: raw.charAt(0).toUpperCase() + raw.slice(1),
          entries: [],
          monthIncome: 0,
          monthExpense: 0,
        };
        grouped.push(mGroup);
      }
      mGroup.entries.push(entry);
      if (!entry.type || entry.type === "income") {
        mGroup.monthIncome += entry.value;
      } else {
        mGroup.monthExpense += entry.value;
      }
    });

    return grouped;
  }, [filteredEntries]);

  // ─── Render ─────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-5">
      {/* ── Toolbar: Stats + Filters ── */}
      <div className="bg-bg-surface rounded-2xl overflow-hidden shadow-none border border-border-default/40 animate-fade-in">
        {/* Inline stat bar */}
        {stats.entryCount > 0 && (
          <div className="flex items-center gap-4 sm:gap-6 px-4 sm:px-5 py-3 border-b border-border-default/30 overflow-x-auto scrollbar-none">
            <StatPill label="Znáška" value={stats.totalIncome} unit="ks" color="green" />
            <div className="w-px h-4 bg-border-default/40 shrink-0" />
            <StatPill label="Výdaj" value={stats.totalExpense} unit="ks" color="amber" />
            <div className="w-px h-4 bg-border-default/40 shrink-0" />
            <div className="flex">
              <StatPill label="Priemer" value={stats.avg.toFixed(1)} unit="ks/deň" color="muted" />
            </div>
            {stats.maxIncome > 0 && (
              <>
                <div className="w-px h-4 bg-border-default/40 shrink-0" />
                <StatPill label="Rekord" value={stats.maxIncome} unit="ks" color="green" />
              </>
            )}
          </div>
        )}

        {/* Filter row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 px-4 sm:px-5 py-3">
          {/* Type filter pills */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Filter className="h-3.5 w-3.5 text-text-muted/50 mr-1 hidden sm:block" />
            <FilterPill active={filterType === "all"} onClick={() => setFilterType("all")} variant="neutral">
              Všetko
            </FilterPill>
            <FilterPill active={filterType === "income"} onClick={() => setFilterType("income")} variant="income">
              ↑ Znáška
            </FilterPill>
            <FilterPill active={filterType === "expense"} onClick={() => setFilterType("expense")} variant="expense">
              ↓ Výdaj
            </FilterPill>
          </div>

          <div className="flex-1" />

          {/* Search + Month */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted/40" />
              <input
                type="text"
                placeholder="Hľadať..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-44 pl-8 pr-3 py-2 bg-bg-base/60 rounded-lg text-xs text-text-primary placeholder:text-text-muted/40 border-none focus:outline-none focus:ring-1 focus:ring-accent-primary/40 transition-shadow"
              />
            </div>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="bg-bg-base/60 border-none rounded-lg px-3 py-2 text-xs text-text-primary focus:ring-1 focus:ring-accent-primary/40 cursor-pointer focus:outline-none"
            >
              <option value="all">Všetky mesiace</option>
              {uniqueMonths.map((ym) => (
                <option key={ym} value={ym}>{formatMonthYearLabel(ym)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      {allEntries === undefined ? (
        /* Loading skeleton */
        <div className="bg-bg-surface rounded-2xl border border-border-default/40 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={cn("flex items-center gap-4 px-5 py-3.5", i % 2 === 0 ? "bg-bg-surface" : "bg-bg-base/30")}
            >
              <div className="h-3 w-16 rounded bg-bg-surface-raised/60 animate-pulse" />
              <div className="h-5 w-14 rounded-full bg-bg-surface-raised/60 animate-pulse" />
              <div className="flex-1" />
              <div className="h-3 w-10 rounded bg-bg-surface-raised/60 animate-pulse" />
              <div className="h-6 w-6 rounded-full bg-bg-surface-raised/60 animate-pulse" />
            </div>
          ))}
        </div>
      ) : filteredEntries.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-20 bg-bg-surface rounded-2xl border border-border-default/40 animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-bg-base flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-text-muted/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-text-primary">Žiadne záznamy</p>
          <p className="text-xs text-text-muted mt-1 max-w-[220px] text-center">
            Skúste upraviť filtre alebo vyhľadávanie.
          </p>
        </div>
      ) : (
        /* Data table */
        <div className="bg-bg-surface rounded-2xl border border-border-default/40 overflow-hidden">
          {/* Desktop table header */}
          <div className="hidden sm:grid grid-cols-[minmax(140px,1.2fr)_100px_100px_1fr_40px_72px] gap-2 px-5 py-2.5 border-b border-border-default/30 bg-bg-base/40">
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Dátum</span>
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Typ</span>
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider text-right">Množstvo</span>
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Poznámka</span>
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider text-center">Kto</span>
            <span />
          </div>

          {/* Grouped entries */}
          {groupedEntries.map((mGroup) => (
            <div key={mGroup.monthKey}>
              {/* Month separator */}
              <div className="flex items-center gap-3 px-5 py-2 bg-bg-base/50 border-y border-border-default/20">
                <span className="text-[11px] font-bold text-text-primary uppercase tracking-wide">
                  {mGroup.monthLabel}
                </span>
                <div className="flex-1 h-px bg-border-default/20" />
                <div className="flex items-center gap-2.5 text-[10px] font-semibold">
                  {mGroup.monthIncome > 0 && (
                    <span className="text-accent-primary">{mGroup.monthIncome} ks ↑</span>
                  )}
                  {mGroup.monthExpense > 0 && (
                    <span className="text-accent-warm">{mGroup.monthExpense} ks ↓</span>
                  )}
                </div>
              </div>

              {/* Entry rows */}
              {mGroup.entries.map((entry, rowIdx) => {
                const isIncome = !entry.type || entry.type === "income";
                const isToday = entry.date === todayDate;
                const isEven = rowIdx % 2 === 0;

                return (
                  <div
                    key={entry._id}
                    className={cn(
                      "group relative animate-fade-in-up",
                      "transition-colors duration-150",
                      isEven ? "bg-bg-surface" : "bg-bg-base/20",
                      "hover:bg-accent-light/25"
                    )}
                    style={{ "--stagger-index": rowIdx } as React.CSSProperties}
                  >
                    {/* ── Desktop row ── */}
                    <div className="hidden sm:grid grid-cols-[minmax(140px,1.2fr)_100px_100px_1fr_40px_72px] gap-2 items-center px-5 py-3">
                      {/* Date */}
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm font-medium text-text-primary truncate">
                          {formatDateSlovakShort(entry.date)}
                        </span>
                        <span className="text-[10px] font-medium text-text-muted capitalize">
                          {getWeekDayName(entry.date).substring(0, 2)}
                        </span>
                        {isToday && (
                          <span className="text-[9px] font-bold text-accent-primary bg-accent-light rounded px-1.5 py-0.5 leading-none uppercase tracking-wide">
                            Dnes
                          </span>
                        )}
                      </div>

                      {/* Type badge */}
                      <div>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide",
                            isIncome
                              ? "bg-accent-light/60 text-accent-primary"
                              : "bg-amber-50 text-accent-warm"
                          )}
                        >
                          {isIncome ? (
                            <><ArrowUp className="h-2.5 w-2.5" />Znáška</>
                          ) : (
                            <><ArrowDown className="h-2.5 w-2.5" />{entry.reason ? EXPENSE_REASON_LABELS[entry.reason] : "Výdaj"}</>
                          )}
                        </span>
                      </div>

                      {/* Quantity */}
                      <div className="text-right flex items-center justify-end gap-1.5">
                        {activeModuleId === "vajcia" && (
                          <img
                            src="/egg.png"
                            alt="Vajce"
                            className="h-5 w-5 object-contain shrink-0"
                          />
                        )}
                        <span className={cn(
                          "font-inter text-sm font-bold tabular-nums",
                          isIncome ? "text-accent-primary" : "text-accent-warm"
                        )}>
                          {isIncome ? "+" : "−"}{entry.value}
                        </span>
                        <span className="text-[10px] font-medium text-text-muted ml-0.5">ks</span>
                      </div>

                      {/* Note */}
                      <div className="min-w-0">
                        {entry.note ? (
                          <span className="text-xs text-text-muted truncate block max-w-[300px]" title={entry.note}>
                            {entry.note}
                          </span>
                        ) : (
                          <span className="text-xs text-text-muted/30">—</span>
                        )}
                      </div>

                      {/* Avatar */}
                      <div className="flex justify-center">
                        {renderAvatar(entry.loggedBy)}
                      </div>

                      {/* Actions — visible on hover only */}
                      <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                        <button
                          type="button"
                          onClick={() => onStartEdit(entry)}
                          className="p-1.5 rounded-lg text-text-muted/50 hover:text-accent-primary hover:bg-accent-light/60 transition-colors duration-150 cursor-pointer border-none bg-transparent"
                          title="Upraviť"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteEntry(entry._id)}
                          className="p-1.5 rounded-lg text-text-muted/50 hover:text-state-error hover:bg-red-50/60 transition-colors duration-150 cursor-pointer border-none bg-transparent"
                          title="Vymazať"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* ── Mobile row ── */}
                    <div className="sm:hidden flex items-center gap-3 px-4 py-3">
                      {/* Left: type indicator dot + date */}
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full shrink-0",
                        isIncome ? "bg-accent-primary" : "bg-accent-warm"
                      )} />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-text-primary">
                            {formatDateSlovakNumeric(entry.date)}
                          </span>
                          <span className="text-[10px] font-medium text-text-muted capitalize">
                            {getWeekDayName(entry.date).substring(0, 2)}
                          </span>
                          {isToday && (
                            <span className="text-[9px] font-bold text-accent-primary bg-accent-light rounded px-1.5 py-0.5 leading-none">
                              Dnes
                            </span>
                          )}
                        </div>
                        {entry.note && (
                          <p className="text-[11px] text-text-muted truncate mt-0.5">{entry.note}</p>
                        )}
                      </div>

                      {/* Quantity */}
                      <div className="flex items-center gap-1 shrink-0">
                        {activeModuleId === "vajcia" && (
                          <img
                            src="/egg.png"
                            alt="Vajce"
                            className="h-4 w-4 object-contain shrink-0"
                          />
                        )}
                        <span className={cn(
                          "font-inter text-sm font-bold tabular-nums",
                          isIncome ? "text-accent-primary" : "text-accent-warm"
                        )}>
                          {isIncome ? "+" : "−"}{entry.value}
                        </span>
                        <span className="text-[10px] font-medium text-text-muted ml-0.5">ks</span>
                      </div>

                      {/* Actions — always visible on mobile */}
                      <div className="flex items-center gap-0 shrink-0">
                        <button
                          type="button"
                          onClick={() => onStartEdit(entry)}
                          className="p-1.5 rounded-lg text-text-muted/40 hover:text-accent-primary transition-colors cursor-pointer border-none bg-transparent"
                          title="Upraviť"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteEntry(entry._id)}
                          className="p-1.5 rounded-lg text-text-muted/40 hover:text-state-error transition-colors cursor-pointer border-none bg-transparent"
                          title="Vymazať"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          {/* Bottom padding for mobile FAB clearance */}
          <div className="h-20 sm:h-4" />
        </div>
      )}
    </div>
  );
}
