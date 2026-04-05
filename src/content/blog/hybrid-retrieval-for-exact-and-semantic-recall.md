---
title: Hybrid Retrieval for Exact and Semantic Recall
description: Why production memory systems need both semantic search and lexical retrieval instead of treating them as substitutes.
excerpt: Pure semantic retrieval misses exact strings at the worst possible moments. Pure lexical retrieval misses intent. Hybrid retrieval exists because production queries require both.
publishedAt: 2026-03-28T00:00:00.000Z
updatedAt: 2026-03-28T00:00:00.000Z
author: Aletheia Team
tags:
  - Hybrid Retrieval
  - Semantic Search
  - BM25
image: /screen.png
featured: true
---

Semantic search is excellent until someone asks for a ticket number, a short product code, or a quoted phrase that must match exactly.

Lexical search is excellent until someone asks the same question with different wording.

Production memory systems need both.

## The false choice

Teams often frame retrieval design as a choice:

- vector search for meaning
- keyword search for exactness

That framing is too narrow. Real-world memory queries regularly contain both semantic and exact-term intent.

Examples:

- "What did the user say about the Enterprise Pro plan?"
- "Show me the memory about ACME-4921."
- "When did we decide to replace Redis with Valkey?"

Each query mixes fuzzy meaning with exact anchors.

## What lexical retrieval still does better

Lexical systems remain strong at:

- identifiers
- dates
- quoted strings
- names with rare spelling
- acronyms and short tokens

Those are exactly the places where retrieval mistakes feel obviously wrong to the user.

## What semantic retrieval still does better

Semantic systems remain strong at:

- paraphrased questions
- indirect references
- concept similarity
- sparse wording where exact overlap is weak

That matters when the user remembers the idea but not the exact phrasing.

## The production pattern

A robust retrieval stack usually does something like this:

```text
semantic candidates + lexical candidates -> fusion -> reranking
```

The fusion step broadens recall. The reranking step restores precision.

## Why agent memory benefits even more

Agent memory queries are unusually diverse. They can contain:

- explicit user facts
- long-form conversation history
- internal IDs
- evolving preferences
- time references

No single scoring method handles all of those well.

## The mistake to avoid

Do not treat lexical retrieval as a legacy fallback. In many systems, it is the reason exact facts remain discoverable at all.

The best retrieval stacks are not semantically pure. They are operationally correct.

That means combining multiple signals and letting the ranking system decide which evidence matters most for the current query.
