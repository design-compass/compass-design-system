"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Tabs as TabsPrimitive } from "radix-ui"

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(
        "group/tabs flex gap-2 data-horizontal:flex-col",
        className
      )}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  "group/tabs-list items-center justify-center rounded-full [--nested-radius:calc(var(--radius)*0.2)] [--nested-gap:3px] p-1 text-muted-foreground group-data-horizontal/tabs:h-10 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col data-[variant=line]:rounded-none",
  {
    variants: {
      variant: {
        default: "inline-flex w-fit max-w-full justify-start overflow-x-auto bg-tab-muted [--nested-gap:4px] p-1 group-data-horizontal/tabs:h-11",
        line: "inline-flex w-fit gap-1 bg-transparent",
        pills: "inline-flex w-fit max-w-full flex-wrap gap-1 bg-transparent p-0 group-data-horizontal/tabs:h-auto",
      },
      sizing: {
        content: "",
        fill: "",
      },
      size: {
        default: "",
        sm: "",
      },
    },
    compoundVariants: [
      { variant: "default", sizing: "fill", className: "w-full" },
      { variant: "default", size: "sm", className: "group-data-horizontal/tabs:h-8" },
    ],
    defaultVariants: {
      variant: "default",
      sizing: "content",
      size: "default",
    },
  }
)

function TabsList({
  className,
  variant = "default",
  sizing = "content",
  size = "default",
  children,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>) {
  const listRef = React.useRef<HTMLDivElement>(null)
  const [indicator, setIndicator] = React.useState<{
    left: number
    top: number
    width: number
    height: number
  } | null>(null)

  React.useLayoutEffect(() => {
    const list = listRef.current
    if (!list || variant !== "default") return

    const updateIndicator = () => {
      const active = list.querySelector<HTMLElement>(
        '[data-slot="tabs-trigger"][data-state="active"]'
      )
      if (!active) return
      // The indicator and triggers share the list's layout coordinates. Viewport
      // rectangles include ancestor scaling and would shrink the pill a second time.
      setIndicator({
        left: active.offsetLeft,
        top: active.offsetTop,
        width: active.offsetWidth,
        height: active.offsetHeight,
      })
    }

    const resizeObserver = new ResizeObserver(updateIndicator)
    const observeItems = () => {
      resizeObserver.observe(list)
      list.querySelectorAll<HTMLElement>('[data-slot="tabs-trigger"]').forEach((item) => resizeObserver.observe(item))
    }
    const observer = new MutationObserver(() => {
      observeItems()
      updateIndicator()
    })
    observer.observe(list, {
      subtree: true,
      attributes: true,
      attributeFilter: ["data-state"],
      childList: true,
      characterData: true,
    })
    observeItems()
    updateIndicator()

    return () => {
      observer.disconnect()
      resizeObserver.disconnect()
    }
  }, [variant, sizing, size])

  return (
    <TabsPrimitive.List
      ref={listRef}
      data-slot="tabs-list"
      data-variant={variant}
      data-sizing={sizing}
      data-size={size}
      className={cn("relative", tabsListVariants({ variant, sizing, size }), className)}
      {...props}
    >
      {variant === "default" && indicator && (
        <span
          aria-hidden="true"
          data-slot="tabs-indicator"
          className="pointer-events-none absolute z-0 rounded-full bg-background shadow-sm transition-[left,width] duration-200 ease-in-out dark:bg-[color-mix(in_oklch,var(--tab-muted),white_20%)] dark:shadow-[0_1px_2px_rgb(0_0_0_/_16%)]"
          style={indicator}
        />
      )}
      {children}
    </TabsPrimitive.List>
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
"relative z-10 inline-flex h-full min-h-8 w-auto min-w-max flex-none items-center justify-center gap-1.5 rounded-full border border-transparent px-2 py-0 text-base font-medium whitespace-nowrap text-foreground/60 transition-colors group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start not-disabled:hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 dark:text-muted-foreground dark:not-disabled:hover:text-foreground group-data-[variant=line]/tabs-list:rounded-md group-data-[variant=line]/tabs-list:data-active:shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent dark:group-data-[variant=line]/tabs-list:data-active:border-transparent dark:group-data-[variant=line]/tabs-list:data-active:bg-transparent",
        "data-active:text-foreground dark:data-active:border-transparent dark:data-active:text-foreground",
        "group-data-[variant=default]/tabs-list:min-h-9 group-data-[variant=default]/tabs-list:px-4 group-data-[variant=default]/tabs-list:py-0.5",
        "group-data-[variant=default]/tabs-list:data-[state=inactive]:not-disabled:not-aria-disabled:hover:bg-[color-mix(in_oklch,var(--tab-muted),black_8%)] dark:group-data-[variant=default]/tabs-list:data-[state=inactive]:not-disabled:not-aria-disabled:hover:bg-[color-mix(in_oklch,var(--tab-muted),white_8%)]",
        "group-[[data-variant=default][data-size=sm]]/tabs-list:min-h-6 group-[[data-variant=default][data-size=sm]]/tabs-list:text-sm group-[[data-variant=default][data-size=sm]]/tabs-list:px-3 group-[[data-variant=default][data-size=sm]]/tabs-list:py-0",
        "group-[[data-variant=default].w-full]/tabs-list:flex-1",
        "group-data-[variant=line]/tabs-list:w-full group-data-[variant=line]/tabs-list:min-w-0 group-data-[variant=line]/tabs-list:flex-1",
        "group-data-[variant=pills]/tabs-list:h-10 group-data-[variant=pills]/tabs-list:w-auto group-data-[variant=pills]/tabs-list:flex-none",
        "group-data-[variant=pills]/tabs-list:border-transparent group-data-[variant=pills]/tabs-list:bg-tab-muted group-data-[variant=pills]/tabs-list:px-4 group-data-[variant=pills]/tabs-list:data-active:bg-background group-data-[variant=pills]/tabs-list:data-active:text-foreground group-data-[variant=pills]/tabs-list:data-active:shadow-xs group-data-[variant=pills]/tabs-list:data-active:not-disabled:hover:text-foreground dark:group-data-[variant=pills]/tabs-list:data-active:bg-[color-mix(in_oklch,var(--tab-muted),white_20%)] dark:group-data-[variant=pills]/tabs-list:data-active:text-foreground",
        "group-data-[variant=pills]/tabs-list:data-[state=inactive]:not-disabled:not-aria-disabled:hover:bg-[color-mix(in_oklch,var(--tab-muted),black_8%)]",
        "group-data-[variant=pills]/tabs-list:data-active:inset-ring-1 group-data-[variant=pills]/tabs-list:data-active:inset-ring-foreground/10 dark:group-data-[variant=pills]/tabs-list:data-active:inset-ring-foreground/15",
        "after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:bottom-[-5px] group-data-horizontal/tabs:after:h-0.5 group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:-right-1 group-data-vertical/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-active:after:opacity-100",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
className={cn("flex-1 text-base outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
