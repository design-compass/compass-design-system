"use client"

import { type ComponentProps } from "react"
import { cn } from "cn"

type TocItem = { id: string; label: string; depth?: number }
type TableOfContentsProps = Omit<ComponentProps<"nav">, "children"> & {
  items: TocItem[]
  activeId?: string
  onNavigate?: (id: string) => void
}

function TableOfContents({
  items,
  activeId,
  onNavigate,
  className,
  ...props
}: TableOfContentsProps) {
  return (
    <nav
      aria-label="Table of Contents"
      data-slot="table-of-contents"
      className={cn("grid w-full gap-1 text-base", className)}
      {...props}
    >
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          aria-current={activeId === item.id ? "location" : undefined}
          className={cn(
            "relative flex min-h-10 items-center rounded-xl px-3 py-2 text-muted-foreground transition-colors hover:bg-tab-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
            activeId === item.id && "text-foreground"
          )}
          aria-label={item.label}
          style={{ paddingLeft: 12 + Math.max(0, Math.min(5, item.depth ?? 0)) * 8 }}
          onClick={(event) => {
            if (onNavigate) {
              event.preventDefault()
              onNavigate(item.id)
            }
          }}
        >
          {item.label}
        </a>
      ))}
    </nav>
  )
}

export { TableOfContents }
export type { TocItem, TableOfContentsProps }
