import type { Metadata, Viewport } from 'next'
import { IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google'
import './globals.css'

// Self-hosted at build time, so the export has no third-party font request.
const plexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-plex-sans',
  display: 'swap',
})

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-plex-mono',
  display: 'swap',
})

// The deploy workflow passes the real origin; the default is the GitHub Pages
// project URL, which is where this ships from.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://voxelkloud.github.io/'

// Plain on purpose. The title is what a search result shows and what a tab
// says, and it earns nothing by being clever: it carries the terms someone
// actually types, and the description below it does the arguing.
const title = 'voxelkloud — WebGPU point cloud renderer for the web'
const description =
  'An npm-installable WebGPU point cloud renderer for the web. React, Vue, or no framework. Reads the Potree v2 directory you already serve — no reconversion step. COPC and EPT drivers are written and awaiting release.'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  applicationName: 'voxelkloud',
  keywords: ['point cloud', 'potree', 'copc', 'ept', 'webgpu', 'three.js', 'lidar', 'lod', 'typescript'],
  authors: [{ name: 'voxelkloud', url: 'https://github.com/voxelkloud' }],
  openGraph: {
    type: 'website',
    siteName: 'voxelkloud',
    url: siteUrl,
    title,
    description,
    images: [{ url: 'og.png', width: 1200, height: 630, alt: 'voxelkloud — WebGPU point cloud renderer for the web' }],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['og.png'],
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0b0e0d',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${plexSans.variable} ${plexMono.variable} bg-background`}>
      <body className="antialiased">{children}</body>
    </html>
  )
}
