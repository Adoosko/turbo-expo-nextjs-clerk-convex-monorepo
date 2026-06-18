import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, Loader2, ArrowRight } from "lucide-react";
import React, { useState } from "react";
import AddChickenDialog from "./AddChickenDialog";
import { getChickenDetails, getLearnMoreLink, formatChicksAge, getExpectedLayingDate } from "./utils";
import { useMutation } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
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

interface HejnoTabProps {
  orgId: string;
  chickens: any[] | undefined;
  handleIncrementChicken: (chickenId: string, currentCount: number) => void;
  handleDecrementChicken: (chickenId: string, currentCount: number) => void;
  handleDeleteChicken: (chickenId: string) => void;
  handleAddChicken: (e: React.FormEvent) => void;
  // State variables for the dialog
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
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
  hatchedDateInput: string;
  setHatchedDateInput: (val: string) => void;
}

export default function HejnoTab({
  orgId,
  chickens,
  handleIncrementChicken,
  handleDecrementChicken,
  handleDeleteChicken,
  handleAddChicken,
  dialogOpen,
  setDialogOpen,
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
  hatchedDateInput,
  setHatchedDateInput,
}: HejnoTabProps) {
  // Promotion State
  const [promoteDialogOpen, setPromoteDialogOpen] = useState(false);
  const [promotingChicken, setPromotingChicken] = useState<any>(null);
  const [promoteCount, setPromoteCount] = useState(1);
  const [promoteTargetPreset, setPromoteTargetPreset] = useState("leghornka");
  const [promoteCustomName, setPromoteCustomName] = useState("");
  const [promoteCustomColor, setPromoteCustomColor] = useState("#2C4E3A");
  const [isPromoting, setIsPromoting] = useState(false);

  const promoteMutation = useMutation(api.chickens.promoteChicks);

  const openPromoteDialog = (chicken: any) => {
    setPromotingChicken(chicken);
    setPromoteCount(1);
    setPromoteTargetPreset("leghornka");
    setPromoteCustomName("");
    setPromoteCustomColor("#2C4E3A");
    setPromoteDialogOpen(true);
  };

  const handlePromoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promotingChicken) return;
    setIsPromoting(true);

    let targetName = "";
    let targetColor = promoteCustomColor;

    if (promoteTargetPreset === "custom") {
      targetName = promoteCustomName.trim() || "Vlastné plemeno";
    } else {
      const preset = CHICKEN_BREED_PRESETS.find((p) => p.presetId === promoteTargetPreset);
      targetName = preset?.name || "Plemeno";
      targetColor = preset?.color || "#CD7F32";
    }

    try {
      await promoteMutation({
        orgId,
        chickensId: promotingChicken._id,
        targetPresetId: promoteTargetPreset,
        targetName,
        targetColor,
        countToPromote: promoteCount,
      });
      setPromoteDialogOpen(false);
      setPromotingChicken(null);
    } catch (err) {
      console.error(err);
      alert("Chyba pri preradzovaní kuriatok.");
    } finally {
      setIsPromoting(false);
    }
  };
  return (
    <div className="flex flex-col gap-5">
      {/* Header section with add button */}
      <div className="flex items-center justify-between border-b border-bg-base pb-3">
        <div>
          <h3 className="font-nunito text-lg font-bold text-text-primary">
            Plemená a zloženie hejna
          </h3>
          <p className="text-xs font-medium text-text-muted">
            Spravujte plemená a celkové stavy vášho kŕdľa.
          </p>
        </div>

        {/* Add Breed Dialog */}
        <AddChickenDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          selectedBreedPreset={selectedBreedPreset}
          setSelectedBreedPreset={setSelectedBreedPreset}
          colorInput={colorInput}
          setColorInput={setColorInput}
          customName={customName}
          setCustomName={setCustomName}
          uploadFile={uploadFile}
          setUploadFile={setUploadFile}
          countInput={countInput}
          setCountInput={setCountInput}
          notesInput={notesInput}
          setNotesInput={setNotesInput}
          isSavingChicken={isSavingChicken}
          onSubmit={handleAddChicken}
          hatchedDateInput={hatchedDateInput}
          setHatchedDateInput={setHatchedDateInput}
        />
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-accent-primary hover:bg-accent-primary/90 text-white font-semibold py-2.5 px-4 rounded-xl transition flex items-center gap-2 text-sm active:scale-[0.99] cursor-pointer"
        >
          <Plus className="h-5 w-5" />
          Pridať do hejna
        </Button>
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
                {/* Left: Breed image (Always square aspect ratio, top-left aligned) */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 aspect-square self-start mt-2 ml-2 sm:mt-3 sm:ml-3 rounded-xl overflow-hidden bg-bg-base/30 relative">
                  <img src={info.imageUrl} alt={info.name} className="w-full h-full object-cover" />
                </div>

                {/* Right: details */}
                <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between min-w-0 pr-8 sm:pr-10">
                  <div>
                    {/* Name line */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-nunito font-semibold text-base sm:text-lg text-text-primary truncate">
                        {info.name}
                      </span>
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: info.color }}
                        title={`Farba: ${info.color}`}
                      />
                    </div>

                    {/* Age and Laying Pills */}
                    {c.presetId === "kuriatko" && c.hatchedDate && (
                      <div className="flex flex-wrap gap-1.5 mt-1.5 mb-1">
                        <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-text-muted bg-bg-base/60 px-2.5 py-0.5 rounded-full select-none shrink-0 border border-border-default/40 tracking-wide">
                          {formatChicksAge(c.hatchedDate)}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-text-muted bg-bg-base/60 px-2.5 py-0.5 rounded-full select-none shrink-0 border border-border-default/40 tracking-wide">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            className="text-text-muted/60 shrink-0"
                          >
                            <path d="M12 2C6.5 2 2 10 2 15a10 10 0 0 0 20 0c0-5-4.5-13-10-13Z" />
                          </svg>
                          Znáška: {getExpectedLayingDate(c.hatchedDate)}
                        </span>
                      </div>
                    )}

                    <p className="text-sm leading-normal text-text-muted mt-1 max-h-[60px] overflow-hidden line-clamp-2 sm:line-clamp-3">
                      {info.description}
                    </p>
                    {/* Breed Wiki/Search Link */}
                    <a
                      href={getLearnMoreLink(info.name, c.presetId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-0.5 text-xs font-semibold text-accent-primary hover:text-accent-primary/80 hover:underline mt-1.5 transition cursor-pointer"
                    >
                      Viac o plemene
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        className="inline ml-0.5"
                      >
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </a>
                  </div>

                  {/* Count Stepper & Promotion */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-3 pt-3 border-t border-bg-base/40">
                    <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
                      <span className="text-[10px] sm:text-xs font-semibold text-text-muted uppercase tracking-wider">
                        Počet
                      </span>
                      <div className="flex items-center gap-1 bg-accent-light/50 p-0.5 rounded-xl">
                        <button
                          type="button"
                          onClick={() => handleDecrementChicken(c._id, c.count)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-accent-primary hover:bg-white active:scale-90 transition cursor-pointer bg-white"
                          title="Znížiť počet"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="font-nunito text-sm font-semibold text-accent-primary select-none px-1">
                          {c.count}
                          <span className="text-xs font-medium font-inter lowercase ml-0.5">ks</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleIncrementChicken(c._id, c.count)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-accent-primary hover:bg-white active:scale-90 transition cursor-pointer bg-white"
                          title="Zvýšiť počet"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {c.presetId === "kuriatko" && (
                      <Button
                        type="button"
                        onClick={() => openPromoteDialog(c)}
                        className="w-full sm:w-auto text-xs font-semibold text-accent-primary hover:bg-accent-light/80 bg-accent-light px-3 py-1.5 rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-none h-9 border-none"
                      >
                        <ArrowRight className="h-4 w-4" />
                        Preradiť na nosnice
                      </Button>
                    )}
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

      {/* Promote Chicks Dialog */}
      <Dialog open={promoteDialogOpen} onOpenChange={setPromoteDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-bg-surface rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="font-nunito text-xl font-semibold text-text-primary">
              Preradiť kuriatka na nosnice
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-text-muted">
              Vyberte, koľko kuriatok a na aké plemeno sliepok/kačiek chcete preradiť.
            </DialogDescription>
          </DialogHeader>
          {promotingChicken && (
            <form onSubmit={handlePromoteSubmit} className="flex flex-col gap-4 mt-4">
              {/* Count input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-text-muted uppercase tracking-wider">
                  Počet na preradenie (max {promotingChicken.count} ks)
                </label>
                <Input
                  type="number"
                  min="1"
                  max={promotingChicken.count}
                  value={promoteCount}
                  onChange={(e) => setPromoteCount(Math.min(promotingChicken.count, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="bg-bg-base/60 rounded-xl px-4 py-2.5 text-base text-text-primary focus:ring-1 focus:ring-accent-primary h-12 font-normal"
                  required
                />
              </div>

              {/* Target Preset Selection */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-text-muted uppercase tracking-wider">
                  Cieľové plemeno
                </label>
                <select
                  value={promoteTargetPreset}
                  onChange={(e) => {
                    setPromoteTargetPreset(e.target.value);
                    if (e.target.value !== "custom") {
                      const preset = CHICKEN_BREED_PRESETS.find((p) => p.presetId === e.target.value);
                      if (preset) {
                        setPromoteCustomColor(preset.color);
                      }
                    }
                  }}
                  className="w-full bg-bg-base/60 rounded-xl px-4 py-2.5 text-sm text-text-primary focus:ring-1 focus:ring-accent-primary"
                >
                  {CHICKEN_BREED_PRESETS.filter((p) => p.presetId !== "kohut" && p.presetId !== "kuriatko").map((p) => (
                    <option key={p.presetId} value={p.presetId}>
                      {p.name}
                    </option>
                  ))}
                  <option value="custom">Vlastné plemeno...</option>
                </select>
              </div>

              {/* Custom Target Breed fields */}
              {promoteTargetPreset === "custom" && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-text-muted uppercase tracking-wider">
                      Názov cieľového plemena
                    </label>
                    <Input
                      type="text"
                      placeholder="Napr. Oravka..."
                      value={promoteCustomName}
                      onChange={(e) => setPromoteCustomName(e.target.value)}
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
                          onClick={() => setPromoteCustomColor(c.hex)}
                          className={cn(
                            "w-7 h-7 rounded-full border-2 transition-all shrink-0 cursor-pointer",
                            promoteCustomColor === c.hex
                              ? "border-accent-primary scale-110"
                              : "border-transparent hover:scale-105"
                          )}
                          style={{ backgroundColor: c.hex }}
                          title={c.label}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}

              <DialogFooter className="gap-2 sm:gap-0 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPromoteDialogOpen(false)}
                  className="bg-bg-base/60 hover:bg-bg-base/80 text-text-primary font-semibold py-2 px-4 rounded-xl transition active:scale-[0.99] cursor-pointer"
                >
                  Zrušiť
                </Button>
                <Button
                  type="submit"
                  disabled={isPromoting}
                  className="bg-accent-primary hover:bg-accent-primary/90 text-white font-semibold py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition active:scale-[0.99] cursor-pointer"
                >
                  {isPromoting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Preradiť
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
