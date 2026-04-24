"use client";

import { HugeiconsIcon, type HugeiconsIconProps } from "@hugeicons/react";
import { cn } from "@/lib/utils";

/**
 * EDIS icon wrapper around HugeiconsIcon.
 * Defaults match the design system: stroke 1.5, 18px render size, currentColor.
 * Override via props when a specific call-site needs a different size/weight.
 */
export function Icon({
  size = 18,
  strokeWidth = 1.5,
  className,
  ...rest
}: HugeiconsIconProps) {
  return (
    <HugeiconsIcon
      size={size}
      strokeWidth={strokeWidth}
      className={cn("shrink-0", className)}
      {...rest}
    />
  );
}
