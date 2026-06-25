import type { TopicGroup } from '../types/content'
import { BuildCycleDiagram, CodeToOsDiagram } from '../components/diagrams'

// Authored in task #4 — "Platform & Tooling" pillar.
// The runtime/build substrate under a frontend app: where state lives in the
// browser, how source becomes shipped code, the tools that do it, monorepo
// orchestration, a practical TypeScript primer, and how it all bottoms out in
// the operating system.
export const platform: TopicGroup = {
  id: 'platform',
  title: 'Platform & Tooling',
  label: 'Platform & Tooling',
  icon: '🖥️',
  topics: [
    // ──────────────────────────── BROWSER STORAGE ────────────────────────────
    {
      slug: 'browser-storage',
      title: 'Browser storage: cookies, localStorage, sessionStorage, IndexedDB',
      summary:
        'The four client-side stores compared: size, lifetime, scope, sync/async, and whether they hit the server.',
      blocks: [
        {
          kind: 'prose',
          body: (
            <>
              The browser gives you four very different places to keep data on
              the client, and picking the wrong one is a classic source of bugs
              (and security holes). They differ on five axes that actually
              matter: <strong>how much</strong> they hold,{' '}
              <strong>how long</strong> the data survives,{' '}
              <strong>who can see it</strong> (which tabs / origins),{' '}
              <strong>sync vs async</strong> access, and — crucially —{' '}
              <strong>whether the data is sent to your server on every
              request</strong>. Get those straight and the right choice is
              usually obvious.
            </>
          ),
        },
        {
          kind: 'heading',
          text: 'Cookies',
          id: 'storage-cookies',
        },
        {
          kind: 'prose',
          body: (
            <>
              A cookie is a tiny key/value pair the browser <em>attaches to
              every HTTP request</em> to the matching domain. That's their
              defining trait: they round-trip to the server automatically, which
              is exactly why they're used for <strong>session ids and
              auth</strong>. They're also tiny — about{' '}
              <strong>4&nbsp;KB each</strong>, with a per-domain count cap
              (roughly <strong>50</strong> in most browsers), so the total
              budget is a few hundred KB at most. Because they ride along on
              every request, bloated cookies are pure overhead on{' '}
              <em>each</em> page load, image, and API call.
            </>
          ),
        },
        {
          kind: 'prose',
          body: (
            <>
              The important security knob is <code>HttpOnly</code>: a cookie set
              with it is <strong>invisible to JavaScript</strong> (no{' '}
              <code>document.cookie</code> access), which is how you keep a
              session token out of reach of XSS. Pair it with{' '}
              <code>Secure</code> (HTTPS only) and <code>SameSite</code> (CSRF
              defense). Note that <code>HttpOnly</code> cookies are set by the{' '}
              <em>server</em> via the <code>Set-Cookie</code> response header —
              client JS can't create one.
            </>
          ),
        },
        {
          kind: 'heading',
          text: 'localStorage',
          id: 'storage-localstorage',
        },
        {
          kind: 'prose',
          body: (
            <>
              <code>localStorage</code> is a simple <strong>string-to-string</strong>{' '}
              map scoped to an <strong>origin</strong> (scheme + host + port),
              shared across all tabs of that origin, that{' '}
              <strong>persists until explicitly cleared</strong> — it survives
              reloads, tab closes, and reboots. Budget is roughly{' '}
              <strong>5–10&nbsp;MB per origin</strong> (browser-dependent). The
              API is <strong>synchronous</strong> and stores strings only, so
              you <code>JSON.stringify</code> on the way in and{' '}
              <code>JSON.parse</code> on the way out. It is{' '}
              <strong>never sent to the server</strong> — it's purely a
              client-side cache.
            </>
          ),
        },
        {
          kind: 'code',
          filename: 'localStorage.ts',
          lang: 'ts',
          caption: 'String-only store: serialize on write, parse (defensively) on read.',
          code: `// Write — objects must be serialized to a string first.
localStorage.setItem('theme', 'dark')
localStorage.setItem('prefs', JSON.stringify({ density: 'compact', lang: 'en' }))

// Read — always a string | null; parse + guard against bad/missing data.
const theme = localStorage.getItem('theme') ?? 'light'

function readPrefs() {
  try {
    const raw = localStorage.getItem('prefs')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null // corrupt JSON — don't let it crash the app
  }
}

localStorage.removeItem('prefs')
// localStorage.clear() // nukes everything for this origin`,
        },
        {
          kind: 'heading',
          text: 'sessionStorage',
          id: 'storage-sessionstorage',
        },
        {
          kind: 'prose',
          body: (
            <>
              <code>sessionStorage</code> has the <strong>identical API and
              size budget</strong> as <code>localStorage</code>, but a much
              tighter scope: it's <strong>per-tab</strong> and is{' '}
              <strong>wiped when that tab closes</strong>. Open the same site in
              two tabs and they get <em>separate</em>{' '}
              <code>sessionStorage</code> buckets — that's the whole point. Reach
              for it for short-lived, tab-local state: a multi-step form's
              in-progress values, a "where was I" scroll position, a one-time
              redirect target after login.
            </>
          ),
        },
        {
          kind: 'heading',
          text: 'IndexedDB',
          id: 'storage-indexeddb',
        },
        {
          kind: 'prose',
          body: (
            <>
              <code>IndexedDB</code> is the heavy lifter: a real{' '}
              <strong>transactional object database</strong> in the browser. It
              stores <strong>structured values</strong> (objects, arrays,{' '}
              <code>Blob</code>s, <code>ArrayBuffer</code>s — not just strings)
              in object stores with <strong>indexes</strong> you can query, and
              it's <strong>quota-based</strong> — typically hundreds of MB up to
              a large fraction of free disk. The API is{' '}
              <strong>asynchronous</strong> (event/promise-based) so big reads
              never block the main thread. It's the foundation for offline apps,
              large caches, and file storage; most people use a thin wrapper like{' '}
              <code>idb</code>, <code>Dexie</code>, or <code>localForage</code>{' '}
              rather than the raw, verbose API.
            </>
          ),
        },
        {
          kind: 'code',
          filename: 'indexeddb-sketch.ts',
          lang: 'ts',
          caption: 'IndexedDB is async and verbose — this is the raw shape (most use a wrapper).',
          code: `const req = indexedDB.open('app-db', 1)

// Schema changes happen in 'upgradeneeded' (first open / version bump).
req.onupgradeneeded = () => {
  const db = req.result
  const store = db.createObjectStore('docs', { keyPath: 'id' })
  store.createIndex('byUpdated', 'updatedAt') // queryable index
}

req.onsuccess = () => {
  const db = req.result
  const tx = db.transaction('docs', 'readwrite')
  tx.objectStore('docs').put({ id: 'd1', title: 'Notes', updatedAt: Date.now() })
  // Stores real objects/Blobs — no JSON.stringify needed.
}`,
        },
        {
          kind: 'table',
          caption: 'The four client stores at a glance. Quotas are approximate and vary by browser.',
          headers: ['', 'Size', 'Lifetime', 'Scope', 'Sync/Async', 'Sent to server?', 'Good for'],
          rows: [
            [
              <code key="c">Cookies</code>,
              <>~4 KB each (~50/domain)</>,
              <>Until expiry / cleared</>,
              <>Domain (+ path)</>,
              <>Sync</>,
              <><strong>Yes</strong> — every request</>,
              <>Session id / auth</>,
            ],
            [
              <code key="l">localStorage</code>,
              <>~5–10 MB / origin</>,
              <>Until cleared (persists)</>,
              <>Origin, all tabs</>,
              <>Sync</>,
              <>No</>,
              <>Prefs, non-secret cache</>,
            ],
            [
              <code key="s">sessionStorage</code>,
              <>~5–10 MB / origin</>,
              <>Until tab closes</>,
              <>One tab</>,
              <>Sync</>,
              <>No</>,
              <>Per-tab transient state</>,
            ],
            [
              <code key="i">IndexedDB</code>,
              <>Quota: 100s of MB+</>,
              <>Until cleared (persists)</>,
              <>Origin, all tabs</>,
              <><strong>Async</strong></>,
              <>No</>,
              <>Offline data, big caches, files</>,
            ],
          ],
        },
        {
          kind: 'callout',
          variant: 'tip',
          title: 'Which to pick',
          body: (
            <>
              <strong>Auth/session that the server reads → a cookie</strong>{' '}
              (ideally <code>HttpOnly</code> + <code>Secure</code> +{' '}
              <code>SameSite</code>). <strong>Small client-only prefs that
              should persist → <code>localStorage</code></strong>.{' '}
              <strong>Throwaway, tab-scoped state → <code>sessionStorage</code></strong>.{' '}
              <strong>Lots of structured data, offline support, or
              files → <code>IndexedDB</code></strong>. Rule of thumb: if the
              server needs it, it's a cookie; if it's a few KB the client owns,
              it's Web Storage; if it's a database, it's IndexedDB.
            </>
          ),
        },
        {
          kind: 'callout',
          variant: 'danger',
          title: 'Never store auth tokens or secrets in localStorage',
          body: (
            <>
              <code>localStorage</code> (and <code>sessionStorage</code>) is{' '}
              <strong>plaintext and fully readable by any JavaScript on the
              page</strong>. One XSS — including from a compromised third-party
              script — and an attacker reads every token you parked there.{' '}
              <code>HttpOnly</code> cookies exist precisely so the token is{' '}
              <em>invisible to JS</em>. Keep JWTs, refresh tokens, API keys, and
              session secrets <strong>out of Web Storage</strong>; this is the
              same boundary the Auth pillar's token-storage guidance draws.
            </>
          ),
        },
      ],
    },

    // ───────────────────────────── BUILD CYCLE ─────────────────────────────
    {
      slug: 'build-cycle',
      title: 'The build cycle: source → shipped code',
      summary:
        'How TS/JSX source becomes the JS a browser runs: transpile, bundle + tree-shake, dev vs prod, dist/ on a CDN.',
      blocks: [
        {
          kind: 'prose',
          body: (
            <>
              The code you <em>write</em> (TypeScript, JSX, modern syntax,
              hundreds of small modules) is not the code the{' '}
              <em>browser</em> runs. A build pipeline turns one into the other.
              It's worth knowing the stages because nearly every "why is my dev
              server fast but my prod bundle huge?" question lives here.
            </>
          ),
        },
        {
          kind: 'diagram',
          render: BuildCycleDiagram,
          title: 'From source to the browser',
          caption:
            'Source is transpiled to plain JS, the import graph is bundled and tree-shaken, then minified + content-hashed into dist/ assets a CDN serves.',
        },
        {
          kind: 'heading',
          text: '1. Transpile — strip types, lower syntax',
          id: 'build-transpile',
        },
        {
          kind: 'prose',
          body: (
            <>
              First, non-JS and too-new syntax is rewritten into plain
              JavaScript the target browsers understand.{' '}
              <strong>TypeScript types are erased</strong>, and{' '}
              <strong>JSX is converted into function calls</strong> (
              <code>jsx(...)</code> / <code>React.createElement(...)</code>).
              This is a <em>per-file</em> transform — it doesn't care about your
              import graph yet. The fast modern tools here are{' '}
              <strong>esbuild</strong> (Go) and <strong>SWC</strong> (Rust);{' '}
              <strong>Babel</strong> (JS) is the original and still the
              ecosystem standard for exotic plugins.
            </>
          ),
        },
        {
          kind: 'code',
          lang: 'tsx',
          filename: 'Greeting.tsx (source)',
          caption: 'What you write — types + JSX.',
          code: `interface Props {
  name: string
}

export function Greeting({ name }: Props) {
  return <h1 className="title">Hello, {name}!</h1>
}`,
        },
        {
          kind: 'code',
          lang: 'js',
          filename: 'Greeting.js (after transpile)',
          caption: 'Roughly the output: the interface is gone, JSX became a function call.',
          code: `import { jsx as _jsx } from 'react/jsx-runtime'

// The 'Props' interface vanished entirely — types are erased at build time.
export function Greeting({ name }) {
  return _jsx('h1', { className: 'title', children: ['Hello, ', name, '!'] })
}`,
        },
        {
          kind: 'heading',
          text: '2. Bundle + tree-shake — resolve the graph, drop dead code',
          id: 'build-bundle',
        },
        {
          kind: 'prose',
          body: (
            <>
              Next a <strong>bundler</strong> walks every <code>import</code>{' '}
              starting from your entry point, builds the full module graph
              (including <code>node_modules</code>), and stitches it into a small
              number of output files. Along the way it{' '}
              <strong>tree-shakes</strong>: any exported binding that nothing
              actually imports is dropped, so you ship only the code you use.
              This relies on static ES modules (<code>import</code>/
              <code>export</code>) — that's how the tool can prove an export is
              unreferenced. The bundlers you'll meet are{' '}
              <strong>Rollup</strong>/<strong>Rolldown</strong>,{' '}
              <strong>webpack</strong>, and esbuild.
            </>
          ),
        },
        {
          kind: 'code',
          lang: 'ts',
          caption: 'Tree-shaking: import one function from a module and the rest never ships.',
          code: `// utils.ts exports three functions…
export function formatDate() { /* ... */ }
export function slugify() { /* ... */ }
export function heavyUnusedThing() { /* ...100s of lines... */ }

// app.ts uses exactly one of them:
import { slugify } from './utils'
// → formatDate and heavyUnusedThing are pruned from the bundle.`,
        },
        {
          kind: 'heading',
          text: '3. Dev vs prod — two very different modes',
          id: 'build-dev-prod',
        },
        {
          kind: 'prose',
          body: (
            <>
              In <strong>dev</strong>, modern tools skip bundling almost
              entirely: the dev server transpiles each file on demand and serves
              <strong> native ES modules</strong> straight to the browser, with{' '}
              <strong>HMR</strong> (Hot Module Replacement) swapping just the
              edited module — that's why startup and edits feel instant.{' '}
              <strong>Production</strong> is the opposite priority — smallest,
              fastest payload — so it does the full treatment:{' '}
              <strong>minify</strong> (shrink names, strip whitespace/dead code),{' '}
              <strong>content-hash</strong> filenames (<code>app.4f9a.js</code>)
              for cache-busting + long-term caching, and{' '}
              <strong>code-split</strong> into lazy chunks so a route only loads
              what it needs.
            </>
          ),
        },
        {
          kind: 'heading',
          text: '4. Output to dist/ — static assets on a CDN',
          id: 'build-output',
        },
        {
          kind: 'prose',
          body: (
            <>
              The result is a folder (conventionally <code>dist/</code>) of plain{' '}
              <strong>static files</strong>: hashed JS/CSS chunks, an{' '}
              <code>index.html</code> that points at them, images, fonts. There's
              nothing dynamic to "run" on a server — you upload it to a{' '}
              <strong>CDN</strong> / static host and it's served from edge nodes
              close to users. (This app deploys exactly this way to GitHub
              Pages.)
            </>
          ),
        },
        {
          kind: 'callout',
          variant: 'key',
          title: 'dependencies vs devDependencies',
          body: (
            <>
              <code>dependencies</code> are what your app{' '}
              <strong>needs at runtime</strong> and may end up in the bundle that
              ships to users (e.g. <code>react</code>, <code>react-dom</code>).{' '}
              <code>devDependencies</code> are{' '}
              <strong>build-time only</strong> — they run on your machine / CI to
              produce <code>dist/</code> but are <em>never shipped</em> (e.g.{' '}
              <code>vite</code>, <code>typescript</code>, ESLint). Misplacing a
              build tool in <code>dependencies</code> bloats installs;
              misplacing a runtime lib in <code>devDependencies</code> breaks the
              build.
            </>
          ),
        },
        {
          kind: 'prose',
          body: (
            <>
              In <strong>this repo</strong> the build script is{' '}
              <code>tsc -b &amp;&amp; vite build</code>.{' '}
              <code>tsc -b</code> runs the TypeScript compiler in{' '}
              <em>build mode</em> across the project references purely to{' '}
              <strong>type-check</strong> (it catches type errors and fails the
              build) — Vite doesn't type-check on its own.{' '}
              <code>vite build</code> then does the real bundling: esbuild
              transpiles, Rollup/Rolldown bundles + tree-shakes, and it emits the
              minified, content-hashed <code>dist/</code>. A plain{' '}
              <code>vite build</code> (no <code>tsc</code>) would still produce
              working output but would <em>skip</em> the type check — which is
              why the two are chained.
            </>
          ),
        },
        {
          kind: 'callout',
          variant: 'info',
          title: 'Why the type check is a separate step',
          body: (
            <>
              esbuild strips types <em>incredibly fast precisely because it
              doesn't check them</em> — it just deletes the annotations. So the
              fast transpile (esbuild) and the correctness check (
              <code>tsc</code>) are split: <code>tsc</code> verifies, Vite ships.
              You get speed in the inner loop and safety in CI.
            </>
          ),
        },
      ],
    },

    // ───────────────────────────── BUILD TOOLS ─────────────────────────────
    {
      slug: 'build-tools',
      title: 'Build tools: Babel, webpack, esbuild, Vite, Turbopack',
      summary:
        "Don't conflate transpilers and bundlers: what each tool is, what language it's written in, and its job.",
      blocks: [
        {
          kind: 'prose',
          body: (
            <>
              These names get thrown around interchangeably, but they do{' '}
              <em>different jobs</em>. The two roles to keep separate:{' '}
              <strong>transpilers/compilers</strong> rewrite one file's syntax
              (TS/JSX → JS), while <strong>bundlers</strong> resolve the whole
              import graph into shippable files. Some tools do one, some do both,
              and a couple are really dev servers that orchestrate the others.
            </>
          ),
        },
        {
          kind: 'heading',
          text: 'Babel — the original transpiler',
          id: 'tool-babel',
        },
        {
          kind: 'prose',
          body: (
            <>
              <strong>Babel</strong> is a <strong>transpiler/compiler</strong>:
              it parses modern (or JSX, or TS-ish) syntax into an AST, runs a
              stack of <strong>plugins/presets</strong> over it, and prints
              broadly-compatible JavaScript. <code>@babel/preset-env</code> lowers
              new syntax to a target's capability;{' '}
              <code>@babel/preset-react</code> handles JSX. It's written in JS,
              so it's <em>relatively slow</em>, but its{' '}
              <strong>plugin ecosystem is the de-facto standard</strong> — macros,
              experimental proposals, framework transforms all live here. It does
              <strong> not</strong> bundle.
            </>
          ),
        },
        {
          kind: 'heading',
          text: 'webpack — the long-dominant bundler',
          id: 'tool-webpack',
        },
        {
          kind: 'prose',
          body: (
            <>
              <strong>webpack</strong> is the <strong>bundler</strong> that
              defined the era: a module graph with{' '}
              <strong>loaders</strong> (transform <em>any</em> asset — CSS,
              images, SVG — into a module) and <strong>plugins</strong> (hook the
              whole build), with first-class code-splitting. Enormously powerful
              and still everywhere in established codebases, but{' '}
              <strong>config-heavy</strong> and comparatively{' '}
              <strong>slow on large apps</strong> (it bundles even in dev).
            </>
          ),
        },
        {
          kind: 'heading',
          text: 'esbuild — the Go-powered speed demon',
          id: 'tool-esbuild',
        },
        {
          kind: 'prose',
          body: (
            <>
              <strong>esbuild</strong> is a{' '}
              <strong>bundler + transpiler written in Go</strong>, built for raw
              speed — often <strong>10–100×</strong> faster than JS-based tools
              by exploiting native code and parallelism. It powers{' '}
              <strong>Vite's dev-time transform</strong> and the minify step of
              many toolchains. The trade-off: its plugin API and edge-case
              feature set are narrower than webpack/Rollup, so it's frequently
              used <em>inside</em> a larger tool rather than alone.
            </>
          ),
        },
        {
          kind: 'heading',
          text: 'Vite — the modern default dev server + build tool',
          id: 'tool-vite',
        },
        {
          kind: 'prose',
          body: (
            <>
              <strong>Vite</strong> is a{' '}
              <strong>dev server + build orchestrator</strong>, not a single
              compiler. In dev it serves <strong>native ESM</strong> with instant
              HMR (transforming on demand with esbuild); for{' '}
              <strong>production</strong> it runs an optimized{' '}
              <strong>Rollup</strong> (increasingly{' '}
              <strong>Rolldown</strong>, the Rust-based Rollup-compatible
              bundler) build. It's the current default for new frontend projects
              — <strong>including this app</strong> — because it gives you a fast
              inner loop and a solid optimized build with almost no config.
            </>
          ),
        },
        {
          kind: 'heading',
          text: 'Turbopack — webpack’s Rust successor',
          id: 'tool-turbopack',
        },
        {
          kind: 'prose',
          body: (
            <>
              <strong>Turbopack</strong> is Vercel's{' '}
              <strong>Rust-based</strong> successor to webpack, used by{' '}
              <strong>Next.js</strong>. It's built around an{' '}
              <strong>incremental</strong> computation engine — it caches work at
              a fine grain and only recomputes what changed, which makes large-app
              dev and rebuilds very fast. Think "webpack's capabilities, native
              speed, incremental by design."
            </>
          ),
        },
        {
          kind: 'table',
          caption: 'Same space, different jobs — note the shift from JS to native-speed implementations.',
          headers: ['Tool', 'Type', 'Written in', 'Role'],
          rows: [
            [
              <strong key="b">Babel</strong>,
              <>Transpiler / compiler</>,
              <>JavaScript</>,
              <>Lower modern/JSX/TS syntax to compatible JS via plugins</>,
            ],
            [
              <strong key="w">webpack</strong>,
              <>Bundler</>,
              <>JavaScript</>,
              <>Module graph, loaders, plugins, code-splitting</>,
            ],
            [
              <strong key="e">esbuild</strong>,
              <>Bundler + transpiler</>,
              <>Go</>,
              <>Ultra-fast transpile/bundle/minify; powers other tools</>,
            ],
            [
              <strong key="v">Vite</strong>,
              <>Dev server + build tool</>,
              <>JS (uses esbuild + Rollup/Rolldown)</>,
              <>Native-ESM dev + optimized prod build (this app)</>,
            ],
            [
              <strong key="t">Turbopack</strong>,
              <>Bundler</>,
              <>Rust</>,
              <>Incremental webpack successor; powers Next.js</>,
            ],
          ],
        },
        {
          kind: 'callout',
          variant: 'info',
          title: 'The throughline: JS tools → native-speed tools',
          body: (
            <>
              The whole toolchain is being rewritten in{' '}
              <strong>Go and Rust</strong> for speed:{' '}
              <strong>esbuild</strong> (Go), <strong>SWC</strong> (Rust, a Babel
              replacement), <strong>Turbopack</strong> (Rust), and{' '}
              <strong>Rolldown</strong> (Rust, a Rollup-compatible bundler now
              powering Vite). The JS-based pioneers (Babel, webpack) aren't gone,
              but new projects increasingly sit on native cores — same concepts,
              an order of magnitude faster.
            </>
          ),
        },
      ],
    },

    // ─────────────────────────────── MONOREPOS ───────────────────────────────
    {
      slug: 'monorepo-nx-turborepo',
      title: 'Monorepos: Nx vs Turborepo',
      summary:
        'Run build/test/lint across many packages fast via the dependency graph, ordering, and aggressive caching.',
      blocks: [
        {
          kind: 'prose',
          body: (
            <>
              A <strong>monorepo</strong> is one repository holding many packages
              or apps — say a web app, an admin app, a shared UI library, and a
              utilities package. The problem that grows with it: running tasks
              (<code>build</code>, <code>test</code>, <code>lint</code>) across{' '}
              <em>all</em> of them gets slow and order-sensitive. Tools like{' '}
              <strong>Turborepo</strong> and <strong>Nx</strong> exist to make
              that fast by doing three things: (1) understanding the{' '}
              <strong>dependency graph</strong> between packages, (2) running
              tasks in the <strong>right order and in parallel</strong>, and (3){' '}
              <strong>caching task outputs</strong> so unchanged packages are
              skipped entirely (locally and via a shared remote cache).
            </>
          ),
        },
        {
          kind: 'heading',
          text: 'Turborepo — a lean task runner',
          id: 'mono-turborepo',
        },
        {
          kind: 'prose',
          body: (
            <>
              <strong>Turborepo</strong> (Rust, by Vercel) is a fast, minimal{' '}
              <strong>task runner</strong> that layers onto your existing npm /
              pnpm / yarn workspaces — it doesn't replace them. You declare a{' '}
              <strong>task pipeline</strong> in <code>turbo.json</code>:{' '}
              <code>dependsOn</code> expresses ordering (e.g. build a package's
              deps first), <code>outputs</code> tells it what files a task
              produces so they can be cached. It content-hashes each task's{' '}
              <strong>inputs</strong>; if the hash matches a prior run it{' '}
              <strong>skips the task and restores the outputs from cache</strong>{' '}
              (including a <strong>remote cache</strong> shared across the team
              and CI). Light-touch, opinion-light.
            </>
          ),
        },
        {
          kind: 'code',
          filename: 'turbo.json',
          lang: 'json',
          caption: 'A small pipeline: build after upstream builds; lint/test have no build outputs.',
          code: `{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": []
    },
    "lint": {
      "outputs": []
    }
  }
}`,
        },
        {
          kind: 'prose',
          body: (
            <>
              The <code>^build</code> means "run <code>build</code> in this
              package's <em>dependencies</em> first." Run{' '}
              <code>turbo run build test lint</code> and Turborepo schedules
              everything across the graph in parallel, then on the second run
              prints mostly <code>cache hit, replaying output</code> — that's the
              whole value proposition.
            </>
          ),
        },
        {
          kind: 'heading',
          text: 'Nx — a full monorepo platform',
          id: 'mono-nx',
        },
        {
          kind: 'prose',
          body: (
            <>
              <strong>Nx</strong> does the same caching + parallelism but is a far{' '}
              <strong>more full-featured build system and dev platform</strong>.
              On top of computation caching it adds an{' '}
              <strong>affected graph</strong> (<code>nx affected</code> runs
              tasks <em>only</em> for projects impacted by a diff —
              huge in CI), <strong>code generators / scaffolding</strong>{' '}
              (<code>nx generate</code> a new lib/component to a convention),{' '}
              <strong>plugins</strong> for frameworks,{' '}
              <strong>module-boundary lint rules</strong> (enforce which packages
              may import which), and <strong>graph visualization</strong>. It's
              heavier and more opinionated — you adopt Nx's structure — in
              exchange for a lot more power out of the box.
            </>
          ),
        },
        {
          kind: 'code',
          filename: 'CI — run only what a change affected',
          lang: 'bash',
          caption: "Nx's affected graph skips untouched projects entirely.",
          code: `# Lint, test, and build ONLY the projects impacted by changes
# since the main branch — not the whole repo.
npx nx affected --target=lint --base=origin/main
npx nx affected --target=test --base=origin/main
npx nx affected --target=build --base=origin/main`,
        },
        {
          kind: 'table',
          caption: 'Both cache and parallelize via the task graph; Nx does much more beyond that.',
          headers: ['', 'Turborepo', 'Nx'],
          rows: [
            [
              <>Task caching</>,
              <>Yes (local + remote)</>,
              <>Yes (local + remote)</>,
            ],
            [
              <>Affected / impacted graph</>,
              <>Basic (filters)</>,
              <><strong>First-class</strong> (<code>nx affected</code>)</>,
            ],
            [
              <>Code generation / scaffolding</>,
              <>No</>,
              <><strong>Yes</strong> (generators)</>,
            ],
            [
              <>Architecture / boundary rules</>,
              <>No</>,
              <><strong>Yes</strong> (module boundaries)</>,
            ],
            [
              <>Learning curve</>,
              <>Gentle</>,
              <>Steeper</>,
            ],
            [
              <>Footprint / opinion</>,
              <>Light — adds to your workspaces</>,
              <>Heavier — an integrated platform</>,
            ],
          ],
        },
        {
          kind: 'callout',
          variant: 'key',
          title: 'The fundamental difference',
          body: (
            <>
              <strong>Turborepo is a lean task-orchestrator + cache</strong> you
              bolt onto existing npm/pnpm workspaces — it makes the tasks you
              already run faster and otherwise stays out of the way.{' '}
              <strong>Nx is an integrated monorepo platform</strong> — caching{' '}
              <em>plus</em> code generation, an affected-graph, architecture
              tooling, and plugins. Both cache and parallelize via the task
              graph; Nx layers a whole development environment on top. Pick
              Turborepo when you want speed with minimal buy-in; pick Nx when you
              want batteries-included structure for a large, growing repo.
            </>
          ),
        },
      ],
    },

    // ─────────────────────────── TYPESCRIPT ESSENTIALS ───────────────────────────
    {
      slug: 'typescript-essentials',
      title: 'A little TypeScript',
      summary:
        'Types are checked then erased — zero runtime cost. type vs interface, unions, generics, unknown vs any.',
      blocks: [
        {
          kind: 'prose',
          body: (
            <>
              TypeScript adds a <strong>static type layer</strong> over
              JavaScript that's <strong>checked at build time and then
              completely erased</strong>. The browser never sees TypeScript — it
              compiles to plain JS, so types add <strong>zero runtime
              cost</strong> (no checks, no metadata, no slowdown). They exist
              purely to catch mistakes and power editor tooling{' '}
              <em>before</em> the code runs. Here's the practical core.
            </>
          ),
        },
        {
          kind: 'heading',
          text: 'type vs interface',
          id: 'ts-type-vs-interface',
        },
        {
          kind: 'prose',
          body: (
            <>
              Both describe shapes; the guideline:{' '}
              <strong>use <code>interface</code> for object shapes</strong> you
              expect to extend or that libraries augment (it supports{' '}
              <code>extends</code> and <strong>declaration merging</strong> — two
              same-named interfaces combine).{' '}
              <strong>Use <code>type</code> for everything else</strong>:
              unions, tuples, function types, mapped/conditional types, and
              aliases. A lot of teams "use <code>interface</code> for public
              object APIs, <code>type</code> for the rest" and don't agonize over
              it.
            </>
          ),
        },
        {
          kind: 'code',
          lang: 'ts',
          code: `// interface — object shape, extendable, merge-able.
interface User {
  id: string
  name: string
}
interface Admin extends User {
  role: 'admin'
}

// type — aliases, unions, tuples, function types: things interface can't do.
type Status = 'idle' | 'loading' | 'done' // a union
type Point = { x: number; y: number }
type Pair = [string, number] // tuple
type Handler = (e: Event) => void // function type`,
        },
        {
          kind: 'heading',
          text: 'Unions & narrowing',
          id: 'ts-unions',
        },
        {
          kind: 'prose',
          body: (
            <>
              A <strong>union</strong> (<code>A | B</code>) says "one of these."
              You then <strong>narrow</strong> it — with{' '}
              <code>typeof</code>, <code>in</code>, equality checks, or a{' '}
              <strong>discriminant field</strong> — and inside each branch TS
              knows the exact type. This is how you model state machines and API
              results safely.
            </>
          ),
        },
        {
          kind: 'code',
          lang: 'ts',
          caption: 'A discriminated union: switching on `status` narrows the rest of the shape.',
          code: `type Result =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ok'; data: string[] }

function render(r: Result) {
  switch (r.status) {
    case 'loading':
      return 'Spinner…'
    case 'error':
      return r.message // TS knows 'message' exists here
    case 'ok':
      return r.data.join(', ') // …and 'data' only here
  }
}`,
        },
        {
          kind: 'heading',
          text: 'Generics',
          id: 'ts-generics',
        },
        {
          kind: 'prose',
          body: (
            <>
              <strong>Generics</strong> are type-level parameters: they let a
              function or type work over <em>any</em> type while{' '}
              <strong>preserving the relationship</strong> between input and
              output. <code>useState</code> is generic — call{' '}
              <code>useState&lt;number&gt;(0)</code> and the setter only accepts
              numbers.
            </>
          ),
        },
        {
          kind: 'code',
          lang: 'ts',
          code: `// The classic: identity preserves whatever type it's given.
function identity<T>(value: T): T {
  return value
}
const a = identity('hi') // a: string
const b = identity(42) // b: number

// useState is generic — T flows into the value AND the setter.
const [count, setCount] = useState<number>(0)
setCount(3) // ✅
// setCount('three') // ❌ Argument of type 'string' is not assignable to 'number'`,
        },
        {
          kind: 'heading',
          text: 'unknown vs any',
          id: 'ts-unknown-vs-any',
        },
        {
          kind: 'prose',
          body: (
            <>
              <code>any</code> <strong>turns the type checker off</strong> for
              that value — every operation is allowed and every bug it would have
              caught slips through. <code>unknown</code> is the{' '}
              <strong>safe</strong> counterpart: it accepts anything, but you{' '}
              <strong>can't use it until you narrow it</strong> to something
              specific. <strong>Prefer <code>unknown</code></strong> at every
              boundary where the type is genuinely uncertain (API responses,{' '}
              <code>JSON.parse</code>, <code>catch</code> clauses).
            </>
          ),
        },
        {
          kind: 'code',
          lang: 'ts',
          code: `function risky(input: any) {
  input.foo.bar() // compiles — and explodes at runtime if wrong. any = no safety net.
}

function safe(input: unknown) {
  // input.trim()            // ❌ Object is of type 'unknown'
  if (typeof input === 'string') {
    input.trim() // ✅ narrowed to string — now it's allowed
  }
}`,
        },
        {
          kind: 'heading',
          text: 'Structural typing',
          id: 'ts-structural',
        },
        {
          kind: 'prose',
          body: (
            <>
              TypeScript is <strong>structurally typed</strong> ("duck typing"):
              compatibility is decided by <em>shape</em>, not by name or explicit
              declaration. If an object has all the members a type requires, it{' '}
              <strong>is</strong> that type — no <code>implements</code> needed.
            </>
          ),
        },
        {
          kind: 'code',
          lang: 'ts',
          code: `interface Named {
  name: string
}

function greet(n: Named) {
  return 'Hi ' + n.name
}

// Never mentions 'Named', but its shape matches — so it's accepted.
const dog = { name: 'Rex', legs: 4 }
greet(dog) // ✅ structural: has a string 'name' ⇒ compatible`,
        },
        {
          kind: 'heading',
          text: 'Where tsc fits the build',
          id: 'ts-build',
        },
        {
          kind: 'prose',
          body: (
            <>
              Type-<em>checking</em> and JS <em>emit</em> are separable. In a
              Vite project, <strong>esbuild strips the types</strong> as part of
              its fast transpile (it does <em>not</em> check them), and{' '}
              <strong><code>tsc</code> runs separately to verify
              correctness</strong> — typically{' '}
              <code>tsc -b --noEmit</code> (build mode, check only, produce no
              files). That's why this app's build is{' '}
              <code>tsc -b &amp;&amp; vite build</code>: <code>tsc</code> is the
              gate that fails on type errors; Vite produces the bundle.
            </>
          ),
        },
        {
          kind: 'callout',
          variant: 'key',
          title: 'Types are erased — so validate at the boundary',
          body: (
            <>
              Because types vanish at build time, a <strong>passing type-check
              guarantees nothing at runtime about data you didn't
              control</strong>. Annotating <code>fetch().then(r =&gt; r.json())</code>{' '}
              as <code>User</code> is a <em>promise to the compiler</em>, not a
              runtime check — if the API returns garbage, TS is none the wiser
              and your code blows up later. At every external boundary (network,{' '}
              <code>localStorage</code>, URL params, form input){' '}
              <strong>validate with a runtime schema</strong> — <code>zod</code>,{' '}
              <code>valibot</code>, etc. — and let it produce the typed value.
              Static types in; validated values at the edges.
            </>
          ),
        },
      ],
    },

    // ──────────────────────────── CODE AND THE OS ────────────────────────────
    {
      slug: 'code-and-the-os',
      title: 'How code depends on the OS',
      summary:
        'Your JS → engine → runtime APIs → syscalls → kernel → hardware, plus the browser sandbox and OS quirks.',
      blocks: [
        {
          kind: 'prose',
          body: (
            <>
              JavaScript feels like it floats in a vacuum, but every line
              eventually moves real bytes on real hardware through a stack of
              layers. Knowing the stack explains a lot: why Node code is{' '}
              <em>sensitive</em> to the OS, why browser code{' '}
              <em>can't</em> touch your files, and why "works on my machine" fails
              in CI.
            </>
          ),
        },
        {
          kind: 'diagram',
          render: CodeToOsDiagram,
          title: 'From your JS down to the metal',
          caption:
            'Each layer only talks to the one below it: engine → runtime APIs → system calls → kernel → hardware. The browser inserts a sandbox that blocks raw syscalls.',
        },
        {
          kind: 'heading',
          text: 'The layers, top to bottom',
          id: 'os-layers',
        },
        {
          kind: 'prose',
          body: (
            <>
              <strong>1. Your JS</strong> is handed to a{' '}
              <strong>2. JS engine</strong> (<strong>V8</strong> in Chrome and
              Node): it parses your code, <strong>JIT-compiles</strong> hot paths
              to machine code, and <strong>garbage-collects</strong> unused
              objects. The engine runs <em>the language</em>, but{' '}
              <code>fetch</code>, timers, files, and sockets aren't part of the
              language — they come from{' '}
              <strong>3. runtime APIs</strong>: in the browser, the{' '}
              <strong>Web APIs</strong> (DOM, <code>fetch</code>,{' '}
              <code>setTimeout</code>); in Node, bindings backed by{' '}
              <strong>libuv</strong> (the event loop + thread pool). Those APIs,
              to actually do I/O, make{' '}
              <strong>4. system calls</strong> (<code>read</code>,{' '}
              <code>write</code>, <code>socket</code>, <code>mmap</code>) — the
              defined way to ask the <strong>5. OS kernel</strong> for something.
              The kernel <strong>schedules processes/threads, manages memory,
              and owns the files and network</strong>, driving the{' '}
              <strong>6. hardware</strong> (CPU, RAM, disk, NIC). Each layer
              speaks only to the one beneath it.
            </>
          ),
        },
        {
          kind: 'heading',
          text: 'The browser sandbox',
          id: 'os-sandbox',
        },
        {
          kind: 'prose',
          body: (
            <>
              In a browser there's a hard boundary mid-stack: a{' '}
              <strong>sandbox</strong>. Page JavaScript{' '}
              <strong>cannot make raw system calls</strong>, can't read your
              filesystem, can't open arbitrary sockets. Everything it does goes
              through <strong>vetted Web APIs</strong> the browser polices — a
              file picker instead of <code>fs</code>, <code>fetch</code> bounded
              by CORS instead of raw TCP. The sandbox is the entire security
              model of the web: untrusted code from any site runs on your machine{' '}
              <em>safely</em> because it can't reach the OS directly.
            </>
          ),
        },
        {
          kind: 'heading',
          text: 'Why the same code behaves differently across OSes',
          id: 'os-quirks',
        },
        {
          kind: 'prose',
          body: (
            <>
              Once code <em>can</em> touch the OS (i.e. in Node), the OS's quirks
              leak in. The usual suspects:
            </>
          ),
        },
        {
          kind: 'table',
          caption: 'Cross-OS gotchas that bite Node code (and CI) but never browser code.',
          headers: ['Concern', 'Windows', 'macOS / Linux'],
          rows: [
            [
              <>Path separator</>,
              <><code>\\</code> (backslash)</>,
              <><code>/</code> (forward slash)</>,
            ],
            [
              <>Line endings</>,
              <><code>CRLF</code> (<code>\r\n</code>)</>,
              <><code>LF</code> (<code>\n</code>)</>,
            ],
            [
              <>Filesystem case</>,
              <>Case-<strong>insensitive</strong> (usually)</>,
              <>Linux: case-<strong>sensitive</strong></>,
            ],
            [
              <>File-watcher limits</>,
              <>Different APIs/limits</>,
              <>Linux <code>inotify</code> caps (<code>ENOSPC</code>)</>,
            ],
            [
              <>Memory / CPU available</>,
              <>Varies per machine</>,
              <>Affects parallelism, OOM, timeouts</>,
            ],
          ],
        },
        {
          kind: 'prose',
          body: (
            <>
              This is why you build paths with <code>path.join()</code> instead
              of hand-concatenating with <code>'/'</code>, normalize line endings
              in git (<code>.gitattributes</code>), and never rely on a file
              being found by the "wrong" case. A test that passes on a developer's
              case-insensitive macOS can fail on a case-sensitive Linux CI runner
              over a single mis-cased <code>import</code>.
            </>
          ),
        },
        {
          kind: 'callout',
          variant: 'info',
          title: 'Browser: sandbox is a feature. Node: power means responsibility.',
          body: (
            <>
              In the <strong>browser you never touch the OS directly</strong> —
              the sandbox sits between your code and syscalls, which is a{' '}
              <em>feature</em> (it's what makes running strangers' code safe). In{' '}
              <strong>Node you can</strong> reach the filesystem, network, and
              processes — that power is the whole point, but it's also exactly{' '}
              why Node code is <strong>OS-sensitive</strong> and must be written
              to tolerate path, line-ending, case, and resource differences. The
              same JS language; two very different relationships with the machine.
            </>
          ),
        },
      ],
    },
  ],
}
