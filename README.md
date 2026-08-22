# voxelkloud.github.io

The voxelkloud landing page, live at <https://voxelkloud.github.io/>. Next.js 16,
static export, no server and no runtime services.

```sh
pnpm install
pnpm dev                 # http://localhost:3000
pnpm build               # static export into out/
pnpm preview             # serve the export on http://localhost:4321
```

If your checkout sits inside the voxelkloud monorepo working copy, pnpm will find
that repo's `pnpm-workspace.yaml` and try to treat this as a member. Add
`--ignore-workspace` to install commands there:

```sh
pnpm install --ignore-workspace
```

CI never hits this — it checks out this repo alone.

## Deploying

`.github/workflows/deploy.yml` builds and publishes to GitHub Pages on every push
to `main`. Pages must be set to **GitHub Actions** as its source (Settings →
Pages → Build and deployment → Source).

This is an org page, so it is served from the domain root and needs no path
prefix. The workflow still reads the prefix from `actions/configure-pages` rather
than assuming, so moving the site into a project repo would keep working:

| Variable                | Meaning                                                  |
| ----------------------- | -------------------------------------------------------- |
| `NEXT_PUBLIC_BASE_PATH` | Path prefix. Empty here; `/<repo>` for a project page.     |
| `NEXT_PUBLIC_SITE_URL`  | Absolute origin + path, for the OG and Twitter card URLs. Needs the trailing slash. |

To reproduce a project-page build locally:

```sh
NEXT_PUBLIC_BASE_PATH=/somewhere pnpm build
```

For a custom domain, add `public/CNAME` with the hostname. `configure-pages`
reports an empty `base_path` once the domain is set, so nothing else changes.

## Layout

| Path                           | What it is                                          |
| ------------------------------ | --------------------------------------------------- |
| `app/page.tsx`                 | The whole page. Copy lives in the arrays at the top.  |
| `app/globals.css`              | The design system: tokens, then one block per section. |
| `app/icon.svg`, `app/icon.png`, `app/apple-icon.png` | Favicons, generated from the mark. |
| `components/brand-mark.tsx`    | The voxelkloud mark.                                 |
| `components/point-cloud-scene.tsx` | Decorative hero backdrop. Lazy-loaded, `ssr: false`, and it stops under `prefers-reduced-motion`. |
| `public/og.png`                | Social card, 1200x630.                               |

Regenerate the icons after editing `app/icon.svg`:

```sh
rsvg-convert -w 180 -h 180 app/icon.svg -o app/apple-icon.png
rsvg-convert -w 48 -h 48 app/icon.svg -o app/icon.png
```

The mark's geometry — three 7x7 squares stepping up and to the right by (3, -3),
middle one filled — is shared with the viewer HUD and the org avatar, which live
in the voxelkloud monorepo (`demo/app/src/App.tsx` and `brand/`). Change the shape
here and it has to change there too.

## Content rules

The page claims only what the code can back:

- Performance numbers come from the monorepo's `ROADMAP.md` and carry their
  caveats on screen.
- The install commands are badged NOT PUBLISHED TO NPM YET until they are.
- The "Run it" commands are the real ones from the monorepo README, badged
  MONOREPO NOT PUBLIC YET until that repo exists. Drop the badge in
  `app/page.tsx` when it does.
