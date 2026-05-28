---
title: "Self-Hosting AI Memory with Rust: A Step-by-Step Guide"
description: "Run your own AI memory engine on your infrastructure. One Rust binary, zero dependencies, full control over user data."
excerpt: "Self-hosting your AI memory engine gives you full control over user data, zero vendor lock-in, and predictable costs. This guide walks through building and deploying a Rust memory engine from source."
publishedAt: 2026-05-28T00:00:00.000Z
updatedAt: 2026-05-28T00:00:00.000Z
author: "Sharjeel"
tags:
  - Self-Hosting
  - Rust
  - AI Memory
  - Open Source
  - Docker
  - Privacy
image: /screen.png
featured: false
---

When you build an AI agent that remembers user preferences, conversation history, and learned facts, you are building something with real privacy implications. Every memory stored is personal data — the kind of data that users trust you with, that regulations like GDPR govern, and that a data breach turns into headlines.

Most teams reach for hosted memory services by default. A managed vector database, a cloud API, a third-party abstraction layer. It works. But it also means your users' memories live on someone else's server, billed per request, subject to their uptime and their policies.

Self-hosting your AI memory engine is not a nostalgic return to running servers in a closet. It is a deliberate architectural decision: you keep full control over user data, you pay predictable costs regardless of scale, and you eliminate vendor lock-in at the infrastructure layer. This guide walks through building and deploying a Rust memory engine from source — the binary is called AletheiaDB — and connecting it to your Python-based AI agent.

## Why Self-Host Your AI Memory

### Privacy and Data Sovereignty

AI memory systems store sensitive information: user names, preferences, medical notes, financial details, personal opinions. When this data lives on a third-party service, you are trusting their security practices, their compliance certifications, and their incident response. Self-hosting puts that data on hardware you control, under policies you define.

For teams building in regulated industries — healthcare, finance, education — this is not optional. Compliance frameworks often require that you know exactly where personal data lives and who can access it. A self-hosted memory engine behind your firewall gives you that visibility.

### Cost Predictability

Hosted memory services charge per request, per GB stored, and per embedding generated. For a small project with a few hundred users, this is negligible. For a production system handling millions of memory operations, costs become unpredictable. A self-hosted Rust binary running on your own infrastructure has a flat cost — the server you already pay for. No per-request fees, no surprise bills when usage spikes.

### No Vendor Lock-in

When your memory layer is a managed service, migrating means rewriting ingestion pipelines, reformatting stored data, and rebuilding retrieval logic. When your memory layer is a single binary you compiled from source, migrating means copying a SQLite file and updating a connection string. The difference matters when you need to move between cloud providers, consolidate infrastructure, or simply negotiate better terms.

### Full Control Over the Stack

Self-hosting means you can modify behavior at every level. Need a custom ranking function for retrieval? Fork and compile. Want to change the chunking strategy for conversations? Edit the source. Need to add a new API endpoint for your specific use case? Build it. You are not limited by what a managed service exposes through its API.

## Prerequisites

Before building the memory engine, make sure you have the following installed.

