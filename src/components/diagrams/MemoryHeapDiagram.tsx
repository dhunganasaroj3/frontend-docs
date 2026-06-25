import { Canvas, Box, Label, Defs, Arrow } from './primitives'

/**
 * JS memory model — the call stack vs. the heap, and GC reachability.
 *
 *   ┌ Call Stack ┐            ┌──── Heap ────┐
 *   │ frame      │  user ─────────► { user obj }
 *   │  count: 3  │  cache ────────► [ array ]  ──► { nested }
 *   │  user → •  │                  { detached }  ✕  (no refs → freed)
 *   └────────────┘
 *
 * Variables on the stack hold primitives directly or hold *references* into
 * the heap. A GC root walk keeps everything reachable from the stack; an
 * object with no incoming reference is unreachable and gets collected. A
 * memory leak is just an object that is still (unintentionally) reachable.
 */
export function MemoryHeapDiagram() {
  const w = 520
  const h = 372

  // Left column: the call stack.
  const stack = { x: 28, y: 56, w: 168, h: 232 }

  // Heap objects on the right. y is the vertical centre of each blob.
  const userObj = { x: 300, y: 64, w: 150, h: 46 }
  const cacheArr = { x: 300, y: 130, w: 150, h: 40 }
  const nested = { x: 360, y: 192, w: 132, h: 40 }
  const detached = { x: 300, y: 252, w: 150, h: 46 }

  // Reference slots inside the stack (the "→ •" rows), with their dot anchors.
  const userSlotY = stack.y + 150
  const cacheSlotY = stack.y + 186
  const dotX = stack.x + stack.w - 16

  return (
    <Canvas
      width={w}
      height={h}
      label="JS memory: call stack vs heap, and garbage collection by reachability"
    >
      <Defs />

      <style>{`
        @keyframes mh-fade {
          0%, 100% { opacity: 0.45; }
          50%      { opacity: 1; }
        }
        .mh-garbage { animation: mh-fade 2.8s ease-in-out infinite; }
      `}</style>

      {/* ── Region titles ───────────────────────────────────────────── */}
      <Label x={stack.x} y={40} anchor="start" color="var(--d-1)" weight={700} size={13}>
        Call Stack
      </Label>
      <Label x={userObj.x} y={40} anchor="start" color="var(--d-2)" weight={700} size={13}>
        Heap
      </Label>

      {/* ── GC roots tag, top-left of the stack ─────────────────────── */}
      <Label x={stack.x + stack.w} y={40} anchor="end" color="var(--d-3)" weight={600} size={10.5}>
        GC roots ▾
      </Label>

      {/* ── The call stack column ───────────────────────────────────── */}
      <Box
        x={stack.x}
        y={stack.y}
        w={stack.w}
        h={stack.h}
        color="var(--d-1)"
        fill="var(--surface)"
        radius={11}
      />

      {/* Frame divider + a primitive-holding frame at the top. */}
      <line
        x1={stack.x}
        y1={stack.y + 120}
        x2={stack.x + stack.w}
        y2={stack.y + 120}
        stroke="var(--d-1)"
        strokeWidth={1}
        strokeDasharray="4 4"
        opacity={0.6}
      />
      <Label x={stack.x + 14} y={stack.y + 24} anchor="start" color="var(--muted)" size={10}>
        frame: render()
      </Label>
      <Label x={stack.x + 14} y={stack.y + 50} anchor="start" mono color="var(--text)" size={11.5}>
        count = 3
      </Label>
      <Label x={stack.x + 14} y={stack.y + 72} anchor="start" mono color="var(--text)" size={11.5}>
        name = &quot;ada&quot;
      </Label>
      <Label x={stack.x + 14} y={stack.y + 94} anchor="start" color="var(--muted)" size={10}>
        ← primitives live inline
      </Label>

      {/* Reference rows: hold a pointer (•) into the heap, not the value. */}
      <Label x={stack.x + 14} y={stack.y + 112} anchor="start" color="var(--muted)" size={10}>
        frame: app()
      </Label>
      <Label x={stack.x + 14} y={userSlotY + 4} anchor="start" mono color="var(--text)" size={11.5}>
        user →
      </Label>
      <circle cx={dotX} cy={userSlotY} r={4.5} fill="var(--d-3)" />
      <Label x={stack.x + 14} y={cacheSlotY + 4} anchor="start" mono color="var(--text)" size={11.5}>
        cache →
      </Label>
      <circle cx={dotX} cy={cacheSlotY} r={4.5} fill="var(--d-3)" />

      {/* ── Heap objects ────────────────────────────────────────────── */}
      {/* Reachable set (kept): user object + cache array + its nested object. */}
      <Box
        x={userObj.x}
        y={userObj.y}
        w={userObj.w}
        h={userObj.h}
        title="{ name, roles }"
        subtitle="user object"
        color="var(--d-3)"
        mono
        titleSize={12}
      />
      <Box
        x={cacheArr.x}
        y={cacheArr.y}
        w={cacheArr.w}
        h={cacheArr.h}
        title="[ … , … ]"
        color="var(--d-3)"
        mono
        titleSize={12}
      />
      <Box
        x={nested.x}
        y={nested.y}
        w={nested.w}
        h={nested.h}
        title="{ blob }"
        color="var(--d-3)"
        mono
        titleSize={12}
      />

      {/* Unreachable / detached object — no incoming reference → collected. */}
      <g className="mh-garbage">
        <Box
          x={detached.x}
          y={detached.y}
          w={detached.w}
          h={detached.h}
          title="{ orphan }"
          color="var(--d-5)"
          fill="var(--surface)"
          dashed
          mono
          titleSize={12}
        />
      </g>

      {/* ── Reference arrows: stack → heap ──────────────────────────── */}
      <Arrow
        x1={dotX + 6}
        y1={userSlotY}
        x2={userObj.x - 4}
        y2={userObj.y + userObj.h / 2}
        color="var(--d-3)"
        width={1.8}
      />
      <Arrow
        x1={dotX + 6}
        y1={cacheSlotY}
        x2={cacheArr.x - 4}
        y2={cacheArr.y + cacheArr.h / 2}
        color="var(--d-3)"
        width={1.8}
      />
      {/* Heap → heap: the array references a further nested object. */}
      <Arrow
        x1={cacheArr.x + cacheArr.w - 24}
        y1={cacheArr.y + cacheArr.h}
        x2={nested.x + 12}
        y2={nested.y}
        color="var(--d-3)"
        width={1.6}
      />

      {/* "references" annotation along the live edges. */}
      <Label x={258} y={92} color="var(--d-3)" size={10} weight={600}>
        references
      </Label>

      {/* Cut-marker on the orphan: severed reference. */}
      <line
        x1={detached.x - 30}
        y1={detached.y + detached.h / 2}
        x2={detached.x - 6}
        y2={detached.y + detached.h / 2}
        stroke="var(--d-5)"
        strokeWidth={1.6}
        strokeDasharray="4 4"
      />
      <Label
        x={detached.x - 18}
        y={detached.y + detached.h / 2 - 8}
        color="var(--d-5)"
        size={13}
        weight={700}
      >
        ✕
      </Label>
      <Label
        x={detached.x + detached.w / 2}
        y={detached.y + detached.h + 14}
        color="var(--d-5)"
        size={10}
        weight={600}
      >
        no references → garbage collected
      </Label>

      {/* ── Caption ─────────────────────────────────────────────────── */}
      <Label x={w / 2} y={h - 16} color="var(--text)" size={10.5} weight={600}>
        Reachable from roots = retained. Unreachable = freed.
      </Label>
      <Label x={w / 2} y={h - 2} color="var(--muted)" size={10}>
        A leak = unintentionally still reachable.
      </Label>
    </Canvas>
  )
}
