---
title: "OpenAI-Compatible Memory Proxy: Drop-In Persistent Memory for Existing Agents"
description: "How Aletheia's OpenAI-compatible proxy adds persistent, time-aware memory to any existing OpenAI agent without changing a single line of application code."
excerpt: "Adding memory to an existing OpenAI agent usually means rewriting the retrieval layer. Aletheia's proxy adds persistent memory by intercepting the API call—no code changes required."
publishedAt: 2026-04-14T00:00:00.000Z
updatedAt: 2026-04-14T00:00:00.000Z
author: "Aletheia Team"
tags:
  - OpenAI Proxy
  - Integration
  - MCP
image: /screen.png
featured: true
---

# OpenAI-Compatible Memory Proxy: Drop-In Persistent Memory for Existing Agents

The most common question we hear from teams building AI agents is: "How do I add memory without rewriting my entire stack?"

Most memory solutions require deep integration: new SDKs, custom retrieval logic, and significant changes to the application's data flow. That works for greenfield projects, but it is a barrier for teams with existing agents in production.

Aletheia's OpenAI-compatible proxy solves this differently. It adds persistent, time-aware memory by sitting between the application and the OpenAI API—no application code changes required.

## How the proxy works

The proxy exposes the standard OpenAI chat completions endpoint. Applications point their existing OpenAI client at the proxy URL instead of the OpenAI API. The proxy:

1. Receives the chat request exactly as it would go to OpenAI
2. Queries Aletheia's memory engine for relevant context about the user
3. Injects the retrieved memories into the system prompt
4. Forwards the augmented request to OpenAI
5. Returns the response to the application
6. Ingests the conversation turn into long-term memory

The application sees a standard OpenAI response. The user gets persistent memory across sessions.

## What it adds to existing agents

### Persistent cross-session memory

Without memory, each conversation starts from scratch. The agent does not know the user's name, preferences, or history. The proxy changes that by injecting relevant context from previous sessions before every request.

### Temporal awareness

The proxy uses Aletheia's [temporal ranking](/docs/time-ranking) to prefer fresh facts over stale ones. If a user's preference changed between sessions, the proxy surfaces the current preference rather than both.

### Fact supersession

When a user updates a preference, the proxy's next request automatically reflects the change. The [fact supersession](/blog/fact-supersession-for-agent-memory) engine marks old facts as stale, preventing the agent from seeing contradictory information.

### Model-agnostic continuity

Because memory is managed at the proxy layer rather than the model layer, switching between GPT-4, GPT-4o, or future models does not affect the memory state. The proxy handles retrieval and ingestion regardless of which model processes the request.

## Integration patterns

### Minimal setup: URL swap

The simplest integration changes one environment variable:

```python
# Before: no memory
client = OpenAI(api_key="sk-...")

# After: persistent memory
client = OpenAI(
    api_key="sk-...",
    base_url="https://memory.aletheiadb.com/v1"
)
```

No code changes. No new dependencies. The proxy handles retrieval, injection, and ingestion automatically.

### Custom memory scoping

For applications that need fine-grained control, the proxy supports custom entity IDs and memory namespaces:

```python
client = OpenAI(
    api_key="sk-...",
    base_url="https://memory.aletheiadb.com/v1",
    default_headers={
        "X-Aletheia-Entity-Id": "user-abc-123",
    }
)
```

This scopes memory retrieval to a specific user, preventing cross-user contamination.

### MCP integration

For agents running in MCP-compatible environments (Claude Code, Cursor, and other agentic IDEs), Aletheia also provides a [Model Context Protocol](/docs) server that exposes memory operations as standard MCP tools. This enables the same persistent memory in local development environments.

## When to use the proxy versus the SDK

The proxy is the right choice when:

- you have an existing OpenAI agent and want to add memory without refactoring
- you want memory to work across multiple models without integration work
- you need a quick proof-of-concept that can be replaced later

The [direct SDK integration](/docs/quickstart) is the right choice when:

- you need fine-grained control over retrieval parameters
- you want to combine memory with other Aletheia features like the knowledge graph or analytics
- you are building a new agent and want memory as a first-class architectural component

Both paths use the same underlying engine. The proxy trades flexibility for zero-friction setup.

## The takeaway

Adding persistent memory to an existing agent should not require a rewrite. The OpenAI-compatible proxy demonstrates that memory can be a transparent infrastructure layer rather than a deep integration.

For teams that need more control, the [Python and JavaScript SDKs](/docs/quickstart) expose the full engine surface. For teams that need memory now, the proxy adds it with one URL change.

Explore the [API authentication docs](/docs/api-auth) for setup details, or see how the proxy fits into the broader [memory infrastructure](/blog/ai-agent-memory-at-scale) stack.
