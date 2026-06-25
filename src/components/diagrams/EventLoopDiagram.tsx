import { Canvas, Box, Label, Defs, Arrow } from './primitives'

/**
 * The JS runtime event-loop model.
 *
 *   Call Stack (LIFO) ──► Web APIs / timers ──► queues ──┐
 *        ▲                                                │
 *        └──────────── event loop pushes when empty ◄─────┘
 *
 * Async work is offloaded to Web APIs; when ready, callbacks land in a queue.
 * The event loop moves work back onto the stack only when the stack is empty,
 * and it fully drains the microtask queue before taking the next macrotask.
 */
export function EventLoopDiagram() {
  const w = 520
  const h = 360

  const stack = { x: 28, y: 70, w: 150, h: 196 }
  const webapi = { x: 322, y: 56, w: 168, h: 86 }
  const micro = { x: 222, y: 250, w: 268, h: 48 }
  const macro = { x: 222, y: 308, w: 268, h: 48 }

  // The event-loop circle sits center-left, between the stack and the queues.
  const loop = { cx: 232, cy: 178, r: 40 }

  return (
    <Canvas width={w} height={h} label="JavaScript event loop: call stack, Web APIs, microtask and macrotask queues">
      <Defs />

      <style>{`
        @keyframes el-spin { to { transform: rotate(360deg); } }
        .el-spin {
          transform-box: fill-box;
          transform-origin: center;
          animation: el-spin 4s linear infinite;
        }
      `}</style>

      {/* Call Stack (LIFO) */}
      <Box
        x={stack.x}
        y={stack.y}
        w={stack.w}
        h={stack.h}
        title="Call Stack"
        subtitle="LIFO · runs to empty"
        color="var(--d-1)"
        radius={11}
      />
      {/* A couple of stacked frames to suggest LIFO. */}
      <rect
        x={stack.x + 22}
        y={stack.y + stack.h - 40}
        width={stack.w - 44}
        height={26}
        rx={6}
        fill="var(--d-1)"
        opacity={0.16}
      />
      <rect
        x={stack.x + 22}
        y={stack.y + stack.h - 72}
        width={stack.w - 44}
        height={26}
        rx={6}
        fill="var(--d-1)"
        opacity={0.1}
      />
      <Label x={stack.x + stack.w / 2} y={stack.y + stack.h - 23} color="var(--d-1)" mono size={10}>
        frame()
      </Label>

      {/* Web APIs / timers */}
      <Box
        x={webapi.x}
        y={webapi.y}
        w={webapi.w}
        h={webapi.h}
        title="Web APIs / timers"
        subtitle="setTimeout · fetch · DOM"
        color="var(--d-4)"
        radius={11}
      />

      {/* Microtask queue (drains first) */}
      <Box
        x={micro.x}
        y={micro.y}
        w={micro.w}
        h={micro.h}
        title="Microtask queue"
        subtitle="Promises · queueMicrotask"
        color="var(--d-2)"
        radius={10}
      />

      {/* Macrotask queue */}
      <Box
        x={macro.x}
        y={macro.y}
        w={macro.w}
        h={macro.h}
        title="Macrotask queue"
        subtitle="setTimeout callbacks · events"
        color="var(--d-3)"
        radius={10}
      />

      {/* Event loop: a rotating dashed ring with a chasing dot. */}
      <g className="el-spin">
        <circle
          cx={loop.cx}
          cy={loop.cy}
          r={loop.r}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={3}
          strokeDasharray="6 8"
          opacity={0.55}
        />
        {/* leading dot on the ring to convey rotation direction */}
        <circle cx={loop.cx + loop.r} cy={loop.cy} r={4.5} fill="var(--d-5)" />
      </g>
      <Label x={loop.cx} y={loop.cy - 2} color="var(--text)" weight={700} size={11}>
        Event
      </Label>
      <Label x={loop.cx} y={loop.cy + 13} color="var(--text)" weight={700} size={11}>
        Loop
      </Label>

      {/* stack → Web APIs : async call offloaded */}
      <Arrow
        x1={stack.x + stack.w}
        y1={stack.y + 24}
        x2={webapi.x}
        y2={webapi.y + webapi.h / 2}
        color="var(--d-4)"
        width={1.8}
      />
      <Label x={262} y={stack.y + 6} color="var(--d-4)" size={10} weight={600}>
        async offloaded
      </Label>

      {/* Web APIs → queues : callback ready (lands in the appropriate queue) */}
      <Arrow
        x1={webapi.x + webapi.w / 2}
        y1={webapi.y + webapi.h}
        x2={macro.x + macro.w - 36}
        y2={macro.y}
        color="var(--muted)"
        width={1.6}
        dashed
      />
      <Label x={webapi.x + webapi.w / 2 + 58} y={206} color="var(--muted)" size={10} weight={600}>
        callback ready
      </Label>

      {/* microtask queue → event loop */}
      <Arrow
        x1={micro.x}
        y1={micro.y + micro.h / 2}
        x2={loop.cx + loop.r + 4}
        y2={loop.cy + 6}
        color="var(--d-2)"
        width={1.8}
      />

      {/* event loop → stack : pushes work when the stack is empty */}
      <Arrow
        x1={loop.cx - loop.r - 2}
        y1={loop.cy}
        x2={stack.x + stack.w / 2}
        y2={stack.y + stack.h + 2}
        color="var(--d-3)"
        width={1.8}
      />
      <Label x={loop.cx - 6} y={loop.cy + loop.r + 22} color="var(--text-soft)" size={10} weight={600}>
        pushes when stack empty
      </Label>

      {/* KEY note */}
      <Label x={w / 2} y={h - 8} color="var(--d-2)" weight={700} size={11.5}>
        Key: microtasks drain FULLY before the next macrotask
      </Label>
    </Canvas>
  )
}
