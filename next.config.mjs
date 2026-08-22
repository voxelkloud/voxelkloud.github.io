/**
 * Static export for GitHub Pages.
 *
 * A project page lives under /<repo>, so every asset URL needs that prefix. The
 * deploy workflow reads it from actions/configure-pages and passes it in, which
 * keeps this file correct for a user page (empty prefix) and a custom domain too.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath,
  // GitHub Pages serves /path/ as /path/index.html; without this, deep links 404.
  trailingSlash: true,
  images: { unoptimized: true },
  // Next 16 writes AGENTS.md/CLAUDE.md into the project on dev; the repo keeps
  // its own conventions, so it stays out of the tree.
  agentRules: false,
  reactStrictMode: true,
}

export default nextConfig
