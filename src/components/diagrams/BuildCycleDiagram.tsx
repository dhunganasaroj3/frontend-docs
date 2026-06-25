import { Canvas, Box, Label, Defs, Arrow } from './primitives'

/**
 * How source becomes shipped code — a left-to-right build pipeline that wraps
 * to a second row. Annotations under the transform steps explain what each
 * stage does, and a small branch note contrasts the dev path (ESM + HMR,
 * no bundling) with the full prod pipeline.
 */
export function BuildCycleDiagram() {
  const boxW = 150
  const boxH = 46
  const gap = 22 // horizontal space between boxes for the arrow

  // Top row: 3 boxes left-to-right.
  const row1Y = 30
  const x0 = 12
  const x1 = x0 + boxW + gap
  const x2 = x1 + boxW + gap

  // Bottom row: 3 boxes right-to-left visual continuation, but we keep them
  // left-to-right and use a turn arrow from the end of row 1.
  const row2Y = 200
  const annotY1 = row1Y + boxH + 14 // annotations under top row
  const annotY2 = row2Y + boxH + 14 // annotations under bottom row

  const midY1 = row1Y + boxH / 2
  const midY2 = row2Y + boxH / 2

  return (
    <Canvas width={520} height={300} label="Build pipeline: source through transpile, bundle, minify to dist and the browser">
      <Defs />

      {/* ---- Top row ---- */}
      <Box x={x0} y={row1Y} w={boxW} h={boxH} title="Source" subtitle="TS / JSX, modules" color="var(--d-1)" titleSize={12.5} />
      <Box x={x1} y={row1Y} w={boxW} h={boxH} title="Transpile" subtitle="esbuild / SWC / Babel" color="var(--d-2)" titleSize={12.5} />
      <Box x={x2} y={row1Y} w={boxW} h={boxH} title="Bundle + tree-shake" subtitle="Rollup / Rolldown" color="var(--d-3)" titleSize={12.5} />

      {/* arrows across top row */}
      <Arrow x1={x0 + boxW} y1={midY1} x2={x1} y2={midY1} color="var(--d-1)" />
      <Arrow x1={x1 + boxW} y1={midY1} x2={x2} y2={midY1} color="var(--d-2)" />

      {/* annotations under top row (transpile + bundle) */}
      <Label x={x1 + boxW / 2} y={annotY1} size={9.5} color="var(--muted)">
        strip types, JSX → JS
      </Label>
      <Label x={x2 + boxW / 2} y={annotY1} size={9.5} color="var(--muted)">
        resolve imports, dead-code elim
      </Label>

      {/* ---- Turn arrow: end of top row down and back to start of bottom row ---- */}
      <line x1={x2 + boxW / 2} y1={row1Y + boxH} x2={x2 + boxW / 2} y2={130} stroke="var(--d-3)" strokeWidth={1.6} />
      <line x1={x2 + boxW / 2} y1={130} x2={x0 + boxW / 2} y2={130} stroke="var(--d-3)" strokeWidth={1.6} />
      <Arrow x1={x0 + boxW / 2} y1={130} x2={x0 + boxW / 2} y2={row2Y} color="var(--d-3)" />

      {/* ---- Bottom row ---- */}
      <Box x={x0} y={row2Y} w={boxW} h={boxH} title="Minify + hash + split" subtitle="" color="var(--d-4)" titleSize={12.5} />
      <Box x={x1} y={row2Y} w={boxW} h={boxH} title="dist/" subtitle="static assets" color="var(--d-5)" titleSize={12.5} />
      <Box x={x2} y={row2Y} w={boxW} h={boxH} title="Browser / CDN" subtitle="" color="var(--muted)" titleSize={12.5} />

      {/* arrows across bottom row */}
      <Arrow x1={x0 + boxW} y1={midY2} x2={x1} y2={midY2} color="var(--d-4)" />
      <Arrow x1={x1 + boxW} y1={midY2} x2={x2} y2={midY2} color="var(--d-5)" />

      {/* annotation under minify */}
      <Label x={x0 + boxW / 2} y={annotY2} size={9.5} color="var(--muted)">
        smaller + cache-busting names
      </Label>

      {/* ---- dev vs prod branch note ---- */}
      <Box
        x={x1 + 6}
        y={annotY2 + 8}
        w={boxW * 2 + gap - 12}
        h={34}
        color="var(--d-1)"
        fill="var(--surface)"
        dashed
        radius={8}
      />
      <Label x={x1 + 16} y={annotY2 + 22} size={9.5} color="var(--d-1)" weight={650} anchor="start">
        dev: ESM + HMR, no bundling
      </Label>
      <Label x={x1 + 16} y={annotY2 + 34} size={9.5} color="var(--muted)" anchor="start">
        prod: the full pipeline above
      </Label>
    </Canvas>
  )
}
