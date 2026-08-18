// Mock session bootstrap — the values the auth/session API will hand the
// client after login (they are deliberately NOT collections: the company name
// and my own phone number arrive via session bootstrap, not via a shape —
// see "deliberate non-shapes" in agent_artifacts/shape-model.md).
//
// Ids stay readable slugs ('priya', 'harbourlight') until real backend data
// exists; they are plain strings, so swapping in uuids later changes nothing.

export const session = {
  /** $me — injected server-side into every shape's where-clause. */
  memberId: 'priya',
  companyId: 'harbourlight',
  companyName: 'Harbourlight Hotels',
  /** Own phone: members.phone is excluded from the directory shape (PII). */
  phone: '+44 7700 900417',
  /** Viewer for the /mobile/channel-manager design preview (Daniel's view). */
  managerMemberId: 'daniel',
}
