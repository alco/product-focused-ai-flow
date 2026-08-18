// Presence (online dots) is ephemeral state served by Phoenix Presence over a
// channel — deliberately not a table, not a shape, not a collection
// (agent_artifacts/shape-model.md, "deliberate non-shapes"). This hard-coded
// set stands in until the presence channel exists.
//
// Ids are the real seeded rows (priv/repo/seeds.exs) for Priya, Daniel,
// Amira, Sofía, Yuki and Hannah — see db/session.ts.

export const onlineMemberIds: ReadonlySet<string> = new Set([
  '40af6c74-df81-7136-92a9-5c7e1e69d160', // Priya Nair
  '320ec221-38fa-9c5f-97b3-6abeb68ff0fe', // Daniel Okafor
  'b504eeb6-349f-c85f-1fd4-06211983c704', // Amira Haddad
  '55cb7b39-7626-aa81-b87e-827cf399b2d0', // Sofía Reyes
  'd302cbe2-58db-b644-9c8b-a1c248c80e5f', // Yuki Tanaka
  'cf3c906b-bebc-ab22-7781-07c656fe6da4', // Hannah Lewis
])
