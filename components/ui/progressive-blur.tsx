import type { CSSProperties } from "react"
import { cn } from "cn"
import styles from "@/components/ui/progressive-blur.module.css"

const layers = [
  { blur: 2, start: 55, end: 72 },
  { blur: 4, start: 65, end: 85 },
  { blur: 8, start: 75, end: 95 },
  { blur: 16, start: 85, end: 100 },
]

export function ProgressiveBlur({ className, src }: { className?: string; src?: string }) {
  return (
    <div className={cn(styles.overlay, className)} aria-hidden="true">
      {layers.map(({ blur, start, end }) => (
        <span key={blur} className={styles.layer} style={{
          "--progressive-blur": `${blur}px`,
          "--blur-start": `${start}%`,
          "--blur-end": `${end}%`,
        } as CSSProperties}>
          {src && <img src={src} alt="" draggable={false} className={styles.image} />}
        </span>
      ))}
    </div>
  )
}
