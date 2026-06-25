import { Canvas, Box, Label, Defs, Arrow } from './primitives'

/**
 * DOM event propagation — the three-phase model on a small nested tree.
 *
 *   document  ──▼ capture ──►  div.parent  ──▼──►  button.target
 *   document  ◄── bubble ──    div.parent  ◄────   button.target
 *
 * Capture descends from the root to the target, then the target fires, then
 * the event bubbles back up. A small dot rides the path down and up on a loop.
 */
export function EventPropagationDiagram() {
  const w = 520
  const h = 340

  // Three concentric nested boxes (outermost = document).
  const doc = { x: 40, y: 40, w: 440, h: 250 }
  const parent = { x: 96, y: 86, w: 328, h: 168 }
  const target = { x: 168, y: 138, w: 184, h: 70 }

  // Vertical line down the left gutter that the capture arrow / dot follows.
  const pathX = 70
  const topY = doc.y + 18
  const targetY = target.y + target.h / 2 // mid of the highlighted target
  const downDur = '2.2s'

  return (
    <Canvas width={w} height={h} label="DOM event propagation: capture, target and bubble phases">
      <Defs />

      <style>{`
        @keyframes ep-travel {
          0%   { transform: translateY(0); opacity: 0; }
          6%   { opacity: 1; }
          45%  { transform: translateY(var(--ep-dy)); opacity: 1; }
          50%  { transform: translateY(var(--ep-dy)); opacity: 1; }
          94%  { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(0); opacity: 0; }
        }
        .ep-dot {
          --ep-dy: ${targetY - topY}px;
          animation: ep-travel ${downDur} ease-in-out infinite;
        }
      `}</style>

      {/* Nested DOM tree: document → div.parent → button.target */}
      <Box
        x={doc.x}
        y={doc.y}
        w={doc.w}
        h={doc.h}
        color="var(--muted)"
        fill="var(--surface)"
        radius={12}
      />
      <Label x={doc.x + 12} y={doc.y + 20} anchor="start" color="var(--muted)" mono weight={600}>
        document
      </Label>

      <Box
        x={parent.x}
        y={parent.y}
        w={parent.w}
        h={parent.h}
        color="var(--d-2)"
        fill="var(--surface-2)"
        radius={11}
      />
      <Label x={parent.x + 12} y={parent.y + 19} anchor="start" color="var(--d-2)" mono weight={600}>
        div.parent
      </Label>

      {/* The target node, highlighted. */}
      <Box
        x={target.x}
        y={target.y}
        w={target.w}
        h={target.h}
        title="button.target"
        subtitle="event fires here"
        color="var(--d-5)"
        fill="var(--surface-2)"
        radius={10}
        mono
      />

      {/* Capture phase: down the left gutter. */}
      <Arrow x1={pathX} y1={topY} x2={pathX} y2={targetY - 4} color="var(--d-1)" width={2} />
      <Label x={pathX + 10} y={topY + 28} anchor="start" color="var(--d-1)" weight={600}>
        1. Capture phase ▼
      </Label>

      {/* Bubble phase: up the right gutter. */}
      <Arrow
        x1={doc.x + doc.w - 30}
        y1={targetY}
        x2={doc.x + doc.w - 30}
        y2={topY + 4}
        color="var(--d-3)"
        width={2}
      />
      <Label
        x={doc.x + doc.w - 40}
        y={topY + 28}
        anchor="end"
        color="var(--d-3)"
        weight={600}
      >
        3. Bubble phase ▲
      </Label>

      {/* Target marker label between the two phase arrows. */}
      <Label x={w / 2} y={target.y - 12} color="var(--d-5)" weight={700} size={12}>
        2. Target
      </Label>

      {/* Travelling dot riding the capture→bubble path. */}
      <circle className="ep-dot" cx={pathX} cy={topY} r={5} fill="var(--d-4)" />

      {/* Legend: stopPropagation halts the remaining path. */}
      <line
        x1={40}
        y1={h - 38}
        x2={40}
        y2={h - 22}
        stroke="var(--d-4)"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <Label x={54} y={h - 30} anchor="start" color="var(--text)" weight={600} size={11}>
        e.stopPropagation()
      </Label>
      <Label x={54} y={h - 14} anchor="start" color="var(--muted)" size={10.5}>
        halts the rest of the capture/bubble path
      </Label>
    </Canvas>
  )
}
