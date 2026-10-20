"use client"

import { useEffect, useRef, useState, type RefObject } from "react"
import NumberFlow from "@number-flow/react"
import { cn } from "cn"
export type TextMotionVariant =
  | "count"
  | "rolling"
  | "typewriter"
  | "stagger"
  | "reveal"
  | "fade"
  | "rotate"
  | "scramble"
  | "marquee"
  | "highlight"

export const motionProgress = (value: number) =>
  Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0
export const motionEase = (value: number) =>
  1 - (1 - motionProgress(value)) ** 3
export function motionNumber(from: number, to: number, progress: number) {
  return Math.round(from + (to - from) * motionEase(progress))
}
export function scrambleText(text: string, progress: number) {
  progress = motionProgress(progress)
  const letters = Array.from(text)
  const resolved = Math.floor(motionProgress(progress) * letters.length)
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  return letters
    .map((letter, index) =>
      index < resolved || /\s|[.,!?]/u.test(letter)
        ? letter
        : alphabet[
            (index * 17 + Math.floor(progress * 40) * 7) % alphabet.length
          ]
    )
    .join("")
}

function useMotionProgress(
  ref: RefObject<HTMLSpanElement | null>,
  duration: number,
  loop: boolean,
  paused: boolean
) {
  const [progress, setProgress] = useState(0)
  const elapsed = useRef(0)
  useEffect(() => {
    const element = ref.current
    if (!element) return
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)")
    const length = Number.isFinite(duration) && duration > 0 ? duration : 2000
    let frame = 0
    let previous: number | undefined
    let visible = false
    let finished = false
    function stop() {
      cancelAnimationFrame(frame)
      frame = 0
      previous = undefined
    }
    function tick(timestamp: number) {
      frame = 0
      if (previous !== undefined) elapsed.current += timestamp - previous
      previous = timestamp
      const next = loop
        ? (elapsed.current % length) / length
        : Math.min(1, elapsed.current / length)
      setProgress(next)
      if (!loop && next === 1) {
        finished = true
        return
      }
      frame = requestAnimationFrame(tick)
    }
    function sync() {
      stop()
      if (preference.matches) {
        setProgress(1)
        return
      }
      if (visible && !paused && !document.hidden && !finished)
        frame = requestAnimationFrame(tick)
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        sync()
      },
      { threshold: 0.15 }
    )
    observer.observe(element)
    preference.addEventListener("change", sync)
    document.addEventListener("visibilitychange", sync)
    return () => {
      stop()
      observer.disconnect()
      preference.removeEventListener("change", sync)
      document.removeEventListener("visibilitychange", sync)
    }
  }, [ref, duration, loop, paused])
  return progress
}

