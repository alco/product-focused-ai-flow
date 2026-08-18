# UI mockup (and frontend codebase setup)

Now that we have established the product vision and defined the scope for the MVP in 2028-08-18-session-1-summary.md it is time to decide what the MVP will look like and start shaping up the code structure.

2026-08-18-session-2-prep.md should be your starting point for getting into the right mindset for this session

At a high level, we'll have separate directories for the frontend (hotel_chat/frontend) and backend (hotel_chat/backend). Our frontend tech stack:

| Layer            | Choice                                                                 | Notes                                                                    |
| ---------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| UI framework     | React                                                                  | Standard, no SSR framework layer                                         |
| Routing          | **TanStack Router**                                                    | Not TanStack Start                                                       |
| Local data store | **TanStack DB** (v0.6+)                                                | Reactive client store, syncs via Electric collections                    |
| Build tool       | Vite                                                                   | Also underlies TanStack Router's dev/build pipeline                      |
| Language         | TypeScript                                                             | End-to-end type safety, especially route params/search params via Router |
| Styling          | Static and inline CSS if we can get away with it? See hotel_chat/brand |                                                                          |

Later on, once we're working on the implementation, we'll look towards

| Layer                  | Choice                                                               | Notes                                            |
| ---------------------- | -------------------------------------------------------------------- | ------------------------------------------------ |
| Local persistence      | `@tanstack/db-sqlite-persistence-core` (wa-sqlite / browser adapter) | Persists collections across reloads/restarts     |
| Offline mutation queue | `@tanstack/offline-transactions`                                     | Queues writes made offline, replays on reconnect |

For now, though, you job is to set up a working Node project using the tech choices listed above. For TanStack-specific parts, use the bundled skills as described at the top of [this blog](https://electric.ax/blog/2026/03/06/agent-skills-now-shipping).

Our first milestone is to be able to run the frontend usign vite's dev server without any backend logic OR data. We're honing in on the client's UX at this stage.

## Building screens/pages 

Let's define some constraints and rough ordering in which you'll be building the mockups. I'll be accessing each page by URL, do not worry about hooking up navigation just yet, just focus on individual pages.

- Home page for mobile: chat list. Fill it with enough lines to make it scrollable
- Conversation page: group chat. Stick to text messages, reactions and mentions. We'll work on other media types later.
- Conversation page: 1-on-1 chat. Simpler than group since no mentions and member list are needed here.
- Announcement channel: we need separate layouts for readers and managers with composing powers
- Desktop shell: feed the results from the previous steps to produce a desktop mockup with a sidebar for conversations on the left and the main content area showing an open convo, with composing field and tools at the bottom, and members list on the right.
- the rest of the screens from the prep doc

## Sequencing the steps

As the main agent, I trust that you can setup the project scaffolding and then spin up parallel agents to work on individual screens/pages. Your job will be to review subagents' work and ensure consistent execution across the whole UI: that is, you may need to spawn another subagent to fix up the work already done but its predecessor.

Only ping me with questions in case you hit a genuine roadblock and need human input. I'll be observing you from the shadows.

