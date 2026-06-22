import React from "react";
import { cn } from "@/lib/utils";

// Pomocná funkcia pre rôznorodosť vajíčok (svetlé, stredné, tmavé)
function getEggGradient(index: number) {
  const type = index % 3;
  if (type === 0) return "from-[#ECCBA6] to-[#BA8E60]"; // Svetlé
  if (type === 1) return "from-[#E7B583] to-[#A66E38]"; // Stredné
  return "from-[#D68F5B] to-[#995321]"; // Tmavé
}

export function EggTrayVisualizer({ stock }: { stock: number }) {
  const totalTrays = Math.floor(stock / 30) + 1;
  return (
    <div className="w-full relative mt-2 pt-2 pb-1 rounded-2xl bg-bg-base/70 border-0 overflow-hidden">
      {/* Drevený podstavec vzadu/dole (Wood shelf background) */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-b from-[#8C6D53] to-[#5C4033] border-t-2 border-[#A68A70] shadow-[inset_0_4px_4px_rgba(0,0,0,0.1)]" />

      {/* Horizontal scroll of trays */}
      <div className="flex gap-5 overflow-x-auto pb-6 pt-3 px-4 scrollbar-none snap-x snap-mandatory relative z-10">
        {Array.from({ length: totalTrays }).map((_, trayIdx) => {
          const eggsInThisTray = Math.min(30, Math.max(0, stock - trayIdx * 30));
          const isFull = eggsInThisTray === 30;
          const isActive = !isFull && trayIdx === Math.floor(stock / 30);

          return (
            <div
              key={trayIdx}
              className={cn(
                "snap-center flex-shrink-0 grid grid-cols-5 gap-1 p-2 bg-gradient-to-br from-[#D4C8B5] to-[#C5B7A1] rounded-xl select-none transition-all duration-300 relative shadow-[0_8px_16px_-6px_rgba(0,0,0,0.25)] border-[1.5px]",
                isFull
                  ? "border-[#B2A28C]"
                  : isActive
                    ? "border-accent-primary ring-2 ring-accent-primary/20 ring-offset-2 ring-offset-bg-surface"
                    : "border-[#C5B7A1] opacity-60"
              )}
            >
              {Array.from({ length: 30 }).map((_, slotIdx) => {
                const eggIndex = trayIdx * 30 + slotIdx;
                const hasEgg = slotIdx < eggsInThisTray;
                const gradient = getEggGradient(eggIndex);

                return (
                  <div
                    key={slotIdx}
                    className="w-[20px] h-[20px] rounded-full bg-gradient-to-b from-[#C4B4A1] to-[#EAE2D4] border border-[#B0A18F] flex items-center justify-center relative shadow-[inset_0_2px_4px_rgba(0,0,0,0.18)]"
                  >
                    {/* Realistic 3D egg when filled */}
                    {hasEgg && (
                      <div
                        className={cn(
                          "w-[16px] h-[20px] bg-gradient-to-b rounded-[50%_50%_50%_50%_/_65%_65%_35%_35%] transition-transform duration-300 hover:scale-110 hover:-rotate-3 hover:-translate-y-0.5 cursor-help absolute z-10 animate-fade-in",
                          gradient
                        )}
                        style={{
                          boxShadow: "0 3px 5px rgba(0,0,0,0.3), inset 0 1.5px 1px rgba(255,255,255,0.4)",
                        }}
                        title={`Vajce #${eggIndex + 1}`}
                      >
                        {/* Light reflection gloss */}
                        <div className="absolute top-0.5 left-1 w-1 h-1.5 bg-white/40 rounded-full -rotate-12 blur-[0.5px]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
