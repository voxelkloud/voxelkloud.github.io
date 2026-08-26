'use client'

import { useCallback, useRef, useState } from 'react'

/**
 * The converter, as a panel.
 *
 * Everything that does the work is in the worker, and the worker is the file
 * `@voxelkloud/wasm-build` ships — copied into `public/wasm-build` by
 * `scripts/sync-wasm.mjs`, layout and all, so it is byte-identical to the one
 * the package's own example runs. This component moves bytes to it and renders
 * what comes back.
 *
 * The 552 KB of wasm is fetched by the worker, on the first conversion. Nothing
 * is loaded by visiting the page, which is why the asset can live on a landing
 * site at all.
 */

/** The site deploys under a prefix on GitHub Pages; assets have to carry it. */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

interface Open {
  readonly probe: number
  readonly hierarchy: number
  readonly rootChunk: number
  readonly total: number
}

interface Stats {
  readonly points: number
  readonly nodes: number
  readonly depth: number
  readonly spacing: number
  readonly bytes: number
  readonly open: Open
}

interface Result {
  readonly name: string
  readonly inputBytes: number
  readonly seconds: number
  readonly stats: Stats
  readonly url: string
}

function bytes(n: number): string {
  const units = ['B', 'KiB', 'MiB', 'GiB']
  let value = n
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit++
  }
  return unit === 0 ? `${n} B` : `${value.toFixed(1)} ${units[unit]}`
}

const count = (n: number) => n.toLocaleString('en-US')

export function ConvertPanel() {
  const [over, setOver] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<Result | null>(null)
  const input = useRef<HTMLInputElement>(null)

  const convert = useCallback(async (file: File) => {
    setError(null)
    setResult(null)
    setStatus('reading…')

    const buffer = await file.arrayBuffer()
    const inputBytes = buffer.byteLength

    // One worker per conversion, ended when it answers. A build holds the whole
    // cloud in wasm memory — around 1.7 GB at the 20M-point ceiling — and there
    // is no way to hand that back; ending the thread is what returns it.
    const worker = new Worker(`${BASE}/wasm-build/examples/convert-worker.js`, {
      type: 'module',
    })
    const started = performance.now()

    const message = await new Promise<Record<string, unknown>>((resolve) => {
      worker.onmessage = (event: MessageEvent) => {
        const data = event.data as Record<string, unknown>
        if (data.kind === 'progress') {
          setStatus(`indexing… ${count(data.points as number)} points`)
          return
        }
        resolve(data)
      }
      worker.onerror = (event) => resolve({ kind: 'error', message: event.message })
      // Transferred, not copied: a 128 MB drop should not exist twice while the
      // worker starts.
      worker.postMessage({ bytes: buffer }, [buffer])
    })
    worker.terminate()
    setStatus(null)

    if (message.kind === 'error') {
      setError(String(message.message))
      return
    }

    const stats = message.stats as Stats
    const copc = message.copc as Uint8Array
    setResult({
      name: file.name.replace(/\.[^.]+$/, '') + '.copc.laz',
      inputBytes,
      seconds: (performance.now() - started) / 1000,
      stats,
      url: URL.createObjectURL(new Blob([copc as BlobPart], { type: 'application/octet-stream' })),
    })
  }, [])

  return (
    <>
      <div
        className={over ? 'dropzone over' : 'dropzone'}
        onDragLeave={() => setOver(false)}
        onDragOver={(event) => {
          event.preventDefault()
          setOver(true)
        }}
        onDrop={(event) => {
          event.preventDefault()
          setOver(false)
          const file = event.dataTransfer.files[0]
          if (file !== undefined) void convert(file)
        }}
      >
        Drop a file here, or{' '}
        <button type="button" onClick={() => input.current?.click()}>
          choose one
        </button>
        <input
          hidden
          ref={input}
          type="file"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file !== undefined) void convert(file)
          }}
        />
      </div>

      {status !== null && <p className="convert-status">{status}</p>}
      {error !== null && <p className="convert-error">{error}</p>}

      {result !== null && (
        <div className="convert-result">
          <Row label="in" value={`${result.name.replace('.copc.laz', '')} — ${bytes(result.inputBytes)}`} />
          <Row label="points" value={count(result.stats.points)} />
          <Row label="octree" value={`${count(result.stats.nodes)} nodes, ${result.stats.depth + 1} levels`} />
          <Row
            label="spacing at the root"
            value={`${result.stats.spacing.toPrecision(4)} units, halving each level`}
          />
          <Row label="out" value={`${result.name} — ${bytes(result.stats.bytes)}`} />
          <Row label="took" value={`${result.seconds.toFixed(1)} s, on your machine, offline`} />
          <Row
            label="first points cost"
            value={`${bytes(result.stats.open.total)} — ${(
              (result.stats.open.total / result.stats.bytes) * 100
            ).toFixed(2)}% of the file`}
          />

          <p className="format-footnote">
            That last line is the point of the exercise. To draw anything from the file you dropped
            in, a viewer needed all {bytes(result.inputBytes)} of it. From this one it needs{' '}
            {bytes(result.stats.open.probe)} of header, {bytes(result.stats.open.hierarchy)} of
            hierarchy and {bytes(result.stats.open.rootChunk)} for the root node — and then it asks
            for more only where you look.
          </p>

          <a className="button button-primary" download={result.name} href={result.url}>
            Save {result.name}
          </a>
        </div>
      )}
    </>
  )
}

function Row({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="convert-row">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}
