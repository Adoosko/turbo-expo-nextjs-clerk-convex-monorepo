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
import { CHICKEN_BREED_PRESETS } from "@/lib/presets";
import { cn } from "@/lib/utils";
import { Loader2, Upload } from "lucide-react";
import React from "react";

interface AddChickenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedBreedPreset: string;
  setSelectedBreedPreset: (val: string) => void;
  colorInput: string;
  setColorInput: (val: string) => void;
  customName: string;
  setCustomName: (val: string) => void;
  uploadFile: File | null;
  setUploadFile: (val: File | null) => void;
  countInput: number;
  setCountInput: (val: number) => void;
  notesInput: string;
  setNotesInput: (val: string) => void;
  isSavingChicken: boolean;
  onSubmit: (e: React.FormEvent) => void;
  hatchedDateInput: string;
  setHatchedDateInput: (val: string) => void;
}

export default function AddChickenDialog({
  open,
  onOpenChange,
  selectedBreedPreset,
  setSelectedBreedPreset,
  colorInput,
  setColorInput,
  customName,
  setCustomName,
  uploadFile,
  setUploadFile,
  countInput,
  setCountInput,
  notesInput,
  setNotesInput,
  isSavingChicken,
  onSubmit,
  hatchedDateInput,
  setHatchedDateInput,
}: AddChickenDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-bg-surface rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="font-nunito text-xl font-semibold text-text-primary">
            Pridať do hejna
          </DialogTitle>
          <DialogDescription className="text-sm font-medium text-text-muted">
            Vyberte jedno z predvolených plemien alebo si vytvorte vlastné s fotkou.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4 mt-4">
          {/* Preset Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-muted uppercase tracking-wider">
              Plemeno
            </label>
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
                <img
                  src={preset.imageUrl}
                  alt={preset.name}
                  className="w-14 h-14 rounded-lg object-cover shrink-0"
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium text-text-primary">{preset.name}</span>
                  <p className="text-xs text-text-muted font-normal leading-tight mt-0.5">
                    {preset.description}
                  </p>
                </div>
              </div>
            );
          })()}

          {/* Custom Breed Fields */}
          {selectedBreedPreset === "custom" && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-text-muted uppercase tracking-wider">
                  Názov plemena
                </label>
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
                <label className="text-xs font-medium text-text-muted uppercase tracking-wider">
                  Farba označenia
                </label>
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
                <label className="text-xs font-medium text-text-muted uppercase tracking-wider">
                  Fotka (voliteľné)
                </label>
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

          {/* Hatch Date (Only for Kuriatko) */}
          {selectedBreedPreset === "kuriatko" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-muted uppercase tracking-wider">
                Dátum vyliahnutia
              </label>
              <Input
                type="date"
                value={hatchedDateInput}
                onChange={(e) => setHatchedDateInput(e.target.value)}
                className="bg-bg-base/60 rounded-xl px-4 py-2.5 text-base text-text-primary focus:ring-1 focus:ring-accent-primary h-12 font-normal"
                required
              />
            </div>
          )}

          {/* Count */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-muted uppercase tracking-wider">
              Počet kusov
            </label>
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
            <label className="text-xs font-medium text-text-muted uppercase tracking-wider">
              Poznámka / Popis
            </label>
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
              onClick={() => onOpenChange(false)}
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
  );
}
