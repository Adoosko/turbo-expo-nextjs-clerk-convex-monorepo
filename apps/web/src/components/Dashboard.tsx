//@ts-nocheck
"use client";

import { cn } from "@/lib/utils";
import { OrganizationSwitcher, useOrganization, UserButton, useUser } from "@clerk/nextjs";
import { api } from "@packages/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";

// Date & Icons
import { sk } from "date-fns/locale";
import {
  Activity,
  BookOpen,
  Calendar as CalendarIcon,
  Layers,
  Loader2,
  Minus,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  Upload,
  Users,
} from "lucide-react";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Presets Catalog
import { CHICKEN_BREED_PRESETS } from "@/lib/presets";

const getLearnMoreLink = (name: string, presetId?: string) => {
  if (presetId === "vlaska") return "https://sk.wikipedia.org/wiki/Vla%C5%A1ka_(plemeno_sliepok)";
  if (presetId === "araukana") return "https://sk.wikipedia.org/wiki/Araukana";
  if (presetId === "maranska") return "https://sk.wikipedia.org/wiki/Maranska";
  if (presetId === "hodvabnicka") return "https://sk.wikipedia.org/wiki/Hodv%C3%A1bni%C4%8Dka";
  if (presetId === "kohut") return "https://sk.wikipedia.org/wiki/Kura_dom%C3%A1ca";
  
  // Leghornka, Sussexka, Plymútka and custom breeds point to Google Search
  return `https://www.google.com/search?q=sliepka+${encodeURIComponent(name.toLowerCase())}`;
};

interface DashboardProps {
  orgId: string;
  orgName: string;
}

