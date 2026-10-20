import * as React from "react"
import { cn } from "cn"

function Input({ className, type, controlSize = "default", ...props }: React.ComponentProps<"input"> & { controlSize?: "default" | "sm" }) {
  return (
    <input
      type={type}
      data-slot="input"
      data-control-size={controlSize}
      className={cn(
"h-10 min-h-10 w-full min-w-0 rounded-xl border border-input bg-transparent px-[calc(.625rem+4pt)] py-[4pt] text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-transparent dark:disabled:bg-transparent dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        controlSize === "sm" && "h-8 min-h-8 py-1 text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
