import Link from "next/link";
import React from "react";

interface Props {
  isMobile?: boolean; // legacy support for Header.tsx
  hideTextOnMobile?: boolean;
}

const Logo = ({ isMobile, hideTextOnMobile = true }: Props) => {
  const shouldHideText = isMobile !== undefined ? isMobile : hideTextOnMobile;

  return (
    <Link href="/">
      <div className="flex gap-2 items-center cursor-pointer select-none">
        {/* Logo Icon */}
        <div className="h-8 w-8 rounded-xl bg-accent-primary flex items-center justify-center text-white shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            <path d="m10 10-2 2 2 2" />
            <path d="m14 14 2-2-2-2" />
          </svg>
        </div>
        {/* Text Logo */}
        <span
          className={`font-nunito text-xl font-bold tracking-tight flex items-baseline gap-1 ${
            shouldHideText ? "hidden sm:flex" : "flex"
          }`}
        >
          <span className="text-accent-primary">Farma</span>
          <span className="text-text-primary">Finik</span>
        </span>
      </div>
    </Link>
  );
};

export default Logo;
