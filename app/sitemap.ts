import type { MetadataRoute } from 'next'
import { DOC_GUIDES } from '@/lib/docs'

/**
 * A static export has no server to run a route handler on, so Next asks for
 * this explicitly rather than guessing that the file is generated once at build
 * time. It is.
 */
export const dynamic = 'force-static'

/**
 * The public pages, for a crawler.
 *
 * Not a formality. `/compare/potree/` and `/from/potree/` exist entirely for
 * search intent — somebody typing "potree alternative" or "potree react" is the
 * reader they were written for — and the only link to them from the home page
 * is a line at the end of the formats section. A sitemap is how they get found
 * without depending on that one link being crawled and followed.
 *
 * The URL has to match the deployed one exactly, so it comes from the same
 * environment variable `layout.tsx` uses for the canonical tags. A sitemap that
 * lists a different origin than the pages are served from is ignored.
 */
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://voxelkloud.github.io/'

/**
 * A project page is served under `/<repo>/`, and the deploy workflow passes the
 * prefix in. Joining it here keeps the sitemap right for a user page (no
 * prefix), a project page, and a custom domain.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

function url(path: string): string {
  return new URL(`${basePath}${path}`, siteUrl).toString()
}

export default function sitemap(): MetadataRoute.Sitemap {
  // One date for the whole export: these pages change together, when the
  // project does, and a per-page date invented at build time would claim a
  // precision nothing here tracks.
  const lastModified = new Date()

  return [
    { url: url('/'), lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: url('/docs/'), lastModified, changeFrequency: 'monthly', priority: 0.95 },
    // The converter is a page people are sent a link to, so it is second only
    // to the home page.
    { url: url('/convert/'), lastModified, changeFrequency: 'monthly', priority: 0.9 },
    { url: url('/compare/potree/'), lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: url('/from/potree/'), lastModified, changeFrequency: 'monthly', priority: 0.8 },
    ...DOC_GUIDES.map((guide) => ({
      url: url(`/docs/${guide.slug.join('/')}/`),
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: guide.slug.length === 1 ? 0.82 : 0.78,
    })),
  ]
}
