import { cn } from "@/lib/utils";
import EggIcon from "@/components/common/EggIcon";

interface ModuleSelectorProps {
  activeModuleId: string;
  setActiveModuleId: (id: string) => void;
}

export default function ModuleSelector({ activeModuleId, setActiveModuleId }: ModuleSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => setActiveModuleId("vajcia")}
        className={cn(
          "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-left cursor-pointer",
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
          <EggIcon size={14} />
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
  );
}
