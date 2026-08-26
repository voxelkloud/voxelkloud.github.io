export type DocsCard = {
  readonly title: string
  readonly body: string
  readonly bullets?: readonly string[]
  readonly code?: string
}

export type DocsDecision = {
  readonly title: string
  readonly body: string
}

export type DocsGuide = {
  readonly slug: readonly string[]
  readonly name: string
  readonly title: string
  readonly summary: string
  readonly install: string
  readonly intro: string
  readonly status: 'public' | 'source' | 'planned'
  readonly cards: readonly DocsCard[]
  readonly related: readonly { readonly label: string; readonly slug: readonly string[] }[]
}

export type DocsGuideGroup = {
  readonly title: string
  readonly summary: string
  readonly guides: readonly (readonly string[])[]
}

export const DOC_DECISIONS: readonly DocsDecision[] = [
  {
    title: 'LOD selection',
    body:
      'The selector spends from pointBudget until projected screen error falls under targetScreenError. When there is room left, minScreenError keeps refinement bounded.',
  },
  {
    title: 'Frustum culling',
    body:
      'A node outside the frustum means every descendant is outside too, so the selector drops the branch. Intersecting nodes keep descending; inside nodes stop paying the plane test for their children.',
  },
  {
    title: 'Loader responsibilities',
    body:
      'The loader picks the driver from the URL and returns the neutral source/tree/openPoints contract. The renderer never needs to know whether the data came from Potree, COPC, EPT, or a single-file build.',
  },
  {
    title: 'Precision stays relative',
    body:
      'Large CRS coordinates stay in float64 at the tree and camera level. Per-point positions are rebased relative to the cloud origin so the shader sees small numbers instead of the whole globe.',
  },
]

export const DOC_GUIDE_GROUPS: readonly DocsGuideGroup[] = [
  {
    title: 'Runtime packages',
    summary:
      'Core types, loading, rendering, and thin framework adapters. This is the surface most apps touch first.',
    guides: [
      ['core'],
      ['loader'],
      ['view'],
      ['view', 'lod'],
      ['react'],
      ['vue'],
    ],
  },
  {
    title: 'Format drivers',
    summary:
      'Each input format gets its own guide and its own responsibility. The renderer only sees the neutral tree contract.',
    guides: [
      ['format-potree'],
      ['format-copc'],
      ['format-ept'],
      ['format-single'],
      ['format-las'],
      ['format-3dtiles'],
    ],
  },
  {
    title: 'Support packages',
    summary:
      'Lower-level kernels and build-time pieces that show up in workers, converters, and the selection path.',
    guides: [['wasm-core']],
  },
]

