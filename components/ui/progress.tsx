"use client"

import * as React from "react"
import { cn } from "cn"
import { Progress as ProgressPrimitive } from "radix-ui"

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      value={value}
      className={cn(
        "relative flex h-1 w-full items-center overflow-x-hidden rounded-full bg-muted [corner-shape:round]",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="h-full shrink-0 rounded-s-full rounded-e-none bg-primary transition-[width] duration-300 motion-reduce:transition-none [corner-shape:round]"
        style={{ width: `${Math.min(100, Math.max(0, value || 0))}%` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
