import { useEffect, useState } from 'react'
import { useShikiHighlighter } from 'react-shiki/core'
import type { HighlighterCore } from 'shiki/core'
import { DARK_THEME, getHighlighter, LIGHT_THEME } from '../lib/highlighter'
import type { CodeLang } from '../types/content'

interface CodeBlockProps {
  code: string
  lang?: CodeLang
  filename?: string
  caption?: string
}

// map our friendly lang ids to the grammar ids we registered in highlighter.ts
const LANG_ALIAS: Record<CodeLang, string> = {
  tsx: 'tsx',
  ts: 'typescript',
  jsx: 'jsx',
  js: 'javascript',
  bash: 'bash',
  json: 'json',
  html: 'html',
  css: 'css',
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), 1500)
    return () => clearTimeout(t)
  }, [copied])

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(code)
          setCopied(true)
        } catch {
          /* clipboard blocked — no-op */
        }
      }}
      className="rounded-md border px-2 py-1 text-[0.72rem] font-medium transition-colors"
      style={{
        borderColor: 'var(--border)',
        background: 'var(--surface)',
        color: copied ? 'var(--tip)' : 'var(--text-soft)',
      }}
      aria-label="Copy code"
    >
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  )
}

/**
 * Renders the highlighted code. IMPORTANT: this is only mounted once a real
 * highlighter instance exists — react-shiki/core throws synchronously if you
 * call useShikiHighlighter without one, so we must never render this with a
 * missing highlighter.
 */
function ShikiCode({
  code,
  lang,
  highlighter,
}: {
  code: string
  lang: CodeLang
  highlighter: HighlighterCore
}) {
  const highlighted = useShikiHighlighter(
    code,
    LANG_ALIAS[lang],
    { light: LIGHT_THEME, dark: DARK_THEME },
    { highlighter, defaultColor: false, cssVariablePrefix: '--shiki-' },
  )
  return <>{highlighted ?? <PlainCode code={code} />}</>
}

/** Unhighlighted fallback shown until the highlighter loads (or if it fails). */
function PlainCode({ code }: { code: string }) {
  return (
    <pre className="m-0 p-4">
      <code style={{ color: 'var(--text-soft)' }}>{code}</code>
    </pre>
  )
}

export function CodeBlock({ code, lang = 'tsx', filename, caption }: CodeBlockProps) {
  const [highlighter, setHighlighter] = useState<HighlighterCore | null>(null)

  useEffect(() => {
    let alive = true
    getHighlighter()
      .then((h) => {
        if (alive) setHighlighter(h)
      })
      .catch(() => {
        /* keep the plain fallback if Shiki fails to load */
      })
    return () => {
      alive = false
    }
  }, [])

  return (
    <figure className="my-5">
      <div
        className="overflow-hidden rounded-xl border"
        style={{ borderColor: 'var(--border)', boxShadow: 'var(--shadow)' }}
      >
        {/* top bar: filename + lang + copy */}
        <div
          className="flex items-center gap-2 border-b px-3 py-1.5"
          style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}
        >
          <span className="flex gap-1.5" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#ef4444' }} />
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#eab308' }} />
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#22c55e' }} />
          </span>
          {filename && (
            <span
              className="ml-1 font-mono text-[0.74rem]"
              style={{ color: 'var(--text-soft)' }}
            >
              {filename}
            </span>
          )}
          <span
            className="ml-auto font-mono text-[0.66rem] uppercase tracking-wide"
            style={{ color: 'var(--muted)' }}
          >
            {lang}
          </span>
          <CopyButton code={code} />
        </div>

        {/* the highlighted code (real React nodes from Shiki), or a plain
            fallback until the highlighter singleton has loaded */}
        <div className="code-scroll overflow-x-auto text-[0.82rem] leading-relaxed [&_pre]:m-0 [&_pre]:!bg-transparent [&_pre]:p-4">
          {highlighter ? (
            <ShikiCode code={code} lang={lang} highlighter={highlighter} />
          ) : (
            <PlainCode code={code} />
          )}
        </div>
      </div>
      {caption && (
        <figcaption
          className="mt-1.5 px-1 text-[0.78rem]"
          style={{ color: 'var(--muted)' }}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
