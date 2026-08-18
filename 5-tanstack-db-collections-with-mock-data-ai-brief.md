# Building TanStack DB collections for data fetching

We need replace the current mock data loading stubs (mock data lives under hotel_chat/frontend/src/mock) with real TanStack DB QueryCollections. Make the collections still use hard-coded data (so no outgoing requests from the queryFn functions). Once all collections are defined and are in the right places, replacing them with Electric collections will be the trivial next step. That's where we'll start loading real data.

When you're done, don't forget to save the summary and update the Roadmap entry in README.md
