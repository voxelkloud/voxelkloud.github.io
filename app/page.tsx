'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { ArrowUpRight, Check, ChevronRight, Copy, Menu, X } from 'lucide-react'
import { BrandMark } from '@/components/brand-mark'

// three.js is ~600 KB and only ever paints the hero backdrop, so it stays out of
// the first paint and off the server render entirely.
const PointCloudScene = dynamic(
  () => import('@/components/point-cloud-scene').then((m) => m.PointCloudScene),
  { ssr: false },
)

// One repo per package, not a monorepo — `voxelkloud/voxelkloud` is a README
// that points at the others. There is nothing to clone, so nothing here offers
// a clone command.
const ORG = 'https://github.com/voxelkloud'
const REPOS: readonly (readonly [string, string])[] = [
  ['core', 'Vocabulary: bounding boxes, attributes, transport, octree math'],
  ['loader', 'Format identification and streaming over HTTP Range'],
  ['view', 'The WebGPU renderer and the LOD scheduler'],
  ['react', 'React bindings'],
  ['vue', 'Vue 3 bindings'],
  ['wasm-core', 'Rust LOD kernels, raw wasm'],
]

// Written against what is ON NPM, not against the working tree. A landing page
// sample exists to be pasted, and the source has moved ahead of 0.1.0 — the
// format matrix below says by how much.
const installs = {
  React: `import { PointCloudViewer } from '@voxelkloud/react'\n\n<PointCloudViewer\n  url="/pointclouds/my-cloud/"\n  lod={{ pointBudget: 3_000_000 }}\n/>`,
  Vue: `import { PointCloudViewer } from '@voxelkloud/vue'\n\n<PointCloudViewer\n  url="/pointclouds/my-cloud/"\n  :lod="{ pointBudget: 3_000_000 }"\n/>`,
  vanilla: `import { loadPointCloudSource, loadHierarchy } from '@voxelkloud/loader'\nimport { createPointCloudView } from '@voxelkloud/view'\n\nconst source = await loadPointCloudSource('/pointclouds/my-cloud/')\nconst hierarchy = await loadHierarchy(source)\n\nconst view = createPointCloudView({ canvas })\nawait view.init()\nview.addCloud(source, hierarchy)\nview.frameCloud()`,
}

const steps = [
  ['01', 'npm install @voxelkloud/react three', 'Or @voxelkloud/vue, or @voxelkloud/view and @voxelkloud/loader with no framework. three is a peer dependency: the renderer builds on WebGPURenderer and TSL, and you keep the version you already have.'],
  ['02', 'Point it at a cloud you already serve', 'A Potree v2 directory needs no reconversion — the same metadata.json, hierarchy.bin and octree.bin. The host has to answer 206 to a Range request, which is the same requirement Potree has.'],
  ['03', 'Take the scene back', 'view.camera and view.scene are your three.js objects. OrbitControls and every other add-on attach the way they always do.'],
]

const features = [
  ['01', 'Formats, not a format', 'Three read today, each a driver behind one contract: COPC as one streamed file, EPT off static hosting, and Potree v2 as the directory you already serve. Adding the third touched neither the scheduler nor the renderer, which is the only evidence that the seam is real.'],
  ['02', 'Your three.js scene', 'The renderer is WebGPU via three.js WebGPURenderer + TSL. view.camera and view.scene are yours — OrbitControls and other add-ons attach normally.'],
  ['03', 'Loader without baggage', 'The loader has no three and no DOM in its module graph. Run inspection, conversion, or the LOD scheduler in a worker or in Node.'],
  ['04', 'Know what quality costs', 'stats.limitedBy tells you whether the target screen error was met (error) or the point ceiling stopped selection (budget). No inert quality knob.'],
  ['05', 'Precision, deliberately', 'Positions are float32 relative to the cloud origin. Use positionFormat: "int32" for exact values, with float64 camera-relative model-view on highPrecision renderers.'],
  ['06', 'One frontier, few draws', 'The slab arena collapses a 1000-node frontier to <= 12 slabs. Memory is the deliberate tradeoff for fewer draw calls at low residency.'],
]

