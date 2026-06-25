import { NavLink } from 'react-router-dom'
import { GROUPS } from '../content'

interface SidebarProps {
  /** Mobile drawer open state (ignored on desktop where it's always visible). */
  open: boolean
  onNavigate: () => void
}

const linkBase =
  'block rounded-lg px-3 py-1.5 text-[0.86rem] leading-snug transition-colors'

export function Sidebar({ open, onNavigate }: SidebarProps) {
  return (
    <>
      {/* backdrop for the mobile drawer */}
      <div
        onClick={onNavigate}
        className={`fixed inset-0 z-30 bg-black/40 backdrop-blur-[1px] transition-opacity lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-[var(--sidebar-w)] overflow-y-auto border-r px-3 pb-10 pt-3 transition-transform lg:sticky lg:top-[var(--header-h)] lg:z-0 lg:h-[calc(100dvh-var(--header-h))] lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: 'var(--bg-soft)',
          borderColor: 'var(--border)',
        }}
      >
        <NavLink
          to="/"
          end
          onClick={onNavigate}
          className={({ isActive }) =>
            `${linkBase} mb-2 font-semibold ${isActive ? 'shadow-sm' : ''}`
          }
          style={({ isActive }) => ({
            color: isActive ? 'var(--accent-text)' : 'var(--text)',
            background: isActive ? 'var(--accent-soft)' : 'transparent',
          })}
        >
          🏠 Overview
        </NavLink>

        {GROUPS.map((group) => (
          <div key={group.id} className="mb-4">
            <div
              className="px-3 pb-1 pt-3 text-[0.68rem] font-bold uppercase tracking-wider"
              style={{ color: 'var(--muted)' }}
            >
              <span className="mr-1.5">{group.icon}</span>
              {group.label}
            </div>
            {group.topics.length === 0 ? (
              <div
                className="px-3 py-1 text-[0.8rem] italic"
                style={{ color: 'var(--muted)' }}
              >
                coming soon
              </div>
            ) : (
              group.topics.map((topic) => (
                <NavLink
                  key={topic.slug}
                  to={`/topic/${topic.slug}`}
                  onClick={onNavigate}
                  title={topic.summary}
                  className={({ isActive }) =>
                    `${linkBase} ${isActive ? 'font-medium' : ''}`
                  }
                  style={({ isActive }) => ({
                    color: isActive ? 'var(--accent-text)' : 'var(--text-soft)',
                    background: isActive ? 'var(--accent-soft)' : 'transparent',
                  })}
                >
                  {topic.title}
                </NavLink>
              ))
            )}
          </div>
        ))}

        <div
          className="my-3 border-t"
          style={{ borderColor: 'var(--border)' }}
        />
        <NavLink
          to="/quiz"
          onClick={onNavigate}
          className={({ isActive }) =>
            `${linkBase} font-semibold ${isActive ? 'shadow-sm' : ''}`
          }
          style={({ isActive }) => ({
            color: isActive ? 'var(--accent-text)' : 'var(--text)',
            background: isActive ? 'var(--accent-soft)' : 'transparent',
          })}
        >
          🧠 Quiz
        </NavLink>
      </aside>
    </>
  )
}
