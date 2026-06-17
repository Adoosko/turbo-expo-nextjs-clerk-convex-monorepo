import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2 } from "lucide-react";
import React from "react";
import AddChickenDialog from "./AddChickenDialog";
import { getChickenDetails, getLearnMoreLink } from "./utils";

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
}: HejnoTabProps) {
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
                {/* Left: Breed image (Always square aspect ratio) */}
                <div className="w-24 h-24 xs:w-28 xs:h-28 sm:w-32 sm:h-32 shrink-0 aspect-square self-center ml-2 sm:ml-3 rounded-xl overflow-hidden bg-bg-base/30">
                  <img src={info.imageUrl} alt={info.name} className="w-full h-full object-cover" />
                </div>

                {/* Right: details */}
                <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between min-w-0 pr-8 sm:pr-10">
                  <div>
                    {/* Name line */}
                    <div className="flex items-center gap-2">
                      <span className="font-nunito font-semibold text-base sm:text-lg text-text-primary truncate">
                        {info.name}
                      </span>
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: info.color }}
                        title={`Farba: ${info.color}`}
                      />
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
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        className="inline"
                      >
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </a>
                  </div>

                  {/* Count Stepper */}
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
                        {c.count}
                        <span className="text-sm font-medium font-inter lowercase">ks</span>
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
  );
}
