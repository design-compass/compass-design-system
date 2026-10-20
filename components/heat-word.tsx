"use client"

import { useEffect, useRef, useState } from "react"

const W = 360
const H = 170
const word = "BEND"

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
const FACE = { family: "Pretendard Variable", weight: 800 }

function rng(seed: number) {
  let t = seed * 9301 + 49297

  return () => {
    t = (t * 9301 + 49297) % 233280
    return t / 233280
  }
}

function line(g: CanvasRenderingContext2D, pts: [number, number][]) {
  g.beginPath()
  pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)))
  g.stroke()
}

type Hand = { x: number; y: number; on: number; area: number }
type Stops = [number, [number, number, number]][]

function drawShape(
  g: CanvasRenderingContext2D,
  shape: string,
  w: number,
  h: number,
  r: number,
  seed: number,
  hand?: Hand
) {
  const rand = rng(seed)
  const cx = w / 2
  const cy = h / 2

  g.lineCap = "round"
  g.lineJoin = "round"

  if (shape === "Dots") {
    const cols = 7
    const rows = 3
    const reach = 62 * r * (hand?.area ?? 1)

    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const x = cx + (i - (cols - 1) / 2) * 38 * r + (rand() - 0.5) * 8 * r
        const y = cy + (j - (rows - 1) / 2) * 38 * r + (rand() - 0.5) * 8 * r
        let rad = (9 + rand() * 7) * r

        if (hand && hand.on > 0.002) {
          const d2 = ((x - hand.x) ** 2 + (y - hand.y) ** 2) / (reach * reach)
          rad *= 1 + 0.75 * hand.on * Math.exp(-d2)
        }

        g.beginPath()
        g.arc(x, y, rad, 0, Math.PI * 2)
        g.fill()
      }
    }
  } else if (shape === "Star") {
    g.lineWidth = 14 * r
    g.beginPath()
    for (let i = 0; i < 10; i++) {
      const angle = -Math.PI / 2 + i * Math.PI / 5
      const radius = (i % 2 === 0 ? 72 : 34) * r
      const x = cx + Math.cos(angle) * radius
      const y = cy + Math.sin(angle) * radius
      if (i === 0) g.moveTo(x, y)
      else g.lineTo(x, y)
    }
    g.closePath()
    g.stroke()
  } else if (shape === "Diamond") {
    const reach = 72 * r
    const corner = 14 * r
    g.lineWidth = 20 * r
    g.beginPath()
    g.moveTo(cx - corner, cy - reach + corner)
    g.quadraticCurveTo(cx, cy - reach, cx + corner, cy - reach + corner)
    g.lineTo(cx + reach - corner, cy - corner)
    g.quadraticCurveTo(cx + reach, cy, cx + reach - corner, cy + corner)
    g.lineTo(cx + corner, cy + reach - corner)
    g.quadraticCurveTo(cx, cy + reach, cx - corner, cy + reach - corner)
    g.lineTo(cx - reach + corner, cy + corner)
    g.quadraticCurveTo(cx - reach, cy, cx - reach + corner, cy - corner)
    g.closePath()
    g.stroke()
  } else if (shape === "Ring") {
    g.lineWidth = 20 * r
    g.beginPath()
    g.arc(cx, cy, 58 * r, 0, Math.PI * 2)
    g.stroke()
  } else if (shape === "Asterisk") {
    g.lineWidth = 16 * r
    const n = 3 + Math.floor(rand() * 2)
    const turn = rand() * Math.PI

    for (let i = 0; i < n; i++) {
      const a = turn + (i / n) * Math.PI
      const c = Math.cos(a) * 66 * r
      const sn = Math.sin(a) * 66 * r

      line(g, [
        [cx - c, cy - sn],
        [cx + c, cy + sn],
      ])
    }
  }
}

async function ensure() {
  try {
    await document.fonts?.load(`${FACE.weight} 100px "${FACE.family}"`)
  } catch {
    /* The fallback still draws a usable word field. */
  }
}

