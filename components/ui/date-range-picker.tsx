"use client"

import { useEffect, useState } from "react"
import { DayPicker, type DateRange } from "react-day-picker"
import { ko, enUS } from "react-day-picker/locale"
import { Popover as PopoverPrimitive } from "radix-ui"
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function DateRangePicker({ range, onRangeChange, locale = "ko", size = "default", maxDate, onApply, applyLabel, error }: {
  range?: DateRange
  onRangeChange: (range: DateRange | undefined) => void
  locale?: "ko" | "en"
  size?: "default" | "sm"
  maxDate?: Date
  onApply?: (range: { from: Date; to: Date }) => boolean | void
  applyLabel?: string
  error?: string
}) {
  const latest = maxDate ? new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate()) : undefined
  const setRange = (next: DateRange | undefined | ((current: DateRange | undefined) => DateRange | undefined)) => onRangeChange(typeof next === "function" ? next(range) : next)
  const [open, setOpen] = useState(false)
  const [month, setMonth] = useState(range?.from || new Date())
  useEffect(() => { if (range?.from) setMonth(range.from) }, [range?.from?.getTime()])
  const [preset, setPreset] = useState<number | "week" | "month" | null>(null)
  const presets = [1, 0, "week", "month", 7, 30, 90] as const
  const format = (date: Date) => new Intl.DateTimeFormat(locale === "ko" ? "ko-KR" : "en-US", { month: "short", day: "numeric" }).format(date)
  function choosePreset(days: number | "week" | "month") {
    const end = new Date()
    end.setHours(0, 0, 0, 0)
    if (days === 0) end.setDate(end.getDate() - 1)
    const start = new Date(end)
    if (days === "week") {
      start.setDate(start.getDate() - (start.getDay() + 6) % 7)
      end.setTime(start.getTime())
      end.setDate(start.getDate() + 6)
    } else if (days === "month") {
      start.setDate(1)
      end.setMonth(end.getMonth() + 1, 0)
    } else {
      start.setDate(start.getDate() - Math.max(0, days - 1))
    }
    if (latest && end > latest) end.setTime(latest.getTime())
    if (start > end) start.setTime(end.getTime())
    setRange({ from: start, to: end })
    setMonth(start)
    setPreset(days)
  }
  function applyRange() {
    if (!range?.from || !range.to || !onApply) return
    if (onApply({ from: range.from, to: range.to }) !== false) setOpen(false)
  }
  return (
      <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
        <PopoverPrimitive.Trigger asChild>
          <Button variant="outline" size={size} className="max-w-full rounded-xl px-4" aria-label={locale === "ko" ? "날짜 범위 선택" : "Select date range"}>
            <CalendarDays className={size === "sm" ? "size-4" : "size-5"} aria-hidden="true" />
            {range?.from ? `${format(range.from)}${range.to && range.to.getTime() !== range.from.getTime() ? ` – ${format(range.to)}` : ""}` : locale === "ko" ? "날짜 선택" : "Choose dates"}
          </Button>
        </PopoverPrimitive.Trigger>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content align="center" sideOffset={8} collisionPadding={16} aria-label={locale === "ko" ? "기간 설정" : "Date range settings"} className="z-50 flex max-h-[min(80svh,var(--radix-popover-content-available-height,80svh))] w-[min(560px,calc(100vw-2rem))] flex-col overflow-hidden rounded-container border border-border bg-popover text-popover-foreground shadow-md">
            <div className="flex min-h-0 flex-col overflow-y-auto sm:flex-row">
            <div className="grid grid-cols-2 gap-1 border-b border-border p-3 sm:w-44 sm:shrink-0 sm:grid-cols-1 sm:border-r sm:border-b-0" role="group" aria-label={locale === "ko" ? "빠른 기간 선택" : "Quick date ranges"}>
              {presets.map((days) => <button key={days} type="button" aria-pressed={preset === days} onClick={() => choosePreset(days)} className={`rounded-xl px-3 py-2.5 text-left text-base focus-visible:outline-2 focus-visible:outline-ring ${preset === days ? "bg-tab-muted font-medium" : "hover:bg-tab-muted"}`}>{locale === "ko" ? days === "week" ? "이번 주" : days === "month" ? "이번 달" : days === 1 ? "오늘" : days === 0 ? "어제" : `최근 ${days}일` : days === "week" ? "This week" : days === "month" ? "This month" : days === 1 ? "Today" : days === 0 ? "Yesterday" : `Last ${days} days`}</button>)}
            </div>
            <DayPicker mode="range" selected={range} disabled={latest ? { after: latest } : undefined} endMonth={latest} onSelect={(value, date) => {
              if (latest && date > latest) return
              setRange((current) => !current?.from || current.to ? { from: date, to: undefined } : value)
              setPreset(null)
            }} month={month} onMonthChange={setMonth} locale={locale === "ko" ? ko : enUS} showOutsideDays fixedWeeks classNames={{
              root: "relative min-w-0 flex-1 p-4 text-base", disabled: "pointer-events-none opacity-35",
              months: "relative", month: "w-full", month_caption: "flex h-10 items-center justify-center", caption_label: "font-medium",
              nav: "absolute inset-x-0 top-0 flex justify-between", button_previous: "grid size-10 place-items-center rounded-xl hover:bg-tab-muted", button_next: "grid size-10 place-items-center rounded-xl hover:bg-tab-muted",
              month_grid: "w-full table-fixed border-collapse", weekday: "h-7 text-xs font-normal text-muted-foreground", day: "h-10 p-0 text-center [&:not([aria-selected=true])>button:hover]:bg-tab-muted", day_button: "mx-auto grid size-10 place-items-center rounded-xl focus-visible:outline-2 focus-visible:outline-ring",
              selected: !range?.to ? "[&>button]:bg-foreground [&>button]:text-background" : "",
              range_start: "[&>button]:bg-foreground [&>button]:text-background", range_end: "[&>button]:bg-foreground [&>button]:text-background", range_middle: "bg-tab-muted [&>button]:rounded-none", outside: "text-muted-foreground/50", today: "font-semibold", hidden: "invisible",
            }} components={{ Chevron: ({ orientation }) => orientation === "left" ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" /> }} />
            </div>
            {onApply && <div data-slot="date-range-footer" className="flex shrink-0 flex-wrap items-center justify-end gap-3 border-t border-border p-4">
              {error && <p role="alert" className="min-w-0 flex-1 text-base text-destructive">{error}</p>}
              <Button type="button" disabled={!range?.from || !range.to} onClick={applyRange}>{applyLabel || (locale === "ko" ? "적용" : "Apply")}</Button>
            </div>}
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
  )
}