**Rust toolchain** — The engine is written in Rust. Install it with [rustup](https://rustup.rs/):

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

After installation, verify:

```bash
rustc --version
# rustc 1.78.0 (9b00956e5 2024-04-29)

cargo --version
# cargo 1.78.0 (54d8815d0 2024-03-26)
```

**Python 3.10+** — The Python SDK requires 3.10 or later:

```bash
python3 --version
# Python 3.11.7
```

**Docker** (optional) — For containerized deployment:

```bash
docker --version
# Docker version 25.0.3, build 4debf41

docker compose version
# Docker Compose version v2.24.5
```

**SQLite** — The engine uses [SQLite](https://www.sqlite.org/) for persistent storage. No separate database server is required — SQLite is embedded directly into the binary.

That is the full list. No database server to install, no background services to manage, no configuration files to write before the first run.

## Building the Engine from Source

The memory engine compiles to a single binary. Here is the complete build process.

Clone the repository and enter the project directory:

```bash
git clone https://github.com/aletheia-platform/AletheiaDB.git
cd AletheiaDB
```

Build in release mode for production use. The default debug build works for testing but runs significantly slower:

```bash
cargo build --release
```

On a modern laptop (Apple M2, 16GB RAM), this completes in about 45 seconds. The first build takes longer because it compiles all dependencies from source. Subsequent builds only recompile changed files, usually finishing in under 5 seconds.

You will see compiler warnings during the build. These are expected — the project uses some nightly features and allows warnings for certain experimental modules. Focus on whether the build succeeds (exit code 0), not on the warnings.

After the build completes, the binary is at `target/release/aletheia`:

```bash
ls -lh target/release/aletheia
# -rwxr-xr-x  1 sharjeel  staff  12M May 28 00:00 target/release/aletheia
```

The binary is approximately 12MB. It includes the full memory engine, embedding support, and the HTTP server. No runtime dependencies — copy this single file to any Linux or macOS system and it runs.

## Running Locally

Start the engine with default settings:

```bash
./target/release/aletheia
```

The output shows the server initializing and binding to a port:

```
[2026-05-28T00:00:01Z INFO  aletheia] AletheiaDB v0.14.2 starting
[2026-05-28T00:00:01Z INFO  aletheia] Loading database from ./data/aletheia.db
[2026-05-28T00:00:01Z INFO  aletheia] Database initialized (3 tables, 0 rows)
[2026-05-28T00:00:01Z INFO  aletheia] Embedding model loaded (ONNX, 22MB)
[2026-05-28T00:00:01Z INFO  aletheia] HTTP server listening on 127.0.0.1:8420
[2026-05-28T00:00:01Z INFO  aletheia] Ready for connections
```

The engine stores data in `./data/aletheia.db` by default. The first time you run it, this directory and database file are created automatically. On subsequent runs, existing data is loaded and preserved.

Verify the server is running with a health check:

```bash
curl http://127.0.0.1:8420/health
# {"status":"ok","version":"0.14.2"}
```

To stop the engine, press `Ctrl+C`. The server shuts down gracefully, flushing any pending writes to disk.

### Custom Configuration

You can override defaults with command-line flags:

```bash
./target/release/aletheia \
  --host 0.0.0.0 \
  --port 9000 \
  --data-dir /var/lib/aletheia \
  --embedding-model ./models/all-MiniLM-L6-v2.onnx
```

| Flag | Default | Description |
|------|---------|-------------|
| `--host` | `127.0.0.1` | Bind address |
| `--port` | `8420` | Listen port |
| `--data-dir` | `./data` | Directory for SQLite database |
| `--embedding-model` | Built-in | Path to ONNX embedding model |

For persistent configuration, create a `aletheia.toml` file in the working directory:

```toml
[server]
host = "127.0.0.1"
port = 8420

[storage]
data_dir = "./data"
wal_mode = true

[embedding]
model = "all-MiniLM-L6-v2"
dimensions = 384
batch_size = 64

[retrieval]
max_results = 10
min_score = 0.35
```

The engine reads `aletheia.toml` automatically if it exists in the current directory.

## Connecting with the Python SDK

The Python SDK wraps the HTTP API. Install it with pip:

```bash
pip install aletheia
```

Initialize the client:

```python
from aletheia import AletheiaDBClient

client = AletheiaDBClient(
    host="127.0.0.1",
    port=8420,
)

# Verify the connection
info = client.server_info()
print(f"Connected to the memory engine, version {info.version}")
# Connected to the memory engine, version 0.14.2
```

The client communicates over HTTP. If your engine is on a different host or port, update the `host` and `port` parameters. For remote connections, the SDK handles reconnection automatically.

For agents that need async support, use the async client:

```python
import asyncio
from aletheia import AsyncAletheiaDBClient

async def main():
    client = AsyncAletheiaDBClient(host="127.0.0.1", port=8420)
    info = await client.server_info()
    print(f"Connected: {info.version}")
    await client.close()

asyncio.run(main())
```

The async client is built on `aiohttp` and works with `asyncio`-based agent frameworks like LangChain and AutoGen.

## Storing and Querying Memories

The core operations are store, search, and delete. Here is how each works.

### Storing a Memory

A memory consists of content, a namespace (to separate users or contexts), and optional metadata:

```python
from aletheia import AletheiaDBClient

client = AletheiaDBClient(host="127.0.0.1", port=8420)

# Store a memory for a specific user
memory = client.store(
    content="User prefers dark mode and uses a screen reader",
    namespace="user:sarah",
    metadata={
        "source": "conversation",
        "session_id": "sess_abc123",
        "timestamp": "2026-05-28T10:30:00Z",
    },
)

print(f"Stored memory: {memory.id}")
# Stored memory: mem_7f3a2b1c

# Store another memory
client.store(
    content="User works at Acme Corp as a software engineer",
    namespace="user:sarah",
    metadata={"source": "conversation"},
)
```

Namespaces let you isolate memories by user, team, or project. When you search, you can scope queries to a specific namespace or search across all of them.

### Querying Memories

Search retrieves the most relevant memories for a given query. The engine uses vector similarity with built-in embedding:

```python
results = client.search(
    query="What are the user's accessibility preferences?",
    namespace="user:sarah",
    limit=5,
)

for memory in results:
    print(f"[{memory.score:.3f}] {memory.content}")
    # [0.912] User prefers dark mode and uses a screen reader
    # [0.421] User works at Acme Corp as a software engineer
```

The `score` field is a similarity score between 0 and 1. Higher means more relevant. The engine returns results sorted by score, so the first result is always the most relevant match.

For more advanced queries, use metadata filters:

```python
# Search only memories from a specific session
results = client.search(
    query="What did we discuss?",
    namespace="user:sarah",
    metadata_filter={"session_id": "sess_abc123"},
    limit=5,
)
```

### Updating and Deleting Memories

Update a memory's content when new information supersedes old:

```python
client.update(
    memory_id="mem_7f3a2b1c",
    content="User prefers light mode and uses a screen reader",
    metadata={"source": "correction", "updated_at": "2026-05-28T11:00:00Z"},
)
```

Delete memories when they are no longer needed:

```python
client.delete(memory_id="mem_7f3a2b1c")

# Delete all memories in a namespace
client.delete_namespace(namespace="user:sarah")
```

### Integrating with an Agent Loop

In a typical agent setup, you store memories after each interaction and retrieve relevant context before each response:

```python
from aletheia import AletheiaDBClient

client = AletheiaDBClient(host="127.0.0.1", port=8420)

def agent_respond(user_id: str, user_message: str) -> str:
    # 1. Retrieve relevant memories
    memories = client.search(
        query=user_message,
        namespace=f"user:{user_id}",
        limit=5,
    )
    context = "\n".join(f"- {m.content}" for m in memories)

    # 2. Build the prompt with memory context
    system_prompt = f"""You are a helpful assistant.
    
Relevant user context:
{context}
"""
    # 3. Call your LLM with the context
    # response = call_llm(system_prompt, user_message)

    # 4. Store the interaction as a new memory
    client.store(
        content=user_message,
        namespace=f"user:{user_id}",
        metadata={"source": "user_message"},
    )

    return "response from your LLM"
```

This pattern gives your agent persistent memory across sessions without modifying the LLM itself. The memory engine handles storage, retrieval, and relevance ranking.

## Docker Deployment

For environments where you prefer containerized deployment, here is a Dockerfile and docker-compose configuration.

### Dockerfile

```dockerfile
FROM rust:1.78-slim as builder

WORKDIR /app
COPY . .
RUN cargo build --release

FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/target/release/aletheia /usr/local/bin/

RUN useradd -r -s /bin/false aletheia
USER aletheia

EXPOSE 8420

VOLUME ["/data"]

CMD ["aletheia", "--data-dir", "/data"]
```

Build the image:

```bash
docker build -t aletheia:latest .
```

### Docker Compose

For a production-ready setup with persistent storage:

```yaml
services:
  aletheia:
    image: aletheia:latest
    container_name: aletheia
    restart: unless-stopped
    ports:
      - "127.0.0.1:8420:8420"
    volumes:
      - aletheia-data:/data
    environment:
      - RUST_LOG=info
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8420/health"]
      interval: 30s
      timeout: 5s
      retries: 3

volumes:
  aletheia-data:
    driver: local
```

Start the service:

```bash
docker compose up -d
```

Check the logs:

```bash
docker compose logs -f
# aletheia  | [2026-05-28T00:00:01Z INFO  aletheia] AletheiaDB v0.14.2 starting
# aletheia  | [2026-05-28T00:00:01Z INFO  aletheia] HTTP server listening on 127.0.0.1:8420
# aletheia  | [2026-05-28T00:00:01Z INFO  aletheia] Ready for connections
```

The `ports` binding uses `127.0.0.1:8420:8420` so the engine is only accessible from the local machine. For remote access, change this to `8420:8420` and add TLS in front (covered in the next section).

### Connecting from Python to Docker

No changes needed. The Python SDK connects to the same host and port:

```python
from aletheia import AletheiaDBClient

# Works identically whether the engine runs locally or in Docker
client = AletheiaDBClient(host="127.0.0.1", port=8420)
```

## Production Hardening

Running the engine on your laptop is fine for development. For production, you need to add a few layers.

### Backups

SQLite supports online backups. The simplest approach is to copy the database file while the engine is running (SQLite's WAL mode ensures consistency):

```bash
# Stop the engine, copy, restart — safest for critical backups
docker compose stop aletheia
cp /var/lib/aletheia/aletheia.db /backups/aletheia-$(date +%Y%m%d).db
docker compose start aletheia
```

For zero-downtime backups, use SQLite's backup API or a filesystem snapshot:

```bash
# LVM snapshot example (Linux)
lvcreate --size 1G --snapshot --name aletheia-snap /dev/vg0/aletheia-data
mount /dev/vg0/aletheia-snap /mnt/snapshot
cp /mnt/snapshot/aletheia.db /backups/
umount /mnt/snapshot
lvremove /dev/vg0/aletheia-snap
```

Automate this with a cron job or a systemd timer. Keep at least 7 daily backups and 4 weekly backups.

### Monitoring

The engine exposes a `/metrics` endpoint in Prometheus format:

```bash
curl http://127.0.0.1:8420/metrics
# aletheia_store_total 14523
# aletheia_search_total 8901
# aletheia_search_latency_ms_bucket{le="1"} 7200
# aletheia_search_latency_ms_bucket{le="5"} 8800
# aletheia_search_latency_ms_bucket{le="10"} 8900
# aletheia_memory_count 3421
# aletheia_db_size_bytes 52428800
```

Add this to your Prometheus scrape config and set up alerts for:

- **High latency** — search latency p99 above 50ms indicates the database needs indexing
- **Disk usage** — database file growing beyond expected size
- **Error rate** — failed store or search operations

### TLS Termination

The engine listens on plain HTTP. Put a reverse proxy in front for TLS:

```nginx
# /etc/nginx/sites-available/aletheia
server {
    listen 443 ssl http2;
    server_name memory.example.com;

    ssl_certificate /etc/letsencrypt/live/memory.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/memory.example.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8420;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

For Docker environments, use Caddy or Traefik for automatic TLS:

```yaml
services:
  caddy:
    image: caddy:2
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy-data:/data

  aletheia:
    image: aletheia:latest
    expose:
      - "8420"

volumes:
  caddy-data:
```

```caddyfile
memory.example.com {
    reverse_proxy aletheia:8420
}
```

### Firewall Rules

Restrict access to the engine. Even with TLS, you should limit who can connect:

```bash
# Allow only your application servers
ufw allow from 10.0.1.0/24 to any port 8420
ufw deny 8420
```

## Self-Hosted vs. Cloud: A Comparison

| Factor | Self-Hosted Memory Engine | Cloud Memory Service |
|--------|------------------------|---------------------|
| **Data location** | Your servers, your jurisdiction | Third-party data centers |
| **Cost model** | Fixed (server + bandwidth) | Per-request, per-GB |
| **Latency** | Sub-millisecond (local) | 50-200ms (network) |
| **Scaling** | Manual (vertical + horizontal) | Automatic |
| **Maintenance** | You handle updates, backups | Managed by provider |
| **Customization** | Full source access | Limited to API |
| **Vendor lock-in** | None | High |
| **Compliance** | You control certifications | Provider's certifications |
| **High availability** | You build it (replication, failover) | Built-in SLA |
| **Time to first deployment** | ~10 minutes (build + run) | ~5 minutes (sign up + API key) |

The right choice depends on your priorities. If you need to ship in an afternoon and do not mind trusting a third party, cloud is faster. If you need control over data, predictable costs, and the ability to customize behavior, self-hosting is the better long-term investment.

Many teams start with self-hosting for development and testing, then deploy the same binary to production. The engine runs identically in both environments, so there is no code change when you move from your laptop to a server.

## Conclusion

Self-hosting your AI memory engine is a practical decision, not a philosophical one. You get full control over user data, predictable costs, and the ability to customize every layer of the stack. The tradeoff is that you are responsible for operations — backups, monitoring, scaling. But with a single binary that embeds its own database, the operational surface is small.

This guide covered the complete path from building the engine to deploying it in production. You started with a Rust binary, ran it locally, connected it with Python, stored and queried memories, containerized it with Docker, and hardened it for production use. Every step used the same engine with the same API.

The memory engine you built today scales horizontally — run multiple instances behind a load balancer, each with its own SQLite database, and route users to specific instances by namespace. Or run a single instance on a Raspberry Pi for a personal AI assistant that lives in your home network.

For more details, check the [documentation](https://github.com/aletheia-platform/AletheiaDB) and the [Python SDK reference](https://pypi.org/project/aletheia/). The source code is open — read it, modify it, contribute back.
