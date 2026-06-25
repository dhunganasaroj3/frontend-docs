import { useMemo, useState } from 'react'
import { QUIZ } from '../content/quiz-data'
import { useLocalStorage } from '../lib/useLocalStorage'
import type { QuizQuestion } from '../types/content'

/** Deterministic-free shuffle. We only shuffle on explicit user action
 *  (mount / retry), never during render, so React purity is preserved. */
function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    // Math.random is fine here — this runs in an event handler / lazy init,
    // not during render.
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

type Phase = 'playing' | 'done'

export default function QuizPage() {
  const [deck, setDeck] = useState<QuizQuestion[]>(() => shuffle(QUIZ))
  const [current, setCurrent] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [phase, setPhase] = useState<Phase>('playing')
  const [best, setBest] = useLocalStorage<number>('fd.quiz.best', 0)

  const total = deck.length
  const q = deck[current]
  const answered = picked !== null
  const isCorrect = answered && picked === q.answer

  const progressPct = useMemo(
    () => Math.round((current / total) * 100),
    [current, total],
  )

  function choose(i: number) {
    if (answered) return
    setPicked(i)
    if (i === q.answer) setScore((s) => s + 1)
  }

  function next() {
    if (current + 1 >= total) {
      setBest((b) => Math.max(b, score))
      setPhase('done')
    } else {
      setCurrent((c) => c + 1)
      setPicked(null)
    }
  }

  function restart() {
    setDeck(shuffle(QUIZ))
    setCurrent(0)
    setPicked(null)
    setScore(0)
    setPhase('playing')
  }

  // ---------------- Results screen ----------------
  if (phase === 'done') {
    const pct = Math.round((score / total) * 100)
    const grade =
      pct >= 90 ? 'Outstanding 🏆' : pct >= 70 ? 'Solid 💪' : pct >= 50 ? 'Getting there 📈' : 'Keep studying 📚'
    return (
      <div className="py-6">
        <h1 className="text-2xl font-extrabold">Quiz complete</h1>
        <div
          className="mt-6 rounded-2xl border p-8 text-center"
          style={{ borderColor: 'var(--border)', background: 'var(--surface)', boxShadow: 'var(--shadow)' }}
        >
          <div className="text-5xl font-extrabold" style={{ color: 'var(--accent-text)' }}>
            {score}/{total}
          </div>
          <div className="mt-1 text-lg font-semibold">{pct}% · {grade}</div>
          <div className="mt-3 text-sm" style={{ color: 'var(--muted)' }}>
            Best score: <strong style={{ color: 'var(--text-soft)' }}>{Math.max(best, score)}/{total}</strong>
            {score >= best && score > 0 && (
              <span style={{ color: 'var(--tip)' }}> · new best! 🎉</span>
            )}
          </div>
          <button
            type="button"
            onClick={restart}
            className="mt-6 rounded-xl px-5 py-2.5 font-semibold text-white transition-transform active:scale-95"
            style={{ background: 'var(--accent)' }}
          >
            Try again (reshuffled)
          </button>
        </div>
      </div>
    )
  }

  // ---------------- Question screen ----------------
  return (
    <div className="py-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Quiz</h1>
        <div className="text-sm" style={{ color: 'var(--muted)' }}>
          Score <strong style={{ color: 'var(--text-soft)' }}>{score}</strong> · Best{' '}
          <strong style={{ color: 'var(--text-soft)' }}>{best}/{total}</strong>
        </div>
      </div>

      {/* progress */}
      <div className="mb-1 flex items-center justify-between text-xs" style={{ color: 'var(--muted)' }}>
        <span>
          Question {current + 1} of {total}
        </span>
        <span
          className="rounded-full px-2 py-0.5 text-[0.68rem] font-semibold"
          style={{ background: 'var(--accent-soft)', color: 'var(--accent-text)' }}
        >
          {q.pillar}
        </span>
      </div>
      <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full" style={{ background: 'var(--surface-2)' }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${progressPct}%`, background: 'var(--accent)' }}
        />
      </div>

      {/* prompt */}
      <div
        className="rounded-2xl border p-5"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)', boxShadow: 'var(--shadow)' }}
      >
        <p className="mb-4 whitespace-pre-line text-[1.05rem] font-semibold leading-snug">
          {q.prompt}
        </p>

        <div className="grid gap-2.5">
          {q.options.map((opt, i) => {
            const chosen = picked === i
            const correct = q.answer === i
            // color logic after answering
            let border = 'var(--border)'
            let bg = 'var(--surface-2)'
            let mark = ''
            if (answered) {
              if (correct) {
                border = 'var(--tip)'
                bg = 'var(--tip-bg)'
                mark = '✓'
              } else if (chosen) {
                border = 'var(--danger)'
                bg = 'var(--danger-bg)'
                mark = '✗'
              }
            }
            return (
              <button
                key={i}
                type="button"
                disabled={answered}
                onClick={() => choose(i)}
                className="flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-[0.95rem] transition-colors disabled:cursor-default"
                style={{ borderColor: border, background: bg, color: 'var(--text)' }}
              >
                <span
                  className="grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs font-bold"
                  style={{ borderColor: 'var(--border-strong)', color: 'var(--text-soft)' }}
                >
                  {mark || String.fromCharCode(65 + i)}
                </span>
                <span>{opt}</span>
              </button>
            )
          })}
        </div>

        {/* explanation */}
        {answered && (
          <div
            className="mt-4 rounded-xl border-l-4 px-4 py-3 text-[0.9rem]"
            style={{
              borderColor: isCorrect ? 'var(--tip)' : 'var(--danger)',
              background: isCorrect ? 'var(--tip-bg)' : 'var(--danger-bg)',
              color: 'var(--text-soft)',
            }}
          >
            <div className="mb-1 font-bold" style={{ color: isCorrect ? 'var(--tip)' : 'var(--danger)' }}>
              {isCorrect ? 'Correct!' : 'Not quite.'}
            </div>
            {q.explanation}
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            disabled={!answered}
            onClick={next}
            className="rounded-xl px-5 py-2.5 font-semibold text-white transition-transform active:scale-95 disabled:opacity-40"
            style={{ background: 'var(--accent)' }}
          >
            {current + 1 >= total ? 'See results' : 'Next question →'}
          </button>
        </div>
      </div>
    </div>
  )
}
