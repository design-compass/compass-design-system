"use client";

/*
Slosh slider, adapted from Bencho (https://bencho.dev/licence).
MIT License
Copyright (c) 2026 Lorenzo Cabra

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import { useRef, useState } from "react"
import styles from "@/components/ui/slosh-slider.module.css"

const clamp = (value: number) => Math.max(0, Math.min(100, value))

export function SloshSlider({ label = "Flow", defaultValue = 62, onValueChange }: {
  label?: string
  defaultValue?: number
  onValueChange?: (value: number) => void
} = {}) {
  const [value, setValue] = useState(() => clamp(defaultValue))
  const held = useRef(false)
  const commit = (next: number) => {
    const bounded = clamp(next)
    setValue(bounded)
    onValueChange?.(bounded)
  }
  const readAt = (event: React.PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    if (bounds.width > 0) commit((event.clientX - bounds.left) / bounds.width * 100)
  }
  const release = () => { held.current = false }
  const handlePosition = `clamp(10px, ${value}%, calc(100% - 10px))`

  return <div className={styles.root}>
    <div className={styles.track} role="slider" tabIndex={0}
      aria-label={label} aria-orientation="horizontal"
      aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value)}
      onPointerDown={event => {
        if (!event.isPrimary || event.button !== 0) return
        event.preventDefault()
        event.currentTarget.focus()
        event.currentTarget.setPointerCapture(event.pointerId)
        held.current = true
        readAt(event)
      }}
      onPointerMove={event => { if (held.current) readAt(event) }}
      onPointerUp={event => {
        if (held.current) readAt(event)
        release()
      }}
      onPointerCancel={release} onLostPointerCapture={release} onBlur={release}
      onKeyDown={event => {
        const step = event.shiftKey ? 10 : 2
        const next = event.key === "Home" ? 0 : event.key === "End" ? 100
          : event.key === "ArrowRight" || event.key === "ArrowUp" ? value + step
          : event.key === "ArrowLeft" || event.key === "ArrowDown" ? value - step : null
        if (next === null) return
        event.preventDefault()
        commit(next)
      }}>
      <div className={styles.fill} style={{ width: value === 0 ? "0px" : `calc(${handlePosition} + 10px)` }} aria-hidden="true" />
      <div className={styles.knob} style={{ left: handlePosition }} aria-hidden="true" />
    </div>
  </div>
}
