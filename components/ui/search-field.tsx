"use client"

import { useRef, type ComponentProps } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function SearchField({ value, onValueChange, clearLabel = "검색어 지우기", className, ...props }: Omit<ComponentProps<typeof Input>, "value" | "onChange" | "type" | "ref"> & { value: string; onValueChange: (value: string) => void; clearLabel?: string }) {
  const input = useRef<HTMLInputElement>(null)
  return <div className={`relative ${className || ""}`}>
    <Search aria-hidden="true" className="text-icon pointer-events-none absolute top-1/2 left-3 z-10 -translate-y-1/2 text-muted-foreground" />
    <Input {...props} ref={input} type="search" value={value} className="pl-9 pr-10 [&::-webkit-search-cancel-button]:appearance-none" onChange={event => onValueChange(event.target.value)} />
    {value && <Button variant="outline" size="icon-xs" aria-label={clearLabel} className="absolute top-1/2 right-2 -translate-y-1/2 border-0" onClick={() => { onValueChange(""); input.current?.focus() }}><X /></Button>}
  </div>
}
