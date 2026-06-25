import type { TopicGroup } from '../types/content'
import { MemoryHeapDiagram } from '../components/diagrams'

// Authored in task #4 — "Errors & Debugging" pillar.
// A typed data module: an array of topics, each an ordered list of blocks.
export const errorsDebugging: TopicGroup = {
  id: 'errors-debugging',
  title: 'Errors & Debugging',
  label: 'Errors & Debugging',
  icon: '🐞',
  topics: [
    // ─────────────────────────── ERROR TYPES ───────────────────────────
    {
      slug: 'error-types',
      title: 'Error types & how they happen',
      summary: 'Syntax vs runtime vs logical errors, the built-in error classes, and try/catch.',
      blocks: [
        {
          kind: 'prose',
          body: (
            <>
              Errors come in three flavors, and telling them apart is half the
              battle. A <strong>syntax error</strong> happens at{' '}
              <em>parse time</em>: the engine can't even read your code, so the{' '}
              <strong>whole file fails to run</strong> — one stray bracket and
              nothing executes. A <strong>runtime error</strong> is thrown{' '}
              <em>while the code is executing</em>: the syntax was fine, but
              something blew up mid-flight (you called a non-function, read a
              property of <code>undefined</code>). A <strong>logical error</strong>{' '}
              is the nastiest: the program <em>runs fine and throws nothing</em>,
              it just produces the <strong>wrong result</strong>. No stack trace
              points at it — you find it by comparing expected vs actual output.
            </>
          ),
        },
        {
          kind: 'code',
          lang: 'js',
          caption: 'Same intent, three different failure modes.',
          code: `// 1. Syntax error — parse-time, nothing in this file runs.
function broken( {        // ← missing ')'
  return 1
}
// → Uncaught SyntaxError: missing ) after argument list

// 2. Runtime error — parses fine, throws while executing.
const user = null
console.log(user.name)    // → TypeError: Cannot read properties of null

// 3. Logical error — runs, throws nothing, answer is just wrong.
function average(nums) {
  return nums.reduce((a, b) => a + b, 0) / nums.length - 1 // off-by-one bug
}
average([2, 4, 6]) // → 3  (should be 4); no error, just wrong`,
        },
        {
          kind: 'heading',
          text: 'The built-in error types',
          id: 'builtin-errors',
        },
        {
          kind: 'prose',
          body: (
            <>
              Every thrown error is an object built from one of the standard
              constructors. Knowing <em>which one</em> appears tells you the{' '}
              <strong>category</strong> of mistake before you read a single line:
            </>
          ),
        },
        {
          kind: 'code',
          lang: 'js',
          code: `// TypeError — a value is not the type you used it as.
null.foo                       // read a property of null/undefined
const n = 5; n()               // call something that isn't a function
undefined.map(x => x)          // method on undefined

// ReferenceError — the name doesn't exist (or isn't initialized yet).
console.log(notDeclared)       // never declared
console.log(x); let x = 1      // TDZ: used before its let/const init

// RangeError — a value is outside the legal range.
new Array(-1)                  // invalid array length
;(function f() { return f() })() // Maximum call stack size exceeded

// SyntaxError — invalid code (also thrown by JSON.parse on bad input).
JSON.parse('{ oops }')         // Unexpected token o in JSON

// URIError, EvalError exist too but are rare in app code.`,
        },
        {
          kind: 'prose',
          body: (
            <>
              By far the two you'll meet daily are <strong>TypeError</strong>{' '}
              ("Cannot read properties of undefined" — the canonical null-access
              bug) and <strong>ReferenceError</strong> (a typo'd variable, or a
              <code>let</code>/<code>const</code> used before its line ran — the{' '}
              <em>temporal dead zone</em>). <strong>SyntaxError</strong> is
              special: most of the time the engine catches it before <em>any</em>{' '}
              code runs, so you can't <code>try/catch</code> a syntax error in the
              same file — the exception is dynamic parsing like{' '}
              <code>JSON.parse</code>, which throws a <code>SyntaxError</code> at
              runtime and <em>can</em> be caught.
            </>
          ),
        },
        {
          kind: 'heading',
          text: 'The Error object, throw & try/catch/finally',
          id: 'try-catch',
        },
        {
          kind: 'prose',
          body: (
            <>
              An <code>Error</code> has three useful fields: <code>name</code>{' '}
              (e.g. <code>"TypeError"</code>), <code>message</code> (the
              human-readable string), and <code>stack</code> (the call trail to
              where it was created). You raise one with <code>throw</code>, and
              catch it with <code>try/catch</code>. The <code>finally</code> block
              runs <strong>no matter what</strong> — after a successful{' '}
              <code>try</code>, after a caught error, even after a{' '}
              <code>return</code> — so it's where cleanup belongs.
            </>
          ),
        },
        {
          kind: 'code',
          lang: 'js',
          code: `function readConfig(raw) {
  try {
    return JSON.parse(raw)       // may throw SyntaxError
  } catch (err) {
    // 'err' is the thrown value. Inspect its parts:
    console.error(err.name)      // "SyntaxError"
    console.error(err.message)   // "Unexpected token ..."
    console.error(err.stack)     // full call trail
    return {}                    // recover with a default
  } finally {
    // Always runs — close handles, hide spinners, release locks.
    console.log('parse attempt finished')
  }
}`,
        },
        {
          kind: 'callout',
          variant: 'warn',
          title: 'Pitfall — catch(err) where err might not be an Error',
          body: (
            <>
              JavaScript lets you <code>throw</code> <em>any</em> value —{' '}
              <code>throw 'boom'</code> or <code>throw 42</code> are legal — so a
              caught <code>err</code> isn't guaranteed to have{' '}
              <code>.message</code>. In TypeScript the catch binding is typed{' '}
              <code>unknown</code> for exactly this reason. Narrow before you
              touch it: <code>if (err instanceof Error) …</code>, otherwise{' '}
              <code>String(err)</code>. Always throw real <code>Error</code>{' '}
              objects yourself so the stack trace is preserved.
            </>
          ),
        },
        {
          kind: 'heading',
          text: 'Custom error classes',
          id: 'custom-errors',
        },
        {
          kind: 'prose',
          body: (
            <>
              Extending <code>Error</code> lets you <strong>throw by category</strong>{' '}
              and then <code>catch</code> with an <code>instanceof</code> check —
              far cleaner than parsing message strings. Set the <code>name</code>{' '}
              and attach any structured data (a status code, an offending field)
              as your own properties.
            </>
          ),
        },
        {
          kind: 'code',
          lang: 'ts',
          filename: 'errors.ts',
          code: `export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status = 500,
  ) {
    super(message)
    this.name = 'AppError' // so err.name / logs read correctly
  }
}

export class NotFoundError extends AppError {
  constructor(what: string) {
    super(\`\${what} not found\`, 'NOT_FOUND', 404)
    this.name = 'NotFoundError'
  }
}

// Branch on the *type*, not the message text:
try {
  throw new NotFoundError('User')
} catch (err) {
  if (err instanceof NotFoundError) respond(err.status, err.message) // 404
  else if (err instanceof AppError) respond(err.status, err.message)
  else throw err // unknown — re-throw so it isn't swallowed
}`,
        },
        {
          kind: 'callout',
          variant: 'info',
          title: 'super(message) must come first',
          body: (
            <>
              In a subclass constructor you must call <code>super(...)</code>{' '}
              before touching <code>this</code>. Setting <code>this.name</code>{' '}
              after <code>super(message)</code> gives clean logs. (Pre-ES2015
              transpile targets also needed an{' '}
              <code>Object.setPrototypeOf(this, new.target.prototype)</code> dance
              to make <code>instanceof</code> work — modern targets don't.)
            </>
          ),
        },
        {
          kind: 'heading',
          text: 'Errors you can never catch with try/catch',
          id: 'global-handlers',
        },
        {
          kind: 'prose',
          body: (
            <>
              <code>try/catch</code> only catches <strong>synchronous</strong>{' '}
              throws in the same call. Two big sources of errors escape it: an
              error thrown inside an <code>async</code> callback / timer (it's on
              a later tick), and a <strong>rejected promise</strong> nobody{' '}
              <code>await</code>ed or <code>.catch()</code>ed. For those you need{' '}
              <em>global</em> handlers.
            </>
          ),
        },
        {
          kind: 'code',
          lang: 'js',
          caption: 'Last-resort global handlers — log to your error service here.',
          code: `// Browser: an uncaught synchronous error anywhere on the page.
window.addEventListener('error', (event) => {
  reportToSentry(event.error) // event.message, event.filename, event.lineno
})

// Browser: a promise that rejected with no .catch()/await.
window.addEventListener('unhandledrejection', (event) => {
  reportToSentry(event.reason) // the rejection value
  event.preventDefault()       // silence the default console warning
})

// Node equivalents:
process.on('uncaughtException', (err) => { log(err); process.exit(1) })
process.on('unhandledRejection', (reason) => { log(reason) })

// This is why a forgotten 'await' is dangerous — the rejection
// surfaces here, far from where it happened, with a worse stack.
async function load() {
  fetchUser() // ← missing await: rejection escapes to 'unhandledrejection'
}`,
        },
        {
          kind: 'callout',
          variant: 'danger',
          title: 'Swallowing errors is worse than crashing',
          body: (
            <>
              An empty <code>catch {}</code> (or one that only{' '}
              <code>console.log</code>s and continues) hides the bug while letting
              the program limp on with corrupt state — you get a mysterious wrong
              result later, miles from the cause. Either{' '}
              <strong>handle</strong> the error meaningfully (recover, retry,
              show the user something) or <strong>re-throw</strong> it. Never
              catch just to make the red text disappear.
            </>
          ),
        },
        {
          kind: 'table',
          caption: 'Error → typical cause → quick fix.',
          headers: ['Error', 'Typical cause', 'Quick fix'],
          rows: [
            [
              <code>TypeError: Cannot read properties of undefined</code>,
              'Accessing .x on something that is null/undefined',
              <>
                Optional chaining <code>obj?.x</code>, a default{' '}
                <code>(obj ?? {}).x</code>, or guard before access
              </>,
            ],
            [
              <code>TypeError: x is not a function</code>,
              'Wrong import, typo, or x is actually a value/undefined',
              <>
                Check the import/spelling; <code>console.log(typeof x)</code> to
                confirm
              </>,
            ],
            [
              <code>ReferenceError: x is not defined</code>,
              'Undeclared variable, typo, or wrong scope',
              <>Declare it, fix the typo, or import it</>,
            ],
            [
              <code>ReferenceError: Cannot access 'x' before initialization</code>,
              <>
                Used a <code>let</code>/<code>const</code> in its temporal dead
                zone
              </>,
              <>Move the use below the declaration</>,
            ],
            [
              <code>RangeError: Maximum call stack size exceeded</code>,
              'Unbounded / infinite recursion',
              <>Add or fix the base case; or convert to a loop</>,
            ],
            [
              <code>SyntaxError: Unexpected token … in JSON</code>,
              <>
                <code>JSON.parse</code> on non-JSON (often an HTML error page)
              </>,
              <>Log the raw string; check the response is actually JSON</>,
            ],
          ],
        },
      ],
    },

    // ──────────────────────── CALL STACK OVERFLOW ────────────────────────
    {
      slug: 'call-stack-overflow',
      title: '“Maximum call stack size exceeded”',
      summary: 'How the call stack works, why recursion overflows it, and how to fix it.',
      blocks: [
        {
          kind: 'prose',
          body: (
            <>
              Every function call pushes a <strong>frame</strong> onto the{' '}
              <strong>call stack</strong> — a chunk of memory holding that call's
              arguments, local variables, and the return address. When the
              function returns, its frame is <strong>popped</strong> off. It's{' '}
              <strong>LIFO</strong> (last in, first out) and, crucially,{' '}
              <strong>finite</strong>: each engine caps how deep it can go (often
              ~10–15k frames). Push past that ceiling and you get{' '}
              <code>RangeError: Maximum call stack size exceeded</code> — a{' '}
              <em>stack overflow</em>.
            </>
          ),
        },
        {
          kind: 'code',
          lang: 'js',
          caption: 'Each call adds a frame; the engine throws when the stack is full.',
          code: `function a() { b() }   // frame a pushed → calls b
function b() { c() }   // frame b pushed → calls c
function c() {         // frame c pushed
  throw new Error('boom')
}
a()
// Stack when it throws (top = most recent):
//   c   ← threw here
//   b
//   a
//   (anonymous / module top)`,
        },
        {
          kind: 'prose',
          body: (
            <>
              The overflow almost always means <strong>recursion that never
              stops</strong>: a missing base case, a base case that's never
              actually reached, or <strong>mutual recursion</strong> (
              <code>even</code> calls <code>odd</code> calls <code>even</code> …)
              with no exit. The function keeps calling deeper, frames pile up, and
              the stack runs out of room.
            </>
          ),
        },
        {
          kind: 'code',
          lang: 'js',
          filename: 'countdown.js',
          code: `// ❌ BROKEN — no base case, so it recurses forever.
function countdown(n) {
  console.log(n)
  return countdown(n - 1) // never stops → stack overflow
}
countdown(3) // 3, 2, 1, 0, -1, -2, … 💥 Maximum call stack size exceeded

// ✅ FIXED — a base case the recursion actually reaches.
function countdown(n) {
  if (n < 0) return        // ← the exit condition
  console.log(n)
  return countdown(n - 1)
}
countdown(3) // 3, 2, 1, 0 — done`,
        },
        {
          kind: 'callout',
          variant: 'key',
          title: 'A correct recursion needs two things',
          body: (
            <>
              <strong>1.</strong> A <strong>base case</strong> that returns
              without recursing. <strong>2.</strong> Every recursive call must{' '}
              <strong>move toward</strong> that base case (here, <code>n</code>{' '}
              shrinks). If either is missing — or the argument doesn't actually
              approach the base case (e.g. <code>countdown(n)</code> instead of{' '}
              <code>n - 1</code>) — you overflow.
            </>
          ),
        },
        {
          kind: 'heading',
          text: 'Fix #2: turn deep recursion into iteration',
          id: 'recursion-to-iteration',
        },
        {
          kind: 'prose',
          body: (
            <>
              Even <em>correct</em> recursion overflows if it's simply too deep
              (walking a 100k-node list, summing a huge range). JavaScript engines
              don't reliably do tail-call optimization, so the safe fix is to
              rewrite the recursion as a <strong>loop</strong> — moving the state
              from the call stack onto the heap, where it can grow far larger.
            </>
          ),
        },
        {
          kind: 'code',
          lang: 'js',
          caption: 'Recursive sum overflows for large n; the loop version never does.',
          code: `// ❌ Recursive — frame per number; overflows around n ≈ 10k.
function sum(n) {
  return n === 0 ? 0 : n + sum(n - 1)
}
sum(100000) // 💥 Maximum call stack size exceeded

// ✅ Iterative — one frame, a heap-allocated counter, unbounded.
function sum(n) {
  let total = 0
  for (let i = n; i > 0; i--) total += i
  return total
}
sum(100000) // 5000050000 — fine`,
        },
        {
          kind: 'prose',
          body: (
            <>
              For tree/graph walks where a plain loop won't do, replace the call
              stack with an <strong>explicit stack</strong> (an array you{' '}
              <code>push</code>/<code>pop</code>). Same traversal, but the "stack"
              now lives on the heap and won't blow the call-stack ceiling:
            </>
          ),
        },
        {
          kind: 'code',
          lang: 'js',
          caption: 'Depth-first traversal with an explicit stack instead of recursion.',
          code: `function walk(root) {
  const stack = [root] // our own stack on the heap
  while (stack.length) {
    const node = stack.pop()
    visit(node)
    // push children to keep going deeper
    for (const child of node.children) stack.push(child)
  }
}`,
        },
        {
          kind: 'heading',
          text: 'Fix #3: trampolining (deep but finite recursion)',
          id: 'trampoline',
        },
        {
          kind: 'prose',
          body: (
            <>
              When an algorithm is naturally recursive and you want to keep that
              shape, a <strong>trampoline</strong> lets recursion run to any depth
              without growing the stack. The trick: instead of calling itself, the
              function <strong>returns a thunk</strong> (a zero-arg function for
              the next step), and a driver loop keeps invoking thunks until it
              gets a real value. Each step runs in a <em>fresh</em> frame, so the
              stack never deepens.
            </>
          ),
        },
        {
          kind: 'code',
          lang: 'js',
          caption: 'The recursive step returns a thunk; the trampoline loop unwinds it.',
          code: `function trampoline(fn) {
  return (...args) => {
    let result = fn(...args)
    while (typeof result === 'function') result = result() // bounce
    return result
  }
}

// Return the next step as a thunk instead of calling directly.
const sum = trampoline(function step(n, acc = 0) {
  return n === 0 ? acc : () => step(n - 1, acc + n)
})

sum(1_000_000) // 500000500000 — no overflow, constant stack depth`,
        },
        {
          kind: 'callout',
          variant: 'danger',
          title: 'Accidental infinite recursion is sneaky',
          body: (
            <>
              The classic surprise: a <strong>getter that reads itself</strong> —{' '}
              <code>get name() {'{'} return this.name {'}'}</code> recurses
              forever (use a backing field like <code>this._name</code>). Same
              with a <strong>Proxy</strong> whose trap triggers the very access it
              traps, <code>toJSON</code>/<code>toString</code> that stringify the
              object they're defining, or a <strong>React component that calls
              its own setter during render</strong> (re-render → setter → re-render
              → "Maximum update depth exceeded," React's flavor of the same loop).
              When you see an overflow with <em>no obvious recursive call</em>,
              suspect one of these self-referential traps.
            </>
          ),
        },
      ],
    },

    // ─────────────────────── HEAP OUT OF MEMORY ───────────────────────
    {
      slug: 'heap-out-of-memory',
      title: '“JavaScript heap out of memory”',
      summary: 'Why V8’s heap fills up, the --max-old-space-size band-aid, and the real fixes.',
      blocks: [
        {
          kind: 'prose',
          body: (
            <>
              The call stack holds <em>frames</em>; the <strong>heap</strong>{' '}
              holds <strong>objects</strong> — arrays, strings, closures,
              everything you <code>new</code> or build at runtime. V8's heap is{' '}
              <strong>bounded</strong>: the "old space" (where long-lived objects
              live) has a hard ceiling — historically ~2&nbsp;GB on 64-bit, often
              ~4&nbsp;GB on modern Node defaults. Allocate past it and you get the
              fatal <code>FATAL ERROR: … JavaScript heap out of memory</code> and
              the process dies. Unlike a stack overflow you can't{' '}
              <code>catch</code> it — the engine is already out of room.
            </>
          ),
        },
        {
          kind: 'diagram',
          render: MemoryHeapDiagram,
          title: 'Stack vs heap, and what gets garbage-collected',
          caption:
            'Objects reachable from the roots (the call stack, globals) are retained; anything unreachable is unreferenced garbage and gets freed.',
        },
        {
          kind: 'prose',
          body: (
            <>
              What actually blows the heap is rarely one giant object — it's{' '}
              <strong>unbounded growth</strong>:
            </>
          ),
        },
        {
          kind: 'prose',
          body: (
            <>
              <strong>(1)</strong> a cache — an <code>Array</code>,{' '}
              <code>Map</code>, or object used as a lookup — that{' '}
              <strong>never evicts</strong>, so it grows for the life of the
              process. <strong>(2)</strong> Accumulating into a collection inside
              a long loop (pushing every row of a billion-row job into one array).{' '}
              <strong>(3)</strong> Loading a huge file or API response{' '}
              <strong>fully into memory</strong> — <code>fs.readFile</code> on a
              5&nbsp;GB log, or <code>JSON.parse</code> on a giant payload —
              instead of streaming it.
            </>
          ),
        },
        {
          kind: 'code',
          lang: 'js',
          caption: 'Three ways to exhaust the heap — all about growth without bound.',
          code: `// (1) A cache that never evicts — grows forever.
const cache = new Map()
function memoize(key, compute) {
  if (!cache.has(key)) cache.set(key, compute()) // nothing ever deletes
  return cache.get(key)
}

// (2) Accumulating everything in a loop.
const all = []
for await (const row of hugeDatabaseCursor) all.push(row) // holds it ALL

// (3) Reading a giant file fully into memory.
const text = fs.readFileSync('./10gb-export.json', 'utf8') // 💥
const data = JSON.parse(text)`,
        },
        {
          kind: 'heading',
          text: 'The --max-old-space-size flag (a band-aid)',
          id: 'max-old-space',
        },
        {
          kind: 'prose',
          body: (
            <>
              You can raise the ceiling with a Node flag. It buys headroom for a
              job that's <em>legitimately</em> big, but if your code leaks or
              grows without bound, this just delays the crash and makes GC pauses
              longer. <strong>It is a band-aid, not a fix.</strong>
            </>
          ),
        },
        {
          kind: 'code',
          lang: 'bash',
          caption: 'Value is in megabytes. 4096 = ~4 GB. Treat as a stopgap.',
          code: `# Raise the old-space limit for one run:
node --max-old-space-size=4096 build.js

# Common when a tool (webpack, jest, tsc) OOMs on a big repo:
NODE_OPTIONS="--max-old-space-size=8192" npm run build

# Diagnose first — print heap usage so you know if it's a leak:
node -e "setInterval(() => {
  const m = process.memoryUsage()
  console.log((m.heapUsed / 1e6).toFixed(0) + ' MB used')
}, 1000)"`,
        },
        {
          kind: 'heading',
          text: 'The real fixes',
          id: 'heap-fixes',
        },
        {
          kind: 'prose',
          body: (
            <>
              <strong>Stream / paginate / chunk</strong> so you only ever hold a
              window of the data, not all of it. <strong>Bound your caches</strong>{' '}
              with a max size and an eviction policy (LRU). And{' '}
              <strong>release references</strong> you're done with so the GC can
              reclaim them. The streaming version below processes a file of{' '}
              <em>any</em> size in near-constant memory:
            </>
          ),
        },
        {
          kind: 'code',
          lang: 'js',
          filename: 'process-log.js',
          caption: 'Reading all (left) vs streaming line-by-line (right) — bounded memory.',
          code: `import fs from 'node:fs'
import readline from 'node:readline'

// ❌ Loads the entire file into the heap at once.
function countErrorsBad(path) {
  const text = fs.readFileSync(path, 'utf8') // whole file in memory 💥
  return text.split('\\n').filter((l) => l.includes('ERROR')).length
}

// ✅ Streams one line at a time — memory stays flat regardless of size.
async function countErrors(path) {
  const rl = readline.createInterface({
    input: fs.createReadStream(path), // a stream, not a buffer
    crlfDelay: Infinity,
  })
  let count = 0
  for await (const line of rl) {
    if (line.includes('ERROR')) count++ // process + discard each line
  }
  return count
}`,
        },
        {
          kind: 'code',
          lang: 'ts',
          caption: 'A bounded LRU cache — evicts the oldest entry past the cap, so it can’t grow forever.',
          code: `class LRUCache<K, V> {
  private map = new Map<K, V>()
  constructor(private max = 500) {}

  get(key: K): V | undefined {
    if (!this.map.has(key)) return undefined
    const val = this.map.get(key)!
    this.map.delete(key) // re-insert to mark as most-recently-used
    this.map.set(key, val)
    return val
  }

  set(key: K, val: V): void {
    if (this.map.has(key)) this.map.delete(key)
    this.map.set(key, val)
    if (this.map.size > this.max) {
      // Map preserves insertion order → first key is the oldest.
      this.map.delete(this.map.keys().next().value as K)
    }
  }
}`,
        },
        {
          kind: 'callout',
          variant: 'tip',
          title: 'Diagnose before you medicate',
          body: (
            <>
              Before reaching for <code>--max-old-space-size</code>, watch{' '}
              <code>process.memoryUsage().heapUsed</code> over time. If it climbs
              and <strong>never comes back down</strong> across GC cycles, you
              have a <em>leak</em> (next topic) — a bigger heap won't save you, it
              just postpones the crash. If it's a one-off big job that plateaus,
              the flag is legitimate. Take a heap snapshot in DevTools (Memory
              panel) to see <em>what</em> is retained.
            </>
          ),
        },
      ],
    },

    // ───────────────────────── MEMORY LEAKS ─────────────────────────
    {
      slug: 'memory-leaks',
      title: 'Memory leaks (and React ones)',
      summary: 'Memory that’s still reachable but no longer needed — the classic causes and the React fixes.',
      blocks: [
        {
          kind: 'prose',
          body: (
            <>
              JavaScript is garbage-collected: the GC frees any object that's{' '}
              <strong>unreachable</strong> from the roots. A{' '}
              <strong>memory leak</strong> is the opposite — memory you{' '}
              <em>no longer need</em> but that's still <strong>reachable</strong>,
              so the GC is <em>obligated</em> to keep it. Nothing crashes
              immediately; the heap just creeps upward until, eventually, you hit{' '}
              the out-of-memory error from the previous topic. A leak is a{' '}
              <strong>retention bug</strong>: a reference you forgot to drop.
            </>
          ),
        },
        {
          kind: 'heading',
          text: 'The four classic causes',
          id: 'classic-leaks',
        },
        {
          kind: 'code',
          lang: 'js',
          caption: 'Each of these keeps something alive that should have been collected.',
          code: `// (1) Accidental global — a typo without let/const sticks it on window,
//     which is a root, so it's never collected.
function init() {
  cache = new Array(1e6) // missing 'const' → global 'cache' leaks
}

// (2) Forgotten timer — the interval (a root) keeps its closure, and
//     everything the closure captures, alive forever.
function poll(bigData) {
  setInterval(() => check(bigData), 1000) // never cleared → bigData pinned
}

// (3) Detached DOM node — removed from the page but still referenced in JS,
//     so the whole subtree stays in memory.
const removed = document.getElementById('panel')
document.body.removeChild(removed)
// 'removed' (and its children) can't be freed while this variable holds it.

// (4) Lingering listener / closure holding a big object.
const huge = loadHugeThing()
window.addEventListener('resize', () => layout(huge)) // never removed`,
        },
        {
          kind: 'prose',
          body: (
            <>
              The common thread: a <strong>root</strong> (a global, a live timer,
              the DOM, the event system) holds a reference, and that reference{' '}
              <em>transitively</em> keeps a whole graph of objects alive. Fixes:
              declare variables (never leak to global), <strong>clear timers</strong>{' '}
              with <code>clearInterval</code>/<code>clearTimeout</code>,{' '}
              <strong>null out</strong> references to detached nodes, and{' '}
              <strong>remove listeners</strong> with{' '}
              <code>removeEventListener</code> (or an <code>AbortController</code>)
              when you're done.
            </>
          ),
        },
        {
          kind: 'callout',
          variant: 'tip',
          title: 'WeakMap / WeakSet hold keys weakly',
          body: (
            <>
              If you need to associate data with an object <em>without</em>{' '}
              keeping that object alive, use <code>WeakMap</code>/
              <code>WeakSet</code>. Their keys are <strong>weakly held</strong> —
              when the only remaining reference to a key is the WeakMap entry, the
              GC can collect both. Perfect for caches keyed by DOM nodes or
              component instances, where a regular <code>Map</code> would pin them
              forever.
            </>
          ),
        },
        {
          kind: 'heading',
          text: 'React-specific leaks',
          id: 'react-leaks',
        },
        {
          kind: 'prose',
          body: (
            <>
              In React the #1 cause is a <code>useEffect</code> that sets
              something up — a subscription, an interval, an event listener — and{' '}
              <strong>never tears it down</strong>. Every mount adds another live
              subscription; with hot-reload or remounts they stack up. The fix is
              always the same: <strong>return a cleanup function</strong> from the
              effect. React runs it on unmount, and again before re-running the
              effect.
            </>
          ),
        },
        {
          kind: 'code',
          lang: 'tsx',
          filename: 'Clock.tsx',
          caption: 'The interval leaks on every unmount — until you return the cleanup.',
          code: `// ❌ BUG — a new interval per mount, none ever cleared.
function Clock() {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    setInterval(() => setNow(Date.now()), 1000)
    // no return → the interval lives forever, leaking the closure +
    // calling setState on an unmounted component
  }, [])
  return <span>{new Date(now).toLocaleTimeString()}</span>
}

// ✅ FIX — return a cleanup that clears the interval.
function Clock() {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id) // runs on unmount / before re-run
  }, [])
  return <span>{new Date(now).toLocaleTimeString()}</span>
}`,
        },
        {
          kind: 'prose',
          body: (
            <>
              The same shape covers every external resource — DOM listeners, store
              subscriptions, and in-flight fetches. For fetches, an{' '}
              <code>AbortController</code> both cancels the request and prevents a{' '}
              "set state after unmount" update:
            </>
          ),
        },
        {
          kind: 'code',
          lang: 'tsx',
          caption: 'Cleanup for a listener, a subscription, and an aborted fetch.',
          code: `useEffect(() => {
  const onResize = () => setW(window.innerWidth)
  window.addEventListener('resize', onResize)
  const sub = store.subscribe(handleChange)
  const controller = new AbortController()

  fetch('/api/data', { signal: controller.signal })
    .then((r) => r.json())
    .then(setData)
    .catch((e) => { if (e.name !== 'AbortError') setError(e) })

  // One cleanup tears down all three:
  return () => {
    window.removeEventListener('resize', onResize)
    sub.unsubscribe()
    controller.abort()
  }
}, [])`,
        },
        {
          kind: 'callout',
          variant: 'danger',
          title: 'Module-scope state grows forever',
          body: (
            <>
              A <code>Map</code>, array, or cache declared at{' '}
              <strong>module scope</strong> (outside any component) lives for the
              <em>entire session</em> — it is effectively a root. If a component
              keeps <code>push</code>ing into it on every render or every mount
              and nothing prunes it, you have a guaranteed leak that survives every
              unmount. Keep per-instance state in <code>useState</code>/
              <code>useRef</code>, and if you must cache at module scope,{' '}
              <strong>bound it</strong> (LRU/max size) just like the heap topic.
            </>
          ),
        },
        {
          kind: 'callout',
          variant: 'tip',
          title: 'Find leaks with three heap snapshots',
          body: (
            <>
              In DevTools → <strong>Memory</strong>, take a snapshot, exercise the
              suspect flow (mount/unmount a route a few times), take another, and
              use <strong>Comparison</strong> view. Objects whose count keeps{' '}
              <em>rising</em> across snapshots — especially <em>Detached</em> DOM
              nodes — are your leak. The "Retainers" tree shows exactly which
              reference is keeping each one alive.
            </>
          ),
        },
      ],
    },

    // ───────────────────────── DEBUGGING TOOLKIT ─────────────────────────
    {
      slug: 'debugging-toolkit',
      title: 'How to debug & fix',
      summary: 'A practical workflow: read the stack trace, set breakpoints, and use the console fully.',
      blocks: [
        {
          kind: 'prose',
          body: (
            <>
              Debugging is a <strong>loop</strong>, not a guess:{' '}
              <strong>reproduce</strong> the bug reliably,{' '}
              <strong>read the error</strong> (name + message + stack),{' '}
              <strong>locate</strong> it (breakpoint or log at the suspect line),{' '}
              <strong>form a hypothesis</strong>, change one thing, and{' '}
              <strong>verify</strong>. The skills below make each step faster — but
              the discipline of changing <em>one variable at a time</em> is what
              actually fixes things.
            </>
          ),
        },
        {
          kind: 'heading',
          text: 'Read the stack trace',
          id: 'stack-trace',
        },
        {
          kind: 'prose',
          body: (
            <>
              A stack trace is the call chain captured when the error was created,
              printed <strong>top-down</strong>: the <strong>top frame is where
              it threw</strong>, and each line below is the caller, all the way out
              to the entry point. Read top-to-bottom and stop at the{' '}
              <strong>first line that's your code</strong> (the top frames are
              often inside a library). In production, minified bundles make this
              gibberish — <strong>source maps</strong> map the minified line back
              to your original source so the trace points at real files.
            </>
          ),
        },
        {
          kind: 'code',
          lang: 'bash',
          caption: 'Top frame threw; follow down to the first line that’s yours.',
          code: `TypeError: Cannot read properties of undefined (reading 'name')
    at formatUser (utils.js:42:18)        ← it threw HERE (your code)
    at renderRow (UserList.jsx:17:23)     ← called from here (your code)
    at Array.map (<anonymous>)            ← library/builtin frame, skip
    at UserList (UserList.jsx:15:30)
    at renderWithHooks (react-dom.js:...) ← framework internals, skip

# Read: formatUser got an undefined user. Fix at utils.js:42,
# but the *cause* is whatever passed undefined in from UserList:17.`,
        },
        {
          kind: 'heading',
          text: 'Breakpoints beat scattered console.log',
          id: 'breakpoints',
        },
        {
          kind: 'prose',
          body: (
            <>
              Sprinkling <code>console.log</code> works, but it's slow: edit,
              reload, repeat. In DevTools → <strong>Sources</strong> you set a{' '}
              <strong>breakpoint</strong> by clicking a line number; execution
              pauses there and you can inspect <em>every</em> variable in scope,
              walk the call stack, and step through. Two upgrades you should use:{' '}
              <strong>conditional breakpoints</strong> (right-click → pause only
              when <code>id === '42'</code>) and <strong>logpoints</strong> (log
              an expression <em>without editing the code</em> — like a{' '}
              <code>console.log</code> you add and remove from the gutter).
            </>
          ),
        },
        {
          kind: 'code',
          lang: 'js',
          caption: 'The debugger statement pauses execution when DevTools is open.',
          code: `function applyDiscount(cart) {
  const total = cart.items.reduce((s, i) => s + i.price, 0)
  debugger // ← execution pauses here; inspect 'total', 'cart', step through
  return total > 100 ? total * 0.9 : total
}
// Better than logging: pause once, hover any variable, edit + resume live.
// (Remove debugger statements before committing — a lint rule can enforce it.)`,
        },
        {
          kind: 'heading',
          text: 'The console beyond log()',
          id: 'console-methods',
        },
        {
          kind: 'prose',
          body: (
            <>
              <code>console.log</code> is one method of many. The rest turn a wall
              of text into something you can actually read:
            </>
          ),
        },
        {
          kind: 'code',
          lang: 'js',
          code: `console.table(users)          // arrays/objects as a sortable grid
console.dir(domNode)          // the object/DOM node as an expandable tree
console.trace('got here')     // print the current call stack inline
console.assert(qty > 0, 'qty must be positive', { qty }) // log only if false
console.count('render')       // "render: 1", "render: 2" … tally calls
console.group('request')      // indent a related batch of logs
  console.log('url', url)
console.groupEnd()
console.time('parse'); /* … */ console.timeEnd('parse') // "parse: 3.2ms"
console.log('%cBIG', 'font-size:20px;color:tomato') // %c = CSS styling`,
        },
        {
          kind: 'prose',
          body: (
            <>
              <strong>Symptom → diagnose → fix, in miniature:</strong> a list
              renders in the wrong order. <code>console.table(items)</code> shows
              the array sorted by <code>name</code> when you expected{' '}
              <code>date</code> → the bug is your comparator, not the render. One
              targeted <code>console.table</code> replaced ten <code>log</code>s.
            </>
          ),
        },
        {
          kind: 'heading',
          text: 'Debugging Node & React',
          id: 'node-react-debug',
        },
        {
          kind: 'prose',
          body: (
            <>
              Node code gets the <em>same</em> Chrome debugger. Start it with{' '}
              <code>--inspect</code> and open <code>chrome://inspect</code> (or use
              your editor's debugger) to get breakpoints, scopes, and the console
              against server code. For React render performance, the{' '}
              <strong>React DevTools Profiler</strong> records a commit and shows
              which components re-rendered and how long each took — the way to find
              "why is typing laggy."
            </>
          ),
        },
        {
          kind: 'code',
          lang: 'bash',
          code: `# Start Node with the inspector, then open chrome://inspect:
node --inspect server.js

# Pause on the very first line (handy for startup bugs):
node --inspect-brk server.js

# Inspect a running process you forgot to start with --inspect:
kill -SIGUSR1 <pid>   # Node opens the inspector on signal (Unix)`,
        },
        {
          kind: 'callout',
          variant: 'tip',
          title: 'React DevTools: who re-rendered and why',
          body: (
            <>
              Turn on <em>“Highlight updates when components render”</em> to see
              flashes on every re-render — a component flashing on unrelated state
              changes is a memoization opportunity. The <strong>Profiler</strong>{' '}
              tab's flamegraph colors the expensive commits; click a component to
              see <em>why it rendered</em> (props/state/hooks changed). That's how
              you turn "it feels slow" into a specific fix.
            </>
          ),
        },
        {
          kind: 'table',
          caption: 'Symptom → the tool that diagnoses it fastest.',
          headers: ['Symptom', 'Reach for'],
          rows: [
            [
              'Uncaught error, need the call chain',
              <>
                The <strong>stack trace</strong> (top frame = where it threw) +
                source maps
              </>,
            ],
            [
              'Value is wrong but no error',
              <>
                <strong>Breakpoint / logpoint</strong> in Sources; inspect scope
                live
              </>,
            ],
            [
              'Array/object of data is hard to read',
              <code>console.table</code>,
            ],
            [
              '“How did execution get here?”',
              <code>console.trace()</code>,
            ],
            [
              'A function runs more often than expected',
              <>
                <code>console.count()</code> or a <strong>logpoint</strong>
              </>,
            ],
            [
              'Server-side / Node bug',
              <>
                <code>node --inspect</code> + <code>chrome://inspect</code>
              </>,
            ],
            [
              'React app feels laggy / over-renders',
              <>
                <strong>React DevTools Profiler</strong> + “highlight updates”
              </>,
            ],
            [
              'Network request failing / slow',
              <>
                The <strong>Network</strong> panel (status, timing, payload)
              </>,
            ],
            [
              'Heap keeps growing (leak)',
              <>
                <strong>Memory</strong> panel → compare heap snapshots
              </>,
            ],
          ],
        },
      ],
    },

    // ─────────────────────── CHROME DEVTOOLS TOUR ───────────────────────
    {
      slug: 'chrome-devtools-tour',
      title: 'Chrome DevTools: what each panel does',
      summary: 'A reference to every DevTools panel and when to open it.',
      blocks: [
        {
          kind: 'prose',
          body: (
            <>
              DevTools (<code>F12</code>, or <code>Cmd/Ctrl+Shift+I</code>) is a
              dozen tools in one window. Most developers live in three —{' '}
              <strong>Elements</strong>, <strong>Console</strong>,{' '}
              <strong>Network</strong> — and only visit the rest when chasing a
              specific class of problem. Here's the whole map, plus what each
              panel is actually <em>for</em>.
            </>
          ),
        },
        {
          kind: 'table',
          caption: 'Every panel and the job it does.',
          headers: ['Panel', 'What you use it for'],
          rows: [
            [
              <strong>Elements</strong>,
              <>
                Inspect &amp; live-edit the DOM and CSS; the box model
                (margin/border/padding), computed styles, and an element's{' '}
                <em>event listeners</em>.
              </>,
            ],
            [
              <strong>Console</strong>,
              <>
                Read logs &amp; errors, and <em>run JavaScript</em> against the
                live page (<code>$0</code> = the selected element).
              </>,
            ],
            [
              <strong>Sources</strong>,
              <>
                The debugger: breakpoints, step-through, scopes &amp; call stack,
                source maps, and reusable <em>Snippets</em>.
              </>,
            ],
            [
              <strong>Network</strong>,
              <>
                Every request — status codes, timing waterfall, headers,
                payloads; throttle to slow 3G; filter by type/XHR.
              </>,
            ],
            [
              <strong>Performance</strong>,
              <>
                Record a runtime profile: the flame chart, long tasks / jank, FPS,
                and where time goes (scripting vs layout vs paint).
              </>,
            ],
            [
              <strong>Memory</strong>,
              <>
                Heap snapshots (and compare two to find leaks) plus the
                allocation timeline — what's retained and by whom.
              </>,
            ],
            [
              <strong>Application</strong>,
              <>
                Storage &amp; platform state: <code>localStorage</code>/
                <code>sessionStorage</code>, cookies, IndexedDB, the Cache,
                service workers, and the web-app manifest.
              </>,
            ],
            [
              <strong>Lighthouse</strong>,
              <>
                Automated audits scored 0–100: Performance, Accessibility, SEO,
                Best Practices, and PWA — with actionable fixes.
              </>,
            ],
            [
              <strong>Recorder</strong>,
              <>
                Record a user flow (click → type → submit) and replay it; export
                it as a script or measure its performance.
              </>,
            ],
            [
              <strong>Device toolbar</strong>,
              <>
                Responsive / mobile emulation — device sizes, touch, and{' '}
                user-agent — toggled with <code>Cmd/Ctrl+Shift+M</code>.
              </>,
            ],
            [
              <strong>Coverage</strong>,
              <>
                Shows unused JS &amp; CSS for the current page — a guide to what
                you could code-split or strip.
              </>,
            ],
          ],
        },
        {
          kind: 'prose',
          body: (
            <>
              <strong>Elements</strong> is for "why does it look like that?" — you
              hover the markup to highlight it on the page, edit styles live to try
              a fix, and read <em>Computed</em> to see which rule actually won the
              cascade. The <strong>Event Listeners</strong> sub-tab reveals every
              handler bound to an element, which is gold when a click "does
              nothing."
            </>
          ),
        },
        {
          kind: 'prose',
          body: (
            <>
              <strong>Network</strong> is the first stop for any data problem.
              Click a request to read its <em>Headers</em>, <em>Payload</em>, and{' '}
              <em>Response</em>; the <strong>Status</strong> column tells the story
              fast — <code>404</code> wrong URL, <code>401/403</code> auth,{' '}
              <code>500</code> server, <code>(failed) net::ERR_…</code> CORS or a
              dropped connection. The <strong>Timing</strong> tab breaks a slow
              request into <em>waiting (TTFB)</em> vs <em>download</em>, and the
              throttling dropdown lets you feel the app on slow 3G.
            </>
          ),
        },
        {
          kind: 'prose',
          body: (
            <>
              <strong>Performance</strong> answers "why is it janky?" Record while
              you reproduce the lag, then read the flame chart: wide bars are{' '}
              <strong>long tasks</strong> that block the main thread (the cause of
              dropped frames). <strong>Memory</strong> answers "why does it keep
              growing?" — take a snapshot, repeat the suspect action, snapshot
              again, and compare to surface objects that never get freed.{' '}
              <strong>Application</strong> is where you inspect and clear
              storage/cookies and debug service workers and PWA caches.
            </>
          ),
        },
        {
          kind: 'callout',
          variant: 'tip',
          title: 'Two shortcuts that pay for themselves',
          body: (
            <>
              <code>Cmd/Ctrl+Shift+C</code> jumps straight into{' '}
              <strong>inspect-element</strong> mode — click any pixel on the page
              to select its node in Elements (no need to open DevTools first).
              And <code>Esc</code> toggles the <strong>drawer</strong>: a Console
              (and Coverage, Rendering, etc.) that slides up over <em>any</em>{' '}
              panel, so you can watch logs while standing in Sources, Network, or
              Performance.
            </>
          ),
        },
      ],
    },
  ],
}
