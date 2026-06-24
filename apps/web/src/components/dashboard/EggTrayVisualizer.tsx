import React, { useState, useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Pomocná funkcia pre rôznorodosť vajíčok (svetlé, stredné, tmavé)
function getEggGradient(index: number) {
  const type = index % 3;
  if (type === 0) return "from-[#ECCBA6] to-[#BA8E60]"; // Svetlé
  if (type === 1) return "from-[#E7B583] to-[#A66E38]"; // Stredné
  return "from-[#D68F5B] to-[#995321]"; // Tmavé
}

// Syntetizovaný zvuk kliknutia/popu pomocou Web Audio API
function playPopSound(type: "add" | "remove") {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === "add") {
      // Jemný praskavý/bublinkový pop pri pridaní vajíčka
      osc.type = "sine";
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.04);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.12);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

      osc.start(now);
      osc.stop(now + 0.13);
    } else {
      // Jemne nižšie tónovaný, klesajúci zvuk pri odobratí
      osc.type = "sine";
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.05);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.14);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

      osc.start(now);
      osc.stop(now + 0.16);
    }
  } catch (error) {
    console.warn("Failed to play audio:", error);
  }
}

interface EggTrayVisualizerProps {
  stock: number;
  previewStock?: number;
}

export function EggTrayVisualizer({ stock, previewStock }: EggTrayVisualizerProps) {
  const displayStock = previewStock !== undefined ? previewStock : stock;
  
  // Vypočítame celkový počet balení (minimálne 1 prázdny balík ak je stav 0)
  const totalTrays = useMemo(() => {
    const maxVal = Math.max(0, displayStock);
    return Math.max(1, Math.floor((maxVal - 1) / 30) + 1);
  }, [displayStock]);

  const [pageIdx, setPageIdx] = useState<number | null>(null);

  // Zabezpečí, že sme vždy v platnom rozsahu a pri pridaní nového balíka skočíme na koniec
  const displayedPageIdx = useMemo(() => {
    if (pageIdx === null || pageIdx >= totalTrays) {
      return totalTrays - 1;
    }
    return pageIdx;
  }, [pageIdx, totalTrays]);

  // Automaticky skočí na najnovšie balenie, keď sa zmení počet balení
  useEffect(() => {
    setPageIdx(totalTrays - 1);
  }, [totalTrays]);

  // Detekcia zmeny počtu vajec pre zvukové efekty
  const prevStockRef = useRef(displayStock);
  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      prevStockRef.current = displayStock;
      return;
    }

    if (displayStock > prevStockRef.current) {
      playPopSound("add");
    } else if (displayStock < prevStockRef.current) {
      playPopSound("remove");
    }
    prevStockRef.current = displayStock;
  }, [displayStock]);

  const trayIdx = displayedPageIdx;
  const eggsInThisTray = Math.min(30, Math.max(0, displayStock - trayIdx * 30));
  const isFull = eggsInThisTray === 30;
  const isActive = !isFull && trayIdx === totalTrays - 1;

  return (
    <div className="w-full relative mt-2 pt-2 pb-1 rounded-2xl bg-bg-base/70 border border-border-default/30 overflow-hidden shadow-sm">
      {/* Drevený podstavec vzadu/dole (Wood shelf background) */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-b from-[#8C6D53] to-[#5C4033] border-t-2 border-[#A68A70] shadow-[inset_0_4px_4px_rgba(0,0,0,0.1)]" />

      {/* Paging controls header */}
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-border-default/15 text-xs font-semibold text-text-muted relative z-10 select-none">
        <button
          type="button"
          disabled={displayedPageIdx === 0}
          onClick={() => setPageIdx(displayedPageIdx - 1)}
          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-bg-surface border border-border-default/10 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
          title="Predchádzajúce balenie"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="font-inter font-bold text-text-primary">
          Balenie {displayedPageIdx + 1} z {totalTrays} <span className="font-normal text-text-muted">({displayStock} ks celkom)</span>
        </span>
        <button
          type="button"
          disabled={displayedPageIdx === totalTrays - 1}
          onClick={() => setPageIdx(displayedPageIdx + 1)}
          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-bg-surface border border-border-default/10 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
          title="Nasledujúce balenie"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Centered Tray Grid */}
      <div className="flex justify-center pb-6 pt-3 px-4 relative z-10">
        <div
          className={cn(
            "grid grid-cols-5 gap-1 p-2 bg-gradient-to-br from-[#D4C8B5] to-[#C5B7A1] rounded-xl select-none transition-all duration-300 relative shadow-[0_8px_16px_-6px_rgba(0,0,0,0.25)] border-[1.5px]",
            isFull
              ? "border-[#B2A28C]"
              : isActive
                ? "border-accent-primary ring-2 ring-accent-primary/20 ring-offset-2 ring-offset-bg-surface"
                : "border-[#C5B7A1]"
          )}
        >
          {Array.from({ length: 30 }).map((_, slotIdx) => {
            const eggIndex = trayIdx * 30 + slotIdx;
            const isFilled = slotIdx < eggsInThisTray;
            const gradient = getEggGradient(eggIndex);

            // Zistíme, či vajíčko bolo pridané ako náhľad (previewStock)
            const isPreviewAdded = previewStock !== undefined && previewStock > stock && eggIndex >= stock && eggIndex < previewStock;

            return (
              <div
                key={slotIdx}
                className="w-[20px] h-[20px] rounded-full bg-gradient-to-b from-[#C4B4A1] to-[#EAE2D4] border border-[#B0A18F] flex items-center justify-center relative shadow-[inset_0_2px_4px_rgba(0,0,0,0.18)]"
              >
                {/* 3D egg component - always rendered for stable exit animation via CSS scale */}
                <div
                  className={cn(
                    "w-[16px] h-[20px] bg-gradient-to-b rounded-[50%_50%_50%_50%_/_65%_65%_35%_35%] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] absolute z-10 hover:scale-115 hover:-rotate-3 hover:-translate-y-0.5 cursor-help",
                    gradient,
                    isFilled 
                      ? "scale-100 opacity-100 translate-y-0" 
                      : "scale-0 opacity-0 translate-y-2 pointer-events-none",
                    isPreviewAdded && "animate-pulse" // Pulzujúce vajíčko pri preview stave pred uložením
                  )}
                  style={{
                    boxShadow: "0 3px 5px rgba(0,0,0,0.3), inset 0 1.5px 1px rgba(255,255,255,0.4)",
                  }}
                  title={`Vajce #${eggIndex + 1}`}
                >
                  {/* Light reflection gloss */}
                  <div className="absolute top-0.5 left-1 w-1 h-1.5 bg-white/40 rounded-full -rotate-12 blur-[0.5px]" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
