import type { Metadata } from 'next'
import { ArrowUpRight, ChevronRight } from 'lucide-react'
import { PageFrame } from '@/components/page-frame'
import { CodeBlock } from '@/components/docs-code-block'
import { DOC_DECISIONS, DOC_GUIDE_GROUPS, findGuide, guideHref } from '@/lib/docs'

export const metadata: Metadata = {
  title: 'Docs index — voxelkloud',
  description:
    'Technical docs for voxelkloud: the architecture decisions, the LOD and culling notes, and one guide per package.',
}

function DecisionCard({ title, body }: { readonly title: string; readonly body: string }) {
  return (
    <article className="docs-card">
      <h3>{title}</h3>
      <p>{body}</p>
    </article>
  )
}

function PackageCard({ slug }: { readonly slug: readonly string[] }) {
  const guide = findGuide(slug)

  if (guide === undefined) return null

  const statusLabel =
    guide.status === 'public' ? 'public' : guide.status === 'source' ? 'source' : 'planned'

  return (
    <article className="docs-card">
      <div className="docs-package-meta">
        <span className="docs-package-name">{guide.name}</span>
        <span className={`docs-badge docs-badge-${guide.status}`}>{statusLabel}</span>
      </div>
      <h3>{guide.title}</h3>
      <p>{guide.summary}</p>
      <p className="docs-package-install">{guide.install}</p>
      <p className="docs-package-note">{guide.intro}</p>
      <div className="docs-actions">
        <a className="button button-quiet" href={guideHref(guide.slug)}>
          Open guide <ChevronRight aria-hidden="true" size={16} />
        </a>
      </div>
    </article>
  )
}

