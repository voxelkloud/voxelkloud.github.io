import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const docsData = resolve(root, 'lib/docs.ts')
const docsIndex = resolve(root, 'app/docs/page.tsx')
const docsGuideRoute = resolve(root, 'app/docs/[...slug]/page.tsx')

const guideSlugs = [
  'core',
  'loader',
  'view',
  'view/lod',
  'react',
  'vue',
  'wasm-core',
  'format-potree',
  'format-copc',
  'format-ept',
  'format-single',
  'format-las',
  'format-3dtiles',
]

test('docs catalogue covers every package guide', async () => {
  const source = await readFile(docsData, 'utf8')

  for (const slug of guideSlugs) {
    const definition = slug.includes('/')
      ? `slug: ['view', 'lod']`
      : `slug: ['${slug}']`

    assert.ok(source.includes(definition), `expected the docs catalogue to declare ${slug}`)
  }
})

test('docs index renders the guide catalogue', async () => {
  const source = await readFile(docsIndex, 'utf8')

  assert.ok(source.includes('DOC_GUIDE_GROUPS'))
  assert.ok(source.includes('guideHref(guide.slug)'))
  assert.ok(source.includes('Open guide'))
})

test('docs guide route is generated for every package guide', async () => {
  const source = await readFile(docsGuideRoute, 'utf8')

  assert.ok(
    source.includes('generateStaticParams'),
    'expected the docs guide route to statically generate package pages',
  )
  assert.ok(
    source.includes('generateMetadata'),
    'expected the docs guide route to export per-guide metadata',
  )
})