const PALETTES: Record<string, Stops> = {
  Neon: [
    [0.0, [255, 150, 225]],
    [0.1, [255, 90, 190]],
    [0.2, [255, 50, 60]],
    [0.32, [255, 150, 40]],
    [0.42, [255, 228, 100]],
    [0.54, [120, 215, 255]],
    [0.68, [40, 120, 245]],
    [0.84, [12, 44, 150]],
    [1.0, [6, 18, 80]],
  ],
  Fire: [
    [0.0, [255, 238, 180]],
    [0.16, [255, 200, 80]],
    [0.34, [255, 130, 30]],
    [0.52, [228, 58, 28]],
    [0.72, [150, 18, 44]],
    [0.88, [74, 6, 42]],
    [1.0, [30, 2, 24]],
  ],
  Sea: [
    [0.0, [210, 255, 225]],
    [0.16, [110, 245, 175]],
    [0.34, [40, 215, 200]],
    [0.52, [40, 150, 235]],
    [0.72, [80, 70, 205]],
    [0.88, [60, 20, 130]],
    [1.0, [24, 8, 60]],
  ],
  Pop: [
    [0.0, [255, 225, 240]],
    [0.16, [255, 160, 210]],
    [0.34, [245, 110, 190]],
    [0.52, [180, 110, 255]],
    [0.72, [100, 150, 255]],
    [0.88, [40, 70, 190]],
    [1.0, [20, 24, 100]],
  ],
}

const FLOOR = 34
const GREY = [150, 150, 154]
const GREY_A = new Uint8ClampedArray(256)

for (let i = 0; i < 256; i++) {
  GREY_A[i] = 255 * clamp((i - 70) / 45, 0, 1)
}

function table(stops: Stops) {
  const t = new Uint8ClampedArray(256 * 4)

  for (let i = 0; i < 256; i++) {
    if (i < FLOOR) {
      t[i * 4 + 3] = 0
      continue
    }

    const u = (i - FLOOR) / (255 - FLOOR)
    let k = 0

    while (k < stops.length - 2 && u > stops[k + 1][0]) {
      k++
    }

    const [u0, c0] = stops[k]
    const [u1, c1] = stops[k + 1]
    const f = clamp((u - u0) / (u1 - u0), 0, 1)

    for (let c = 0; c < 3; c++) {
      t[i * 4 + c] = c0[c] + (c1[c] - c0[c]) * f
    }

    t[i * 4 + 3] = 255 * clamp((i - FLOOR) / 26, 0, 1)
  }

  return t
}

const LUTS = new Map<string, Uint8ClampedArray>()

function lut(name: string) {
  let t = LUTS.get(name)

  if (!t) {
    t = table(PALETTES[name] ?? PALETTES.Neon)
    LUTS.set(name, t)
  }

  return t
}

