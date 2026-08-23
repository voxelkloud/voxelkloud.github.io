import type { Metadata } from 'next'
import { PageFrame } from '@/components/page-frame'

export const metadata: Metadata = {
  title: 'voxelkloud vs Potree — a point cloud renderer comparison',
  description:
    'How voxelkloud and Potree differ: npm packages against a bundled app, WebGPU against WebGL, your three.js scene against a viewer that owns it. Plus an honest list of what Potree still does better.',
  alternates: { canonical: './' },
}

/**
 * Architecture and integration. NOT speed.
 *
 * Every row here is something a reader can verify by looking at either project.
 * There is no benchmark row, because no honest one exists: the two have not been
 * measured against each other on the same hardware with the same data, and a
 * table is the wrong place to put a number that has not been earned.
 */
const rows: readonly (readonly [string, string, string])[] = [
  ['Delivery', 'An app or bundle you copy into your page', 'npm packages, ESM, TypeScript, tree-shakeable'],
  ['Renderer', 'WebGL', 'WebGPU via three.js WebGPURenderer + TSL'],
  ['Scene', 'The viewer owns the loop and the scene', 'view.camera and view.scene are your three objects'],
  ['Frameworks', 'Hand-rolled integration', 'First-party React and Vue bindings'],
  ['Standalone loader', 'Coupled to the viewer', 'No three, no DOM: runs in Node and in a worker'],
  ['Potree v2', 'The origin of the format', 'Reads it as it is, DEFAULT and BROTLI'],
  ['COPC', 'Reads it', 'Reads it in source, streamed by HTTP Range, no conversion — not released yet'],
  ['EPT', 'Reads it', 'Reads it in source: binary, laszip, zstandard with a supplied decoder — not released yet'],
  ['Single-file LAS/LAZ', 'Reads it', 'Not yet — the decoder is there, the client-side octree is not'],
  ['E57', 'Reads it', 'Not yet'],
  ['Conversion', 'PotreeConverter, a CLI', 'voxelkloud convert: a Rust library and a CLI, writing COPC, EPT or Potree v2 — in source, not released yet'],
  ['Deployment checks', '—', 'voxelkloud doctor grades a served cloud on ranges, CORS and encoding — including a Potree one'],
  ['Diagnostics', '—', 'stats.limitedBy: whether quality or the point budget stopped selection'],
  ['Types', 'JavaScript', 'TypeScript end to end'],
  ['License', 'BSD 2-Clause', 'MIT'],
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
          is about architecture, API and integration. It is not about speed: the two have never been
          measured against each other on the same hardware with the same data, so there is no such
          row.
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
              What is on npm today is 0.1.0, and it reads Potree v2 only. The COPC and EPT drivers
              exist in the source and have not been released, so a fair comparison of the two
              installable things is narrower than the table above.
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
