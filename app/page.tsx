'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { ArrowUpRight, Check, ChevronRight, Copy, Menu, X } from 'lucide-react'
import { BenchSlider } from '@/components/bench-slider'
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
/** Only the count is shown; the list itself lives on GitHub and on npm. */
const REPO_COUNT = 15

// Written against what is ON NPM, not against the working tree. A landing page
// sample exists to be pasted, so it has to run against `npm install` today:
// 0.5.1 for the scoped packages, 0.5.2 for the CLI.
const installs = {
  React: `import { PointCloudViewer } from '@voxelkloud/react'\n\n<PointCloudViewer\n  url="/pointclouds/my-cloud/"\n  lod={{ pointBudget: 3_000_000 }}\n/>`,
  Vue: `import { PointCloudViewer } from '@voxelkloud/vue'\n\n<PointCloudViewer\n  url="/pointclouds/my-cloud/"\n  :lod="{ pointBudget: 3_000_000 }"\n/>`,
  vanilla: `import { loadPointCloud } from '@voxelkloud/loader'\nimport { createPointCloudView } from '@voxelkloud/view'\n\nconst { source, tree, openPoints } = await loadPointCloud('/pointclouds/my-cloud/')\n\nconst view = createPointCloudView({ canvas })\nawait view.init()\nview.addCloud(source, tree, openPoints)\nview.frameCloud()`,
}

const steps = [
  ['01', 'npm install @voxelkloud/react three', 'Or use @voxelkloud/vue, or `@voxelkloud/view` and `@voxelkloud/loader` directly. `three` stays a peer dependency because the renderer builds on `WebGPURenderer` and TSL.'],
  ['02', 'Load a URL, not a format branch', 'The loader resolves the URL to the matching driver and returns `source`, `tree`, and `openPoints`. A Potree v2 directory, COPC file, EPT layout, 3D Tiles tileset, or a bare LAZ each lands in the same neutral contract.'],
  ['03', 'Pass the objects into the view', 'The view owns the renderer, camera, and selection loop. `view.camera` and `view.scene` stay available for controls, picking, measurements, and anything else your app needs.'],
]

const features = [
  ['01', 'One vocabulary, not six', 'Bounding boxes, coordinates, transport and octree maths are defined once, in `@voxelkloud/core`, and every other package reads those same definitions. Nothing has to translate between packages, so nothing gets lost translating.'],
  ['02', 'Point at a URL', '`@voxelkloud/loader` works out the format from the address and hands back the same shape whatever it found. Your code has no branch in it for COPC versus EPT versus Potree.'],
  ['03', 'The scene stays yours', '`@voxelkloud/view` drives the GPU, but `view.camera` and `view.scene` are ordinary three.js objects. Add a mesh, move the camera, run your own frame loop — the renderer is a participant in your scene, not the owner of it.'],
  ['04', 'React and Vue are wrappers, not forks', 'They handle mounting and unmounting, and nothing else. A feature reaches them the day it lands in the renderer, because there is no second copy of it to update.'],
  ['05', 'You can see why a frame looks the way it does', 'Set a target error and a point budget, then read back what actually bound. `stats.limitedBy` says whether it was quality or the budget — so tuning is reading a number, not guessing.'],
  ['06', 'You ship the formats you read', 'COPC, EPT, Potree v2, 3D Tiles and the no-index tier are separate installs. Read one format and your bundle carries one reader.'],
  ['07', 'Click a point, get the point', '`pickPoint` turns a screen position into real survey coordinates at full precision, not a rounded guess. `heightAt` answers ground height straight away, with no round trip to a server.'],
  ['08', 'Two surveys, one scene', 'Clouds captured in different coordinate systems line up, because `@voxelkloud/wasm-proj` converts between them. Place a whole cloud at once, or convert every point.'],
  ['09', 'There is a command line too', '`voxelkloud` inspects a cloud, tells you whether your server is delivering it properly, converts a file that arrived with no index, and renders a thumbnail without opening a browser.'],
]

const knobs = [
  ['lod.targetScreenError', '1.35', 'Screen-space target for selection, in device pixels'],
  ['lod.pointBudget', '3,000,000', 'Maximum selected points'],
  ['material.colorMode', 'rgb', 'rgb / elevation / level / intensity / classification / flat'],
  ['edl', 'false', 'Potree’s exact 8-neighbour formulation'],
  ['decompress', '@voxelkloud/loader/brotli', 'Optional decoder for BROTLI clouds, never auto-imported'],
  ['sinkMode', '"auto"', 'Compute on WebGPU, else points on WebGL 2; "compute", "points", "arena", "per-node" pin one'],
  ['maxResidentBytes', '512 MiB', 'Least-recently-selected eviction'],
]

