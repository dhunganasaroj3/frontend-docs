import { Link, useParams } from 'react-router-dom'
import { findTopic } from '../content'
import type { Block } from '../types/content'
import { CodeBlock } from './CodeBlock'
import { Callout } from './Callout'

function BlockView({ block }: { block: Block }) {
  switch (block.kind) {
    case 'prose':
      return <div className="prose-body my-3">{block.body}</div>

    case 'heading':
      return (
        <h2
          id={block.id}
          className="mt-9 mb-2 scroll-mt-20 text-[1.3rem] font-bold tracking-tight"
          style={{ color: 'var(--text)' }}
        >
          {block.text}
        </h2>
      )

    case 'code':
      return (
        <CodeBlock
          code={block.code}
          lang={block.lang}
          filename={block.filename}
          caption={block.caption}
        />
      )

    case 'callout':
      return (
        <Callout variant={block.variant} title={block.title}>
          {block.body}
        </Callout>
      )

    case 'diagram': {
      const D = block.render
      return (
        <figure className="my-6">
          {block.title && (
            <figcaption
              className="mb-2 text-center text-[0.82rem] font-semibold"
              style={{ color: 'var(--text-soft)' }}
            >
              {block.title}
            </figcaption>
          )}
          <div
            className="overflow-x-auto rounded-xl border p-4"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border)',
              boxShadow: 'var(--shadow)',
            }}
          >
            <D />
          </div>
          {block.caption && (
            <figcaption
              className="mt-2 text-center text-[0.78rem]"
              style={{ color: 'var(--muted)' }}
            >
              {block.caption}
            </figcaption>
          )}
        </figure>
      )
    }

    case 'table':
      return (
        <figure className="my-5 overflow-x-auto">
          <table className="w-full border-collapse text-[0.85rem]">
            <thead>
              <tr>
                {block.headers.map((h, i) => (
                  <th
                    key={i}
                    className="border-b-2 px-3 py-2 text-left font-semibold"
                    style={{ borderColor: 'var(--border-strong)', color: 'var(--text)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className="border-b px-3 py-2 align-top"
                      style={{ borderColor: 'var(--border)', color: 'var(--text-soft)' }}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {block.caption && (
            <figcaption className="mt-1.5 text-[0.78rem]" style={{ color: 'var(--muted)' }}>
              {block.caption}
            </figcaption>
          )}
        </figure>
      )
  }
}

export function TopicPage() {
  const { slug } = useParams()
  const loc = findTopic(slug)

  if (!loc) {
    return (
      <div className="py-10 text-center">
        <p className="text-lg font-semibold">Topic not found</p>
        <Link
          to="/"
          className="mt-3 inline-block text-sm underline"
          style={{ color: 'var(--accent-text)' }}
        >
          ← Back to overview
        </Link>
      </div>
    )
  }

  const { topic, group, prev, next } = loc

  return (
    <article>
      <div
        className="mb-1 text-[0.72rem] font-bold uppercase tracking-wider"
        style={{ color: 'var(--muted)' }}
      >
        {group.icon} {group.label}
      </div>
      <h1 className="text-[1.9rem] font-extrabold leading-tight tracking-tight">
        {topic.title}
      </h1>
      <p className="mt-2 text-[1.02rem]" style={{ color: 'var(--text-soft)' }}>
        {topic.summary}
      </p>
      <hr className="my-5" style={{ borderColor: 'var(--border)' }} />

      {topic.blocks.map((block, i) => (
        <BlockView key={i} block={block} />
      ))}

      {/* Prev / Next */}
      <nav
        className="mt-12 grid gap-3 border-t pt-6 sm:grid-cols-2"
        style={{ borderColor: 'var(--border)' }}
      >
        {prev ? (
          <Link
            to={`/topic/${prev.slug}`}
            className="rounded-xl border px-4 py-3 transition-colors"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
          >
            <div className="text-[0.72rem]" style={{ color: 'var(--muted)' }}>
              ← Previous
            </div>
            <div className="font-semibold" style={{ color: 'var(--accent-text)' }}>
              {prev.title}
            </div>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            to={`/topic/${next.slug}`}
            className="rounded-xl border px-4 py-3 text-right transition-colors"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
          >
            <div className="text-[0.72rem]" style={{ color: 'var(--muted)' }}>
              Next →
            </div>
            <div className="font-semibold" style={{ color: 'var(--accent-text)' }}>
              {next.title}
            </div>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  )
}
