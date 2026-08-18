// Mock session bootstrap — the values the auth/session API will hand the
// client after login (they are deliberately NOT collections: the company name
// and my own phone number arrive via session bootstrap, not via a shape —
// see "deliberate non-shapes" in agent_artifacts/shape-model.md).
//
// The member/company ids below are the real seeded rows (priv/repo/seeds.exs)
// for Priya Nair @ Harbourlight Hotels — matching HotelChat.Sync.MockSession,
// the backend's own stand-in for these same rows until real auth lands. Both
// sides derive them the same way (sha256 of "member:priya" /
// "company:harbourlight", loaded as a UUID) so they can't drift silently.

// TEMPORARY(auth): the announcement-posting permission will arrive with the
// rest of the server-provided user info once real auth lands. Until then a
// `?can_post_announcements=1` (or `=0`) query param toggles it, persisted in
// sessionStorage so it survives client-side navigation within the tab.
function readCanPostAnnouncements(): boolean {
  const key = 'can_post_announcements'
  const param = new URLSearchParams(window.location.search).get(key)
  if (param !== null) {
    sessionStorage.setItem(key, param === '0' || param === 'false' ? '0' : '1')
  }
  return sessionStorage.getItem(key) === '1'
}

export const session = {
  /** $me — injected server-side into every shape's where-clause. */
  memberId: '40af6c74-df81-7136-92a9-5c7e1e69d160',
  companyId: '89eae56d-3296-8581-5c48-b2684e23db93',
  companyName: 'Harbourlight Hotels',
  /** Own phone: members.phone is excluded from the directory shape (PII). */
  phone: '+44 7700 900417',
  /** Viewer for the /mobile/channel-manager design preview (Daniel's view). */
  managerMemberId: '320ec221-38fa-9c5f-97b3-6abeb68ff0fe',
  /** TEMPORARY(auth): gated by the query param above, not by real user info. */
  canPostAnnouncements: readCanPostAnnouncements(),
}