export default function Dashboard({ orgId, orgName }: DashboardProps) {
  const { memberships } = useOrganization({ memberships: { pageSize: 20, keepPreviousData: true } });
  const { user } = useUser();
  const [currentTab, setCurrentTab] = useState<"prehlad" | "hejno" | "dennik" | "rodina">("prehlad");
  const [activeModuleId, setActiveModuleId] = useState("vajcia");

  // Fetch modules for this farm
  const modules = useQuery(api.modules.list, { orgId });

  const todayDate = new Date().toLocaleDateString("en-CA");

  // Fetch dashboard data (today's entry, last 30 entries)
  const dashboardData = useQuery(api.entries.getDashboardData, {
    orgId,
    moduleId: activeModuleId,
    today: todayDate,
  });

  // Fetch all entries for Denník tab
  const allEntries = useQuery(api.entries.list, { orgId });

  // Fetch chickens list for Hejno tab
  const chickens = useQuery(api.chickens.list, { orgId });

  // Calculate flock statistics
  const totalChickens = chickens ? chickens.reduce((sum, c) => sum + (c.count || 0), 0) : 0;
  const totalHens = chickens 
    ? chickens.filter((c) => c.presetId !== "kohut").reduce((sum, c) => sum + (c.count || 0), 0) 
    : 0;
  const totalRoosters = chickens
    ? chickens.filter((c) => c.presetId === "kohut").reduce((sum, c) => sum + (c.count || 0), 0)
    : 0;

  const activeBreeds = chickens ? chickens.filter((c) => (c.count || 0) > 0) : [];

  const getSlovakPluralHens = (count: number) => {
    if (count === 1) return "1 sliepka";
    if (count >= 2 && count <= 4) return `${count} sliepky`;
    return `${count} sliepok`;
  };

  const getSlovakPluralRoosters = (count: number) => {
    if (count === 1) return "1 kohút";
    if (count >= 2 && count <= 4) return `${count} kohúty`;
    return `${count} kohútov`;
  };

  const maxEntryValue = allEntries && allEntries.length > 0 
    ? Math.max(...allEntries.map((e) => e.value || 0), 1) 
    : 1;

  const todayValue = dashboardData ? dashboardData.todayValue : 0;

  // Mutations
  const upsertEntry = useMutation(api.entries.upsert);
  const deleteEntry = useMutation(api.entries.remove);
  const generateUploadUrl = useMutation(api.chickens.generateUploadUrl);
  const createChicken = useMutation(api.chickens.create);
  const deleteChicken = useMutation(api.chickens.remove);
  const updateChickenCount = useMutation(api.chickens.updateCount);

  // Form State (Logger)
  const [selectedDate, setSelectedDate] = useState("");
  const [value, setValue] = useState(0);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Dialog (Add Chicken) state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBreedPreset, setSelectedBreedPreset] = useState("leghornka");
  const [customName, setCustomName] = useState("");
  const [countInput, setCountInput] = useState(1);
  const [colorInput, setColorInput] = useState("#2C4E3A"); // Default forest sage
  const [notesInput, setNotesInput] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isSavingChicken, setIsSavingChicken] = useState(false);

  // Set today's date in local YYYY-MM-DD on component mount
  useEffect(() => {
    setSelectedDate(todayDate);
  }, [todayDate]);

  // Update value state when user changes date (to load existing value if any)
  useEffect(() => {
    if (dashboardData && selectedDate) {
      const match = dashboardData.recentEntries.find(
        (e) => e.date === selectedDate
      );
      if (match) {
        setValue(match.value);
        setNote(match.note || "");
      } else {
        setValue(0);
        setNote("");
      }
    }
  }, [selectedDate, dashboardData]);

  // Stepper handlers
  const increment = () => setValue((prev) => prev + 1);
  const decrement = () => setValue((prev) => Math.max(0, prev - 1));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return;

    setIsSubmitting(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      await upsertEntry({
        orgId,
        moduleId: activeModuleId,
        date: selectedDate,
        value,
        note: note.trim() || undefined,
      });

      setSuccessMsg("Záznam uložený do denníka.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Chyba pri ukladaní.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddChicken = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingChicken(true);
    try {
      let storageId: string | undefined = undefined;

      // Handle custom file upload if custom breed and file selected
      if (selectedBreedPreset === "custom" && uploadFile) {
        const uploadUrl = await generateUploadUrl();
        const res = await fetch(uploadUrl, {
          method: "POST",
          headers: {
            "Content-Type": uploadFile.type,
          },
          body: uploadFile,
        });

        if (!res.ok) {
          throw new Error("Failed to upload image");
        }

        const data = await res.json();
        storageId = data.storageId;
      }

      let name = "";
      let color = colorInput;
      let presetId: string | undefined = undefined;

      if (selectedBreedPreset === "custom") {
        name = customName.trim() || "Vlastné plemeno";
      } else {
        const preset = CHICKEN_BREED_PRESETS.find((p) => p.presetId === selectedBreedPreset);
        name = preset?.name || "Plemeno";
        color = preset?.color || "#CD7F32";
        presetId = selectedBreedPreset;
      }

      await createChicken({
        orgId,
        name,
        count: countInput,
        color,
        notes: notesInput.trim() || undefined,
        storageId,
        presetId,
      });

      // Clear state and close dialog
      setCustomName("");
      setCountInput(1);
      setColorInput("#2C4E3A");
      setNotesInput("");
      setUploadFile(null);
      setSelectedBreedPreset("leghornka");
      setDialogOpen(false);
    } catch (err) {
      console.error(err);
      alert("Chyba pri pridávaní do hejna.");
    } finally {
      setIsSavingChicken(false);
    }
  };

  const handleIncrementChicken = async (chickenId: string, currentCount: number) => {
    try {
      await updateChickenCount({ orgId, id: chickenId as any, count: currentCount + 1 });
    } catch (err) {
      console.error(err);
      alert("Chyba pri zmene stavu.");
    }
  };

  const handleDecrementChicken = async (chickenId: string, currentCount: number) => {
    if (currentCount <= 1) {
      if (window.confirm("Naozaj chcete odstrániť toto plemeno z hejna?")) {
        try {
          await deleteChicken({ orgId, id: chickenId as any });
        } catch (err) {
          console.error(err);
          alert("Chyba pri odstraňovaní z hejna.");
        }
      }
      return;
    }
    try {
      await updateChickenCount({ orgId, id: chickenId as any, count: currentCount - 1 });
    } catch (err) {
      console.error(err);
      alert("Chyba pri zmene stavu.");
    }
  };

  const handleDeleteChicken = async (chickenId: string) => {
    if (!window.confirm("Naozaj chcete vymazať toto plemeno z hejna?")) return;
    try {
      await deleteChicken({ orgId, id: chickenId as any });
    } catch (err) {
      console.error(err);
      alert("Chyba pri odstraňovaní z hejna.");
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!window.confirm("Naozaj chcete vymazať tento záznam z denníka?")) return;
    try {
      await deleteEntry({ orgId, id: entryId as any });
    } catch (err) {
      console.error(err);
      alert("Chyba pri mazaní záznamu.");
    }
  };

  // Date converters for Shadcn Calendar
  const getSelectedDateObject = () => {
    if (!selectedDate) return undefined;
    const [y, m, d] = selectedDate.split("-").map(Number);
    return new Date(y, m - 1, d);
  };

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      const year = newDate.getFullYear();
      const month = String(newDate.getMonth() + 1).padStart(2, "0");
      const day = String(newDate.getDate()).padStart(2, "0");
      setSelectedDate(`${year}-${month}-${day}`);
    }
  };

  // Stats Calculations
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
        return entryDate >= monday;
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
          entryDate.getMonth() === currentMonth
        );
      })
      .reduce((sum, e) => sum + e.value, 0);
  };

  // Sparkline calculation: returns 7 points for last 7 calendar days
  const getSparklinePoints = () => {
    if (!dashboardData) return { points: "", areaPoints: "", data: [] };

    const sparklineData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("en-CA");
      const match = dashboardData.recentEntries.find((e) => e.date === dateStr);
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

  // Helper to format date in Slovak
  const formatDateSlovak = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split("-").map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString("sk-SK", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return dateStr;
    }
  };

  const formatDateSlovakFull = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split("-").map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString("sk-SK", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      return dateStr;
    }
  };

  const getWeekDayName = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split("-").map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString("sk-SK", { weekday: "long" });
    } catch (e) {
      return "";
    }
  };

  const getChickenDetails = (c: any) => {
    const preset = c.presetId ? CHICKEN_BREED_PRESETS.find((p) => p.presetId === c.presetId) : null;
    return {
      name: c.name || preset?.name || "Neznáme plemeno",
      description: c.notes || preset?.description || "Plemeno chované na našej farme.",
      color: c.color || preset?.color || "#2C4E3A",
      imageUrl: c.imageUrl || preset?.imageUrl || "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=600&q=80",
    };
  };

  return (
    <div className="min-h-screen bg-bg-base font-inter pb-20 selection:bg-accent-light selection:text-accent-primary animate-fade-in">
      {/* Sticky Header - Borderless Glassmorphism */}
      <header className="sticky top-0 z-30 w-full bg-bg-surface/80 backdrop-blur-md">
        <div className="mx-auto max-w-3xl px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-accent-primary flex items-center justify-center text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                <path d="m10 10-2 2 2 2" />
                <path d="m14 14 2-2-2-2" />
              </svg>
            </div>
            <span className="font-nunito text-lg font-bold tracking-tight text-text-primary hidden sm:inline-block">
              Finik Farma
            </span>
          </div>
          <div className="flex items-center gap-3.5">
            <OrganizationSwitcher
              hidePersonal={true}
              afterCreateOrganizationUrl="/"
              afterSelectOrganizationUrl="/"
              appearance={{
                elements: {
                  rootBox: "flex items-center max-w-[140px] sm:max-w-none",
                  organizationSwitcherTrigger:
                    "border-0 rounded-xl px-3.5 py-1.5 bg-bg-surface hover:bg-bg-surface-raised transition text-text-primary font-semibold text-sm truncate max-w-full",
                },
              }}
            />
            <UserButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-3xl px-4 mt-6 flex flex-col gap-6">
        {/* Title Section */}
        <div className="flex flex-col gap-1">
          <h2 className="font-nunito text-2xl sm:text-3xl font-semibold tracking-tight text-text-primary">
            {orgName}
          </h2>
          <p className="text-xs sm:text-sm text-text-muted font-medium tracking-wide uppercase">
            Zápisník hospodárstva
          </p>
        </div>

        {/* Navigation Tabs Header */}
        <div className="flex border-b border-border-default/20 gap-5 sm:gap-6 mb-2 overflow-x-auto scrollbar-none -mx-4 px-4 flex-nowrap shrink-0">
          {[
            { id: "prehlad", label: "Prehľad", icon: Activity },
            { id: "hejno", label: "Hejno", icon: Layers },
            { id: "dennik", label: "Denník", icon: BookOpen },
            { id: "rodina", label: "Rodina", icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 pb-3 pt-1 text-base font-medium border-b-2 transition-all duration-150 relative border-transparent whitespace-nowrap shrink-0 cursor-pointer",
                  active
                    ? "border-accent-primary text-accent-primary"
                    : "text-text-muted hover:text-text-primary"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab contents */}
        {currentTab === "prehlad" && (
          <div className="flex flex-col gap-6">
            {/* Modular Modules Selector */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveModuleId("vajcia")}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-left",
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

            {/* Dashboard Panels Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Left Column: Metric Cards & Trend */}
              <div className="flex flex-col gap-6">
                {/* Metric Card */}
                <Card className="bg-bg-surface rounded-2xl overflow-hidden">
                  <CardContent className="p-6 text-center flex flex-col items-center">
                    <span className="text-xs sm:text-sm font-medium uppercase tracking-wider text-text-muted">
                      Dnešná Znáška
                    </span>

                    <div className="mt-1 font-nunito text-7xl font-bold text-accent-warm tracking-tighter flex items-baseline justify-center select-none">
                      {dashboardData ? dashboardData.todayValue : 0}
                      <span className="text-xl font-medium font-inter text-text-muted ml-1.5 lowercase">ks</span>
                    </div>

                    {dashboardData?.todayEntry?.note && (
                      <p className="mt-3 text-sm italic font-normal text-text-muted bg-bg-base/60 rounded-xl px-3.5 py-2">
                        „{dashboardData.todayEntry.note}“
                      </p>
                    )}

                    <div className="h-[1px] w-full bg-bg-base my-4" />

                    <div className="w-full grid grid-cols-2 gap-2.5 sm:gap-3 text-left">
                      <div className="rounded-xl bg-bg-base/60 p-3 flex flex-col">
                        <span className="text-xs font-medium text-text-muted/80 uppercase tracking-wider">Tento týždeň</span>
                        <span className="font-nunito text-lg sm:text-xl font-semibold text-accent-primary mt-0.5">
                          {getThisWeekTotal()} <span className="text-sm font-medium font-inter text-text-muted">ks</span>
                        </span>
                      </div>
                      <div className="rounded-xl bg-bg-base/60 p-3 flex flex-col">
                        <span className="text-xs font-medium text-text-muted/80 uppercase tracking-wider">Tento mesiac</span>
                        <span className="font-nunito text-lg sm:text-xl font-semibold text-accent-warm mt-0.5">
                          {getThisMonthTotal()} <span className="text-sm font-medium font-inter text-text-muted">ks</span>
                        </span>
                      </div>
                    </div>

                    {/* Laying Productivity Gauge */}
                    {totalHens > 0 && (() => {
                      const layRatePercent = Math.min(100, Math.round((todayValue / totalHens) * 100));
                      return (
                        <div className="w-full mt-4 flex flex-col gap-2 text-left bg-bg-base/60 rounded-xl p-3.5">
                          <div className="flex justify-between items-center text-xs sm:text-sm font-semibold text-text-primary">
                            <span className="flex items-center gap-1.5">
                              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-accent-primary"><path d="M12 2C6.5 2 2 10 2 15a10 10 0 0 0 20 0c0-5-4.5-13-10-13Z"/></svg>
                              Priemerná znáška na sliepku
                            </span>
                            <span className="font-bold text-accent-primary">{layRatePercent}%</span>
                          </div>
                          <div className="w-full h-2 bg-bg-base rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-accent-primary rounded-full transition-all duration-500" 
                              style={{ width: `${layRatePercent}%` }} 
                            />
                          </div>
                          <span className="text-xs text-text-muted font-medium tracking-wide">
                            Znáška: {layRatePercent}% ({todayValue} ks od {totalHens} sliepok)
                          </span>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>

                {/* Stav hejna Card */}
                <Card className="bg-bg-surface rounded-2xl overflow-hidden">
                  <CardHeader className="p-5 pb-1 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="font-nunito text-base font-bold text-text-primary">
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
                              ({getSlovakPluralHens(totalHens)}, {getSlovakPluralRoosters(totalRoosters)})
                            </span>
                          </span>
                        </div>

                        {/* Breed distribution horizontal segmented bar */}
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
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-bg-base/70 text-xs sm:text-sm font-medium text-text-primary"
                              >
                                <span
                                  className="w-2.5 h-2.5 rounded-full shrink-0"
                                  style={{ backgroundColor: info.color }}
                                />
                                <span>{info.name}</span>
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

                {/* Trend Graph */}
                <Card className="bg-bg-surface rounded-2xl overflow-hidden">
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
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 300 80" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="spark-grad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.2" />
                              <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          <line x1="0" y1="70" x2="300" y2="70" stroke="var(--bg-base)" strokeWidth="1.5" />
                          {sparkline.areaPoints && (
                            <path d={sparkline.areaPoints} fill="url(#spark-grad)" />
                          )}
                          {sparkline.points && (
                            <path d={sparkline.points} fill="none" stroke="var(--accent-primary)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                          )}
                          {sparkline.data.map((pt, i) => (
                            <g key={i}>
                              <circle cx={pt.x} cy={pt.y} r="3" fill="var(--bg-surface)" stroke="var(--accent-primary)" strokeWidth="2" />
                              {pt.value > 0 && (
                                <text x={pt.x} y={pt.y - 8} textAnchor="middle" className="font-nunito text-[10px] font-semibold fill-text-muted">
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

              {/* Right Column: Logger Form */}
              <Card className="bg-bg-surface rounded-2xl overflow-hidden">
                <CardHeader className="p-5 pb-1">
                  <CardTitle className="font-nunito text-lg font-semibold text-text-primary">
                    Zaznamenať znášku
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 pt-2">
                  <form onSubmit={handleSave} className="flex flex-col gap-4">
                    {/* Date Selector */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-text-muted uppercase tracking-wider">
                        Dátum
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-medium text-base rounded-xl px-4 py-3 bg-bg-base/60 hover:bg-bg-base/80 transition text-text-primary h-12 cursor-pointer",
                              !selectedDate && "text-text-muted"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-5 w-5 text-accent-primary" />
                            {selectedDate ? (
                              formatDateSlovakFull(selectedDate)
                            ) : (
                              <span>Vyberte dátum</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-bg-surface rounded-2xl" align="start">
                          <Calendar
                            mode="single"
                            selected={getSelectedDateObject()}
                            onSelect={handleDateSelect}
                            disabled={(date) => date > new Date() || date < new Date("2020-01-01")}
                            locale={sk}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Stepper Widget */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-text-muted uppercase tracking-wider">
                        Množstvo
                      </label>
                      <div className="flex items-center justify-between rounded-xl p-1 bg-bg-base/60">
                        <Button
                          type="button"
                          onClick={decrement}
                          className="h-12 w-14 bg-bg-surface hover:bg-bg-surface-raised font-semibold text-xl text-text-primary rounded-xl transition active:scale-95 cursor-pointer"
                        >
                          －
                        </Button>
                        <input
                          type="number"
                          min="0"
                          value={value}
                          onChange={(e) => setValue(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-20 text-center font-nunito text-3xl font-semibold text-text-primary bg-transparent focus:ring-0 focus:outline-hidden [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none select-all"
                        />
                        <Button
                          type="button"
                          onClick={increment}
                          className="h-12 w-14 bg-bg-surface hover:bg-bg-surface-raised font-semibold text-xl text-text-primary rounded-xl transition active:scale-95 cursor-pointer"
                        >
                          ＋
                        </Button>
                      </div>
                    </div>

                    {/* Optional Note */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-text-muted uppercase tracking-wider">
                        Poznámka
                      </label>
                      <Input
                        type="text"
                        placeholder="Napr. nová znáška..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="bg-bg-base/60 rounded-xl px-4 py-2.5 text-base text-text-primary focus:ring-1 focus:ring-accent-primary placeholder:text-text-muted/40 h-12 font-normal"
                      />
                    </div>

                    {/* Feedback Messages */}
                    {successMsg && (
                      <div className="text-sm font-medium text-accent-primary bg-accent-light/50 rounded-xl p-3 text-center">
                        {successMsg}
                      </div>
                    )}
                    {errorMsg && (
                      <div className="text-sm font-medium text-state-error bg-red-50/60 rounded-xl p-3 text-center">
                        {errorMsg}
                      </div>
                    )}

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full mt-1 bg-accent-primary hover:bg-accent-primary/90 text-white font-semibold py-3 text-base rounded-xl transition h-12 active:scale-[0.99] cursor-pointer"
                    >
                      {isSubmitting ? "Zapisujem..." : "Uložiť do denníka"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {currentTab === "hejno" && (
          <div className="flex flex-col gap-6">
            {/* Header section with Modal dialog trigger */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <h3 className="font-nunito text-2xl font-semibold text-text-primary flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-accent-warm fill-accent-warm/20" />
                  Naše hejno
                </h3>
                <p className="text-sm font-medium text-text-muted">
                  Spravujte plemená a celkové stavy vášho kŕdľa.
                </p>
              </div>

              {/* Add Breed Modal */}
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-accent-primary hover:bg-accent-primary/90 text-white font-semibold py-2.5 px-4 rounded-xl transition flex items-center gap-2 text-sm active:scale-[0.99] cursor-pointer">
                    <Plus className="h-5 w-5" />
                    Pridať do hejna
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-bg-surface rounded-3xl p-6">
                  <DialogHeader>
                    <DialogTitle className="font-nunito text-xl font-semibold text-text-primary">Pridať do hejna</DialogTitle>
                    <DialogDescription className="text-sm font-medium text-text-muted">
                      Vyberte jedno z predvolených plemien alebo si vytvorte vlastné s fotkou.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddChicken} className="flex flex-col gap-4 mt-4">
                    {/* Preset Selector */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-text-muted uppercase tracking-wider">Plemeno</label>
                      <select
                        value={selectedBreedPreset}
                        onChange={(e) => {
                          setSelectedBreedPreset(e.target.value);
                          if (e.target.value !== "custom") {
                            const preset = CHICKEN_BREED_PRESETS.find((p) => p.presetId === e.target.value);
                            if (preset) {
                              setColorInput(preset.color);
                            }
                          }
                        }}
                        className="w-full bg-bg-base/60 rounded-xl px-4 py-2.5 text-sm text-text-primary focus:ring-1 focus:ring-accent-primary"
                      >
                        {CHICKEN_BREED_PRESETS.map((p) => (
                          <option key={p.presetId} value={p.presetId}>
                            {p.name}
                          </option>
                        ))}
                        <option value="custom">Vlastné plemeno...</option>
                      </select>
                    </div>

                    {/* Preset Preview Box */}
                    {selectedBreedPreset !== "custom" && (() => {
                      const preset = CHICKEN_BREED_PRESETS.find((p) => p.presetId === selectedBreedPreset);
                      if (!preset) return null;
                      return (
                        <div className="flex gap-3.5 p-3 bg-bg-base/60 rounded-xl items-center">
                          <img src={preset.imageUrl} alt={preset.name} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                          <div className="flex flex-col min-w-0">
                             <span className="text-sm font-medium text-text-primary">{preset.name}</span>
                            <p className="text-xs text-text-muted font-normal leading-tight mt-0.5">{preset.description}</p>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Custom Breed Fields */}
                    {selectedBreedPreset === "custom" && (
                      <>
                        <div className="flex flex-col gap-1.5">
                           <label className="text-xs font-medium text-text-muted uppercase tracking-wider">Názov plemena</label>
                          <Input
                            type="text"
                            placeholder="Napr. Oravka..."
                            value={customName}
                            onChange={(e) => setCustomName(e.target.value)}
                            className="bg-bg-base/60 rounded-xl px-4 py-2 text-sm text-text-primary focus:ring-1 focus:ring-accent-primary placeholder:text-text-muted/40 font-normal"
                            required
                          />
                        </div>

                        <div className="flex flex-col gap-2">
                           <label className="text-xs font-medium text-text-muted uppercase tracking-wider">Farba označenia</label>
                          <div className="flex gap-2 flex-wrap">
                            {[
                              { hex: "#F9FAF5", label: "Svetlá" },
                              { hex: "#A87C53", label: "Hnedá" },
                              { hex: "#C2410C", label: "Oranžová" },
                              { hex: "#6B7280", label: "Sivá" },
                              { hex: "#4A3B32", label: "Čokoládová" },
                              { hex: "#7FA3A8", label: "Tyrkysová" },
                            ].map((c) => (
                              <button
                                key={c.hex}
                                type="button"
                                onClick={() => setColorInput(c.hex)}
                                className={cn(
                                  "w-7 h-7 rounded-full border-2 transition-all shrink-0 cursor-pointer",
                                  colorInput === c.hex
                                    ? "border-accent-primary scale-110"
                                    : "border-transparent hover:scale-105"
                                )}
                                style={{ backgroundColor: c.hex }}
                                title={c.label}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                           <label className="text-xs font-medium text-text-muted uppercase tracking-wider">Fotka (voliteľné)</label>
                          <div className="flex items-center gap-3">
                             <label className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-bg-base/60 hover:bg-bg-base/80 cursor-pointer transition text-sm font-medium text-text-primary h-12">
                              <Upload className="h-5 w-5 text-accent-primary" />
                              Vybrať súbor
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                              />
                            </label>
                            <span className="text-sm text-text-muted font-medium truncate max-w-[200px]">
                              {uploadFile ? uploadFile.name : "Žiadny súbor"}
                            </span>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Count */}
                    <div className="flex flex-col gap-1.5">
                       <label className="text-xs font-medium text-text-muted uppercase tracking-wider">Počet kusov</label>
                      <Input
                        type="number"
                        min="1"
                        value={countInput}
                        onChange={(e) => setCountInput(Math.max(1, parseInt(e.target.value) || 1))}
                        className="bg-bg-base/60 rounded-xl px-4 py-2.5 text-base text-text-primary focus:ring-1 focus:ring-accent-primary h-12 font-normal"
                        required
                      />
                    </div>

                    {/* Notes */}
                    <div className="flex flex-col gap-1.5">
                       <label className="text-xs font-medium text-text-muted uppercase tracking-wider">Poznámka / Popis</label>
                      <Input
                        type="text"
                        placeholder="Napr. vek, pôvod..."
                        value={notesInput}
                        onChange={(e) => setNotesInput(e.target.value)}
                        className="bg-bg-base/60 rounded-xl px-4 py-2.5 text-base text-text-primary focus:ring-1 focus:ring-accent-primary placeholder:text-text-muted/40 h-12 font-normal"
                      />
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0 mt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setDialogOpen(false)}
                         className="bg-bg-base/60 hover:bg-bg-base/80 text-text-primary font-semibold py-2 px-4 rounded-xl transition active:scale-[0.99] cursor-pointer"
                      >
                        Zrušiť
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSavingChicken}
                         className="bg-accent-primary hover:bg-accent-primary/90 text-white font-semibold py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition active:scale-[0.99] cursor-pointer"
                      >
                        {isSavingChicken && <Loader2 className="h-4 w-4 animate-spin" />}
                        Pridať
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Flock Catalog Card List */}
            {chickens === undefined ? (
              // Loading list skeleton
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-32 w-full animate-pulse rounded-2xl bg-bg-surface" />
                ))}
              </div>
            ) : chickens.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center p-6 bg-bg-surface rounded-2xl">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-text-muted/30 mb-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M12 2C6.5 2 2 10 2 15a10 10 0 0 0 20 0c0-5-4.5-13-10-13Z" />
                </svg>
                <p className="text-base font-semibold text-text-primary">Prázdny kurník</p>
                <p className="text-sm font-medium text-text-muted max-w-xs mt-1">
                  Do hejna ste zatiaľ nepridali žiadne sliepky ani kohútov. Pridajte prvú stlačením tlačidla vyššie.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {chickens.map((c) => {
                  const info = getChickenDetails(c);
                  return (
                    <div
                      key={c._id}
                      className="bg-bg-surface rounded-2xl overflow-hidden flex flex-row text-left relative min-h-[144px] p-2"
                    >
                      {/* Left: Breed image (Always square aspect ratio) */}
                      <div className="w-24 h-24 xs:w-28 xs:h-28 sm:w-32 sm:h-32 shrink-0 aspect-square self-center ml-2 sm:ml-3 rounded-xl overflow-hidden bg-bg-base/30">
                        <img src={info.imageUrl} alt={info.name} className="w-full h-full object-cover" />
                      </div>

                      {/* Right: details */}
                      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between min-w-0 pr-8 sm:pr-10">
                        <div>
                          {/* Name line */}
                          <div className="flex items-center gap-2">
                            <span className="font-nunito font-semibold text-base sm:text-lg text-text-primary truncate">{info.name}</span>
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: info.color }} title={`Farba: ${info.color}`} />
                          </div>
                          <p className="text-sm leading-normal text-text-muted mt-1 max-h-[60px] overflow-hidden line-clamp-2 sm:line-clamp-3">
                            {info.description}
                          </p>
                          {/* Breed Wiki/Search Link */}
                          <a
                            href={getLearnMoreLink(info.name, c.presetId)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-0.5 text-sm font-medium text-accent-primary hover:text-accent-primary/80 hover:underline mt-1.5 transition cursor-pointer"
                          >
                            Viac o plemene
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="inline"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                          </a>
                        </div>

                        {/* Count Stepper (Larger click target) */}
                        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-bg-base/40">
                          <div className="flex items-center gap-1.5 bg-accent-light/70 p-0.5 rounded-xl">
                            <button
                              type="button"
                              onClick={() => handleDecrementChicken(c._id, c.count)}
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-accent-primary hover:bg-white/60 active:scale-90 transition cursor-pointer bg-white"
                              title="Znížiť počet"
                            >
                              <Minus className="h-5 w-5" />
                            </button>
                            <span className="font-nunito text-base font-semibold text-accent-primary select-none px-1.5">
                              {c.count}<span className="text-sm font-medium font-inter lowercase">ks</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleIncrementChicken(c._id, c.count)}
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-accent-primary hover:bg-white/60 active:scale-90 transition cursor-pointer bg-white"
                              title="Zvýšiť počet"
                            >
                              <Plus className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Absolute delete trigger */}
                      <button
                        onClick={() => handleDeleteChicken(c._id)}
                        className="absolute right-2 top-2 p-2 rounded-xl text-text-muted/60 hover:text-state-error hover:bg-red-50/60 transition duration-150 cursor-pointer"
                        title="Odstrániť z hejna"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {currentTab === "dennik" && (
          <div className="flex flex-col gap-6">
            {/* Section header — matches Hejno header style */}
            <div className="flex flex-col">
              <h3 className="font-nunito text-2xl font-semibold text-text-primary flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-accent-primary" />
                Denník aktivít
              </h3>
              <p className="text-sm font-medium text-text-muted">
                Kompletná história zaznamenaných znášok vo vašom hospodárstve.
              </p>
            </div>

            {/* Summary stats card — matches Prehľad "Týždenný vývoj" card style */}
            {allEntries && allEntries.length > 0 && (
              <Card className="bg-bg-surface rounded-2xl overflow-hidden">
                <CardContent className="p-5">
                  <div className="w-full grid grid-cols-3 gap-2.5 sm:gap-3 text-left">
                    <div className="rounded-xl bg-bg-base/60 p-3 flex flex-col">
                      <span className="text-xs font-medium text-text-muted/80 uppercase tracking-wider">Celkom</span>
                      <span className="font-nunito text-lg sm:text-xl font-semibold text-accent-warm mt-0.5">
                        {allEntries.reduce((s, e) => s + (e.value || 0), 0)}{" "}
                        <span className="text-sm font-medium font-inter text-text-muted">ks</span>
                      </span>
                    </div>
                    <div className="rounded-xl bg-bg-base/60 p-3 flex flex-col">
                      <span className="text-xs font-medium text-text-muted/80 uppercase tracking-wider">Priemer / deň</span>
                      <span className="font-nunito text-lg sm:text-xl font-semibold text-accent-primary mt-0.5">
                        {(allEntries.reduce((s, e) => s + (e.value || 0), 0) / allEntries.length).toFixed(1)}{" "}
                        <span className="text-sm font-medium font-inter text-text-muted">ks</span>
                      </span>
                    </div>
                    <div className="rounded-xl bg-bg-base/60 p-3 flex flex-col">
                      <span className="text-xs font-medium text-text-muted/80 uppercase tracking-wider">Rekord dňa</span>
                      <span className="font-nunito text-lg sm:text-xl font-semibold text-text-primary mt-0.5">
                        {maxEntryValue}{" "}
                        <span className="text-sm font-medium font-inter text-text-muted">ks</span>
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Entries list — matches Hejno flock card list style */}
            {allEntries === undefined ? (
              <div className="flex flex-col gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-20 w-full animate-pulse rounded-2xl bg-bg-surface" />
                ))}
              </div>
            ) : allEntries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center p-6 bg-bg-surface rounded-2xl">
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
                <p className="text-base font-semibold text-text-primary">Denník je prázdny</p>
                <p className="text-sm font-medium text-text-muted max-w-xs mt-1">
                  Zatiaľ neboli zaevidované žiadne denné záznamy. Zaznamenajte prvú znášku na karte Prehľad.
                </p>
              </div>
            ) : (
              <Card className="bg-bg-surface rounded-2xl overflow-hidden">
                <CardContent className="p-0">
                  {allEntries.map((entry, idx) => {
                    const isToday = entry.date === todayDate;
                    return (
                      <div key={entry._id}>
                        {/* Row */}
                        <div
                          className={cn(
                            "flex items-center gap-3 sm:gap-4 px-5 py-4 relative",
                            isToday ? "bg-accent-light/20" : "hover:bg-bg-base/30 transition-colors duration-150"
                          )}
                        >
                          {/* Date block */}
                          <div className="flex flex-col min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-text-primary leading-tight">
                                {formatDateSlovakFull(entry.date)}
                              </span>
                              {isToday && (
                                <span className="shrink-0 text-[10px] font-semibold text-accent-primary bg-accent-light rounded-full px-2 py-0.5 leading-none">
                                  Dnes
                                </span>
                              )}
                            </div>
                            <span className="text-xs font-medium text-text-muted capitalize mt-0.5">
                              {getWeekDayName(entry.date)}
                            </span>
                            {entry.note && (
                              <span className="text-xs text-text-muted/70 font-normal mt-1 truncate max-w-[220px]" title={entry.note}>
                                „{entry.note}"
                              </span>
                            )}
                          </div>

                          {/* Egg count chip — matches Hejno count style */}
                          <div className="flex items-center gap-1.5 bg-accent-light/70 rounded-xl px-3 py-1.5 shrink-0">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              className="h-4 w-4 shrink-0 text-accent-warm"
                              fill="none"
                              aria-hidden="true"
                            >
                              <ellipse cx="12" cy="14" rx="7" ry="9" fill="currentColor" opacity="0.18"/>
                              <ellipse cx="12" cy="14" rx="7" ry="9" stroke="currentColor" strokeWidth="1.6" fill="none"/>
                              <ellipse cx="9.5" cy="10" rx="2" ry="1.2" fill="currentColor" opacity="0.25" transform="rotate(-30 9.5 10)"/>
                            </svg>
                            <span className="font-nunito text-base font-semibold text-accent-primary select-none">
                              {entry.value}<span className="text-sm font-medium font-inter lowercase ml-0.5 text-text-muted">ks</span>
                            </span>
                          </div>

                          {/* Logged by — hidden on mobile */}
                          <span className="hidden sm:block text-sm font-medium text-text-muted shrink-0 w-24 text-right">
                            {entry.loggedBy === user?.id ? "Vy" : "Člen rodiny"}
                          </span>

                          {/* Action buttons — matches Hejno absolute delete style but inline */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => {
                                setSelectedDate(entry.date);
                                setCurrentTab("prehlad");
                              }}
                              className="p-2 rounded-xl text-text-muted/60 hover:text-accent-primary hover:bg-accent-light/60 transition duration-150 cursor-pointer"
                              title="Upraviť záznam"
                              aria-label="Upraviť záznam"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteEntry(entry._id)}
                              className="p-2 rounded-xl text-text-muted/60 hover:text-state-error hover:bg-red-50/60 transition duration-150 cursor-pointer"
                              title="Vymazať záznam"
                              aria-label="Vymazať záznam"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Divider — matches Prehľad style */}
                        {idx < allEntries.length - 1 && (
                          <div className="h-[1px] w-full bg-bg-base mx-0" />
                        )}
                      </div>
                    );
                  })}

                  {/* Footer count */}
                  <div className="border-t border-bg-base px-5 py-3">
                    <span className="text-xs font-medium text-text-muted">
                      {allEntries.length}{" "}
                      {allEntries.length === 1 ? "záznam" : allEntries.length >= 2 && allEntries.length <= 4 ? "záznamy" : "záznamov"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}


        {currentTab === "rodina" && (
          <div className="flex flex-col gap-6">
            {/* Header — matches other tabs */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <h3 className="font-nunito text-2xl font-semibold text-text-primary flex items-center gap-2">
                  <Users className="h-5 w-5 text-accent-primary" />
                  Spoločná rodina
                </h3>
                <p className="text-sm font-medium text-text-muted">
                  Členovia, ktorí majú prístup k tejto farme.
                </p>
              </div>
            </div>

            {/* Members list */}
            {memberships === undefined ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-20 w-full animate-pulse rounded-2xl bg-bg-surface" />
                ))}
              </div>
            ) : memberships.data && memberships.data.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center p-6 bg-bg-surface rounded-2xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-text-muted/30 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <p className="text-base font-semibold text-text-primary">Zatiaľ žiadni členovia</p>
                <p className="text-sm font-medium text-text-muted max-w-xs mt-1">
                  Pozvite rodinných príslušníkov cez Clerk nastavenia organizácie.
                </p>
              </div>
            ) : (
              <Card className="bg-bg-surface rounded-2xl overflow-hidden">
                <CardContent className="p-0">
                  {memberships?.data?.map((membership, idx) => {
                    const member = membership.publicUserData;
                    const isMe = member.userId === user?.id;
                    const roleName = membership.role === "org:admin" ? "Správca" : "Člen";
                    const initials = [
                      member.firstName?.[0],
                      member.lastName?.[0],
                    ].filter(Boolean).join("") || member.identifier?.[0]?.toUpperCase() || "?";
                    return (
                      <div key={membership.id}>
                        <div className="flex items-center gap-4 px-5 py-4">
                          {/* Avatar */}
                          {member.imageUrl ? (
                            <img
                              src={member.imageUrl}
                              alt={member.firstName || member.identifier || ""}
                              className="w-11 h-11 rounded-full object-cover shrink-0 bg-bg-base"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-full bg-accent-light flex items-center justify-center shrink-0">
                              <span className="font-nunito text-base font-semibold text-accent-primary">{initials}</span>
                            </div>
                          )}

                          {/* Name & email */}
                          <div className="flex flex-col min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium text-text-primary leading-tight">
                                {member.firstName || member.lastName
                                  ? [member.firstName, member.lastName].filter(Boolean).join(" ")
                                  : member.identifier}
                              </span>
                              {isMe && (
                                <span className="shrink-0 text-[10px] font-semibold text-accent-primary bg-accent-light rounded-full px-2 py-0.5 leading-none">
                                  Vy
                                </span>
                              )}
                            </div>
                            <span className="text-xs font-medium text-text-muted mt-0.5 truncate">
                              {member.identifier}
                            </span>
                          </div>

                          {/* Role badge */}
                          <div className="shrink-0">
                            <span className={cn(
                              "text-xs font-semibold px-2.5 py-1 rounded-xl",
                              membership.role === "org:admin"
                                ? "bg-accent-light text-accent-primary"
                                : "bg-bg-base/60 text-text-muted"
                            )}>
                              {roleName}
                            </span>
                          </div>
                        </div>

                        {/* Divider */}
                        {idx < (memberships.data?.length ?? 0) - 1 && (
                          <div className="h-[1px] w-full bg-bg-base" />
                        )}
                      </div>
                    );
                  })}

                  {/* Footer */}
                  <div className="border-t border-bg-base px-5 py-3">
                    <span className="text-xs font-medium text-text-muted">
                      {memberships?.data?.length ?? 0}{" "}
                      {(memberships?.data?.length ?? 0) === 1 ? "člen" : (memberships?.data?.length ?? 0) >= 2 && (memberships?.data?.length ?? 0) <= 4 ? "členovia" : "členov"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