const knobs = [
  ['lod.targetScreenError', '1.35', 'Screen-space target for selection, in device pixels'],
  ['lod.pointBudget', '3,000,000', 'Maximum selected points'],
  ['material.colorMode', 'rgb', 'rgb / elevation / level / intensity / classification / flat'],
  ['edl', 'false', 'Potree’s exact 8-neighbour formulation'],
  ['decompress', '@voxelkloud/loader/brotli', 'Optional decoder for BROTLI clouds, never auto-imported'],
  ['sinkMode', '"arena"', '"arena" or "per-node"'],
  ['maxResidentBytes', '512 MiB', 'Least-recently-selected eviction'],
]

// The formats, as rows. Potree v2 is one of them — which is the whole point of
// the section and the reason it is not a two-column table any more.
//
// `state` is one of 'reads' | 'next' | 'later', and nothing is listed as
// shipping that does not have a driver and tests against a real file.
//
// `where` is the honest half. The drivers read these formats in the source and
// only the Potree one is on npm today, so a row that said "Reads it" with
// nothing else would send a reader to `npm install` for a viewer that cannot.
const formats = [
  {
    name: 'COPC',
    state: 'reads',
    where: 'source',
    what: 'One LAS 1.4 file with the octree inside it. Cloud Optimized Point Cloud.',
    convert: 'None',
    note: '364M points out of a 2 GB file, opened with three ranged reads totalling 0.79 MB.',
  },
  {
    name: 'EPT',
    state: 'reads',
    where: 'source',
    what: 'Entwine Point Tile: a manifest, JSON hierarchy pages, one file per node.',
    convert: 'None',
    note: 'Static hosting, no Range support required — which is how the USGS 3DEP archive is published.',
  },
  {
    name: 'Potree v2',
    state: 'reads',
    where: 'npm',
    what: 'The directory PotreeConverter writes: metadata.json, hierarchy.bin, octree.bin.',
    convert: 'Already done',
    note: 'DEFAULT and BROTLI. The deployment you already serve, read as it is.',
  },
  {
    name: 'LAS / LAZ',
    state: 'next',
    what: 'A single file with no index. Drag it onto the page.',
    convert: 'voxelkloud convert',
    note: 'The command line gives one an index today. Reading it in the page, with no conversion step at all, is what is next.',
  },
  {
    name: 'E57',
    state: 'next',
    what: 'The terrestrial-scanner interchange format.',
    convert: 'In the browser',
    note: 'XML section plus binary sections — closer to a driver of its own than to a parser.',
  },
  {
    name: '3D Tiles',
    state: 'later',
    what: 'OGC tileset, glTF payloads, geometric error rather than point spacing.',
    convert: 'None',
    note: 'The scheduler was generalised for it and holds a tile error the same way it holds a point pitch. Waiting on demand, not on work.',
  },
]

const navLinks = [
  ['#run', 'Install'],
  ['#features', 'Features'],
  ['#formats', 'Formats'],
  ['#measurements', 'Measured'],
]

