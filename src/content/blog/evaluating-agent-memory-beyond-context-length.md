---
title: Evaluating Agent Memory Beyond Context Length
description: Why serious memory evaluation should focus on recall quality, temporal correctness, and contradiction handling instead of context window size alone.
excerpt: A long context window does not prove an agent remembers well. Memory quality is about retrieving the right evidence at the right time.
publishedAt: 2026-03-25T00:00:00.000Z
updatedAt: 2026-03-25T00:00:00.000Z
author: Aletheia Team
tags:
  - Evaluation
  - Long Context
  - Benchmarks
image: /screen.png
featured: false
---

Large context windows changed what models can *see*. They did not automatically solve what systems can *remember*.

That distinction matters when people evaluate agent memory products.

## The wrong proxy

Context length is often used as a proxy for memory quality. It should not be.

A system can accept a huge prompt and still fail at:

- surfacing the newest fact
- recovering the right detail from many sessions
- preferring an exact identifier over a vague match
- avoiding obsolete evidence

Those failures are retrieval failures, not just model failures.

## Better questions to ask

A useful memory evaluation asks:

- Did the system retrieve the correct evidence?
- Was the evidence fresh enough for the question?
- Were contradictory memories filtered or handled properly?
- Did exact terms survive the retrieval pipeline?
- Did reranking improve or hurt the final answer?

These questions are closer to production behavior than "How many tokens fit?"

## Memory quality is compositional

Agent memory depends on several layers working together:

- ingestion quality
- companion fact extraction
- semantic recall
- lexical recall
- temporal ranking
- final generation

If you only measure the model output, you miss where the failure actually happened.

## What strong evaluation looks like

A practical benchmark suite should include:

- changing user preferences
- timeline questions
- rare names or identifiers
- multi-session reasoning
- stale-fact suppression

Those are the situations where naive memory systems start to break.

## How this connects to the Aletheia approach

Aletheia is built around the evaluation properties described above. The engine's [hybrid retrieval](/blog/hybrid-retrieval-for-exact-and-semantic-recall) fuses semantic and lexical scores, [temporal ranking](/docs/time-ranking) ensures freshness signals survive the retrieval pipeline, and [fact supersession](/blog/fact-supersession-for-agent-memory) prevents stale evidence from competing with current truth.

For a deeper look at our scoring methodology, see the [benchmarking documentation](/docs/benchmarking) and our public [LongMemEval results](/platform/benchmarks).

## The takeaway

Memory is not a bigger prompt. It is a retrieval and ranking discipline.

If you want agents that remain coherent across time, evaluate the memory layer on the properties that users actually notice: correctness, freshness, and consistency.