export const DOC_GUIDES: readonly DocsGuide[] = [
  {
    slug: ['core'],
    name: '@voxelkloud/core',
    title: 'Neutral vocabulary and octree math',
    summary: 'Shared types, bounding boxes, Morton codes, and CRS declarations.',
    install: 'npm install @voxelkloud/core',
    intro:
      'Use core when you need the shared data model or the tree math without a loader or renderer attached.',
    status: 'public',
    cards: [
      {
        title: 'What it owns',
        body:
          'Source, tree, node, bounds, attributes, CRS, and the octree math that every other package speaks.',
        bullets: [
          'PointCloudSourceBase and PointCloudTreeBase define the neutral contracts.',
          'Bounding boxes and Morton helpers stay here so loaders and renderers do not duplicate them.',
          'Use it when you need to inspect or transform cloud metadata without opening points.',
        ],
      },
      {
        title: 'Typical use',
        body:
          'Pull the math you need, keep the data model at the edge of your app, and let the loader or renderer build on top of it.',
        code: `import { childBoundingBox, mortonEncode3 } from '@voxelkloud/core'

const root = { min: [0, 0, 0], max: [512, 512, 512] }
const child = childBoundingBox(root, 6)
const key = mortonEncode3(3, 5, 2)`,
      },
    ],
    related: [
      { label: 'Loader guide', slug: ['loader'] },
      { label: 'LOD guide', slug: ['view', 'lod'] },
    ],
  },
  {
    slug: ['loader'],
    name: '@voxelkloud/loader',
    title: 'URL-driven loading and driver selection',
    summary: 'Pick the right driver, load the source, and return the neutral tree contract.',
    install: 'npm install @voxelkloud/loader',
    intro:
      'The loader resolves a URL, chooses the matching format driver, and hands back source, tree, and reader factory objects.',
    status: 'public',
    cards: [
      {
        title: 'High-level load',
        body:
          'Use the loader when you want one call that resolves the driver and returns the full point-cloud contract the renderer expects.',
        code: `import { ensureDefaultFormats, formats, loadPointCloud } from '@voxelkloud/loader'
import { copcFormat } from '@voxelkloud/format-copc'

ensureDefaultFormats()
formats.register(copcFormat)

const { source, tree, openPoints } = await loadPointCloud('/pointclouds/autzen/')`,
      },
      {
        title: 'Why registration exists',
        body:
          'Potree, COPC, EPT, and single-file LAS all claim the same kinds of URLs in different ways, so the registry decides which driver gets first look.',
        bullets: [
          'Default formats keep the common cases available with one import.',
          'Optional drivers can be registered only by the apps that need them.',
          'The loader stays format-agnostic after the registry resolves the match.',
        ],
      },
    ],
    related: [
      { label: 'Core guide', slug: ['core'] },
      { label: 'View guide', slug: ['view'] },
      { label: 'Potree guide', slug: ['format-potree'] },
      { label: 'COPC guide', slug: ['format-copc'] },
    ],
  },
  {
    slug: ['view'],
    name: '@voxelkloud/view',
    title: 'WebGPU renderer and scene controller',
    summary: 'Own the renderer, keep the camera and scene exposed, and feed it the loaded tree.',
    install: 'npm install @voxelkloud/view three',
    intro:
      'This is the layer that turns source data into pixels and keeps the scene and camera under your control.',
    status: 'public',
    cards: [
      {
        title: 'Create the view',
        body:
          'The renderer accepts the neutral objects from the loader and keeps the GPU device, camera, and selection loop inside one object.',
        code: `import { loadPointCloud } from '@voxelkloud/loader'
import { createPointCloudView } from '@voxelkloud/view'

const { source, tree, openPoints } = await loadPointCloud('/pointclouds/autzen/')
const view = createPointCloudView({
  canvas,
  lod: { targetScreenError: 1.35, pointBudget: 3_000_000 },
})

await view.init()
view.addCloud(source, tree, openPoints)
view.frameCloud()`,
      },
      {
        title: 'Keep control of the scene',
        body:
          'The view does not hide the three.js objects. You still get a camera, a scene, and the hooks needed for controls, measurements, and picking.',
        bullets: [
          'view.camera stays available for OrbitControls or your own controls.',
          'view.scene is your three.js scene when you need to add overlays.',
          'LOD, EDL, and render settings stay explicit rather than hidden behind a black box.',
        ],
      },
    ],
    related: [
      { label: 'LOD guide', slug: ['view', 'lod'] },
      { label: 'React guide', slug: ['react'] },
      { label: 'Vue guide', slug: ['vue'] },
    ],
  },
  {
    slug: ['view', 'lod'],
    name: '@voxelkloud/view/lod',
    title: 'LOD selection and culling helpers',
    summary: 'Dependency-free selection math for workers, SSR, tests, and the renderer.',
    install: 'import from @voxelkloud/view/lod',
    intro:
      'This subpath stays dependency-free so it can run in workers, SSR, tests, or any place that only needs the selector.',
    status: 'public',
    cards: [
      {
        title: 'Selection loop',
        body:
          'Resolve the knobs once per frame, reuse scratch buffers, and let the selector tell you what limited the frame.',
        code: `import {
  createLodScratch,
  createLodSelection,
  resolveLodOptions,
  selectVisible,
} from '@voxelkloud/view/lod'

const opts = resolveLodOptions({ targetScreenError: 1.35, pointBudget: 3_000_000 })
const scratch = createLodScratch(tree.nodeCount)
const selection = createLodSelection(opts.maxNodes)

selectVisible(tree, cameraState, opts, scratch, selection)`,
      },
      {
        title: 'How culling works',
        body:
          'A node outside the frustum means every descendant is outside too, so the branch can be dropped immediately. Intersecting nodes keep descending, and inside nodes stop paying the six-plane test for their children.',
        code: `import {
  Containment,
  classifyAabb,
  extractFrustumPlanes,
} from '@voxelkloud/view/lod'

const planes = new Float64Array(24)
extractFrustumPlanes(clipFromWorld, planes, depthRange, false)

const state = classifyAabb(planes, minX, minY, minZ, maxX, maxY, maxZ)
if (state === Containment.Outside) return`,
      },
      {
        title: 'What the result tells you',
        body:
          'selection.limitedBy says whether budget, headroom, node count, or the error floor won the frame. selection.achievedScreenError tells you what the viewer actually left on screen.',
        bullets: [
          'Use targetScreenError to say how much error is acceptable in screen pixels.',
          'Use pointBudget to cap the number of selected points.',
          'Use the result object to explain why a frame stopped refining.',
        ],
      },
    ],
    related: [
      { label: 'View guide', slug: ['view'] },
      { label: 'Core guide', slug: ['core'] },
      { label: 'Wasm core guide', slug: ['wasm-core'] },
    ],
  },
  {
    slug: ['react'],
    name: '@voxelkloud/react',
    title: 'Thin React wrapper',
    summary: 'A small component over the shared renderer, with lifecycle handled for you.',
    install: 'npm install @voxelkloud/react three',
    intro:
      'Use the wrapper when React should own the canvas lifecycle and you do not want to write that wiring yourself.',
    status: 'public',
    cards: [
      {
        title: 'Minimal mount',
        body:
          'Point the component at a cloud URL, pass the LOD policy you want, and let the wrapper keep the renderer in sync with React.',
        code: `import { PointCloudViewer } from '@voxelkloud/react'

<PointCloudViewer
  url="/pointclouds/autzen/"
  lod={{ targetScreenError: 1.35, pointBudget: 3_000_000 }}
/>`,
      },
      {
        title: 'If you need state first',
        body:
          'When your app needs the loaded source or tree before the canvas exists, use the same package’s hook and keep the renderer thin.',
        bullets: [
          'React owns the component lifecycle.',
          'The renderer stays shared with the vanilla and Vue integrations.',
          'The wrapper should not become a second viewer implementation.',
        ],
      },
    ],
    related: [{ label: 'View guide', slug: ['view'] }],
  },
  {
    slug: ['vue'],
    name: '@voxelkloud/vue',
    title: 'Thin Vue 3 wrapper',
    summary: 'The same renderer, exposed through a Vue component instead of a React one.',
    install: 'npm install @voxelkloud/vue three',
    intro:
      'The Vue binding mirrors the React API so the two adapters stay aligned while the renderer stays shared.',
    status: 'public',
    cards: [
      {
        title: 'Minimal mount',
        body:
          'Drop the viewer into a template, point it at a URL, and let Vue own the component lifecycle.',
        code: `import { PointCloudViewer } from '@voxelkloud/vue'

<PointCloudViewer
  url="/pointclouds/autzen/"
  :lod="{ targetScreenError: 1.35, pointBudget: 3000000 }"
/>`,
      },
      {
        title: 'Why the surface matches',
        body:
          'The React and Vue bindings stay close on purpose so app code can move between them without learning a second renderer API.',
        bullets: [
          'The same `lod` shape reaches the shared view package.',
          'The component wrapper only manages framework lifecycle.',
          'The renderer logic does not fork per framework.',
        ],
      },
    ],
    related: [{ label: 'View guide', slug: ['view'] }],
  },
  {
    slug: ['wasm-core'],
    name: '@voxelkloud/wasm-core',
    title: 'Low-level LOD kernels',
    summary: 'Raw selector and frustum helpers for workers, SSR, and tests.',
    install: 'npm install @voxelkloud/wasm-core',
    intro:
      'This module graph is plain arrays and numbers, which keeps it importable where the renderer itself is too heavy.',
    status: 'public',
    cards: [
      {
        title: 'Load the kernels',
        body:
          'Use the wasm bundle when you want the selection math without the rest of the renderer attached.',
        code: `import { Param, loadWasmKernels } from '@voxelkloud/wasm-core'

const kernels = await loadWasmKernels(wasmBytes)
kernels.params[Param.CamX] = camera.x
kernels.params[Param.CamY] = camera.y
kernels.extractPlanes(false, false)
const mask = kernels.selectChildren(0xff, false)`,
      },
      {
        title: 'When to reach for it',
        body:
          'This is the seam the renderer cuts along when it wants the same math in a worker or in a non-DOM environment.',
        bullets: [
          'No DOM dependency.',
          'No three.js dependency.',
          'Good for worker-side selection or SSR plumbing.',
        ],
      },
    ],
    related: [
      { label: 'LOD guide', slug: ['view', 'lod'] },
      { label: 'View guide', slug: ['view'] },
    ],
  },
  {
    slug: ['format-potree'],
    name: '@voxelkloud/format-potree',
    title: 'Potree v2 driver',
    summary: 'Read metadata.json, hierarchy.bin, and octree.bin, then hand back the neutral tree contract.',
    install: 'npm install @voxelkloud/format-potree',
    intro:
      'This driver reads the Potree v2 directory layout exactly as it is and produces the source/tree objects the rest of the stack already understands.',
    status: 'source',
    cards: [
      {
        title: 'Open a Potree directory',
        body:
          'If you already serve a Potree v2 directory, this is the driver that turns its metadata and hierarchy into the neutral tree contract.',
        code: `import { loadPointCloudSource, loadHierarchy } from '@voxelkloud/format-potree'

const source = await loadPointCloudSource('/pointclouds/autzen/')
const tree = await loadHierarchy(source)`,
      },
      {
        title: 'Brotli stays opt-in',
        body:
          'Brotli-decompressed clouds need a decoder, but the decoder should only land in bundles that actually need it.',
        code: `import { brotliDecompress } from '@voxelkloud/loader/brotli'
import { createPointCloudView } from '@voxelkloud/view'

createPointCloudView({ canvas, decompress: brotliDecompress })`,
      },
    ],
    related: [
      { label: 'Loader guide', slug: ['loader'] },
      { label: 'View guide', slug: ['view'] },
    ],
  },
  {
    slug: ['format-copc'],
    name: '@voxelkloud/format-copc',
    title: 'COPC driver',
    summary: 'One LAZ file, one HTTP host, and an octree embedded inside the file.',
    install: 'npm install @voxelkloud/format-copc',
    intro:
      'COPC keeps the octree in the file, so the driver reads the page model and fetches only the nodes the view actually needs.',
    status: 'source',
    cards: [
      {
        title: 'Open COPC',
        body:
          'The driver loads the source and opens the tree from a single `.copc.laz` file without a conversion step.',
        code: `import { loadCopcSource, openCopcTree } from '@voxelkloud/format-copc'

const source = await loadCopcSource('/pointclouds/autzen.copc.laz')
const tree = await openCopcTree(source)`,
      },
      {
        title: 'What makes it separate',
        body:
          'COPC behaves like LAS on the wire, but the hierarchy is already indexed, so the loader can stream the right nodes by range instead of rebuilding them.',
        bullets: [
          'Best when the input is already an indexed LAS 1.4 file.',
          'HTTP Range is the delivery path, not a fallback.',
          'The renderer still sees the same neutral source/tree contract.',
        ],
      },
    ],
    related: [
      { label: 'Loader guide', slug: ['loader'] },
      { label: 'LAS decoder guide', slug: ['format-las'] },
    ],
  },
  {
    slug: ['format-ept'],
    name: '@voxelkloud/format-ept',
    title: 'EPT driver',
    summary: 'Read a static directory of JSON hierarchy pages and per-node payloads.',
    install: 'npm install @voxelkloud/format-ept',
    intro:
      'EPT is a good fit for object storage or static hosting because the hierarchy and payloads are already laid out as separate files.',
    status: 'source',
    cards: [
      {
        title: 'Open EPT',
        body:
          'Start from the EPT manifest, then open the tree and let the loader request only the hierarchy pages the view needs.',
        code: `import { loadEptSource, openEptTree } from '@voxelkloud/format-ept'

const source = await loadEptSource('https://example.com/ept.json')
const tree = await openEptTree(source)`,
      },
      {
        title: 'Why it matters',
        body:
          'EPT is a directory of JSON and payload files, so it can sit on static storage without requiring server-side state.',
        bullets: [
          'Good for object storage and static hosting.',
          'Range requests are optional rather than mandatory.',
          'The neutral tree contract stays the same once the driver resolves the source.',
        ],
      },
    ],
    related: [
      { label: 'Loader guide', slug: ['loader'] },
      { label: 'LAS decoder guide', slug: ['format-las'] },
    ],
  },
  {
    slug: ['format-single'],
    name: '@voxelkloud/format-single',
    title: 'Single-file LAS/LAZ builder',
    summary: 'Build an octree in the browser from a file that has no index yet.',
    install: 'npm install @voxelkloud/format-single',
    intro:
      'For a raw LAS or LAZ file, this package downloads the file, builds the octree in a worker, and hands the renderer the same neutral contracts as the indexed drivers.',
    status: 'source',
    cards: [
      {
        title: 'Build in the browser',
        body:
          'The builder reads a single file, partitions it in a worker, and returns the tree contract the rest of the stack already knows how to render.',
        code: `import { loadSingleFileSource, openSingleFileTree } from '@voxelkloud/format-single'

const source = await loadSingleFileSource(file)
const tree = await openSingleFileTree(source)`,
      },
      {
        title: 'Worker boundary',
        body:
          'The worker keeps the main thread responsive while the octree is assembled, which is the difference between a page that keeps painting and one that stalls.',
        bullets: [
          'The worker owns the heavy build step.',
          'The main thread only receives the finished tree contract.',
          'The ceiling is honest: very large files still belong in the CLI.',
        ],
      },
    ],
    related: [
      { label: 'Loader guide', slug: ['loader'] },
      { label: 'LAS decoder guide', slug: ['format-las'] },
      { label: 'Wasm core guide', slug: ['wasm-core'] },
    ],
  },
  {
    slug: ['format-las'],
    name: '@voxelkloud/format-las',
    title: 'Shared LAS record decoder',
    summary: 'Decode the point-record layer used by COPC, EPT, and the single-file builder.',
    install: 'npm install @voxelkloud/format-las',
    intro:
      'This package owns the record layout and byte-to-point conversion logic. The higher-level format drivers reuse it instead of each decoding LAS bytes on their own.',
    status: 'source',
    cards: [
      {
        title: 'Describe the layout',
        body:
          'Start with the LAS layout, then let the decoder derive the fields it needs for the current record format.',
        code: `import { createLasDecodePlan, decodeLasRecords, lasLayout } from '@voxelkloud/format-las'

const layout = lasLayout({ format: 3, pointSize: 34, bounds })
const plan = createLasDecodePlan(layout, { computeBounds: true })
const decoded = decodeLasRecords(plan, node, records, { computeBounds: true })`,
      },
      {
        title: 'Decode once, reuse everywhere',
        body:
          'COPC, EPT, and the single-file builder all need the same point-record parsing work, so this package keeps that layer shared.',
        bullets: [
          'Owns the field layout and Extra Bytes VLR handling.',
          'Keeps LAS decoding separate from the format-specific tree logic.',
          'Useful when you need the record layer without a driver around it.',
        ],
      },
    ],
    related: [
      { label: 'COPC guide', slug: ['format-copc'] },
      { label: 'EPT guide', slug: ['format-ept'] },
      { label: 'Single-file guide', slug: ['format-single'] },
    ],
  },
  {
    slug: ['format-3dtiles'],
    name: '@voxelkloud/format-3dtiles',
    title: '3D Tiles driver',
    summary: 'Load a tileset document, expand the tile tree, and open point content from .pnts tiles.',
    install: 'npm install @voxelkloud/format-3dtiles',
    intro:
      'This driver is for tileset-driven scenes. It reads the tileset document, expands explicit or implicit trees, and opens point content from point tiles.',
    status: 'source',
    cards: [
      {
        title: 'Open a tileset',
        body:
          'Start from the tileset document, build the tree, and let the view request point content as the camera moves.',
        code: `import {
  createTilesetTree,
  loadTilesetSource,
  openTilesetPoints,
} from '@voxelkloud/format-3dtiles'

const source = await loadTilesetSource('/tileset.json')
const tree = createTilesetTree(source.tiles, {
  loadDocument: async (url, signal) =>
    fetch(url, { signal }).then((res) => res.json()),
})
const openPoints = openTilesetPoints(source)`,
      },
      {
        title: 'When to use it',
        body:
          'Pick this driver when your scene is already described as a tileset and you want the point payloads to follow that structure.',
        bullets: [
          'Useful for explicit or implicit tile trees.',
          'Point content comes from .pnts tiles.',
          'The selector still receives the same neutral contracts once the driver opens the source.',
        ],
      },
    ],
    related: [{ label: 'View guide', slug: ['view'] }],
  },
]

export function guideHref(slug: readonly string[]): string {
  return `./${slug.join('/')}/`
}

export function guideHrefFromGuide(
  currentSlug: readonly string[],
  targetSlug: readonly string[],
): string {
  return `${'../'.repeat(currentSlug.length)}${targetSlug.join('/')}/`
}

export function docsIndexHrefFromGuide(currentSlug: readonly string[]): string {
  return '../'.repeat(currentSlug.length)
}

export function findGuide(slug: readonly string[]): DocsGuide | undefined {
  return DOC_GUIDES.find(
    (guide) =>
      guide.slug.length === slug.length &&
      guide.slug.every((part, index) => part === slug[index]),
  )
}
