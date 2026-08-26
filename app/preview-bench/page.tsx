import type { Metadata } from 'next'

import { BenchSlider } from '@/components/bench-slider'
import { PageFrame } from '@/components/page-frame'

/**
 * A REVIEW URL, not a page of the site.
 *
 * It exists so the convergence benchmark can be looked at, in the site's own
 * palette and typography, before it replaces anything on the root page. Excluded
 * from the sitemap and marked noindex, because it is a draft with a public
 * address rather than something a reader should find.
 *
 * Delete this directory once the section lands on `/`.
 */
export const metadata: Metadata = {
  title: 'Convergence benchmark — preview',
  description: 'Draft of the convergence benchmark section, for review.',
  robots: { index: false, follow: false },
}

export default function PreviewBench() {
  return (
    <PageFrame home="../">
      <section className="measurements shell" id="measurements">
        <p className="section-kicker">PREVIEW / TEST DATA</p>
        <h2>
          What was measured
          <br />
          <em>and under which conditions.</em>
        </h2>
        <BenchSlider />
      </section>
    </PageFrame>
  )
}
