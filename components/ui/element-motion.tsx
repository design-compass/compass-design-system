"use client"

import { useRef, type ReactNode } from "react"
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
  type TargetAndTransition,
} from "motion/react"
import { cn } from "cn"

export type ElementMotionVariant =
  "fade" | "slide" | "scale" | "pop" | "mask" | "blur" | "bounce"
export function elementMotionStates(
  variant: ElementMotionVariant,
  reduced = false
) {
  const opacity = { opacity: 0 }
  const visible = { opacity: 1 }
  const states: Record<
    ElementMotionVariant,
    {
      initial: TargetAndTransition
      animate: TargetAndTransition
      exit: TargetAndTransition
    }
  > = {
    fade: { initial: opacity, animate: visible, exit: opacity },
    slide: {
      initial: { ...opacity, x: 56 },
      animate: { ...visible, x: 0 },
      exit: { ...opacity, x: -56 },
    },
    scale: {
      initial: { ...opacity, scale: 0.65 },
      animate: { ...visible, scale: 1 },
      exit: { ...opacity, scale: 0.65 },
    },
    pop: {
      initial: { ...opacity, scale: 0.6 },
      animate: { ...visible, scale: [0.6, 1.12, 1] },
      exit: { ...opacity, scale: 0.8 },
    },
    mask: {
      initial: { clipPath: "inset(0 100% 0 0)" },
      animate: { clipPath: "inset(0 0% 0 0)" },
      exit: { clipPath: "inset(0 0 0 100%)" },
    },
    blur: {
      initial: { ...opacity, filter: "blur(12px)" },
      animate: { ...visible, filter: "blur(0px)" },
      exit: { ...opacity, filter: "blur(12px)" },
    },
    bounce: {
      initial: { y: 0 },
      animate: { y: [0, -20, 0, -8, 0] },
      exit: opacity,
    },
  }
  return reduced
    ? { initial: visible, animate: visible, exit: opacity }
    : states[variant]
}

export function ElementMotion({
  variant,
  visible = true,
  children,
  className,
}: {
  variant: ElementMotionVariant
  visible?: boolean
  children: ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { amount: 0.2 })
  const reduced = useReducedMotion()
  const states = elementMotionStates(variant, Boolean(reduced))
  return (
    <div
      ref={ref}
      data-slot="element-motion"
      data-motion={variant}
      className={cn(
        "flex h-36 w-full items-center justify-center overflow-hidden",
        className
      )}
    >
      <AnimatePresence>
        {visible && (
          <motion.div
            key={variant}
            data-slot="motion-element"
            initial={states.initial}
            animate={inView ? states.animate : states.initial}
            exit={states.exit}
            transition={{
              duration: reduced ? 0 : variant === "bounce" ? 0.85 : 0.55,
              ease: "easeOut",
            }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
