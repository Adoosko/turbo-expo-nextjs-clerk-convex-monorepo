import { cn } from "@/lib/utils";

interface EggIconProps {
  className?: string;
  size?: number;
  filled?: boolean;
}

export default function EggIcon({ className, size = 14, filled = true }: EggIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      className={cn(filled && "fill-current", className)}
    >
      <path d="M12 2C6.5 2 2 10 2 15a10 10 0 0 0 20 0c0-5-4.5-13-10-13Z" />
    </svg>
  );
}
