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

// The monorepo is not on GitHub yet, so the links point at the org. The clone
// command names it anyway, because that is the command — the section says so.
const ORG = 'https://github.com/voxelkloud'
const MONOREPO = 'https://github.com/voxelkloud/voxelkloud'

const installs = {
  React: `import { PointCloudViewer } from '@voxelkloud/react'\n\n<PointCloudViewer\n  source="/cloud/metadata.json"\n  lod={{ pointBudget: 3_000_000 }}\n/>`,
  Vue: `import { PointCloudViewer } from '@voxelkloud/vue'\n\n<PointCloudViewer\n  source="/cloud/metadata.json"\n  :lod="{ pointBudget: 3_000_000 }"\n/>`,
  vanilla: `import { createView } from '@voxelkloud/view'\n\nconst view = await createView(canvas, {\n  source: '/cloud/metadata.json'\n})`,
}

const steps = [
  ['01', `git clone ${MONOREPO}`, 'The monorepo: loader, view, React and Vue bindings, demo app, demo server.'],
  ['02', 'pnpm install && pnpm build', 'The demo resolves the workspace packages from dist. wasm-core needs cargo; without it that one package fails and the TypeScript scheduler — the path that ships by default — carries on.'],
  ['03', 'python3 demo/data/generate.py', 'Writes the 17.5k-point synthetic fixture into demo/data/synthetic. The real scans come from demo/data/fetch-large.sh and the PotreeConverter image.'],
  ['04', 'pnpm demo:server & pnpm demo:app', 'Range-capable static server on :8080, Vite on :5173.'],
]

const features = [
  ['01', 'Potree v2, as-is', 'Point the loader at the same directory your Potree already serves. DEFAULT and BROTLI encodings are both supported, with no reconversion step.'],
  ['02', 'Your three.js scene', 'The renderer is WebGPU via three.js WebGPURenderer + TSL. view.camera and view.scene are yours — OrbitControls and other add-ons attach normally.'],
  ['03', 'Loader without baggage', 'The loader has no three and no DOM in its module graph. Run inspection, conversion, or the LOD scheduler in a worker or in Node.'],
  ['04', 'Know what quality costs', 'stats.limitedBy tells you whether the target spacing was met (error) or the point ceiling stopped selection (budget). No inert quality knob.'],
  ['05', 'Precision, deliberately', 'Positions are float32 relative to the cloud origin. Use positionFormat: "int32" for exact values, with float64 camera-relative model-view on highPrecision renderers.'],
  ['06', 'One frontier, few draws', 'The slab arena collapses a 1000-node frontier to <= 12 slabs. Memory is the deliberate tradeoff for fewer draw calls at low residency.'],
]

const knobs = [
  ['lod.targetPixelSpacing', '1.35', 'Screen-space target for selection'],
  ['lod.pointBudget', '3,000,000', 'Maximum selected points'],
  ['material.colorMode', 'rgb', 'rgb / elevation / level / intensity / classification / flat'],
  ['edl', 'false', 'Potree’s exact 8-neighbour formulation'],
  ['decompress', '"brotli"', 'Optional vendored decoder, never auto-imported'],
  ['sinkMode', '"arena"', '"arena" or "per-node"'],
  ['maxResidentBytes', '512 MiB', 'Least-recently-selected eviction'],
]

const comparison = [
  ['Delivery', 'An app/bundle you copy into your page', 'npm packages, ESM, TypeScript, tree-shakeable'],
  ['Renderer', 'WebGL', 'WebGPU via three.js WebGPURenderer + TSL'],
  ['Scene', 'The viewer owns the loop and the scene', 'view.camera / view.scene are your three objects'],
  ['Frameworks', 'Hand-rolled integration', 'First-party React and Vue bindings'],
  ['Standalone loader', 'Coupled to the viewer', 'No three, no DOM: Node and worker'],
  ['Data format', 'Potree v2 (the origin)', 'The same Potree v2, DEFAULT and BROTLI'],
  ['Diagnostics', '—', 'stats.limitedBy: error vs budget'],
  ['Types', 'JS', 'TypeScript end to end'],
  ['License', 'BSD 2-Clause', 'MIT'],
]

const navLinks = [
  ['#run', 'Run it'],
  ['#features', 'Features'],
  ['#comparison', 'Potree'],
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
          A modern, npm-installable viewer for Potree v2 data. One renderer, three ways in: React, Vue,
          or no framework.
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
          <span className="status-note">NOT PUBLISHED TO NPM YET</span>
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
        <p className="section-kicker">02 / RUN IT</p>
        <div className="two-col-heading">
          <h2>
            No hosted demo.
            <br />
            <em>Run it yourself.</em>
          </h2>
          <div>
            <p>
              Four commands from a clean clone to a cloud on screen. The datasets are not in the repo
              — the recipes that build them are.
            </p>
            <span className="status-note">MONOREPO NOT PUBLIC YET</span>
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
              <li>Node 20+ and pnpm.</li>
              <li>
                A browser with WebGPU. Headless has no adapter, and the WebGL2 fallback on SwiftShader
                is not a demo — it is a slideshow.
              </li>
              <li>Python 3 for the synthetic fixture; Docker for the converted scans.</li>
            </ul>
            <p>
              The demo keeps its state in the address bar, so a screenshot names its own
              configuration: <code>?dataset=</code>, <code>?color=</code>, <code>?edl=</code>,{' '}
              <code>?sink=</code>, <code>?bench=1</code>.
            </p>
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

      <section className="comparison shell" id="comparison">
        <p className="section-kicker">05 / A SUCCESSOR, NOT A REWRITE</p>
        <h2>
          Potree made the format.
          <br />
          <em>voxelkloud builds on it.</em>
        </h2>
        <p className="lede">
          The comparison is about architecture, API, and integration — not speed. voxelkloud reads the
          format Potree defined and makes it composable.
        </p>
        <div className="compare-table">
          <div className="compare-head">
            <span>DIMENSION</span>
            <span>POTREE</span>
            <span>VOXELKLOUD</span>
          </div>
          {comparison.map((row) => (
            <div className="compare-row" key={row[0]}>
              {row.map((cell, i) => (
                <span className={i === 0 ? 'dim' : ''} key={i}>
                  {cell}
                </span>
              ))}
            </div>
          ))}
        </div>
        <div className="honest">
          <h3>What Potree still does better</h3>
          <ul>
            <li>
              Potree is a complete application with measuring tools, annotations, clipping volumes,
              and the profile tool. voxelkloud is a rendering library.
            </li>
            <li>Potree has years of exposure to real-world clouds and real-world browsers.</li>
            <li>voxelkloud wants WebGPU for the fast path.</li>
            <li>The packages are still at version 0.0.0 and are not published to npm yet.</li>
            <li>The GPU-side frame time has not been characterised.</li>
          </ul>
        </div>
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
