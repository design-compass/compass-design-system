"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

const buttonVariants = cva(
"group/button relative isolate inline-flex shrink-0 origin-center appearance-none items-center justify-center rounded-full border border-transparent bg-clip-padding py-[4pt] text-base font-medium whitespace-nowrap transition-all duration-150 ease-out outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-disabled:not-aria-disabled:scale-[0.80] motion-reduce:active:scale-100 motion-reduce:transition-none disabled:cursor-not-allowed aria-disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground not-disabled:not-aria-disabled:hover:bg-primary-hover not-disabled:not-aria-disabled:hover:[&:not([data-size^=icon])]:text-[color-mix(in_oklch,var(--primary-foreground),transparent_20%)]",
        outline:
          "border-border bg-transparent not-disabled:not-aria-disabled:hover:bg-black/5 not-disabled:not-aria-disabled:hover:text-foreground not-disabled:not-aria-disabled:hover:[&:not([data-size^=icon])]:text-[color-mix(in_oklch,var(--foreground),transparent_20%)] aria-expanded:text-foreground dark:border-input dark:not-disabled:not-aria-disabled:hover:bg-white/5",
        secondary:
          "bg-button-secondary text-primary not-disabled:not-aria-disabled:hover:bg-button-secondary-hover not-disabled:not-aria-disabled:hover:[&:not([data-size^=icon])]:text-[color-mix(in_oklch,var(--primary),transparent_20%)] aria-expanded:bg-button-secondary aria-expanded:text-primary",
        tertiary:
          "bg-tab-muted text-secondary-foreground not-disabled:not-aria-disabled:hover:bg-[color-mix(in_oklch,var(--tab-muted),black_8%)] not-disabled:not-aria-disabled:hover:[&:not([data-size^=icon])]:text-[color-mix(in_oklch,var(--secondary-foreground),transparent_20%)] aria-expanded:bg-tab-muted aria-expanded:text-secondary-foreground",
        destructive:
          "bg-destructive/10 text-destructive not-disabled:not-aria-disabled:hover:bg-destructive/20 not-disabled:not-aria-disabled:hover:[&:not([data-size^=icon])]:text-[color-mix(in_oklch,var(--destructive),transparent_20%)] focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:not-disabled:not-aria-disabled:hover:bg-black/20 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 not-disabled:not-aria-disabled:hover:text-primary-hover not-disabled:not-aria-disabled:hover:[&:not([data-size^=icon])]:text-[color-mix(in_oklch,var(--primary),transparent_20%)] not-disabled:not-aria-disabled:hover:underline",
      },
      size: {
        default:
          "h-10 w-fit gap-2 px-5 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        xs: "h-6 w-fit gap-1.5 px-2.5 py-0 text-xs in-data-[slot=button-group]:rounded-full has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 w-fit gap-2 px-3 py-1 text-sm in-data-[slot=button-group]:rounded-full has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-14 w-fit gap-2.5 px-8 text-lg has-data-[icon=inline-end]:pr-6 has-data-[icon=inline-start]:pl-6 [&_svg:not([class*='size-'])]:size-5",
        icon: "size-10 p-0",
        "icon-xs":
          "size-6 p-0 in-data-[slot=button-group]:rounded-full [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-8 p-0 in-data-[slot=button-group]:rounded-full",
        "icon-lg": "size-14 p-0 [&_svg:not([class*='size-'])]:size-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  onPointerEnter,
  onPointerMove,
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  onPointerCancel,
  onClick,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
}) {
  const Comp = asChild ? Slot.Root : "button"
  const releaseTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const rippleTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const customBackground = props.style?.backgroundColor ?? props.style?.background
  const customForeground = props.style?.color ?? "var(--foreground)"
  const pointerStyle = typeof customBackground === "string" && !/gradient|url\(/.test(customBackground)
    ? {
        "--button-glow-center": variant === "outline"
          ? `color-mix(in oklch, ${customForeground}, transparent 92%)`
          : `color-mix(in oklch, ${customBackground}, white 8%)`,
        "--button-glow-edge": variant === "outline"
          ? `color-mix(in oklch, ${customForeground}, transparent 98%)`
          : `color-mix(in oklch, ${customBackground}, black 12%)`,
        ...props.style,
      } as React.CSSProperties
    : props.style

  React.useEffect(() => () => {
    if (releaseTimer.current !== null) clearTimeout(releaseTimer.current)
    if (rippleTimer.current !== null) clearTimeout(rippleTimer.current)
  }, [])

  function clearReleaseTimer() {
    if (releaseTimer.current !== null) {
      clearTimeout(releaseTimer.current)
      releaseTimer.current = null
    }
  }

  function updatePointer(event: React.PointerEvent<HTMLButtonElement>) {
    const target = event.currentTarget
    if (event.defaultPrevented || target.matches(":disabled, [disabled], [aria-disabled=true], [data-disabled]")) return
    clearReleaseTimer()
    const rect = target.getBoundingClientRect()
    if (!rect.width || !rect.height) return
    const x = Math.max(0, Math.min(100, (event.clientX - rect.left) / rect.width * 100))
    const y = Math.max(0, Math.min(100, (event.clientY - rect.top) / rect.height * 100))
    target.style.setProperty("--button-pointer-x", `${x}%`)
    target.style.setProperty("--button-pointer-y", `${y}%`)
    target.dataset.pointerActive = "true"
  }

  function clearPointer(target: HTMLElement) {
    clearReleaseTimer()
    delete target.dataset.pointerActive
  }

  function ripple(target: HTMLElement, x = 50, y = 50) {
    if (target.matches(":disabled, [disabled], [aria-disabled=true], [data-disabled]") ||
      target.ownerDocument?.defaultView?.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const rect = target.getBoundingClientRect()
    const width = target.offsetWidth || rect.width
    const height = target.offsetHeight || rect.height
    if (!width || !height) return
    if (rippleTimer.current !== null) clearTimeout(rippleTimer.current)
    target.style.setProperty("--button-ripple-x", `${x}%`)
    target.style.setProperty("--button-ripple-y", `${y}%`)
    target.style.setProperty("--button-ripple-size", `${Math.hypot(Math.max(x, 100 - x) * width / 100, Math.max(y, 100 - y) * height / 100)}px`)
    delete target.dataset.rippleActive
    // Restart the single paint layer on repeated presses without adding DOM children.
    void target.offsetWidth
    target.dataset.rippleActive = "true"
    rippleTimer.current = setTimeout(() => {
      delete target.dataset.rippleActive
      rippleTimer.current = null
    }, 650)
  }

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      data-button-kind={size?.startsWith("icon") ? "icon" : "text"}
      data-corner={size?.startsWith("icon") ? "round" : "continuous"}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
      style={pointerStyle}
      onPointerEnter={(event) => {
        onPointerEnter?.(event)
        if (event.pointerType !== "touch") updatePointer(event)
      }}
      onPointerMove={(event) => {
        onPointerMove?.(event)
        updatePointer(event)
      }}
      onPointerDown={(event) => {
        onPointerDown?.(event)
        updatePointer(event)
        if (event.defaultPrevented || (event.button != null && event.button !== 0)) return
        const rect = event.currentTarget.getBoundingClientRect()
        if (rect.width && rect.height) {
          ripple(event.currentTarget,
            Math.max(0, Math.min(100, (event.clientX - rect.left) / rect.width * 100)),
            Math.max(0, Math.min(100, (event.clientY - rect.top) / rect.height * 100)))
        }
      }}
      onPointerUp={(event) => {
        onPointerUp?.(event)
        const target = event.currentTarget
        if (event.pointerType === "touch") {
          clearReleaseTimer()
          releaseTimer.current = setTimeout(() => clearPointer(target), 160)
        } else if (!target.matches(":hover")) {
          clearPointer(target)
        }
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event)
        if (event.pointerType !== "touch") clearPointer(event.currentTarget)
      }}
      onPointerCancel={(event) => {
        onPointerCancel?.(event)
        clearPointer(event.currentTarget)
      }}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented && event.detail === 0) ripple(event.currentTarget)
      }}
    />
  )
}

export { Button, buttonVariants }
