---
title: "Knowledge Graph Memory for AI Agents: Why Relationships Matter as Much as Facts"
description: "Why a knowledge graph layer transforms agent memory from a flat text store into a structured understanding of user relationships and preferences."
excerpt: "A vector index can retrieve similar passages. A knowledge graph can answer who the user knows, what they prefer, and how their world is connected."
publishedAt: 2026-04-12T00:00:00.000Z
updatedAt: 2026-04-12T00:00:00.000Z
author: "Aletheia Team"
tags:
  - Knowledge Graph
  - Agent Memory
  - Graph Retrieval
image: /screen.png
featured: true
---

# Knowledge Graph Memory for AI Agents: Why Relationships Matter as Much as Facts

A vector index answers one question well: "What text looks similar to this query?"

That is useful, but agents often need to answer questions that similarity search cannot handle directly:

- "Who does the user work with most frequently?"
- "Which organizations are connected to this project?"
- "What preferences has this user expressed about AI tools?"
- "How are these memories related to each other?"

Those are relationship questions, not similarity questions. Answering them requires a memory model that stores connections between entities, not just embeddings of text.

## What a knowledge graph adds to memory

A knowledge graph stores entities as nodes and their relationships as edges. In an agent memory context, that means:

- people, organizations, locations, and preferences become nodes
- interactions, associations, and changes become edges
- the graph can be traversed to answer multi-hop questions

This is fundamentally different from vector search. Vector search finds passages that look like the query. Graph traversal finds entities that are connected to entities the query mentions.

## When graph retrieval outperforms vector search

### Entity-centric questions

"Who did I meet with last week?" is not a similarity question. It is a retrieval question about a specific entity type within a time window. A graph model can answer it by traversing from the user node to recent meeting nodes. A vector index has to hope the relevant passage scores highest.

### Relationship discovery

"Does this user know anyone at Acme Corp?" requires connecting two entity types: people and organizations. In a graph, that is a two-hop traversal: user -> meeting -> organization. In a vector index, it requires retrieving all memories mentioning Acme Corp and filtering manually.

### Preference aggregation

"What tools does this user prefer?" is a question about preference-type relationships. A graph model can collect all outgoing `has_preference` edges from the user node and rank them by recency. A vector index has to retrieve text passages and hope the model extracts the preferences correctly.

## How Aletheia implements knowledge graph memory

Aletheia's knowledge graph is built during ingestion through the [neural-symbolic extraction](/blog/beyond-vector-similarity-neural-symbolic-extraction) pipeline:

1. Entity extraction identifies people, organizations, and locations using a local BERT-NER model
2. Relationship heuristics create edges between entities that co-occur in the same memory
3. Implicit preference detection creates `has_preference` edges exempt from standard decay
4. The Metric Vault stores numeric facts as node properties with deterministic aggregation

The graph supports BFS traversal for relationship queries and integrates with the [hybrid retrieval](/blog/hybrid-retrieval-for-exact-and-semantic-recall) kernel for combined semantic-plus-graph queries.

## Combining graph and vector retrieval

The strongest memory systems do not choose between graph and vector retrieval. They combine them.

A typical query might:

1. Use vector similarity to find candidate memories
2. Use the knowledge graph to expand the candidate set with related entities
3. Use temporal ranking to prefer fresh facts over stale ones
4. Use [fact supersession](/blog/fact-supersession-for-agent-memory) to demote superseded edges

This combined approach handles a wider range of queries than any single retrieval method.

## Practical query examples

### Single-hop: "What is the user's current city?"

```text
(user) --[lives_in]--> (Miami)
```

The graph returns the active `lives_in` edge. Supersession marks the old `lives_in` -> `NYC` edge as stale.

### Multi-hop: "Which companies has the user evaluated?"

```text
(user) --[evaluated]--> (Company A)
(user) --[evaluated]--> (Company B)
(user) --[evaluated]--> (Company C)
```

Graph traversal collects all outgoing `evaluated` edges and returns the target nodes.

### Temporal: "Where did the user live before moving to Miami?"

```text
(user) --[lives_in {superseded: true}]--> (NYC)
(user) --[lives_in {active: true}]--> (Miami)
```

The graph returns both, but the ranking layer demotes the superseded edge for present-tense queries and promotes it for historical queries.

## The takeaway

Vector retrieval finds similar text. Graph retrieval finds structured relationships. Production agent memory needs both.

The Aletheia knowledge graph is designed as a complement to the [hybrid retrieval](/blog/hybrid-retrieval-for-exact-and-semantic-recall) kernel, not a replacement. Together they cover the range of queries that long-lived agents actually encounter.

Explore the [architecture documentation](/docs/architecture) for implementation details, or try the [interactive memory graph](/#lattice) on the landing page.
