"use client"

import { useEffect, useState } from "react"
import { createLucideIcon } from "lucide-react"
import NumberFlow from "@number-flow/react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import styles from "@/components/ui/clap-button.module.css"

const ClapIcon = createLucideIcon("Clap", [
  ["path", { d: "M16.462 7.841 Q17.805 6.195 19.191 7.668 C22.917 11.35 23.827 15.379 20.708 19.191 Q18.152 22.007 14.946 21.141", key: "rear-hand" }],
  ["path", { d: "M7.191 15.942 L4.592 13.343 Q3.292 12.477 2.643 14.036 Q1.949 15.119 3.206 16.375 L7.668 20.794 Q10.744 24.043 15.466 20.794 Q19.365 18.022 19.148 13.949 Q19.278 11.567 17.978 10.181 L15.162 7.365 Q13.646 6.282 12.736 7.321 Q11.957 8.231 13.213 9.531 L15.162 11.827 L9.097 5.762 Q7.365 3.942 6.498 5.588 Q5.675 6.368 6.888 7.625 L10.57 11.264 L5.805 6.498 Q4.505 5.199 3.596 6.498 Q2.773 7.321 4.116 8.621 L8.534 13.3 L4.722 9.487 Q3.249 8.664 2.599 9.834 Q1.906 10.744 3.162 12 L7.191 15.942", key: "front-hand" }],
])

export function ClapButton({ label = "Clap", defaultCount = 0, onClap, className }: {
  label?: string
  defaultCount?: number
  onClap?: () => void
  className?: string
}) {
  const [count, setCount] = useState(defaultCount)
  const [pulse, setPulse] = useState(0)
  useEffect(() => {
    if (!pulse) return
    const timer = setTimeout(() => setPulse(0), 750)
    return () => clearTimeout(timer)
  }, [pulse])

  return (
    <span className={cn(styles.root, className)} data-pointer-feedback="none">
      <span className={styles.control}>
        {pulse > 0 && <span key={pulse} className={styles.impacts} aria-hidden="true">
          {[0, 1, 2, 3, 4, 5].map(index => <span key={index} className={styles.tick} />)}
        </span>}
        <Button type="button" variant="outline" size="icon-lg" className={styles.button}
          data-pulsing={pulse > 0 || undefined}
          aria-label={label} onClick={() => {
            setCount(value => value + 1)
            setPulse(value => value + 1)
            onClap?.()
          }}>
          <span className={styles.hands} aria-hidden="true">
            <ClapIcon className={styles.icon} strokeWidth={1.7} />
          </span>
        </Button>
      </span>
      <span className={styles.count} role="status" aria-live="polite" aria-atomic="true" aria-label={label}>
        <span className="sr-only">{count.toLocaleString()}</span>
        <NumberFlow value={count} aria-hidden="true"
          transformTiming={{ duration: 1000, easing: "cubic-bezier(0.16, 1, 0.3, 1)" }}
          opacityTiming={{ duration: 250, easing: "ease-out" }}
          respectMotionPreference
          className="inline-block [--number-flow-mask-height:0.15em] [--number-flow-mask-width:0.25em]" />
      </span>
    </span>
  )
}
