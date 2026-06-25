import type { ReactNode } from 'react'
import type { CalloutKind } from '../types/content'

const STYLES: Record<
  CalloutKind,
  { fg: string; bg: string; icon: string; label: string }
> = {
  tip: { fg: 'var(--tip)', bg: 'var(--tip-bg)', icon: '✅', label: 'When to use' },
  warn: { fg: 'var(--warn)', bg: 'var(--warn-bg)', icon: '⚠️', label: 'Pitfall' },
  danger: { fg: 'var(--danger)', bg: 'var(--danger-bg)', icon: '🛑', label: 'Gotcha' },
  info: { fg: 'var(--info)', bg: 'var(--info-bg)', icon: 'ℹ️', label: 'Note' },
  key: { fg: 'var(--d-2)', bg: 'var(--accent-soft)', icon: '🔑', label: 'Key idea' },
}

export function Callout({
  variant,
  title,
  children,
}: {
  variant: CalloutKind
  title?: string
  children: ReactNode
}) {
  const s = STYLES[variant]
  return (
    <div
      className="my-4 rounded-xl border-l-4 px-4 py-3"
      style={{
        background: s.bg,
        borderColor: s.fg,
      }}
    >
      <div
        className="mb-1 flex items-center gap-1.5 text-[0.8rem] font-bold"
        style={{ color: s.fg }}
      >
        <span aria-hidden>{s.icon}</span>
        <span>{title ?? s.label}</span>
      </div>
      <div className="prose-body !text-[0.9rem]" style={{ color: 'var(--text-soft)' }}>
        {children}
      </div>
    </div>
  )
}
