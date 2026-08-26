import type { Metadata } from 'next'
import { ConvertPanel } from '@/components/convert-panel'
import { PageFrame } from '@/components/page-frame'

export const metadata: Metadata = {
  title: 'Convert LAZ to COPC in your browser — nothing uploaded',
  description:
    'Drop a LAS, LAZ, PLY, PCD or XYZ file and get a COPC back, indexed in the page. No upload, no server, no account — the file never leaves your machine.',
  alternates: { canonical: './' },
}

export default function Convert() {
  return (
    <PageFrame home="../">
      <section className="sub-hero shell">
        <p className="section-kicker">CONVERT</p>
        <h1>
          A file with no index,
          <br />
          <em>given one — in your browser.</em>
        </h1>
        <p className="lede">
          Drop a <code>.las</code>, <code>.laz</code>, <code>.ply</code>, <code>.pcd</code> or{' '}
          <code>.xyz</code> in. You get a <code>.copc.laz</code> back.{' '}
          <strong>Nothing is uploaded.</strong> The file is read, indexed and written inside this
          tab; the only thing this site ever sent you is the page and the code that does the work.
        </p>
      </section>

      <section className="shell">
        <div className="convert-compare">
          <div>
            <h2>What you drop in</h2>
            <p>
              A LAZ is <b>a list of points</b>. Compressed, in order, and with nothing in it that
              says where anything is.
            </p>
            <p>
              So a viewer has to download <b>all of it</b> before it can draw the first point —
              which is why a two-gigabyte scan does not open in a browser at all.
            </p>
          </div>
          <div>
            <h2>What you get back</h2>
            <p>
              A COPC is <b>still a LAZ file</b>. Same container, same compression; everything that
              read the first one reads this one.
            </p>
            <p>
              What is added is <b>an octree inside it</b>, and a table at the end saying where each
              node lives. A viewer reads the header, the table, and then only the nodes it can
              actually see — by HTTP range.
            </p>
          </div>
        </div>

        <ConvertPanel />

        <p className="format-footnote">
          The work is done by <code>@voxelkloud/wasm-build</code>: the same partitioner{' '}
          <code>voxelkloud convert</code> runs on a workstation, compiled to wasm. A cloud indexed
          here and the same cloud indexed there are the same tree — not two implementations that
          agree until they do not.
        </p>
        <p className="format-footnote">
          It runs in a worker, which is what lets this page keep painting and keep counting while it
          works: a build is one synchronous call into wasm, and on the page&rsquo;s own thread
          nothing else would happen until it returned. The worker is ended as soon as the file comes
          back, so the memory a large build needs goes with it instead of staying resident.
        </p>
        <p className="format-footnote">
          <strong>The ceiling is 20 million points</strong>, measured rather than guessed: a
          20M-point tile peaks around 1.7 GB of browser memory, and a tab that asks for twice that
          is a tab that gets killed. Past it the honest answer is the command line, and the message
          you get says so. A phone will manage a small scan and struggle with a large one.
        </p>
      </section>
    </PageFrame>
  )
}
