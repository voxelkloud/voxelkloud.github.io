'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import styles from './bench-slider.module.css'

/**
 * Four rasterisers loading the same camera, on one slider.
 *
 * The frames and the numbers come from `public/bench/`, written by
 * `demo/bench-vitals/build-compare.mjs --assets-only`. They are real files, not
 * data URIs: a viewer only ever looks at four frames at a time, so the browser
 * fetches those four and caches them, where inlining all 240 would cost seven
 * megabytes before the first pixel.
 */

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

type Shot = {
  t: number
  fps: number | null
  resident: number | null
  nodes: number | null
  jpg: string
}

type Arm = {
  name: string
  firstInkMs: number | null
  halfWayMs: number | null
  settledMs: number | null
  fpsMedian: number | null
  curve: [number, number][]
  shots: (Shot | null)[]
  viewport: { width: number; height: number }
  dataset: string
  budget: number
}

type Data = { times: number[]; variants: Arm[] }

/** Panel order, and the label each arm goes by. */
const ARMS: { id: string; label: string; engine: string; colour: string; ours: boolean }[] = [
  { id: 'compute', label: 'compute', engine: 'WebGPU', colour: 'var(--accent)', ours: true },
  { id: 'points', label: 'points', engine: 'WebGL 2', colour: '#7fd4a8', ours: true },
  { id: 'potree', label: 'Potree 1.8', engine: 'WebGL 2', colour: '#8c9890', ours: false },
  { id: 'potree-core', label: 'potree-core', engine: 'WebGL 2', colour: '#c9a227', ours: false },
]

function useData(): Data | null {
  const [data, setData] = useState<Data | null>(null)
  useEffect(() => {
    let live = true
    fetch(`${BASE}/bench/data.json`)
      .then((r) => r.json())
      .then((d: Data) => {
        if (live) setData(d)
      })
      .catch(() => {
        /* The section simply does not render; a broken widget is worse. */
      })
    return () => {
      live = false
    }
  }, [])
  return data
}

function Chart({ data, idx }: { data: Data; idx: number }) {
  const ref = useRef<HTMLCanvasElement | null>(null)
  useEffect(() => {
    const cv = ref.current
    if (cv === null) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = cv.clientWidth
    const h = cv.clientHeight
    cv.width = w * dpr
    cv.height = h * dpr
    const g = cv.getContext('2d')
    if (g === null) return
    g.setTransform(dpr, 0, 0, dpr, 0, 0)
    g.clearRect(0, 0, w, h)
    const L = 44
    const R = 10
    const T = 10
    const B = 24
    // Log on both axes. The curves cover two orders of magnitude and everything
    // that separates them happens in the first two seconds; linear axes flatten
    // all four onto one line exactly where the differences live.
    const x0 = Math.log(300)
    const x1 = Math.log(30000)
    const y0 = Math.log(0.3)
    const y1 = Math.log(100)
    const X = (t: number) => L + ((Math.log(Math.max(t, 300)) - x0) / (x1 - x0)) * (w - L - R)
    const Y = (d: number) => T + ((y1 - Math.log(Math.max(d, 0.3))) / (y1 - y0)) * (h - T - B)
    const css = getComputedStyle(document.documentElement)
    const border = css.getPropertyValue('--border').trim() || '#26302a'
    const muted = css.getPropertyValue('--muted').trim() || '#8c9890'
    const fg = css.getPropertyValue('--foreground').trim() || '#e9eee9'
    g.strokeStyle = border
    g.fillStyle = muted
    g.font = '12px var(--font-mono, monospace)'
    g.lineWidth = 1
    for (const d of [100, 30, 10, 3, 1]) {
      const y = Y(d)
      g.beginPath()
      g.moveTo(L, y)
      g.lineTo(w - R, y)
      g.stroke()
      g.textAlign = 'right'
      g.fillText(`${d}%`, L - 6, y + 3)
    }
    g.textAlign = 'center'
    for (const [t, label] of [
      [500, '0.5 s'],
      [1000, '1 s'],
      [3000, '3 s'],
      [10000, '10 s'],
      [30000, '30 s'],
    ] as [number, string][]) {
      g.fillText(label, X(t), h - 8)
    }
    for (const arm of ARMS) {
      const v = data.variants.find((x) => x.name === arm.id)
      if (v === undefined || v.curve.length === 0) continue
      g.strokeStyle = arm.colour.startsWith('var(')
        ? css.getPropertyValue('--accent').trim() || '#c4f04d'
        : arm.colour
      g.lineWidth = 2
      g.beginPath()
      v.curve.forEach(([t, d], i) => {
        if (i === 0) g.moveTo(X(t), Y(d))
        else g.lineTo(X(t), Y(d))
      })
      g.stroke()
    }
    const tx = X(data.times[idx] ?? 0)
    g.strokeStyle = fg
    g.setLineDash([3, 3])
    g.lineWidth = 1
    g.beginPath()
    g.moveTo(tx, T)
    g.lineTo(tx, h - B)
    g.stroke()
    g.setLineDash([])
  }, [data, idx])
  return <canvas className={styles.chart} ref={ref} />
}

