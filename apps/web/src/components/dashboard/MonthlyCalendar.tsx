import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useState } from "react";

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

  const getDayEntry = (dayNum: number) => {
    if (!allEntries) return null;
    const yStr = calendarYear;
    const mStr = String(calendarMonth + 1).padStart(2, "0");
    const dStr = String(dayNum).padStart(2, "0");
    const dateKey = `${yStr}-${mStr}-${dStr}`;
    return allEntries.find(
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

  return (
    <Card className="bg-bg-surface rounded-2xl overflow-hidden shadow-[0_16px_40px_rgba(35,40,36,0.03)] border-0">
      <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-nunito text-base font-bold text-text-primary">
            Kalendár znášky
          </CardTitle>
          <CardDescription className="text-xs font-normal text-text-muted">
            Prehľad znášky po dňoch v mesiaci
          </CardDescription>
        </div>
        <div className="flex items-center gap-1.5 bg-bg-base/60 p-0.5 rounded-xl text-text-primary">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/60 transition active:scale-95 cursor-pointer bg-transparent border-none"
            title="Predchádzajúci mesiac"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-xs font-semibold px-1 whitespace-nowrap min-w-[90px] text-center select-none">
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
      </CardHeader>
      <CardContent className="p-5 pt-0.5">
        <div className="grid grid-cols-7 gap-1.5 text-center">
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
            const entry = getDayEntry(day);

            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDate(dateKey)}
                className={cn(
                  "w-full aspect-square rounded-xl p-1.5 flex flex-col justify-between text-left transition duration-200 cursor-pointer select-none border-none",
                  isSelected
                    ? "bg-accent-primary text-white"
                    : entry
                      ? "bg-accent-light/45 hover:bg-accent-light/75 text-text-primary"
                      : "bg-bg-base/40 hover:bg-bg-base/70 text-text-muted",
                  isToday && !isSelected && "ring-1 ring-accent-primary/45 bg-accent-light/30"
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={cn(
                    "text-[10px] font-semibold leading-none select-none",
                    isSelected ? "text-white/80" : isToday ? "text-accent-primary font-bold" : "text-text-muted/80"
                  )}>
                    {day}
                  </span>
                  {isToday && !isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-primary shrink-0" />
                  )}
                </div>
                {entry ? (
                  <div className="flex flex-col items-center justify-center flex-1 w-full">
                    <span className={cn(
                      "font-nunito font-semibold text-xs sm:text-sm leading-none select-none mt-0.5",
                      isSelected ? "text-white" : "text-accent-primary"
                    )}>
                      {entry.value}
                    </span>
                    <span className={cn(
                      "text-[8px] font-medium leading-none mt-0.5 select-none",
                      isSelected ? "text-white/70" : "text-text-muted"
                    )}>
                      ks
                    </span>
                  </div>
                ) : (
                  <div className="flex-1" />
                )}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
