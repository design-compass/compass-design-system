"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

export function FadeOverflow({ children, title }: { children: ReactNode; title?: string }) {
  const frameRef = useRef<HTMLSpanElement>(null)
  const contentRef = useRef<HTMLSpanElement>(null)
  const [overflow, setOverflow] = useState(false)

  useEffect(() => {
    const frame = frameRef.current
    const content = contentRef.current
    if (!frame || !content) return
    const measure = () => setOverflow(content.getBoundingClientRect().width > frame.clientWidth)
    measure()
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure)
      return () => window.removeEventListener("resize", measure)
    }
    const observer = new ResizeObserver(measure)
    observer.observe(frame)
    observer.observe(content)
    return () => observer.disconnect()
  }, [children])

  const mask = overflow ? "linear-gradient(to right, #000 max(0px, calc(100% - 32px)), transparent 100%)" : undefined
  return <span ref={frameRef} data-slot="fade-overflow" data-overflow={overflow} title={title} className="block min-w-0 overflow-hidden whitespace-nowrap" style={{ maskImage: mask, WebkitMaskImage: mask }}>
    <span ref={contentRef} className="inline-block">{children}</span>
  </span>
}
