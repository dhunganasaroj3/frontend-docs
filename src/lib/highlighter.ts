import { createHighlighterCore } from 'react-shiki/core'
import { createJavaScriptRegexEngine } from 'react-shiki/core'
import type { HighlighterCore } from 'shiki/core'

/**
 * One shared Shiki highlighter for the whole app, built from the *core* bundle
 * with only the languages + themes we actually use. This keeps the shipped
 * bundle small (no full-Shiki 1.2MB blob) and uses the JS regex engine, so
 * there's no Oniguruma WASM to download.
 *
 * We load both themes and let CodeBlock emit dual-theme CSS variables; the app
 * theme then re-colors code instantly via globals.css (no re-highlight).
 */

export const LIGHT_THEME = 'github-light'
export const DARK_THEME = 'github-dark'

let singleton: Promise<HighlighterCore> | null = null

export function getHighlighter(): Promise<HighlighterCore> {
  if (!singleton) {
    singleton = createHighlighterCore({
      themes: [
        import('@shikijs/themes/github-light'),
        import('@shikijs/themes/github-dark'),
      ],
      langs: [
        import('@shikijs/langs/tsx'),
        import('@shikijs/langs/typescript'),
        import('@shikijs/langs/jsx'),
        import('@shikijs/langs/javascript'),
        import('@shikijs/langs/bash'),
        import('@shikijs/langs/json'),
        import('@shikijs/langs/html'),
        import('@shikijs/langs/css'),
      ],
      engine: createJavaScriptRegexEngine(),
    })
  }
  return singleton
}
