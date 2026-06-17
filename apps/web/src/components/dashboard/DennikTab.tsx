import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { endOfWeek, getWeek, startOfWeek } from "date-fns";
import { Pencil, Search, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { formatDateSlovakFull, getWeekDayName, formatDateSlovakNumeric } from "./utils";

interface DennikTabProps {
  activeModuleId: string;
  setActiveModuleId: (id: string) => void;
  allEntries: any[] | undefined;
  todayDate: string;
  userId: string | undefined;
  handleDeleteEntry: (entryId: string) => void;
  setEditingEntry: (entry: any) => void;
  setEditValue: (val: number) => void;
  setEditNote: (val: string) => void;
  setEditDialogOpen: (open: boolean) => void;
  memberships: any;
  user: any;
}

export default function DennikTab({
  activeModuleId,
  setActiveModuleId,
  allEntries,
  todayDate,
  userId,
  handleDeleteEntry,
  setEditingEntry,
  setEditValue,
  setEditNote,
  setEditDialogOpen,
  memberships,
  user,
}: DennikTabProps) {
  // Local filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMonth, setFilterMonth] = useState("all");

  const getMemberDetails = (loggedBy: string) => {
    // 1. Check if it's the current user
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
      return {
        imageUrl: user.imageUrl,
        name,
        initials,
      };
    }

    // 2. Check memberships list
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
      return {
        imageUrl: member.imageUrl,
        name,
        initials,
      };
    }

    // 3. Fallback
    return null;
  };

  const renderAvatar = (loggedBy: string) => {
    const memberInfo = getMemberDetails(loggedBy);
    if (memberInfo) {
      return memberInfo.imageUrl ? (
        <img
          src={memberInfo.imageUrl}
          alt={memberInfo.name}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover bg-bg-base"
          title={memberInfo.name}
        />
      ) : (
        <div
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-accent-light flex items-center justify-center cursor-help"
          title={memberInfo.name}
        >
          <span className="font-nunito text-[11px] sm:text-xs font-semibold text-accent-primary">
            {memberInfo.initials}
          </span>
        </div>
      );
    }
    return (
      <div
        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-bg-base/60 flex items-center justify-center"
        title="Neznámy člen"
      >
        <span className="text-[10px] sm:text-[11px] text-text-muted font-semibold">?</span>
      </div>
    );
  };

  // Filter entries by module ID first, so all stats reflect only the active module
  const moduleEntries = allEntries ? allEntries.filter((e) => e.moduleId === activeModuleId) : [];

  const totalEntries = moduleEntries.length;
  const totalEggs = moduleEntries.reduce((s, e) => s + (e.value || 0), 0);
  const avgEggs = totalEntries > 0 ? totalEggs / totalEntries : 0;
  
  const maxEntryValue =
    moduleEntries.length > 0
      ? Math.max(...moduleEntries.map((e) => e.value || 0), 1)
      : 1;

  // Extract unique months from moduleEntries
  const uniqueMonths = Array.from(
    new Set(
      moduleEntries.map((e) => {
        const [y, m] = e.date.split("-");
        return `${y}-${m}`;
      })
    )
  ).sort((a, b) => b.localeCompare(a));

  const formatMonthYearLabel = (ymStr: string) => {
    const [y, m] = ymStr.split("-").map(Number);
    const date = new Date(y, m - 1, 1);
    const formatted = date.toLocaleDateString("sk-SK", { month: "long", year: "numeric" });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  const filteredEntries = moduleEntries.filter((entry) => {
    const matchesSearch =
      !searchTerm ||
      (entry.note && entry.note.toLowerCase().includes(searchTerm.toLowerCase()));
    const entryMonth = entry.date.substring(0, 7); // "YYYY-MM"
    const matchesMonth = filterMonth === "all" || entryMonth === filterMonth;
    return matchesSearch && matchesMonth;
  });

  const getGroupedEntries = () => {
    const grouped: {
      monthKey: string;
      monthLabel: string;
      weeks: {
        weekKey: string;
        weekLabel: string;
        entries: any[];
      }[];
    }[] = [];

    filteredEntries.forEach((entry) => {
      const [y, m, d] = entry.date.split("-").map(Number);
      const date = new Date(y, m - 1, d);
      const monthKey = entry.date.substring(0, 7); // "YYYY-MM"

      const rawMonthName = date.toLocaleDateString("sk-SK", { month: "long", year: "numeric" });
      const monthLabel = rawMonthName.charAt(0).toUpperCase() + rawMonthName.slice(1);

      const monday = startOfWeek(date, { weekStartsOn: 1 });
      const sunday = endOfWeek(date, { weekStartsOn: 1 });
      const weekNum = getWeek(date, { weekStartsOn: 1 });
      const weekKey = `${monday.toLocaleDateString("en-CA")}_${weekNum}`;

      const mondayStr = monday.toLocaleDateString("sk-SK", { day: "numeric", month: "numeric" });
      const sundayStr = sunday.toLocaleDateString("sk-SK", { day: "numeric", month: "numeric" });
      const weekLabel = `Týždeň ${weekNum} (${mondayStr} – ${sundayStr})`;

      let mGroup = grouped.find((g) => g.monthKey === monthKey);
      if (!mGroup) {
        mGroup = { monthKey, monthLabel, weeks: [] };
        grouped.push(mGroup);
      }

      let wGroup = mGroup.weeks.find((w) => w.weekKey === weekKey);
      if (!wGroup) {
        wGroup = { weekKey, weekLabel, entries: [] };
        mGroup.weeks.push(wGroup);
      }

      wGroup.entries.push(entry);
    });

    return grouped;
  };

  const groupedEntries = getGroupedEntries();

  // Performance helper
  const getPerformanceState = (val: number) => {
    if (avgEggs === 0) return "normal";
    const ratio = val / avgEggs;
    if (ratio >= 1.15) return "good";
    if (ratio <= 0.85) return "bad";
    return "normal";
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Modular Modules Selector */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveModuleId("vajcia")}
          className={cn(
            "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-left cursor-pointer",
            activeModuleId === "vajcia"
              ? "bg-accent-primary text-white"
              : "bg-bg-surface hover:bg-bg-surface-raised text-text-muted"
          )}
        >
          <div
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-lg",
              activeModuleId === "vajcia" ? "text-amber-100" : "text-text-muted"
            )}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="fill-current"
            >
              <path d="M12 2C6.5 2 2 10 2 15a10 10 0 0 0 20 0c0-5-4.5-13-10-13Z" />
            </svg>
          </div>
          <span className="font-medium text-sm">Sliepky</span>
        </button>

        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-bg-surface/40 text-text-muted/40 select-none">
          <div className="flex h-5 w-5 items-center justify-center text-text-muted/40">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <span className="font-medium text-sm">Záhrada (V2)</span>
        </div>
      </div>

      {/* Summary stats card */}
      {moduleEntries.length > 0 && (
        <Card className="bg-bg-surface rounded-2xl overflow-hidden shadow-none border-0">
          <CardContent className="p-5">
            <div className="w-full grid grid-cols-3 gap-2.5 sm:gap-3 text-left">
              <div className="rounded-xl bg-bg-base/60 p-3 flex flex-col">
                <span className="text-xs font-medium text-text-muted/80 uppercase tracking-wider">
                  Celkom
                </span>
                <span className="font-nunito text-lg sm:text-xl font-semibold text-accent-warm mt-0.5">
                  {totalEggs}{" "}
                  <span className="text-sm font-medium font-inter text-text-muted">ks</span>
                </span>
              </div>
              <div className="rounded-xl bg-bg-base/60 p-3 flex flex-col">
                <span className="text-xs font-medium text-text-muted/80 uppercase tracking-wider">
                  Priemer / deň
                </span>
                <span className="font-nunito text-lg sm:text-xl font-semibold text-accent-primary mt-0.5">
                  {avgEggs.toFixed(1)}{" "}
                  <span className="text-sm font-medium font-inter text-text-muted">ks</span>
                </span>
              </div>
              <div className="rounded-xl bg-bg-base/60 p-3 flex flex-col">
                <span className="text-xs font-medium text-text-muted/80 uppercase tracking-wider">
                  Rekord dňa
                </span>
                <span className="font-nunito text-lg sm:text-xl font-semibold text-text-primary mt-0.5">
                  {maxEntryValue}{" "}
                  <span className="text-sm font-medium font-inter text-text-muted">ks</span>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-bg-surface p-4 rounded-2xl shadow-none border-0">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-text-muted/50" />
          <Input
            type="text"
            placeholder="Vyhľadať v poznámkach..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-bg-base/60 rounded-xl px-4 py-2.5 text-sm text-text-primary focus:ring-1 focus:ring-accent-primary placeholder:text-text-muted/40 h-11 border-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider whitespace-nowrap hidden sm:inline">
            Mesiac:
          </span>
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="w-full sm:w-[180px] bg-bg-base/60 border-none rounded-xl px-4 py-2.5 text-sm text-text-primary focus:ring-1 focus:ring-accent-primary h-11"
          >
            <option value="all">Všetky mesiace</option>
            {uniqueMonths.map((ym) => (
              <option key={ym} value={ym}>
                {formatMonthYearLabel(ym)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Timeline List */}
      {allEntries === undefined ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 w-full animate-pulse rounded-2xl bg-bg-surface" />
          ))}
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center p-6 bg-bg-surface rounded-2xl shadow-none border-0 animate-fade-in">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-text-muted/30 mb-3"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <p className="text-base font-semibold text-text-primary">Nenašli sa žiadne záznamy</p>
          <p className="text-sm font-medium text-text-muted max-w-xs mt-1">
            Skúste upraviť vyhľadávanie alebo filter mesiacov.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-8 pb-24">
          {groupedEntries.map((mGroup) => (
            <div key={mGroup.monthKey} className="flex flex-col gap-6 animate-fade-in relative">
              {/* Month Header */}
              <div className="flex items-center justify-between px-2 pt-2 select-none z-20 sticky top-[64px] bg-bg-base py-2">
                <h4 className="font-nunito text-xl font-semibold text-text-primary uppercase tracking-wide">
                  {mGroup.monthLabel}
                </h4>
                <span className="text-xs font-semibold text-text-muted bg-bg-surface px-3 py-1.5 rounded-full shadow-none">
                  {mGroup.weeks.reduce((sum, w) => sum + w.entries.length, 0)} záznamov
                </span>
              </div>

              {/* Weeks inside this Month */}
              <div className="flex flex-col gap-8 ml-2 sm:ml-4 relative">
                {/* The global vertical timeline thread for this month */}
                <div className="absolute top-2 bottom-0 left-[11px] w-[2px] bg-bg-surface border-r border-border-default/50 z-0" />

                {mGroup.weeks.map((wGroup) => (
                  <div key={wGroup.weekKey} className="flex flex-col gap-4 relative z-10">
                    
                    {/* Week Divider Header (Sticky to the timeline) */}
                    <div className="flex items-center gap-4 relative">
                      <div className="w-6 h-6 rounded-full bg-bg-surface ring-2 ring-bg-base flex items-center justify-center z-10 shadow-none">
                        <div className="w-2 h-2 rounded-full bg-text-muted/40" />
                      </div>
                      <div className="bg-bg-surface px-4 py-1.5 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.03)] border-0 flex items-center gap-3">
                        <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                          {wGroup.weekLabel}
                        </span>
                        <span className="text-[11px] font-semibold text-accent-primary bg-accent-light px-2 py-0.5 rounded-lg">
                          {wGroup.entries.reduce((sum, e) => sum + e.value, 0)} ks
                        </span>
                      </div>
                    </div>

                    {/* Entries for the week */}
                    <div className="flex flex-col gap-3 pl-8 sm:pl-10">
                      {wGroup.entries.map((entry) => {
                        const isToday = entry.date === todayDate;
                        
                        // Uniform colors for all nodes and chips
                        const nodeColor = "bg-accent-light border-accent-light";
                        const chipBg = "bg-bg-base/60 text-text-primary";
                        const chipText = "text-text-primary";

                        return (
                          <div key={entry._id} className="relative flex items-center group">
                            
                            {/* Timeline Node for the entry */}
                            <div className="absolute -left-8 sm:-left-10 w-6 h-6 flex items-center justify-center">
                              <div className={cn("w-3 h-3 rounded-full shadow-none transition-transform group-hover:scale-125", nodeColor)} />
                            </div>

                            {/* Card-based Entry */}
                            <Card
                              className={cn(
                                "flex-1 bg-bg-surface rounded-2xl overflow-hidden border-0 shadow-none transition-all duration-200 cursor-default"
                              )}
                            >
                              <div className="flex items-center justify-between gap-2.5 sm:gap-4 px-3 sm:px-5 py-2.5 sm:py-4">
                                
                                {/* Left Section: Date & note block */}
                                <div className="flex flex-col min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    {/* Desktop Date */}
                                    <span className="hidden sm:inline text-sm font-semibold text-text-primary leading-tight">
                                      {formatDateSlovakFull(entry.date)}
                                    </span>
                                    {/* Mobile Date */}
                                    <span className="sm:hidden text-sm font-semibold text-text-primary leading-tight">
                                      {formatDateSlovakNumeric(entry.date)}
                                    </span>
                                    {isToday && (
                                      <span className="shrink-0 text-[10px] font-semibold text-accent-primary bg-accent-light rounded-full px-2 py-0.5 leading-none">
                                        Dnes
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[11px] font-semibold text-text-muted capitalize mt-0.5">
                                    {getWeekDayName(entry.date)}
                                  </span>
                                  {entry.note && (
                                    <span
                                      className="text-[11px] sm:text-xs text-text-muted/80 font-medium mt-1 bg-bg-base/60 inline-block px-2 py-0.5 rounded-lg truncate max-w-full sm:max-w-[280px]"
                                      title={entry.note}
                                    >
                                      „{entry.note}“
                                    </span>
                                  )}
                                </div>

                                {/* Right Section: Egg count, Avatar, and Action buttons */}
                                <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
                                  
                                  {/* Egg count chip */}
                                  <div className={cn("flex items-center gap-1.5 rounded-xl px-2 py-1.5 sm:px-4 sm:py-2 shrink-0 transition-colors", chipBg)}>
                                    <img src="/egg.png" alt="Vajce" className="h-4.5 w-4.5 sm:h-6 sm:w-6 object-contain opacity-90" />
                                    <span className={cn("font-nunito text-base sm:text-xl font-semibold select-none", chipText)}>
                                      {entry.value}
                                      <span className="text-[10px] sm:text-sm font-semibold font-inter lowercase ml-0.5 opacity-80">
                                        ks
                                      </span>
                                    </span>
                                  </div>

                                  {/* Avatar */}
                                  <div className="shrink-0 flex items-center justify-center">
                                    {renderAvatar(entry.loggedBy)}
                                  </div>

                                  {/* Action buttons */}
                                  <div className="flex items-center gap-0.5 shrink-0">
                                    <button
                                      onClick={() => {
                                        setEditingEntry(entry);
                                        setEditValue(entry.value);
                                        setEditNote(entry.note || "");
                                        setEditDialogOpen(true);
                                      }}
                                      className="p-1.5 sm:p-2.5 rounded-xl text-text-muted/40 hover:text-accent-primary hover:bg-accent-light/60 transition duration-200 cursor-pointer border-none bg-transparent"
                                      title="Upraviť záznam"
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteEntry(entry._id)}
                                      className="p-1.5 sm:p-2.5 rounded-xl text-text-muted/40 hover:text-state-error hover:bg-red-50/60 transition duration-200 cursor-pointer border-none bg-transparent"
                                      title="Vymazať záznam"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>

                                </div>

                              </div>
                            </Card>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
