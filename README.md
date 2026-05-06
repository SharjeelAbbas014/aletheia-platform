# Aletheia Platform

**AletheiaDB** is a temporal memory database for AI agents. It stores memories as evolving evidence, tracks which facts are currently true, invalidates stale facts, computes numeric answers deterministically, and retrieves context through a hybrid of vector, lexical, graph, and temporal search.

Unlike generic memory APIs that just wrap embeddings and return stale information, Aletheia is an actual database engine built in Rust. It focuses on the core problem of long-term agent memory: **knowing what is currently true, rather than just recalling what was said in the past.**

This open-source repository (`aletheia-platform`) powers the official web platform deployed at [aletheiadb.com](https://aletheiadb.com), built with [Qwik](https://qwik.builder.io/). It serves the marketing landing page, developer documentation, blog, and the user dashboard for API key management.

## What Aletheia Does Better (The Benefits)

- **Temporal Truth & Fact Supersession:** Aletheia understands when a new fact supersedes an old one (e.g., "I moved to Seattle" invalidates "I live in Austin"). Stale facts are filtered out, giving your agents accurate context.
- **Deterministic Numeric Memory:** It computes numeric answers (counts, sums) deterministically using a metric vault, rather than relying on the LLM to guess the right number from a context window.
- **Local-First, Single-Binary Engine:** The core engine is deployed via a highly performant Rust binary. Keep your data private and local.
- **True Hybrid Retrieval:** Combines HNSW vector search, BM25 full-text search, graph knowledge retrieval, and time-aware ranking in one unified system.
- **Drop-in Proxy:** Add memory to existing OpenAI SDK apps by simply changing the base URL. Aletheia automatically injects context and forwards the request to your LLM provider.
- **Model Context Protocol (MCP):** Designed for IDEs and agents like Claude Code, Cursor, and Windsurf via an MCP stdio server.

## How to Use Aletheia

### 1. Local Engine
Run Aletheia privately on your local machine for privacy-focused coding agents.
```bash
aletheia serve
```

### 2. Drop-In Proxy
For developers already using OpenAI-style APIs, add memory to your agents without rewriting your application code. Change your SDK's base URL to point to your Aletheia instance, and pass your Aletheia API key.

### 3. Hosted Platform & API Keys
The hosted API provides managed memory infrastructure with API keys and usage stats. Log into the platform dashboard to manage your credentials.

---

## Developing the Web Platform

This repository contains the Qwik rewrite of the Aletheia dashboard and marketing site.

### Includes
- Marketing landing page on `/`
- Documentation surface on `/docs`
- Blog surface on `/blog`
- Demo login on `/login`
- Cookie-backed API key dashboard on `/platform`

### Run locally

```bash
npm install
npm run dev
```

### Production build

```bash
npm run build
npm run serve
```

### Demo Login

You can test the platform dashboard locally using the demo credentials:
- **Email:** `demo@aletheia.dev`
- **Password:** `aletheia-demo`

*(Override these by setting `ALETHEIA_DEMO_EMAIL` and `ALETHEIA_DEMO_PASSWORD` in your environment.)*

### Blog Authoring

Blog posts live in `src/content/blog/*.md`.
- The filename becomes the slug.
- Frontmatter drives title, description, dates, tags, and featured state.
- New `.md` files are picked up automatically by the blog index, post routes, sitemap, and SEO metadata.
