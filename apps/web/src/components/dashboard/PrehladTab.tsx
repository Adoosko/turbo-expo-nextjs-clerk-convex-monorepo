import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import React from "react";
import HeroLoggerCard from "./HeroLoggerCard";
import MonthlyCalendar from "./MonthlyCalendar";
import ModuleSelector from "./ModuleSelector";
import { Entry, Chicken, DashboardData, EntryType, ExpenseReason } from "@/lib/types";
import {
  formatDateSlovakFull,
  getChickenDetails,
  getSlovakPluralHens,
  getSlovakPluralRoosters,
  getSlovakPluralChicks,
  getSlovakPluralDucks,
  formatChicksAge,
  getExpectedLayingDate,
} from "./utils";


interface PrehladTabProps {
  orgId: string;
  activeModuleId: string;
  setActiveModuleId: (id: string) => void;
  dashboardData: DashboardData | undefined;
  allEntries: Entry[] | undefined;
  chickens: Chicken[] | undefined;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  todayDate: string;
  isSubmitting: boolean;
  successMsg: string;
  errorMsg: string;
  handleSave: (args: {
    value: number;
    note: string;
    type: EntryType;
    reason?: ExpenseReason;
    date: string;
  }) => Promise<void>;
}

export default function PrehladTab({
  orgId,
  activeModuleId,
  setActiveModuleId,
  dashboardData,
  allEntries,
  chickens,
  selectedDate,
  setSelectedDate,
  todayDate,
  isSubmitting,
  successMsg,
  errorMsg,
  handleSave,
}: PrehladTabProps) {
  // Calculations
  const totalChickens = chickens ? chickens.reduce((sum, c) => sum + (c.count || 0), 0) : 0;
  const totalHens = chickens
    ? chickens.filter((c) => c.presetId !== "kohut" && c.presetId !== "kuriatko" && c.presetId !== "kacka_diva").reduce((sum, c) => sum + (c.count || 0), 0)
    : 0;
  const totalRoosters = chickens
    ? chickens.filter((c) => c.presetId === "kohut").reduce((sum, c) => sum + (c.count || 0), 0)
    : 0;
  const totalChicks = chickens
    ? chickens.filter((c) => c.presetId === "kuriatko").reduce((sum, c) => sum + (c.count || 0), 0)
    : 0;
  const totalDucks = chickens
    ? chickens.filter((c) => c.presetId === "kacka_diva").reduce((sum, c) => sum + (c.count || 0), 0)
    : 0;
  const activeBreeds = chickens ? chickens.filter((c) => (c.count || 0) > 0) : [];

  const maxIncome = React.useMemo(() => {
    if (!allEntries) return 0;
    const incomeEntries = allEntries.filter(
      (e) => e.moduleId === activeModuleId && (!e.type || e.type === "income")
    );
    return incomeEntries.length > 0 ? Math.max(...incomeEntries.map((e) => e.value)) : 0;
  }, [allEntries, activeModuleId]);

  const selectedIncomeEntry = allEntries?.find(
    (e) => e.date === selectedDate && e.moduleId === activeModuleId && (!e.type || e.type === "income")
  ) || null;

  const selectedExpenseEntry = allEntries?.find(
    (e) => e.date === selectedDate && e.moduleId === activeModuleId && e.type === "expense"
  ) || null;

  const getThisWeekTotal = () => {
    if (!dashboardData) return 0;
    const now = new Date();
    const currentDay = now.getDay();
    const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
    const monday = new Date();
    monday.setDate(now.getDate() - distanceToMonday);
    monday.setHours(0, 0, 0, 0);

    return dashboardData.recentEntries
      .filter((e) => {
        const [y, m, d] = e.date.split("-").map(Number);
        const entryDate = new Date(y, m - 1, d);
        return entryDate >= monday && (!e.type || e.type === "income");
      })
      .reduce((sum, e) => sum + e.value, 0);
  };

  const getThisMonthTotal = () => {
    if (!dashboardData) return 0;
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return dashboardData.recentEntries
      .filter((e) => {
        const [y, m, d] = e.date.split("-").map(Number);
        const entryDate = new Date(y, m - 1, d);
        return (
          entryDate.getFullYear() === currentYear &&
          entryDate.getMonth() === currentMonth &&
          (!e.type || e.type === "income")
        );
      })
      .reduce((sum, e) => sum + e.value, 0);
  };

  const getSparklinePoints = () => {
    if (!dashboardData) return { points: "", areaPoints: "", data: [] };

    const sparklineData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("en-CA");
      const match = dashboardData.recentEntries.find(
        (e) => e.date === dateStr && (!e.type || e.type === "income")
      );
      sparklineData.push({
        date: dateStr,
        value: match ? match.value : 0,
      });
    }

    const maxVal = Math.max(...sparklineData.map((d) => d.value), 5);
    const width = 300;
    const height = 80;
    const xStep = width / 6;

    const coordinates = sparklineData.map((d, i) => {
      const x = i * xStep;
      const y = height - 12 - (d.value / maxVal) * (height - 24);
      return { x, y, value: d.value };
    });

    const points = coordinates
      .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
      .join(" ");

    const areaPoints = coordinates.length
      ? `${points} L ${width} ${height} L 0 ${height} Z`
      : "";

    return { points, areaPoints, data: coordinates };
  };

  const sparkline = getSparklinePoints();
  const isToday = selectedDate === todayDate;

  return (
    <div className="flex flex-col gap-6">
      {/* Modular Modules Selector */}
      <ModuleSelector activeModuleId={activeModuleId} setActiveModuleId={setActiveModuleId} />

      {/* Hero Action Area */}
      <div className="w-full">
        {/* If the user clicked a different date in the calendar, show a badge so they know they are not editing today */}
        {!isToday && (
          <div className="mb-3 px-4 py-2 bg-amber-50 text-accent-warm border border-amber-200 rounded-xl inline-block text-sm font-semibold">
            Upravujete záznam pre: {formatDateSlovakFull(selectedDate)}
            <button
              onClick={() => setSelectedDate(todayDate)}
              className="ml-3 underline hover:text-amber-700 cursor-pointer"
            >
              Späť na dnešok
            </button>
          </div>
        )}
        <HeroLoggerCard
          activeModuleId={activeModuleId}
          stock={dashboardData ? dashboardData.stock : 0}
          todayIncomeEntry={selectedIncomeEntry}
          todayExpenseEntry={selectedExpenseEntry}
          isSubmitting={isSubmitting}
          successMsg={successMsg}
          errorMsg={errorMsg}
          onSave={(args) => handleSave({ ...args, date: selectedDate })}
          selectedDate={selectedDate}
        />
      </div>

      {/* Bento Grid: Weekly Stats, Monthly Calendar, Flock Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column in Grid (Stats & Graph) */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          {/* Quick Stats Bento */}
          <Card className="bg-bg-surface rounded-2xl overflow-hidden border border-border-default/30 shadow-none">
            <CardContent className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                <div className="rounded-xl bg-bg-base/40 p-4 flex flex-col border border-border-default/10">
                  <span className="text-[11px] font-semibold text-text-muted/80 uppercase tracking-wider">
                    Sklad
                  </span>
                  <span className="font-inter text-2xl font-bold tabular-nums text-accent-primary mt-1">
                    {dashboardData ? dashboardData.stock : 0}{" "}
                    <span className="text-sm font-medium font-inter text-text-muted">ks</span>
                  </span>
                </div>
                <div className="rounded-xl bg-bg-base/40 p-4 flex flex-col border border-border-default/10">
                  <span className="text-[11px] font-semibold text-text-muted/80 uppercase tracking-wider">
                    Týždeň
                  </span>
                  <span className="font-inter text-2xl font-bold tabular-nums text-accent-primary mt-1">
                    {getThisWeekTotal()}{" "}
                    <span className="text-sm font-medium font-inter text-text-muted">ks</span>
                  </span>
                </div>
                <div className="rounded-xl bg-bg-base/40 p-4 flex flex-col border border-border-default/10">
                  <span className="text-[11px] font-semibold text-text-muted/80 uppercase tracking-wider">
                    Mesiac
                  </span>
                  <span className="font-inter text-2xl font-bold tabular-nums text-accent-primary mt-1">
                    {getThisMonthTotal()}{" "}
                    <span className="text-sm font-medium font-inter text-text-muted">ks</span>
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trend Graph Bento */}
          <Card className="bg-bg-surface rounded-2xl overflow-hidden border border-border-default/30 shadow-none">
            <CardHeader className="p-5 pb-1 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-nunito text-base font-extrabold text-text-primary">
                  Týždenný vývoj
                </CardTitle>
                <CardDescription className="text-xs font-normal text-text-muted">
                  Znáška za posledných 7 dní
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-2">
              {dashboardData === undefined ? (
                <div className="h-16 w-full animate-pulse bg-bg-base rounded-xl" />
              ) : (
                <div className="relative w-full h-[85px] mt-1 select-none">
                  <svg
                    className="w-full h-full overflow-visible"
                    viewBox="0 0 300 80"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="spark-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="0.0" />
                      </linearGradient>
                      <filter id="shadow-3d" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.15" />
                      </filter>
                      <radialGradient id="egg-grad" cx="35%" cy="35%" r="65%">
                        <stop offset="0%" stopColor="#FFFFFF" />
                        <stop offset="40%" stopColor="#ECCBA6" />
                        <stop offset="100%" stopColor="#BA8E60" />
                      </radialGradient>
                    </defs>
                    {/* Background grid lines */}
                    <line x1="0" y1="12" x2="300" y2="12" stroke="var(--bg-base)" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="0" y1="40" x2="300" y2="40" stroke="var(--bg-base)" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="0" y1="68" x2="300" y2="68" stroke="var(--bg-base)" strokeWidth="1" />
                    
                    {sparkline.areaPoints && (
                      <path
                        d={sparkline.areaPoints}
                        fill="url(#spark-grad)"
                        className="animate-fade-in"
                        style={{ animationDelay: "200ms" }}
                      />
                    )}
                    {sparkline.points && (
                      <path
                        d={sparkline.points}
                        fill="none"
                        stroke="var(--accent-primary)"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="animate-draw-path"
                        filter="url(#shadow-3d)"
                      />
                    )}
                    {sparkline.data.map((pt, i) => (
                      <g key={i} className="group/pt">
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="4"
                          fill="url(#egg-grad)"
                          stroke="#BA8E60"
                          strokeWidth="1"
                          filter="url(#shadow-3d)"
                          className="transition-all duration-200 group-hover/pt:r-[5px] group-hover/pt:stroke-[1.5px] cursor-pointer"
                        />
                        {pt.value > 0 && (
                          <text
                            x={pt.x}
                            y={pt.y - 10}
                            textAnchor="middle"
                            className="font-inter text-[10px] font-bold fill-accent-primary opacity-0 group-hover/pt:opacity-100 transition-opacity duration-200 pointer-events-none"
                          >
                            {pt.value}
                          </text>
                        )}
                        {/* Always visible values, styled slightly smaller and lighter */}
                        {pt.value > 0 && (
                          <text
                            x={pt.x}
                            y={pt.y - 10}
                            textAnchor="middle"
                            className="font-inter text-[9px] font-bold tabular-nums fill-text-muted group-hover/pt:hidden pointer-events-none"
                          >
                            {pt.value}
                          </text>
                        )}
                      </g>
                    ))}
                  </svg>
                </div>
              )}
            </CardContent>
          </Card>


        </div>

        {/* Center & Right Columns in Grid (Calendar & Flock) */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Monthly Calendar Bento */}
          <MonthlyCalendar
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            todayDate={todayDate}
            activeModuleId={activeModuleId}
            allEntries={allEntries}
          />

          {/* Flock Status Bento */}
          <Card className="bg-bg-surface rounded-2xl overflow-hidden border border-border-default/30 shadow-none">
            <CardHeader className="p-5 pb-1 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-nunito text-base font-extrabold text-text-primary">
                  Stav hejna
                </CardTitle>
                <CardDescription className="text-xs font-normal text-text-muted">
                  Celkové počty a zloženie vášho kŕdľa
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-2">
              {chickens === undefined ? (
                <div className="h-16 w-full animate-pulse bg-bg-base rounded-xl" />
              ) : chickens.length === 0 ? (
                <p className="text-sm font-medium text-text-muted italic py-3 text-center">
                  Kŕdeľ je prázdny. Pridajte prvé sliepky na karte Hejno.
                </p>
              ) : (
                <div className="flex flex-col gap-4">
                  {/* Overall stats */}
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-semibold text-text-muted">Celkový stav:</span>
                    <span className="font-inter text-xl font-bold tabular-nums text-accent-primary">
                      {totalChickens} ks{" "}
                      <span className="text-xs font-medium font-inter text-text-muted">
                        ({getSlovakPluralHens(totalHens)}, {getSlovakPluralRoosters(totalRoosters)}, {getSlovakPluralChicks(totalChicks)}, {getSlovakPluralDucks(totalDucks)})
                      </span>
                    </span>
                  </div>

                  {/* Breed distribution bar */}
                  <div className="w-full h-4 rounded-xl overflow-hidden flex bg-[#DCD1C0] my-1 shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)] border border-[#C5B7A1]">
                    {activeBreeds.map((breed) => {
                      const info = getChickenDetails(breed);
                      const pct = totalChickens > 0 ? (breed.count / totalChickens) * 100 : 0;
                      return (
                        <div
                          key={breed._id}
                          style={{
                            width: `${pct}%`,
                            backgroundImage: `linear-gradient(to bottom, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 40%, rgba(0,0,0,0.1) 100%), linear-gradient(to right, ${info.color || "var(--accent-primary)"}, ${info.color || "var(--accent-primary)"})`,
                          }}
                          title={`${info.name}: ${breed.count} ks (${Math.round(pct)}%)`}
                          className="h-full transition-all duration-300 hover:brightness-110 border-r border-[#00000020] last:border-r-0 cursor-pointer shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]"
                        />
                      );
                    })}
                  </div>

                  {/* Badges list */}
                  <div className="flex flex-wrap gap-2.5 mt-1">
                    {activeBreeds.map((breed) => {
                      const info = getChickenDetails(breed);
                      return (
                        <div
                          key={breed._id}
                          className="flex items-center gap-2.5 pl-1.5 pr-3.5 py-1.5 rounded-xl bg-gradient-to-b from-[#F9F7F4] to-[#EAE2D4] text-xs font-semibold text-text-primary shadow-[0_2px_4px_-1px_rgba(0,0,0,0.15)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.15)] select-none relative overflow-hidden"
                        >
                          <div className="absolute left-0 top-0 bottom-0 w-[4px]" style={{ backgroundColor: info.color || "var(--accent-primary)" }} />
                          <img
                            src={info.imageUrl}
                            alt={info.name}
                            className="w-5.5 h-5.5 rounded-full object-cover shrink-0 border border-solid border-border-default/30"
                          />
                          <span>{info.name}</span>
                          {breed.presetId === "kuriatko" && breed.hatchedDate && (
                            <span className="text-[10px] text-text-muted font-normal">
                              ({formatChicksAge(breed.hatchedDate)})
                            </span>
                          )}
                          <span className="font-bold text-accent-primary ml-auto">
                            {breed.count} ks
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
