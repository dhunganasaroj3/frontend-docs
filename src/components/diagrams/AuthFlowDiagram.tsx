import { Canvas, Box, Label, Defs, Arrow } from './primitives'

/**
 * Generic token-auth (JWT access + refresh) sequence diagram.
 *
 * Three lifelines — Browser SPA, Auth Server, API — with ordered horizontal
 * messages flowing top to bottom: login, token issue, authorized request,
 * expiry → 401, refresh, and retry. Teaching-altitude, not app-specific.
 */
export function AuthFlowDiagram() {
  // Lifeline x-positions (center of each actor header).
  const browser = 90
  const auth = 260
  const api = 430

  const headerY = 16
  const headerH = 40
  const lifelineTop = headerY + headerH
  const lifelineBottom = 404

  // Vertical positions for each message arrow.
  const rows = {
    login: 86,
    tokens: 120,
    getData: 158,
    ok: 192,
    expired: 240,
    unauthorized: 274,
    refresh: 308,
    newToken: 342,
    retry: 380,
  }

  return (
    <Canvas width={520} height={420} label="Token auth flow: login, access + refresh tokens, expiry and retry">
      <Defs />

      {/* Lifelines (drawn first, behind arrows) */}
      <line x1={browser} y1={lifelineTop} x2={browser} y2={lifelineBottom} stroke="var(--d-1)" strokeWidth={1.2} strokeDasharray="4 4" opacity={0.5} />
      <line x1={auth} y1={lifelineTop} x2={auth} y2={lifelineBottom} stroke="var(--d-2)" strokeWidth={1.2} strokeDasharray="4 4" opacity={0.5} />
      <line x1={api} y1={lifelineTop} x2={api} y2={lifelineBottom} stroke="var(--d-3)" strokeWidth={1.2} strokeDasharray="4 4" opacity={0.5} />

      {/* Actor headers */}
      <Box x={browser - 62} y={headerY} w={124} h={headerH} title="Browser (SPA)" color="var(--d-1)" titleSize={11.5} />
      <Box x={auth - 62} y={headerY} w={124} h={headerH} title="App / Auth Server" color="var(--d-2)" titleSize={11.5} />
      <Box x={api - 62} y={headerY} w={124} h={headerH} title="API / Resource" color="var(--d-3)" titleSize={11.5} />

      {/* 1. Browser -> Auth: login */}
      <Arrow x1={browser} y1={rows.login} x2={auth} y2={rows.login} color="var(--d-1)" />
      <Label x={(browser + auth) / 2} y={rows.login - 6} size={10} color="var(--text)">
        POST /login (email, password)
      </Label>

      {/* 2. Auth -> Browser: tokens */}
      <Arrow x1={auth} y1={rows.tokens} x2={browser} y2={rows.tokens} color="var(--d-2)" />
      <Label x={(browser + auth) / 2} y={rows.tokens - 6} size={10} color="var(--text)">
        access token (short) + refresh token (long)
      </Label>

      {/* 3. Browser -> API: get data with bearer */}
      <Arrow x1={browser} y1={rows.getData} x2={api} y2={rows.getData} color="var(--d-1)" />
      <Label x={(browser + api) / 2} y={rows.getData - 6} size={10} color="var(--text)">
        GET /data + Authorization: Bearer &lt;access&gt;
      </Label>

      {/* 4. API -> Browser: 200 */}
      <Arrow x1={api} y1={rows.ok} x2={browser} y2={rows.ok} color="var(--d-3)" />
      <Label x={(browser + api) / 2} y={rows.ok - 6} size={10} color="var(--text)">
        200 OK (data)
      </Label>

      {/* divider — "...later, token expires" */}
      <line x1={browser - 50} y1={216} x2={api + 50} y2={216} stroke="var(--muted)" strokeWidth={1} strokeDasharray="2 5" opacity={0.45} />
      <Label x={(browser + api) / 2} y={212} size={9.5} color="var(--muted)" weight={600}>
        …later, access token expires
      </Label>

      {/* 5. Browser -> API: expired */}
      <Arrow x1={browser} y1={rows.expired} x2={api} y2={rows.expired} color="var(--d-1)" />
      <Label x={(browser + api) / 2} y={rows.expired - 6} size={10} color="var(--text)">
        GET /data (expired token)
      </Label>

      {/* 6. API -> Browser: 401 (d-5) */}
      <Arrow x1={api} y1={rows.unauthorized} x2={browser} y2={rows.unauthorized} color="var(--d-5)" />
      <Label x={(browser + api) / 2} y={rows.unauthorized - 6} size={10} color="var(--d-5)" weight={650}>
        401 Unauthorized
      </Label>

      {/* 7. Browser -> Auth: refresh */}
      <Arrow x1={browser} y1={rows.refresh} x2={auth} y2={rows.refresh} color="var(--d-1)" />
      <Label x={(browser + auth) / 2} y={rows.refresh - 6} size={10} color="var(--text)">
        POST /refresh (refresh token)
      </Label>

      {/* 8. Auth -> Browser: new access token */}
      <Arrow x1={auth} y1={rows.newToken} x2={browser} y2={rows.newToken} color="var(--d-2)" />
      <Label x={(browser + auth) / 2} y={rows.newToken - 6} size={10} color="var(--text)">
        new access token
      </Label>

      {/* 9. Browser -> API: retry then 200 */}
      <Arrow x1={browser} y1={rows.retry} x2={api} y2={rows.retry} color="var(--d-1)" />
      <Label x={(browser + api) / 2} y={rows.retry - 6} size={10} color="var(--text)">
        retry GET /data → 200 OK
      </Label>
    </Canvas>
  )
}
