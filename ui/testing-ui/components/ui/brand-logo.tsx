/**
 * Brand Logo Component
 * Displays raxIT logo with separate assets for dark/light mode and responsive sizing
 */

"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

export interface BrandLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function BrandLogo({ className, size = "md" }: BrandLogoProps) {
  const sizeConfig = {
    sm: { width: 32, height: 32 },
    md: { width: 40, height: 40 },
    lg: { width: 48, height: 48 },
  };

  const { width, height } = sizeConfig[size];

  return (
    <div
      className={cn(
        "flex items-center justify-center shrink-0 select-none relative",
        className
      )}
      style={{ width, height }}
      role="img"
      aria-label="raxIT brand logo"
    >
      {/* Light mode logo */}
      <Image
        src="/raxIT_logo_no_words_logo_light.svg"
        alt="raxIT Logo"
        width={width}
        height={height}
        priority
        className="dark:hidden"
      />
      {/* Dark mode logo */}
      <Image
        src="/raxIT_logo_no_words_logo_dark.svg"
        alt="raxIT Logo"
        width={width}
        height={height}
        priority
        className="hidden dark:block"
      />
    </div>
  );
}
