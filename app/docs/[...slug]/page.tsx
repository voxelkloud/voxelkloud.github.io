import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArrowUpRight, ChevronRight } from 'lucide-react'
import { CodeBlock } from '@/components/docs-code-block'
import { PageFrame } from '@/components/page-frame'
import { DOC_GUIDES, docsIndexHrefFromGuide, findGuide, guideHrefFromGuide } from '@/lib/docs'

type Params = {
  readonly slug: readonly string[]
}

export const dynamic = 'force-static'

export function generateStaticParams(): Params[] {
  return DOC_GUIDES.map((guide) => ({
    slug: [...guide.slug],
  }))
}

export async function generateMetadata({
  params,
}: {
  readonly params: Promise<Params>
}): Promise<Metadata> {
  const resolvedParams = await params
  const guide = findGuide(resolvedParams.slug)

  if (guide === undefined) {
    return {
      title: 'Docs — voxelkloud',
      description: 'Technical documentation for voxelkloud.',
    }
  }

  return {
    title: `${guide.name} guide — voxelkloud`,
    description: guide.summary,
    alternates: { canonical: './' },
  }
}

function GuideCard({
  id,
  title,
  body,
  bullets,
  code,
}: {
  readonly id: string
  readonly title: string
  readonly body: string
  readonly bullets?: readonly string[]
  readonly code?: string
}) {
  return (
    <article className="docs-card" id={id}>
      <h3>{title}</h3>
      <p>{body}</p>
      {bullets !== undefined && (
        <ul className="docs-bullets">
          {bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      )}
      {code !== undefined && <CodeBlock>{code}</CodeBlock>}
    </article>
  )
}

export default async function GuidePage({
  params,
}: {
  readonly params: Promise<Params>
}) {
  const resolvedParams = await params
  const guide = findGuide(resolvedParams.slug)

  if (guide === undefined) {
    notFound()
  }

  const home = `${'../'.repeat(guide.slug.length + 1)}`
  const docsIndexHref = docsIndexHrefFromGuide(guide.slug)
  const statusLabel =
    guide.status === 'public' ? 'public' : guide.status === 'source' ? 'source' : 'planned'

  return (
    <PageFrame home={home}>
      <section className="sub-hero shell">
        <p className="eyebrow">DOCS / PACKAGE GUIDE</p>
        <h1>
          {guide.name}
          <br />
          <em>{guide.title}</em>
        </h1>
        <p className="lede">{guide.intro}</p>
        <div className="docs-package-meta docs-package-meta-hero">
          <span className="docs-package-install">{guide.install}</span>
          <span className={`docs-badge docs-badge-${guide.status}`}>{statusLabel}</span>
        </div>
        <div className="docs-actions">
          <a className="button button-primary" href={docsIndexHref}>
            Back to docs index <ChevronRight aria-hidden="true" size={16} />
          </a>
          <a className="button button-quiet" href={home}>
            Back to project <ArrowUpRight aria-hidden="true" size={16} />
          </a>
        </div>
        <div className="docs-toc">
          {guide.cards.map((card) => (
            <a key={card.title} href={`#${card.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
              {card.title}
            </a>
          ))}
        </div>
      </section>

      <section className="sub-section shell">
        <div className="docs-grid">
          {guide.cards.map((card) => (
            <GuideCard
              body={card.body}
              code={card.code}
              id={card.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
              key={card.title}
              title={card.title}
              bullets={card.bullets}
            />
          ))}
        </div>
      </section>

      <section className="sub-section shell">
        <div className="docs-support">
          <h3>Related guides</h3>
          <ul>
            {guide.related.map((related) => (
              <li key={related.label}>
                <a href={guideHrefFromGuide(guide.slug, related.slug)}>{related.label}</a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </PageFrame>
  )
}