export default function Page() {
  const [tab, setTab] = useState<keyof typeof installs>('React')
  const [copied, setCopied] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const pkg = tab === 'vanilla' ? 'view' : tab.toLowerCase()

  async function copyInstall() {
    try {
      await navigator.clipboard.writeText(`npm install @voxelkloud/${pkg}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard is permission-gated and absent over plain http — the command
      // is on screen either way, so a failure needs no theatre.
    }
  }

  return (
    <main>
      <nav className="nav shell">
        <a className="brand" href="#top">
          <BrandMark /> voxelkloud
        </a>
        <div className={`nav-links ${menuOpen ? 'is-open' : ''}`} id="nav-links">
          {navLinks.map(([href, label]) => (
            <a key={href} href={href} onClick={() => setMenuOpen(false)}>
              {label}
            </a>
          ))}
          <a className="nav-github" href={ORG} rel="noreferrer" target="_blank">
            <ArrowUpRight aria-hidden="true" size={14} /> GitHub
          </a>
        </div>
        <button
          aria-controls="nav-links"
          aria-expanded={menuOpen}
          aria-label="Toggle navigation"
          className="menu-button"
          onClick={() => setMenuOpen(!menuOpen)}
          type="button"
        >
          {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </nav>

      <section className="hero shell" id="top">
        <p className="eyebrow">
          <span className="pulse" aria-hidden="true" /> POINT CLOUDS / WEBGPU / TYPESCRIPT
        </p>
        <h1>
          Point clouds,
          <br />
          <em>without the black box.</em>
        </h1>
        <p className="hero-copy">
          An npm-installable point cloud renderer for the web. One renderer, three ways in: React,
          Vue, or no framework.
        </p>
        <div className="hero-actions">
          <a className="button button-primary" href={ORG} rel="noreferrer" target="_blank">
            View on GitHub <ArrowUpRight aria-hidden="true" size={16} />
          </a>
          <a className="button button-quiet" href="#install">
            Get started <ChevronRight aria-hidden="true" size={16} />
          </a>
        </div>
        <div className="hero-point-cloud" aria-hidden="true">
          <PointCloudScene />
        </div>
      </section>

      <section className="install-section shell" id="install">
        <p className="section-kicker">01 / START HERE</p>
        <div className="install-heading">
          <h2>
            Three entry points.
            <br />
            The same view.
          </h2>
          <span className="status-note">ON NPM · 0.1.0</span>
        </div>
        <div className="install-card">
          <div className="install-tabs" role="tablist">
            {(Object.keys(installs) as Array<keyof typeof installs>).map((name) => (
              <button
                aria-selected={tab === name}
                className={tab === name ? 'active' : ''}
                key={name}
                onClick={() => setTab(name)}
                role="tab"
                type="button"
              >
                {name}
              </button>
            ))}
          </div>
          <div className="code-head">
            <span>install</span>
            <button className="copy-button" onClick={copyInstall} type="button">
              {copied ? (
                <>
                  <Check aria-hidden="true" size={14} /> copied
                </>
              ) : (
                <>
                  <Copy aria-hidden="true" size={14} /> copy
                </>
              )}
            </button>
          </div>
          <p className="install-command">
            <span className="prompt" aria-hidden="true">
              $
            </span>{' '}
            npm install @voxelkloud/{pkg}
          </p>
          <pre>
            <code>{installs[tab]}</code>
          </pre>
        </div>
      </section>

      <section className="run shell" id="run">
        <p className="section-kicker">02 / INSTALL IT</p>
        <div className="two-col-heading">
          <h2>
            No app to adopt.
            <br />
            <em>Packages to install.</em>
          </h2>
          <div>
            <p>
              Three steps from npm to a cloud on screen, into a page you already have. There is no
              bundle to copy and no viewer to configure around.
            </p>
            <span className="status-note">DRIVERS AWAITING RELEASE</span>
          </div>
        </div>
        <div className="run-grid">
          <ol className="run-steps">
            {steps.map(([num, command, note]) => (
              <li className="run-step" key={num}>
                <span className="run-num">{num}</span>
                <code>{command}</code>
                <span>{note}</span>
              </li>
            ))}
          </ol>
          <aside className="run-aside">
            <h3>What it asks of you</h3>
            <ul>
              <li>three.js as a peer dependency, and a bundler that speaks ESM.</li>
              <li>
                A browser with WebGPU. Headless has no adapter, and the WebGL2 fallback on
                SwiftShader is not a demo — it is a slideshow.
              </li>
              <li>A host that honours HTTP Range. Without it nothing streams, here or anywhere.</li>
            </ul>
            <h3 className="repos-heading">Source</h3>
            <ul className="repos">
              {REPOS.map(([name, what]) => (
                <li key={name}>
                  <a href={`${ORG}/${name}`} rel="noreferrer" target="_blank">
                    voxelkloud/{name}
                  </a>
                  <span>{what}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <section className="features shell" id="features">
        <p className="section-kicker">03 / THE SHAPE OF IT</p>
        <h2>
          Built around the
          <br />
          <em>actual problem.</em>
        </h2>
        <div className="feature-grid">
          {features.map(([num, title, body]) => (
            <article className="feature" key={num}>
              <span className="feature-num">{num}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="knobs shell" id="knobs">
        <p className="section-kicker">04 / CONTROL SURFACE</p>
        <div className="two-col-heading">
          <h2>
            <em>Real render control.</em>
          </h2>
          <p>Every setting maps to a real decision in the selection, memory, or shading pipeline.</p>
        </div>
        <div className="knob-table">
          {knobs.map(([name, value, desc]) => (
            <div className="knob-row" key={name}>
              <code>{name}</code>
              <strong>{value}</strong>
              <span>{desc}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="formats shell" id="formats">
        <p className="section-kicker">05 / FORMATS</p>
        <h2>
          Point clouds are published in
          <br />
          <em>more than one format.</em>
        </h2>
        <p className="lede">
          Each one is a driver behind a single contract, so the scheduler and the renderer never
          learn which is which. Three read today. The rows below say which, and what each still
          costs you.
        </p>
        <div className="format-table">
          <div className="format-head">
            <span>FORMAT</span>
            <span>WHAT IT IS</span>
            <span>CONVERSION</span>
            <span>STATUS</span>
          </div>
          {formats.map((row) => (
            <div className="format-row" key={row.name}>
              <span className="format-name">{row.name}</span>
              <span>
                {row.what}
                <em className="format-note">{row.note}</em>
              </span>
              <span className="dim">{row.convert}</span>
              <span className="format-status">
                <span className={`badge badge-${row.state}`}>
                  {row.state === 'reads' ? 'Reads it' : row.state === 'next' ? 'Next' : 'On demand'}
                </span>
                {row.where !== undefined && (
                  <em className="format-where">
                    {row.where === 'npm' ? 'on npm' : 'in source'}
                  </em>
                )}
              </span>
            </div>
          ))}
        </div>
        <p className="format-footnote">
          <strong>In source, not yet on npm.</strong> The 0.1.0 packages on npm read Potree v2 and
          nothing else — the COPC and EPT drivers are written, tested against real files, and
          waiting on a release. Until then <code>npm install</code> gets you the Potree stack.
        </p>
        <p className="format-footnote">
          <strong>A file with no index has to become one.</strong>{' '}
          <code>voxelkloud convert</code> does that — LAS, LAZ or COPC in; COPC, EPT or Potree v2
          out, and several inputs merged into one cloud. <code>voxelkloud doctor</code> is the other
          half: it grades a deployment you already have, whichever tool built it, on the things
          every format here depends on — byte ranges, CORS, and whether something is compressing a
          payload that is already compressed. Both are in source with the drivers; neither is on
          npm yet.
        </p>
        <p className="format-footnote">
          Coming from Potree? <a href="./compare/potree/">How the two compare</a> and{' '}
          <a href="./from/potree/">what switching involves</a> — including what Potree still does
          better.
        </p>
      </section>

      <section className="measurements shell" id="measurements">
        <p className="section-kicker">06 / MEASURED, NOT PROMISED</p>
        <h2>
          Numbers with
          <br />
          <em>the caveats attached.</em>
        </h2>
        <div className="measure-grid">
          <div className="measure-card">
            <strong>
              0.9—2.8 <small>ms</small>
            </strong>
            <span>CPU cost per frame · 1.10M to 4.57M selected points</span>
          </div>
          <div className="measure-card">
            <strong>
              59.6 <small>Hz</small>
            </strong>
            <span>Served at every stop · vsync-locked on a real GPU</span>
          </div>
          <div className="measure-card">
            <strong>
              0.1—0.5 <small>ms</small>
            </strong>
            <span>LOD selection at shipped defaults</span>
          </div>
          <div className="measure-card">
            <strong>112 / 199 / 273</strong>
            <span>Manifest / hierarchy / point data tests</span>
          </div>
        </div>
        <p className="caveat">
          Measured on autzen with WebGPU backend, 20M budget, 120 frames. The GPU’s own headroom is{' '}
          <strong>not measured</strong>, and never will be through a present-locked timer.
        </p>
      </section>

      <footer className="footer shell">
        <a className="brand" href="#top">
          <BrandMark /> voxelkloud
        </a>
        <span>
          MIT licensed ·{' '}
          <a href={ORG} rel="noreferrer" target="_blank">
            source on GitHub
          </a>
        </span>
        <span>
          @voxelkloud/loader vendors the Brotli Authors’ reference decoder behind{' '}
          <code>@voxelkloud/loader/brotli</code>.
        </span>
      </footer>
    </main>
  )
}
