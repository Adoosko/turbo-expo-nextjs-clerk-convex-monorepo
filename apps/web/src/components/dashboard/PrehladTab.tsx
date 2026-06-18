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
  dashboardData: any;
  allEntries: any[] | undefined;
  chickens: any[] | undefined;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  todayDate: string;
  value: number;
  setValue: React.Dispatch<React.SetStateAction<number>>;
  note: string;
  setNote: (note: string) => void;
  isSubmitting: boolean;
  successMsg: string;
  errorMsg: string;
  handleSave: (e: React.FormEvent) => void;
}

export default function PrehladTab({
  activeModuleId,
  setActiveModuleId,
  dashboardData,
  allEntries,
  chickens,
  selectedDate,
  setSelectedDate,
  todayDate,
  value,
  setValue,
  note,
  setNote,
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

  const selectedMatch = allEntries?.find(
    (e) => e.date === selectedDate && e.moduleId === activeModuleId
  );

  const getThisWeekTotal = () => {
    if (!dashboardData) return 0;
    const now = new Date();
    const currentDay = now.getDay();
    const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
    const monday = new Date();
    monday.setDate(now.getDate() - distanceToMonday);
    monday.setHours(0, 0, 0, 0);

    return dashboardData.recentEntries
      .filter((e: any) => {
        const [y, m, d] = e.date.split("-").map(Number);
        const entryDate = new Date(y, m - 1, d);
        return entryDate >= monday;
      })
      .reduce((sum: number, e: any) => sum + e.value, 0);
  };

  const getThisMonthTotal = () => {
    if (!dashboardData) return 0;
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return dashboardData.recentEntries
      .filter((e: any) => {
        const [y, m, d] = e.date.split("-").map(Number);
        const entryDate = new Date(y, m - 1, d);
        return (
          entryDate.getFullYear() === currentYear &&
          entryDate.getMonth() === currentMonth
        );
      })
      .reduce((sum: number, e: any) => sum + e.value, 0);
  };

  const getSparklinePoints = () => {
    if (!dashboardData) return { points: "", areaPoints: "", data: [] };

    const sparklineData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("en-CA");
      const match = dashboardData.recentEntries.find((e: any) => e.date === dateStr);
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
          value={value}
          setValue={setValue}
          note={note}
          setNote={setNote}
          isSubmitting={isSubmitting}
          successMsg={successMsg}
          errorMsg={errorMsg}
          onSubmit={handleSave}
          todayMatch={selectedMatch}
        />
      </div>

      {/* Bento Grid: Weekly Stats, Monthly Calendar, Flock Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column in Grid (Stats & Graph) */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          {/* Quick Stats Bento */}
          <Card className="bg-bg-surface rounded-2xl overflow-hidden shadow-none border-0">
            <CardContent className="p-5">
              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="rounded-xl bg-bg-base/60 p-4 flex flex-col">
                  <span className="text-xs font-medium text-text-muted/80 uppercase tracking-wider">
                    Tento týždeň
                  </span>
                  <span className="font-nunito text-2xl font-semibold text-accent-primary mt-1">
                    {getThisWeekTotal()}{" "}
                    <span className="text-sm font-medium font-inter text-text-muted">ks</span>
                  </span>
                </div>
                <div className="rounded-xl bg-bg-base/60 p-4 flex flex-col">
                  <span className="text-xs font-medium text-text-muted/80 uppercase tracking-wider">
                    Tento mesiac
                  </span>
                  <span className="font-nunito text-2xl font-semibold text-accent-primary mt-1">
                    {getThisMonthTotal()}{" "}
                    <span className="text-sm font-medium font-inter text-text-muted">ks</span>
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trend Graph Bento */}
          <Card className="bg-bg-surface rounded-2xl overflow-hidden shadow-none border-0">
            <CardHeader className="p-5 pb-1 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-nunito text-base font-semibold text-text-primary">
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
                <div className="relative w-full h-[70px] mt-1">
                  <svg
                    className="w-full h-full overflow-visible"
                    viewBox="0 0 300 80"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="spark-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <line x1="0" y1="70" x2="300" y2="70" stroke="var(--bg-base)" strokeWidth="1.5" />
                    {sparkline.areaPoints && <path d={sparkline.areaPoints} fill="url(#spark-grad)" />}
                    {sparkline.points && (
                      <path
                        d={sparkline.points}
                        fill="none"
                        stroke="var(--accent-primary)"
                        strokeWidth="2.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}
                    {sparkline.data.map((pt, i) => (
                      <g key={i}>
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="3"
                          fill="var(--bg-surface)"
                          stroke="var(--accent-primary)"
                          strokeWidth="2"
                        />
                        {pt.value > 0 && (
                          <text
                            x={pt.x}
                            y={pt.y - 8}
                            textAnchor="middle"
                            className="font-nunito text-[10px] font-semibold fill-text-muted"
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
          <Card className="bg-bg-surface rounded-2xl overflow-hidden shadow-none border-0">
            <CardHeader className="p-5 pb-1 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-nunito text-base font-semibold text-text-primary">
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
                <div className="flex flex-col gap-3">
                  {/* Overall stats */}
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-semibold text-text-muted">Celkový stav:</span>
                    <span className="font-nunito text-xl font-bold text-accent-primary">
                      {totalChickens} ks{" "}
                      <span className="text-xs font-medium font-inter text-text-muted">
                        ({getSlovakPluralHens(totalHens)}, {getSlovakPluralRoosters(totalRoosters)}, {getSlovakPluralChicks(totalChicks)}, {getSlovakPluralDucks(totalDucks)})
                      </span>
                    </span>
                  </div>

                  {/* Breed distribution bar */}
                  <div className="w-full h-2.5 rounded-xl overflow-hidden flex bg-bg-base/70 my-2">
                    {activeBreeds.map((breed) => {
                      const info = getChickenDetails(breed);
                      const pct = totalChickens > 0 ? (breed.count / totalChickens) * 100 : 0;
                      return (
                        <div
                          key={breed._id}
                          style={{
                            width: `${pct}%`,
                            backgroundColor: info.color || "var(--accent-primary)",
                          }}
                          title={`${info.name}: ${breed.count} ks (${Math.round(pct)}%)`}
                          className="h-full transition-all duration-300 first:rounded-l-xl last:rounded-r-xl border-r border-bg-surface/10 last:border-r-0"
                        />
                      );
                    })}
                  </div>

                  {/* Badges list */}
                  <div className="flex flex-wrap gap-2 mt-1">
                    {activeBreeds.map((breed) => {
                      const info = getChickenDetails(breed);
                      return (
                        <div
                          key={breed._id}
                          className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-xl bg-bg-base/70 text-xs sm:text-sm font-medium text-text-primary"
                        >
                          <img
                            src={info.imageUrl}
                            alt={info.name}
                            className="w-5 h-5 rounded-full object-cover shrink-0 border border-solid"
                            style={{ borderColor: info.color }}
                          />
                          <span>{info.name}</span>
                          {breed.presetId === "kuriatko" && breed.hatchedDate && (
                            <span className="text-[10px] text-text-muted font-normal">
                              ({formatChicksAge(breed.hatchedDate)}, predpoklad znášky: {getExpectedLayingDate(breed.hatchedDate)})
                            </span>
                          )}
                          <span className="font-semibold text-accent-primary ml-0.5">
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
