"use client"

import type { ComponentProps } from "react"
import { Button } from "@/components/ui/button"
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination"

type DotPaginationProps = Omit<ComponentProps<typeof Pagination>, "children"> & {
  pageCount: number
  page: number
  onPageChange: (page: number) => void
  getPageLabel?: (page: number) => string
}

function DotPagination({
  pageCount,
  page,
  onPageChange,
  getPageLabel = (value) => `Image ${value} of ${pageCount}`,
  ...props
}: DotPaginationProps) {
  const count = Math.max(0, Math.floor(pageCount))
  const currentPage = Math.min(count, Math.max(1, page))
  const visibleCount = Math.min(6, count)
  const dotStep = 12
  const windowStart = Math.min(Math.max(0, currentPage - 1 - Math.floor((visibleCount - 1) / 2)), count - visibleCount)

  return (
    <Pagination aria-label="Image pagination" data-slot="dot-pagination" {...props}>
      <div className="overflow-hidden py-1" style={{ width: visibleCount * dotStep }}>
        <PaginationContent
          className="w-max gap-0 transition-transform duration-200 ease-in-out motion-reduce:transition-none"
          style={{ transform: `translateX(-${windowStart * dotStep}px)` }}
        >
          {Array.from({ length: count }, (_, index) => {
            const value = index + 1
            const active = value === currentPage
            const visible = index >= windowStart && index < windowStart + visibleCount
            const dotSize = count <= 5 ? 8 : Math.max(2, 8 - Math.abs(value - currentPage) * 2)
            return (
              <PaginationItem key={value} aria-hidden={!visible || undefined} className="flex shrink-0 items-center justify-center">
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  className="size-3 rounded-full border-0"
                  aria-label={getPageLabel(value)}
                  aria-current={active ? "page" : undefined}
                  tabIndex={visible ? 0 : -1}
                  onClick={() => onPageChange(value)}
                >
                  <span
                    aria-hidden="true"
                    data-slot="dot-pagination-dot"
                    style={{ width: dotSize, height: dotSize }}
                    className={`shrink-0 rounded-full transition-[width,height,background-color] duration-200 ease-in-out motion-reduce:transition-none ${active ? "bg-foreground" : "bg-foreground/25 group-hover/button:bg-foreground/45"}`}
                  />
                </Button>
              </PaginationItem>
            )
          })}
        </PaginationContent>
      </div>
    </Pagination>
  )
}

export { DotPagination }
