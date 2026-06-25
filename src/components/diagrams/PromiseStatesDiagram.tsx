import { Canvas, Box, Label, Defs, Arrow, Pill } from './primitives'

/**
 * The Promise state machine:
 *   pending  --resolve(value)-->  fulfilled (value)
 *   pending  --reject(error)--->  rejected (reason)
 * Once a promise settles (fulfilled or rejected) the state is FINAL/immutable.
 * Below: which handler attaches to which outcome — .then / .catch, and
 * .finally() which runs for either settled state.
 */

// pending box (center-left)
const PX = 28
const PY = 96
const PW = 130
const PH = 56

// outcome boxes (right column)
const OW = 150
const OH = 52
const OX = 322
const FUL_Y = 50 // fulfilled (top)
const REJ_Y = 150 // rejected (bottom)

// handler row baseline
const HANDLER_Y = 232

export function PromiseStatesDiagram() {
  return (
    <Canvas
      width={520}
      height={300}
      label="Promise state machine: a pending promise settles to either fulfilled or rejected, which are final, with then, catch and finally handlers"
    >
      <style>{`
        @keyframes ps-pulse {
          0%, 100% { opacity: 0.5; }
          50%      { opacity: 0; }
        }
        .ps-pulse { animation: ps-pulse 2.6s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
      `}</style>

      <Defs />

      {/* subtle pulse ring behind the pending box */}
      <rect
        className="ps-pulse"
        x={PX - 4}
        y={PY - 4}
        width={PW + 8}
        height={PH + 8}
        rx={13}
        fill="none"
        stroke="var(--d-4)"
        strokeWidth={1.6}
      />

      {/* pending state */}
      <Box x={PX} y={PY} w={PW} h={PH} title="pending" subtitle="not settled yet" color="var(--d-4)" />

      {/* outcome: fulfilled */}
      <Box
        x={OX}
        y={FUL_Y}
        w={OW}
        h={OH}
        title="fulfilled"
        subtitle="has a value"
        color="var(--d-3)"
      />

      {/* outcome: rejected */}
      <Box
        x={OX}
        y={REJ_Y}
        w={OW}
        h={OH}
        title="rejected"
        subtitle="has a reason / error"
        color="var(--d-5)"
      />

      {/* transitions out of pending */}
      <Arrow
        x1={PX + PW}
        y1={PY + 6}
        x2={OX}
        y2={FUL_Y + OH / 2}
        color="var(--d-3)"
        width={1.8}
      />
      <Label x={246} y={64} size={10.5} color="var(--d-3)" mono>
        resolve(value)
      </Label>

      <Arrow
        x1={PX + PW}
        y1={PY + PH - 6}
        x2={OX}
        y2={REJ_Y + OH / 2}
        color="var(--d-5)"
        width={1.8}
      />
      <Label x={246} y={188} size={10.5} color="var(--d-5)" mono>
        reject(error)
      </Label>

      {/* "settled = final/immutable" note bracketing the two outcomes */}
      <g stroke="var(--muted)" strokeWidth={1.2} fill="none" opacity={0.85}>
        <path
          d={`M ${OX + OW + 10} ${FUL_Y + 8} L ${OX + OW + 16} ${FUL_Y + 8} L ${OX + OW + 16} ${REJ_Y + OH - 8} L ${OX + OW + 10} ${REJ_Y + OH - 8}`}
        />
      </g>
      {/* tiny lock glyph */}
      <g transform={`translate(${OX + OW + 24}, ${(FUL_Y + REJ_Y + OH) / 2 - 14})`}>
        <rect x={0} y={6} width={12} height={9} rx={2} fill="none" stroke="var(--muted)" strokeWidth={1.3} />
        <path d="M 2.5 6 V 3.5 A 3.5 3.5 0 0 1 9.5 3.5 V 6" fill="none" stroke="var(--muted)" strokeWidth={1.3} />
      </g>
      <Label x={OX + OW + 18} y={(FUL_Y + REJ_Y + OH) / 2 + 10} anchor="start" size={9.5} color="var(--muted)">
        settled —
      </Label>
      <Label x={OX + OW + 18} y={(FUL_Y + REJ_Y + OH) / 2 + 21} anchor="start" size={9.5} color="var(--muted)">
        can&apos;t change
      </Label>

      {/* divider before handler row */}
      <line x1={20} y1={210} x2={500} y2={210} stroke="var(--muted)" strokeWidth={1} opacity={0.3} />
      <Label x={20} y={205} anchor="start" size={10} weight={600} color="var(--text-soft)">
        handlers
      </Label>

      {/* handler row: .then attached to fulfilled, .catch to rejected, .finally either way */}
      {/* .then(onFulfilled) under fulfilled */}
      <Arrow x1={OX + 28} y1={FUL_Y + OH} x2={OX + 28} y2={HANDLER_Y - 2} color="var(--d-3)" width={1.4} dashed />
      <Pill x={OX - 6} y={HANDLER_Y} w={140} text=".then(onFulfilled)" color="var(--d-3)" />

      {/* .catch(onRejected) under rejected */}
      <Arrow x1={OX + 28} y1={REJ_Y + OH} x2={OX + 28} y2={HANDLER_Y + 26} color="var(--d-5)" width={1.4} dashed />
      <Pill x={OX - 6} y={HANDLER_Y + 28} w={140} text=".catch(onRejected)" color="var(--d-5)" />

      {/* .finally() runs for either settled state */}
      <Pill x={36} y={HANDLER_Y + 14} w={120} text=".finally()" color="var(--d-1)" />
      <Label x={96} y={HANDLER_Y + 50} size={9.5} color="var(--muted)">
        runs either way
      </Label>
      <Arrow x1={156} y1={HANDLER_Y + 10} x2={OX - 10} y2={HANDLER_Y + 10} color="var(--d-1)" width={1.3} dashed />
    </Canvas>
  )
}
