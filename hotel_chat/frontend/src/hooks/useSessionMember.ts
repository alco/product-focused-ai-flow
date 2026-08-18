// Live-query helpers for the signed-in member's own directory row and
// location — used by the shell chrome (sidebar, top bars) and profile.

import { eq, useLiveQuery } from '@tanstack/react-db'
import {
  directoryCollection,
  locationsCollection,
  memberLocationsCollection,
} from '../db/collections'
import { session } from '../db/session'
import type { Location, Member } from '../db/schema'

/** My own directory row (undefined while the collection loads). */
export function useMe(): Member | undefined {
  const { data } = useLiveQuery((q) =>
    q.from({ d: directoryCollection }).where(({ d }) => eq(d.id, session.memberId)),
  )
  return data[0]
}

/** My (first) location — MVP treats a member's first location as primary. */
export function useMyLocation(): Location | undefined {
  const { data: assignments } = useLiveQuery((q) =>
    q
      .from({ ml: memberLocationsCollection })
      .where(({ ml }) => eq(ml.member_id, session.memberId)),
  )
  const { data: locations } = useLiveQuery((q) => q.from({ l: locationsCollection }))
  const locationId = assignments[0]?.location_id
  return locations.find((l) => l.id === locationId)
}
