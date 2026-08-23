import type { MetadataRoute } from 'next'

/**
 * A static export has no server to run a route handler on, so Next asks for
 * this explicitly rather than guessing that the file is generated once at build
 * time. It is.
 */
export const dynamic = 'force-static'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://voxelkloud.github.io/'
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

/**
 * Everything is public, and the point of the file is the last line.
 *
 * A `robots.txt` that only says "allow all" is worth nothing; one that names
 * the sitemap is how a crawler finds the two search-intent pages without
 * waiting to discover the link to them.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: new URL(`${basePath}/sitemap.xml`, siteUrl).toString(),
  }
}
