import { Canvas, Box, Label, Defs, Arrow } from './primitives'

/**
 * Three ways state reaches components, side by side.
 *
 *   Prop drilling      Context              Redux / external store
 *   App                Provider             ┌ store ┐ (outside tree)
 *    │ value            ╱  │  ╲              App
 *    A  (forwards)     L   L   L             ├─ A   ◄── selector
 *    │ value                                 ├─ B
 *    B  (forwards)                           └─ C   ◄── selector
 *    │ value
 *    C  (uses)
 *
 * The contrast: drilling threads the prop through every level; context
 * broadcasts to all consumers at once (no per-field granularity); an external
 * store sits outside the tree and pushes only to components that select a slice.
 */
export function StateSharingDiagram() {
  const w = 524
  const h = 320

  // Three parallel columns.
  const colW = 156
  const gap = 14
  const x0 = 12
  const xA = x0
  const xB = x0 + colW + gap
  const xC = x0 + 2 * (colW + gap)

  const titleY = 26
  const takeawayY = h - 26 // two-line takeaway block at the bottom
  const nodeW = 96
  const nodeH = 34

  // Shared vertical rhythm for the node rows inside each panel.
  const row0 = 54
  const rowGap = 56

  return (
    <Canvas
      width={w}
      height={h}
      label="Sharing state across components: prop drilling vs context vs external store"
    >
      <Defs />

      {/* Faint separators between the three panels. */}
      {[xB - gap / 2, xC - gap / 2].map((sx) => (
        <line
          key={sx}
          x1={sx}
          y1={titleY + 6}
          x2={sx}
          y2={takeawayY - 16}
          stroke="var(--muted)"
          strokeWidth={1}
          strokeDasharray="3 5"
          opacity={0.5}
        />
      ))}

      {/* ════════════════ Panel A — Prop drilling (var --d-4) ════════════════ */}
      {(() => {
        const cx = xA + colW / 2
        const nx = cx - nodeW / 2
        const yApp = row0
        const yA = row0 + rowGap
        const yB = row0 + 2 * rowGap
        const yC = row0 + 3 * rowGap
        return (
          <g>
            <Label x={cx} y={titleY} color="var(--d-4)" weight={700} size={12.5}>
              Prop drilling
            </Label>

            <Box x={nx} y={yApp} w={nodeW} h={nodeH} title="App" color="var(--d-4)" titleSize={12} />
            <Box
              x={nx}
              y={yA}
              w={nodeW}
              h={nodeH}
              title="A"
              subtitle="forwards"
              color="var(--d-4)"
              titleSize={12}
            />
            <Box
              x={nx}
              y={yB}
              w={nodeW}
              h={nodeH}
              title="B"
              subtitle="forwards"
              color="var(--d-4)"
              titleSize={12}
            />
            <Box
              x={nx}
              y={yC}
              w={nodeW}
              h={nodeH}
              title="C"
              subtitle="uses value"
              color="var(--d-4)"
              titleSize={12}
            />

            {/* value threaded through every level. */}
            {[
              [yApp, yA],
              [yA, yB],
              [yB, yC],
            ].map(([from, to], i) => (
              <g key={i}>
                <Arrow x1={cx} y1={from + nodeH} x2={cx} y2={to - 2} color="var(--d-4)" width={1.7} />
                <Label x={cx + 8} y={(from + nodeH + to) / 2 + 4} anchor="start" mono color="var(--d-4)" size={9.5}>
                  value
                </Label>
              </g>
            ))}
          </g>
        )
      })()}

      {/* ════════════════ Panel B — Context (var --d-1) ════════════════ */}
      {(() => {
        const cx = xB + colW / 2
        const px = cx - nodeW / 2
        const yProv = row0
        const yLeaf = row0 + 2.4 * rowGap
        const leafW = 40
        const leafXs = [xB + 16, cx - leafW / 2, xB + colW - 16 - leafW]
        return (
          <g>
            <Label x={cx} y={titleY} color="var(--d-1)" weight={700} size={12.5}>
              Context
            </Label>

            <Box
              x={px}
              y={yProv}
              w={nodeW}
              h={nodeH}
              title="Provider"
              subtitle="value={…}"
              color="var(--d-1)"
              titleSize={12}
            />

            {/* Broadcast: fan out directly to every consumer leaf. */}
            {leafXs.map((lx, i) => (
              <g key={i}>
                <Arrow
                  x1={cx}
                  y1={yProv + nodeH}
                  x2={lx + leafW / 2}
                  y2={yLeaf - 2}
                  color="var(--d-1)"
                  width={1.6}
                />
                <Box
                  x={lx}
                  y={yLeaf}
                  w={leafW}
                  h={nodeH}
                  title="use"
                  color="var(--d-1)"
                  titleSize={10.5}
                  mono
                />
              </g>
            ))}

            <Label x={cx} y={yLeaf + nodeH + 18} color="var(--d-1)" size={9.5} weight={600}>
              consumers (skip A/B)
            </Label>
          </g>
        )
      })()}

      {/* ════════════ Panel C — Redux / external store (var --d-2) ════════════ */}
      {(() => {
        const cx = xC + colW / 2
        const storeW = 110
        const storeX = cx - storeW / 2
        const storeY = row0
        const nx = cx - nodeW / 2
        const yApp = row0 + 1.5 * rowGap
        const yA = yApp + rowGap * 0.78
        const yBn = yA + rowGap * 0.78
        return (
          <g>
            <Label x={cx} y={titleY} color="var(--d-2)" weight={700} size={12.5}>
              Redux / store
            </Label>

            {/* The store sits OUTSIDE the tree. */}
            <Box
              x={storeX}
              y={storeY}
              w={storeW}
              h={nodeH}
              title="store"
              subtitle="outside tree"
              color="var(--d-2)"
              titleSize={12}
            />

            {/* The component tree below. */}
            <Box x={nx} y={yApp} w={nodeW} h={nodeH - 6} title="App" color="var(--muted)" titleSize={11} />
            <Box x={nx} y={yA} w={nodeW} h={nodeH - 6} title="A" color="var(--d-2)" titleSize={11} />
            <Box x={nx} y={yBn} w={nodeW} h={nodeH - 6} title="B" color="var(--muted)" titleSize={11} />

            {/* Selective subscription: store → only the components that select. */}
            <Arrow
              x1={storeX + storeW - 14}
              y1={storeY + nodeH}
              x2={nx + nodeW - 6}
              y2={yA + (nodeH - 6) / 2}
              color="var(--d-2)"
              width={1.7}
            />
            <Label x={nx + nodeW + 4} y={yA + (nodeH - 6) / 2 + 3} anchor="start" mono color="var(--d-2)" size={9}>
              select()
            </Label>
            <Label x={cx} y={yBn + nodeH + 12} color="var(--muted)" size={9.5} weight={600}>
              B never subscribed
            </Label>
          </g>
        )
      })()}

      {/* ════════════════ Per-panel one-line takeaways ════════════════ */}
      <Label x={xA + colW / 2} y={takeawayY} color="var(--text)" size={9.5} weight={600}>
        threads through
      </Label>
      <Label x={xA + colW / 2} y={takeawayY + 13} color="var(--muted)" size={9}>
        every level forwards it
      </Label>

      <Label x={xB + colW / 2} y={takeawayY} color="var(--text)" size={9.5} weight={600}>
        broadcasts to all
      </Label>
      <Label x={xB + colW / 2} y={takeawayY + 13} color="var(--muted)" size={9}>
        every consumer re-renders
      </Label>

      <Label x={xC + colW / 2} y={takeawayY} color="var(--text)" size={9.5} weight={600}>
        selective subscription
      </Label>
      <Label x={xC + colW / 2} y={takeawayY + 13} color="var(--muted)" size={9}>
        only selected slices re-render
      </Label>
    </Canvas>
  )
}