// The formats, as rows. Potree v2 is one of them — which is the whole point of
// the section and the reason it is not a two-column table any more.
//
// `state` is one of 'reads' | 'next' | 'later', and nothing is listed as
// shipping that does not have a driver and tests against a real file.
//
// `where` is the honest half: the package you actually install to get that row.
// Every driver is on npm as of 0.5.1, so `where` names it rather than saying
// "source" — a reader who wants COPC should not have to guess which package.
const formats = [
  {
    name: 'COPC',
    state: 'reads',
    where: '@voxelkloud/format-copc',
    what: 'One LAS 1.4 file with the octree inside it. Cloud Optimized Point Cloud.',
    convert: 'None',
    note: '364M points out of a 2 GB file, opened with three ranged reads totalling 0.79 MB.',
  },
  {
    name: 'EPT',
    state: 'reads',
    where: '@voxelkloud/format-ept',
    what: 'Entwine Point Tile: a manifest, JSON hierarchy pages, one file per node.',
    convert: 'None',
    note: 'Static hosting, no Range support required — which is how the USGS 3DEP archive is published.',
  },
  {
    name: 'Potree v2',
    state: 'reads',
    where: '@voxelkloud/format-potree',
    what: 'The directory PotreeConverter writes: metadata.json, hierarchy.bin, octree.bin.',
    convert: 'Already done',
    note: 'DEFAULT and BROTLI. The deployment you already serve, read as it is.',
  },
  {
    name: 'LAS / LAZ',
    state: 'reads',
    where: '@voxelkloud/format-single',
    what: 'A single file with no index. Drag it onto the page.',
    convert: 'In the browser',
    note: 'The octree is built in a worker from the converter\'s own partitioner, compiled to wasm. 20M points is the ceiling; past that, convert it.',
  },
  {
    name: 'E57',
    state: 'reads',
    where: '@voxelkloud/format-single',
    what: 'The terrestrial-scanner interchange format. FARO, Leica, Trimble.',
    convert: 'In the browser, or voxelkloud convert',
    note: 'Scan poses applied, spherical coordinates converted, and the no-returns dropped rather than piled at the origin — 215,329 of the 370,530 records in libE57\'s own pump scan.',
  },
  {
    name: '3D Tiles',
    state: 'reads',
    where: '@voxelkloud/format-3dtiles',
    what: 'OGC tileset, glTF payloads, geometric error rather than point spacing.',
    convert: 'None',
    note: 'tileset.json, external tilesets, implicit tiling, and content as .pnts or glTF POINTS. The scheduler holds a tile error the same way it holds a point pitch.',
  },
]

