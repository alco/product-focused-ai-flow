# Messaging feature buildout

The following sections describe the work that must be done in parallel in separate worktrees. Each worktree agent can run its own instance of run.sh with a unique PORTS offset so as not to conflict with other agents.

Your job is to merge those branches into main and resolve conflicts.

I will be AFK so keep going as far as you can unattended to execute all of the goals described here.

## UI issues

The following issues should all be addressed in the frontend code, implemented and verified in a separate worktree.

### desktop

1. Clicking on announcement channels shows mobile message layout with mobile nav in the content area.
2. The content area for direct messages and group chats doesn't use the full available width. Message bubbles should maintain constant distance from left or right borders of their container.
3. The Chats/People/Profile menus are missing. People and Profile should always be visible on the top bar of the content area (where the chat title goes). In group chats, the right side bar's top bound should be immediately below the horizontal top bar.
4. There's no "New group chat" button, it should be placed at the bottom of the left sidebar and have the text title "New group chat".
5. Clicking on the company name and logo in the top-left corner should load the landing page as if no conversation is selected.

### both platforms

1. Get rid of custom chat icons. Instead, show a group of circles for group chats, all aligned on the same base line but overlapping. If there are more than 3 members in the group, show 2 overlapping circles, followed by middle ellispis, followed by one last circle.

2. The Favorites section should have its own background color to stand out among the other sections.


## Messaging features

In a separate worktree, build separate endpoints to Create a new message in a conversation, React to a message, Reply to a message, Create a new convo, Post an announcement, Mark conversation as read (the frontend should send a request to this endpoint when the user scrolls to the bottom, if the convo is unread to begin with). Pair each one with the corresponding frontend implementation that uses TanStack's optimistic mutations to hit the Phoenix API. Use TanStack skills and make sure to correctly use txids for optimistic state tracking in TS DB.

Add temporary support for setting the current user's can_post_announcements permission via URL query param. And show the announcement input UI conditional on the value of this flag. Later on, when we build real auth, we'll remove this flag and will rely on server-provided user info instead.
