# Frontend Engineering Handbook

An interactive docs app teaching the patterns and machinery behind modern web apps — with **real-world “when to use” guidance**, **syntax-highlighted code**, **diagrams**, and a **quiz**.

Built with **React 19 + Vite 8 + TypeScript + Tailwind 4**, code highlighting by **Shiki** (`react-shiki/core`), routing via `react-router` HashRouter (so it works under a GitHub Pages subpath).

## Content (6 pillars, 39 topics)

1. **React Patterns** — composition, compound components, slots, custom hooks, HOC, render props, container/presentational, provider, state reducer, controlled/uncontrolled, polymorphic `as`.
2. **React Deep-Dive** — re-renders & memoization, code-splitting/Suspense, virtualization, the full hooks roster (everyday / new React-19 / underused), and prop drilling vs Context vs Redux internals.
3. **JS Internals** — event propagation & delegation, debounce/throttle/polling, promises, async/await — with mechanism diagrams.
4. **Errors & Debugging** — error types, call-stack overflow, heap OOM, memory leaks, a debugging toolkit, and a Chrome DevTools panel-by-panel tour.
5. **Auth Flows** — sessions/cookies, JWT, OAuth2/OIDC + PKCE, refresh-token rotation, plus a **case study of a real production app's** auth flow.
6. **Platform & Tooling** — browser storage (cookies/localStorage/sessionStorage/IndexedDB), the build cycle, build tools (Babel/webpack/esbuild/Vite/Turbopack), monorepos (Nx vs Turborepo), a TypeScript primer, and how code depends on the OS.

Plus a **scenario-based quiz** (27 questions across all pillars) with instant feedback, explanations, score, and a best-score saved to `localStorage`.

## Develop

```bash
npm install
npm run dev        # start the dev server
npm run build      # typecheck (tsc -b) + production build to dist/
npm run preview    # preview the production build
npm run lint       # eslint
```

> Note: `vite preview` (v8) can 404 module scripts that carry a `Sec-Fetch-Dest: script`
> header. Use `npm run dev` locally; the production build serves correctly on
> static hosts (GitHub Pages, any CDN). To smoke-test the build like GitHub Pages:
> `mkdir -p /tmp/gh/frontend-docs && cp -r dist/* /tmp/gh/frontend-docs/ && (cd /tmp/gh && python3 -m http.server 8100)`
> then open `http://localhost:8100/frontend-docs/`.

## Deploy (GitHub Pages)

`vite.config.ts` sets `base` to `/frontend-docs/` for builds. Deploy the `dist/`
folder to the `gh-pages` branch:

```bash
npm run deploy     # builds, then publishes dist/ via gh-pages
```

A `.nojekyll` file is included so GitHub Pages serves the `assets/` folder as-is.

## Architecture notes

- **Content as data**: each pillar is a typed module in `src/content/` exporting a `TopicGroup`. A topic is an ordered list of typed *blocks* (`prose | heading | code | callout | table | diagram`). `TopicPage` renders blocks generically and computes Prev/Next from the flat topic order — adding a topic means editing one data file.
- **Diagrams** are hand-authored inline-SVG React components in `src/components/diagrams/`, theme-aware via CSS variables (no binary assets).
- **Shiki** runs as a single shared `createHighlighterCore` singleton (`src/lib/highlighter.ts`) with only the languages/themes we use, so each grammar is a small lazy-loaded chunk and there's no full-Shiki blob.
