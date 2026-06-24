import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ArrowLeft, Minus, Plus } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Entry, EntryType, ExpenseReason, EXPENSE_REASONS } from "@/lib/types";
import { EggTrayVisualizer } from "./EggTrayVisualizer";

interface HeroLoggerCardProps {
  activeModuleId: string;
  stock: number;
  todayIncomeEntry: Entry | null;
  todayExpenseEntry: Entry | null;
  isSubmitting: boolean;
  successMsg: string;
  errorMsg: string;
  onSave: (args: {
    value: number;
    note: string;
    type: EntryType;
    reason?: ExpenseReason;
  }) => Promise<void>;
  selectedDate: string;
}

export default function HeroLoggerCard({
  activeModuleId,
  stock,
  todayIncomeEntry,
  todayExpenseEntry,
  isSubmitting,
  successMsg,
  errorMsg,
  onSave,
  selectedDate,
}: HeroLoggerCardProps) {
  const [activeMode, setActiveMode] = useState<"view" | "income" | "expense">("view");

  // Stepper values
  const [value, setValue] = useState(0);
  const [note, setNote] = useState("");
  const [reason, setReason] = useState<ExpenseReason>("predaj");

  // Reset to view mode whenever selected date changes
  useEffect(() => {
    setActiveMode("view");
  }, [selectedDate]);

  // Load existing values when entering logger mode
  const enterMode = (mode: "income" | "expense") => {
    if (mode === "income") {
      setValue(todayIncomeEntry ? todayIncomeEntry.value : 0);
      setNote(todayIncomeEntry ? todayIncomeEntry.note || "" : "");
    } else {
      setValue(todayExpenseEntry ? todayExpenseEntry.value : 0);
      setNote(todayExpenseEntry ? todayExpenseEntry.note || "" : "");
      setReason(todayExpenseEntry ? todayExpenseEntry.reason || "predaj" : "predaj");
    }
    setActiveMode(mode);
  };

  const handleIncrement = () => setValue((prev) => prev + 1);
  const handleDecrement = () => setValue((prev) => Math.max(0, prev - 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeMode === "view") return;

    await onSave({
      value,
      note: note.trim(),
      type: activeMode,
      reason: activeMode === "expense" ? reason : undefined,
    });
    
    // Switch back to view mode on success
    setActiveMode("view");
  };

  const todayIncomeVal = todayIncomeEntry ? todayIncomeEntry.value : 0;
  const todayExpenseVal = todayExpenseEntry ? todayExpenseEntry.value : 0;

  return (
    <Card className="relative overflow-hidden transition-all duration-500 ease-in-out border-0 w-full bg-bg-surface shadow-none rounded-3xl">
      <CardContent className="p-6 sm:p-8">
        
        {/* VIEW MODE (Dashboard Summary) */}
        {activeMode === "view" && (
          <div className="flex flex-col items-center text-center animate-fade-in">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
              Aktuálny stav zásob
            </span>
            
            {/* Big Stock Value */}
            <div className="font-nunito text-7xl sm:text-8xl font-extrabold text-accent-primary tracking-tighter flex items-center justify-center select-none gap-4">
              <img src="/egg.png" alt="Vajce" className="h-16 w-16 sm:h-20 sm:w-20 object-contain drop-shadow-none opacity-90" />
              <div className="flex items-baseline">
                {stock}
                <span className="text-2xl font-medium font-inter text-text-muted ml-2 lowercase">
                  ks
                </span>
              </div>
            </div>

            {/* Egg Tray Visualizer */}
            {activeModuleId === "vajcia" && (
              <div className="mt-4 w-full">
                <EggTrayVisualizer stock={stock} />
              </div>
            )}

            {/* Daily summary info */}
            <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:gap-6 text-sm font-semibold text-text-muted">
              <div>
                Dnes znáška: <span className="text-accent-primary font-bold">+{todayIncomeVal} ks</span>
              </div>
              <div className="hidden sm:block text-border-strong">|</div>
              <div>
                Dnes výdaj: <span className="text-accent-warm font-bold">-{todayExpenseVal} ks</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full max-w-md">
              <Button
                onClick={() => enterMode("income")}
                className="flex-1 bg-accent-primary hover:bg-accent-primary/95 text-white font-semibold py-3.5 px-6 rounded-2xl transition active:scale-[0.99] cursor-pointer h-13 shadow-sm flex items-center justify-center gap-2 border-0 text-base"
              >
                <Plus className="w-5 h-5" />
                {todayIncomeEntry ? "Upraviť znášku" : "+ Znáška"}
              </Button>
              <Button
                onClick={() => enterMode("expense")}
                className="flex-1 bg-accent-warm hover:bg-accent-warm/95 text-white font-semibold py-3.5 px-6 rounded-2xl transition active:scale-[0.99] cursor-pointer h-13 shadow-sm flex items-center justify-center gap-2 border-0 text-base"
              >
                <Minus className="w-5 h-5" />
                {todayExpenseEntry ? "Upraviť výdaj" : "− Výdaj"}
              </Button>
            </div>
          </div>
        )}

        {/* INCOME / EXPENSE STEPPER FORM */}
        {activeMode !== "view" && (
          <div className="flex flex-col w-full animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <button
                type="button"
                onClick={() => setActiveMode("view")}
                className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors cursor-pointer text-sm font-semibold border-none bg-transparent"
              >
                <ArrowLeft className="w-4 h-4" />
                Späť
              </button>
              <h2 className="font-inter text-base font-semibold text-text-primary">
                {activeMode === "income" ? "Zaznamenať znášku" : "Zaznamenať výdaj"}
              </h2>
              <div className="w-12" /> {/* Spacer */}
            </div>

            {/* Real-time Egg Tray Preview */}
            {activeModuleId === "vajcia" && (
              <div className="mb-5 w-full">
                <EggTrayVisualizer
                  stock={stock}
                  previewStock={activeMode === "income" ? stock + value : Math.max(0, stock - value)}
                />
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full max-w-sm mx-auto">
              
              {/* Stepper Widget */}
              <div className="flex items-center justify-between rounded-2xl p-2 bg-bg-base/80 ring-1 ring-border-default/50">
                <Button
                  type="button"
                  onClick={handleDecrement}
                  className="h-16 w-16 bg-bg-surface hover:bg-bg-surface-raised font-bold text-2xl text-text-primary rounded-xl transition-all active:scale-95 cursor-pointer shadow-none"
                >
                  －
                </Button>
                <input
                  type="number"
                  min="0"
                  value={value}
                  onChange={(e) => setValue(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-24 text-center font-inter text-5xl font-bold tabular-nums text-text-primary bg-transparent focus:ring-0 focus:outline-hidden [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none select-all"
                />
                <Button
                  type="button"
                  onClick={handleIncrement}
                  className="h-16 w-16 bg-bg-surface hover:bg-bg-surface-raised font-bold text-2xl text-text-primary rounded-xl transition-all active:scale-95 cursor-pointer shadow-none"
                >
                  ＋
                </Button>
              </div>

              {/* Expense Reason (only in expense mode) */}
              {activeMode === "expense" && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-muted uppercase tracking-wider pl-1">
                    Dôvod výdaja
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value as ExpenseReason)}
                    className="w-full bg-bg-base/60 rounded-xl px-4 py-3 text-base text-text-primary focus:ring-1 focus:ring-accent-primary border-none cursor-pointer font-medium h-12"
                  >
                    {EXPENSE_REASONS.map((r) => (
                      <option key={r.value} value={r.value} className="bg-bg-surface text-text-primary">
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Optional Note */}
              <div className="flex flex-col gap-1.5">
                <Input
                  type="text"
                  placeholder="Voliteľná poznámka..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="bg-bg-base/60 rounded-xl px-5 py-3 text-base text-text-primary focus:ring-1 focus:ring-accent-primary placeholder:text-text-muted/50 h-14 font-normal border-none"
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

              {/* Submit Action */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  "text-white font-semibold py-3.5 text-lg rounded-xl transition-all active:scale-[0.98] cursor-pointer h-14 shadow-sm mt-2 border-0",
                  activeMode === "income"
                    ? "bg-accent-primary hover:bg-accent-primary/90"
                    : "bg-accent-warm hover:bg-accent-warm/90"
                )}
              >
                {isSubmitting
                  ? "Zapisujem..."
                  : activeMode === "income"
                    ? (todayIncomeEntry ? "Uložiť zmeny znášky" : "Potvrdiť znášku")
                    : (todayExpenseEntry ? "Uložiť zmeny výdaja" : "Potvrdiť výdaj")}
              </Button>
            </form>
          </div>
        )}

      </CardContent>
    </Card>
  );
}
