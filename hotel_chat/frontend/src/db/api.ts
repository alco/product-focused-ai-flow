// Thin client for the messaging write path (POST /api/*).
//
// Every write endpoint runs its insert/update in a Postgres transaction,
// captures that transaction's id, and returns it as `txid` — the same value
// Electric stamps on the change messages it streams back (`headers.txids`).
// The collections' mutation handlers (db/collections.ts) return this txid to
// TanStack DB, which holds the optimistic state until `awaitTxId` sees the
// write arrive through the sync stream — at which point the optimistic
// overlay is dropped exactly in sync with the confirmed row appearing.

import { session } from './session'

export interface WriteResult {
  /** null when the request wrote nothing (e.g. the DM already existed). */
  txid: number | null
  data: { id: string } & Record<string, unknown>
}

/**
 * Unwraps the txid from an endpoint that always writes — only the DM-dedupe
 * response of POST /api/conversations legitimately carries a null txid.
 */
export function txidOf(res: WriteResult): number {
  if (res.txid === null) throw new Error('expected a txid on this write response')
  return res.txid
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: string,
    path: string,
  ) {
    super(`POST ${path} failed with ${status}: ${body}`)
  }
}

export async function postJson(
  path: string,
  body: Record<string, unknown>,
): Promise<WriteResult> {
  const url = new URL(path, window.location.origin)
  // TEMPORARY(auth): the mock-session member rides on every write —
  // see db/session.ts.
  url.searchParams.set('as', session.asMember)
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new ApiError(res.status, await res.text(), path)
  return res.json() as Promise<WriteResult>
}
