import type { TopicGroup } from '../types/content'
import {
  EventPropagationDiagram,
  DebounceThrottleDiagram,
  PromiseStatesDiagram,
  EventLoopDiagram,
} from '../components/diagrams'

// Authored in task #4 — "JS Internals" pillar.
// Deep mechanism: how the DOM dispatches events, how timing utilities work,
// and how the engine schedules async work via promises + the event loop.
// A typed data module: an array of topics, each an ordered list of blocks.
export const jsInternals: TopicGroup = {
  id: 'js-internals',
  title: 'JS Internals',
  label: 'JS Internals',
  icon: '⚙️',
  topics: [
    // ─────────────────────── EVENT PROPAGATION & DELEGATION ───────────────────────
    {
      slug: 'event-propagation',
      title: 'Event propagation & delegation',
      summary: 'The three phases (capture → target → bubble), how to stop them, and event delegation.',
      blocks: [
        {
          kind: 'prose',
          body: (
            <>
              When you click a button nested deep in the page, the browser
              doesn't just fire a single event on that button. It dispatches the
              event in <strong>three phases</strong> that walk the DOM tree.
              First the <strong>capture</strong> phase travels{' '}
              <em>down</em> from the document root to the element you clicked.
              Then the <strong>target</strong> phase fires on the clicked
              element itself. Finally the <strong>bubble</strong> phase travels
              back <em>up</em> from the target to the root. Listeners can attach
              to any node along that path and choose which phase to listen on.
            </>
          ),
        },
        {
          kind: 'diagram',
          render: EventPropagationDiagram,
          title: 'The three phases of a DOM event',
          caption:
            'Capture travels root → target on the way down; bubble travels target → root on the way back up. The target phase is the turnaround point.',
        },
        {
          kind: 'prose',
          body: (
            <>
              By default, <code>addEventListener</code> registers for the{' '}
              <strong>bubble</strong> phase. Pass{' '}
              <code>{'{ capture: true }'}</code> (or the legacy boolean third
              argument <code>true</code>) to listen on the way <em>down</em>{' '}
              instead. So if both an ancestor and the target have click
              handlers, a capturing ancestor handler runs <em>before</em> the
              target, and a bubbling ancestor handler runs <em>after</em> it.
            </>
          ),
        },
        {
          kind: 'code',
          lang: 'js',
          filename: 'phases.js',
          caption: 'Same element, two phases — capture fires on the way down, bubble on the way up.',
          code: `const outer = document.querySelector('.outer')

// Bubble phase (default): fires AFTER inner targets handle the event.
outer.addEventListener('click', () => {
  console.log('outer — bubble')
})

// Capture phase: fires BEFORE the event reaches the target.
outer.addEventListener(
  'click',
  () => {
    console.log('outer — capture')
  },
  { capture: true },
)

// Click something inside .outer → logs:
//   "outer — capture"   (going down)
//   ...target's own handlers...
//   "outer — bubble"    (coming back up)`,
        },
        {
          kind: 'heading',
          text: 'Stopping the event: three different verbs',
          id: 'stopping',
        },
        {
          kind: 'prose',
          body: (
            <>
              Three methods are constantly confused because they sound similar
              but do very different things. <code>stopPropagation()</code>{' '}
              halts the event's <em>journey</em> — no further nodes up (or down)
              the tree will see it. <code>stopImmediatePropagation()</code> does
              that <em>and also</em> prevents any{' '}
              <strong>other listeners on the same element</strong> from running.{' '}
              <code>preventDefault()</code> is unrelated to travel entirely: it
              cancels the browser's <strong>default action</strong> (following a
              link, submitting a form, checking a checkbox) while letting the
              event keep propagating normally.
            </>
          ),
        },
        {
          kind: 'table',
          caption: 'Three methods, three jobs — they are independent and can be combined.',
          headers: ['Method', 'Stops travel up/down?', 'Stops other listeners on same element?', 'Cancels default action?'],
          rows: [
            [<code>stopPropagation()</code>, 'Yes', 'No', 'No'],
            [<code>stopImmediatePropagation()</code>, 'Yes', 'Yes', 'No'],
            [<code>preventDefault()</code>, 'No', 'No', 'Yes'],
          ],
        },
        {
          kind: 'code',
          lang: 'js',
          caption: 'preventDefault cancels navigation but the click still bubbles to ancestors.',
          code: `link.addEventListener('click', (e) => {
  e.preventDefault() // don't navigate…
  // …but the event still bubbles: parent handlers/analytics still fire.
  openInModal(link.href)
})

button.addEventListener('click', (e) => {
  e.stopImmediatePropagation() // this element's *other* click listeners
  // registered after this one will NOT run, and it won't bubble either.
})`,
        },
        {
          kind: 'heading',
          text: 'Event delegation',
          id: 'delegation',
        },
        {
          kind: 'prose',
          body: (
            <>
              Because events bubble, you usually don't need a listener per
              element. <strong>Event delegation</strong> puts{' '}
              <strong>one</strong> listener on a common ancestor and figures out
              what was actually clicked from <code>event.target</code>. The key
              tool is <code>event.target.closest(selector)</code>, which walks
              up from the clicked node to find the matching item — so a click on
              an icon <em>inside</em> a row still resolves to the row. This is
              fewer listeners, less memory, and — crucially — it{' '}
              <strong>works for elements added to the DOM later</strong>,
              because the parent was listening all along.
            </>
          ),
        },
        {
          kind: 'code',
          lang: 'js',
          filename: 'delegated-list.js',
          caption: 'One listener on the <ul> handles clicks for every <li>, present or future.',
          code: `const list = document.querySelector('#todo-list')

// ONE listener — not one per <li>.
list.addEventListener('click', (event) => {
  // event.target is whatever was actually clicked (could be a nested <span>).
  const item = event.target.closest('li[data-id]')
  if (!item || !list.contains(item)) return // click landed on empty space

  // Distinguish actions within the row, again via closest().
  if (event.target.closest('.delete')) {
    item.remove()
  } else {
    item.classList.toggle('done')
  }
})

// Items added AFTER the listener was attached still work — no rebinding.
function addTodo(text, id) {
  const li = document.createElement('li')
  li.dataset.id = id
  li.innerHTML = \`<span>\${text}</span> <button class="delete">×</button>\`
  list.append(li)
}`,
        },
        {
          kind: 'prose',
          body: (
            <>
              Note the distinction inside the handler:{' '}
              <code>event.target</code> is the deepest element that was clicked,
              while <code>event.currentTarget</code> is the element the listener
              is <em>attached to</em> (here, the <code>{'<ul>'}</code>). In a
              delegated handler they are almost never the same — that's the
              whole point. Inside a normal (non-arrow) handler{' '}
              <code>this</code> also equals <code>currentTarget</code>.
            </>
          ),
        },
        {
          kind: 'callout',
          variant: 'tip',
          title: 'When to use delegation (IRL)',
          body: (
            <>
              Whenever you have <strong>many similar children</strong> or a{' '}
              <strong>dynamic list</strong>: table rows, menu items, a todo
              list, an infinitely-scrolling feed, a grid of cards. One listener
              on the container beats hundreds of per-item listeners — less
              memory, no teardown bookkeeping, and brand-new items just work.
              Frameworks lean on this too: React attaches a single delegated
              listener at the root rather than one per <code>onClick</code>.
            </>
          ),
        },
        {
          kind: 'callout',
          variant: 'warn',
          title: 'Pitfall — stopPropagation is a blunt instrument',
          body: (
            <>
              Calling <code>stopPropagation()</code> to "fix" one handler{' '}
              <strong>silently breaks every delegated and analytics listener
              above it</strong> — including your own framework's root listener.
              Prefer <code>preventDefault()</code> when you only meant "don't do
              the default thing," and reserve <code>stopPropagation()</code> for
              cases where you genuinely own the whole subtree. Also don't confuse{' '}
              <code>target</code> (what was clicked) with{' '}
              <code>currentTarget</code> (where the listener lives) — reading the
              wrong one is the classic delegation bug.
            </>
          ),
        },
      ],
    },

    // ─────────────────────── DEBOUNCE, THROTTLE & POLLING ───────────────────────
    {
      slug: 'debounce-throttle-polling',
      title: 'Debounce, throttle & polling',
      summary: 'Three timing tools: wait for quiet (debounce), rate-limit (throttle), and re-poll until done.',
      blocks: [
        {
          kind: 'prose',
          body: (
            <>
              These three are how you tame events that fire far too often (or
              ask a server "are we there yet?"). They're easy to mix up, so
              anchor on the behavior. <strong>Debounce</strong>: wait until the
              activity <em>stops</em> for N milliseconds, then fire{' '}
              <strong>once</strong>. <strong>Throttle</strong>: while activity
              continues, fire <strong>at most once per N ms</strong>.{' '}
              <strong>Polling</strong>: re-request on an interval until some
              condition becomes true.
            </>
          ),
        },
        {
          kind: 'diagram',
          render: DebounceThrottleDiagram,
          title: 'Debounce vs throttle on the same input',
          caption:
            'Given the same burst of events, debounce fires once after things go quiet; throttle fires on a steady cadence throughout.',
        },
        {
          kind: 'heading',
          text: 'Debounce, from scratch',
          id: 'debounce',
        },
        {
          kind: 'prose',
          body: (
            <>
              The mechanism is a single timer captured in a closure. Every call{' '}
              <strong>clears the previous timer and starts a new one</strong>,
              so the wrapped function only actually runs once the calls stop
              arriving for the full delay. Perfect for search-as-you-type
              (wait until the user pauses), autosave, and reacting to{' '}
              <code>resize</code>.
            </>
          ),
        },
        {
          kind: 'code',
          lang: 'js',
          filename: 'debounce.js',
          caption: 'Each call resets the clock; the callback fires only after `delay` ms of silence.',
          code: `function debounce(fn, delay = 300) {
  let timer = null // private to this closure — survives between calls

  function debounced(...args) {
    clearTimeout(timer) // cancel the pending run, if any
    timer = setTimeout(() => {
      fn.apply(this, args) // preserve \`this\` and the latest arguments
    }, delay)
  }

  // Let callers abort a pending trailing call (e.g. on unmount).
  debounced.cancel = () => clearTimeout(timer)
  return debounced
}

// Usage: only search once the user stops typing for 300ms.
const onInput = debounce((e) => fetchResults(e.target.value), 300)
searchBox.addEventListener('input', onInput)`,
        },
        {
          kind: 'heading',
          text: 'Throttle, from scratch',
          id: 'throttle',
        },
        {
          kind: 'prose',
          body: (
            <>
              Throttle guarantees a steady cadence during a continuous stream of
              events. The simplest correct version remembers the{' '}
              <strong>timestamp of the last run</strong> and ignores calls until{' '}
              <code>limit</code> ms have elapsed — then it also schedules a{' '}
              <strong>trailing call</strong> so the very last event isn't lost.
              Ideal for <code>scroll</code>, <code>mousemove</code>, and drag,
              where you want regular updates but not one per pixel.
            </>
          ),
        },
        {
          kind: 'code',
          lang: 'js',
          filename: 'throttle.js',
          caption: 'Leading + trailing throttle: fires immediately, then at most once per `limit` ms.',
          code: `function throttle(fn, limit = 200) {
  let lastRun = 0 // timestamp of the last invocation
  let trailing = null // pending timer for the final call

  function throttled(...args) {
    const now = Date.now()
    const remaining = limit - (now - lastRun)

    if (remaining <= 0) {
      // Enough time has passed — run on the leading edge.
      clearTimeout(trailing)
      trailing = null
      lastRun = now
      fn.apply(this, args)
    } else if (!trailing) {
      // Within the window — schedule one trailing run for the last event.
      trailing = setTimeout(() => {
        lastRun = Date.now()
        trailing = null
        fn.apply(this, args)
      }, remaining)
    }
  }

  return throttled
}

// Usage: update the scroll progress bar at most ~5×/second.
window.addEventListener('scroll', throttle(updateProgressBar, 200))`,
        },
        {
          kind: 'heading',
          text: 'Polling',
          id: 'polling',
        },
        {
          kind: 'prose',
          body: (
            <>
              Polling re-checks a remote condition until it's satisfied — "is
              this background job done yet?" An <code>async</code> loop with an{' '}
              <code>await</code>ed delay reads cleanly and, unlike{' '}
              <code>setInterval</code>, <strong>can't overlap requests</strong>{' '}
              (it waits for each response before sleeping). Add{' '}
              <strong>exponential backoff</strong> so you hammer the server less
              the longer it takes, plus a cap on attempts.
            </>
          ),
        },
        {
          kind: 'code',
          lang: 'js',
          filename: 'poll.js',
          caption: 'Async-loop polling with exponential backoff — no overlapping requests.',
          code: `const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function pollJob(id, { interval = 1000, max = 10 } = {}) {
  let wait = interval
  for (let attempt = 0; attempt < max; attempt++) {
    const job = await fetch(\`/jobs/\${id}\`).then((r) => r.json())
    if (job.status === 'done') return job.result
    if (job.status === 'failed') throw new Error('job failed')

    await sleep(wait)
    wait = Math.min(wait * 2, 30_000) // back off, capped at 30s
  }
  throw new Error('timed out waiting for job')
}`,
        },
        {
          kind: 'prose',
          body: (
            <>
              The <code>setInterval</code> form is fine for simple cases, but
              remember to <code>clearInterval</code> once you're done, and beware
              that a slow handler can <strong>stack up</strong> if a tick takes
              longer than the interval. For <em>visual</em> updates driven by an
              animation, prefer <code>requestAnimationFrame</code> over a timer:
              it syncs to the display's refresh, pauses automatically in
              background tabs, and never schedules work the user can't see.
            </>
          ),
        },
        {
          kind: 'table',
          caption: 'Pick the tool by the shape of the problem.',
          headers: ['Use case', 'Technique', 'Why'],
          rows: [
            ['Search-as-you-type, autosave', <strong>Debounce</strong>, 'Only act once the user pauses'],
            ['Resize / orientation settle', <strong>Debounce</strong>, 'Run after the burst, not during'],
            ['Scroll position, sticky header', <strong>Throttle</strong>, 'Steady cadence, not per-pixel'],
            ['Mousemove / drag tracking', <strong>Throttle</strong>, 'Cap update rate, stay smooth'],
            ['Smooth animation loop', <code>requestAnimationFrame</code>, 'Syncs to refresh, pauses off-screen'],
            ['Job status, "is it ready?"', <><strong>Polling</strong> + backoff</>, 'Re-check until a condition is met'],
          ],
        },
        {
          kind: 'callout',
          variant: 'tip',
          title: 'The one-line mnemonic',
          body: (
            <>
              <strong>Debounce</strong> = "wait until they're done."{' '}
              <strong>Throttle</strong> = "every so often, no matter what."{' '}
              <strong>Polling</strong> = "keep asking until the answer changes."
              If you only remember debounce-vs-throttle by example: debounce a
              search input, throttle a scroll handler.
            </>
          ),
        },
        {
          kind: 'callout',
          variant: 'warn',
          title: 'Pitfall — recreating the wrapper every render',
          body: (
            <>
              In a component, calling{' '}
              <code>onChange={'{'}debounce(fn){'}'}</code> inline makes a{' '}
              <strong>brand-new debounced function on every render</strong>,
              each with its own fresh timer — so the debounce never actually
              accumulates and fires immediately every time. Create it once
              (module scope, <code>useMemo</code>, or a ref) so the closed-over{' '}
              <code>timer</code> persists across calls. Same trap with throttle.
            </>
          ),
        },
      ],
    },

    // ─────────────────────────────── PROMISES ───────────────────────────────
    {
      slug: 'promises',
      title: 'Promises, deeply',
      summary: 'A one-way state machine for a future value: states, chaining, combinators, and foot-guns.',
      blocks: [
        {
          kind: 'prose',
          body: (
            <>
              A <code>Promise</code> is a placeholder for a value that isn't
              ready yet. It has exactly three states: it starts{' '}
              <strong>pending</strong>, and then settles <em>once</em> — either{' '}
              <strong>fulfilled</strong> with a value, or{' '}
              <strong>rejected</strong> with a reason. The defining rule is that
              settling is <strong>permanent and immutable</strong>: a promise
              can never go from fulfilled back to pending, never change its
              value, never settle twice. That one-way guarantee is what makes
              promises safe to pass around and attach handlers to at any time.
            </>
          ),
        },
        {
          kind: 'diagram',
          render: PromiseStatesDiagram,
          title: 'A promise is a one-way state machine',
          caption:
            'Pending is the only non-final state. It transitions exactly once — to fulfilled or rejected — and then is frozen forever.',
        },
        {
          kind: 'callout',
          variant: 'key',
          title: 'Promise callbacks are microtasks',
          body: (
            <>
              When a promise settles, its <code>.then</code>/<code>.catch</code>{' '}
              callbacks are queued on the <strong>microtask queue</strong>, not
              the timer (macrotask) queue. The engine{' '}
              <strong>drains the entire microtask queue</strong> after the
              current synchronous code finishes, and does so{' '}
              <em>before</em> the next macrotask (like a{' '}
              <code>setTimeout</code> callback) runs. Concretely: a{' '}
              <strong>resolved promise's <code>.then</code> always runs before a{' '}
              <code>setTimeout(fn, 0)</code></strong> scheduled at the same
              moment.
            </>
          ),
        },
        {
          kind: 'code',
          lang: 'js',
          caption: 'Microtask (then) beats macrotask (setTimeout), even with a 0ms timer.',
          code: `console.log('A — sync')

setTimeout(() => console.log('D — setTimeout (macrotask)'), 0)

Promise.resolve().then(() => console.log('C — then (microtask)'))

console.log('B — sync')

// Output order:
//   A — sync          (runs now)
//   B — sync          (runs now)
//   C — then          (microtask: drained after sync, before timers)
//   D — setTimeout    (macrotask: next tick)`,
        },
        {
          kind: 'heading',
          text: 'Chaining: every .then returns a new promise',
          id: 'chaining',
        },
        {
          kind: 'prose',
          body: (
            <>
              <code>.then()</code>, <code>.catch()</code>, and{' '}
              <code>.finally()</code> each return a <strong>brand-new
              promise</strong>, which is what lets you chain. Inside a{' '}
              <code>.then</code>, what you <strong>return</strong> decides the
              next link: return a <em>plain value</em> and the next{' '}
              <code>.then</code> receives it directly; return a{' '}
              <em>promise</em> and the chain <strong>waits</strong> for it to
              settle and unwraps it (no nested promises). A <code>.catch</code>{' '}
              anywhere handles a rejection from <em>any</em> earlier step, and
              the chain then continues in the fulfilled track.
            </>
          ),
        },
        {
          kind: 'code',
          lang: 'js',
          filename: 'chaining.js',
          caption: 'Returning a promise pauses the chain until it settles, then unwraps it.',
          code: `fetch('/api/user')
  .then((res) => res.json()) // returns a promise → chain waits for it
  .then((user) => {
    console.log(user.name) // receives the unwrapped JSON value
    return fetch(\`/api/orders?u=\${user.id}\`) // returns another promise
  })
  .then((res) => res.json()) // waits again, unwraps again
  .then((orders) => render(orders))
  .catch((err) => {
    // Catches a rejection from ANY step above (network, parse, render).
    showError(err)
  })
  .finally(() => {
    hideSpinner() // runs whether it fulfilled or rejected; passes value through
  })`,
        },
        {
          kind: 'heading',
          text: 'Combinators',
          id: 'combinators',
        },
        {
          kind: 'prose',
          body: (
            <>
              Four static helpers run multiple promises together. They differ in{' '}
              <em>when</em> they settle and <em>how</em> they treat rejection —
              and choosing the wrong one is a common bug.
            </>
          ),
        },
        {
          kind: 'table',
          caption: 'The four combinators — note which ones reject early.',
          headers: ['Combinator', 'Fulfills when', 'Rejects when', 'Use it for'],
          rows: [
            [<code>Promise.all</code>, 'All fulfill', 'Any one rejects (immediately)', 'Need every result; all-or-nothing'],
            [<code>Promise.allSettled</code>, 'All settle', 'Never', 'Want every outcome, failures included'],
            [<code>Promise.race</code>, 'First settles (fulfill)', 'First settles (reject)', 'Timeouts; first-to-respond'],
            [<code>Promise.any</code>, 'First fulfills', 'All reject (AggregateError)', 'First success; fall back across sources'],
          ],
        },
        {
          kind: 'code',
          lang: 'js',
          caption: 'all rejects on the first failure; allSettled gives you every outcome.',
          code: `// all — parallel, but ONE rejection fails the whole thing.
const [user, prefs, flags] = await Promise.all([
  fetchUser(),
  fetchPrefs(),
  fetchFlags(),
])

// allSettled — never rejects; inspect each result individually.
const results = await Promise.allSettled([fetchA(), fetchB(), fetchC()])
for (const r of results) {
  if (r.status === 'fulfilled') use(r.value)
  else console.warn('one failed:', r.reason)
}

// race — first to settle wins; classic fetch-with-timeout.
const data = await Promise.race([
  fetch('/slow'),
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error('timeout')), 5000),
  ),
])`,
        },
        {
          kind: 'callout',
          variant: 'danger',
          title: 'Foot-guns that bite everyone',
          body: (
            <>
              <strong>1. Forgetting to <code>return</code> inside a{' '}
              <code>.then</code>.</strong> If you start a promise but don't
              return it, the chain doesn't wait — the next <code>.then</code>{' '}
              runs immediately with <code>undefined</code>, and errors escape
              the chain. <strong>2. No <code>.catch</code>.</strong> A rejection
              with no handler becomes an{' '}
              <em>unhandled rejection</em> — errors vanish silently in some
              setups. <strong>3. Mixing <code>await</code> and{' '}
              <code>.then</code></strong> on the same operation makes control
              flow genuinely hard to follow; pick one style per function.
            </>
          ),
        },
        {
          kind: 'code',
          lang: 'js',
          caption: 'The missing-return bug: the chain does not wait for the inner fetch.',
          code: `// 🐛 BROKEN — no return, so the outer chain doesn't wait.
getUser().then((user) => {
  fetch(\`/orders/\${user.id}\`) // started, but not returned!
}).then((res) => {
  // res is undefined here — the fetch above was not awaited by the chain.
})

// ✅ FIXED — return the promise so the chain links up.
getUser().then((user) => {
  return fetch(\`/orders/\${user.id}\`)
}).then((res) => {
  // res is the real Response now.
})`,
        },
      ],
    },

    // ────────────────────────────── ASYNC / AWAIT ──────────────────────────────
    {
      slug: 'async-await',
      title: 'async / await',
      summary: 'Promises in straight-line syntax — plus the sequential-vs-parallel trap.',
      blocks: [
        {
          kind: 'prose',
          body: (
            <>
              <code>async</code>/<code>await</code> is syntactic sugar over
              promises that lets asynchronous code <em>read</em> like
              synchronous code. An <code>async</code> function{' '}
              <strong>always returns a promise</strong> (a non-promise return
              value is auto-wrapped in a resolved one). <code>await</code>{' '}
              <strong>pauses that function</strong> until the awaited promise
              settles — but it does <strong>not block the thread</strong>; the
              event loop is free to run other work in the meantime. When the
              promise settles, the function <strong>resumes on the microtask
              queue</strong> exactly where it left off.
            </>
          ),
        },
        {
          kind: 'diagram',
          render: EventLoopDiagram,
          title: 'Where async work waits: the event loop',
          caption:
            'Synchronous code runs on the call stack. Web APIs/timers hand callbacks to the macrotask queue; resolved promises and resumed async functions go to the microtask queue, which is fully drained between each macrotask.',
        },
        {
          kind: 'prose',
          body: (
            <>
              Error handling shifts from <code>.catch()</code> to ordinary{' '}
              <code>try</code>/<code>catch</code>: a rejected awaited promise{' '}
              <strong>throws</strong> at the <code>await</code>, so you catch it
              like any synchronous exception. This is the biggest ergonomic win
              — one <code>try</code> block can wrap several awaits and a normal{' '}
              <code>finally</code> handles cleanup.
            </>
          ),
        },
        {
          kind: 'code',
          lang: 'js',
          filename: 'try-catch.js',
          caption: 'A rejected await throws — catch it with ordinary try/catch.',
          code: `async function loadDashboard(id) {
  try {
    const user = await fetchUser(id) // throws here if the promise rejects
    const orders = await fetchOrders(user.id)
    return { user, orders }
  } catch (err) {
    // Catches rejection from EITHER await above.
    reportError(err)
    return null
  } finally {
    hideSpinner()
  }
}`,
        },
        {
          kind: 'heading',
          text: 'Sequential vs parallel: the trap',
          id: 'sequential-vs-parallel',
        },
        {
          kind: 'prose',
          body: (
            <>
              This is the single most important async/await skill.{' '}
              <code>await</code>ing inside a loop runs the operations{' '}
              <strong>one after another</strong> — each waits for the previous
              to finish. If the tasks are <em>independent</em>, that's pure
              wasted time. The fix is to <strong>start them all first</strong>{' '}
              (which kicks off the work immediately) and then await the array
              with <code>Promise.all</code>, so they overlap.
            </>
          ),
        },
        {
          kind: 'code',
          lang: 'js',
          filename: 'sequential-vs-parallel.js',
          caption: 'Same three 1s requests: 3s serially vs ~1s concurrently.',
          code: `const ids = [1, 2, 3]

// ❌ SEQUENTIAL — each await blocks the next. ~3s total (1s + 1s + 1s).
async function slow() {
  const results = []
  for (const id of ids) {
    results.push(await fetchUser(id)) // waits fully before the next starts
  }
  return results
}

// ✅ PARALLEL — start all three, THEN await them together. ~1s total.
async function fast() {
  const promises = ids.map((id) => fetchUser(id)) // all kicked off at once
  return Promise.all(promises) // overlap; resolves when the slowest finishes
}`,
        },
        {
          kind: 'callout',
          variant: 'warn',
          title: 'Pitfall — await inside .map / forEach',
          body: (
            <>
              <code>arr.forEach(async (x) =&gt; await f(x))</code> does{' '}
              <strong>not</strong> wait for anything: <code>forEach</code>{' '}
              ignores the returned promises, so the surrounding code races ahead
              while the async callbacks are still pending. And{' '}
              <code>arr.map(async …)</code> gives you an{' '}
              <strong>array of promises</strong>, not values — you must wrap it
              in <code>Promise.all(arr.map(async …))</code> (for concurrency) or
              use a plain <code>for…of</code> with <code>await</code> (for true
              sequencing). If a loop's iterations are independent and you're
              awaiting each one, that's almost always the "should be parallel"
              smell.
            </>
          ),
        },
        {
          kind: 'prose',
          body: (
            <>
              When you genuinely <em>need</em> sequencing — each step depends on
              the previous, or you must rate-limit — a <code>for…of</code> loop
              with <code>await</code> is correct and readable. Reserve{' '}
              <code>Promise.all</code> for independent work. And in ES modules
              you can use <strong>top-level await</strong> (an <code>await</code>{' '}
              outside any function), which makes the whole module's evaluation
              asynchronous — handy for loading config before the module's
              exports are ready.
            </>
          ),
        },
        {
          kind: 'heading',
          text: 'Trace this',
          id: 'trace',
        },
        {
          kind: 'prose',
          body: (
            <>
              Putting it together — sync code, a microtask, and a macrotask.
              Predict the order before reading the answer below.
            </>
          ),
        },
        {
          kind: 'code',
          lang: 'js',
          caption: 'Sync first, then the drained microtask, then the timer.',
          code: `console.log('1 — sync start')

setTimeout(() => console.log('2 — setTimeout (macrotask)'), 0)

Promise.resolve().then(() => console.log('3 — promise (microtask)'))

console.log('4 — sync end')`,
        },
        {
          kind: 'callout',
          variant: 'info',
          title: 'Explained output order',
          body: (
            <>
              The logs print <code>1 → 4 → 3 → 2</code>.{' '}
              <strong>1</strong> and <strong>4</strong> are plain synchronous
              statements, so they run first, top to bottom. Between them, the{' '}
              <code>setTimeout</code> handed its callback to the{' '}
              <em>macrotask</em> queue and the <code>.then</code> handed its
              callback to the <em>microtask</em> queue. Once the synchronous
              script finishes, the engine <strong>drains all microtasks
              first</strong> — so <strong>3</strong> runs — and only then picks
              up the next macrotask, printing <strong>2</strong>. The 0&nbsp;ms
              timer can't jump the queue: microtasks always win.
            </>
          ),
        },
      ],
    },
  ],
}
