import type { TopicGroup } from '../types/content'

// Authored in task #5 — "React Patterns" pillar.
// A typed data module: an array of topics, each an ordered list of blocks.
export const reactPatterns: TopicGroup = {
  id: 'react-patterns',
  title: 'React Patterns',
  label: 'React Patterns',
  icon: '🧩',
  topics: [
    // ───────────────────────────── COMPOSITION ─────────────────────────────
    {
      slug: 'children-composition',
      title: 'Children composition',
      summary: 'Pass JSX through `children` to keep components open and dumb.',
      blocks: [
        {
          kind: 'prose',
          body: (
            <>
              The simplest composition tool React gives you is{' '}
              <code>children</code>. Instead of teaching a component about every
              piece of content it might hold, you leave a hole and let the caller
              fill it. The component stays <strong>open</strong> (it doesn't
              know or care what goes inside) and <strong>dumb</strong> (it owns
              layout/chrome, not content). This sidesteps the most common cause
              of prop-drilling: passing configuration down only so a deep child
              can render it.
            </>
          ),
        },
        {
          kind: 'code',
          filename: 'Card.tsx',
          lang: 'tsx',
          code: `import type { ReactNode } from 'react'

// The Card owns the *frame*. It knows nothing about its contents.
export function Card({ children }: { children: ReactNode }) {
  return <section className="card">{children}</section>
}

// The caller owns the *content*.
function ProfilePanel() {
  return (
    <Card>
      <h2>Ada Lovelace</h2>
      <p>First programmer. Countess. Mathematician.</p>
      <button>Follow</button>
    </Card>
  )
}`,
        },
        {
          kind: 'prose',
          body: (
            <>
              Because the slot is just a prop named <code>children</code>, you
              can also accept it explicitly and place it anywhere — useful when a
              wrapper has its own header or footer around the hole.
            </>
          ),
        },
        {
          kind: 'code',
          lang: 'tsx',
          code: `function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="panel">
      <header className="panel__title">{title}</header>
      <div className="panel__body">{children}</div>
    </section>
  )
}`,
        },
        {
          kind: 'callout',
          variant: 'tip',
          title: 'When to use it (IRL)',
          body: (
            <>
              Reach for <code>children</code> for any{' '}
              <strong>layout / wrapper / chrome</strong> component:{' '}
              <code>Card</code>, <code>Modal</code>, <code>Page</code>,{' '}
              <code>Section</code>, list rows, toolbars. If a component's job is
              "draw a box around whatever you give me," it should take{' '}
              <code>children</code>, not a pile of content props.
            </>
          ),
        },
        {
          kind: 'callout',
          variant: 'warn',
          title: 'Pitfall',
          body: (
            <>
              Don't reach for context or a deep prop chain just to render
              something three levels down. If the parent already <em>has</em>{' '}
              the JSX, pass it as <code>children</code> and let the intermediate
              components stay oblivious. Lifting content into{' '}
              <code>children</code> is the cheapest fix for prop-drilling.
            </>
          ),
        },
      ],
    },
    {
      slug: 'compound-components',
      title: 'Compound components',
      summary: 'Related components that share implicit state through Context.',
      blocks: [
        {
          kind: 'prose',
          body: (
            <>
              Compound components are a set of pieces that only make sense
              together — <code>&lt;Tabs&gt;</code> with{' '}
              <code>&lt;Tabs.Tab&gt;</code>, or <code>&lt;Select&gt;</code> with{' '}
              <code>&lt;Option&gt;</code>. The parent holds the state and shares
              it <strong>implicitly</strong> via Context, so the caller wires up
              structure declaratively without ever touching the wiring. The
              markup reads like HTML; the state lives in one place.
            </>
          ),
        },
        {
          kind: 'code',
          filename: 'Tabs.tsx',
          lang: 'tsx',
          code: `import { createContext, useContext, useState, type ReactNode } from 'react'

interface TabsContextValue {
  active: string
  setActive: (id: string) => void
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabs() {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error('<Tabs.Tab> must be rendered inside <Tabs>')
  return ctx
}

export function Tabs({
  defaultTab,
  children,
}: {
  defaultTab: string
  children: ReactNode
}) {
  const [active, setActive] = useState(defaultTab)
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div className="tabs" role="tablist">
        {children}
      </div>
    </TabsContext.Provider>
  )
}

function Tab({ id, children }: { id: string; children: ReactNode }) {
  const { active, setActive } = useTabs()
  const selected = active === id
  return (
    <button
      role="tab"
      aria-selected={selected}
      className={selected ? 'tab tab--active' : 'tab'}
      onClick={() => setActive(id)}
    >
      {children}
    </button>
  )
}

// Attach the sub-component so callers write <Tabs.Tab>.
Tabs.Tab = Tab`,
        },
        {
          kind: 'code',
          lang: 'tsx',
          caption: 'Usage reads like declarative markup — no manual state wiring.',
          code: `<Tabs defaultTab="overview">
  <Tabs.Tab id="overview">Overview</Tabs.Tab>
  <Tabs.Tab id="pricing">Pricing</Tabs.Tab>
  <Tabs.Tab id="faq">FAQ</Tabs.Tab>
</Tabs>`,
        },
        {
          kind: 'callout',
          variant: 'tip',
          title: 'When to use it (IRL)',
          body: (
            <>
              When you ship a small family of components that are always used
              together and need to coordinate one piece of state. This is exactly
              how <strong>Radix</strong> / <strong>Reach UI</strong> model{' '}
              <code>Tabs</code>, <code>Accordion</code>,{' '}
              <code>&lt;Select&gt;&lt;Option&gt;</code>, and menus. Great when you
              want callers to control <em>structure</em> while you control{' '}
              <em>behavior</em>.
            </>
          ),
        },
        {
          kind: 'callout',
          variant: 'danger',
          title: 'Gotcha',
          body: (
            <>
              Sub-components break if rendered outside the provider — always
              guard the context read and throw a clear error (the{' '}
              <code>useTabs</code> hook above). Attach children with{' '}
              <code>Tabs.Tab = Tab</code> rather than defining them inline, and
              note that a Context-based design couples consumers to{' '}
              <em>being inside the tree</em> — you can't lift one{' '}
              <code>&lt;Tab&gt;</code> out and render it standalone.
            </>
          ),
        },
      ],
    },
    {
      slug: 'slots-named-composition',
      title: 'Slots / named composition',
      summary: 'Pass elements as props to fill multiple named regions of a layout.',
      blocks: [
        {
          kind: 'prose',
          body: (
            <>
              <code>children</code> gives you exactly one hole. When a component
              has several distinct regions — a <code>header</code>, a{' '}
              <code>sidebar</code>, a <code>main</code> area — you expose a{' '}
              <strong>named prop per slot</strong> and accept{' '}
              <code>ReactNode</code> for each. This is the React analog of Vue's
              named slots or web-component <code>&lt;slot name&gt;</code>.
            </>
          ),
        },
        {
          kind: 'code',
          filename: 'Layout.tsx',
          lang: 'tsx',
          code: `import type { ReactNode } from 'react'

interface LayoutProps {
  header: ReactNode
  sidebar: ReactNode
  main: ReactNode
  footer?: ReactNode
}

export function Layout({ header, sidebar, main, footer }: LayoutProps) {
  return (
    <div className="layout">
      <header className="layout__header">{header}</header>
      <aside className="layout__sidebar">{sidebar}</aside>
      <main className="layout__main">{main}</main>
      {footer && <footer className="layout__footer">{footer}</footer>}
    </div>
  )
}`,
        },
        {
          kind: 'code',
          lang: 'tsx',
          code: `<Layout
  header={<TopBar user={user} />}
  sidebar={<NavTree items={nav} />}
  main={<Dashboard data={data} />}
  footer={<StatusLine />}
/>`,
        },
        {
          kind: 'callout',
          variant: 'tip',
          title: 'When to use it (IRL)',
          body: (
            <>
              Use named slots when there are <strong>multiple</strong> fill
              points and their{' '}
              <strong>order/position is fixed by the layout</strong>, not the
              caller — app shells, page templates, modals with{' '}
              <code>title</code> / <code>body</code> / <code>actions</code>,
              split panes. Use plain <code>children</code> when there's one hole
              and the caller decides what flows into it. Rule of thumb: one
              region → <code>children</code>; several named regions → slot props.
            </>
          ),
        },
        {
          kind: 'callout',
          variant: 'info',
          title: 'Note',
          body: (
            <>
              Slots accept any <code>ReactNode</code> — strings, fragments,
              arrays, or whole subtrees. Keep them presentational: the layout
              positions them, it shouldn't reach into them. If you find yourself
              passing five-plus slots, consider compound components instead so
              the structure lives in JSX.
            </>
          ),
        },
      ],
    },

    // ──────────────────────────── LOGIC REUSE ────────────────────────────
    {
      slug: 'custom-hooks',
      title: 'Custom hooks',
      summary: 'Extract stateful logic into reusable functions — the modern default.',
      blocks: [
        {
          kind: 'prose',
          body: (
            <>
              A custom hook is just a function whose name starts with{' '}
              <code>use</code> and that calls other hooks. It's the modern,
              default answer to "how do I reuse stateful logic?" — and it
              replaced the vast majority of HOC and render-prop usage. You pull
              the <code>useState</code>/<code>useEffect</code>/<code>useRef</code>{' '}
              machinery out of the component and into a named function, then call
              it like any other hook. No wrapper components, no extra nesting in
              the tree.
            </>
          ),
        },
        {
          kind: 'code',
          filename: 'useToggle.ts',
          lang: 'ts',
          code: `import { useCallback, useState } from 'react'

export function useToggle(initial = false) {
  const [on, setOn] = useState(initial)
  const toggle = useCallback(() => setOn((v) => !v), [])
  const setTrue = useCallback(() => setOn(true), [])
  const setFalse = useCallback(() => setOn(false), [])
  return { on, toggle, setTrue, setFalse } as const
}`,
        },
        {
          kind: 'code',
          filename: 'useLocalStorage.ts',
          lang: 'ts',
          caption: 'A hook can encapsulate effects + browser APIs, not just state.',
          code: `import { useEffect, useState } from 'react'

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : initial
    } catch {
      return initial
    }
  })

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue] as const
}`,
        },
        {
          kind: 'code',
          filename: 'useFetch.ts',
          lang: 'ts',
          caption: 'Aborts in-flight requests on unmount / key change.',
          code: `import { useEffect, useState } from 'react'

interface FetchState<T> {
  data: T | null
  error: Error | null
  loading: boolean
}

export function useFetch<T>(url: string): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    error: null,
    loading: true,
  })

  useEffect(() => {
    const controller = new AbortController()
    setState({ data: null, error: null, loading: true })

    fetch(url, { signal: controller.signal })
      .then((res) => res.json() as Promise<T>)
      .then((data) => setState({ data, error: null, loading: false }))
      .catch((error: Error) => {
        if (error.name !== 'AbortError')
          setState({ data: null, error, loading: false })
      })

    return () => controller.abort()
  }, [url])

  return state
}`,
        },
        {
          kind: 'callout',
          variant: 'tip',
          title: 'When to use it (IRL)',
          body: (
            <>
              Basically <strong>any time two components share logic</strong> —
              data fetching, subscriptions, form state, media queries,
              debouncing, "is online," local-storage sync. It's also how you keep
              a component's body readable: name the concern (<code>useFetch</code>,{' '}
              <code>useDebounce</code>) and the call site documents itself.
            </>
          ),
        },
        {
          kind: 'callout',
          variant: 'key',
          title: 'Key idea',
          body: (
            <>
              Custom hooks give you{' '}
              <strong>composition without wrapper nesting</strong>. HOCs and
              render props both add nodes to the tree (and "wrapper hell"); hooks
              share <em>behavior</em> while the component owns its own JSX. You
              compose hooks by calling them — <code>useFetch</code> can call{' '}
              <code>useState</code>, your hook can call <code>useFetch</code> —
              flat, not nested.
            </>
          ),
        },
        {
          kind: 'callout',
          variant: 'warn',
          title: 'Pitfall — Rules of Hooks',
          body: (
            <>
              A custom hook <em>is</em> a hook, so the rules apply: call it only
              at the <strong>top level</strong> of a component or another hook,{' '}
              <strong>never</strong> inside conditionals, loops, or nested
              functions, and only from React functions. Breaking call order
              corrupts the state slots. Enable{' '}
              <code>eslint-plugin-react-hooks</code> and let it police this.
            </>
          ),
        },
      ],
    },
    {
      slug: 'higher-order-components',
      title: 'Higher-order components (HOC)',
      summary: 'A function that takes a component and returns an enhanced one.',
      blocks: [
        {
          kind: 'prose',
          body: (
            <>
              A higher-order component is a function with the shape{' '}
              <code>(Component) =&gt; EnhancedComponent</code>. It wraps the
              target, injects extra props or behavior, and returns a new
              component. Before hooks this was the main way to share
              cross-cutting logic. It's no longer the default, but it's still a
              clean fit for a few cases — and you'll meet it in library APIs like
              React Redux's classic <code>connect()</code> or{' '}
              <code>React.memo</code> (itself an HOC).
            </>
          ),
        },
        {
          kind: 'code',
          filename: 'withAuth.tsx',
          lang: 'tsx',
          code: `import hoistNonReactStatics from 'hoist-non-react-statics'
import { forwardRef, type ComponentType, type Ref } from 'react'
import { useAuth } from './useAuth'

export function withAuth<P extends object>(Wrapped: ComponentType<P>) {
  // forwardRef so refs still reach the inner component.
  const WithAuth = forwardRef(function WithAuth(props: P, ref: Ref<unknown>) {
    const { user } = useAuth()
    if (!user) return <LoginRedirect />
    return <Wrapped {...props} ref={ref} user={user} />
  })

  // Helpful name in React DevTools and error overlays.
  WithAuth.displayName = \`withAuth(\${Wrapped.displayName ?? Wrapped.name ?? 'Component'})\`

  // Copy over non-React statics (e.g. Page.getLayout) the wrapper would hide.
  return hoistNonReactStatics(WithAuth, Wrapped)
}`,
        },
        {
          kind: 'code',
          lang: 'tsx',
          code: `const Dashboard = (props: DashboardProps) => <main>{/* ... */}</main>

// Enhanced once, at module scope — never inside render.
export default withAuth(Dashboard)`,
        },
        {
          kind: 'callout',
          variant: 'tip',
          title: 'When to use it (IRL)',
          body: (
            <>
              Still genuinely useful for{' '}
              <strong>cross-cutting concerns</strong> that wrap rendering — auth
              gates, analytics page tracking, theming/i18n injection, error
              boundaries — and for <strong>library APIs</strong> that need to
              enhance an arbitrary user component (think <code>connect</code>,{' '}
              <code>withRouter</code>). If the logic <em>can</em> be a hook,
              prefer a hook; reach for an HOC when you must wrap a component you
              don't own or render.
            </>
          ),
        },
        {
          kind: 'callout',
          variant: 'danger',
          title: 'Gotcha — the four things people forget',
          body: (
            <>
              <strong>1.</strong> Set <code>displayName</code> or DevTools shows
              "Anonymous." <strong>2.</strong> Forward refs with{' '}
              <code>forwardRef</code>, otherwise the wrapper swallows them.{' '}
              <strong>3.</strong> Hoist non-React statics with{' '}
              <code>hoist-non-react-statics</code> so static fields survive the
              wrap. <strong>4.</strong> <em>Never</em> create the HOC inside
              another component's <code>render</code> — that builds a brand-new
              component type every render and remounts the subtree (losing all
              its state). Apply HOCs at module scope.
            </>
          ),
        },
      ],
    },
    {
      slug: 'render-props',
      title: 'Render props',
      summary: 'Pass a function that returns JSX so a component can share its state.',
      blocks: [
        {
          kind: 'prose',
          body: (
            <>
              A render prop is a prop whose value is a{' '}
              <strong>function that returns JSX</strong>. The component owns some
              internal state and <em>calls</em> the function with it, letting the
              caller decide what to render. Often this function is passed as{' '}
              <code>children</code> (the "function as child" form). It's the same
              power as a custom hook, expressed as JSX instead of a call.
            </>
          ),
        },
        {
          kind: 'code',
          filename: 'MouseTracker.tsx',
          lang: 'tsx',
          code: `import { useState, type ReactNode } from 'react'

interface Point {
  x: number
  y: number
}

export function MouseTracker({
  children,
}: {
  children: (pos: Point) => ReactNode
}) {
  const [pos, setPos] = useState<Point>({ x: 0, y: 0 })
  return (
    <div
      style={{ height: '100%' }}
      onMouseMove={(e) => setPos({ x: e.clientX, y: e.clientY })}
    >
      {/* The component owns the state; the caller owns the rendering. */}
      {children(pos)}
    </div>
  )
}`,
        },
        {
          kind: 'code',
          lang: 'tsx',
          caption: 'Function-as-child: the caller renders whatever it wants from x/y.',
          code: `<MouseTracker>
  {({ x, y }) => (
    <p>
      The cursor is at ({x}, {y})
    </p>
  )}
</MouseTracker>`,
        },
        {
          kind: 'callout',
          variant: 'tip',
          title: 'When to use it (IRL)',
          body: (
            <>
              When <strong>what to render depends on internal state the
              consumer controls</strong>, and that state is naturally tied to a
              subtree — virtualized lists (<code>react-window</code> hands each
              row an index), measurement helpers, drag-and-drop, downshift-style
              autocompletes. Render props shine where the data and the markup
              must live in the same JSX scope.
            </>
          ),
        },
        {
          kind: 'callout',
          variant: 'info',
          title: 'Note — relationship to hooks',
          body: (
            <>
              For pure logic reuse, a{' '}
              <strong>custom hook does the same job with less ceremony</strong>{' '}
              and no extra tree node, so hooks have largely superseded render
              props. The pattern still wins when the shared thing must{' '}
              <em>also render something around your output</em> (an event
              surface, a portal, a context provider) — i.e. when it's not just
              data but data <em>plus</em> JSX context.
            </>
          ),
        },
      ],
    },

    // ───────────────────────────── STRUCTURAL ─────────────────────────────
    {
      slug: 'container-presentational',
      title: 'Container / Presentational',
      summary: 'Split data-fetching (smart) from rendering (dumb) for testability.',
      blocks: [
        {
          kind: 'prose',
          body: (
            <>
              This pattern splits a feature into two layers. A{' '}
              <strong>container</strong> ("smart") owns data fetching, state, and
              side effects, then passes plain data down. A{' '}
              <strong>presentational</strong> ("dumb") component receives props
              and only renders — no fetching, no global state. The payoff is a
              pure, prop-driven view you can test and storybook in isolation.
            </>
          ),
        },
        {
          kind: 'code',
          filename: 'UserList.tsx',
          lang: 'tsx',
          code: `// ── Presentational: pure, prop-driven, trivially testable ──
interface User {
  id: string
  name: string
}

export function UserList({ users }: { users: User[] }) {
  return (
    <ul>
      {users.map((u) => (
        <li key={u.id}>{u.name}</li>
      ))}
    </ul>
  )
}

// ── Container: owns the data, renders the dumb view ──
import { useFetch } from './useFetch'

export function UserListContainer() {
  const { data, loading, error } = useFetch<User[]>('/api/users')
  if (loading) return <Spinner />
  if (error) return <ErrorBanner error={error} />
  return <UserList users={data ?? []} />
}`,
        },
        {
          kind: 'callout',
          variant: 'tip',
          title: 'When to use it (IRL)',
          body: (
            <>
              When you want the view layer to be{' '}
              <strong>dead-simple to test and reuse</strong> — pass it props,
              assert on output, no mocking the network. Handy for design-system
              components, Storybook, and screens whose rendering you want to
              share across multiple data sources.
            </>
          ),
        },
        {
          kind: 'callout',
          variant: 'info',
          title: 'Note',
          body: (
            <>
              The strict container/presentational split is{' '}
              <strong>less common post-hooks</strong> — a custom hook (
              <code>useUsers()</code>) often replaces the container entirely, and
              the line between the two layers blurs. Keep the spirit (pure,
              prop-driven views are easy to test) without forcing a wrapper
              component when a hook will do.
            </>
          ),
        },
      ],
    },
    {
      slug: 'provider-pattern',
      title: 'Provider pattern',
      summary: 'Context for cross-tree DI, paired with a guarded custom hook.',
      blocks: [
        {
          kind: 'prose',
          body: (
            <>
              The provider pattern uses Context to do{' '}
              <strong>dependency injection across the tree</strong> — theme,
              auth, i18n, a feature-flag client — so deep components read it
              without prop-drilling. The polished version pairs the raw context
              with a <strong>custom hook</strong> (<code>useTheme</code>) that
              hides <code>useContext</code>, gives consumers a clean API, and{' '}
              <strong>throws if used outside the provider</strong> so mistakes
              fail loudly.
            </>
          ),
        },
        {
          kind: 'code',
          filename: 'ThemeProvider.tsx',
          lang: 'tsx',
          code: `import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  toggle: () => void
}

// Internal — consumers never import this directly.
const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')

  // Memoize so the value identity is stable across renders.
  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      toggle: () => setTheme((t) => (t === 'light' ? 'dark' : 'light')),
    }),
    [theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

// The public API: a hook that guards against misuse.
export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used within a <ThemeProvider>')
  }
  return ctx
}`,
        },
        {
          kind: 'code',
          lang: 'tsx',
          caption: 'Consumers get a clean hook and never touch Context directly.',
          code: `function ThemeToggle() {
  const { theme, toggle } = useTheme()
  return <button onClick={toggle}>Theme: {theme}</button>
}

function App() {
  return (
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>
  )
}`,
        },
        {
          kind: 'callout',
          variant: 'tip',
          title: 'When to use it (IRL)',
          body: (
            <>
              For <strong>app-wide, slowly-changing</strong> dependencies that
              many components need: current user/session, theme, locale, feature
              flags, a configured API client. The provider+hook combo is the
              idiomatic way to expose these, and it's exactly how most design
              systems ship theming.
            </>
          ),
        },
        {
          kind: 'callout',
          variant: 'warn',
          title: 'Pitfall',
          body: (
            <>
              Every consumer re-renders when the context value's identity
              changes — so <code>useMemo</code> the value and don't cram
              unrelated, fast-changing state into one mega-context. Split
              high-frequency state into its own provider (or a different state
              tool). Context is{' '}
              <strong>injection, not a performance-optimized store</strong>.
            </>
          ),
        },
      ],
    },
    {
      slug: 'state-reducer',
      title: 'State reducer pattern',
      summary: "Let consumers override a component's internal state transitions.",
      blocks: [
        {
          kind: 'prose',
          body: (
            <>
              Popularized by Kent C. Dodds, the state reducer pattern gives
              consumers <strong>control over how internal state changes</strong>{' '}
              without forking the component. The component manages state with{' '}
              <code>useReducer</code> and exposes its actions, then accepts a{' '}
              <code>reducer</code> prop. Instead of running its built-in reducer
              directly, it runs whatever reducer the consumer passed (defaulting
              to its own), so the consumer can accept, tweak, or veto any
              transition. It's the most flexible "let users customize behavior"
              knob there is.
            </>
          ),
        },
        {
          kind: 'code',
          filename: 'useToggleReducer.ts',
          lang: 'ts',
          code: `import { useReducer } from 'react'

interface ToggleState {
  on: boolean
}

type ToggleAction = { type: 'toggle' } | { type: 'reset' }

// The component's *internal* reducer — the default behavior.
// Exported so consumers can delegate to it for cases they don't override.
export function internalReducer(
  state: ToggleState,
  action: ToggleAction,
): ToggleState {
  switch (action.type) {
    case 'toggle':
      return { on: !state.on }
    case 'reset':
      return { on: false }
    default:
      return state
  }
}

type Reducer = (state: ToggleState, action: ToggleAction) => ToggleState

export function useToggle({
  // Consumers inject a reducer; default = use the internal one as-is.
  reducer = internalReducer,
}: { reducer?: Reducer } = {}) {
  const [state, dispatch] = useReducer(reducer, { on: false })
  return {
    on: state.on,
    toggle: () => dispatch({ type: 'toggle' }),
    reset: () => dispatch({ type: 'reset' }),
  }
}`,
        },
        {
          kind: 'code',
          lang: 'tsx',
          caption: 'Consumer enforces a rule (max 4 toggles) without forking the hook.',
          code: `import { useRef } from 'react'
import { internalReducer, useToggle } from './useToggleReducer'

function ToggleWithLimit() {
  const clicks = useRef(0)

  const { on, toggle } = useToggle({
    reducer(state, action) {
      if (action.type === 'toggle' && clicks.current >= 4) {
        return state // veto: ignore further toggles
      }
      if (action.type === 'toggle') clicks.current++
      return internalReducer(state, action) // otherwise default behavior
    },
  })

  return <button onClick={toggle}>{on ? 'On' : 'Off'}</button>
}`,
        },
        {
          kind: 'callout',
          variant: 'tip',
          title: 'When to use it (IRL)',
          body: (
            <>
              In <strong>flexible component libraries</strong> where you can't
              anticipate every consumer's rule — "don't let this menu close on
              outer click," "cap the counter," "keep at least one tab open." It's
              the escape hatch that prevents endless boolean props (
              <code>closeOnSelect</code>, <code>closeOnBlur</code>, …) by letting
              users own the transition logic instead.
            </>
          ),
        },
        {
          kind: 'callout',
          variant: 'info',
          title: 'Note',
          body: (
            <>
              Export your <code>internalReducer</code> (or a set of action-type
              constants) so consumers can call the default behavior for actions
              they don't want to override. Without that, they'd have to
              re-implement your whole reducer to tweak one case.
            </>
          ),
        },
      ],
    },
    {
      slug: 'controlled-uncontrolled',
      title: 'Controlled vs uncontrolled',
      summary: 'Expose both a controlled (value/onChange) and uncontrolled (defaultValue) API.',
      blocks: [
        {
          kind: 'prose',
          body: (
            <>
              A <strong>controlled</strong> component is driven entirely by
              props: the parent owns <code>value</code> and updates it via{' '}
              <code>onChange</code>. An <strong>uncontrolled</strong> one owns
              its own state internally; the parent just seeds it with{' '}
              <code>defaultValue</code> and reads it later via a{' '}
              <code>ref</code>. Well-designed inputs support{' '}
              <strong>both</strong> — controlled when you need full power
              (validation, formatting, derived UI), uncontrolled when you just
              want it to work with zero wiring.
            </>
          ),
        },
        {
          kind: 'code',
          filename: 'TextField.tsx',
          lang: 'tsx',
          caption: 'Controlled when `value` is provided; otherwise uncontrolled.',
          code: `import { forwardRef } from 'react'

interface TextFieldProps {
  value?: string // present ⇒ controlled
  defaultValue?: string // present ⇒ uncontrolled
  onChange?: (next: string) => void
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField({ value, defaultValue, onChange }, ref) {
    const isControlled = value !== undefined
    return (
      <input
        ref={ref}
        // Pass exactly one of value / defaultValue — never both.
        {...(isControlled ? { value } : { defaultValue })}
        onChange={(e) => onChange?.(e.target.value)}
      />
    )
  },
)`,
        },
        {
          kind: 'code',
          lang: 'tsx',
          code: `// Controlled — parent owns the state, can validate / transform.
function ControlledExample() {
  const [name, setName] = useState('')
  return <TextField value={name} onChange={setName} />
}

// Uncontrolled — no state; read the value on submit via the ref.
function UncontrolledExample() {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <form onSubmit={() => console.log(ref.current?.value)}>
      <TextField defaultValue="Ada" ref={ref} />
    </form>
  )
}`,
        },
        {
          kind: 'callout',
          variant: 'tip',
          title: 'When to use it (IRL)',
          body: (
            <>
              <strong>Controlled</strong> when the value feeds other UI — live
              validation, character counts, formatting, dependent fields, "search
              as you type." <strong>Uncontrolled</strong> for simple forms where
              you only care about the final value (often paired with a form lib
              like React Hook Form, which leans uncontrolled for performance).
            </>
          ),
        },
        {
          kind: 'callout',
          variant: 'danger',
          title: "Gotcha — don't switch modes mid-life",
          body: (
            <>
              React warns if an input flips between controlled and uncontrolled —
              usually caused by an initial <code>value</code> of{' '}
              <code>undefined</code>/<code>null</code> that later becomes a
              string. Pick one mode per mount: if controlled, default the value
              to <code>''</code> (<code>value=&#123;name ?? ''&#125;</code>),
              never <code>undefined</code>. Decide <code>isControlled</code> once
              and don't let it change.
            </>
          ),
        },
      ],
    },
    {
      slug: 'polymorphic-as',
      title: 'Polymorphic components',
      summary: 'An `as` prop swaps the rendered element while keeping behavior.',
      blocks: [
        {
          kind: 'prose',
          body: (
            <>
              A polymorphic component keeps its{' '}
              <strong>behavior and styling</strong> but lets the caller choose{' '}
              <strong>which element or component it renders</strong> via an{' '}
              <code>as</code> prop. A <code>&lt;Button&gt;</code> that should
              sometimes be a real <code>&lt;a&gt;</code> (for navigation, so it's
              a proper link), sometimes a router <code>&lt;Link&gt;</code>,
              sometimes a <code>&lt;button&gt;</code> — without duplicating the
              component. This is how Chakra, MUI, and Radix expose{' '}
              <code>as</code> / <code>asChild</code>.
            </>
          ),
        },
        {
          kind: 'code',
          filename: 'Box.tsx',
          lang: 'tsx',
          caption: 'A typed-ish polymorphic component: props follow the chosen element.',
          code: `import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react'

type PolymorphicProps<T extends ElementType> = {
  as?: T
  children?: ReactNode
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'children'>

export function Box<T extends ElementType = 'div'>({
  as,
  children,
  ...rest
}: PolymorphicProps<T>) {
  const Component = as ?? 'div'
  return <Component {...rest}>{children}</Component>
}`,
        },
        {
          kind: 'code',
          lang: 'tsx',
          caption: 'TypeScript infers the right props from `as` — href is valid only on the anchor.',
          code: `// Renders a <div> (default)
<Box className="card">Hello</Box>

// Renders an <a> — TS now accepts href, target, rel, …
<Box as="a" href="/pricing" target="_blank" rel="noreferrer">
  Pricing
</Box>

// Renders a button — TS accepts type, disabled, onClick, …
<Box as="button" type="submit" disabled>
  Save
</Box>`,
        },
        {
          kind: 'callout',
          variant: 'tip',
          title: 'When to use it (IRL)',
          body: (
            <>
              For <strong>design-system primitives</strong> — <code>Box</code>,{' '}
              <code>Text</code>, <code>Button</code>, <code>Stack</code> — where
              one set of styles/behavior must render as different semantic tags
              depending on context (a "button" that's really a link, headings
              that vary <code>h1</code>–<code>h6</code>). It keeps the API tiny
              while preserving correct, accessible HTML.
            </>
          ),
        },
        {
          kind: 'callout',
          variant: 'warn',
          title: 'Pitfall — the TypeScript cost',
          body: (
            <>
              Fully type-safe polymorphism (correct props per <code>as</code>,{' '}
              <em>plus</em> a forwarded, correctly-typed <code>ref</code>) gets
              genuinely hairy — generic helper types, <code>as const</code>{' '}
              gymnastics, and slower type-checking. Weigh it: many teams keep a
              single shared <code>PolymorphicProps</code> helper, and Radix
              sidesteps the whole thing with <code>asChild</code> +{' '}
              <code>Slot</code> (merge props onto the child you already passed)
              instead of an <code>as</code> prop.
            </>
          ),
        },
        {
          kind: 'callout',
          variant: 'key',
          title: 'The modern take',
          body: (
            <>
              Since hooks landed (React 16.8, 2019),{' '}
              <strong>custom hooks are the default for logic reuse</strong> —
              they compose flat, with no wrapper nesting. HOCs and render props
              are now <strong>niche</strong>: reach for them at{' '}
              <strong>library boundaries</strong> (enhancing a component you
              don't own, or shipping a public API like <code>connect</code>), or
              when a concern <strong>can't be expressed as a hook</strong> — e.g.
              error boundaries still require a class component (or a library
              wrapper). Default to hooks; keep the rest in your toolbox for the
              edges.
            </>
          ),
        },
      ],
    },
  ],
}
