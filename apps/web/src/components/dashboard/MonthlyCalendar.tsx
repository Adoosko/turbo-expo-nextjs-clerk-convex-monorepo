"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useState, useMemo } from "react";
import { formatDateSlovakFull } from "./utils";

interface MonthlyCalendarProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  todayDate: string;
  activeModuleId: string;
  allEntries: any[] | undefined;
}

export default function MonthlyCalendar({
  selectedDate,
  setSelectedDate,
  todayDate,
  activeModuleId,
  allEntries,
}: MonthlyCalendarProps) {
  // Localized calendar navigation state
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());

  const getDayEntries = (dayNum: number) => {
    if (!allEntries) return [];
    const yStr = calendarYear;
    const mStr = String(calendarMonth + 1).padStart(2, "0");
    const dStr = String(dayNum).padStart(2, "0");
    const dateKey = `${yStr}-${mStr}-${dStr}`;
    return allEntries.filter(
      (e) => e.date === dateKey && e.moduleId === activeModuleId
    );
  };

  const isFutureMonth = (m: number, y: number) => {
    const now = new Date();
    return y > now.getFullYear() || (y === now.getFullYear() && m > now.getMonth());
  };

  const getMonthNameSlovak = (m: number, y: number) => {
    const d = new Date(y, m, 1);
    const raw = d.toLocaleDateString("sk-SK", { month: "long", year: "numeric" });
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  };

  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear((y) => y - 1);
    } else {
      setCalendarMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear((y) => y + 1);
    } else {
      setCalendarMonth((m) => m + 1);
    }
  };

  const skWeekdays = ["Po", "Ut", "St", "Št", "Pi", "So", "Ne"];

  const firstDayOfWeek = new Date(calendarYear, calendarMonth, 1).getDay(); // 0 is Sun, 1 is Mon...
  const emptyCellsCount = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();

  // Find the maximum value in the current month to compute heatmap shades
  const maxMonthlyValue = useMemo(() => {
    if (!allEntries) return 1;
    const calendarMonthKey = `${calendarYear}-${String(calendarMonth + 1).padStart(2, "0")}`;
    const currentMonthEntries = allEntries.filter((e) => {
      const entryMonth = e.date.substring(0, 7);
      return entryMonth === calendarMonthKey && e.moduleId === activeModuleId && (!e.type || e.type === "income");
    });
    return Math.max(...currentMonthEntries.map((e) => e.value), 1);
  }, [allEntries, calendarYear, calendarMonth, activeModuleId]);

  // Calculate monthly total eggs (income)
  const monthlyTotal = useMemo(() => {
    if (!allEntries) return 0;
    const calendarMonthKey = `${calendarYear}-${String(calendarMonth + 1).padStart(2, "0")}`;
    return allEntries
      .filter((e) => {
        const entryMonth = e.date.substring(0, 7);
        return entryMonth === calendarMonthKey && e.moduleId === activeModuleId && (!e.type || e.type === "income");
      })
      .reduce((sum, e) => sum + e.value, 0);
  }, [allEntries, calendarYear, calendarMonth, activeModuleId]);



  return (
    <>
      <Card className="bg-bg-surface rounded-2xl overflow-hidden border border-border-default/30 shadow-none">
        <CardHeader className="p-5 pb-2 flex flex-col gap-1">
          {/* Week/Month Toggle capsules */}
          <div className="flex justify-center mb-1">
            <div className="inline-flex bg-bg-base/60 p-0.5 rounded-xl border border-border-default/10 select-none">
              <button
                type="button"
                disabled
                className="px-4 py-1 text-xs font-semibold text-text-muted/40 rounded-lg cursor-not-allowed bg-transparent border-none"
              >
                Týždeň
              </button>
              <button
                type="button"
                className="px-4 py-1 text-xs font-bold text-text-primary bg-white rounded-lg border-none shadow-none font-inter"
              >
                Mesiac
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between select-none">
            {/* Left Month navigation */}
            <div className="flex items-center gap-1 bg-bg-base/60 p-0.5 rounded-xl text-text-primary border border-border-default/10">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/60 transition active:scale-95 cursor-pointer bg-transparent border-none"
                title="Predchádzajúci mesiac"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-xs font-bold px-1 whitespace-nowrap min-w-[90px] text-center select-none font-inter text-text-primary">
                {getMonthNameSlovak(calendarMonth, calendarYear)}
              </span>
              <button
                type="button"
                onClick={handleNextMonth}
                disabled={isFutureMonth(calendarMonth + 1, calendarYear)}
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/60 transition active:scale-95 cursor-pointer bg-transparent border-none",
                  isFutureMonth(calendarMonth + 1, calendarYear) && "opacity-30 pointer-events-none"
                )}
                title="Nasledujúci mesiac"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Right Monthly total */}
            <div className="text-right flex flex-col items-end">
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                Mesačná znáška
              </span>
              <span className="text-base font-extrabold text-accent-primary font-inter tabular-nums mt-0.5">
                {monthlyTotal} ks
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-0.5">
          {/* Reset grid animations per month using key */}
          <div
            key={`${calendarYear}-${calendarMonth}`}
            className="grid grid-cols-7 gap-1.5 text-center"
          >
            {skWeekdays.map((day) => (
              <span key={day} className="text-[11px] font-semibold text-text-muted/70 uppercase py-1 select-none">
                {day}
              </span>
            ))}

            {Array.from({ length: emptyCellsCount }).map((_, i) => (
              <div key={`empty-${i}`} className="w-full aspect-square select-none" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const mStr = String(calendarMonth + 1).padStart(2, "0");
              const dStr = String(day).padStart(2, "0");
              const dateKey = `${calendarYear}-${mStr}-${dStr}`;

              const isSelected = dateKey === selectedDate;
              const isToday = dateKey === todayDate;
              const dayEntries = getDayEntries(day);

              const hasIncome = dayEntries.some((e) => !e.type || e.type === "income");
              const hasExpense = dayEntries.some((e) => e.type === "expense");
              const noteEntry = dayEntries.find((e) => e.note);

              // Compute heatmap shade for card day backgrounds (3D physical tiles)
              let heatmapClass = "bg-gradient-to-b from-[#EAE2D4] to-[#DCD1C0] text-[#7A6E61]";
              if (dayEntries.length > 0) {
                if (hasExpense && !hasIncome) {
                  heatmapClass = "bg-gradient-to-b from-[#F2E5D5] to-[#E5CDB2] text-accent-warm";
                } else {
                  const totalIncomeVal = dayEntries
                    .filter((e) => !e.type || e.type === "income")
                    .reduce((sum, e) => sum + e.value, 0);

                  const ratio = totalIncomeVal / maxMonthlyValue;
                  if (ratio <= 0.35) {
                    heatmapClass = "bg-gradient-to-b from-[#E2EADF] to-[#C8D6C6] text-[#3D6B4F]";
                  } else if (ratio <= 0.7) {
                    heatmapClass = "bg-gradient-to-b from-[#D4E2D2] to-[#B5CDAE] text-[#2C523B]";
                  } else {
                    heatmapClass = "bg-gradient-to-b from-[#C4D8C1] to-[#A2C29A] text-[#1D3A29] font-bold";
                  }
                }
              }

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDate(dateKey)}
                  style={{ "--grid-index": i } as React.CSSProperties}
                  className={cn(
                    "w-full aspect-square rounded-xl flex flex-col justify-between p-1.5 select-none transition-all duration-300",
                    heatmapClass,
                    isSelected && "shadow-[inset_0_4px_6px_rgba(0,0,0,0.2),_0_0_0_2.5px_var(--accent-warm)] bg-opacity-85 translate-y-0.5",
                    !isSelected && "hover:-translate-y-0.5 hover:shadow-[0_6px_10px_-2px_rgba(0,0,0,0.15)] shadow-[0_3px_5px_-1px_rgba(0,0,0,0.15)]",
                    isToday && !isSelected && "shadow-[0_3px_5px_-1px_rgba(0,0,0,0.15),_0_0_0_1.5px_var(--accent-primary)]"
                  )}
                >
                  {/* Top: Icons */}
                  <div className="flex gap-0.5 h-3.5 items-center justify-start overflow-hidden w-full px-0.5">
                    {hasIncome && (
                      <div className="w-[10px] h-[13px] bg-gradient-to-b from-[#ECCBA6] to-[#A66E38] rounded-[50%_50%_50%_50%_/_65%_65%_35%_35%] shadow-[0_2px_3px_rgba(0,0,0,0.2)] shrink-0" />
                    )}
                    {hasExpense && (
                      <div className="w-[10px] h-[10px] bg-gradient-to-br from-[#E26E5F] to-[#B23829] rounded-full shadow-[0_2px_3px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.4)] shrink-0 flex items-center justify-center">
                        <div className="w-[6px] h-[1.5px] bg-white/90 rounded-full" />
                      </div>
                    )}
                  </div>

                  {/* Center: Day number */}
                  <span className={cn(
                    "text-xs font-bold leading-none select-none pl-0.5 self-start",
                    isSelected ? "text-accent-warm font-extrabold" : isToday ? "text-accent-primary font-extrabold" : "text-text-primary"
                  )}>
                    {day}
                  </span>

                  {/* Bottom: Activity Dot */}
                  <div className="h-1 w-full flex items-center justify-start pl-0.5">
                    {noteEntry && (
                      <span className={cn(
                        "w-1 h-1 rounded-full",
                        hasExpense ? "bg-accent-warm" : "bg-accent-primary"
                      )} />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>


    </>
  );
}
