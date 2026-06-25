import type { QuizQuestion } from '../types/content'

/**
 * Scenario-based quiz spanning all six pillars. Each question describes a real
 * situation and asks which tool/concept fits — plus a few "spot the bug / which
 * error" questions. `answer` is the index into `options`.
 */
export const QUIZ: QuizQuestion[] = [
  // ── React Patterns ───────────────────────────────────────────────
  {
    id: 'q-hook-reuse',
    pillar: 'React Patterns',
    prompt:
      'You need to share the same toggle logic (open/close + persisted state) across 5 unrelated components. What do you reach for first?',
    options: ['A Higher-Order Component', 'A custom hook', 'A render prop', 'React Context'],
    answer: 1,
    explanation:
      'A custom hook (e.g. useToggle) is the modern default for reusing stateful logic — it composes without adding wrapper nesting to the tree. HOCs and render props largely predate hooks and are now niche.',
  },
  {
    id: 'q-compound',
    pillar: 'React Patterns',
    prompt:
      'You are building a <Tabs> component family where <Tab> children need to know which tab is active, without the consumer wiring up any state. Which pattern fits?',
    options: [
      'Compound components (shared Context)',
      'Container/Presentational split',
      'Polymorphic `as` prop',
      'Controlled inputs',
    ],
    answer: 0,
    explanation:
      'Compound components share implicit state through Context (Tabs holds the active id; Tabs.Tab reads it). This is exactly how Radix/Reach model Tabs, Accordion, and Select — declarative markup, state in one place.',
  },
  {
    id: 'q-hoc-caveat',
    pillar: 'React Patterns',
    prompt:
      'You wrote a withAuth() HOC, but refs passed to the wrapped component now land on the wrapper instead of the real DOM node. What did you forget?',
    options: [
      'To memoize the component',
      'To forward the ref (forwardRef)',
      'To add a key prop',
      'To call useEffect',
    ],
    answer: 1,
    explanation:
      'HOCs must forward refs with React.forwardRef, set a displayName, and hoist non-React statics — otherwise refs, debugging names, and static properties break. Also never create an HOC inside render.',
  },
  // ── React Deep-Dive ──────────────────────────────────────────────
  {
    id: 'q-memo-pair',
    pillar: 'React Deep-Dive',
    prompt:
      'A memoized child still re-renders on every keystroke in its parent. The parent passes it onSelect={(id) => ...} inline. The minimal fix?',
    options: [
      'Wrap the child in another <div>',
      'Wrap the handler in useCallback (and keep React.memo on the child)',
      'Move the child into its own file',
      'Add a unique key to the child',
    ],
    answer: 1,
    explanation:
      'The inline arrow is a new function identity every render, so React.memo’s shallow prop check always fails. useCallback stabilizes the identity — but only helps in tandem with React.memo on the child.',
  },
  {
    id: 'q-uselayouteffect',
    pillar: 'React Deep-Dive',
    prompt:
      'You must read an element’s measured size and reposition a tooltip BEFORE the browser paints, to avoid a visible flicker. Which hook?',
    options: ['useEffect', 'useMemo', 'useLayoutEffect', 'useDeferredValue'],
    answer: 2,
    explanation:
      'useLayoutEffect fires synchronously after DOM mutations but before paint, so DOM measurements/mutations happen without a flash. useEffect runs after paint, which would show the unpositioned frame first.',
  },
  {
    id: 'q-context-rerender',
    pillar: 'React Deep-Dive',
    prompt:
      'You put a large, frequently-changing app state into a single React Context. Now unrelated components re-render constantly. The core issue?',
    options: [
      'Context is broken for big apps',
      'A Context value change re-renders ALL consumers — it’s broadcast, not selective',
      'You forgot to memoize the consumers',
      'Context can’t hold objects',
    ],
    answer: 1,
    explanation:
      'Context is a value-distribution (broadcast) mechanism with no change-granularity: every consumer re-renders when the provider value changes. Use it for low-frequency values (theme/auth), or split contexts; for selective subscriptions use a store (Redux/Zustand) which subscribe via useSyncExternalStore.',
  },
  {
    id: 'q-redux-vs-context',
    pillar: 'React Deep-Dive',
    prompt:
      'Which statement captures the FUNDAMENTAL difference between Context and Redux?',
    options: [
      'Redux is faster than Context in all cases',
      'Context distributes a value through the tree; Redux is a state container outside the tree with selective subscriptions',
      'They are the same thing with different names',
      'Context can’t be used with hooks',
    ],
    answer: 1,
    explanation:
      'Context = dependency injection / value distribution through the React tree (no built-in selectivity). Redux = an external store with a predictable update pipeline and selector-based subscriptions, so only components reading a changed slice re-render. Different problems, not competitors.',
  },
  // ── JS Internals ─────────────────────────────────────────────────
  {
    id: 'q-debounce',
    pillar: 'JS Internals',
    prompt:
      'A search box fires an API call on every keystroke, hammering the server. You want ONE call after the user stops typing for 300ms. Which technique?',
    options: ['Throttle', 'Debounce', 'Polling', 'requestAnimationFrame'],
    answer: 1,
    explanation:
      'Debounce waits for a quiet period (no events for N ms) then fires once — ideal for search-as-you-type and autosave. Throttle would instead fire at a steady max rate during continuous typing.',
  },
  {
    id: 'q-throttle',
    pillar: 'JS Internals',
    prompt:
      'A scroll handler runs hundreds of times a second and janks the page. You want it to run at most once every 100ms during the scroll. Which technique?',
    options: ['Debounce', 'Throttle', 'Promise.all', 'A web worker'],
    answer: 1,
    explanation:
      'Throttle caps execution to once per interval during continuous activity (scroll, mousemove, drag). Debounce would wait for scrolling to STOP, which feels unresponsive for live scroll effects.',
  },
  {
    id: 'q-microtask-order',
    pillar: 'JS Internals',
    prompt:
      'What logs, in order?\nconsole.log(1);\nsetTimeout(() => console.log(2), 0);\nPromise.resolve().then(() => console.log(3));\nconsole.log(4);',
    options: ['1 2 3 4', '1 4 3 2', '1 4 2 3', '1 3 4 2'],
    answer: 1,
    explanation:
      'Synchronous code first (1, 4). Then the microtask queue drains fully before any macrotask — the resolved Promise’s .then (3) runs before the setTimeout callback (2), even with a 0ms delay.',
  },
  {
    id: 'q-parallel-await',
    pillar: 'JS Internals',
    prompt:
      'You await three independent API calls inside a for-loop. They’re slow and clearly run one-after-another. The fix to run them concurrently?',
    options: [
      'Add more awaits',
      'Start all three then await Promise.all([...])',
      'Wrap each in setTimeout',
      'Use a throttle',
    ],
    answer: 1,
    explanation:
      'await in a loop serializes independent work. Kick off all the promises first (or map to an array of promises) and await Promise.all — total time becomes the slowest call, not the sum.',
  },
  {
    id: 'q-delegation',
    pillar: 'JS Internals',
    prompt:
      'A list re-renders new <li> items dynamically, and per-item click listeners keep going stale. The clean approach?',
    options: [
      'Re-attach listeners after every render',
      'Event delegation: one listener on the parent + event.target.closest()',
      'Use stopPropagation on each item',
      'Add capture: true to each listener',
    ],
    answer: 1,
    explanation:
      'Event delegation puts a single listener on a stable ancestor and resolves the clicked item via event.target.closest(selector). It uses bubbling, needs no rebinding, and works for items added later.',
  },
  // ── Errors & Debugging ───────────────────────────────────────────
  {
    id: 'q-stack-overflow',
    pillar: 'Errors & Debugging',
    prompt:
      'A recursive function with no reachable base case throws an error. Which one?',
    options: [
      'TypeError',
      'ReferenceError',
      'RangeError: Maximum call stack size exceeded',
      'SyntaxError',
    ],
    answer: 2,
    explanation:
      'Unbounded recursion keeps pushing stack frames until the finite call stack overflows — a RangeError ("Maximum call stack size exceeded"). Fix with a correct base case, or convert to iteration / trampolining.',
  },
  {
    id: 'q-typeerror',
    pillar: 'Errors & Debugging',
    prompt:
      '"Cannot read properties of undefined (reading \'name\')" is which kind of error, and a typical cause?',
    options: [
      'SyntaxError — a missing bracket',
      'TypeError — accessing a property on undefined/null',
      'ReferenceError — an undeclared variable',
      'RangeError — a number out of range',
    ],
    answer: 1,
    explanation:
      'It’s a TypeError: you used a value (undefined) as if it had properties. Common causes: an API field that wasn’t there, an array .find() that matched nothing, or destructuring a missing object.',
  },
  {
    id: 'q-leak',
    pillar: 'Errors & Debugging',
    prompt:
      'A React component starts a setInterval in useEffect but never returns a cleanup. Over time memory climbs and callbacks fire after unmount. The fix?',
    options: [
      'Increase --max-old-space-size',
      'Return a cleanup from useEffect that clears the interval',
      'Wrap the component in React.memo',
      'Move the interval into useMemo',
    ],
    answer: 1,
    explanation:
      'Uncleared timers are a classic leak: the closure stays reachable and keeps firing. Return () => clearInterval(id) from the effect so it’s torn down on unmount and before the effect re-runs.',
  },
  {
    id: 'q-devtools-network',
    pillar: 'Errors & Debugging',
    prompt:
      'An API call "isn’t working." You want to see the exact request URL, headers, payload, status code, and response. Which Chrome DevTools panel?',
    options: ['Elements', 'Network', 'Performance', 'Memory'],
    answer: 1,
    explanation:
      'The Network panel shows every request with its method/URL, status, timing, request & response headers, and body — the first stop for debugging API/CORS/auth issues. (Memory is for heap snapshots; Performance for runtime profiling.)',
  },
  {
    id: 'q-devtools-memory',
    pillar: 'Errors & Debugging',
    prompt:
      'You suspect a memory leak and want to compare what objects are retained before and after an action. Which DevTools panel?',
    options: ['Application', 'Memory (heap snapshots)', 'Sources', 'Lighthouse'],
    answer: 1,
    explanation:
      'The Memory panel takes heap snapshots you can diff (Comparison view) to find objects that should have been freed but are still retained — plus allocation timelines. Application is for storage/cookies/service workers.',
  },
  // ── Auth Flows ───────────────────────────────────────────────────
  {
    id: 'q-token-storage',
    pillar: 'Auth Flows',
    prompt:
      'Where should a SPA keep an auth token to best resist XSS token theft?',
    options: [
      'localStorage',
      'An HttpOnly cookie (not readable by JS)',
      'A global window variable',
      'In the URL query string',
    ],
    answer: 1,
    explanation:
      'localStorage is readable by ANY script, so an XSS bug can exfiltrate the token. An HttpOnly cookie is invisible to JS (mind CSRF: pair with SameSite). Never put tokens in URLs — they leak via history, logs, and referrers.',
  },
  {
    id: 'q-jwt-encoding',
    pillar: 'Auth Flows',
    prompt:
      'True or false: it’s safe to store a user’s secret (e.g. a password) inside a JWT payload because the token is signed.',
    options: [
      'True — the signature encrypts it',
      'False — a JWT is signed, not encrypted; anyone can base64-decode the payload',
      'True — only the server can read it',
      'False — JWTs can’t hold strings',
    ],
    answer: 1,
    explanation:
      'A JWT signature guarantees integrity/authenticity, NOT confidentiality. The header and payload are just base64url — anyone holding the token can decode and read them. Never put secrets in a JWT.',
  },
  {
    id: 'q-refresh-rotation',
    pillar: 'Auth Flows',
    prompt:
      'Your app issues short access tokens + long refresh tokens. To limit damage if a refresh token leaks, what should refresh do?',
    options: [
      'Nothing — refresh tokens never expire',
      'Rotate the refresh token on each use (single-use) with reuse detection',
      'Store the refresh token in localStorage',
      'Email the user on every refresh',
    ],
    answer: 1,
    explanation:
      'Rotation makes each refresh token single-use: refreshing issues a new one and invalidates the old. If a rotated token is replayed (reuse detection), treat it as theft and revoke the whole token family — exactly what the production case study’s backend does.',
  },
  // ── Platform & Tooling ───────────────────────────────────────────
  {
    id: 'q-storage-size',
    pillar: 'Platform & Tooling',
    prompt:
      'You need to cache ~8 MB of structured app data on the client for offline use. Which storage is appropriate?',
    options: [
      'Cookies',
      'localStorage',
      'IndexedDB',
      'sessionStorage',
    ],
    answer: 2,
    explanation:
      'Cookies are ~4 KB each (and sent on every request). localStorage/sessionStorage are ~5–10 MB and string-only/synchronous. IndexedDB is the async, quota-based (hundreds of MB+) structured store built for large offline data.',
  },
  {
    id: 'q-cookie-overhead',
    pillar: 'Platform & Tooling',
    prompt:
      'Why is stuffing lots of data into cookies a performance problem?',
    options: [
      'Cookies are encrypted and slow to decrypt',
      'Cookies are sent to the server on every matching HTTP request, adding overhead each time',
      'Cookies block the main thread',
      'Cookies can’t be read by JavaScript',
    ],
    answer: 1,
    explanation:
      'Unlike localStorage, cookies ride along on every request to the domain — every page load, image, and API call carries them. That’s why cookies are kept tiny (~4 KB) and used only for things the server needs, like a session id.',
  },
  {
    id: 'q-transpile-vs-bundle',
    pillar: 'Platform & Tooling',
    prompt:
      'In the build pipeline, which tool’s primary JOB is to TRANSPILE (e.g. strip TS types, turn JSX into JS calls) rather than bundle?',
    options: ['Rollup', 'Babel', 'webpack', 'Vite’s dev server'],
    answer: 1,
    explanation:
      'Babel is the classic transpiler: syntax in → broadly-compatible JS out, via presets/plugins. Rollup and webpack are primarily bundlers (resolve the import graph, tree-shake). esbuild/SWC do fast transpiling too; Vite orchestrates them.',
  },
  {
    id: 'q-turborepo',
    pillar: 'Platform & Tooling',
    prompt:
      'In a monorepo, what is Turborepo’s core value compared to running npm scripts manually?',
    options: [
      'It replaces React',
      'It understands the task graph and caches task outputs, skipping/ restoring unchanged work',
      'It minifies your CSS',
      'It’s a TypeScript type-checker',
    ],
    answer: 1,
    explanation:
      'Turborepo is a task runner that reads a pipeline (dependsOn/outputs), runs tasks in the right order in parallel, and content-hashes inputs to cache outputs (local + remote) — so unchanged packages are skipped. Nx does this plus codegen, affected-graph, and architecture tooling.',
  },
  {
    id: 'q-ts-erased',
    pillar: 'Platform & Tooling',
    prompt:
      'A TypeScript build passes with no errors. What does that guarantee about untrusted JSON arriving from an API at runtime?',
    options: [
      'It’s guaranteed to match your types',
      'Nothing — types are erased at build; runtime data must still be validated',
      'TypeScript checks it on every fetch',
      'The browser enforces the types',
    ],
    answer: 1,
    explanation:
      'Types are checked at build then ERASED — there’s no TypeScript at runtime and zero runtime cost. External data can be any shape, so validate at the boundary (e.g. zod) rather than trusting a compile-time type.',
  },
  {
    id: 'q-code-to-os',
    pillar: 'Platform & Tooling',
    prompt:
      'Why might identical Node.js code behave differently on Windows vs Linux?',
    options: [
      'JavaScript is a different language on each OS',
      'OS differences: path separators (/ vs \\), line endings (LF vs CRLF), case-sensitivity, file-watcher/memory limits',
      'V8 only runs on Linux',
      'It never behaves differently',
    ],
    answer: 1,
    explanation:
      'Your JS bottoms out in OS system calls. Filesystem and process semantics differ across kernels — path separators, line endings, case-sensitive vs insensitive paths, watcher limits, available memory. In the browser a sandbox hides the OS; in Node you touch it directly.',
  },
]
