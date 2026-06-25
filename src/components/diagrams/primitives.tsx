import type { ReactNode } from 'react'

/**
 * Shared building blocks for the inline-SVG diagrams. Everything is theme-aware:
 * colors come from CSS vars (var(--d-1) … var(--d-5), --surface, --text, etc.)
 * so the diagrams invert correctly in dark mode with no JS.
 *
 * Diagrams are authored at a "top-level" altitude — clear boxes, labels and
 * arrows that explain the shape of a mechanism, not every detail.
 */

export const FONT =
  'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif'
export const MONO = 'ui-monospace, SF Mono, JetBrains Mono, Menlo, monospace'

/** A responsive SVG canvas with a sensible viewBox. */
export function Canvas({
  width,
  height,
  children,
  label,
}: {
  width: number
  height: number
  children: ReactNode
  label: string
}) {
  return (
    <svg
      role="img"
      aria-label={label}
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      style={{ maxWidth: width, display: 'block', margin: '0 auto', height: 'auto' }}
      fontFamily={FONT}
    >
      {children}
    </svg>
  )
}

interface BoxProps {
  x: number
  y: number
  w: number
  h: number
  title?: string
  subtitle?: string
  color?: string
  fill?: string
  dashed?: boolean
  radius?: number
  titleSize?: number
  mono?: boolean
  children?: ReactNode
}

/** A rounded labelled rectangle. */
export function Box({
  x,
  y,
  w,
  h,
  title,
  subtitle,
  color = 'var(--d-1)',
  fill = 'var(--surface-2)',
  dashed = false,
  radius = 10,
  titleSize = 13,
  mono = false,
  children,
}: BoxProps) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={radius}
        fill={fill}
        stroke={color}
        strokeWidth={1.6}
        strokeDasharray={dashed ? '5 4' : undefined}
      />
      {title && (
        <text
          x={x + w / 2}
          y={subtitle ? y + h / 2 - 6 : y + h / 2 + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={titleSize}
          fontWeight={650}
          fontFamily={mono ? MONO : FONT}
          fill="var(--text)"
        >
          {title}
        </text>
      )}
      {subtitle && (
        <text
          x={x + w / 2}
          y={y + h / 2 + 11}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={10.5}
          fill="var(--muted)"
        >
          {subtitle}
        </text>
      )}
      {children}
    </g>
  )
}

export function Label({
  x,
  y,
  children,
  color = 'var(--text-soft)',
  size = 11,
  anchor = 'middle',
  weight = 500,
  mono = false,
}: {
  x: number
  y: number
  children: ReactNode
  color?: string
  size?: number
  anchor?: 'start' | 'middle' | 'end'
  weight?: number
  mono?: boolean
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fontSize={size}
      fontWeight={weight}
      fontFamily={mono ? MONO : FONT}
      fill={color}
    >
      {children}
    </text>
  )
}

/** Arrowhead marker defs — include once per SVG via <Defs/>. */
export function Defs() {
  return (
    <defs>
      {['var(--d-1)', 'var(--d-2)', 'var(--d-3)', 'var(--d-4)', 'var(--d-5)', 'var(--muted)'].map(
        (c, i) => (
          <marker
            key={i}
            id={`arrow-${i}`}
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={c} />
          </marker>
        ),
      )}
    </defs>
  )
}

const ARROW_INDEX: Record<string, number> = {
  'var(--d-1)': 0,
  'var(--d-2)': 1,
  'var(--d-3)': 2,
  'var(--d-4)': 3,
  'var(--d-5)': 4,
  'var(--muted)': 5,
}

/** A straight arrow between two points. */
export function Arrow({
  x1,
  y1,
  x2,
  y2,
  color = 'var(--muted)',
  width = 1.6,
  dashed = false,
}: {
  x1: number
  y1: number
  x2: number
  y2: number
  color?: string
  width?: number
  dashed?: boolean
}) {
  const idx = ARROW_INDEX[color] ?? 5
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={color}
      strokeWidth={width}
      strokeDasharray={dashed ? '5 4' : undefined}
      markerEnd={`url(#arrow-${idx})`}
    />
  )
}

/** A small pill/tag. */
export function Pill({
  x,
  y,
  w,
  text,
  color = 'var(--d-1)',
}: {
  x: number
  y: number
  w: number
  text: string
  color?: string
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={20} rx={10} fill={color} opacity={0.15} />
      <text
        x={x + w / 2}
        y={y + 14}
        textAnchor="middle"
        fontSize={11}
        fontWeight={600}
        fill={color}
      >
        {text}
      </text>
    </g>
  )
}
