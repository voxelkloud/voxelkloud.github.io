import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const homePage = resolve(root, 'app/page.tsx')
const docsPage = resolve(root, 'app/docs/page.tsx')

test('homepage copy is direct and developer-facing', async () => {
  const source = await readFile(homePage, 'utf8')

  assert.ok(source.includes('What each package owns.'))
  assert.ok(source.includes('Install the pieces you need.'))
  assert.ok(!source.includes('without the black box'))
  assert.ok(!source.includes('One renderer, three ways in'))
  assert.ok(!source.includes('No app to adopt'))
})

test('docs copy reads like reference material', async () => {
  const source = await readFile(docsPage, 'utf8')

  assert.ok(source.includes('One index'))
  assert.ok(source.includes('one guide per package'))
  assert.ok(source.includes('selection path'))
  assert.ok(!source.includes('package reference'))
  assert.ok(!source.includes('integration notes'))
})
