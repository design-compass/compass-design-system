"use client"

/* Adapted from Bencho's Tilt card, MIT licensed.
 * Copyright (c) 2026 Lorenzo Cabra
 * https://bencho.dev/licence
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import type { CSSProperties, KeyboardEvent, PointerEvent } from "react"
import "./tilt-card.css"

const DEFAULT_IMAGE = "/images/dufy-garden.webp"

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const mix = (a: number, b: number, t: number) => a + (b - a) * t

/* Frames, not milliseconds. Raising damping to dt means a dropped frame
   decays the same energy as the frames it replaced. The loop parks as soon
   as both the delta and velocity settle instead of running forever. */
const springOf = (tune: number) => ({
  k: 0.08 + (tune / 100) * 0.16,
  d: 0.62 + (tune / 100) * 0.2,
})

/* The pair is chosen by damping ratio: zeta = -ln(d) / (2 * sqrt(k)).
   0 is heavy with little ring, 50 is the original tuning, and 100 is lively
   with visible rebounds. Units matter: work in 0..100 so a 0.02 snap
   threshold does not stop a normalised 0..1 value before it visibly moves. */
function useSpring(target: number, tune = 50) {
  const [at, setAt] = useState(target)
  const cur = useRef(target)
  const vel = useRef(0)

  useEffect(() => {
    const { k, d } = springOf(tune)
    let raf = 0
    let prev = 0
    const tick = (time: number) => {
      const dt = prev ? clamp((time - prev) / 16.67, 0, 2.5) : 1
      prev = time
      vel.current += (target - cur.current) * k * dt
      vel.current *= Math.pow(d, dt)
      cur.current += vel.current * dt
      if (Math.abs(target - cur.current) < 0.02 && Math.abs(vel.current) < 0.02) {
        cur.current = target
        vel.current = 0
        setAt(target)
        return
      }
      setAt(cur.current)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // Tune belongs here too: changing it mid-flight resumes from the refs.
  }, [target, tune])

  return at
}

const motionQuery = "(prefers-reduced-motion: reduce)"
function subscribeMotion(listener: () => void) {
  const media = window.matchMedia(motionQuery)
  media.addEventListener("change", listener)
  return () => media.removeEventListener("change", listener)
}
const getMotionPreference = () => window.matchMedia(motionQuery).matches
const getServerMotionPreference = () => false

/* Perspective 800 is about two and a half original card heights back:
   noticeable foreshortening without a fisheye. A 14px retreat reads as a
   gentle press; beyond about 20px it starts reading as a zoom instead. */
const DEPTH = 800
const SINK = 14

type TiltCardProps = {
  tilt?: number
  corner?: number
  shade?: number
  width?: number
  imageSrc?: string
  label?: string
}

export function TiltCard({
  tilt = 10,
  corner = 20,
  shade = 60,
  width = 260,
  imageSrc = DEFAULT_IMAGE,
  label = "Tilt card",
}: TiltCardProps = {}) {
  const skin = useRef<HTMLButtonElement>(null)
  const [at, setAt] = useState({ x: 0, y: 0 })
  const [on, setOn] = useState(false)
  const reducedMotion = useSyncExternalStore(subscribeMotion, getMotionPreference, getServerMotionPreference)

  /* Spring the rotation, light intensity, and outer shadow to give the card mass.
     The small pointer shade uses the raw position instead, so it stays
     attached to the cursor while the card itself settles. */
  const springX = useSpring(on && !reducedMotion ? at.x * 100 : 0)
  const springY = useSpring(on && !reducedMotion ? at.y * 100 : 0)
  const springLight = useSpring(on && !reducedMotion ? 100 : 0)
  const sx = reducedMotion ? 0 : springX / 100
  const sy = reducedMotion ? 0 : springY / 100
  const lit = reducedMotion ? 0 : clamp(springLight / 100, 0, 1)
  const max = clamp(tilt, 0, 20)

  /* It sinks, it does not lift: the edge under the pointer goes AWAY.
     Top means positive rotateX, right means positive rotateY. The signs
     are the idea, not a tuning detail. The pointer casts a local shade below
     itself while the highlight stays above, keeping the light overhead. */
  const rx = -sy * max
  const ry = sx * max
  const px = ((at.x + 1) / 2) * 100
  const py = ((at.y + 1) / 2) * 100 + 6
  const dark = (clamp(shade, 0, 100) / 100) * 0.22 * lit
  const rim = (clamp(shade, 0, 100) / 100) * 0.34 * lit
  const shadowScale = Math.max(0, width) / 260

  function track(event: PointerEvent<HTMLButtonElement>) {
    if (reducedMotion || !skin.current) return
    // Measure the fixed frame, never the rotating surface beneath it.
    const rect = skin.current.getBoundingClientRect()
    setAt({
      x: clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1, 1),
      y: clamp(((event.clientY - rect.top) / rect.height) * 2 - 1, -1, 1),
    })
    setOn(true)
  }

  function handleKey(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Escape") {
      setOn(false)
      return
    }
    const directions: Record<string, [number, number]> = {
      ArrowLeft: [-0.35, 0], ArrowRight: [0.35, 0],
      ArrowUp: [0, -0.35], ArrowDown: [0, 0.35],
    }
    const direction = directions[event.key]
    if (!direction || reducedMotion) return
    event.preventDefault()
    setAt((value) => {
      const position = on ? value : { x: 0, y: 0 }
      return { x: clamp(position.x + direction[0], -1, 1), y: clamp(position.y + direction[1], -1, 1) }
    })
    setOn(true)
  }

  return (
    <button
      type="button"
      ref={skin}
      className="compass-tilt"
      aria-label={label}
      data-tilt-frame
      data-active={on && !reducedMotion}
      style={{ width, perspective: DEPTH, "--tilt-corner": `${clamp(corner, 0, 40)}px` } as CSSProperties}
      onPointerEnter={track}
      onPointerMove={track}
      onPointerOut={(event) => {
        // Null is outside too, including a pointer leaving the window.
        const to = event.relatedTarget
        if (!(to instanceof Node) || !skin.current?.contains(to)) setOn(false)
      }}
      onPointerUp={(event) => { if (event.pointerType !== "mouse") setOn(false) }}
      onPointerCancel={() => setOn(false)}
      onBlur={() => setOn(false)}
      onKeyDown={handleKey}
      onClick={(event) => {
        // Native Enter/Space clicks have no pointer coordinates.
        if (event.detail === 0 && !reducedMotion) {
          if (!on) setAt({ x: 0, y: 0 })
          setOn((value) => !value)
        }
      }}
    >
      <span
        className="compass-tilt-card"
        data-tilt-surface
        style={{
          backgroundImage: `url(${JSON.stringify(imageSrc)})`,
          /* TranslateZ first: the retreat belongs to the room's axes, not
             the rotated card's. The shadow TIGHTENS as the gap closes. */
          transform: `translateZ(${-SINK * lit}px) rotateX(${rx}deg) rotateY(${ry}deg)`,
          // Scale the shadow with smaller previews so it stays inside their frame.
          boxShadow: `0 ${mix(20, 9, lit) * shadowScale}px ${mix(44, 24, lit) * shadowScale}px ${-8 * shadowScale}px rgb(0 0 0 / ${mix(0.22, 0.15, lit)})`,
        }}
      >
        {/* The shade follows just below the cursor; the highlight stays overhead. */}
        <span
          className="compass-tilt-sheen"
          aria-hidden="true"
          style={{ backgroundImage: `radial-gradient(22% 18% at ${px}% ${py}%, rgb(0 0 0 / ${dark}) 0%, rgb(0 0 0 / ${dark * 0.35}) 45%, transparent 100%), radial-gradient(52% 42% at 50% 0%, rgb(255 255 255 / ${rim}) 0%, transparent 100%)` }}
        />
      </span>
    </button>
  )
}
