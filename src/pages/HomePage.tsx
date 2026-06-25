import { Link } from 'react-router-dom'
import { ALL_TOPICS, FIRST_TOPIC, GROUPS } from '../content'
import { QUIZ } from '../content/quiz-data'

export default function HomePage() {
  return (
    <div className="py-2">
      {/* Hero */}
      <div
        className="rounded-2xl border p-7 sm:p-9"
        style={{
          borderColor: 'var(--border)',
          background:
            'linear-gradient(135deg, var(--accent-soft), var(--surface) 70%)',
          boxShadow: 'var(--shadow)',
        }}
      >
        <span
          className="inline-block rounded-full px-3 py-1 text-[0.72rem] font-bold uppercase tracking-wider"
          style={{ background: 'var(--surface)', color: 'var(--accent-text)' }}
        >
          Interactive reference
        </span>
        <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
          The Frontend Engineering Handbook
        </h1>
        <p className="mt-3 max-w-2xl text-[1.05rem]" style={{ color: 'var(--text-soft)' }}>
          A hands-on tour of the patterns and machinery behind modern web apps —
          React design patterns, the JavaScript internals that trip people up,
          how errors really happen and how to debug them, authentication flows,
          and the platform underneath it all. Every topic has{' '}
          <strong>real-world “when to use” guidance</strong>,{' '}
          <strong>syntax-highlighted code</strong>, and{' '}
          <strong>diagrams</strong> for the mechanism-heavy bits.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          {FIRST_TOPIC && (
            <Link
              to={`/topic/${FIRST_TOPIC.slug}`}
              className="rounded-xl px-5 py-2.5 font-semibold text-white transition-transform active:scale-95"
              style={{ background: 'var(--accent)' }}
            >
              Start reading →
            </Link>
          )}
          <Link
            to="/quiz"
            className="rounded-xl border px-5 py-2.5 font-semibold transition-colors"
            style={{ borderColor: 'var(--border-strong)', background: 'var(--surface)', color: 'var(--text)' }}
          >
            🧠 Take the quiz ({QUIZ.length} Qs)
          </Link>
        </div>
        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-1 text-sm" style={{ color: 'var(--muted)' }}>
          <span>📚 {GROUPS.length} pillars</span>
          <span>📄 {ALL_TOPICS.length} topics</span>
          <span>🖼️ 10 diagrams</span>
          <span>🧩 {QUIZ.length} quiz questions</span>
        </div>
      </div>

      {/* Pillar cards */}
      <h2 className="mb-3 mt-9 text-lg font-bold" style={{ color: 'var(--text)' }}>
        What’s inside
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {GROUPS.map((group) => {
          const first = group.topics[0]
          return (
            <Link
              key={group.id}
              to={first ? `/topic/${first.slug}` : '/'}
              className="group rounded-2xl border p-5 transition-all hover:-translate-y-0.5"
              style={{
                borderColor: 'var(--border)',
                background: 'var(--surface)',
                boxShadow: 'var(--shadow)',
              }}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">{group.icon}</span>
                <h3 className="text-[1.05rem] font-bold" style={{ color: 'var(--text)' }}>
                  {group.title}
                </h3>
                <span
                  className="ml-auto rounded-full px-2 py-0.5 text-[0.68rem] font-semibold"
                  style={{ background: 'var(--surface-2)', color: 'var(--muted)' }}
                >
                  {group.topics.length} topics
                </span>
              </div>
              <ul className="mt-3 space-y-1 text-[0.86rem]" style={{ color: 'var(--text-soft)' }}>
                {group.topics.slice(0, 4).map((t) => (
                  <li key={t.slug} className="truncate">
                    <span style={{ color: 'var(--accent-text)' }}>›</span> {t.title}
                  </li>
                ))}
                {group.topics.length > 4 && (
                  <li style={{ color: 'var(--muted)' }}>
                    + {group.topics.length - 4} more…
                  </li>
                )}
              </ul>
            </Link>
          )
        })}
      </div>

      <p className="mt-8 text-center text-sm" style={{ color: 'var(--muted)' }}>
        Tip: use the sidebar to jump anywhere · toggle 🌙/☀️ in the header · every
        code block has a <strong>Copy</strong> button.
      </p>
    </div>
  )
}