const navLinks = [
  ['./docs/', 'Docs'],
  ['#run', 'Packages'],
  ['#features', 'Why it is split'],
  ['#formats', 'Inputs'],
  ['#measurements', 'Tests'],
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
          Point cloud rendering,
          <br />
          <em>with the pieces exposed.</em>
        </h1>
        <p className="hero-copy">
          A point-cloud stack split into a neutral core, a loader, a renderer, and thin
          bindings. WebGPU where the browser has it, WebGL 2 where it does not. Install the
          pieces you need and keep the rest out of your bundle.
        </p>
        <div className="hero-actions">
          <a className="button button-primary" href={ORG} rel="noreferrer" target="_blank">
            View on GitHub <ArrowUpRight aria-hidden="true" size={16} />
          </a>
          <a className="button button-quiet" href="#install">
            Read docs <ChevronRight aria-hidden="true" size={16} />
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
            Install the pieces you need.
            <br />
            One package per job.
          </h2>
          <span className="status-note">PUBLIC PACKAGES</span>
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
        <div className="install-meta">
          <p>
            Need the technical reference? The docs page covers the loader contract, LOD
            selection, culling, and the public package entry points.
          </p>
          <a className="button button-quiet" href="./docs/">
            Open docs <ChevronRight aria-hidden="true" size={16} />
          </a>
        </div>
      </section>

      <section className="run shell" id="run">
        <p className="section-kicker">02 / PACKAGE BOUNDARIES</p>
        <div className="two-col-heading">
          <h2>
            What each package owns.
            <br />
            <em>Nothing more.</em>
          </h2>
          <div>
            <p>
              The split is the point: `core` owns the shared types and math, `loader` resolves a URL
              to a source and tree, `view` renders, and React or Vue only handles lifecycle.
            </p>
            <span className="status-note">LOADER / VIEW / BINDINGS</span>
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
            <h3>What you need</h3>
            <ul>
              <li>three.js as a peer dependency, and a bundler that speaks ESM.</li>
              <li>
                WebGPU where the browser has it, WebGL 2 everywhere else — the fallback is a
                second full rasteriser, not a degraded mode, and it holds the same frame rate.
                What is genuinely a slideshow is SwiftShader: headless has no GPU adapter at
                all, so measure in a real browser.
              </li>
              <li>A host that honours HTTP Range. Without it nothing streams, here or anywhere.</li>
            </ul>
            <h3 className="repos-heading">Public packages</h3>
            <p className="repos-summary">
              <strong>{REPO_COUNT} packages</strong>, each in its own repository and each on npm:
              the core, the loader, the renderer, the framework bindings, six format drivers, the
              wasm kernels, and the CLI.{' '}
              <a href={ORG} rel="noreferrer" target="_blank">
                See them all on GitHub <ArrowUpRight aria-hidden="true" size={13} />
              </a>
            </p>
          </aside>
        </div>
      </section>

      <section className="features shell" id="features">
        <p className="section-kicker">03 / WHY IT IS SPLIT</p>
        <h2>
          Responsibilities stay
          <br />
          <em>separate on purpose.</em>
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
        <p className="section-kicker">04 / CONFIGURATION</p>
        <div className="two-col-heading">
          <h2>
            <em>Runtime knobs.</em>
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
        <p className="section-kicker">05 / SUPPORTED INPUTS</p>
        <h2>
          Each input has its own
          <br />
          <em>driver and entry point.</em>
        </h2>
        <p className="lede">
          Use the driver that matches the data you already have. The rows below show what each
          format expects and the package or command that opens it.
        </p>
        <div className="format-table">
          <div className="format-head">
            <span>FORMAT</span>
            <span>WHAT IT IS</span>
            <span>ENTRY</span>
            <span>AVAILABILITY</span>
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
                  {row.state === 'reads' ? 'Public' : row.state === 'next' ? 'Working' : 'Planned'}
                </span>
                {row.where !== undefined && (
                  <em className="format-where">{row.where}</em>
                )}
              </span>
            </div>
          ))}
        </div>
        <p className="format-footnote">
          <strong>Release status.</strong> Every driver above is on npm at 0.5.1, and the CLI at
          0.5.2. <code>@voxelkloud/loader</code> registers the Potree v2 driver for you; the
          others install alongside it and register themselves, so a bundle only carries the
          readers it actually uses.
        </p>
        <p className="format-footnote">
          <strong>There is a command line too.</strong> <code>voxelkloud convert</code> turns
          LAS, LAZ, E57 or COPC into an indexed cloud. <code>voxelkloud doctor</code> grades byte
          ranges, CORS, encoding and MIME on a deployment you already have.{' '}
          <code>voxelkloud optimize</code> re-encodes a cloud for delivery without rebuilding its
          tree, and <code>voxelkloud snapshot</code> renders a PNG thumbnail on the CPU with no
          browser involved. <code>npm install -g voxelkloud</code>.
        </p>
        <p className="format-footnote">
          <strong>Have a file with no index?</strong>{' '}
          <a href="./convert/">Convert it in your browser</a> — drop a{' '}
          <code>.laz</code> in and get a <code>.copc.laz</code> back, with nothing uploaded. The
          same partitioner the command line runs, compiled to wasm.
        </p>
        <p className="format-footnote">
          Migrating from Potree?{' '}
          <a href="./compare/potree/">Read the migration notes</a> and{' '}
          <a href="./from/potree/">the switch checklist</a>.
        </p>
      </section>

      <section className="measurements shell" id="measurements">
        <p className="section-kicker">06 / TEST DATA</p>
        <h2>
          What was measured
          <br />
          <em>and under which conditions.</em>
        </h2>
        <BenchSlider />

        <div className="head2head">
          <div className="head2head-copy">
            <h3>Against Potree, on the same cloud</h3>
            <p>
              Same origin, same camera, same 3M points on screen, median of 2 cold runs. Seven
              of nine rows go to voxelkloud:
            </p>
          </div>
          <div className="head2head-stats">
            <div>
              <strong>56 ms</strong>
              <span>INP · Potree 104, potree-core 200</span>
            </div>
            <div>
              <strong>522 ms</strong>
              <span>first ink · Potree 1,233, potree-core 622</span>
            </div>
            <div>
              <strong>66.6 MB</strong>
              <span>JS heap · Potree 254, potree-core 212</span>
            </div>
          </div>
          <p className="head2head-loss">
            Two go the other way, both in the tail rather than the start:{' '}
            <strong>Speed Index</strong> (1,918 against Potree’s 1,493) and{' '}
            <strong>visually complete</strong> (23.5 s against 21.4 s).{' '}
            <a href="./compare/potree/">The full table, the conditions, and why the Speed Index
            row is partly an artefact of the metric</a>.
          </p>
        </div>
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
