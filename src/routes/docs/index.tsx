import { component$ } from "@builder.io/qwik";

import { privateRepositoryNote, publicRepositoryLinks } from "~/constants/repositories";
import { createHead } from "~/lib/docs";

export default component$(() => {
  return (
    <>
      <div class="eyebrow">Overview</div>
      <h1>Aletheia Overview</h1>
      <p class="doc-lead">
        Aletheia is memory infrastructure for agents and applications that need
        more than a flat vector index.
      </p>

      <h2>What it is built to do</h2>
      <ul>
        <li>Fuse semantic search with lexical search and reranking.</li>
        <li>Keep fresh context visible through time-aware ranking.</li>
        <li>Track fact supersession so stale claims stop competing with updated truth.</li>
        <li>Support the same developer workflow locally and in the cloud.</li>
        <li>Expose an API surface that can power SDKs, benchmarks, and production apps.</li>
      </ul>

      <h2>Why teams reach for it</h2>
      <p>
        Most memory systems can retrieve. Fewer can update beliefs cleanly,
        handle mixed fact and episodic recall, or ship a local-first workflow
        that is still production-shaped.
      </p>
      <p>Aletheia is designed for that gap.</p>

      <h2>Core principles</h2>

      <h3>Hybrid retrieval</h3>
      <p>
        ANN alone is not enough. Aletheia combines semantic search, BM25-style
        lexical search, and reranking so exact phrases and latent meaning both
        matter.
      </p>

      <h3>Memory classes</h3>
      <p>
        Not every memory should decay or rank the same way. Facts, summaries,
        preferences, and episodic traces can behave differently.
      </p>

      <h3>Local-first development</h3>
      <p>
        Developers should be able to run the same engine locally as a sidecar
        before they point the SDK at a hosted environment.
      </p>

      <h3>Operational readiness</h3>
      <p>
        Signed binaries, scoped auth, release manifests, and
        compatibility-aware SDKs are treated as part of the product surface.
      </p>

      <h2>Repositories</h2>
      <p>Public repositories for platform, SDK, and model adapter surfaces:</p>
      <ul>
        {publicRepositoryLinks.map((repo) => (
          <li key={repo.href}>
            <a href={repo.href} target="_blank" rel="noreferrer">
              {repo.label}
            </a>
          </li>
        ))}
      </ul>
      <p>{privateRepositoryNote}</p>
    </>
  );
});

export const head = createHead(
  "Overview | Aletheia",
  "What Aletheia is for and why the engine behaves differently from a naive vector store.",
  "/docs"
);
