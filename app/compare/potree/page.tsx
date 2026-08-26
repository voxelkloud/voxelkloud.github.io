import type { Metadata } from 'next'
import { PageFrame } from '@/components/page-frame'

export const metadata: Metadata = {
  title: 'voxelkloud vs Potree — a point cloud renderer comparison',
  description:
    'How voxelkloud and Potree differ: npm packages against a bundled app, WebGPU against WebGL, your three.js scene against a viewer that owns it. Plus an honest list of what Potree still does better.',
  alternates: { canonical: './' },
}

/**
 * Architecture and integration, and — since 2026-08-25 — speed.
 *
 * Every row here is something a reader can verify by looking at either project.
 *
 * The speed table below used to be absent on the grounds that no honest number
 * existed. That is no longer true: `demo/bench-vitals/` drives all arms from one
 * origin, on the same dataset, at the same camera, to the same on-screen point
 * count, on a real GPU. The conditions ride along with the numbers on screen,
 * because a benchmark number without its conditions is not a number.
 */
const rows: readonly (readonly [string, string, string])[] = [
  ['Delivery', 'An app or bundle you copy into your page', 'npm packages, ESM, TypeScript, tree-shakeable'],
  ['Renderer', 'WebGL', 'WebGPU via three.js WebGPURenderer + TSL'],
  ['Scene', 'The viewer owns the loop and the scene', 'view.camera and view.scene are your three objects'],
  ['Frameworks', 'Hand-rolled integration', 'First-party React and Vue bindings'],
  ['Standalone loader', 'Coupled to the viewer', 'No three, no DOM: runs in Node and in a worker'],
  ['Potree v2', 'The origin of the format', 'Reads it as it is, DEFAULT and BROTLI'],
  ['COPC', 'Reads it', '@voxelkloud/format-copc: streamed by HTTP Range, no conversion step'],
  ['EPT', 'Reads it', '@voxelkloud/format-ept: binary, laszip and zstandard node payloads'],
  ['3D Tiles', '—', '@voxelkloud/format-3dtiles: external tilesets, implicit tiling, .pnts and glTF POINTS'],
  ['Single-file LAS/LAZ', 'Reads it', "@voxelkloud/format-single: downloaded whole, the octree built in a worker by the converter's own partitioner in wasm"],
  ['E57, PLY, PCD, XYZ', 'Reads E57', '@voxelkloud/format-single, in the page and in the CLI: scan poses applied, spherical records converted, no-returns dropped'],
  ['Reprojection', '—', '@voxelkloud/wasm-proj: EPSG and proj4, so two clouds in different systems share one scene'],
  ['Conversion', 'PotreeConverter, a CLI', 'voxelkloud convert: a Rust library and a CLI, writing COPC, EPT or Potree v2'],
  ['Deployment checks', '—', 'voxelkloud doctor grades a served cloud on ranges, CORS and encoding — including a Potree one'],
  ['Diagnostics', '—', 'stats.limitedBy: whether quality or the point budget stopped selection'],
  ['Types', 'JavaScript', 'TypeScript end to end'],
  ['License', 'BSD 2-Clause', 'MIT'],
]

/**
 * Round C, 2026-08-26. Median of 2 cold runs each, all from one sitting on a
 * quiet host. Raw JSON is versioned in the monorepo at
 * `demo/bench-vitals/results-cable.json`, and the Speed Index row at
 * `visual-cable.json` — a separate instrument, because run.mjs compares frames
 * by encoded size and that is near-blind to holes filling in.
 *
 * The first sitting was thrown away. Idle fps came back as exactly 50.0 for two
 * different engines and exactly 25.0 for the third, and numbers that round are
 * missed vsync rather than a result — a background updater was taking 27% of a
 * core. With it closed the same arms read 60.2, 59.5 and 29.9.
 *
 * The `voxelkloud` column IS the compute rasteriser: `sinkMode` defaults to
 * `"auto"`, which resolves to compute wherever WebGPU gives a device, and the
 * benchmark page pins nothing. Shipped in 0.5.1.
 *
 * There used to be a fourth column here, `compute-raster.html` — a standalone
 * harness that bypasses `createPointCloudView` and runs its own loader loop at
 * 8 concurrent node fetches against the view's 1. It measured that loop rather
 * than how points are drawn, it was excluded from every `win`, and nothing in
 * the header told a reader either of those things. A column nobody can win and
 * nobody can install is a column that only ever confused.
 *
 * `win` indexes the columns — 0 voxelkloud, 2 Potree, 3 potree-core.
 */
const perf: readonly {
  readonly metric: string
  readonly vk: string
  readonly potree: string
  readonly core: string
  readonly win?: number
}[] = [
  { metric: 'INP — orbit drag', vk: '56 ms', potree: '104 ms', core: '200 ms', win: 0 },
  { metric: 'Idle fps at 3M points', vk: '60.2', potree: '59.5', core: '29.9', win: 0 },
  { metric: 'JS heap', vk: '66.6 MB', potree: '254.1 MB', core: '211.8 MB', win: 0 },
  { metric: 'First ink', vk: '522 ms', potree: '1,233 ms', core: '622 ms', win: 0 },
  { metric: 'First contentful paint', vk: '324 ms', potree: '732 ms', core: '364 ms', win: 0 },
  { metric: 'First selection', vk: '275 ms', potree: '812 ms', core: '374 ms', win: 0 },
  { metric: 'Speed Index', vk: '1,918', potree: '1,493', core: '8,487', win: 2 },
  { metric: 'Visually complete', vk: '23.5 s', potree: '21.4 s', core: '25.3 s', win: 2 },
  { metric: 'JS decoded', vk: '0.39 MB', potree: '2.39 MB', core: '0.74 MB', win: 0 },
]

