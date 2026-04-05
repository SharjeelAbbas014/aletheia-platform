---
title: "Building AI Agents with Deterministic Aggregation: Why Vector Databases Fail at Math"
description: "Learn how Aletheia's Deterministic Aggregation Layer solves the critical failure of vector databases in counting and numeric queries for AI agents."
date: "2026-04-10"
author: "Aletheia Team"
---

# Building AI Agents with Deterministic Aggregation: Why Vector Databases Fail at Math

When building long-term memory for AI agents, developers often reach for a standard vector database. They chunk text, embed it, and use cosine similarity to retrieve relevant memories. This works decently well for semantic questions like, *"What kind of food does the user like?"*

But what happens when you ask, *"How many times did I visit the gym in March?"* or *"What is the total amount I spent on software subscriptions?"*

**Vector databases fail.**

They fail because embeddings represent meaning, not math. The LLM receives a handful of chunks with numbers and tries to stitch them together. Often, it misses distractors, hallucinates aggregates, and produces wildly inaccurate answers. This is a known failure mode in benchmarks like LongMemEval and LoCoMo.

## The Solution: Aletheia's Deterministic Aggregation Layer

Aletheia takes a radically different approach. We believe a memory engine should act as a smart controller, not just a static retrieval index.

To solve the counting and aggregation problem, Aletheia incorporates a **Deterministic Aggregation Layer**. 

### How it Works

1. **Intent Classification**: When a query hits Aletheia, the engine classifies it. It detects `NumericAggregation` or `TemporalAggregation` intents (e.g., questions starting with "How many" or asking for totals).
2. **Adaptive Retrieval**: For numeric queries, Aletheia dynamically biases the retrieval toward **lexical (keyword) matching** rather than purely semantic matching, because numbers and dates are often lost in dense embeddings.
3. **Fact Extraction**: Aletheia extracts the atomic facts—values, units, and dates—from the retrieved memories.
4. **Deterministic Computation**: Instead of asking the LLM to guess the sum, Aletheia computes the exact count, sum, or average using deterministic Rust code. 
5. **LLM Presentation**: The LLM is then fed the computed aggregate along with the supporting evidence, allowing it to compose a perfectly accurate, grounded response.

## Why This Matters for Production Agents

If your AI agent is managing user finances, tracking habits, or acting as an executive assistant, mathematical accuracy isn't a nice-to-have; it's a requirement. 

By offloading the aggregation work from the unpredictable LLM to Aletheia's deterministic engine, you get:

*   **100% Accuracy on Counts**: Stop hallucinating numbers.
*   **Reduced Context Window Costs**: You don't need to pass 50 chunks of text to the LLM to count them; Aletheia passes the final number.
*   **Faster Latency**: Deterministic code in Rust is blazingly fast compared to an LLM trying to reason through arithmetic.

Standard vector DBs are amnesiac and bad at math. Aletheia is built for the reality of human memory. 

Ready to upgrade your agent's cognition? Check out our [Quickstart Guide](/docs/quickstart).
