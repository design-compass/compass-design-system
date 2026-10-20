"use client"

import { DayPicker } from "react-day-picker"
import { ko, enUS } from "react-day-picker/locale"
import { ChevronLeft, ChevronRight } from "lucide-react"

function Calendar({
  selected,
  onSelect,
  language = "ko",
  today,
}: {
  selected?: Date
  onSelect: (date: Date | undefined) => void
  language?: "ko" | "en"
  today?: Date
}) {
  return (
    <DayPicker
      mode="single"
      selected={selected}
      onSelect={onSelect}
      defaultMonth={selected}
      today={today}
      locale={language === "ko" ? ko : enUS}
      showOutsideDays
      classNames={{
        root: "relative w-full max-w-64 text-sm",
        months: "relative",
        month: "w-full",
        month_caption: "flex h-8 items-center justify-center",
        caption_label: "font-medium",
        nav: "absolute inset-x-0 top-0 flex justify-between",
        button_previous:
          "grid size-8 place-items-center rounded-full hover:bg-tab-muted focus-visible:ring-2 focus-visible:ring-ring",
        button_next:
          "grid size-8 place-items-center rounded-full hover:bg-tab-muted focus-visible:ring-2 focus-visible:ring-ring",
        month_grid: "w-full table-fixed border-collapse",
        weekday: "h-6 text-xs font-normal text-muted-foreground",
        day: "h-7 p-0 text-center",
        day_button:
          "mx-auto grid size-7 place-items-center rounded-full hover:bg-tab-muted focus-visible:ring-2 focus-visible:ring-ring",
        selected: "[&>button]:bg-primary [&>button]:text-primary-foreground",
        today: "font-bold",
        outside: "text-muted-foreground/50",
        disabled: "opacity-30",
        hidden: "invisible",
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? (
            <ChevronLeft className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          ),
      }}
    />
  )
}

export { Calendar }
