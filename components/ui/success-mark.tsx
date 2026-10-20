"use client"

import { createLucideIcon } from "lucide-react"
import styles from "@/components/ui/success-mark.module.css"

const Check = createLucideIcon("SuccessCheck", [
  ["path", { d: "m4 12 5 5 11-11", key: "check" }],
])

export function SuccessMark({ label = "Success" }: { label?: string }) {
  return <span className={styles.mark} role="img" aria-label={label}>
    <span className={styles.disc} aria-hidden="true">
      <Check className={styles.check} strokeWidth={2.5} />
    </span>
    <span className={styles.burst} aria-hidden="true">
      {Array.from({ length: 8 }, (_, index) => <span key={index}
        className={styles.ray} style={{ transform: `rotate(${index * 45}deg)` }} />)}
    </span>
  </span>
}
