// Bring the converter's build artefacts into `public/`.
//
// WHY A COPY AND NOT A DEPENDENCY. `@voxelkloud/wasm-build` is not on npm yet,
// and this site is its own repository — so it cannot depend on a workspace
// package that only exists inside the monorepo. The artefacts are therefore
// VENDORED here and committed, and this script refreshes them when it is run
// from a checkout that has the monorepo beside it. The day the package ships,
// this file goes away and `public/wasm-build` becomes a normal dependency.
//
// THE COST, stated where it will be read: a copied binary drifts, and quietly.
// It has already happened once — a README said 338 KB while the file on disk
// was 552 KB, because something rebuilt it. So this prints what it copied and
// what changed, and `--check` fails when the two sides differ, which is what a
// release job should run.
//
//   node scripts/sync-wasm.mjs           # refresh
//   node scripts/sync-wasm.mjs --check   # fail if stale, change nothing
//
// The layout under `public/` MIRRORS the package's own — `dist/` beside
// `examples/` — so the worker file, which imports `../dist/index.js`, is
// copied verbatim rather than rewritten on the way in. A copy that is edited in
// transit is a copy nobody can diff.

import { createHash } from 'node:crypto'
import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const SITE = join(HERE, '..')
// The monorepo, when this checkout has one beside it.
const PACKAGE = join(SITE, '..', 'packages', 'wasm-build')
const OUT = join(SITE, 'public', 'wasm-build')

const FILES = [
  ['dist/index.js', 'dist/index.js'],
  ['dist/voxelkloud_wasm_build_bg.wasm', 'dist/voxelkloud_wasm_build_bg.wasm'],
  ['examples/convert-worker.js', 'examples/convert-worker.js'],
]

const check = process.argv.includes('--check')
const digest = (path) => createHash('sha256').update(readFileSync(path)).digest('hex').slice(0, 12)
const kb = (path) => `${(statSync(path).size / 1024).toFixed(0)} KB`

if (!existsSync(PACKAGE)) {
  console.log(
    `sync-wasm: ${PACKAGE} is not here, so nothing was copied.\n` +
      `The artefacts already in public/wasm-build are what the site ships. To refresh them, ` +
      `run this from a checkout of the monorepo.`,
  )
  process.exit(0)
}

let stale = 0
for (const [from, to] of FILES) {
  const source = join(PACKAGE, from)
  const target = join(OUT, to)
  if (!existsSync(source)) {
    console.error(
      `sync-wasm: ${source} is missing. Build it first:\n` +
        `  pnpm --filter @voxelkloud/wasm-build build`,
    )
    process.exit(1)
  }

  const before = existsSync(target) ? digest(target) : null
  const after = digest(source)
  if (before === after) {
    console.log(`  same     ${to}  ${kb(source)}`)
    continue
  }

  stale++
  if (check) {
    console.error(`  STALE    ${to}  ${before ?? 'missing'} -> ${after}`)
    continue
  }
  mkdirSync(dirname(target), { recursive: true })
  copyFileSync(source, target)
  console.log(`  copied   ${to}  ${kb(target)}  ${before ?? 'new'} -> ${after}`)
}

if (check && stale > 0) {
  console.error(
    `\nsync-wasm: ${stale} file(s) differ from the package. Run \`node scripts/sync-wasm.mjs\` ` +
      `and commit the result.`,
  )
  process.exit(1)
}
