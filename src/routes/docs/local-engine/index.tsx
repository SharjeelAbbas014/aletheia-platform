import { component$ } from "@builder.io/qwik";

import { createHead } from "~/lib/docs";

export default component$(() => {
  return (
    <>
      <div class="eyebrow">Local Engine</div>
      <h1>Local Engine</h1>
      <p class="doc-lead">
        The local engine exists so teams can evaluate retrieval quality,
        iterate on memory schemas, and test agent flows without immediately
        standing up hosted infrastructure.
      </p>

      <h2>What local mode is good for</h2>
      <ul>
        <li>Laptop development</li>
        <li>Integration tests</li>
        <li>Benchmark runs</li>
        <li>SDK onboarding</li>
      </ul>

      <h2>Recommended behavior</h2>
      <ul>
        <li>Bind the engine to loopback.</li>
        <li>Store data in a cache directory dedicated to local development.</li>
        <li>Reuse the same HTTP API surface as the cloud deployment where practical.</li>
      </ul>

      <h2>Binary resolution</h2>
      <ol>
        <li>Explicit binary path</li>
        <li>Environment variable override</li>
        <li>Repo-local <code>target/release/aletheia</code></li>
        <li>Cached binary in the local SDK cache</li>
        <li>Manifest-driven download</li>
      </ol>
    </>
  );
});

export const head = createHead(
  "Local Engine | Aletheia",
  "Run the Rust binary as a sidecar for development and evaluation.",
  "/docs/local-engine"
);
