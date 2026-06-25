import { Canvas, Box, Label, Defs, Arrow } from './primitives'

/**
 * CodeToOsDiagram — a layered stack showing how a line of JS travels from your
 * source code down through the engine, runtime and kernel to the hardware, and
 * how results come back up. The dashed line is the user-space / kernel-space
 * boundary (a syscall trap), drawn prominently because that crossing is where
 * "the same JS behaves differently per OS" actually originates.
 */
export function CodeToOsDiagram() {
  const W = 520
  const H = 440

  // Stack geometry. Bands are full-width rounded boxes stacked vertically.
  const bandX = 40
  const bandW = 350
  const bandH = 44
  const gap = 10

  type Band = { title: string; subtitle?: string; color: string }
  const bands: Band[] = [
    { title: 'Your JS code', color: 'var(--d-1)' },
    { title: 'JS Engine (V8)', subtitle: 'parse · JIT · GC', color: 'var(--d-2)' },
    {
      title: 'Runtime APIs',
      subtitle: 'Browser Web APIs / Node',
      color: 'var(--d-3)',
    },
    // --- kernel boundary sits between index 2 and 3 ---
    {
      title: 'System calls',
      subtitle: 'read · write · socket · mmap',
      color: 'var(--d-4)',
    },
    {
      title: 'OS Kernel',
      subtitle: 'processes · memory · files · network · threads',
      color: 'var(--d-5)',
    },
    {
      title: 'Hardware',
      subtitle: 'CPU · RAM · disk · NIC',
      color: 'var(--muted)',
    },
  ]

  const top = 30
  // y of band i; insert extra room for the boundary line before band index 3.
  const boundaryGap = 26
  const bandY = (i: number) =>
    top + i * (bandH + gap) + (i >= 3 ? boundaryGap : 0)

  // Boundary line sits centered in the extra gap before the "System calls" band.
  const boundaryY = bandY(3) - gap - boundaryGap / 2

  // Side rails for the descending call path and the ascending return path.
  const lastY = bandY(bands.length - 1)
  const railTop = top + bandH / 2
  const railBottom = lastY + bandH / 2
  const downX = bandX - 18
  const upX = bandX + bandW + 18

  return (
    <Canvas width={W} height={H} label="How JavaScript code reaches the hardware through engine, runtime, syscalls and kernel">
      <Defs />

      {/* Descending call path (left rail): code -> hardware */}
      <Arrow x1={downX} y1={railTop} x2={downX} y2={railBottom} color="var(--d-1)" width={2} />
      <Label x={downX - 6} y={(railTop + railBottom) / 2} anchor="end" size={9.5} color="var(--d-1)">
        call
      </Label>
      <Label x={downX - 6} y={(railTop + railBottom) / 2 + 12} anchor="end" size={9.5} color="var(--d-1)">
        path ↓
      </Label>

      {/* Ascending return path (right rail): results bubble back up */}
      <Arrow x1={upX} y1={railBottom} x2={upX} y2={railTop} color="var(--d-3)" width={2} />
      <Label x={upX + 6} y={(railTop + railBottom) / 2} anchor="start" size={9.5} color="var(--d-3)">
        results
      </Label>
      <Label x={upX + 6} y={(railTop + railBottom) / 2 + 12} anchor="start" size={9.5} color="var(--d-3)">
        ↑ return
      </Label>

      {/* The stacked bands */}
      {bands.map((b, i) => (
        <Box
          key={b.title}
          x={bandX}
          y={bandY(i)}
          w={bandW}
          h={bandH}
          title={b.title}
          subtitle={b.subtitle}
          color={b.color}
        />
      ))}

      {/* Kernel boundary: prominent dashed line + label */}
      <line
        x1={bandX - 24}
        y1={boundaryY}
        x2={bandX + bandW + 24}
        y2={boundaryY}
        stroke="var(--d-4)"
        strokeWidth={2}
        strokeDasharray="7 5"
      />
      <Label x={bandX} y={boundaryY - 6} anchor="start" size={10} weight={650} color="var(--d-4)">
        user space ↑
      </Label>
      <Label x={bandX + bandW} y={boundaryY + 14} anchor="end" size={10} weight={650} color="var(--d-4)">
        kernel space ↓
      </Label>

      {/* Side note about OS-specific behaviour */}
      <Box
        x={W - 118}
        y={top}
        w={108}
        h={150}
        color="var(--muted)"
        fill="var(--surface)"
        dashed
        radius={8}
      />
      <Label x={W - 64} y={top + 18} size={10} weight={650} color="var(--text)">
        same JS,
      </Label>
      <Label x={W - 64} y={top + 31} size={10} weight={650} color="var(--text)">
        different OS →
      </Label>
      {[
        'path separators',
        'line endings',
        'file watchers',
        'memory limits',
        'all differ',
      ].map((line, i) => (
        <Label key={line} x={W - 110} y={top + 52 + i * 18} anchor="start" size={9.5} color="var(--muted)">
          • {line}
        </Label>
      ))}
    </Canvas>
  )
}
