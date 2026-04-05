---
title: Fact Supersession for Agent Memory
description: How fact supersession prevents stale claims from competing with newer truth inside an agent memory system.
excerpt: If your memory layer stores every fact forever at the same priority, your agent will eventually argue with itself. Supersession is how you stop that.
publishedAt: 2026-03-30T00:00:00.000Z
updatedAt: 2026-03-30T00:00:00.000Z
author: Aletheia Team
tags:
  - Fact Supersession
  - Agent Memory
  - Retrieval Quality
image: /screen.png
featured: true
---

One of the least discussed problems in agent memory is contradiction management.

Users update addresses. Companies change vendors. A sales lead moves stages. A product spec gets revised. If your memory layer stores every statement as equally retrievable forever, the agent will keep seeing multiple versions of reality at the same time.

That leads to brittle answers and low trust.

## What supersession means

Fact supersession is the ability to mark one claim as having replaced another claim.

For example:

- "The customer uses Stripe."
- "The customer migrated from Stripe to Adyen."

Those are not two equally valid present-tense facts. The second one changes the interpretation of the first.

## Why timestamps alone are not enough

A timestamp helps, but it does not fully solve the problem.

Recent data can still lose if:

- the older memory is phrased closer to the query
- the older memory has stronger lexical overlap
- the application dumps both into the same prompt window

Temporal weighting helps. Explicit invalidation helps more.

## A practical supersession model

A usable implementation often tracks:

- the original fact
- the replacing fact
- a relation that says the older fact is superseded
- the effective timestamp of the replacement

That gives you two useful behaviors.

First, present-tense retrieval can demote or suppress the outdated fact.

Second, historical retrieval can still surface the older fact when the query explicitly asks about a past state.

## Retrieval behavior after supersession

Your ranking policy should be clear:

1. If the query asks for current truth, prefer active facts.
2. If a fact is superseded, reduce its weight or hide it.
3. If the query asks for prior state, allow superseded facts back into the result set.

This is the difference between a memory system that understands change and one that just remembers strings.

## Why this improves downstream generation

When the context window contains only current truth, the model does less reconciliation work. That reduces:

- contradictory answers
- hedging language
- accidental references to obsolete states

The retrieval layer becomes responsible for belief hygiene instead of forcing the model to clean it up.

## The product takeaway

If your agent is meant to operate continuously, supersession should be part of the data model, not just a post-processing trick.

The more a system interacts with the same user or account over time, the more important it becomes to know not only what was true, but what stopped being true.
