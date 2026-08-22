/**
 * The voxelkloud mark, identical in geometry to the one the viewer HUD draws
 * (see demo/app/src/App.tsx `brandMarkSegment`): three 7x7 squares stepping up
 * and to the right by (3, -3), with the middle one filled.
 *
 * The viewer builds it from three absolutely positioned elements; here it is one
 * SVG so it stays crisp at any size and doubles as the favicon artwork.
 */
export function BrandMark({ size = 16 }: { size?: number }) {
  return (
    <svg
      aria-hidden="true"
      className="brand-mark"
      focusable="false"
      fill="none"
      height={size}
      viewBox="0 0 13 13"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Painted back to front, so the filled middle square sits over the lower
          square and under the upper one — the same stacking as the HUD. */}
      <rect x="0.5" y="6.5" width="6" height="6" stroke="currentColor" />
      <rect x="3.5" y="3.5" width="6" height="6" fill="currentColor" stroke="currentColor" />
      <rect x="6.5" y="0.5" width="6" height="6" stroke="currentColor" />
    </svg>
  )
}
