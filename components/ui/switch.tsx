"use client"

import * as React from "react"
import { cn } from "cn"
import { Switch as SwitchPrimitive } from "radix-ui"

function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      data-corner="continuous"
      className={cn(
        "peer group/switch relative inline-flex shrink-0 cursor-pointer items-center rounded-full border-0 p-[5px] transition-colors duration-200 outline-none after:absolute after:inset-x-0 after:-inset-y-2 focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-[size=default]:h-7 data-[size=default]:w-15 data-[size=default]:p-1 data-[size=sm]:h-[26px] data-[size=sm]:w-14 data-checked:bg-primary data-unchecked:bg-tab-muted dark:aria-invalid:ring-destructive/40 data-disabled:cursor-not-allowed data-disabled:opacity-50 motion-reduce:transition-none",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        data-corner="continuous"
        className="pointer-events-none block shrink-0 rounded-full bg-white shadow-(--control-thumb-shadow) ring-0 transition-transform duration-200 ease-in-out group-data-[size=default]/switch:h-5 group-data-[size=default]/switch:w-8 group-data-[size=sm]/switch:h-4 group-data-[size=sm]/switch:w-7 group-data-[size=default]/switch:data-checked:translate-x-5 group-data-[size=sm]/switch:data-checked:translate-x-[18px] data-unchecked:translate-x-0 motion-reduce:transition-none"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
