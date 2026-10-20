"use client"

import { useEffect, useState, type CSSProperties } from "react"
import { Heart } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import styles from "@/components/ui/like-button.module.css"

const petals = [
  [-28, -18, -20, 11], [-8, -36, -12, 13],
  [25, -27, 18, 12], [34, 10, 22, 11], [-24, 26, -18, 10],
]

export function LikeButton({
  defaultLiked = false,
  onLikedChange,
  label = "Like",
  unlikeLabel = "Unlike",
  className,
}: {
  defaultLiked?: boolean
  onLikedChange?: (liked: boolean) => void
  label?: string
  unlikeLabel?: string
  className?: string
}) {
  const [liked, setLiked] = useState(defaultLiked)
  const [burst, setBurst] = useState(0)
  useEffect(() => {
    if (!burst) return
    const timer = setTimeout(() => setBurst(0), 1000)
    return () => clearTimeout(timer)
  }, [burst])
  const action = liked ? unlikeLabel : label

  return (
    <span className={cn(styles.root, className)} data-pointer-feedback="none">
      {burst > 0 && (
        <span key={burst} className={styles.particles} aria-hidden="true">
          {petals.map(([x, y, turn, size], index) => (
            <Heart key={index} className={styles.particle} fill="currentColor" strokeWidth={0}
              style={{ "--heart-x": `${x}px`, "--heart-y": `${y}px`, "--heart-turn": `${turn}deg`, "--heart-size": `${size}px`, "--heart-delay": `${index % 3 * 24}ms` } as CSSProperties} />
          ))}
        </span>
      )}
      <Button type="button" variant="outline" size="icon-lg"
        className={styles.button} data-liked={liked || undefined}
        aria-label={action} aria-pressed={liked}
        onClick={() => {
          const next = !liked
          setLiked(next)
          setBurst(next ? (value) => value + 1 : 0)
          onLikedChange?.(next)
        }}>
        <span className={styles.heart} aria-hidden="true">
          <Heart className={styles.outline} fill="none" />
          <Heart className={styles.fill} fill="currentColor" strokeWidth={0} />
        </span>
      </Button>
    </span>
  )
}