function HeatWord({
  heat = 60,
  soft = 50,
  area = 50,
  colors = "Neon",
  shape: start = "Star",
}: {
  heat?: number
  soft?: number
  area?: number
  colors?: string
  shape?: string
} = {}) {
  const [seed] = useState(() => Math.floor(Math.random() * 1000))
  const shape = start
  const shown = useRef<HTMLCanvasElement>(null)
  const st = useRef({
    base: null as HTMLCanvasElement | null,
    work: null as HTMLCanvasElement | null,
    px: 0.5,
    py: 0.5,
    tx: 0.5,
    ty: 0.5,
    power: 1,
    want: 1,
    hovering: false,
    elapsed: 0,
    visible: true,
    reducedMotion: false,
    grow: 0,
    raf: 0,
    ratio: 1,
    swollen: false,
  })
  const knobs = useRef({ heat, soft, area, colors })
  knobs.current = { heat, soft, area, colors }

  const spread = () => 0.5 + clamp(knobs.current.area, 0, 100) / 100

  const field = () => {
    const s = st.current
    const base = s.base
    const canvas = shown.current

    if (!base || !canvas) {
      return
    }

    const r = s.ratio
    const w = base.width
    const h = base.height
    const g = base.getContext("2d")

    if (!g) {
      return
    }

    g.setTransform(1, 0, 0, 1, 0, 0)
    g.shadowColor = "transparent"
    g.fillStyle = "#000"
    g.fillRect(0, 0, w, h)

    const blur = (6 + (clamp(knobs.current.soft, 0, 100) / 100) * 16) * r
    const off = w * 3

    g.shadowColor = "#fff"
    g.shadowBlur = blur
    g.shadowOffsetX = off
    g.fillStyle = "#fff"
    g.strokeStyle = "#fff"

    if (shape !== "Word") {
      g.save()
      g.translate(-off, 0)
      const hand = { x: s.px * w, y: s.py * h, on: s.power, area: spread() }
      drawShape(g, shape, w, h, r, seed, hand)
      drawShape(g, shape, w, h, r, seed, hand)
      g.restore()
      return
    }

    let size = 150 * r
    const face = `"${FACE.family}", system-ui, sans-serif`
    g.font = `${FACE.weight} ${size}px ${face}`
    const fit = (w * 0.88) / g.measureText(word).width
    size = Math.min(size, size * fit)
    g.font = `${FACE.weight} ${size}px ${face}`
    g.textAlign = "center"
    g.textBaseline = "middle"
    g.fillText(word, w / 2 - off, h / 2 + size * 0.04)
    g.fillText(word, w / 2 - off, h / 2 + size * 0.04)
  }

  const paint = () => {
    const s = st.current
    const c = shown.current

    if (!c || !s.base || !s.work) {
      return
    }

    const w = c.width
    const h = c.height

    if (shape === "Dots" && (s.power > 0.002 || s.swollen)) {
      field()
      s.swollen = s.power > 0.002
    }

    const g = s.work.getContext("2d", { willReadFrequently: true })

    if (!g) {
      return
    }

    g.globalCompositeOperation = "source-over"
    g.globalAlpha = 1
    g.fillStyle = "#000"
    g.fillRect(0, 0, w, h)
    g.globalAlpha = s.grow
    g.drawImage(s.base, 0, 0)
    g.globalAlpha = 1

    if (s.power > 0.002) {
      const cx = s.px * w
      const cy = s.py * h
      const rad = (60 + (knobs.current.heat / 100) * 50) * s.ratio * spread()
      const amt = s.power * (0.35 + (knobs.current.heat / 100) * 0.55)
      const cool = g.createRadialGradient(cx, cy, 0, cx, cy, rad)
      const v = (k: number) => Math.round(255 * (1 - amt * k))

      g.globalCompositeOperation = "multiply"
      cool.addColorStop(0, `rgb(${v(1)},${v(1)},${v(1)})`)
      cool.addColorStop(0.45, `rgb(${v(0.6)},${v(0.6)},${v(0.6)})`)
      cool.addColorStop(1, "rgb(255,255,255)")
      g.fillStyle = cool
      g.fillRect(0, 0, w, h)
    }

    const src = g.getImageData(0, 0, w, h).data
    const LUT = lut(knobs.current.colors)
    const out = c.getContext("2d")!.createImageData(w, h)
    const d = out.data
    const cx = s.px * w
    const cy = s.py * h
    const R = (95 + (knobs.current.heat / 100) * 55) * s.ratio * spread()
    const R2 = R * R
    const on = s.power

    for (let y = 0, i = 0; y < h; y++) {
      const dy2 = (y - cy) * (y - cy)

      for (let x = 0; x < w; x++, i += 4) {
        const f = src[i]
        const v = f * 4
        let m = 0

        if (on > 0.002) {
          const q = ((x - cx) * (x - cx) + dy2) / R2

          if (q < 1) {
            const t = 1 - q
            m = on * t * t * (3 - 2 * t)
          }
        }

        const ga = GREY_A[f]

        if (m <= 0) {
          d[i] = GREY[0]
          d[i + 1] = GREY[1]
          d[i + 2] = GREY[2]
          d[i + 3] = ga
          continue
        }

        const k = 1 - m
        d[i] = GREY[0] * k + LUT[v] * m
        d[i + 1] = GREY[1] * k + LUT[v + 1] * m
        d[i + 2] = GREY[2] * k + LUT[v + 2] * m
        d[i + 3] = ga * k + LUT[v + 3] * m
      }
    }

    c.getContext("2d")!.putImageData(out, 0, 0)
  }

  const build = () => {
    const s = st.current
    const r = Math.min(2, window.devicePixelRatio || 1)
    s.ratio = r

    const w = Math.round(W * r)
    const h = Math.round(H * r)
    const base = s.base ?? document.createElement("canvas")
    const work = s.work ?? document.createElement("canvas")
    const canvas = shown.current

    if (!canvas) {
      return
    }

    base.width = w
    base.height = h
    work.width = w
    work.height = h
    canvas.width = w
    canvas.height = h
    s.base = base
    s.work = work
    field()
  }

  const run = () => {
    const s = st.current

    if (s.raf || !s.visible || document.hidden) {
      return
    }
    if (s.reducedMotion) {
      s.power = s.want
      s.grow = 1
      paint()
      return
    }

    let prev = performance.now()
    const step = (t: number) => {
      const dt = Math.min(0.05, (t - prev) / 1000)
      prev = t
      const k = 1 - Math.pow(0.002, dt)

      s.elapsed += dt
      if (!s.hovering) {
        s.tx = 0.5 + Math.cos(s.elapsed * 0.7) * 0.24
        s.ty = 0.5 + Math.sin(s.elapsed * 0.9) * 0.22
      }

      s.px += (s.tx - s.px) * k
      s.py += (s.ty - s.py) * k
      s.power += (s.want - s.power) * (1 - Math.pow(0.01, dt))
      s.grow = Math.min(1, s.grow + dt / 0.9)
      paint()

      const still =
        s.hovering &&
        s.grow >= 1 &&
        Math.abs(s.want - s.power) < 0.004 &&
        Math.abs(s.tx - s.px) < 0.001 &&
        Math.abs(s.ty - s.py) < 0.001

      if (still && s.want === 0) {
        s.power = 0
      }

      s.raf = still ? 0 : requestAnimationFrame(step)

      if (still) {
        paint()
      }
    }

    s.raf = requestAnimationFrame(step)
  }

  useEffect(() => {
    const s = st.current
    let live = true
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)")
    s.reducedMotion = motion.matches
    const pause = () => {
      cancelAnimationFrame(s.raf)
      s.raf = 0
    }
    const sync = () => {
      pause()
      s.reducedMotion = motion.matches
      if (s.base) run()
    }
    const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(([entry]) => {
      s.visible = entry.isIntersecting
      sync()
    })
    if (shown.current) observer?.observe(shown.current)
    document.addEventListener("visibilitychange", sync)
    motion.addEventListener("change", sync)

    ensure().then(() => {
      if (!live) {
        return
      }

      build()
      s.grow = 0
      run()
    })

    return () => {
      live = false
      pause()
      observer?.disconnect()
      document.removeEventListener("visibilitychange", sync)
      motion.removeEventListener("change", sync)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shape, seed])

  useEffect(() => {
    if (!st.current.base) {
      return
    }

    build()
    paint()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soft])

  const aim = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const s = st.current
    if (!r.width || !r.height) return
    s.tx = clamp((e.clientX - r.left) / r.width, 0, 1)
    s.ty = clamp((e.clientY - r.top) / r.height, 0, 1)
  }

  return (
    <div
      className="grid w-full place-items-center"
      onPointerEnter={(e) => {
        aim(e)
        const s = st.current
        s.hovering = true
        s.want = 1
        run()
      }}
      onPointerMove={(e) => {
        aim(e)
        st.current.want = 1
        st.current.hovering = true
        run()
      }}
      onPointerLeave={() => {
        st.current.hovering = false
        st.current.want = 1
        run()
      }}
      onPointerCancel={() => {
        st.current.hovering = false
        run()
      }}
      role="img"
      aria-label={shape === "Word" ? word : shape}
    >
      <canvas
        ref={shown}
        className="h-auto w-full max-w-[360px]"
        style={{ aspectRatio: `${W} / ${H}` }}
        aria-hidden="true"
      />
    </div>
  )
}

export { HeatWord }
