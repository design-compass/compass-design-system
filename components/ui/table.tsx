import type { ComponentProps } from "react"
import { cn } from "cn"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"

export function Table({ className, density = "default", ...props }: ComponentProps<"table"> & { density?: "default" | "compact" }) {
  return <table data-slot="table" data-density={density} className={cn("w-full text-base", density === "compact" && "[&>tbody>tr>td:not([colspan])]:py-2.5", className)} {...props} />
}
export function TableHeader(props: ComponentProps<"thead">) { return <thead data-slot="table-header" {...props} /> }
export function TableBody(props: ComponentProps<"tbody">) { return <tbody data-slot="table-body" {...props} /> }
export function TableRow({ className, ...props }: ComponentProps<"tr">) {
  return <tr data-slot="table-row" className={cn("border-b border-border/50 last:border-0", className)} {...props} />
}
export function TableHead({ className, children, onSort, sortDirection = "none", ...props }: ComponentProps<"th"> & { onSort?: () => void; sortDirection?: "none" | "ascending" | "descending" }) {
  const Icon = sortDirection === "ascending" ? ArrowUp : sortDirection === "descending" ? ArrowDown : ArrowUpDown
  return <th data-slot="table-head" scope="col" aria-sort={onSort ? sortDirection : undefined} className={cn("border-b border-border px-2 py-3 text-left font-medium text-muted-foreground", className)} {...props}>{onSort ? <button type="button" onClick={onSort} className="inline-flex min-h-8 max-w-full items-center gap-1 rounded-sm text-inherit hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"><span>{children}</span><Icon className="text-icon" aria-hidden="true" /></button> : children}</th>
}
export function TableCell({ className, ...props }: ComponentProps<"td">) {
  return <td data-slot="table-cell" className={cn("px-2 py-3", className)} {...props} />
}
export function TableCaption({ className, ...props }: ComponentProps<"caption">) {
  return <caption data-slot="table-caption" className={cn("sr-only", className)} {...props} />
}
