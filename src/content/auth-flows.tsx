import type { TopicGroup } from '../types/content'
import { AuthFlowDiagram, ProdAuthDiagram } from '../components/diagrams'

// Authored in task #4 — "Auth Flows" pillar.
// A typed data module: an array of topics, each an ordered list of blocks.
export const authFlows: TopicGroup = {
  id: 'auth-flows',
  title: 'Auth Flows',
  label: 'Auth Flows',
  icon: '🔐',
  topics: [
    // ──────────────────────── SESSION & COOKIE AUTH ────────────────────────
    {
      slug: 'session-cookie-auth',
      title: 'Session & cookie auth',
      summary: 'The classic stateful model: server keeps the session, the browser holds a cookie.',
      blocks: [
        {
          kind: 'prose',
          body: (
            <>
              The original web auth model is <strong>stateful</strong>. The user
              logs in, the server creates a <strong>session</strong> — a record
              of "who this is" kept <em>server-side</em> (in memory, or more
              realistically in Redis / a database) — and hands the browser a{' '}
              <strong>session id</strong> inside a <code>Set-Cookie</code> header.
              The session id is an opaque random string; it is just a lookup key.
              From then on the browser attaches that cookie to{' '}
              <strong>every</strong> request to the origin automatically, and the
              server reloads the session to know who you are. The truth lives on
              the server; the cookie is only a pointer to it.
            </>
          ),
        },
        {
          kind: 'code',
          lang: 'bash',
          filename: 'response — Set-Cookie',
          caption: 'The server creates the session, then ships only its id to the browser.',
          code: `HTTP/1.1 200 OK
Set-Cookie: sid=Lai9ae8Eingie7oo; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=86400
Content-Type: application/json

{ "user": { "id": 42, "name": "Ada" } }`,
        },
        {
          kind: 'prose',
          body: (
            <>
              On every later request the browser sends it back — no JS, no manual
              header — and the server swaps the id for the real session:
            </>
          ),
        },
        {
          kind: 'code',
          lang: 'bash',
          filename: 'request — Cookie',
          code: `GET /api/orders HTTP/1.1
Host: shop.example.com
Cookie: sid=Lai9ae8Eingie7oo`,
        },
        {
          kind: 'heading',
          text: 'The cookie flags that actually matter',
          id: 'cookie-flags',
        },
        {
          kind: 'table',
          caption: 'Set these on the session cookie. The defaults are not safe enough.',
          headers: ['Flag', 'What it does', 'Why you want it'],
          rows: [
            [
              <code>HttpOnly</code>,
              <>JavaScript cannot read the cookie (it is invisible to <code>document.cookie</code>).</>,
              <>Blocks <strong>XSS</strong> from stealing the session id — a script on your page still can't exfiltrate it.</>,
            ],
            [
              <code>Secure</code>,
              <>The cookie is only sent over HTTPS, never plain HTTP.</>,
              <>Stops the id leaking to a network attacker on an unencrypted hop.</>,
            ],
            [
              <code>SameSite</code>,
              <>Controls whether the cookie rides along on <em>cross-site</em> requests: <code>Strict</code>, <code>Lax</code> (default-ish), or <code>None</code>.</>,
              <>Your first line of <strong>CSRF</strong> defense — see below.</>,
            ],
          ],
        },
        {
          kind: 'code',
          lang: 'js',
          filename: 'server.js — express-session style',
          caption: 'Login writes the cookie; middleware reads the session back on every request.',
          code: `import express from 'express'
import session from 'express-session'
import { RedisStore } from 'connect-redis'

const app = express()

app.use(
  session({
    store: new RedisStore({ client: redis }), // sessions live server-side
    secret: process.env.SESSION_SECRET,       // signs the cookie value
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,                // JS can't read it  → blocks XSS theft
      secure: true,                  // HTTPS only
      sameSite: 'lax',               // CSRF defense
      maxAge: 1000 * 60 * 60 * 24,   // 1 day
    },
  }),
)

app.post('/login', async (req, res) => {
  const user = await verifyCredentials(req.body)
  req.session.userId = user.id     // <-- stored server-side; browser only gets the sid
  res.json({ user })
})

// Revocation is trivial: drop the session record.
app.post('/logout', (req, res) => req.session.destroy(() => res.sendStatus(204)))`,
        },
        {
          kind: 'heading',
          text: 'CSRF: the price of automatic cookies',
          id: 'csrf',
        },
        {
          kind: 'prose',
          body: (
            <>
              The convenience — cookies send themselves — is also the
              vulnerability. Because the browser attaches the session cookie to{' '}
              <strong>any</strong> request to your origin, a malicious page can
              quietly trigger an <em>authenticated</em> action on your behalf: a
              hidden form that POSTs to{' '}
              <code>https://bank.example.com/transfer</code> fires with{' '}
              <em>your</em> cookie attached, even though the request came from{' '}
              <code>evil.com</code>. That is{' '}
              <strong>Cross-Site Request Forgery (CSRF)</strong>. The two standard
              defenses:
            </>
          ),
        },
        {
          kind: 'prose',
          body: (
            <>
              <strong>1. </strong>
              <code>SameSite</code> — set the session cookie to{' '}
              <code>Lax</code> (sent on top-level navigations but not on
              cross-site sub-requests/POSTs) or <code>Strict</code> (never sent
              cross-site). This alone kills most CSRF.{' '}
              <strong>2. </strong>
              <strong>CSRF tokens</strong> — issue an unpredictable token the
              attacker can't guess and require it on every state-changing
              request, either as a hidden form field or via the{' '}
              <strong>double-submit cookie</strong> pattern (the token is sent
              both as a cookie and as a header/field, and the server checks they
              match — only same-origin JS can read the cookie to echo it back).
            </>
          ),
        },
        {
          kind: 'callout',
          variant: 'warn',
          title: 'XSS vs CSRF — different bugs, different fixes',
          body: (
            <>
              <code>HttpOnly</code> stops <strong>XSS</strong> from{' '}
              <em>reading</em> the cookie; it does <strong>nothing</strong> for
              CSRF, because a forged request doesn't need to <em>read</em> the
              cookie — the browser attaches it automatically. CSRF is the cookie
              model's tax, and you pay it with <code>SameSite</code> +{' '}
              <strong>tokens</strong>. Token-in-a-header schemes (next topic) are
              naturally CSRF-resistant precisely because the header is{' '}
              <em>not</em> sent automatically.
            </>
          ),
        },
        {
          kind: 'callout',
          variant: 'tip',
          title: 'When to use it (IRL)',
          body: (
            <>
              Reach for sessions + cookies for{' '}
              <strong>server-rendered apps</strong> and classic web apps where the
              browser <em>is</em> the client (Rails, Django, Laravel, Express +
              templates). You get <strong>simplicity</strong> (no token plumbing
              on the client) and{' '}
              <strong>instant, real revocation</strong> — log someone out by
              deleting one server-side row, no waiting for a token to expire. The
              cost is server state: a session store you must run, scale, and share
              across instances (which is exactly why Redis shows up here).
            </>
          ),
        },
      ],
    },

    // ─────────────────────────── JWT TOKEN AUTH ───────────────────────────
    {
      slug: 'jwt-token-auth',
      title: 'Token auth with JWT',
      summary: 'Stateless model: the server signs a token, the client carries it.',
      blocks: [
        {
          kind: 'prose',
          body: (
            <>
              The token model flips the storage around. Instead of keeping a
              session on the server, the server <strong>signs</strong> a{' '}
              <strong>JSON Web Token (JWT)</strong> that contains the user's
              claims, and the <em>client</em> holds it. The client sends it on
              each request — most commonly in an{' '}
              <code>Authorization: Bearer &lt;token&gt;</code> header — and the
              server can verify it is genuine by checking the signature, with{' '}
              <strong>no database lookup</strong>. The token <em>is</em> the
              proof.
            </>
          ),
        },
        {
          kind: 'heading',
          text: 'JWT structure: header.payload.signature',
          id: 'jwt-structure',
        },
        {
          kind: 'prose',
          body: (
            <>
              A JWT is three <strong>base64url</strong> segments joined by dots:{' '}
              <code>header.payload.signature</code>. The header names the
              algorithm, the payload carries the claims, and the signature is
              computed over the first two with a secret (HMAC) or a private key
              (RSA/EC). Decoding the first two parts needs <em>no</em> key — they
              are merely encoded, not encrypted.
            </>
          ),
        },
        {
          kind: 'code',
          lang: 'bash',
          caption: 'One real token, three dot-separated base64url parts.',
          code: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9      ← header
.eyJzdWIiOiJ1c2VyXzQyIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzE4MDAwMDAwLCJleHAiOjE3MTgwMDM2MDB9   ← payload
.3Hf0pZtT9bq2W4mJ_kq8r-Lh2c1xY5vN8aQ0sB7dE   ← signature`,
        },
        {
          kind: 'code',
          lang: 'json',
          filename: 'decoded header',
          code: `{
  "alg": "HS256",   // signing algorithm
  "typ": "JWT"
}`,
        },
        {
          kind: 'code',
          lang: 'json',
          filename: 'decoded payload (claims)',
          caption: 'sub = subject (user id); exp/iat are seconds since the Unix epoch.',
          code: `{
  "sub": "user_42",   // who the token is about
  "role": "admin",    // a custom claim your app reads
  "iat": 1718000000,  // issued-at
  "exp": 1718003600   // expires (1h later) — verifiers MUST enforce this
}`,
        },
        {
          kind: 'prose',
          body: (
            <>
              The server verifies by recomputing the signature over{' '}
              <code>header.payload</code> and checking it matches, then enforcing{' '}
              <code>exp</code>. If a single byte of the payload is tampered with,
              the signature no longer matches and the token is rejected. This is
              the whole upside:{' '}
              <strong>stateless verification</strong> — any server holding the key
              can validate the token with no shared session store. The matching
              downside is the flip side of statelessness:{' '}
              <strong>you can't easily revoke a JWT before it expires</strong>,
              because nothing is looked up to invalidate. That is why access
              tokens are kept short-lived (see <em>Refresh tokens</em>).
            </>
          ),
        },
        {
          kind: 'code',
          lang: 'ts',
          filename: 'auth.ts — sign & verify (jsonwebtoken)',
          code: `import jwt from 'jsonwebtoken'

// Sign at login. Keep it short-lived because you can't revoke it early.
const token = jwt.sign(
  { sub: user.id, role: user.role },
  process.env.JWT_SECRET!,
  { expiresIn: '1h' },
)

// Verify on each request — no DB hit. Throws on bad sig or expiry.
function authMiddleware(req, res, next) {
  const header = req.headers.authorization ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.sendStatus(401)
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET!) // checks sig + exp
    next()
  } catch {
    res.sendStatus(401)
  }
}`,
        },
        {
          kind: 'heading',
          text: 'Where do you store the token on the client?',
          id: 'jwt-storage',
        },
        {
          kind: 'prose',
          body: (
            <>
              This is the decision that actually determines how safe your token
              auth is. There is no single right answer — each option trades XSS
              exposure against CSRF exposure and ergonomics:
            </>
          ),
        },
        {
          kind: 'table',
          caption: 'Storage options for an access token, and what each one costs you.',
          headers: ['Where', 'XSS exposure', 'CSRF exposure', 'Notes'],
          rows: [
            [
              <strong>In-memory (JS variable)</strong>,
              <>Lowest — not persisted anywhere a script can scrape later.</>,
              <>None — you attach it manually as a header.</>,
              <>Lost on refresh / new tab; you re-acquire it via a refresh token. Safest for the access token.</>,
            ],
            [
              <strong>HttpOnly cookie</strong>,
              <>Low — JS literally cannot read it.</>,
              <>Present — auto-sent, so you must add <code>SameSite</code> + CSRF defenses.</>,
              <>Great for the <em>refresh</em> token; trades the XSS problem for the CSRF problem.</>,
            ],
            [
              <strong><code>localStorage</code></strong>,
              <><strong>High</strong> — any XSS does <code>localStorage.getItem(...)</code> and walks off with it.</>,
              <>None — manual header.</>,
              <>Convenient and survives refresh, but <strong>risky for sensitive tokens</strong>. Common, not recommended.</>,
            ],
          ],
        },
        {
          kind: 'callout',
          variant: 'danger',
          title: 'A JWT is signed, not encrypted — never put secrets in the payload',
          body: (
            <>
              The signature proves the payload wasn't <em>changed</em>; it does{' '}
              <strong>not</strong> hide it. Anyone holding the token can{' '}
              <code>atob()</code> the middle segment and read every claim in
              plaintext — paste it into{' '}
              <code>jwt.io</code> and it's all there. So{' '}
              <strong>never</strong> put passwords, API keys, PII, or anything
              confidential in a JWT payload. Put an opaque user id and coarse
              claims (<code>role</code>), nothing you'd mind a user reading. (If
              you genuinely need encrypted claims, that's JWE — a different,
              heavier thing.)
            </>
          ),
        },
        {
          kind: 'diagram',
          render: AuthFlowDiagram,
          title: 'Token auth: login, access, refresh',
          caption:
            'Login mints a short access token (+ a refresh token); the client carries the access token on each call, then silently exchanges the refresh token for a new one when it expires.',
        },
        {
          kind: 'callout',
          variant: 'tip',
          title: 'When to use it (IRL)',
          body: (
            <>
              Tokens shine when the client <strong>isn't</strong> a cookie-bound
              browser tab: <strong>native mobile apps</strong>, third-party{' '}
              <strong>API clients</strong>, and{' '}
              <strong>service-to-service</strong> calls, plus stateless backends
              that don't want a shared session store. The headline win is{' '}
              <strong>no server-side session lookup</strong> and easy horizontal
              scaling; the headline cost is{' '}
              <strong>revocation</strong>, which you buy back with short-lived
              access tokens and a refresh-token story.
            </>
          ),
        },
      ],
    },

    // ──────────────────────────── OAUTH / OIDC ────────────────────────────
    {
      slug: 'oauth-oidc',
      title: 'OAuth 2.0 & OpenID Connect',
      summary: 'Delegated authorization (OAuth2) plus an identity layer on top (OIDC).',
      blocks: [
        {
          kind: 'prose',
          body: (
            <>
              These two are constantly conflated, so pin the distinction first.{' '}
              <strong>OAuth 2.0</strong> is about{' '}
              <strong>authorization</strong> —{' '}
              <em>"let application X access resource Y on my behalf"</em> (e.g.
              "let this app read my Google Calendar"). It was never designed to
              tell you <em>who the user is</em>.{' '}
              <strong>OpenID Connect (OIDC)</strong> is a thin{' '}
              <strong>identity layer built on top of OAuth2</strong> that adds{' '}
              <strong>authentication</strong> —{' '}
              <em>"who is this user"</em> — by introducing a standardized{' '}
              <code>id_token</code>. Put plainly: OAuth2 gets your app a key to a
              resource; OIDC tells your app whose key it is.
            </>
          ),
        },
        {
          kind: 'heading',
          text: 'The four actors',
          id: 'oauth-actors',
        },
        {
          kind: 'table',
          headers: ['Actor', 'Who it is', 'Example'],
          rows: [
            [
              <strong>Resource Owner</strong>,
              <>The user who owns the data and grants access.</>,
              <>You.</>,
            ],
            [
              <strong>Client</strong>,
              <>The app requesting access on the user's behalf.</>,
              <>Your SPA / mobile app.</>,
            ],
            [
              <strong>Authorization Server</strong>,
              <>Authenticates the user and issues tokens.</>,
              <>Google, Auth0, Okta, Entra ID.</>,
            ],
            [
              <strong>Resource Server</strong>,
              <>The API that holds the protected data and accepts the access token.</>,
              <>The Google Calendar API.</>,
            ],
          ],
        },
        {
          kind: 'heading',
          text: 'Authorization Code flow with PKCE',
          id: 'auth-code-pkce',
        },
        {
          kind: 'prose',
          body: (
            <>
              For browser SPAs and mobile apps you use the{' '}
              <strong>Authorization Code flow with PKCE</strong> (pronounced
              "pixy", <em>Proof Key for Code Exchange</em>). Why PKCE? These are{' '}
              <strong>public clients</strong> — code that ships to the user's
              device, so they <strong>cannot keep a client secret</strong>{' '}
              (anyone can read the bundle). PKCE replaces the secret with a{' '}
              one-time, per-request proof: the client invents a random{' '}
              <code>code_verifier</code>, sends its hash (
              <code>code_challenge</code>) up front, and must present the original{' '}
              <code>code_verifier</code> when redeeming the code. An attacker who
              intercepts the authorization <code>code</code> in the redirect{' '}
              <em>can't use it</em> without the matching verifier they never saw.
            </>
          ),
        },
        {
          kind: 'prose',
          body: (
            <>
              The redirect dance, step by step:
            </>
          ),
        },
        {
          kind: 'prose',
          body: (
            <>
              <strong>1.</strong> The client generates a random{' '}
              <code>code_verifier</code> and derives{' '}
              <code>code_challenge = SHA256(verifier)</code>, then redirects the
              browser to the Authorization Server's <code>/authorize</code>{' '}
              endpoint (with <code>client_id</code>, <code>redirect_uri</code>,{' '}
              <code>scope</code>, <code>state</code>, and the{' '}
              <code>code_challenge</code>).{' '}
              <strong>2.</strong> The user logs in and consents{' '}
              <em>on the Authorization Server</em> (your app never sees their
              password).{' '}
              <strong>3.</strong> The server redirects back to your{' '}
              <code>redirect_uri</code> with a short-lived authorization{' '}
              <code>code</code> (and echoes <code>state</code>).{' '}
              <strong>4.</strong> The client POSTs that <code>code</code>{' '}
              <em>plus the original</em> <code>code_verifier</code> to the{' '}
              <code>/token</code> endpoint and exchanges them for tokens.
            </>
          ),
        },
        {
          kind: 'code',
          lang: 'bash',
          filename: '1) authorization request (browser redirect)',
          code: `GET https://auth.example.com/authorize
  ?response_type=code
  &client_id=spa-web
  &redirect_uri=https://app.example.com/callback
  &scope=openid profile email calendar.read
  &state=xyz-anti-csrf
  &code_challenge=E9Melhoa2OwvFr...     # SHA256(code_verifier), base64url
  &code_challenge_method=S256`,
        },
        {
          kind: 'code',
          lang: 'bash',
          filename: '4) token exchange (server returns code, client redeems it)',
          caption: 'No client secret — the code_verifier is the proof instead.',
          code: `POST https://auth.example.com/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
&code=SplxlOBeZQQYbYS6WxSbIA
&redirect_uri=https://app.example.com/callback
&client_id=spa-web
&code_verifier=dBjftJeZ4CVP-mB92K27uhbUJU1p1r...   # the original random string`,
        },
        {
          kind: 'heading',
          text: 'What each token is for',
          id: 'oauth-tokens',
        },
        {
          kind: 'table',
          caption: 'The /token response can return all three — they have different jobs.',
          headers: ['Token', 'Purpose', 'Sent to'],
          rows: [
            [
              <code>access_token</code>,
              <>Authorizes calls to the API. Opaque or a JWT; carries scopes.</>,
              <>The <strong>Resource Server</strong> (the API).</>,
            ],
            [
              <code>id_token</code>,
              <>An OIDC JWT that says <em>who the user is</em> (<code>sub</code>, <code>name</code>, <code>email</code>). Identity, not access.</>,
              <>Your <strong>client</strong> reads it; never send it to the API.</>,
            ],
            [
              <code>refresh_token</code>,
              <>Long-lived credential to mint new access tokens without re-login.</>,
              <>Back to the <strong>Authorization Server</strong> only.</>,
            ],
          ],
        },
        {
          kind: 'callout',
          variant: 'info',
          title: 'Use Authorization Code + PKCE — the Implicit flow is dead',
          body: (
            <>
              The old <strong>Implicit flow</strong> (tokens handed straight back
              in the redirect URL fragment) is{' '}
              <strong>deprecated</strong> — it leaked access tokens into browser
              history, logs, and the <code>Referer</code> header, and had no way
              to safely deliver refresh tokens. The current OAuth Security BCP
              says: <strong>Authorization Code + PKCE for everyone</strong>,
              public clients included. The <code>code_challenge</code> /{' '}
              <code>code_verifier</code> pair is what makes a secretless client
              safe.
            </>
          ),
        },
        {
          kind: 'callout',
          variant: 'tip',
          title: 'When to use it (IRL)',
          body: (
            <>
              Reach for OAuth2/OIDC when you want{' '}
              <strong>"Sign in with Google/GitHub/Microsoft"</strong>, when you{' '}
              <strong>delegate access to a third-party API</strong> on the user's
              behalf, or when you outsource auth to an{' '}
              <strong>identity provider</strong> (Auth0, Okta, Cognito,
              Clerk/Kinde, Entra ID) instead of storing passwords yourself. If you
              only need to identify your <em>own</em> users for your <em>own</em>{' '}
              app, a plain session or your own JWT flow is often simpler — don't
              stand up OAuth just to log people into one app.
            </>
          ),
        },
      ],
    },

    // ───────────────────────────── REFRESH TOKENS ─────────────────────────────
    {
      slug: 'refresh-tokens',
      title: 'Refresh tokens & session lifetime',
      summary: 'Short access tokens limit blast radius; long refresh tokens renew them — with rotation.',
      blocks: [
        {
          kind: 'prose',
          body: (
            <>
              Refresh tokens exist to resolve a tension. You want access tokens{' '}
              <strong>short-lived</strong> (minutes to an hour) so that a stolen
              one is useless almost immediately — that is the{' '}
              <strong>blast radius</strong> argument, and it's the answer to "you
              can't revoke a JWT." But you don't want to force the user to log in
              again every fifteen minutes. The fix: pair the short access token
              with a <strong>long-lived refresh token</strong> (days to weeks)
              whose <em>only</em> job is to obtain fresh access tokens, silently,
              without re-authentication.
            </>
          ),
        },
        {
          kind: 'table',
          caption: 'Two tokens, two very different lifetimes and jobs.',
          headers: ['', 'Access token', 'Refresh token'],
          rows: [
            ['Lifetime', <>Short — minutes to ~1 hour.</>, <>Long — days to weeks.</>],
            ['Used for', <>Authorizing every API call.</>, <>Getting a new access token. Nothing else.</>],
            ['Sent', <>On every request to the API.</>, <>Only to the auth/refresh endpoint.</>],
            ['If stolen', <>Useless quickly (it expires fast).</>, <>Dangerous — so it's rotated &amp; revocable.</>],
          ],
        },
        {
          kind: 'heading',
          text: 'Rotation + reuse detection',
          id: 'rotation',
        },
        {
          kind: 'prose',
          body: (
            <>
              A long-lived credential is a juicy target, so the hardened pattern
              is <strong>refresh-token rotation</strong>: every time a refresh
              token is used, the server{' '}
              <strong>issues a brand-new refresh token and invalidates the old
              one</strong> — each refresh token is{' '}
              <strong>single-use</strong>. On top of that you add{' '}
              <strong>reuse detection</strong>: the server remembers the chain of
              tokens (a "family"), and if an <em>already-rotated</em> token is
              ever presented again, that almost certainly means it was{' '}
              <strong>stolen and replayed</strong> — so the server treats it as a
              breach and <strong>revokes the entire family</strong>, forcing a
              real re-login. A leaked refresh token thus buys an attacker very
              little: the moment either party uses it twice, the whole lineage
              dies.
            </>
          ),
        },
        {
          kind: 'prose',
          body: (
            <>
              Two related lifecycle details.{' '}
              <strong>Silent renewal:</strong> the client refreshes{' '}
              <em>proactively</em>, just before the access token expires, so calls
              never visibly fail.{' '}
              <strong>Logout:</strong> real logout means{' '}
              <strong>revoking the refresh token server-side</strong> — deleting a
              cookie alone leaves a still-valid token that an attacker who copied
              it could keep using. Revoke first, clear cookies second.
            </>
          ),
        },
        {
          kind: 'code',
          lang: 'ts',
          filename: 'api.ts — interceptor: on 401 → refresh → retry',
          caption: 'A single shared refresh promise so concurrent 401s do not stampede the refresh endpoint.',
          code: `let refreshing: Promise<void> | null = null

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config

    // Not a 401, or we already retried this one → give up.
    if (error.response?.status !== 401 || original._retry) {
      throw error
    }
    original._retry = true

    // Coalesce: the first 401 kicks off the refresh; the rest await it.
    refreshing ??= api
      .post('/auth/refresh')      // rotates: old refresh token → new one
      .then(() => undefined)
      .finally(() => {
        refreshing = null
      })

    try {
      await refreshing
      return api(original)        // replay the original request, now authorized
    } catch {
      forceLogout()              // refresh failed → reuse-detected or expired
      throw error
    }
  },
)`,
        },
        {
          kind: 'callout',
          variant: 'key',
          title: 'The lifetime model in one breath',
          body: (
            <>
              <strong>Access token = short + stateless + carried everywhere</strong>{' '}
              (limits blast radius, no DB lookup).{' '}
              <strong>Refresh token = long + stored/revocable + used only to
              renew</strong>. Make every refresh{' '}
              <strong>rotate</strong> (single-use) and add{' '}
              <strong>reuse detection</strong> so a replayed token nukes the whole
              family. <strong>Logout revokes server-side</strong>, not just by
              clearing a cookie. That combination gives you JWT's scalability{' '}
              <em>and</em> something close to session-style revocation.
            </>
          ),
        },
      ],
    },

    // ─────────────────────── PRODUCTION AUTH CASE STUDY ───────────────────────
    {
      slug: 'production-auth-case-study',
      title: 'Case study: a real production auth flow',
      summary: 'A production Next.js ⇄ Express ⇄ Postgres auth stack, documented from a real codebase.',
      blocks: [
        {
          kind: 'prose',
          body: (
            <>
              Everything above is theory — here's a real production system that
              uses it: a <strong>Next.js 16</strong> frontend talking
              to an Express + TypeScript backend over PostgreSQL. It is a good
              case study because it deliberately combines the two models: it uses{' '}
              <strong>JWTs</strong> (stateless verification) but delivers them in{' '}
              <strong>HttpOnly cookies</strong> (so XSS can't read them) and backs
              the refresh token with <strong>server-side state</strong> (so it can
              rotate and revoke). The result reads like "JWT auth with the
              ergonomics and revocability of sessions."
            </>
          ),
        },
        {
          kind: 'heading',
          text: 'Backend — Express + PostgreSQL + Argon2',
          id: 'case-backend',
        },
        {
          kind: 'prose',
          body: (
            <>
              Passwords are hashed with <strong>Argon2</strong> (a modern,
              memory-hard KDF). On login the server signs two JWTs — a{' '}
              <strong>1-hour access token</strong> and a{' '}
              <strong>7-day refresh token</strong> — and ships both as{' '}
              <strong>HttpOnly, Secure, SameSite=none cookies</strong> (the{' '}
              <code>access_token</code> and <code>refresh_token</code> cookies).
              Crucially the <strong>refresh cookie is path-scoped</strong> to the
              single refresh endpoint{' '}
              <code>/api-proxy/v1/auth/refresh-token</code>, so the browser only
              ever sends the long-lived token to the one route that needs it —
              every other API call carries the access cookie and nothing more.
              The access payload is small and non-secret:{' '}
              <code>{'{ id, email, role, verified, isApproved }'}</code> (roles:{' '}
              <code>ADMIN</code>, <code>CLIENT</code>, <code>ESTHETICIAN</code>,{' '}
              <code>POS_STAFF</code>).
            </>
          ),
        },
        {
          kind: 'prose',
          body: (
            <>
              The refresh tokens are <strong>stored server-side</strong> in a
              PostgreSQL <code>refreshToken</code> table — not in plaintext, but
              as a <strong>hash</strong> alongside a <code>jti</code> and{' '}
              <code>revokedAt</code> / <code>replacedById</code> /{' '}
              <code>expiresAt</code> columns. That schema is exactly what enables
              the hardened lifecycle from the previous topic:{' '}
              <strong>rotation on every refresh</strong> (the old row is revoked,
              a new single-use token is issued and linked via{' '}
              <code>replacedById</code>) plus{' '}
              <strong>reuse detection</strong> (replaying an already-rotated token
              revokes the whole family). Requests are protected by{' '}
              <code>authMiddleware</code> (verify signature + expiry, plus
              email-verified and active checks) and an{' '}
              <code>authorize(roles)</code> guard for role-gated routes.
            </>
          ),
        },
        {
          kind: 'code',
          lang: 'ts',
          filename: 'auth.controller.ts — login (shape, from the real flow)',
          caption: 'Sign access(1h)+refresh(7d), persist a HASH of the refresh token, set HttpOnly cookies.',
          code: `// 1. Verify the password with Argon2 (memory-hard).
const ok = await argon2.verify(user.passwordHash, password)
if (!ok) throw new Unauthorized()

// 2. Sign both JWTs. Access payload is small + non-secret.
const access = signAccess({ id: user.id, email, role, verified, isApproved }) // 1h
const refresh = signRefresh({ id: user.id, jti })                              // 7d

// 3. Store the refresh token server-side as a HASH (never plaintext) + jti.
await db.refreshToken.create({
  data: { userId: user.id, jti, tokenHash: hash(refresh), expiresAt },
})

// 4. Deliver both as HttpOnly cookies. Refresh is PATH-SCOPED to its one route.
res.cookie('access_token', access, {
  httpOnly: true, secure: true, sameSite: 'none', maxAge: HOUR,
})
res.cookie('refresh_token', refresh, {
  httpOnly: true, secure: true, sameSite: 'none', maxAge: WEEK,
  path: '/api-proxy/v1/auth/refresh-token', // only ever sent here
})

res.json({ user }) // body carries the non-sensitive user object`,
        },
        {
          kind: 'heading',
          text: 'Frontend — Next.js + Axios withCredentials',
          id: 'case-frontend',
        },
        {
          kind: 'prose',
          body: (
            <>
              Because the tokens live in HttpOnly cookies, the frontend{' '}
              <strong>never touches a Bearer token</strong>. Axios is configured
              with <code>withCredentials: true</code>, so the browser attaches the
              cookies automatically on every call (the browser uses an{' '}
              <code>/api-proxy</code> base that Next.js rewrites to{' '}
              <code>NEXT_PUBLIC_API_URL</code>). What <em>does</em> live on the
              client is strictly non-sensitive: <code>localStorage</code> holds
              the <code>auth_user</code> object and a{' '}
              <code>token_expires_at</code> timestamp, and the app sets a
              FE-only <code>isAuthenticated</code> cookie used purely for route
              guarding. None of that is a credential — the actual proof never
              leaves the HttpOnly cookies.
            </>
          ),
        },
        {
          kind: 'prose',
          body: (
            <>
              Two Axios interceptors keep sessions seamless. The{' '}
              <strong>request interceptor</strong> is{' '}
              <em>proactive</em>: if <code>token_expires_at</code> has passed it
              POSTs to <code>/v1/auth/refresh-token</code> first, queues the other
              in-flight requests behind that single refresh, then lets them
              proceed. The <strong>response interceptor</strong> is{' '}
              <em>reactive</em>: on a <code>401</code> it attempts exactly one
              refresh and retries the original request; if that fails it calls{' '}
              <code>forceLogout()</code>. A shared <strong>request queue</strong>{' '}
              ensures a burst of calls triggers only one refresh rather than a
              stampede. Finally, Next.js{' '}
              <strong>middleware</strong> (<code>apps/user/src/middleware.ts</code>)
              reads the <code>isAuthenticated</code> cookie to guard routes —
              splitting public vs verified pages and redirecting to{' '}
              <code>/login</code> when it's missing.
            </>
          ),
        },
        {
          kind: 'code',
          lang: 'ts',
          filename: 'lib/api.ts — proactive + reactive refresh (Next.js / Axios)',
          caption: 'Cookies auto-send (withCredentials). Refresh is both pre-empted and recovered-from.',
          code: `const api = axios.create({ baseURL: '/api-proxy', withCredentials: true })

// Proactive: refresh BEFORE the access token expires, queue everything behind it.
api.interceptors.request.use(async (config) => {
  const expiresAt = Number(localStorage.getItem('token_expires_at') ?? 0)
  if (expiresAt && Date.now() >= expiresAt) {
    await refreshOnce()               // single shared promise → request queue
  }
  return config
})

// Reactive: on 401, try one refresh + retry, else hard logout.
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        await refreshOnce()
        return api(original)
      } catch {
        forceLogout()                // clears localStorage + isAuthenticated → /login
      }
    }
    throw error
  },
)`,
        },
        {
          kind: 'prose',
          body: (
            <>
              One more security property worth calling out:{' '}
              <strong>password reset revokes ALL sessions</strong>. Resetting the
              password doesn't just change the hash — it revokes every refresh
              token in the <code>refreshToken</code> table for that user, so any
              attacker who had a live session is kicked out immediately. (Plain
              logout, by contrast, revokes only the one presented refresh token
              and clears its cookies.) The full endpoint surface includes{' '}
              <code>/v1/auth/register</code>, <code>login</code>,{' '}
              <code>logout</code>, <code>refresh-token</code>,{' '}
              <code>request-otp</code>, <code>login-otp</code>,{' '}
              <code>email/confirm</code>, and <code>password/reset</code>.
            </>
          ),
        },
        {
          kind: 'diagram',
          render: ProdAuthDiagram,
          title: 'End-to-end auth (Next.js ⇄ Express ⇄ Postgres)',
          caption:
            'Login → Argon2 verify → sign access(1h)+refresh(7d) → persist refresh hash+jti → set HttpOnly cookies → FE stores only the user + isAuthenticated cookie; near expiry / on 401 the interceptor hits the path-scoped refresh endpoint, which rotates the token.',
        },
        {
          kind: 'callout',
          variant: 'key',
          title: 'Why this design is solid',
          body: (
            <>
              Four properties stack up:{' '}
              <strong>(1) tokens live in HttpOnly cookies</strong> — an XSS bug
              can't read them, unlike <code>localStorage</code>;{' '}
              <strong>(2) refresh rotation with reuse detection</strong> — a
              leaked refresh token self-destructs the moment it's replayed;{' '}
              <strong>(3) the refresh cookie is path-scoped</strong> to its one
              endpoint, so the long-lived credential isn't sprayed across every
              request; and{' '}
              <strong>(4) password reset revokes every session</strong>, turning
              a credential change into a full account lockout of any attacker.
              Stateless JWT verification, session-grade revocation.
            </>
          ),
        },
      ],
    },
  ],
}