export default function DocsPage() {
  return (
    <PageFrame home="../">
      <section className="sub-hero shell">
        <p className="eyebrow">DOCS / TECHNICAL REFERENCE</p>
        <h1>
          One index,
          <br />
          <em>one guide per package.</em>
        </h1>
        <p className="lede">
          This index keeps the architecture notes in one place and sends each package to its own
          guide. The selection path, the culling rules, and the package examples are all here, but
          the longer package docs live under their own route so they stay easy to link.
        </p>
        <div className="docs-actions">
          <a className="button button-primary" href="../#install">
            Back to install <ChevronRight aria-hidden="true" size={16} />
          </a>
          <a className="button button-quiet" href="../convert/">
            Convert a file <ArrowUpRight aria-hidden="true" size={16} />
          </a>
        </div>
        <div className="docs-toc">
          <a href="#decisions">Split</a>
          <a href="#lod">LOD</a>
          <a href="#culling">Culling</a>
          <a href="#packages">Packages</a>
          <a href="#support">Support</a>
        </div>
      </section>

      <section className="sub-section shell" id="decisions">
        <h2>
          How the stack is
          <br />
          <em>split.</em>
        </h2>
        <div className="docs-grid">
          {DOC_DECISIONS.map((card) => (
            <DecisionCard key={card.title} {...card} />
          ))}
        </div>
      </section>

      <section className="sub-section shell" id="lod">
        <h2>
          LOD selection
          <br />
          <em>and the result it returns.</em>
        </h2>
        <p className="lede">
          `@voxelkloud/view/lod` stays importable anywhere because it has no dependency on three,
          the DOM, or a GPU. The selector walks the tree best-first, spends the point budget, and
          stops when the projected error reaches the target.
        </p>
        <div className="docs-grid">
          <article className="docs-card">
            <h3>Basic use</h3>
            <p>
              Resolve the knobs once per frame, reuse the scratch buffers, and let the selector
              tell you whether budget, headroom, or the error floor stopped refinement.
            </p>
            <CodeBlock>{`import {
  createLodScratch,
  createLodSelection,
  resolveLodOptions,
  selectVisible,
} from '@voxelkloud/view/lod'

const opts = resolveLodOptions({ targetScreenError: 1.35, pointBudget: 3_000_000 })
const scratch = createLodScratch(tree.nodeCount)
const selection = createLodSelection(opts.maxNodes)

selectVisible(tree, cameraState, opts, scratch, selection)`}</CodeBlock>
          </article>
          <article className="docs-card">
            <h3>Selection result</h3>
            <p>
              `selection.limitedBy` says which ceiling won. `selection.achievedScreenError` says
              how much error the current frame actually left on screen.
            </p>
            <CodeBlock>{`if (selection.limitedBy === 'budget') {
  console.log('Spend more or lower the target.')
}

console.log(selection.achievedScreenError)`}</CodeBlock>
          </article>
        </div>
        <div className="docs-actions">
          <a className="button button-quiet" href="./view/lod/">
            Open the LOD guide <ChevronRight aria-hidden="true" size={16} />
          </a>
        </div>
      </section>

      <section className="sub-section shell" id="culling">
        <h2>
          Frustum culling
          <br />
          <em>and depth range handling.</em>
        </h2>
        <p className="lede">
          A node outside the frustum means its descendants are outside too, so the branch can be
          pruned immediately. The frustum planes are extracted once, then every box is classified
          against them with plain numbers.
        </p>
        <div className="docs-grid">
          <article className="docs-card">
            <h3>Plane extraction and box tests</h3>
            <p>
              The view hands the selector a camera snapshot. The low-level helpers then turn the
              clip-from-world matrix into six normalised planes and classify each box against them.
            </p>
            <CodeBlock>{`import {
  Containment,
  classifyAabb,
  extractFrustumPlanes,
} from '@voxelkloud/view/lod'

const planes = new Float64Array(24)
extractFrustumPlanes(clipFromWorld, planes, 'zero-to-one', false)

const state = classifyAabb(planes, minX, minY, minZ, maxX, maxY, maxZ)
if (state === Containment.Outside) return`}</CodeBlock>
          </article>
          <article className="docs-card">
            <h3>Depth convention</h3>
            <p>
              WebGPU and WebGL do not share the same depth range, so the renderer resolves the
              convention from the live backend before the selection step runs.
            </p>
            <CodeBlock>{`const depthRange = renderer.coordinateSystem === 2000
  ? 'zero-to-one'
  : 'minus-one-to-one'

extractFrustumPlanes(clipFromWorld, planes, depthRange, false)`}</CodeBlock>
          </article>
        </div>
      </section>

      <section className="sub-section shell" id="packages">
        <h2>
          Package guides,
          <br />
          <em>one link each.</em>
        </h2>
        <p className="lede">
          Each card below opens a guide dedicated to one package. Public packages and source-only
          drivers stay on the same page so the implementation notes are never far from the code.
        </p>
        {DOC_GUIDE_GROUPS.map((group) => (
          <div key={group.title} className="docs-group">
            <div className="docs-group-heading">
              <div>
                <h3>{group.title}</h3>
                <p>{group.summary}</p>
              </div>
            </div>
            <div className="docs-package-grid">
              {group.guides.map((slug) => (
                <PackageCard key={slug.join('/')} slug={slug} />
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="sub-section shell" id="support">
        <h2>
          Support packages,
          <br />
          <em>kept separate on purpose.</em>
        </h2>
        <div className="docs-support">
          <h3>Why the low-level bits are split out</h3>
          <p>
            The lower-level packages stay independent so workers, converters, and non-DOM code can
            import only the part they need.
          </p>
          <ul>
            <li>
              <code>@voxelkloud/wasm-core</code> holds the selector kernels used by workers and SSR
              paths.
            </li>
            <li>
              <code>@voxelkloud/format-las</code> keeps the LAS record decoder shared across format
              drivers.
            </li>
            <li>
              <code>@voxelkloud/format-single</code> and the converter both depend on that worker
              model.
            </li>
          </ul>
        </div>
      </section>
    </PageFrame>
  )
}
