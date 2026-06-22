import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  onConfirm: () => void;
  isLoading?: boolean;
}

export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Potvrdiť",
  cancelLabel = "Zrušiť",
  variant = "default",
  onConfirm,
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] bg-bg-surface rounded-3xl p-6 border border-border-default/30 shadow-none">
        <DialogHeader>
          <DialogTitle className="font-inter text-lg font-semibold text-text-primary">
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm font-medium text-text-muted">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="bg-bg-base/60 hover:bg-bg-base/80 text-text-primary font-semibold py-2 px-4 rounded-xl transition active:scale-[0.99] cursor-pointer"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            disabled={isLoading}
            className={variant === "danger"
              ? "bg-state-error hover:bg-state-error/90 text-white font-semibold py-2 px-4 rounded-xl transition active:scale-[0.99] cursor-pointer"
              : "bg-accent-primary hover:bg-accent-primary/90 text-white font-semibold py-2 px-4 rounded-xl transition active:scale-[0.99] cursor-pointer"
            }
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
