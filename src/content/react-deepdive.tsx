import type { TopicGroup } from '../types/content'
import { StateSharingDiagram } from '../components/diagrams'

// Authored in task #4 — "React Deep-Dive" pillar.
// A typed data module: an array of topics, each an ordered list of blocks.
export const reactDeepDive: TopicGroup = {
  id: 'react-deepdive',
  title: 'React Deep-Dive',
  label: 'React Deep-Dive',
  icon: '⚛️',
  topics: [
    // ──────────────────────────── PERFORMANCE ────────────────────────────
    {
      slug: 'rerenders-and-memo',
      title: 'Performance: what causes re-renders',
      summary:
        'Why components re-render, and the memo / useMemo / useCallback toolkit to stop the wasteful ones.',
      blocks: [
        {
          kind: 'prose',
          body: (
            <>
              A component re-renders for exactly three reasons: its own{' '}
              <strong>state changes</strong>, its <strong>props change</strong>,
              or its <strong>parent re-renders</strong>. That last one surprises
              people — when a parent renders, React re-runs <em>all</em> of its
              children by default, regardless of whether their props actually
              changed. "Re-render" just means React calls your function again and{' '}
              <strong>diffs the result against the previous virtual DOM</strong>;
              only the differences are committed to the real DOM. So a re-render
              is not automatically a repaint — but the function call, the diff,
              and any child re-renders it triggers still cost CPU.
            </>
          ),
        },
        {
          kind: 'prose',
          body: (
            <>
              React gives you three tools to skip work that doesn't matter.{' '}
              <code>React.memo</code> wraps a component so it{' '}
              <strong>skips re-rendering when its props are shallow-equal</strong>{' '}
              to last time. <code>useMemo</code> <strong>caches a computed value</strong>{' '}
              between renders so an expensive calculation only re-runs when its
              dependencies change. <code>useCallback</code> does the same for a
              function — it returns a <strong>stable function identity</strong> so
              memoized children (and effect/dependency arrays) don't see a "new"
              function every render.
            </>
          ),
        },
        {
          kind: 'heading',
          text: 'Symptom → fix: a child re-rendering for no reason',
          id: 'memo-symptom-fix',
        },
        {
          kind: 'prose',
          body: (
            <>
              The classic trap: a parent passes an{' '}
              <strong>inline arrow function</strong> as a prop. Even though the
              logic is identical, a brand-new function object is created on every
              render, so the prop is never shallow-equal — and{' '}
              <code>React.memo</code> on the child can't help, because its props{' '}
              <em>did</em> change by identity.
            </>
          ),
        },
        {
          kind: 'code',
          filename: 'Symptom.tsx',
          lang: 'tsx',
          caption: 'ExpensiveList re-renders on every keystroke, even though its data never changes.',
          code: `import { useState } from 'react'

function Parent() {
  const [text, setText] = useState('')

  // ⛔ A new function object every render → breaks memoization downstream.
  return (
    <>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <ExpensiveList items={items} onSelect={(id) => console.log(id)} />
    </>
  )
}`,
        },
        {
          kind: 'code',
          filename: 'Fix.tsx',
          lang: 'tsx',
          caption: 'Stable callback + memoized child: ExpensiveList stays put while you type.',
          code: `import { memo, useCallback, useState } from 'react'

// 1) Memo the child so it only re-renders when *its* props change by identity.
const ExpensiveList = memo(function ExpensiveList({
  items,
  onSelect,
}: {
  items: Item[]
  onSelect: (id: string) => void
}) {
  return (
    <ul>
      {items.map((it) => (
        <li key={it.id} onClick={() => onSelect(it.id)}>
          {it.label}
        </li>
      ))}
    </ul>
  )
})

function Parent() {
  const [text, setText] = useState('')

  // 2) Stabilize the function identity so memo can actually skip the child.
  const handleSelect = useCallback((id: string) => {
    console.log(id)
  }, [])

  return (
    <>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <ExpensiveList items={items} onSelect={handleSelect} />
    </>
  )
}`,
        },
        {
          kind: 'prose',
          body: (
            <>
              Note that <strong>both halves are required</strong>:{' '}
              <code>useCallback</code> alone does nothing visible unless the child
              is wrapped in <code>React.memo</code>, and <code>React.memo</code>{' '}
              alone is defeated the moment any prop (like that inline handler) is
              recreated each render. The same logic applies to <code>useMemo</code>:
              memoize a non-primitive prop (an object or array literal) so the
              memoized child sees a stable reference.
            </>
          ),
        },
        {
          kind: 'callout',
          variant: 'tip',
          title: 'When to use it (IRL)',
          body: (
            <>
              Reach for these when a <strong>genuinely expensive</strong> subtree
              re-renders on unrelated state changes — large tables/lists, charts,
              a heavy editor — or when a child is wrapped in{' '}
              <code>React.memo</code> and you need its object/function props to
              stay referentially stable. <code>useMemo</code> for costly
              derivations (sorting/filtering thousands of rows);{' '}
              <code>useCallback</code> for handlers passed to memoized children or
              listed in another hook's dependency array.
            </>
          ),
        },
        {
          kind: 'callout',
          variant: 'warn',
          title: "Pitfall — don't memo everything",
          body: (
            <>
              Memoization is <strong>not free</strong>. Every{' '}
              <code>useMemo</code>/<code>useCallback</code> adds a dependency
              array to compare and a value to retain, and <code>React.memo</code>{' '}
              adds a props comparison on every render. Most renders are{' '}
              <strong>cheap</strong> — re-running a small function and diffing a
              handful of nodes is microseconds. Blanket-memoizing makes code
              noisier and can be a net <em>loss</em>.{' '}
              <strong>Measure first</strong> with the React DevTools Profiler,
              then memoize the proven hot path — not by reflex.
            </>
          ),
        },
        {
          kind: 'callout',
          variant: 'info',
          title: 'React 19: the Compiler often makes this manual work obsolete',
          body: (
            <>
              The <strong>React Compiler</strong> (shipped alongside React 19)
              automatically memoizes components and values at build time —
              effectively inserting the equivalent of <code>React.memo</code>,{' '}
              <code>useMemo</code>, and <code>useCallback</code> for you. Where
              it's enabled, you write straightforward code and the compiler
              handles referential stability, dramatically reducing the need for
              hand-written <code>useMemo</code>/<code>useCallback</code>. Treat
              manual memoization as the fallback for hot paths the compiler can't
              cover (or projects that haven't adopted it yet).
            </>
          ),
        },
      ],
    },

    // ─────────────────────── CODE-SPLITTING & CONCURRENCY ───────────────────────
    {
      slug: 'code-splitting-suspense',
      title: 'Code-splitting, Suspense & responsiveness',
      summary:
        'Ship less JS up front with lazy/Suspense, and keep the UI responsive with useTransition / useDeferredValue.',
      blocks: [
        {
          kind: 'prose',
          body: (
            <>
              Two different problems, both about <strong>perceived speed</strong>.{' '}
              <em>Code-splitting</em> shrinks the JavaScript a user downloads
              before the app becomes interactive, by loading heavy pieces on
              demand. <em>Concurrency features</em> (<code>useTransition</code>,{' '}
              <code>useDeferredValue</code>) keep the UI responsive while React
              works on a large, low-priority update — so typing never feels stuck
              behind an expensive re-render.
            </>
          ),
        },
        {
          kind: 'heading',
          text: 'React.lazy + Suspense (route-level splitting)',
          id: 'lazy-suspense',
        },
        {
          kind: 'prose',
          body: (
            <>
              <code>React.lazy</code> turns a dynamic <code>import()</code> into a
              component that loads its code the first time it renders.{' '}
              <code>&lt;Suspense&gt;</code> supplies the{' '}
              <strong>fallback</strong> shown while that chunk is in flight. The
              highest-leverage place to apply this is at the{' '}
              <strong>route boundary</strong>: each page becomes its own bundle,
              so the initial load only ships the landing route.
            </>
          ),
        },
        {
          kind: 'code',
          filename: 'routes.tsx',
          lang: 'tsx',
          caption: 'Each route is its own chunk; the fallback covers the load.',
          code: `import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'

// These modules aren't fetched until their route renders.
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Reports = lazy(() => import('./pages/Reports'))
const Settings = lazy(() => import('./pages/Settings'))

export function AppRoutes() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  )
}`,
        },
        {
          kind: 'heading',
          text: 'useTransition — mark an update as non-urgent',
          id: 'use-transition',
        },
        {
          kind: 'prose',
          body: (
            <>
              <code>useTransition</code> lets you tell React "this state update is{' '}
              <strong>not urgent</strong> — keep the page interactive and render
              it in the background." It returns an <code>isPending</code> flag and
              a <code>startTransition</code> function; updates wrapped in{' '}
              <code>startTransition</code> can be interrupted by more urgent ones
              (like the keystroke that just happened), so the input never freezes.
            </>
          ),
        },
        {
          kind: 'code',
          filename: 'TabSwitcher.tsx',
          lang: 'tsx',
          caption: 'The urgent click feels instant; the heavy tab render happens at low priority.',
          code: `import { useState, useTransition } from 'react'

function TabSwitcher() {
  const [tab, setTab] = useState('home')
  const [isPending, startTransition] = useTransition()

  function selectTab(next: string) {
    // The selected-tab highlight updates urgently…
    startTransition(() => {
      // …while the (potentially heavy) panel switch is interruptible.
      setTab(next)
    })
  }

  return (
    <>
      <TabBar onSelect={selectTab} />
      <div style={{ opacity: isPending ? 0.6 : 1 }}>
        <TabPanel tab={tab} />
      </div>
    </>
  )
}`,
        },
        {
          kind: 'heading',
          text: 'useDeferredValue — defer a derived value',
          id: 'use-deferred-value',
        },
        {
          kind: 'prose',
          body: (
            <>
              When you can't control where the update is dispatched (e.g. the
              value comes straight from a controlled input),{' '}
              <code>useDeferredValue</code> gives you a{' '}
              <strong>lagging copy</strong> of a value. The input stays in sync
              with every keystroke, while the expensive consumer reads the
              deferred value and is allowed to fall behind — React renders the
              stale result first, then catches up.
            </>
          ),
        },
        {
          kind: 'code',
          filename: 'SearchResults.tsx',
          lang: 'tsx',
          caption: 'The text field is always crisp; the filtered list trails it under load.',
          code: `import { useDeferredValue, useMemo, useState } from 'react'

function ProductSearch({ products }: { products: Product[] }) {
  const [query, setQuery] = useState('')
  // deferredQuery lags 'query' when rendering can't keep up.
  const deferredQuery = useDeferredValue(query)

  const matches = useMemo(
    () =>
      products.filter((p) =>
        p.name.toLowerCase().includes(deferredQuery.toLowerCase()),
      ),
    [products, deferredQuery],
  )

  const stale = query !== deferredQuery
  return (
    <>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <ul style={{ opacity: stale ? 0.6 : 1 }}>
        {matches.map((p) => (
          <li key={p.id}>{p.name}</li>
        ))}
      </ul>
    </>
  )
}`,
        },
        {
          kind: 'callout',
          variant: 'tip',
          title: 'When to use it (IRL)',
          body: (
            <>
              <strong>Lazy + Suspense:</strong> heavy routes, modals/dialogs you
              don't always open, big dependencies (a rich-text editor, a charting
              lib, a map) loaded on demand.{' '}
              <strong>useTransition / useDeferredValue:</strong> expensive
              filtered or sorted lists, search-as-you-type over large datasets,
              tab/view switches that render a lot — anywhere a big re-render would
              otherwise make typing or clicking feel laggy. Rule of thumb: use{' '}
              <code>useTransition</code> when you own the <em>setState</em>;{' '}
              <code>useDeferredValue</code> when you only have the <em>value</em>.
            </>
          ),
        },
        {
          kind: 'callout',
          variant: 'info',
          title: 'Note — it makes things responsive, not faster',
          body: (
            <>
              These hooks don't speed up the actual work; they{' '}
              <strong>reprioritize</strong> it so urgent interactions win. The
              heavy render still happens — it just no longer blocks the keystroke.
              If a list is slow because it renders 10,000 rows, the real fix is{' '}
              <strong>virtualization</strong> (next topic), with transitions
              layered on top.
            </>
          ),
        },
      ],
    },

    // ──────────────────────────── VIRTUALIZATION ────────────────────────────
    {
      slug: 'virtualization',
      title: 'Virtualizing big lists',
      summary:
        'Render only the rows that are on screen so a 10,000-row list stays smooth.',
      blocks: [
        {
          kind: 'prose',
          body: (
            <>
              Rendering a list of 10,000 rows means 10,000 DOM nodes (often many
              more), 10,000 components to diff, and a huge layout/paint cost — the
              page janks on mount and on every scroll.{' '}
              <strong>Virtualization</strong> (a.k.a. <strong>windowing</strong>)
              fixes this by rendering <strong>only the rows currently visible</strong>{' '}
              in the viewport, plus a small overscan buffer. As you scroll, rows
              that leave the window are unmounted and new ones mount — so the
              number of live nodes stays roughly constant no matter how long the
              list is.
            </>
          ),
        },
        {
          kind: 'prose',
          body: (
            <>
              The mechanics: a tall spacer element reserves the{' '}
              <strong>full scroll height</strong> (so the scrollbar is correct),
              and the handful of mounted rows are absolutely positioned at their
              computed offsets. Libraries like{' '}
              <code>react-window</code>, <code>react-virtualized</code>, and{' '}
              <code>@tanstack/react-virtual</code> handle the math; you supply the
              row count, the row height, and a renderer for a single row.
            </>
          ),
        },
        {
          kind: 'code',
          filename: 'BigList.tsx',
          lang: 'tsx',
          caption: 'react-window mounts ~12 rows at a time regardless of the 10,000-row total.',
          code: `import { FixedSizeList } from 'react-window'

function BigList({ rows }: { rows: Row[] }) {
  return (
    <FixedSizeList
      height={600}        // viewport height in px
      width="100%"
      itemCount={rows.length} // could be 10,000+
      itemSize={40}       // each row is 40px tall
    >
      {({ index, style }) => (
        // 'style' positions this row at its absolute offset.
        <div style={style} className="row">
          {rows[index].label}
        </div>
      )}
    </FixedSizeList>
  )
}`,
        },
        {
          kind: 'callout',
          variant: 'tip',
          title: 'When to use it (IRL)',
          body: (
            <>
              Any time a list or grid can grow to <strong>hundreds or
              thousands</strong> of items: chat/message logs, data tables,
              feeds, log viewers, big <code>&lt;select&gt;</code> dropdowns, file
              explorers. Below ~100 rows it's usually not worth the complexity —
              plain rendering is fine.
            </>
          ),
        },
        {
          kind: 'callout',
          variant: 'warn',
          title: 'Pitfall — variable heights & Ctrl-F',
          body: (
            <>
              Windowing assumes you can predict each row's size. Variable-height
              rows need a measuring strategy (<code>VariableSizeList</code> or
              TanStack Virtual's dynamic measurement), or scroll position drifts.
              Also remember off-screen rows <strong>aren't in the DOM</strong>, so
              native in-page find (Ctrl-F), anchor links, and naive screenshot
              tests won't see them — provide your own search/jump affordances.
            </>
          ),
        },
      ],
    },

    // ──────────────────────── HOOKS: EVERYDAY ROSTER ────────────────────────
    {
      slug: 'hooks-everyday',
      title: 'The hooks roster: everyday',
      summary:
        'A quick-reference of the hooks you reach for daily — and the two that trip people up.',
      blocks: [
        {
          kind: 'prose',
          body: (
            <>
              These are the hooks you'll use in almost every component. The table
              is a quick mental index; the notes below it clear up the two that
              most often get misused — <code>useRef</code> and{' '}
              <code>useEffect</code>'s cleanup.
            </>
          ),
        },
        {
          kind: 'table',
          headers: ['Hook', "What it's for"],
          caption: 'The everyday roster — reach for these by reflex.',
          rows: [
            [
              <code>useState</code>,
              'Local reactive state; changing it re-renders the component.',
            ],
            [
              <code>useEffect</code>,
              'Synchronize with the outside world (subscriptions, fetches, the DOM) after render.',
            ],
            [
              <code>useContext</code>,
              'Read a Context value provided higher in the tree (no prop-drilling).',
            ],
            [
              <code>useRef</code>,
              'A mutable box that persists across renders without causing one — DOM refs or instance values.',
            ],
            [
              <code>useMemo</code>,
              'Cache an expensive computed value; recompute only when its dependencies change.',
            ],
            [
              <code>useCallback</code>,
              'Cache a function identity so memoized children / dependency arrays stay stable.',
            ],
            [
              <code>useReducer</code>,
              'State via a reducer — better for complex transitions or when next state depends on previous.',
            ],
          ],
        },
        {
          kind: 'callout',
          variant: 'info',
          title: 'useRef is a mutable box that does NOT trigger renders',
          body: (
            <>
              <code>useRef</code> returns a stable object{' '}
              <code>{'{ current }'}</code> that survives re-renders. Writing to{' '}
              <code>ref.current</code> <strong>does not</strong> schedule a
              re-render — that's the whole point. Use it for two things: a handle
              to a DOM node (<code>&lt;input ref={'{inputRef}'} /&gt;</code> then{' '}
              <code>inputRef.current.focus()</code>), or a mutable value you want
              to keep around without rendering on change (a timer id, the previous
              value of a prop, a "has mounted" flag). If a value should appear in
              the UI when it changes, it belongs in state, not a ref.
            </>
          ),
        },
        {
          kind: 'code',
          filename: 'cleanup.tsx',
          lang: 'tsx',
          caption: "useEffect's return is the cleanup — it runs before the next effect and on unmount.",
          code: `import { useEffect, useState } from 'react'

function WindowWidth() {
  const [width, setWidth] = useState(window.innerWidth)

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', onResize)

    // Cleanup: runs before the effect re-runs (deps changed)
    // AND when the component unmounts. Prevents leaked listeners.
    return () => window.removeEventListener('resize', onResize)
  }, []) // [] → set up once, clean up on unmount

  return <span>{width}px</span>
}`,
        },
        {
          kind: 'callout',
          variant: 'warn',
          title: "Pitfall — the dependency array isn't optional",
          body: (
            <>
              A missing dependency array (<code>useEffect(fn)</code> with no
              second arg) runs the effect <strong>after every render</strong> — a
              common source of infinite fetch loops. Pass{' '}
              <code>[]</code> to run once, or list every reactive value the effect
              reads. Let <code>eslint-plugin-react-hooks</code>'{' '}
              <code>exhaustive-deps</code> rule keep the array honest.
            </>
          ),
        },
      ],
    },

    // ──────────────────────── HOOKS: NEW IN REACT 19 ────────────────────────
    {
      slug: 'hooks-new-react19',
      title: 'New hooks (React 19)',
      summary:
        'use(), useActionState, useFormStatus and useOptimistic — the actions/async era of hooks.',
      blocks: [
        {
          kind: 'prose',
          body: (
            <>
              React 19 adds a cluster of hooks built around{' '}
              <strong>async data</strong> and <strong>form "actions."</strong>{' '}
              Together they remove a lot of the manual{' '}
              <code>isLoading</code>/<code>error</code>/<code>isSubmitting</code>{' '}
              bookkeeping you used to wire by hand.
            </>
          ),
        },
        {
          kind: 'heading',
          text: 'use() — read a promise or context (conditionally!)',
          id: 'use-hook',
        },
        {
          kind: 'prose',
          body: (
            <>
              <code>use</code> reads the value of a resource — either a{' '}
              <strong>promise</strong> (it suspends until the promise resolves,
              integrating with <code>&lt;Suspense&gt;</code> and error boundaries)
              or a <strong>Context</strong>. Crucially, unlike every other hook,{' '}
              <code>use</code> is <strong>allowed inside conditionals and loops</strong>{' '}
              — it doesn't rely on a fixed call order.
            </>
          ),
        },
        {
          kind: 'code',
          filename: 'use.tsx',
          lang: 'tsx',
          caption: 'use() unwraps a promise (with Suspense) and can be read conditionally.',
          code: `import { use, Suspense } from 'react'

// 'commentsPromise' is created by a parent and passed down.
function Comments({ commentsPromise }: { commentsPromise: Promise<Comment[]> }) {
  // Suspends here until the promise resolves — no useEffect/useState dance.
  const comments = use(commentsPromise)
  return (
    <ul>
      {comments.map((c) => (
        <li key={c.id}>{c.text}</li>
      ))}
    </ul>
  )
}

function Page({ promise }: { promise: Promise<Comment[]> }) {
  return (
    <Suspense fallback={<p>Loading comments…</p>}>
      <Comments commentsPromise={promise} />
    </Suspense>
  )
}`,
        },
        {
          kind: 'heading',
          text: 'useActionState + useFormStatus — forms without the boilerplate',
          id: 'use-action-state',
        },
        {
          kind: 'prose',
          body: (
            <>
              <code>useActionState</code> takes an async{' '}
              <strong>action function</strong> and an initial state, and returns{' '}
              <code>[state, formAction, isPending]</code>. You hand{' '}
              <code>formAction</code> to a <code>&lt;form action&gt;</code>; React
              runs your action on submit, tracks the pending state, and stores
              whatever the action returns as the new <code>state</code> (perfect
              for validation errors or a success message).{' '}
              <code>useFormStatus</code> is its companion: a{' '}
              <strong>child</strong> of the form (e.g. the submit button) can read
              the parent form's <code>pending</code> status{' '}
              <em>without prop-drilling it</em>.
            </>
          ),
        },
        {
          kind: 'code',
          filename: 'SignupForm.tsx',
          lang: 'tsx',
          caption: 'The action owns submission; the button reads pending via useFormStatus.',
          code: `import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'

interface FormState {
  error?: string
  ok?: boolean
}

async function subscribe(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = String(formData.get('email') ?? '')
  if (!email.includes('@')) return { error: 'Enter a valid email.' }
  await api.subscribe(email)
  return { ok: true }
}

// A child of <form>; reads the parent form's pending state — no props needed.
function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Submitting…' : 'Subscribe'}
    </button>
  )
}

export function SignupForm() {
  const [state, formAction] = useActionState(subscribe, {})

  return (
    <form action={formAction}>
      <input name="email" type="email" />
      <SubmitButton />
      {state.error && <p role="alert">{state.error}</p>}
      {state.ok && <p>You're subscribed! 🎉</p>}
    </form>
  )
}`,
        },
        {
          kind: 'heading',
          text: 'useOptimistic — show the result before the server confirms',
          id: 'use-optimistic',
        },
        {
          kind: 'prose',
          body: (
            <>
              <code>useOptimistic</code> renders an{' '}
              <strong>optimistic version</strong> of state while an async action
              is in flight, then reconciles to the real state when it settles. The
              user sees their change instantly; if the request fails, React drops
              the optimistic value and you're back to the confirmed state.
            </>
          ),
        },
        {
          kind: 'code',
          filename: 'MessageList.tsx',
          lang: 'tsx',
          caption: 'The new message appears immediately, marked "sending", before the server responds.',
          code: `import { useOptimistic, useRef } from 'react'

function Thread({ messages, send }: ThreadProps) {
  const formRef = useRef<HTMLFormElement>(null)

  const [optimistic, addOptimistic] = useOptimistic(
    messages,
    (current, text: string) => [
      ...current,
      { id: 'temp', text, sending: true }, // optimistic entry
    ],
  )

  async function action(formData: FormData) {
    const text = String(formData.get('text') ?? '')
    addOptimistic(text)        // show it right now
    formRef.current?.reset()
    await send(text)           // when this resolves, 'messages' updates for real
  }

  return (
    <>
      <ul>
        {optimistic.map((m) => (
          <li key={m.id} style={{ opacity: m.sending ? 0.5 : 1 }}>
            {m.text}
          </li>
        ))}
      </ul>
      <form action={action} ref={formRef}>
        <input name="text" />
      </form>
    </>
  )
}`,
        },
        {
          kind: 'callout',
          variant: 'tip',
          title: 'When to use each (IRL)',
          body: (
            <>
              <strong>use()</strong> — read a promise created higher up (data
              passed from a Server Component or a parent) or read context
              conditionally. <strong>useActionState</strong> — any form
              submission where you want server-driven result/error state and a
              built-in pending flag. <strong>useFormStatus</strong> — a reusable
              submit button or inline spinner that shouldn't need the form to pass
              it props. <strong>useOptimistic</strong> — instant-feedback
              interactions: likes, sending a message, toggling a follow,
              add-to-cart — anywhere a round-trip would otherwise feel sluggish.
            </>
          ),
        },
        {
          kind: 'callout',
          variant: 'warn',
          title: 'Pitfall — useFormStatus reads the PARENT form only',
          body: (
            <>
              <code>useFormStatus</code> reports the status of the closest{' '}
              <code>&lt;form&gt;</code> <strong>above</strong> the component in
              the tree — it does <em>not</em> work in the same component that
              renders the <code>&lt;form&gt;</code>. Put the button (or whatever
              reads the status) <strong>inside</strong> the form as a child
              component, as in the example above. Also note it's imported from{' '}
              <code>react-dom</code>, not <code>react</code>.
            </>
          ),
        },
      ],
    },

    // ──────────────────────── HOOKS: UNDERUSED ────────────────────────
    {
      slug: 'hooks-underused',
      title: 'Underused but important hooks',
      summary:
        'useLayoutEffect, useImperativeHandle, useId, useSyncExternalStore and useDebugValue — niche, but each solves a real problem.',
      blocks: [
        {
          kind: 'prose',
          body: (
            <>
              These don't come up daily, but when you need them nothing else will
              do. Each one solves a <strong>specific, real problem</strong> —
              here's the problem and the minimal snippet for each.
            </>
          ),
        },
        {
          kind: 'heading',
          text: 'useLayoutEffect — measure/mutate the DOM before paint',
          id: 'use-layout-effect',
        },
        {
          kind: 'prose',
          body: (
            <>
              <code>useEffect</code> runs <em>after</em> the browser paints, so if
              you read layout and then move something, the user sees a{' '}
              <strong>flicker</strong>. <code>useLayoutEffect</code> runs{' '}
              <strong>synchronously after DOM mutations but before paint</strong>,
              so measure-then-reposition happens in the same frame — no flash.
            </>
          ),
        },
        {
          kind: 'code',
          filename: 'Tooltip.tsx',
          lang: 'tsx',
          caption: 'Measure the tooltip and flip it above/below before the user ever sees it.',
          code: `import { useLayoutEffect, useRef, useState } from 'react'

function Tooltip({ anchor }: { anchor: DOMRect }) {
  const ref = useRef<HTMLDivElement>(null)
  const [placeAbove, setPlaceAbove] = useState(false)

  useLayoutEffect(() => {
    const rect = ref.current!.getBoundingClientRect()
    // Decide placement from measured size and commit it before paint.
    setPlaceAbove(anchor.bottom + rect.height > window.innerHeight)
  }, [anchor])

  return <div ref={ref} data-above={placeAbove}>…</div>
}`,
        },
        {
          kind: 'heading',
          text: 'useImperativeHandle + forwardRef — expose an imperative API',
          id: 'use-imperative-handle',
        },
        {
          kind: 'prose',
          body: (
            <>
              Sometimes a parent legitimately needs to <em>command</em> a child —{' '}
              <code>.focus()</code>, <code>.scrollToTop()</code>,{' '}
              <code>.play()</code>. <code>useImperativeHandle</code> (paired with{' '}
              <code>forwardRef</code>) lets a child{' '}
              <strong>choose exactly what its ref exposes</strong>, instead of
              leaking the raw DOM node.
            </>
          ),
        },
        {
          kind: 'code',
          filename: 'FancyInput.tsx',
          lang: 'tsx',
          caption: 'The parent gets a curated API (focus/clear), not the bare <input>.',
          code: `import { forwardRef, useImperativeHandle, useRef } from 'react'

interface FancyInputHandle {
  focus: () => void
  clear: () => void
}

const FancyInput = forwardRef<FancyInputHandle>(function FancyInput(_props, ref) {
  const inputRef = useRef<HTMLInputElement>(null)

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    clear: () => {
      if (inputRef.current) inputRef.current.value = ''
    },
  }))

  return <input ref={inputRef} />
})

// Parent: const ref = useRef<FancyInputHandle>(null); ref.current?.focus()`,
        },
        {
          kind: 'heading',
          text: 'useId — stable, SSR-safe ids for accessibility',
          id: 'use-id',
        },
        {
          kind: 'prose',
          body: (
            <>
              Hard-coding ids breaks when a component renders twice; generating
              random ids breaks <strong>server rendering</strong> (the server and
              client ids won't match → hydration error).{' '}
              <code>useId</code> produces a <strong>stable, unique, SSR-safe</strong>{' '}
              id you can wire a <code>label</code> to its <code>input</code>, or
              hook up <code>aria-describedby</code>.
            </>
          ),
        },
        {
          kind: 'code',
          filename: 'Field.tsx',
          lang: 'tsx',
          caption: 'One useId, reused for the label/input pair and the hint.',
          code: `import { useId } from 'react'

function Field({ label, hint }: { label: string; hint: string }) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} aria-describedby={\`\${id}-hint\`} />
      <small id={\`\${id}-hint\`}>{hint}</small>
    </div>
  )
}`,
        },
        {
          kind: 'heading',
          text: 'useSyncExternalStore — subscribe to an external store correctly',
          id: 'use-sync-external-store',
        },
        {
          kind: 'prose',
          body: (
            <>
              This is the low-level primitive that{' '}
              <strong>Redux, Zustand, Jotai</strong> and friends build on. It
              subscribes a component to a store <em>outside</em> React and reads a
              snapshot, in a way that stays <strong>correct under concurrent
              rendering</strong> (no torn reads, where parts of the UI show stale
              data). You give it a <code>subscribe</code> function and a{' '}
              <code>getSnapshot</code> function.
            </>
          ),
        },
        {
          kind: 'code',
          filename: 'useOnlineStatus.ts',
          lang: 'ts',
          caption: 'Subscribe to a browser API the concurrent-safe way.',
          code: `import { useSyncExternalStore } from 'react'

function subscribe(callback: () => void) {
  window.addEventListener('online', callback)
  window.addEventListener('offline', callback)
  return () => {
    window.removeEventListener('online', callback)
    window.removeEventListener('offline', callback)
  }
}

export function useOnlineStatus() {
  return useSyncExternalStore(
    subscribe,
    () => navigator.onLine, // client snapshot
    () => true,             // server snapshot (assume online during SSR)
  )
}`,
        },
        {
          kind: 'heading',
          text: 'useDebugValue — label custom hooks in DevTools',
          id: 'use-debug-value',
        },
        {
          kind: 'prose',
          body: (
            <>
              Purely a developer-experience hook: <code>useDebugValue</code>{' '}
              attaches a <strong>label to a custom hook</strong> so it shows a
              readable value in React DevTools instead of being opaque. Cost-free
              in production builds.
            </>
          ),
        },
        {
          kind: 'code',
          filename: 'useDebugValue.ts',
          lang: 'ts',
          code: `import { useDebugValue } from 'react'

function useOnlineStatus() {
  const isOnline = useSyncExternalStore(/* … */)
  // DevTools shows "OnlineStatus: Online" next to this hook.
  useDebugValue(isOnline ? 'Online' : 'Offline')
  return isOnline
}`,
        },
        {
          kind: 'callout',
          variant: 'key',
          title: 'Why useSyncExternalStore exists',
          body: (
            <>
              Before it, external stores subscribed via{' '}
              <code>useEffect</code> + <code>useState</code>, which can{' '}
              <strong>tear</strong> under React 18+'s concurrent rendering —
              different components reading the same store mid-render could show{' '}
              <em>different</em> values. <code>useSyncExternalStore</code> is the
              official primitive that guarantees a{' '}
              <strong>consistent snapshot</strong> across a render pass, which is
              precisely why every modern external store library (Redux, Zustand,
              …) routes its subscriptions through it.
            </>
          ),
        },
      ],
    },

    // ──────────────────────── STATE SHARING: THE CENTERPIECE ────────────────────────
    {
      slug: 'state-sharing',
      title: 'Prop drilling vs Context vs Redux',
      summary:
        'The three ways state reaches a component — and why Context and Redux solve fundamentally different problems.',
      blocks: [
        {
          kind: 'prose',
          body: (
            <>
              Almost every "how should I manage state?" debate is really about{' '}
              <strong>how state reaches the component that needs it</strong>.
              There are three answers, and the most common mistake is treating{' '}
              <strong>Context as a lightweight Redux</strong> — they're not the
              same kind of tool at all. Let's take them in order.
            </>
          ),
        },
        {
          kind: 'heading',
          text: '1. Prop drilling — thread it through by hand',
          id: 'prop-drilling',
        },
        {
          kind: 'prose',
          body: (
            <>
              Prop drilling means passing a value down through{' '}
              <strong>intermediate components that don't use it</strong>, purely
              to get it to a deep child. It's explicit and easy to trace, but it
              hurts at scale: every layer in the chain has to{' '}
              <strong>declare and forward</strong> the prop (coupling unrelated
              components to it), a change to the shape means{' '}
              <strong>editing every level</strong> (churn), and because the prop
              flows through them, those intermediate components{' '}
              <strong>re-render too</strong>.
            </>
          ),
        },
        {
          kind: 'code',
          filename: 'drilling.tsx',
          lang: 'tsx',
          caption: 'Layout and Sidebar care nothing about `user` — they just relay it.',
          code: `function App() {
  const [user, setUser] = useState<User | null>(null)
  return <Layout user={user} />
}

// Doesn't use 'user' — only forwards it.
function Layout({ user }: { user: User | null }) {
  return <Sidebar user={user} />
}

// Doesn't use 'user' — only forwards it.
function Sidebar({ user }: { user: User | null }) {
  return <Avatar user={user} />
}

// Finally, the component that actually needs it.
function Avatar({ user }: { user: User | null }) {
  return <img src={user?.avatarUrl} alt={user?.name} />
}`,
        },
        {
          kind: 'callout',
          variant: 'tip',
          title: "When it's actually fine",
          body: (
            <>
              For <strong>1–2 levels</strong>, prop drilling is the right call —
              it's explicit, type-checked, and has zero machinery. Don't reach for
              Context or a store to avoid passing a prop one component deep; that
              trades a trivial, traceable handoff for indirection. Drilling only
              becomes a smell when the chain is <strong>long</strong> and the
              middle is <strong>oblivious</strong>. (And remember:{' '}
              <strong>composition via <code>children</code></strong> often
              eliminates the chain entirely — pass the rendered element down
              instead of the data.)
            </>
          ),
        },
        {
          kind: 'heading',
          text: '2. Context — a broadcast / dependency-injection mechanism',
          id: 'context',
        },
        {
          kind: 'prose',
          body: (
            <>
              Context is a <strong>broadcast channel</strong>: a provider sets a{' '}
              <code>value</code>, and any descendant can read it directly with{' '}
              <code>useContext</code>, skipping the intermediate layers entirely.
              Think of it as <strong>dependency injection for the React tree</strong>,
              not a state manager — Context has no concept of "actions,"
              "reducers," or selective updates. Its defining behavior is the catch:{' '}
              <strong>
                when the provider's <code>value</code> changes, every consumer
                re-renders
              </strong>
              , whether or not it cares about the part that changed.
            </>
          ),
        },
        {
          kind: 'code',
          filename: 'AuthContext.tsx',
          lang: 'tsx',
          caption: 'Memoize the value, or a new object identity re-renders all consumers every render.',
          code: `import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

interface AuthValue {
  user: User | null
  login: (u: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  // ✅ Stable identity: consumers only re-render when 'user' actually changes,
  //    not on every AuthProvider render.
  const value = useMemo<AuthValue>(
    () => ({
      user,
      login: setUser,
      logout: () => setUser(null),
    }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}`,
        },
        {
          kind: 'prose',
          body: (
            <>
              Because every consumer re-renders on any value change, the
              mitigations are: <strong>memoize the value</strong> (above) so it
              doesn't change by identity on unrelated renders;{' '}
              <strong>split into multiple contexts</strong> so a fast-changing
              piece doesn't drag slow consumers along (e.g. a separate{' '}
              <code>ThemeContext</code> and <code>AuthContext</code>); and reserve
              Context for <strong>low-frequency, broadly-needed</strong> values —{' '}
              <strong>theme, authenticated user, locale, feature flags</strong>.
              It's a poor fit for state that updates many times a second.
            </>
          ),
        },
        {
          kind: 'heading',
          text: '3. Redux — an external store with selective subscriptions',
          id: 'redux',
        },
        {
          kind: 'prose',
          body: (
            <>
              Redux keeps all state in a <strong>single store that lives outside
              the React tree</strong>. You never mutate it directly; you{' '}
              <strong>dispatch actions</strong>, and pure{' '}
              <strong>reducers</strong> compute the next state. Components read
              from it with <code>useSelector</code>, which subscribes via{' '}
              <code>useSyncExternalStore</code> and{' '}
              <strong>
                re-renders only when the specific slice it selected changes
              </strong>{' '}
              — not when unrelated parts of the store update. That selective
              subscription is the key difference from Context. On top of that you
              get <strong>middleware</strong> (async/logging),{' '}
              <strong>DevTools with time-travel</strong> debugging, and a
              predictable, auditable update pipeline.{' '}
              <strong>Redux Toolkit (RTK)</strong> is the modern default — it
              removes the old boilerplate and lets you write "mutating" reducer
              code (Immer produces the immutable update for you).
            </>
          ),
        },
        {
          kind: 'code',
          filename: 'counterSlice.ts',
          lang: 'ts',
          caption: 'RTK: a slice bundles the reducer + auto-generated action creators.',
          code: `import { createSlice, configureStore, type PayloadAction } from '@reduxjs/toolkit'

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    // "Mutating" code is safe here — Immer makes it an immutable update.
    increment: (state) => {
      state.value += 1
    },
    addBy: (state, action: PayloadAction<number>) => {
      state.value += action.payload
    },
  },
})

export const { increment, addBy } = counterSlice.actions

export const store = configureStore({
  reducer: { counter: counterSlice.reducer },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch`,
        },
        {
          kind: 'code',
          filename: 'Counter.tsx',
          lang: 'tsx',
          caption: 'useSelector subscribes to one slice; this re-renders only when counter.value changes.',
          code: `import { useSelector, useDispatch } from 'react-redux'
import { increment, type RootState, type AppDispatch } from './counterSlice'

function Counter() {
  // Re-renders ONLY when the selected value changes — unrelated store
  // updates (auth, cart, …) don't touch this component.
  const count = useSelector((s: RootState) => s.counter.value)
  const dispatch = useDispatch<AppDispatch>()

  return <button onClick={() => dispatch(increment())}>Count: {count}</button>
}`,
        },
        {
          kind: 'diagram',
          render: StateSharingDiagram,
          title: 'Three ways state reaches a component',
          caption:
            'Drilling threads through every level · Context broadcasts to all consumers · a store serves only the slices each component selects.',
        },
        {
          kind: 'callout',
          variant: 'key',
          title: 'The fundamental difference',
          body: (
            <>
              <strong>Context is value DISTRIBUTION through the React tree</strong>{' '}
              with no built-in change-granularity: when the provided value
              changes, <em>all</em> consumers re-render. <strong>Redux is a
              state CONTAINER that lives outside the tree</strong>, with selective
              subscriptions (each component re-renders only for the slice it
              selects) and a predictable, debuggable update pipeline (actions →
              reducers → store). So Context is <em>not</em> a performance
              optimization over Redux, and Redux is not "Context with extra
              steps" — they solve <strong>different problems</strong>. Use Context
              to inject slowly-changing dependencies; use a store (Redux/Zustand)
              when you have frequently-updating shared state that many components
              read in fine-grained, independent ways.
            </>
          ),
        },
      ],
    },
  ],
}
