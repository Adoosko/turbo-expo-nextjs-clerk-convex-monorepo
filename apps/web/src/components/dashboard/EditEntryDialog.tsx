import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import React from "react";
import { Entry, ExpenseReason, EXPENSE_REASONS } from "@/lib/types";
import { formatDateSlovakFull } from "./utils";

interface EditEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingEntry: Entry | null;
  editValue: number;
  setEditValue: React.Dispatch<React.SetStateAction<number>>;
  editNote: string;
  setEditNote: React.Dispatch<React.SetStateAction<string>>;
  editReason: ExpenseReason;
  setEditReason: (r: ExpenseReason) => void;
  isUpdatingEntry: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export default function EditEntryDialog({
  open,
  onOpenChange,
  editingEntry,
  editValue,
  setEditValue,
  editNote,
  setEditNote,
  editReason,
  setEditReason,
  isUpdatingEntry,
  onSubmit,
}: EditEntryDialogProps) {
  const isIncome = !editingEntry || !editingEntry.type || editingEntry.type === "income";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-bg-surface rounded-3xl p-6 border border-border-default/30 shadow-none">
        <DialogHeader>
          <DialogTitle className="font-inter text-lg font-semibold text-text-primary">
            Upraviť záznam
          </DialogTitle>
          <DialogDescription className="text-sm font-medium text-text-muted">
            Upravte {isIncome ? "znášku" : "výdaj"} pre deň {editingEntry && formatDateSlovakFull(editingEntry.date)}.
          </DialogDescription>
        </DialogHeader>
        {editingEntry && (
          <form onSubmit={onSubmit} className="flex flex-col gap-4 mt-4">
            
            {/* Value Stepper */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-muted uppercase tracking-wider">
                Množstvo
              </label>
              <div className="flex items-center justify-between rounded-xl p-1 bg-bg-base/60">
                <Button
                  type="button"
                  onClick={() => setEditValue((prev) => Math.max(0, prev - 1))}
                  className="h-12 w-14 bg-bg-surface hover:bg-bg-surface-raised font-semibold text-xl text-text-primary rounded-xl transition active:scale-95 cursor-pointer"
                >
                  －
                </Button>
                <input
                  type="number"
                  min="0"
                  value={editValue}
                  onChange={(e) => setEditValue(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-20 text-center font-inter text-3xl font-bold tabular-nums text-text-primary bg-transparent focus:ring-0 focus:outline-hidden [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none select-all"
                />
                <Button
                  type="button"
                  onClick={() => setEditValue((prev) => prev + 1)}
                  className="h-12 w-14 bg-bg-surface hover:bg-bg-surface-raised font-semibold text-xl text-text-primary rounded-xl transition active:scale-95 cursor-pointer"
                >
                  ＋
                </Button>
              </div>
            </div>

            {/* Reason selector (only for expenses) */}
            {!isIncome && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-text-muted uppercase tracking-wider">
                  Dôvod výdaja
                </label>
                <select
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value as ExpenseReason)}
                  className="w-full bg-bg-base/60 rounded-xl px-4 py-2.5 text-base text-text-primary focus:ring-1 focus:ring-accent-primary border-none cursor-pointer font-medium h-12"
                >
                  {EXPENSE_REASONS.map((r) => (
                    <option key={r.value} value={r.value} className="bg-bg-surface text-text-primary">
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Note input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-muted uppercase tracking-wider">
                Poznámka
              </label>
              <Input
                type="text"
                placeholder="Napr. nová znáška..."
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
                className="bg-bg-base/60 rounded-xl px-4 py-2.5 text-base text-text-primary focus:ring-1 focus:ring-accent-primary placeholder:text-text-muted/40 h-12 font-normal border-none"
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0 mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="bg-bg-base/60 hover:bg-bg-base/80 text-text-primary font-semibold py-2 px-4 rounded-xl transition active:scale-[0.99] cursor-pointer"
              >
                Zrušiť
              </Button>
              <Button
                type="submit"
                disabled={isUpdatingEntry}
                className="bg-accent-primary hover:bg-accent-primary/90 text-white font-semibold py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition active:scale-[0.99] cursor-pointer"
              >
                {isUpdatingEntry && <Loader2 className="h-4 w-4 animate-spin" />}
                Uložiť
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