export function BenchSlider() {
  const data = useData()
  const [idx, setIdx] = useState(3)
  const arms = useMemo(
    () => (data === null ? [] : ARMS.filter((a) => data.variants.some((v) => v.name === a.id))),
    [data],
  )
  if (data === null) return null
  const t = data.times[idx] ?? 0
  const label = t < 10000 ? `${(t / 1000).toFixed(2)} s` : `${(t / 1000).toFixed(1)} s`

  const first = data.variants[0]
  const conditions = first === undefined
    ? []
    : ([
        ['dataset', first.dataset],
        ['budget', `${(first.budget / 1_000_000).toFixed(0)}M pts`],
        ['viewport', `${first.viewport.width}x${first.viewport.height}`],
        ['network', 'throttled 2.5 MB/s, cache off'],
        ['camera', 'byte-identical across all four'],
      ] as [string, string][])

  return (
    <div className={styles.root}>
      <ul className={styles.conditions}>
        {conditions.map(([k, v]) => (
          <li key={k}>
            <b>{k}</b> {v}
          </li>
        ))}
      </ul>
      <div className={styles.scrub}>
        <span className={styles.scrubLabel}>After load</span>
        <span className={styles.now}>{label}</span>
        <input
          aria-label="time after load"
          max={data.times.length - 1}
          min={0}
          onChange={(e) => setIdx(Number(e.target.value))}
          step={1}
          type="range"
          value={idx}
        />
      </div>

      <div className={styles.rail}>
        <div className={styles.grid} style={{ gridTemplateColumns: `repeat(${arms.length}, minmax(0, 1fr))` }}>
          {arms.map((arm) => {
            const v = data.variants.find((x) => x.name === arm.id)
            const shot = v?.shots[idx] ?? null
            return (
              <figure className={arm.ours ? `${styles.panel} ${styles.ours}` : styles.panel} key={arm.id}>
                <figcaption>
                  <span className={styles.dot} style={{ background: arm.colour }} />
                  <span className={styles.name}>{arm.label}</span>
                  <span className={styles.engine}>{arm.engine}</span>
                </figcaption>
                {shot === null ? (
                  <div className={`${styles.shot} ${styles.empty}`}>no frame recorded</div>
                ) : (
                  <img alt={`${arm.label} at ${label}`} className={styles.shot} src={`${BASE}/bench/${shot.jpg}`} />
                )}
                <div className={styles.readout}>
                  <span>{shot?.fps === null || shot === null ? '—' : `${Math.round(shot.fps)} fps`}</span>
                  <span>
                    {shot?.resident ? `${shot.resident.toLocaleString('en-US')} pts` : '—'}
                  </span>
                </div>
              </figure>
            )
          })}
        </div>
      </div>

      <Chart data={data} idx={idx} />
      <p className={styles.legend}>
        <em>compute</em> is the WebGPU default and <em>points</em> the WebGL 2 fallback — a
        second full rasteriser, not a degraded mode: it reaches half way before potree-core
        does and settles three and a half seconds sooner.
      </p>
      <p className={styles.legend}>
        The chart is distance to each arm’s <em>own</em> final frame, log scale. Comparing one
        rasteriser’s pixels to another’s would measure visual character, not convergence.
      </p>
    </div>
  )
}
