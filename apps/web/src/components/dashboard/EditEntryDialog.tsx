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
import { formatDateSlovakFull } from "./utils";

interface EditEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingEntry: any;
  editValue: number;
  setEditValue: React.Dispatch<React.SetStateAction<number>>;
  editNote: string;
  setEditNote: React.Dispatch<React.SetStateAction<string>>;
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
  isUpdatingEntry,
  onSubmit,
}: EditEntryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-bg-surface rounded-3xl p-6 shadow-[0_16px_40px_rgba(35,40,36,0.03)] border-0">
        <DialogHeader>
          <DialogTitle className="font-nunito text-xl font-semibold text-text-primary">
            Upraviť záznam
          </DialogTitle>
          <DialogDescription className="text-sm font-medium text-text-muted">
            Upravte znášku pre deň {editingEntry && formatDateSlovakFull(editingEntry.date)}.
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
                  className="w-20 text-center font-nunito text-3xl font-semibold text-text-primary bg-transparent focus:ring-0 focus:outline-hidden [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none select-all"
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
