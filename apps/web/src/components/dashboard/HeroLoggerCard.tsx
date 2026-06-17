/* eslint-disable react-hooks/set-state-in-effect */
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CheckCircle2, Pencil } from "lucide-react";
import React, { useEffect, useState } from "react";

interface HeroLoggerCardProps {
  value: number;
  setValue: React.Dispatch<React.SetStateAction<number>>;
  note: string;
  setNote: (note: string) => void;
  isSubmitting: boolean;
  successMsg: string;
  errorMsg: string;
  onSubmit: (e: React.FormEvent) => void;
  todayMatch: any;
}

export default function HeroLoggerCard({
  value,
  setValue,
  note,
  setNote,
  isSubmitting,
  successMsg,
  errorMsg,
  onSubmit,
  todayMatch,
}: HeroLoggerCardProps) {
  // Local state to override the "Logged" view and force the form
  const [isEditingMode, setIsEditingMode] = useState(false);

  // If todayMatch changes to undefined (e.g., date changed or deleted), reset edit mode
  useEffect(() => {
    if (!todayMatch) {
      setIsEditingMode(false);
    } else {
      // Auto-exit edit mode when successfully updated
      if (successMsg) {
        setIsEditingMode(false);
      }
    }
  }, [todayMatch, successMsg]);

  // Stepper handlers
  const increment = () => setValue((prev) => prev + 1);
  const decrement = () => setValue((prev) => Math.max(0, prev - 1));

  // We are in "Logged" state if there's a match for today and we aren't explicitly editing
  const isLogged = todayMatch && !isEditingMode;

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-500 ease-in-out border-0 w-full",
        isLogged
          ? "bg-bg-base shadow-none"
          : "bg-bg-surface shadow-none"
      )}
      style={{ borderRadius: "24px" }}
    >
      <CardContent className="p-6 sm:p-8">
        {/* LOGGED STATE */}
        <div
          className={cn(
            "transition-all duration-500 ease-in-out flex flex-col items-center text-center",
            isLogged ? "opacity-100 scale-100 animate-fade-in" : "opacity-0 scale-95 hidden absolute pointer-events-none"
          )}
        >
          <div className="flex items-center gap-2 text-state-success mb-2 bg-state-success/10 px-3 py-1 rounded-full">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Dnes hotovo
            </span>
          </div>
          
          <div className="mt-2 font-nunito text-8xl font-semibold text-accent-warm tracking-tighter flex items-center justify-center select-none gap-4">
            <img src="/egg.png" alt="Vajce" className="h-16 w-16 sm:h-20 sm:w-20 object-contain drop-shadow-none opacity-90" />
            <div className="flex items-baseline">
              {todayMatch?.value || 0}
              <span className="text-2xl font-medium font-inter text-text-muted ml-2 lowercase">
                ks
              </span>
            </div>
          </div>

          {todayMatch?.note && (
            <p className="mt-4 text-sm italic font-normal text-text-muted bg-bg-surface rounded-xl px-4 py-2.5 shadow-none">
              „{todayMatch.note}“
            </p>
          )}

          <Button
            variant="ghost"
            onClick={() => {
              setValue(todayMatch?.value || 0);
              setNote(todayMatch?.note || "");
              setIsEditingMode(true);
            }}
            className="mt-6 text-text-muted hover:text-accent-primary hover:bg-accent-light/50 transition-colors rounded-xl px-6 font-medium"
          >
            <Pencil className="w-4 h-4 mr-2" />
            Upraviť dnešnú znášku
          </Button>
        </div>

        {/* UNLOGGED / EDITING STATE */}
        <div
          className={cn(
            "transition-all duration-500 ease-in-out flex flex-col w-full",
            !isLogged ? "opacity-100 scale-100 animate-fade-in" : "opacity-0 scale-95 hidden absolute pointer-events-none"
          )}
        >
          <div className="text-center mb-6">
            <h2 className="font-nunito text-2xl font-semibold text-text-primary">
              {isEditingMode ? "Upraviť záznam" : "Zaznamenať dnešnú znášku"}
            </h2>
            <p className="text-sm text-text-muted mt-1">
              Koľko vajec ste dnes vyzbierali?
            </p>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-5 w-full max-w-sm mx-auto">
            {/* Stepper Widget */}
            <div className="flex items-center justify-between rounded-2xl p-2 bg-bg-base/80 ring-1 ring-border-default/50">
              <Button
                type="button"
                onClick={decrement}
                className="h-16 w-16 bg-bg-surface hover:bg-bg-surface-raised font-semibold text-3xl text-text-primary rounded-xl transition-all active:scale-95 cursor-pointer shadow-none"
              >
                －
              </Button>
              <input
                type="number"
                min="0"
                value={value}
                onChange={(e) => setValue(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-24 text-center font-nunito text-5xl font-semibold text-text-primary bg-transparent focus:ring-0 focus:outline-hidden [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none select-all"
              />
              <Button
                type="button"
                onClick={increment}
                className="h-16 w-16 bg-bg-surface hover:bg-bg-surface-raised font-semibold text-3xl text-text-primary rounded-xl transition-all active:scale-95 cursor-pointer shadow-none"
              >
                ＋
              </Button>
            </div>

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

            {/* Actions */}
            <div className="flex gap-3 mt-2">
              {isEditingMode && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsEditingMode(false)}
                  className="w-1/3 bg-bg-base/60 hover:bg-bg-base text-text-muted font-medium py-3 rounded-xl h-14"
                >
                  Zrušiť
                </Button>
              )}
              <Button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  "bg-accent-primary hover:bg-accent-primary/90 text-white font-semibold py-3 text-lg rounded-xl transition-all active:scale-[0.98] cursor-pointer h-14 shadow-md",
                  isEditingMode ? "w-2/3" : "w-full"
                )}
              >
                {isSubmitting
                  ? "Zapisujem..."
                  : isEditingMode
                    ? "Uložiť zmeny"
                    : "Potvrdiť znášku"}
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