export default function ComparePotree() {
  return (
    <PageFrame home="../../">
      <section className="sub-hero shell">
        <p className="section-kicker">COMPARISON</p>
        <h1>
          voxelkloud and Potree,
          <br />
          <em>side by side.</em>
        </h1>
        <p className="lede">
          Potree is the reason a point cloud can be looked at in a browser at all, and this project
          verifies its own Potree v2 driver against Potree&rsquo;s own implementation. What follows
          is about architecture, API and integration — and then about speed, measured on the same
          hardware, the same data and the same camera, with the conditions written next to the
          numbers.
        </p>
      </section>

      <section className="shell">
        <div className="compare-table">
          <div className="compare-head">
            <span>DIMENSION</span>
            <span>POTREE</span>
            <span>VOXELKLOUD</span>
          </div>
          {rows.map((row) => (
            <div className="compare-row" key={row[0]}>
              {row.map((cell, i) => (
                <span className={i === 0 ? 'dim' : ''} key={i}>
                  {cell}
                </span>
              ))}
            </div>
          ))}
        </div>

        <div className="perf">
          <h2>Performance, measured</h2>
          <p className="lede">
            All four arms render the same cloud, from the same origin, at the same camera, to the
            same on-screen point count — about 2,999,500 points and 105 MB transferred each. That
            equalisation is what makes the rows below a comparison rather than four unrelated
            numbers.
          </p>
          <p className="lede">
            The <strong>voxelkloud</strong> column is what <code>npm install</code> gives you:{' '}
            <code>sinkMode</code> defaults to <code>&quot;auto&quot;</code>, which is the compute
            rasteriser wherever WebGPU provides a device. That default is itself a measurement —
            the instanced path costs ~320 ms of INP at this budget where compute costs 56.
          </p>

          <div className="perf-table">
            <div className="perf-head">
              <span>METRIC</span>
              <span>voxelkloud</span>
                <span>Potree 1.8</span>
              <span>potree-core</span>
            </div>
            {perf.map((row) => (
              <div className="perf-row" key={row.metric}>
                <span className="dim">{row.metric}</span>
                <span className={row.win === 0 ? 'perf-win' : undefined}>{row.vk}</span>
                <span className={row.win === 2 ? 'perf-win' : undefined}>{row.potree}</span>
                <span className={row.win === 3 ? 'perf-win' : undefined}>{row.core}</span>
              </div>
            ))}
          </div>

          <p className="perf-note">
            <strong>Conditions.</strong> Median of 2 cold runs, 26 August 2026. Chrome running
            headed on a real GPU — headless has no WebGPU adapter and would score a software
            rasteriser against WebGL. One origin serving every arm and the dataset, throttled to
            20 Mbit with 40 ms RTT. Autzen, camera at 0.25 of the longest extent, 3M point budget.
            The raw JSON is versioned in the monorepo. An earlier sitting was discarded: idle
            fps came back as exactly 50.0 for two different engines and exactly 25.0 for the
            third, and figures that round are missed vsync rather than a result — a background
            updater was taking 27% of a core. With it closed the same arms read 60.2, 59.5 and
            29.9.
          </p>
          <p className="perf-note">
            <strong>Why these deltas can be trusted.</strong> potree-core is unchanged code between
            this round and the previous one, so it doubles as a control — it reproduced its own
            first contentful paint, first ink and INP to within a few percent. The same control
            also shows that <em>visually complete</em> and <em>Speed Index</em> shifted scale for
            every arm between rounds, which is why neither is compared here against any earlier
            number.
          </p>
          <p className="perf-note">
            <strong>Speed Index measures each arm against its own final frame.</strong> A renderer
            whose finished image is sharper has further to travel and scores worse for it, and
            ours is sharper than Potree&rsquo;s — verified by screenshot. Some of that 1,918
            against 1,493 is the metric, not latency. How much, nobody has isolated, so the row
            stands as a loss.
          </p>
        </div>

        <div className="honest">
          <h3>What Potree still does better</h3>
          <ul>
            <li>
              Potree is a complete application — measuring tools, annotations, clipping volumes, the
              profile tool. voxelkloud is a rendering library, and a library is not an application.
            </li>
            <li>
              Potree has years of exposure to real-world clouds and real-world browsers. That is not
              a feature list, it is scar tissue, and it cannot be shortcut.
            </li>
            <li>
              WebGL runs everywhere today. voxelkloud wants WebGPU for its fast path, which is still
              a narrower set of machines.
            </li>
            <li>
              Potree is one artifact people have deployed for a decade. voxelkloud is fifteen
              packages at 0.5.1 and a CLI at 0.5.2 — every row above is installable today, but
              &ldquo;installable&rdquo; and &ldquo;battle-tested&rdquo; are not the same claim.
            </li>
            <li>
              PotreeConverter has converted a great deal of the world&rsquo;s LiDAR and is fast and
              IO-bound. <code>voxelkloud convert</code> is new. It is checked against
              PotreeConverter&rsquo;s own output on the same file — same quantum, same origin, same
              cube, same spacing, same record — but the two have never been timed against each
              other, and this table is the wrong place to claim a number nobody has earned.
            </li>
            <li>The GPU-side frame time has not been characterised.</li>
          </ul>
        </div>

        <p className="format-footnote">
          Already running Potree? <a href="../../from/potree/">What switching involves</a> — the
          short version is that your existing directory is read as it is.
        </p>
      </section>
    </PageFrame>
  )
}
