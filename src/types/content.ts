import type { ComponentType, ReactNode } from 'react'

/** A code language we know how to highlight (must be preloaded in lib/highlighter). */
export type CodeLang = 'tsx' | 'ts' | 'jsx' | 'js' | 'bash' | 'json' | 'html' | 'css'

export type CalloutKind = 'tip' | 'warn' | 'danger' | 'info' | 'key'

/** ----- Block types: a topic body is an ordered list of these. ----- */

export interface ProseBlock {
  kind: 'prose'
  /** Rendered as the inner of a .prose-body container. Supports inline JSX. */
  body: ReactNode
}

export interface HeadingBlock {
  kind: 'heading'
  text: string
  /** Optional id for in-page anchoring. */
  id?: string
}

export interface CodeBlockData {
  kind: 'code'
  code: string
  lang?: CodeLang
  /** Shown as a little filename/label tab above the block. */
  filename?: string
  /** Optional one-line caption under the block. */
  caption?: string
}

export interface CalloutBlock {
  kind: 'callout'
  variant: CalloutKind
  title?: string
  body: ReactNode
}

export interface DiagramBlock {
  kind: 'diagram'
  /** A diagram component from components/diagrams. Rendered in a framed figure. */
  render: ComponentType
  title?: string
  caption?: string
}

export interface TableBlock {
  kind: 'table'
  headers: string[]
  rows: ReactNode[][]
  caption?: string
}

export type Block =
  | ProseBlock
  | HeadingBlock
  | CodeBlockData
  | CalloutBlock
  | DiagramBlock
  | TableBlock

/** ----- Topic + grouping ----- */

export interface Topic {
  /** URL slug, unique across the whole app. */
  slug: string
  title: string
  /** One-line summary shown in the sidebar tooltip / topic header. */
  summary: string
  blocks: Block[]
}

export interface TopicGroup {
  /** Pillar id, e.g. "react-patterns". */
  id: string
  title: string
  /** Short label for the sidebar section header. */
  label: string
  /** Emoji/icon char shown next to the group. */
  icon: string
  topics: Topic[]
}

/** ----- Quiz ----- */

export interface QuizQuestion {
  id: string
  /** Which pillar this question belongs to (for the little tag). */
  pillar: string
  prompt: ReactNode
  options: string[]
  /** Index into options. */
  answer: number
  /** Shown after answering. */
  explanation: ReactNode
}
