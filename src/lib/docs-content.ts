export interface DocsCodeBlock {
  label?: string;
  language?: string;
  code: string;
}

export interface DocsCallout {
  tone?: "info" | "warning" | "success";
  title?: string;
  body: string;
}

export interface DocsStat {
  label: string;
  value: string;
  description?: string;
  tone?: "default" | "primary" | "success" | "warning";
}

export interface DocsArtifact {
  name: string;
  description: string;
  meta?: string;
}

export interface DocsTable {
  columns: string[];
  rows: Array<{
    label: string;
    values: string[];
  }>;
  footnote?: string;
}

export interface DocsSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
  steps?: string[];
  codeBlocks?: DocsCodeBlock[];
  callout?: DocsCallout;
  stats?: DocsStat[];
  artifacts?: DocsArtifact[];
  table?: DocsTable;
}

export interface DocsPage {
  slug: string;
  eyebrow: string;
  title: string;
  lead: string;
  description: string;
  sections: DocsSection[];
}

export const detailedDocsPages: DocsPage[] = [
  {
    slug: "install",
    eyebrow: "Setup",
    title: "Install Aletheia",
    lead:
      "Set up the Aletheia engine locally with predictable binaries, model downloads, and SDK wiring.",
    description:
      "Installation guide for Aletheia including prerequisites, build flow, and first health check.",
    sections: [
      {
        heading: "Prerequisites",
        paragraphs: [
          "Aletheia is built as a Rust service with optional SDK clients. For a smooth start, install Rust stable and keep at least 4GB free disk for model and index artifacts.",
          "Use a dedicated workspace directory for cache and data files so benchmarks and local testing can be reset without touching your main development environment."
        ],
        bullets: [
          "Rust toolchain (stable channel)",
          "Git for fetching benchmark assets",
          "Node 20+ if you are using the platform/docs UI",
          "Python 3.10+ only if using the Python SDK examples"
        ]
      },
      {
        heading: "Build and first boot",
        paragraphs: [
          "The release build gives realistic performance for retrieval and reranking tests. Development builds are fine for functional checks but not for latency decisions."
        ],
        steps: [
          "Clone the monorepo and open `Aletheia`.",
          "Build release binary with Cargo.",
          "Start the API server on loopback.",
          "Call `/health` before sending ingest/query traffic."
        ],
        codeBlocks: [
          {
            label: "Build and run",
            language: "bash",
            code: `cargo build --release
./target/release/aletheia --bind 127.0.0.1:3000 --data-dir ./.tm-data`
          }
        ]
      },
      {
        heading: "SDK smoke test",
        paragraphs: [
          "After the server is healthy, run one ingest and one query through your preferred SDK. This validates auth headers, entity scoping, and transport behavior in one pass."
        ],
        codeBlocks: [
          {
            label: "Minimal curl check",
            language: "bash",
            code: `curl -sS http://127.0.0.1:3000/ingest \\
  -H "content-type: application/json" \\
  -d '{"entity_id":"user-123","textual_content":"I now drink tea instead of coffee."}'`
          }
        ]
      }
    ]
  },
  {
    slug: "concepts",
    eyebrow: "Foundations",
    title: "Core Concepts",
    lead:
      "Understand the core memory concepts before tuning retrieval or shipping integrations.",
    description:
      "Conceptual overview of Aletheia memory, companion memories, and hybrid retrieval behavior.",
    sections: [
      {
        heading: "Memory is multi-representation",
        paragraphs: [
          "Aletheia stores a memory event in multiple forms: raw text, embedding vector, lexical index terms, and graph relationships. This is why exact terms and paraphrases can both be recovered without scanning full transcripts.",
          "The engine is not just an ANN index. It is a retrieval system that fuses multiple signals into one ranked result list."
        ]
      },
      {
        heading: "Companion memories",
        paragraphs: [
          "Ingest can emit companion records such as facts and summaries. Companion memories compress conversational noise into stable retrieval surfaces, improving recall quality on long sessions.",
          "Companions are linked back to source turns through graph edges so provenance is auditable."
        ],
        bullets: [
          "Fact companions represent stable propositions.",
          "Summary companions capture compact session gist.",
          "Derived records never lose linkage to original turns."
        ]
      },
      {
        heading: "Freshness and truth",
        paragraphs: [
          "Temporal ranking and fact supersession prevent stale context from dominating retrieval. If user preferences change, older conflicting facts are demoted or invalidated.",
          "The practical goal is simple: newer truth should win unless the query explicitly asks for historical state."
        ]
      }
    ]
  },
  {
    slug: "architecture",
    eyebrow: "Architecture",
    title: "System Architecture",
    lead:
      "Aletheia combines temporal storage, vector retrieval, lexical scoring, and graph lineage in one service.",
    description:
      "Detailed architecture of Aletheia components and request flow.",
    sections: [
      {
        heading: "Runtime components",
        bullets: [
          "HTTP API: request validation and orchestration",
          "Temporal store: durable source of truth records",
          "Vector index: nearest-neighbor semantic recall",
          "Lexical index: BM25 exact-term recovery",
          "Graph store: provenance and supersession links",
          "Semantic models: bi-encoder and optional cross-encoder"
        ],
        paragraphs: [
          "Each component can fail independently, so production readiness depends on explicit health checks and reconciliation jobs between indexes and durable storage."
        ]
      },
      {
        heading: "Ingest flow",
        codeBlocks: [
          {
            label: "Ingest lifecycle",
            language: "text",
            code: `request -> normalize -> companion expansion -> embedding -> dedup\n       -> write temporal store -> write vector/lexical/graph indexes`
          }
        ],
        paragraphs: [
          "Durable write order matters. The source-of-truth store should be committed before secondary index updates are marked complete, otherwise reconciliation gets harder after crashes."
        ]
      },
      {
        heading: "Query flow",
        paragraphs: [
          "Query requests gather candidates from both semantic and lexical paths. Candidate lists can be reranked and fused, then filtered by temporal policy before response serialization.",
          "This design keeps both high recall and exact-term precision, even when the user asks for rare names, IDs, or dates."
        ],
        codeBlocks: [
          {
            label: "Hybrid retrieval sketch",
            language: "text",
            code: `semantic_topk + lexical_topk -> optional cross-rerank -> RRF fusion\n-> temporal filters (TTL, superseded facts) -> final ranked hits`
          }
        ]
      }
    ]
  },
  {
    slug: "data-model",
    eyebrow: "Data",
    title: "Data Model",
    lead:
      "The core record is `AgentObservation`, designed for temporal ordering and retrieval interoperability.",
    description:
      "Field-level explanation of the AgentObservation schema and retrieval implications.",
    sections: [
      {
        heading: "Primary record",
        codeBlocks: [
          {
            label: "Rust shape",
            language: "rust",
            code: `pub struct AgentObservation {
    pub entity_id: String,
    pub textual_content: String,
    pub embedding: Vec<f32>,
    pub kind: MemoryKind,
    pub created_at_ms: u64,
}`
          }
        ],
        paragraphs: [
          "`entity_id` defines the ownership scope. `created_at_ms` gives deterministic time ordering. `kind` controls decay and retention policy at query time."
        ]
      },
      {
        heading: "Field constraints",
        bullets: [
          "`entity_id` should be stable and tenant-safe",
          "`textual_content` should contain normalized text",
          "`embedding` dimension must match model output",
          "`created_at_ms` should use event time when possible"
        ],
        paragraphs: [
          "Store event time instead of processing time when available. This makes replay and timeline queries deterministic across re-ingestion runs."
        ]
      },
      {
        heading: "Why this model works",
        paragraphs: [
          "The model is intentionally compact. Secondary concerns like supersession, deletion lineage, or vector IDs are handled by adjacent tables rather than inflating the main record.",
          "Compact records reduce serialization overhead and simplify consistency checks in recovery tooling."
        ]
      }
    ]
  },
  {
    slug: "memory-kinds",
    eyebrow: "Policies",
    title: "Memory Kinds and Retention",
    lead:
      "Different memory kinds should age and rank differently to keep retrieval useful over time.",
    description:
      "Retention and ranking behavior by MemoryKind.",
    sections: [
      {
        heading: "Kind taxonomy",
        bullets: [
          "Conversational: raw episodic turns",
          "SessionSummary: compressed session-level context",
          "Fact: stable propositions and profile truths",
          "Lesson: extracted guidance from prior outcomes",
          "Decision: explicit committed decision",
          "Preference: user preferences intended to persist"
        ]
      },
      {
        heading: "Default policy ideas",
        paragraphs: [
          "Not all memories should decay equally. Conversational snippets become noisy quickly, while facts and preferences should persist unless explicitly superseded.",
          "Define policy centrally and keep it versioned; this prevents silent retrieval drift when teams tune decay weights ad hoc."
        ],
        codeBlocks: [
          {
            label: "Example policy table",
            language: "yaml",
            code: `conversational: { ttl_days: 90,  decay_half_life_days: 14 }
session_summary: { ttl_days: 60, decay_half_life_days: 10 }
fact: { ttl_days: 730, decay_half_life_days: 120 }
preference: { ttl_days: 730, decay_half_life_days: null }
decision: { ttl_days: null, decay_half_life_days: null }`
          }
        ]
      },
      {
        heading: "Operational guardrails",
        bullets: [
          "Record policy version used at ingest time.",
          "Recompute scores if policy version changes materially.",
          "Log filtered-hit counts by reason (ttl, invalidated, scope)."
        ]
      }
    ]
  },
  {
    slug: "id-conventions",
    eyebrow: "IDs",
    title: "ID and Session Conventions",
    lead:
      "Deterministic IDs make provenance, replays, and deletes much easier to reason about.",
    description:
      "ID structure and companion-memory naming conventions.",
    sections: [
      {
        heading: "Base memory ID format",
        paragraphs: [
          "A common convention is `entity_id::session_id::turn_index`. It allows lightweight parsing of ownership and session context without additional joins.",
          "Use immutable IDs. If content changes, create a new memory and link with graph edges instead of mutating IDs."
        ],
        codeBlocks: [
          {
            label: "Examples",
            language: "text",
            code: `user-42::session-7::3
user-42::session-7::1000003   # summary companion`
          }
        ]
      },
      {
        heading: "Companion memory IDs",
        bullets: [
          "Summary companions can reserve a high turn-index range.",
          "Fact companions can reserve a separate range and include ordinal slot.",
          "Keep deterministic mapping from source turn to companions."
        ],
        paragraphs: [
          "Deterministic companion IDs prevent duplicate expansion when ingest is retried."
        ]
      },
      {
        heading: "Delete and repair implications",
        paragraphs: [
          "When one memory is deleted, deterministic ID layout helps locate related companions and graph edges. Recovery jobs can reconstruct index state using predictable ID neighborhoods."
        ]
      }
    ]
  },
  {
    slug: "ingestion-pipeline",
    eyebrow: "Pipeline",
    title: "Ingestion Pipeline",
    lead:
      "Ingestion transforms raw events into durable, queryable Aletheia memory with deduplication and lineage.",
    description:
      "Step-by-step ingest pipeline including embedding, dedup, indexing, and graph updates.",
    sections: [
      {
        heading: "Pipeline stages",
        steps: [
          "Validate payload and normalize text.",
          "Expand companion memories when configured.",
          "Embed each memory candidate.",
          "Run dedup against content hash and entity scope.",
          "Persist source-of-truth records.",
          "Update vector, lexical, and graph indexes.",
          "Emit ingest result with accepted/skipped counters."
        ]
      },
      {
        heading: "Failure strategy",
        paragraphs: [
          "Index operations should be idempotent. If ingest crashes after durable write but before index completion, a background repair pass should re-index missing memory IDs.",
          "Never treat a secondary index success as proof that durable write succeeded. Source-of-truth storage decides ground reality."
        ]
      },
      {
        heading: "Recommended response shape",
        codeBlocks: [
          {
            label: "Ingest response",
            language: "json",
            code: `{
  "accepted": 12,
  "deduplicated": 3,
  "invalid": 0,
  "memory_ids": ["user-123::session-9::41", "user-123::session-9::42"]
}`
          }
        ]
      }
    ]
  },
  {
    slug: "vector-index",
    eyebrow: "Retrieval",
    title: "Vector Index",
    lead:
      "The vector index provides fast semantic candidate retrieval for paraphrase-heavy queries.",
    description:
      "How Aletheia uses vector embeddings and HNSW ANN search.",
    sections: [
      {
        heading: "Embedding path",
        paragraphs: [
          "A bi-encoder converts memory text and queries into a shared dense space. Vector similarity retrieves semantically close passages even when wording differs.",
          "Normalize vectors consistently for both ingest and query paths to avoid score drift."
        ]
      },
      {
        heading: "HNSW tradeoffs",
        bullets: [
          "Higher `ef_search` improves recall but increases latency.",
          "Higher `M` improves graph connectivity but uses more memory.",
          "Batch insertion patterns influence graph quality and cold-start behavior."
        ],
        codeBlocks: [
          {
            label: "Typical tuning",
            language: "yaml",
            code: `vector_index:
  metric: cosine
  m: 24
  ef_construction: 200
  ef_search_default: 64`
          }
        ]
      },
      {
        heading: "Operational checks",
        bullets: [
          "Track recall@k on a fixed evaluation set.",
          "Monitor p95 query latency by entity size bucket.",
          "Verify vector-id to memory-id mapping consistency after restarts."
        ]
      }
    ]
  },
  {
    slug: "lexical-index",
    eyebrow: "Retrieval",
    title: "Lexical Index (BM25)",
    lead:
      "Lexical retrieval catches exact names, tokens, and numeric strings that dense embeddings may miss.",
    description:
      "BM25 lexical indexing behavior and hybrid retrieval role.",
    sections: [
      {
        heading: "Why lexical still matters",
        paragraphs: [
          "Semantic retrieval is strong for paraphrase, but weak for exact literal matching in some cases. BM25 restores precision for IDs, dates, error codes, and uncommon terms.",
          "Hybrid retrieval avoids the false dichotomy of semantic-only vs keyword-only systems."
        ]
      },
      {
        heading: "Tokenization guidance",
        bullets: [
          "Normalize casing with domain-aware exceptions.",
          "Keep punctuation splitting consistent between ingest and query.",
          "Preserve key delimiters for IDs when possible."
        ],
        codeBlocks: [
          {
            label: "Example lexical-heavy query",
            language: "json",
            code: `{
  "textual_query": "order_id 9f8a12e0 timeout on shard-3",
  "entity_id": "tenant-77",
  "limit": 8
}`
          }
        ]
      },
      {
        heading: "Fusion expectations",
        paragraphs: [
          "BM25 candidates should be fused with semantic candidates, not blindly appended. Rank fusion methods like RRF keep both signals while reducing dominance by either side."
        ]
      }
    ]
  },
  {
    slug: "reranking",
    eyebrow: "Precision",
    title: "Cross-Encoder Reranking",
    lead:
      "Reranking improves top-k relevance by scoring query and passage jointly.",
    description:
      "How and when to apply cross-encoder reranking in Aletheia.",
    sections: [
      {
        heading: "Where reranking fits",
        paragraphs: [
          "Use semantic + lexical retrieval for broad candidate generation, then apply reranking to a small candidate set. This gives better precision without full-corpus cross-encoding cost.",
          "Reranking is most useful for ambiguous or compositional queries."
        ]
      },
      {
        heading: "Candidate budgeting",
        bullets: [
          "Retrieve 30-100 candidates from fusion stage.",
          "Rerank top 20-40 for latency-sensitive workloads.",
          "Expose a per-request override for evaluation runs."
        ],
        codeBlocks: [
          {
            label: "Rerank config",
            language: "yaml",
            code: `reranking:
  enabled: true
  model: cross-encoder/ms-marco-MiniLM-L-6-v2
  max_candidates: 32`
          }
        ]
      },
      {
        heading: "When to disable",
        paragraphs: [
          "Disable reranking for strict low-latency paths where lexical exact-match dominates query value, or when running tiny local benchmarks focused only on ingestion correctness."
        ]
      }
    ]
  },
  {
    slug: "time-ranking",
    eyebrow: "Temporal",
    title: "Time-Aware Ranking",
    lead:
      "Aletheia ranks by relevance and freshness so outdated context does not dominate.",
    description:
      "How TTL and decay are applied during query ranking.",
    sections: [
      {
        heading: "Temporal scoring",
        paragraphs: [
          "After retrieval and optional reranking, Aletheia applies temporal policy. Expired memories are filtered; surviving memories can be decayed based on age and kind.",
          "This reduces stale recall while preserving long-lived facts and preferences."
        ]
      },
      {
        heading: "TTL and decay",
        codeBlocks: [
          {
            label: "Conceptual score",
            language: "text",
            code: `final_score = relevance_score * freshness_weight(kind, age)
if age > ttl(kind): drop`
          }
        ],
        bullets: [
          "TTL is a hard cutoff.",
          "Decay is a soft demotion.",
          "Policy is kind-specific, not global."
        ]
      },
      {
        heading: "Practical tuning",
        paragraphs: [
          "Tune using replay datasets with known truth changes. If historical facts still outrank new facts, shorten half-life for conversational memory or increase supersession penalty."
        ]
      }
    ]
  },
  {
    slug: "fact-supersession",
    eyebrow: "Truth Management",
    title: "Fact Supersession",
    lead:
      "Fact supersession marks older conflicting facts as invalid so latest truth wins.",
    description:
      "How Aletheia tracks and enforces fact supersession over time.",
    sections: [
      {
        heading: "Current fact slots",
        paragraphs: [
          "Facts are grouped by logical key (for example `preferred_drink`). The current slot points to the newest valid memory ID for that key and entity.",
          "Historical facts are preserved in history tables for audits, but invalidated facts are excluded from normal retrieval results."
        ]
      },
      {
        heading: "Update behavior",
        steps: [
          "Extract normalized fact key/value pair.",
          "Lookup current fact slot by entity+key.",
          "Insert new fact as current slot entry.",
          "Mark prior current fact as invalidated with superseded-by reference.",
          "Append both records to fact history."
        ]
      },
      {
        heading: "Example",
        codeBlocks: [
          {
            label: "Preference change",
            language: "text",
            code: `t1: preferred_drink = coffee   -> current

t2: preferred_drink = tea      -> becomes current
    coffee fact marked invalidated(superseded_by=t2)`
          }
        ]
      }
    ]
  },
  {
    slug: "api-ingest",
    eyebrow: "API",
    title: "POST /ingest",
    lead:
      "Ingest stores one or more memory events and optionally emits companion memories.",
    description:
      "API contract for ingesting memories into Aletheia.",
    sections: [
      {
        heading: "Request contract",
        paragraphs: [
          "At minimum, include `entity_id` and `textual_content`. Advanced payloads can include explicit timestamps, memory kind hints, or session metadata.",
          "Use idempotency keys when your producer can retry requests."
        ],
        codeBlocks: [
          {
            label: "Example request",
            language: "json",
            code: `{
  "entity_id": "user-123",
  "session_id": "chat-82",
  "textual_content": "I moved from NYC to LA last month.",
  "created_at_ms": 1763653742000
}`
          }
        ]
      },
      {
        heading: "Response semantics",
        bullets: [
          "`accepted`: memories persisted and indexed",
          "`deduplicated`: memories skipped as duplicates",
          "`invalid`: rejected payload records",
          "`memory_ids`: IDs of accepted primary memories"
        ]
      },
      {
        heading: "Example curl",
        codeBlocks: [
          {
            label: "Ingest call",
            language: "bash",
            code: `curl -sS http://127.0.0.1:3000/ingest \\
  -H "content-type: application/json" \\
  -H "x-api-key: XXX1111AAA" \\
  -d '{"entity_id":"user-123","textual_content":"I moved from NYC to LA."}'`
          }
        ]
      }
    ]
  },
  {
    slug: "api-query-semantic",
    eyebrow: "API",
    title: "POST /query/semantic",
    lead:
      "Semantic query retrieves memories by intent and meaning, then applies temporal policy.",
    description:
      "API contract for semantic/hybrid query in Aletheia.",
    sections: [
      {
        heading: "Request fields",
        bullets: [
          "`textual_query`: user question or search prompt",
          "`entity_id`: retrieval scope",
          "`limit`: max returned hits",
          "`kind_filter` (optional): restrict memory kinds",
          "`include_superseded` (optional): include invalidated facts"
        ]
      },
      {
        heading: "Hybrid retrieval behavior",
        paragraphs: [
          "Despite the endpoint name, semantic query can still include lexical fusion and reranking under the hood, depending on engine configuration.",
          "This keeps the API stable while retrieval internals evolve."
        ]
      },
      {
        heading: "Example response",
        codeBlocks: [
          {
            label: "Top hit payload",
            language: "json",
            code: `{
  "hits": [
    {
      "memory_id": "user-123::chat-82::42",
      "textual_content": "I moved from NYC to LA last month.",
      "kind": "Fact",
      "score": 0.924,
      "created_at_ms": 1763653742000
    }
  ]
}`
          }
        ]
      }
    ]
  },
  {
    slug: "api-query-temporal",
    eyebrow: "API",
    title: "POST /query/temporal",
    lead:
      "Temporal query constrains retrieval to explicit time windows for timeline-sensitive reasoning.",
    description:
      "API contract for temporal-windowed retrieval.",
    sections: [
      {
        heading: "When to use",
        paragraphs: [
          "Use temporal query when users ask what was true at a specific time, or when you need only the most recent period of activity.",
          "This endpoint is useful for compliance, debugging, and user-facing activity summaries."
        ]
      },
      {
        heading: "Window controls",
        codeBlocks: [
          {
            label: "Temporal request",
            language: "json",
            code: `{
  "entity_id": "user-123",
  "textual_query": "where did I live?",
  "window_start_ms": 1751328000000,
  "window_end_ms": 1767225599000,
  "limit": 10
}`
          }
        ],
        bullets: [
          "Window boundaries are inclusive.",
          "Out-of-window memories are excluded before final ranking.",
          "Temporal filters combine with kind filters if provided."
        ]
      },
      {
        heading: "Interpretation",
        paragraphs: [
          "Temporal windows answer a different question than decay. Decay softly biases relevance toward freshness, while windows enforce hard time boundaries."
        ]
      }
    ]
  },
  {
    slug: "api-delete",
    eyebrow: "API",
    title: "DELETE /memory",
    lead:
      "Delete removes a memory from retrieval surfaces and records an audit trail for reconstruction.",
    description:
      "Deletion and index repair behavior for Aletheia memory records.",
    sections: [
      {
        heading: "Delete contract",
        paragraphs: [
          "Deletion should identify memory by `memory_id` and scope context. The engine should remove vector/lexical references and write a deletion-log record for audits.",
          "For fact memories, delete may trigger slot repair to recover latest valid predecessor."
        ],
        codeBlocks: [
          {
            label: "Delete request",
            language: "json",
            code: `{
  "entity_id": "user-123",
  "memory_id": "user-123::chat-82::42",
  "reason": "user_requested_erasure"
}`
          }
        ]
      },
      {
        heading: "Safety guidance",
        bullets: [
          "Require authorization stronger than read-only keys.",
          "Keep immutable delete audit logs.",
          "Return idempotent success for already-deleted IDs.",
          "Run periodic consistency checks across all indexes."
        ]
      },
      {
        heading: "Verification",
        paragraphs: [
          "After delete, query the same prompt and confirm memory is absent from results. For fact deletes, verify current fact slot points to expected fallback record."
        ]
      }
    ]
  },
  {
    slug: "cognitive-extraction",
    eyebrow: "Intelligence",
    title: "Cognitive Extraction Pipeline",
    lead: "Transform raw episodic text into structured knowledge triples and verified entities.",
    description: "Overview of Aletheia's neural entity extraction and autonomous relationship discovery.",
    sections: [
      {
        heading: "Neural Entity Extraction",
        paragraphs: [
          "Aletheia integrates a local BERT-based model for Named Entity Recognition (NER). During ingestion, episodic text is scanned to identify core entities without requiring external LLM calls.",
          "Entities are classified into standard categories (Person, Organization, Location, Miscellaneous), allowing for precise scoping and relationship mapping."
        ],
        bullets: [
          "PER: Identities and individual actors.",
          "ORG: Companies, teams, and institutions.",
          "LOC: Geographic context and movement history.",
          "MISC: General artifacts and specific concepts."
        ]
      },
      {
        heading: "Autonomous Relationship Discovery",
        paragraphs: [
          "Extracted entities are passed through a heuristic relationship engine that automatically constructs knowledge graph triples.",
          "For example, detecting a Person and an Organization in the same context can trigger an `associated_with` edge, while two people can trigger a `knows` edge."
        ]
      },
      {
        heading: "Implicit Preference Detection",
        paragraphs: [
          "Aletheia identifies sentiment and preference signals (love, hate, prefer, favorite) automatically. When detected, the memory is elevated to a `Preference` kind, exempting it from standard time-decay policies to ensure core user identity persists."
        ]
      }
    ]
  },
  {
    slug: "analytics-api",
    eyebrow: "Analytics",
    title: "The Metric Vault",
    lead: "Track and aggregate numeric truth with absolute deterministic precision.",
    description: "How to use the Aletheia Analytics API for range-based sums and counts of extracted metrics.",
    sections: [
      {
        heading: "Deterministic Metric Extraction",
        paragraphs: [
          "Beyond semantic recall, Aletheia uses deterministic regex extractors to identify numeric values during ingestion. These are stored in the Metric Vault—a specialized B-Tree index optimized for temporal range scans."
        ],
        bullets: [
          "Currency ($50, 100 EUR): Track user spending habits.",
          "Distance (5 miles, 10km): Track physical activity and movement.",
          "Counts (3 times, 5 people): Track frequency and social context."
        ]
      },
      {
        heading: "Querying the Vault",
        paragraphs: [
          "The `/analytics/query` endpoint allows you to compute sums and counts over specific time windows without hallucination risks."
        ],
        codeBlocks: [
          {
            label: "Aggregation Request",
            language: "json",
            code: `{
  "entity_id": "user-123",
  "label": "money",
  "start_timestamp_ms": 1743465600000,
  "end_timestamp_ms": 1744070400000
}`
          }
        ]
      }
    ]
  },
  {
    slug: "memory-proxy",
    eyebrow: "Ecosystem",
    title: "The Aletheia Proxy",
    lead: "An OpenAI-compatible gateway that automatically injects memory into your agent's system prompt.",
    description: "Learn how to use the Aletheia Proxy to add long-term memory to any application with zero code changes.",
    sections: [
      {
        heading: "Overview",
        paragraphs: [
          "The Aletheia Proxy (Memory Router) acts as a middleware between your application and your LLM provider. It intercepts standard OpenAI-style chat completion requests, retrieves the most relevant memories for the specified user, and injects them into the system prompt before forwarding the request to the upstream model.",
          "This allows you to add Aletheia's persistent memory to any existing agent or application by simply changing the `base_url`."
        ]
      },
      {
        heading: "How it works",
        steps: [
          "Your app sends a request to `/v1/chat/completions` on the Aletheia engine.",
          "Aletheia extracts the `user` field from the payload to identify the `entity_id`.",
          "It performs a high-precision semantic lookup based on the latest user message.",
          "The system prompt is augmented with a structured `[ALETHEIA PERSISTENT MEMORY]` block.",
          "The augmented request is forwarded to OpenAI (or your configured provider).",
          "The final response is returned to your application."
        ]
      },
      {
        heading: "Usage Example",
        paragraphs: [
          "To use the proxy, simply point your OpenAI client to your Aletheia instance. The `user` parameter is mapped to Aletheia's `entity_id`."
        ],
        codeBlocks: [
          {
            label: "Python (OpenAI SDK)",
            language: "python",
            code: `from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:3000/v1",
    api_key="YOUR_ALETHEIA_API_KEY"
)

# Aletheia will automatically retrieve memories for 'user-42'
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "What was the name of that coffee I liked?"}],
    user="user-42" 
)`
          }
        ]
      },
      {
        heading: "Configuration",
        paragraphs: [
          "The proxy behavior can be tuned using the following environment variables on the Aletheia engine:"
        ],
        bullets: [
          "OPENAI_API_KEY: Your upstream provider key.",
          "ALETHEIA_PROXY_TARGET_URL: The upstream endpoint (defaults to OpenAI).",
          "ALETHEIA_PORT: The local port Aletheia is running on (for loopback lookups)."
        ]
      }
    ]
  },
  {
    slug: "sdk-javascript",
    eyebrow: "SDK",
    title: "JavaScript SDK",
    lead:
      "Use the JavaScript SDK for server-side apps, workers, and API integrations.",
    description:
      "JavaScript SDK usage patterns for ingest and query.",
    sections: [
      {
        heading: "Client initialization",
        paragraphs: [
          "Initialize one client per process and reuse it. This keeps connection overhead low and centralizes retry and timeout policy.",
          "Prefer environment-variable configuration for endpoint URLs and API keys."
        ],
        codeBlocks: [
          {
            label: "Create client",
            language: "ts",
            code: `import { AletheiaClient } from "@aletheia/sdk";

const client = new AletheiaClient({
  baseUrl: process.env.ALETHEIA_URL!,
  apiKey: process.env.ALETHEIA_API_KEY!
});`
          }
        ]
      },
      {
        heading: "Ingest and query",
        codeBlocks: [
          {
            label: "Basic flow",
            language: "ts",
            code: `await client.ingest({
  entityId: "user-123",
  textualContent: "I switched to pour-over coffee last month."
});

const results = await client.querySemantic({
  entityId: "user-123",
  textualQuery: "What coffee style do I use now?",
  limit: 5
});`
          }
        ]
      },
      {
        heading: "Production patterns",
        bullets: [
          "Set request deadlines per endpoint class.",
          "Use circuit breakers for dependency outages.",
          "Attach request IDs for traceability.",
          "Implement idempotent ingest retries."
        ]
      }
    ]
  },
  {
    slug: "sdk-python",
    eyebrow: "SDK",
    title: "Python SDK",
    lead:
      "The Python SDK is suited for data pipelines, evaluation harnesses, and backend services.",
    description:
      "Python SDK usage patterns with async and batch calls.",
    sections: [
      {
        heading: "Client setup",
        codeBlocks: [
          {
            label: "Initialize client",
            language: "python",
            code: `from aletheia import AletheiaClient

client = AletheiaClient(
    base_url="http://127.0.0.1:3000",
    api_key="XXX1111AAA",
    timeout_s=10,
)`
          }
        ],
        paragraphs: [
          "Use one reusable client instance and avoid constructing clients inside hot loops."
        ]
      },
      {
        heading: "Batch ingest pattern",
        codeBlocks: [
          {
            label: "Batch ingestion",
            language: "python",
            code: `batch = [
    {"entity_id": "user-123", "textual_content": "I moved to LA."},
    {"entity_id": "user-123", "textual_content": "I now prefer tea."},
]

for item in batch:
    client.ingest(**item)`
          }
        ],
        paragraphs: [
          "For very large batches, parallelize by entity partition to reduce lock contention and preserve ordering semantics within each session."
        ]
      },
      {
        heading: "Evaluation usage",
        bullets: [
          "Keep deterministic seeds for benchmark comparability.",
          "Record model and policy versions in run metadata.",
          "Persist raw hit lists, not only aggregate metrics."
        ]
      }
    ]
  },
  {
    slug: "deployment",
    eyebrow: "Operations",
    title: "Deployment Guide",
    lead:
      "Production deployment should preserve durability first, then optimize for latency and throughput.",
    description:
      "Practical deployment recommendations for Aletheia in production.",
    sections: [
      {
        heading: "Deployment topology",
        paragraphs: [
          "A common topology runs Aletheia as a dedicated memory service behind an internal API gateway. Keep data directories on persistent volumes with regular backups.",
          "Avoid ephemeral disks for primary data unless you have robust replication and recovery strategy."
        ]
      },
      {
        heading: "Environment checklist",
        bullets: [
          "Persistent volume for redb and index data",
          "Model cache directory with predictable permissions",
          "Resource limits sized for reranking workloads",
          "Readiness and liveness probes",
          "Structured log export and metrics scraping"
        ]
      },
      {
        heading: "Container starter",
        codeBlocks: [
          {
            label: "Example run",
            language: "bash",
            code: `docker run --rm -p 3000:3000 \\
  -v /srv/aletheia-data:/data \\
  -e ALETHEIA_DATA_DIR=/data \\
  ghcr.io/aletheia/aletheia:latest`
          }
        ]
      }
    ]
  },
  {
    slug: "observability",
    eyebrow: "Operations",
    title: "Observability",
    lead:
      "Track recall quality and service health together; latency alone is not enough for memory systems.",
    description:
      "Metrics, logs, traces, and quality indicators for Aletheia.",
    sections: [
      {
        heading: "Metrics that matter",
        bullets: [
          "Ingest accepted/deduplicated/invalid counts",
          "Semantic query latency p50/p95/p99",
          "Lexical-only hit share vs hybrid share",
          "Superseded facts filtered per query",
          "Index reconciliation backlog"
        ],
        paragraphs: [
          "Quality metrics should be first-class dashboards, not hidden in offline scripts."
        ]
      },
      {
        heading: "Structured logging",
        codeBlocks: [
          {
            label: "Log fields",
            language: "json",
            code: `{
  "request_id": "req_7f1d",
  "route": "/query/semantic",
  "entity_id": "user-123",
  "semantic_candidates": 40,
  "lexical_candidates": 15,
  "latency_ms": 32
}`
          }
        ],
        paragraphs: [
          "Include enough retrieval internals in logs to debug ranking anomalies without sampling full payload text."
        ]
      },
      {
        heading: "Alerting",
        bullets: [
          "Sustained p95 latency breach",
          "Spike in invalid ingest payload ratio",
          "Sharp drop in recall@k against canary eval set",
          "Index mismatch detected by repair scanner"
        ]
      }
    ]
  },
  {
    slug: "benchmarking",
    eyebrow: "Evaluation",
    title: "Benchmarking and Evaluation",
    lead:
      "Benchmark memory quality with repeatable datasets, fixed configurations, and a clear split between preliminary signal and publishable scorecards.",
    description:
      "How to benchmark Aletheia retrieval quality and latency reliably.",
    sections: [
      {
        heading: "Current benchmark status",
        paragraphs: [
          "We have not yet published a full-blown benchmark campaign across all target tasks, models, and ablation settings. What we do have today are preliminary harness runs and archived evaluator outputs that already give a directional read on retrieval quality and runtime behavior.",
          "The purpose of this page is to show what is already instrumented, what the early LoCoMo recall run looks like, and what still needs to happen before we call the numbers final."
        ],
        callout: {
          tone: "warning",
          title: "Important",
          body:
            "Treat the results below as preliminary engineering signals, not a finalized benchmark report. Full LongMemEval publication-grade runs, ablations, and model-normalized comparisons are still in progress."
        },
        stats: [
          {
            label: "Benchmark Phase",
            value: "Preliminary",
            description: "Harness is live; full campaign is still pending.",
            tone: "warning"
          },
          {
            label: "Published Dataset Signal",
            value: "LoCoMo",
            description: "Current docs publish the cleanest retrieval summary from archived logs.",
            tone: "primary"
          },
          {
            label: "Archived Artifacts",
            value: "2 Logs",
            description: "`locomo_output.txt` and `longmemeval_output.txt` are retained in the repo.",
            tone: "default"
          },
          {
            label: "Next Milestone",
            value: "Full LongMemEval",
            description: "Run, validate, and publish the cleaned scorecard plus ablations.",
            tone: "success"
          }
        ]
      },
      {
        heading: "What is already in the repo",
        paragraphs: [
          "Two benchmark artifacts are currently tracked in the workspace and referenced internally when validating the evaluator pipeline.",
          "The LoCoMo artifact already contains a clean recall summary. The LongMemEval artifact is preserved as a working benchmark log, but we are intentionally not publishing a polished LongMemEval scorecard from it yet."
        ],
        artifacts: [
          {
            name: "locomo_output.txt",
            description:
              "Preliminary LoCoMo recall run log with full progress output, timing breakdowns, and the final Recall@8 summary.",
            meta: "Current best directional retrieval read for docs publication."
          },
          {
            name: "longmemeval_output.txt",
            description:
              "Archived preliminary benchmark output kept in the repo while the final LongMemEval evaluation flow is cleaned up and rerun end to end.",
            meta: "Tracked as a working artifact, not yet a publication-ready benchmark table."
          }
        ]
      },
      {
        heading: "Preliminary LoCoMo snapshot",
        paragraphs: [
          "The strongest concrete benchmark signal we are comfortable surfacing today comes from the LoCoMo recall harness. This run focuses on whether the correct evidence session appears in the retrieved Top-8, which is a useful proxy for whether the memory engine is bringing the right context back into scope before any downstream answer-generation layer gets involved.",
          "That distinction matters. We want to isolate memory retrieval quality first, then layer answer quality and judge-model evaluation on top. Otherwise, retrieval regressions and generation regressions get mixed together."
        ],
        stats: [
          {
            label: "Overall Recall@8",
            value: "94.7%",
            description: "Evidence session found in the Top-8 for 1538 evaluated questions.",
            tone: "primary"
          },
          {
            label: "Questions Evaluated",
            value: "1538",
            description: "No skipped questions in the archived run.",
            tone: "success"
          },
          {
            label: "Avg Query Time",
            value: "65 ms",
            description: "Average end-to-end query timing reported by the harness.",
            tone: "default"
          },
          {
            label: "Avg Total Time",
            value: "83 ms",
            description: "Includes ingest/query/pack timing reported per evaluation cycle.",
            tone: "default"
          },
          {
            label: "Avg Batch Ingest",
            value: "407 ms",
            description: "Average ingest batch time during the initial session indexing phase.",
            tone: "default"
          },
          {
            label: "Top-K Window",
            value: "8 Sessions",
            description: "Run used `top-k=8` and `max-chunks-per-session=4`.",
            tone: "default"
          }
        ],
        table: {
          columns: ["Single-Hop", "Multi-Hop", "Open Domain", "Temporal", "Overall"],
          rows: [
            {
              label: "Recall@8",
              values: ["90.8%", "80.4%", "97.9%", "93.8%", "94.7%"]
            },
            {
              label: "Question Count",
              values: ["282", "92", "841", "321", "1538"]
            }
          ],
          footnote:
            "This table is taken from the archived LoCoMo recall log and represents retrieval-stage evidence recovery, not a final answer-generation leaderboard."
        }
      },
      {
        heading: "How to read these numbers",
        paragraphs: [
          "The LoCoMo result is promising because it says the right session is usually being recovered even in a long-running conversation setting. The open-domain and temporal slices are especially strong in this early run, which suggests the hybrid lexical-plus-semantic stack is doing real work beyond naive vector search.",
          "The multi-hop slice is the current pressure point. That is not surprising: once the right evidence is split across multiple linked conversational fragments, raw retrieval has to do more than recover a single relevant session. This is exactly where graph lineage, fact companions, temporal linking, and deterministic aggregation become more important.",
          "The timing split is also useful. Average engine-stage totals show that embedding and hydrate costs dominate more than ANN search. That points optimization effort toward payload hydration, result packing, and indexing layout rather than only ANN micro-tuning."
        ],
        bullets: [
          "Average engine query stages in the archived run were roughly: embed 11 ms, ANN 2 ms, FTS 4 ms, hydrate 39 ms, total 64 ms.",
          "Reranking was disabled in this run, which means the current score reflects the base hybrid retrieval pipeline without cross-encoder rescue.",
          "Semantic dedup and consolidation were also disabled, so there is still headroom for future ablation work."
        ]
      },
      {
        heading: "Run configuration behind the preliminary LoCoMo result",
        paragraphs: [
          "The archived LoCoMo run used the Rust evaluator directly against the engine with an explicit retrieval-only configuration. That is useful because it minimizes ambiguity about where latency and quality are coming from.",
          "For benchmark reproducibility, keep the full invocation with the result artifact. Small flags such as rerank on/off, start index, chunk caps, or ingest concurrency can materially change both runtime and quality."
        ],
        codeBlocks: [
          {
            label: "Rust evaluator invocation",
            language: "bash",
            code: `cargo run --release --manifest-path benchmarks/rust_evaluator/Cargo.toml -- \\
  --dataset-kind locomo \\
  --dataset benchmarks/LoCoMo/data/locomo10.json \\
  --engine-url http://127.0.0.1:3000 \\
  --engine-api-key XXX1111AAA \\
  --reset-first \\
  --limit 99999 \\
  --ingest-concurrency 16 \\
  --top-k 8 \\
  --max-chunks-per-session 4 recall`
          },
          {
            label: "Archived run characteristics",
            language: "text",
            code: `dataset: LoCoMo
questions: 1538
top-k sessions: 8
max chunks per session: 4
neural rerank: false
semantic dedup: false
consolidation: false
reset first: true`
          },
          {
            label: "LongMemEval harness entry point",
            language: "bash",
            code: `cargo run --release --manifest-path benchmarks/rust_evaluator/Cargo.toml -- \\
  --dataset-kind longmemeval \\
  --dataset benchmarks/LongMemEval/data/longmemeval_s_cleaned.json \\
  --engine-url http://127.0.0.1:3000 \\
  --engine-api-key XXX1111AAA \\
  --reset-first \\
  --ingest-concurrency 1 \\
  --top-k 8 \\
  --max-chunks-per-session 4 recall`
          }
        ]
      },
      {
        heading: "What still needs to happen before we call benchmarking complete",
        paragraphs: [
          "A proper benchmark page for Aletheia should not stop at one preliminary retrieval run. We still need a full matrix across datasets, retrieval settings, optional reranking, answer-generation layers, and judge-model evaluation so the results are defensible outside the repo.",
          "In practice, that means LoCoMo is only the first published checkpoint. LongMemEval, ablations, and answer-quality scoring are the next layer."
        ],
        steps: [
          "Rerun LongMemEval end to end with the cleaned dataset and publish the final summary separately from working logs.",
          "Add retrieval ablations for rerank on/off, lexical-only, semantic-only, and hybrid fusion.",
          "Report answer-quality metrics alongside retrieval metrics so improvements can be tied to end-user outcome quality.",
          "Track warm versus cold runs, model versions, and hardware profile so latency claims remain reproducible.",
          "Keep failed examples and inspect them manually because aggregate percentages hide the most valuable failure modes."
        ]
      },
      {
        heading: "Benchmark principles we follow",
        bullets: [
          "Use fixed datasets and deterministic start indices whenever possible.",
          "Record model versions, engine config, and policy version with every run.",
          "Separate warm and cold measurements so cache effects do not blur real latency.",
          "Keep ingest and query concurrency explicit in the command line and in the published report.",
          "Publish both retrieval-stage metrics and downstream answer metrics instead of treating them as interchangeable.",
          "Retain raw artifacts so regressions can be audited, not just summarized."
        ]
      }
    ]
  },
  {
    slug: "troubleshooting",
    eyebrow: "Support",
    title: "Troubleshooting",
    lead:
      "Common production and local-development issues with practical fixes.",
    description:
      "Troubleshooting guide for ingest, query, index, and auth failures.",
    sections: [
      {
        heading: "Ingest succeeds but query misses facts",
        bullets: [
          "Verify entity scope is identical between ingest and query.",
          "Check fact was invalidated by newer superseding memory.",
          "Confirm memory kind filters are not excluding expected hits.",
          "Inspect dedup table for accidentally collapsed records."
        ]
      },
      {
        heading: "High latency spikes",
        bullets: [
          "Reduce rerank candidate count.",
          "Tune HNSW `ef_search` for your latency budget.",
          "Check for disk saturation on data volume.",
          "Warm model cache before traffic cutover."
        ]
      },
      {
        heading: "Quick diagnostic commands",
        codeBlocks: [
          {
            label: "Probe semantic endpoint",
            language: "bash",
            code: `curl -i --max-time 10 http://127.0.0.1:3000/query/semantic \\
  -H "content-type: application/json" \\
  -H "x-api-key: XXX1111AAA" \\
  -d '{"entity_id":"user-123","textual_query":"latest preference","limit":3}'`
          }
        ]
      }
    ]
  },
  {
    slug: "core",
    eyebrow: "Product",
    title: "Aletheia Core Engine",
    lead: "The Rust-powered temporal memory engine that runs anywhere. Self-host, embed, or integrate.",
    description: "Aletheia Core is the open-source, single-binary memory engine for AI agents. Hybrid vector + BM25 search, knowledge graphs, deterministic analytics, and fact supersession.",
    sections: [
      {
        heading: "What is Aletheia Core?",
        paragraphs: [
          "Aletheia Core is a standalone Rust binary that provides persistent, temporal, multi-model memory for AI agents. It is designed to run on any machine — from a developer laptop to a production server — without requiring a cloud account, a database cluster, or an internet connection.",
          "The engine combines four storage substrates under one roof: a vector index (HNSW via usearch), a full-text search index (BM25F on redb), a typed knowledge graph (RDF-style adjacency lists on redb), and a deterministic analytics vault for numeric metric extraction. All four are written into the same binary with zero external dependencies at runtime."
        ]
      },
      {
        heading: "How It Works",
        paragraphs: [
          "Think of Aletheia Core as a database purpose-built for agent memory. You send it observations (facts, conversations, events) via REST endpoints, and it indexes them across all four substrates simultaneously. When you query, it performs hybrid retrieval — fusing vector similarity scores with BM25F lexical scores using Reciprocal Rank Fusion — and returns temporally-ordered, fact-consistent results.",
          "The engine tracks time natively. Every memory carries a timestamp, and the retrieval pipeline uses temporal recency scoring to prefer recent memories while still surfacing relevant historical facts. Facts can be superseded (new truth replaces old truth), creating a continuously updated world model."
        ]
      },
      {
        heading: "What Runs Where",
        stats: [
          { label: "Binary size", value: "~45 MB", description: "Single statically-linked executable, no runtime deps.", tone: "primary" },
          { label: "Startup time", value: "< 1s", description: "Cold-start from scratch, all indexes in memory.", tone: "success" },
          { label: "Memory per 100K observations", value: "~800 MB", description: "Includes all index overhead. Configurable via retention.", tone: "default" },
          { label: "Query latency", value: "< 50ms p99", description: "Hybrid vector + lexical search with semantic rerank.", tone: "success" }
        ]
      },
      {
        heading: "Getting Started",
        steps: [
          "Download the binary from the GitHub releases page or build from source: cargo build --release.",
          "Set your API key: export ALETHEIA_API_KEY=your-secret-key.",
          "Choose an embedding model: export ALETHEIA_EMBEDDING_MODEL=BAAI/bge-small-en-v1.5.",
          "Run: ./aletheia. The engine starts on port 3000 by default.",
          "Ingest your first memory: POST /ingest with a JSON payload containing text, entity_id, and timestamp.",
          "Query: POST /query with a textual_query and limit. The engine returns ranked, temporally-scored results."
        ],
        codeBlocks: [
          {
            label: "Docker quick start",
            language: "bash",
            code: "docker run -p 3000:3000 \\\n  -e ALETHEIA_API_KEY=my-secret \\\n  -e ALETHEIA_EMBEDDING_MODEL=BAAI/bge-small-en-v1.5 \\\n  -v ./data:/data \\\n  ghcr.io/sharjeel619/aletheia:latest"
          },
          {
            label: "First ingest",
            language: "bash",
            code: "curl -X POST http://localhost:3000/ingest \\\n  -H \"Content-Type: application/json\" \\\n  -H \"x-api-key: my-secret\" \\\n  -d '{\n    \"entity_id\": \"user-1\",\n    \"memory_id\": \"mem-001\",\n    \"timestamp\": 1700000000000,\n    \"textual_content\": \"Alice enjoys hiking in the mountains on weekends.\",\n    \"kind\": \"Fact\"\n  }'"
          },
          {
            label: "First query",
            language: "bash",
            code: "curl -X POST http://localhost:3000/query \\\n  -H \"Content-Type: application/json\" \\\n  -H \"x-api-key: my-secret\" \\\n  -d '{\n    \"textual_query\": \"What does Alice enjoy?\",\n    \"limit\": 5\n  }'"
          }
        ]
      },
      {
        heading: "Deployment Models",
        bullets: [
          "Self-hosted binary: Download, run. No cloud, no lock-in. Works on macOS, Linux, Windows.",
          "Docker: Official container images with pre-baked models on GitHub Container Registry.",
          "Embedded library: Link Aletheia as a Rust crate in your own application (coming soon).",
          "Platform-managed: Deploy on the Aletheia Platform for one-click provisioning, billing, and team management."
        ]
      }
    ]
  },
  {
    slug: "platform",
    eyebrow: "Product",
    title: "Aletheia Platform",
    lead: "The managed SaaS layer on top of Aletheia Core. Deploy clusters, manage teams, track usage, and never touch infrastructure.",
    description: "The Aletheia Platform provides a full web console, Stripe billing, team management, graph visualization, and analytics on top of the core memory engine.",
    sections: [
      {
        heading: "What is the Platform?",
        paragraphs: [
          "The Aletheia Platform is a managed cloud service built on top of the open-source Aletheia Core engine. While the core engine runs anywhere as a standalone binary, the Platform wraps it with authentication, billing, team collaboration, and a rich web dashboard — so you can focus on building agents, not managing servers."
        ]
      },
      {
        heading: "Platform vs Core",
        stats: [
          { label: "Core Engine", value: "Self-hosted", description: "Download and run on your own hardware. Open source, Apache 2.0.", tone: "primary" },
          { label: "Platform", value: "Managed SaaS", description: "We run the engine for you. One-click deploy, automatic scaling.", tone: "success" },
          { label: "Core Auth", value: "API Key", description: "Single admin key. You manage access yourself.", tone: "default" },
          { label: "Platform Auth", value: "Full Stack", description: "Supabase Auth — login, teams, scoped API keys, RLS.", tone: "success" },
          { label: "Core Pricing", value: "Free", description: "Open source. No license fees.", tone: "primary" },
          { label: "Platform Pricing", value: "Pay-as-you-go", description: "$1/1M truths fractionally, $400/mo dedicated. Free tier available.", tone: "success" }
        ]
      },
      {
        heading: "What You Get",
        bullets: [
          "Mission Control dashboard: Real-time stats, cluster list, API key management in one screen.",
          "One-click cluster deploy: Choose a tier (Fractional or Dedicated Pro), name your cluster, and deploy instantly.",
          "Stripe billing: Pay-as-you-go or flat-rate. Manage payment methods, view invoices, upgrade/downgrade.",
          "Team management: Invite colleagues, assign roles (owner/admin/member), collaborate on shared clusters.",
          "Knowledge Graph Explorer: Search entities, walk graph neighborhoods, discover shared connections between subjects.",
          "Analytics dashboard: Daily usage charts, query/ingest breakdowns, storage trends.",
          "API Playground: Interactive request builder with code snippets for Python, cURL, and Node.js."
        ]
      },
      {
        heading: "Getting Started on the Platform",
        steps: [
          "Create an account at aletheiadb.com/signup. Your first cluster (Fractional tier) is provisioned automatically.",
          "Copy your API key from Mission Control → API Keys. This key authenticates all requests to the platform.",
          "Use the API Playground in your cluster's detail page to test ingest and query operations.",
          "Invite team members from Settings → Team. They can access shared clusters based on their role.",
          "Monitor usage from Analytics or the Billing page. Usage is tracked daily and available via the API.",
          "Upgrade to Dedicated Pro for guaranteed performance, higher limits, and priority support."
        ]
      }
    ]
  },
  {
    slug: "glossary",
    eyebrow: "Reference",
    title: "Glossary",
    lead:
      "A quick reference for recurring Aletheia terms in docs, APIs, and benchmarking.",
    description:
      "Glossary of Aletheia and retrieval terminology.",
    sections: [
      {
        heading: "Core terms",
        bullets: [
          "AgentObservation: primary stored memory record.",
          "Companion memory: derived fact or summary linked to source turn.",
          "Supersession: invalidating old fact with newer fact.",
          "RRF: reciprocal rank fusion for combining retrieval lists.",
          "TTL: hard expiry threshold for memory eligibility."
        ]
      },
      {
        heading: "Retrieval terms",
        bullets: [
          "Bi-encoder: independent query/document embeddings.",
          "Cross-encoder: joint query+document relevance model.",
          "HNSW: approximate nearest-neighbor graph index.",
          "BM25: probabilistic lexical scoring method."
        ]
      },
      {
        heading: "Operational terms",
        bullets: [
          "Reconciliation: repairing secondary indexes from durable store.",
          "Canary eval: small fixed test set for release health checks.",
          "Entity scope: ownership boundary used to isolate memory retrieval."
        ]
      }
    ]
  }
];

export const detailedDocsBySlug: Record<string, DocsPage> =
  Object.fromEntries(detailedDocsPages.map((page) => [page.slug, page]));