export function TextMotion({
  variant,
  text = "Build with care.",
  phrases = [text],
  from = 0,
  to = 12840,
  duration = 2200,
  paused = false,
  locale = "en",
  formatNumber,
  decoration = "highlight",
  className,
}: {
  variant: TextMotionVariant
  text?: string
  phrases?: string[]
  from?: number
  to?: number
  duration?: number
  paused?: boolean
  locale?: string
  formatNumber?: (value: number) => string
  decoration?: "highlight" | "underline"
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const loop = variant === "rotate" || variant === "marquee"
  const progress = useMotionProgress(ref, duration, loop, paused)
  const format =
    formatNumber ??
    ((value: number) => new Intl.NumberFormat(locale).format(value))
  const finalNumber = format(to)
  const rollingValue = progress >= 0.05 ? to : from
  const words = text.split(" ")
  const choices = phrases.length ? phrases : [text]
  const phraseIndex = Math.min(
    choices.length - 1,
    Math.floor(progress * choices.length)
  )
  const phase = (progress * choices.length) % 1
  const phraseVisibility =
    progress === 1 || paused ? 1 : Math.min(1, phase / 0.12, (1 - phase) / 0.12)
  const accessibleText =
    variant === "count" || variant === "rolling"
      ? finalNumber
      : variant === "rotate"
        ? choices.join(". ")
        : text
  return (
    <span
      ref={ref}
      data-slot="text-motion"
      data-motion={variant}
      data-progress={progress.toFixed(3)}
      className={cn(
        "relative block w-full min-w-0 text-center text-2xl leading-snug font-semibold",
        className
      )}
    >
      <span className="sr-only">{accessibleText}</span>
      <span aria-hidden="true" className="block">
        {variant === "count" && (
          <span className="tabular-nums">
            {format(motionNumber(from, to, progress))}
          </span>
        )}
        {variant === "rolling" && (
          <NumberFlow
            value={rollingValue}
            locales={locale}
            transformTiming={{
              duration: Math.min(duration, 1000),
              easing: "cubic-bezier(0.16, 1, 0.3, 1)",
            }}
            opacityTiming={{ duration: 250, easing: "ease-out" }}
            respectMotionPreference
            className="inline-block leading-none tabular-nums [--number-flow-mask-height:0.15em] [--number-flow-mask-width:0.25em]"
          />
        )}
        {variant === "typewriter" && (
          <span className="relative block">
            <span className="invisible">{text}</span>
            <span className="absolute inset-0">
              {Array.from(text)
                .slice(0, Math.floor(progress * Array.from(text).length))
                .join("")}
              <span
                className="ml-0.5 border-r-2 border-primary"
                style={{ opacity: progress < 1 ? 1 : 0 }}
              />
            </span>
          </span>
        )}
        {variant === "scramble" && <span>{scrambleText(text, progress)}</span>}
        {variant === "fade" && (
          <span className="block" style={{ opacity: motionEase(progress) }}>
            {text}
          </span>
        )}
        {variant === "stagger" &&
          Array.from(text).map((letter, index, letters) => {
            const local = motionEase(
              (progress - (index / Math.max(1, letters.length)) * 0.65) / 0.35
            )
            return (
              <span
                key={index}
                className="inline-block whitespace-pre"
                style={{
                  opacity: local,
                  transform: `translateY(${(1 - local) * 8}px)`,
                }}
              >
                {letter}
              </span>
            )
          })}
        {variant === "reveal" &&
          words.map((word, index) => {
            const local = motionEase(
              (progress - (index / words.length) * 0.6) / 0.4
            )
            return (
              <span
                key={index}
                className="mr-[0.25em] inline-block py-[0.12em] align-bottom last:mr-0"
                style={{
                  maskImage:
                    "linear-gradient(to bottom, transparent, black 16%, black 84%, transparent)",
                }}
              >
                <span
                  className="inline-block"
                  style={{
                    opacity: local,
                    transform: `translateY(${(1 - local) * 110}%)`,
                  }}
                >
                  {word}
                </span>
              </span>
            )
          })}
        {variant === "rotate" && (
          <span
            className="relative block overflow-hidden py-[0.12em]"
            style={{
              maskImage:
                "linear-gradient(to bottom, transparent, black 16%, black 84%, transparent)",
            }}
          >
            <span className="invisible grid">
              {choices.map((phrase, index) => (
                <span key={index} className="col-start-1 row-start-1">
                  {phrase}
                </span>
              ))}
            </span>
            <span
              className="absolute inset-0 flex items-center justify-center"
              style={{
                opacity: phraseVisibility,
                transform: `translateY(${(1 - phraseVisibility) * 100}%)`,
              }}
            >
              {choices[phraseIndex]}
            </span>
          </span>
        )}
        {variant === "marquee" && progress === 1 && (
          <span className="block">{text}</span>
        )}
        {variant === "marquee" && progress !== 1 && (
          <span className="block overflow-hidden">
            <span
              className="flex w-max"
              style={{
                transform: `translateX(-${progress === 1 ? 0 : progress * 50}%)`,
              }}
            >
              {[0, 1].map((copy) => (
                <span
                  key={copy}
                  className="flex shrink-0 items-center gap-6 pr-6 whitespace-nowrap"
                >
                  <span>{text}</span>
                  <span className="size-1.5 rounded-full bg-primary" />
                </span>
              ))}
            </span>
          </span>
        )}
        {variant === "highlight" && (
          <span className="relative inline-block">
            <span
              className={cn(
                "absolute right-0 bottom-0 left-0 origin-left",
                decoration === "underline"
                  ? "h-0.5 bg-primary"
                  : "h-[0.65em] bg-primary/20"
              )}
              style={{ transform: `scaleX(${motionEase(progress)})` }}
            />
            <span className="relative">{text}</span>
          </span>
        )}
      </span>
    </span>
  )
}
