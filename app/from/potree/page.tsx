import type { Metadata } from 'next'
import { PageFrame } from '@/components/page-frame'

export const metadata: Metadata = {
  title: 'Migrating from Potree — your data comes as it is',
  description:
    'Switch a Potree deployment to voxelkloud without reconverting: the same metadata.json, hierarchy.bin and octree.bin, read by a driver instead of a bundled viewer. React, Vue, or no framework.',
  alternates: { canonical: './' },
}

const REACT = `import { PointCloudViewer } from '@voxelkloud/react'

// The same directory PotreeConverter already wrote.
<PointCloudViewer
  url="/pointclouds/my-cloud/"
  lod={{ pointBudget: 3_000_000 }}
/>`

const VANILLA = `import { loadPointCloudSource, loadHierarchy } from '@voxelkloud/loader'
import { createPointCloudView } from '@voxelkloud/view'

const source = await loadPointCloudSource('/pointclouds/my-cloud/')
const hierarchy = await loadHierarchy(source)

const view = createPointCloudView({ canvas })
await view.init()
view.addCloud(source, hierarchy)
view.frameCloud()

// view.scene and view.camera are your three.js objects.
new OrbitControls(view.camera, canvas)`

const BROTLI = `import { brotliDecompress } from '@voxelkloud/loader/brotli'

createPointCloudView({ canvas, decompress: brotliDecompress })`

export default function FromPotree() {
  return (
    <PageFrame home="../../">
      <section className="sub-hero shell">
        <p className="section-kicker">MIGRATING</p>
        <h1>
          Already running Potree?
          <br />
          <em>Your data comes as it is.</em>
        </h1>
        <p className="lede">
          There is no reconversion step. The <code>metadata.json</code>,{' '}
          <code>hierarchy.bin</code> and <code>octree.bin</code> already on your server are what the
          Potree v2 driver reads — the same bytes, over the same HTTP Range requests, verified
          against Potree&rsquo;s own implementation. What changes is the code around them.
        </p>
      </section>

      <section className="shell sub-section">
        <h2>What you point it at</h2>
        <p className="lede">
          Either the directory or the <code>metadata.json</code> inside it. The loader identifies
          the format from what it finds, which is why the same call is meant to keep working if you
          later republish the cloud as COPC or EPT — those drivers are written and not yet
          released.
        </p>
        <pre className="code-block">
          <code>{REACT}</code>
        </pre>
        <p className="lede">Or without a framework, where the three.js scene stays yours:</p>
        <pre className="code-block">
          <code>{VANILLA}</code>
        </pre>
      </section>

      <section className="shell sub-section">
        <h2>The two things that catch people</h2>
        <div className="gotchas">
          <div>
            <h3>BROTLI clouds need a decoder</h3>
            <p>
              No browser exposes brotli to JavaScript — <code>DecompressionStream</code> handles
              gzip and deflate only — so a cloud converted with <code>--encoding BROTLI</code> needs
              one passed in. It is a separate subpath so the ~180 KB never lands in a bundle that
              does not need it.
            </p>
            <pre className="code-block">
              <code>{BROTLI}</code>
            </pre>
          </div>
          <div>
            <h3>Range requests are not optional</h3>
            <p>
              Streaming a cloud means asking for byte ranges of <code>octree.bin</code>. A host that
              answers <code>200</code> to a <code>Range</code> request instead of <code>206</code>{' '}
              cannot serve one — the same requirement Potree has, and the same misconfiguration that
              breaks it.
            </p>
            <p>
              <code>voxelkloud doctor &lt;url&gt;</code> asks your host directly: whether it answers{' '}
              <code>206</code>, whether a browser is allowed to read the range headers back, and
              whether something in front of it is compressing a payload that is already compressed.
              It grades the Potree deployment you have today and exits non-zero when one of them is
              wrong. In source with the drivers; not on npm yet.
            </p>
          </div>
        </div>
      </section>

      <section className="shell sub-section">
        <h2>What you should know before you switch</h2>
        <p className="lede">
          voxelkloud is a rendering library, not an application. Potree ships measuring tools,
          annotations, clipping volumes and a profile tool; if you are using those, you are using a
          product this does not replace. The full list, including where Potree is still ahead, is on{' '}
          <a href="../../compare/potree/">the comparison page</a>.
        </p>
      </section>
    </PageFrame>
  )
}
