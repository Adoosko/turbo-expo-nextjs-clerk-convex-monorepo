import Link from "next/link";
import React from "react";

interface Props {
  isMobile?: boolean; // legacy support for Header.tsx
  hideTextOnMobile?: boolean;
}

const Logo = ({ isMobile, hideTextOnMobile = true }: Props) => {
  return (
    <Link href="/">
      <div className="flex items-center cursor-pointer select-none group">
        {/* Text Logo Only */}
        <span className="font-nunito text-xl sm:text-2xl font-extrabold tracking-tight flex items-baseline select-none">
          <span className="text-accent-primary transition-colors duration-200 group-hover:text-accent-primary/80">Farma</span>
          <span className="text-text-primary">Finik</span>
          <span className="w-1.5 h-1.5 rounded-full bg-accent-warm ml-1" />
        </span>
      </div>
    </Link>
  );
};

export default Logo;
