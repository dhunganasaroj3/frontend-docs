import { useState } from 'react'
import { Link, Navigate, Route, Routes } from 'react-router-dom'
import { Sidebar } from './components/Sidebar'
import { ThemeToggle } from './components/ThemeToggle'
import { ScrollToTop } from './components/ScrollToTop'
import { TopicPage } from './components/TopicPage'
import HomePage from './pages/HomePage'
import QuizPage from './pages/QuizPage'

export default function App() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="min-h-dvh">
      {/* ---------- Header ---------- */}
      <header
        className="sticky top-0 z-50 flex h-[var(--header-h)] items-center gap-3 border-b px-4 backdrop-blur"
        style={{
          background: 'color-mix(in srgb, var(--bg) 86%, transparent)',
          borderColor: 'var(--border)',
        }}
      >
        <button
          type="button"
          onClick={() => setDrawerOpen((o) => !o)}
          aria-label="Toggle navigation"
          className="grid h-9 w-9 place-items-center rounded-lg border text-lg lg:hidden"
          style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
        >
          ☰
        </button>

        <Link to="/" className="flex items-center gap-2 font-bold">
          <span
            className="grid h-7 w-7 place-items-center rounded-md font-mono text-sm"
            style={{ background: 'var(--accent-soft)', color: 'var(--accent-text)' }}
          >
            {'{}'}
          </span>
          <span className="hidden sm:inline" style={{ color: 'var(--text)' }}>
            Frontend Handbook
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-2">
          <a
            href="https://github.com/shikijs/shiki"
            target="_blank"
            rel="noreferrer"
            className="hidden text-sm sm:inline"
            style={{ color: 'var(--muted)' }}
          >
            built with Shiki
          </a>
          <ThemeToggle />
        </div>
      </header>

      {/* ---------- Body: sidebar + content ---------- */}
      <div className="mx-auto flex max-w-[1400px]">
        <Sidebar open={drawerOpen} onNavigate={() => setDrawerOpen(false)} />

        <main
          id="main-scroll"
          className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-12"
        >
          <ScrollToTop target="#main-scroll" />
          <div className="mx-auto max-w-3xl">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/topic/:slug" element={<TopicPage />} />
              <Route path="/quiz" element={<QuizPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  )
}
