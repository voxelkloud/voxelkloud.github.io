import type { ReactNode } from 'react'
import { BrandMark } from '@/components/brand-mark'

const ORG = 'https://github.com/voxelkloud'

/**
 * Chrome for the pages that are not the landing page.
 *
 * Deliberately simpler than the home header: these are entry points from a
 * search, so the one navigation decision that matters is "take me to the
 * project", not a section menu for a page the visitor has not seen.
 *
 * `home` is a relative path because the site deploys under a basePath on GitHub
 * Pages — an absolute `/` would leave the project and land on the user page.
 */
export function PageFrame({
  home,
  children,
}: {
  readonly home: string
  readonly children: ReactNode
}) {
  return (
    <>
      <header className="sub-header shell">
        <a className="brand" href={home}>
          <BrandMark /> voxelkloud
        </a>
        <a className="sub-back" href={home}>
          Back to the project
        </a>
      </header>

      <main>{children}</main>

      <footer className="footer shell">
        <a className="brand" href={home}>
          <BrandMark /> voxelkloud
        </a>
        <span>
          MIT licensed ·{' '}
          <a href={ORG} rel="noreferrer" target="_blank">
            source on GitHub
          </a>
        </span>
      </footer>
    </>
  )
}
