import { strict as assert } from 'node:assert'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const homePage = resolve(root, 'app/page.tsx')
const docsPage = resolve(root, 'app/docs/page.tsx')

test('home page links to the docs route', async () => {
  const source = await readFile(homePage, 'utf8')

  assert.ok(
    source.includes('href="./docs/"'),
    'expected the landing page to link to the docs route',
  )
})

test('docs route exists and carries technical documentation', async () => {
  const source = await readFile(docsPage, 'utf8')

  assert.ok(source.includes('One index'), 'expected docs copy to read like an index')
  assert.ok(source.includes('one guide per package'), 'expected docs copy to point at per-package guides')
  assert.ok(source.includes('Open the LOD guide'), 'expected docs copy to expose the technical paths')
})
