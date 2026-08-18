// Presence (online dots) is ephemeral state served by Phoenix Presence over a
// channel — deliberately not a table, not a shape, not a collection
// (agent_artifacts/shape-model.md, "deliberate non-shapes"). This hard-coded
// set stands in until the presence channel exists.

export const onlineMemberIds: ReadonlySet<string> = new Set([
  'priya',
  'daniel',
  'amira',
  'sofia',
  'yuki',
  'hannah',
])
