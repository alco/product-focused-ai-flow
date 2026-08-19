// Session bootstrap — the values the auth/session API hands the client
// (they are deliberately NOT collections: the company name and my own phone
// number arrive via session bootstrap, not via a shape — see "deliberate
// non-shapes" in agent_artifacts/shape-model.md). Profile fields are fetched
// from GET /api/session by initSession() before first render (main.tsx).
//
// TEMPORARY(auth): until real login exists, the acting member is picked by a
// `?as=<seed-slug>` query param (default `priya`), persisted in
// sessionStorage — which is per-tab, so two tabs can be "logged in" as two
// different members for the live demo. The slug rides on every sync/API
// request (db/collections.ts, db/api.ts); the backend's MockSession resolves
// it to the seeded member. Real auth replaces how the member is identified,
// not this bootstrap contract.

function readAsMember(): string {
  const key = 'as'
  const param = new URLSearchParams(window.location.search).get(key)
  if (param !== null) sessionStorage.setItem(key, param)
  return sessionStorage.getItem(key) ?? 'priya'
}

// TEMPORARY(auth): explicit `?can_post_announcements=1|0` overrides the
// member's real permission (useful for demoing both channel states without
// switching members); unset, the server-provided value applies.
function readCanPostOverride(): boolean | null {
  const key = 'can_post_announcements'
  const param = new URLSearchParams(window.location.search).get(key)
  if (param !== null) {
    sessionStorage.setItem(key, param === '0' || param === 'false' ? '0' : '1')
  }
  const stored = sessionStorage.getItem(key)
  return stored === null ? null : stored === '1'
}

export const session = {
  /** TEMPORARY(auth): seed slug of the acting member, from ?as= (per tab). */
  asMember: readAsMember(),
  /** $me — injected server-side into every shape's where-clause. */
  memberId: '',
  companyId: '',
  companyName: '',
  /** Own phone: members.phone is excluded from the directory shape (PII). */
  phone: '',
  /** Viewer for the /mobile/channel-manager design preview (Daniel's view). */
  managerMemberId: '320ec221-38fa-9c5f-97b3-6abeb68ff0fe',
  canPostAnnouncements: readCanPostOverride() ?? false,
}

/** Fills `session` from GET /api/session. Must resolve before first render. */
export async function initSession(): Promise<void> {
  const url = new URL('/api/session', window.location.origin)
  url.searchParams.set('as', session.asMember)
  const res = await fetch(url)

  if (!res.ok) {
    // Bad or stale ?as= slug: reset to the default member and reboot the
    // tab rather than rendering with a broken identity.
    if (res.status === 404 && session.asMember !== 'priya') {
      sessionStorage.removeItem('as')
      window.location.replace(window.location.pathname)
      return new Promise(() => {})
    }
    throw new Error(`session bootstrap failed: ${res.status} ${await res.text()}`)
  }

  const data = (await res.json()) as {
    member_id: string
    company_id: string
    company_name: string
    phone: string | null
    can_post_announcements: boolean
  }

  session.memberId = data.member_id
  session.companyId = data.company_id
  session.companyName = data.company_name
  session.phone = data.phone ?? ''
  session.canPostAnnouncements = readCanPostOverride() ?? data.can_post_announcements
}
