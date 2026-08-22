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

const title = 'voxelkloud — Point clouds without the black box'
const description =
  'A modern WebGPU point cloud viewer for Potree v2 data. React, Vue, or no framework.'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  applicationName: 'voxelkloud',
  keywords: ['point cloud', 'potree', 'webgpu', 'three.js', 'lidar', 'lod', 'typescript'],
  authors: [{ name: 'voxelkloud', url: 'https://github.com/voxelkloud' }],
  openGraph: {
    type: 'website',
    siteName: 'voxelkloud',
    url: siteUrl,
    title,
    description,
    images: [{ url: 'og.png', width: 1200, height: 630, alt: 'voxelkloud — point clouds without the black box' }],
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
