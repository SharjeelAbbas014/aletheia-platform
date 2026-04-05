---
title: "Beyond Vector Similarity: Neural-Symbolic Extraction for Agentic Memory"
description: "How Aletheia combines BERT-based Neural Extraction with Deterministic Logic to build a more reliable memory engine for AI agents."
excerpt: "Vector similarity is only half the battle. To truly understand a user, an agent needs to extract structured entities, relationships, and numeric metrics. Discover Aletheia's new Neural-Symbolic pipeline."
publishedAt: 2026-04-05T00:00:00.000Z
updatedAt: 2026-04-05T00:00:00.000Z
author: "Aletheia Team"
tags:
  - Neural Extraction
  - Knowledge Graph
  - Metric Vault
  - AI Agents
image: /screen.png
featured: true
---

# Beyond Vector Similarity: Neural-Symbolic Extraction for Agentic Memory

Most RAG (Retrieval-Augmented Generation) systems rely on a single primitive: **Vector Similarity**. You embed a chunk of text, store it in a database, and pull it back when a similar query arrives.

But human memory doesn't just work by "vibe check." We extract structured facts, recognize people and places, and track numeric changes over time. 

Today, we're introducing Aletheia's **Neural-Symbolic Extraction Pipeline**—a major upgrade to the memory engine that moves beyond simple text matching into structured knowledge management.

## The Problem with Pure Neural Memory

If you tell an agent, "I spent $50 on dinner today," a standard vector database will retrieve that chunk when you ask about spending. But if you ask, "How much have I spent on dinner this week?" the LLM has to:
1. Retrieve every single chunk where you mentioned dinner.
2. Hope it didn't miss any distractors.
3. Perform the arithmetic correctly.

This is a brittle process. LLMs are notoriously bad at exhaustive retrieval and precise math in long-context windows.

## The Aletheia Solution: Neural-Symbolic Fusion

Aletheia now implements a multi-stage extraction pipeline that runs during ingestion:

### 1. Neural Entity Extraction (BERT-NER)
We've integrated a local BERT-based Named Entity Recognition (NER) model. Every time a memory is ingested, Aletheia automatically identifies:
*   **People (PER)**: Tracking who the user interacts with.
*   **Organizations (ORG)**: Building a map of companies and teams.
*   **Locations (LOC)**: Understanding the user's geographic context.

### 2. Autonomous Relationship Discovery
Extraction is useless without connection. Aletheia uses relationship heuristics to build a **Knowledge Graph** automatically. If you mention a person and a company in the same breath, Aletheia creates an `associated_with` edge. If you express a preference ("I love jasmine tea"), it triggers **Implicit Preference Detection**, creating a `has_preference` link that is exempt from the standard time-decay policies.

### 3. The Metric Vault (Deterministic Logic)
For the "math" problem, we've added the **Metric Vault**. Alongside the neural embedding, Aletheia runs a suite of deterministic regex extractors to pull out:
*   **Currency**: $50, 100 EUR, etc.
*   **Distance**: 5 miles, 10km.
*   **Counts**: "3 times", "2 people".

These values are stored in a specialized B-Tree index, allowing for **O(log N) deterministic aggregation**. When you query the Analytics API, Aletheia doesn't "guess" the total—it computes it with absolute precision.

## Why This Matters

By moving structure-extraction into the memory kernel, we give AI agents a "System 2" for their memory.
*   **Perfect Accuracy**: Deterministic aggregation for numbers.
*   **Deep Context**: A graph of relationships that survives model swaps.
*   **Smarter Decay**: Preferences stay fresh forever, while conversational noise fades away.

Memory is not just a bag of words. It's a structured understanding of reality. 

Check out the new [Analytics API Documentation](/docs/detailed/api-analytics) to start building math-perfect agents.
