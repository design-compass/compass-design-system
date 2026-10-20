import * as React from "react"
import { cn } from "cn"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="skeleton" className={cn("skeleton-shimmer rounded-lg bg-tab-muted", className)} {...props} />
}

export { Skeleton }
