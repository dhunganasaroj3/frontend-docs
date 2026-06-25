import { Canvas, Box, Label, Defs, Arrow } from './primitives'

/**
 * ProdAuthDiagram — sequence diagram of a real-world production auth flow
 * (Next.js front end ⇄ Express API ⇄ PostgreSQL). Tokens live in HttpOnly
 * cookies; refresh tokens are stored server-side and rotated with reuse
 * detection. See NOTES-prod-auth.md for the source-of-truth facts.
 */
export function ProdAuthDiagram() {
  const W = 540
  const H = 470

  // Three actor lanes with vertical lifelines.
  const lanes = [
    { x: 95, title: 'Browser', subtitle: 'Next.js', color: 'var(--d-1)' },
    { x: 270, title: 'Express API', color: 'var(--d-2)' },
    { x: 445, title: 'PostgreSQL', color: 'var(--d-3)' },
  ]
  const [BROWSER, API, DB] = [lanes[0].x, lanes[1].x, lanes[2].x]

  const headTop = 12
  const headH = 34
  const headW = 130
  const lifeTop = headTop + headH
  const lifeBottom = 372

  // A labelled horizontal message arrow between two lifelines.
  const msg = (
    y: number,
    from: number,
    to: number,
    text: string,
    color = 'var(--muted)',
  ) => {
    const labelX = (from + to) / 2
    const above = y - 6
    return (
      <g key={`${y}-${text}`}>
        <Label x={labelX} y={above} size={9.5} color="var(--text)">
          {text}
        </Label>
        <Arrow x1={from} y1={y} x2={to} y2={y} color={color} width={1.6} />
      </g>
    )
  }

  return (
    <Canvas width={W} height={H} label="Production authentication sequence: login, cookie-based JWT access and refresh-token rotation across Browser, Express API and PostgreSQL">
      <Defs />

      {/* Lifelines (dashed verticals) */}
      {lanes.map((l) => (
        <line
          key={`life-${l.title}`}
          x1={l.x}
          y1={lifeTop}
          x2={l.x}
          y2={lifeBottom}
          stroke={l.color}
          strokeWidth={1.4}
          strokeDasharray="4 4"
          opacity={0.55}
        />
      ))}

      {/* Actor header boxes */}
      {lanes.map((l) => (
        <Box
          key={`head-${l.title}`}
          x={l.x - headW / 2}
          y={headTop}
          w={headW}
          h={headH}
          title={l.title}
          subtitle={l.subtitle}
          color={l.color}
          titleSize={12}
        />
      ))}

      {/* 1. login request */}
      {msg(72, BROWSER, API, 'POST /v1/auth/login (email, pwd) [withCredentials]', 'var(--d-1)')}
      {/* 2. verify password */}
      {msg(96, API, DB, 'find user; verify Argon2 hash', 'var(--d-2)')}
      {/* 3. persist refresh token */}
      {msg(120, API, DB, 'store refresh-token hash + jti', 'var(--d-2)')}
      {/* 4. success: set cookies (green) */}
      {msg(
        152,
        API,
        BROWSER,
        'Set-Cookie: access(1h) + refresh(7d) — HttpOnly, Secure, SameSite=none',
        'var(--d-3)',
      )}

      {/* 5. browser self-note */}
      <Box x={BROWSER - 78} y={166} w={156} h={40} color="var(--d-1)" fill="var(--surface)" dashed radius={7} />
      <Label x={BROWSER} y={181} size={9} color="var(--text)">
        save user → localStorage;
      </Label>
      <Label x={BROWSER} y={193} size={9} color="var(--text)">
        set isAuthenticated cookie; token_expires_at
      </Label>

      {/* 6. authenticated request */}
      {msg(232, BROWSER, API, 'GET /v1/… (cookies auto-sent)', 'var(--d-1)')}

      {/* 7. api self-note */}
      <Box x={API - 80} y={246} w={160} h={30} color="var(--d-2)" fill="var(--surface)" dashed radius={7} />
      <Label x={API} y={264} size={9} color="var(--text)">
        authMiddleware verifies JWT + role + verified
      </Label>

      {/* 8. success response */}
      {msg(298, API, BROWSER, '200 (data)', 'var(--d-2)')}

      {/* refresh divider */}
      <line x1={40} y1={312} x2={W - 40} y2={312} stroke="var(--muted)" strokeWidth={1} strokeDasharray="2 4" opacity={0.6} />
      <Label x={40} y={309} anchor="start" size={9} weight={650} color="var(--d-4)">
        near expiry / on 401
      </Label>

      {/* 9. refresh request (amber) */}
      {msg(330, BROWSER, API, 'POST /v1/auth/refresh-token', 'var(--d-4)')}
      {/* 10. rotate tokens */}
      {msg(354, API, DB, 'rotate: revoke old, issue new (reuse-detection)', 'var(--d-4)')}
      {/* 11. new cookie + retry */}
      {msg(370, API, BROWSER, 'new access cookie → retry → 200', 'var(--d-3)')}

      {/* Security callout box */}
      <Box x={40} y={386} w={W - 80} h={72} color="var(--d-3)" fill="var(--surface-2)" radius={9} />
      <Label x={52} y={402} anchor="start" size={10.5} weight={700} color="var(--d-3)">
        Why this is safe
      </Label>
      {[
        'Tokens in HttpOnly cookies → XSS can’t read them',
        'Refresh rotation + reuse detection (single-use tokens)',
        'Password reset revokes all sessions',
      ].map((line, i) => (
        <Label key={line} x={52} y={420 + i * 14} anchor="start" size={9.5} color="var(--text)">
          • {line}
        </Label>
      ))}
    </Canvas>
  )
}
