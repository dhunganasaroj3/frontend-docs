import { Canvas, Label, Defs, Arrow } from './primitives'

/**
 * Compares how the same burst of rapid events flows through three strategies,
 * all sharing one left-to-right timeline:
 *   Lane 1  raw events      — every tick the user fires
 *   Lane 2  debounce        — a single trailing call, only after the burst goes quiet
 *   Lane 3  throttle        — evenly spaced calls, at most one per interval
 */

// Shared timeline geometry so every lane lines up on the same x-axis.
const X0 = 70 // left edge of the active timeline
const X1 = 470 // right edge of the active timeline
const SPAN = X1 - X0

// The user's burst occupies roughly the first ~70% of the timeline, then it
// goes quiet — that quiet tail is what debounce waits for.
const BURST_START = X0 + 6
const BURST_END = X0 + SPAN * 0.66
const RAW_COUNT = 10
const rawTicks = Array.from(
  { length: RAW_COUNT },
  (_, i) => BURST_START + (i * (BURST_END - BURST_START)) / (RAW_COUNT - 1),
)

// Lane baselines (the line each lane's marks sit on).
const RAW_Y = 78
const DEB_Y = 150
const THR_Y = 222

// Debounce fires once, a quiet-gap after the last raw tick.
const DEBOUNCE_X = BURST_END + 58

// Throttle fires at a steady cadence across the whole burst window.
const throttleXs = [X0 + SPAN * 0.12, X0 + SPAN * 0.39, X0 + SPAN * 0.66]

export function DebounceThrottleDiagram() {
  return (
    <Canvas
      width={520}
      height={300}
      label="Debounce versus throttle: how each strategy filters a burst of rapid events on a shared timeline"
    >
      <style>{`
        @keyframes dt-fire {
          0%, 100% { opacity: 0.78; }
          50%      { opacity: 1; }
        }
        @keyframes dt-debounce {
          0%, 55%  { opacity: 0; transform: translateY(-3px); }
          70%, 92% { opacity: 1; transform: translateY(0); }
          100%     { opacity: 0; transform: translateY(-3px); }
        }
        .dt-throttle { animation: dt-fire 2.4s ease-in-out infinite; }
        .dt-debounce { animation: dt-debounce 3s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
      `}</style>

      <Defs />

      {/* ---- Lane 1: raw events ---- */}
      <Label x={X0} y={RAW_Y - 30} anchor="start" weight={650} color="var(--text)">
        Raw events
      </Label>
      <Label x={X1} y={RAW_Y - 30} anchor="end" size={10} color="var(--muted)">
        rapid-fire input
      </Label>
      {/* baseline */}
      <line x1={X0} y1={RAW_Y} x2={X1} y2={RAW_Y} stroke="var(--muted)" strokeWidth={1} opacity={0.45} />
      {/* the cluster of small ticks */}
      {rawTicks.map((x, i) => (
        <line
          key={i}
          x1={x}
          y1={RAW_Y - 13}
          x2={x}
          y2={RAW_Y}
          stroke="var(--muted)"
          strokeWidth={2}
          strokeLinecap="round"
        />
      ))}

      {/* ---- Lane 2: debounce (trailing) ---- */}
      <Label x={X0} y={DEB_Y - 30} anchor="start" weight={650} color="var(--text)">
        Debounce (trailing)
      </Label>
      <Label x={X1} y={DEB_Y - 30} anchor="end" size={10} color="var(--d-1)">
        fires once, after quiet period
      </Label>
      <line x1={X0} y1={DEB_Y} x2={X1} y2={DEB_Y} stroke="var(--muted)" strokeWidth={1} opacity={0.45} />

      {/* "wait" bracket spanning the quiet gap between last tick and the fire */}
      <g stroke="var(--muted)" strokeWidth={1.2} fill="none" opacity={0.8}>
        <path d={`M ${BURST_END} ${DEB_Y - 22} L ${BURST_END} ${DEB_Y - 27} L ${DEBOUNCE_X} ${DEB_Y - 27} L ${DEBOUNCE_X} ${DEB_Y - 22}`} />
      </g>
      <Label x={(BURST_END + DEBOUNCE_X) / 2} y={DEB_Y - 31} size={9.5} color="var(--muted)">
        wait
      </Label>

      {/* the single trailing fire: arrow down to baseline + filled dot */}
      <g className="dt-debounce">
        <Arrow x1={DEBOUNCE_X} y1={DEB_Y - 20} x2={DEBOUNCE_X} y2={DEB_Y} color="var(--d-1)" width={2} />
        <circle cx={DEBOUNCE_X} cy={DEB_Y} r={4.5} fill="var(--d-1)" />
      </g>

      {/* ---- Lane 3: throttle ---- */}
      <Label x={X0} y={THR_Y - 30} anchor="start" weight={650} color="var(--text)">
        Throttle
      </Label>
      <Label x={X1} y={THR_Y - 30} anchor="end" size={10} color="var(--d-3)">
        fires at most once per interval
      </Label>
      <line x1={X0} y1={THR_Y} x2={X1} y2={THR_Y} stroke="var(--muted)" strokeWidth={1} opacity={0.45} />

      {throttleXs.map((x, i) => (
        <g key={i} className="dt-throttle" style={{ animationDelay: `${i * 0.18}s` }}>
          <Arrow x1={x} y1={THR_Y - 20} x2={x} y2={THR_Y} color="var(--d-3)" width={2} />
          <circle cx={x} cy={THR_Y} r={4.5} fill="var(--d-3)" />
        </g>
      ))}
      {/* interval brackets between throttle fires */}
      {throttleXs.slice(0, -1).map((x, i) => {
        const next = throttleXs[i + 1]
        const mid = (x + next) / 2
        return (
          <Label key={i} x={mid} y={THR_Y + 16} size={9} color="var(--muted)">
            interval
          </Label>
        )
      })}

      {/* ---- shared time axis ---- */}
      <Arrow x1={X0} y1={266} x2={X1 + 6} y2={266} color="var(--muted)" width={1.4} />
      <Label x={X1 + 6} y={279} anchor="end" size={9.5} color="var(--muted)">
        time →
      </Label>

      {/* ---- caption row ---- */}
      <Label x={X0} y={294} anchor="start" size={10} color="var(--text-soft)">
        debounce = wait for silence
      </Label>
      <Label x={X1 + 6} y={294} anchor="end" size={10} color="var(--text-soft)">
        throttle = steady rate
      </Label>
    </Canvas>
  )
}
