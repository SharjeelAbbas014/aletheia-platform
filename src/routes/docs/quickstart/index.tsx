import { component$ } from "@builder.io/qwik";

import { createHead } from "~/lib/docs";

export default component$(() => {
  return (
    <>
      <div class="eyebrow">Quickstart</div>
      <h1>Quickstart</h1>
      <p class="doc-lead">
        Launch the engine, connect from the SDK, and run your first query.
      </p>

      <h2>This repo is organized around three surfaces</h2>
      <ol>
        <li>Marketing on <code>/</code></li>
        <li>Docs on <code>/docs</code></li>
        <li>Platform UI on <code>/platform</code></li>
      </ol>

      <h2>Local-first path</h2>
      <pre class="docs-code">
        <code>{`cargo build --release`}</code>
      </pre>

      <p>Point the SDK at the local binary:</p>

      <pre class="docs-code">
        <code>{`from aletheia import AletheiaClient

client = AletheiaClient.from_local(auto_start=True)
client.ingest(entity_id="user-123", text="I prefer pourover coffee.")
hits = client.query("What coffee do I prefer?", entity_id="user-123")`}</code>
      </pre>

      <h2>Cloud path</h2>
      <p>Create an API key in the platform dashboard, then switch constructors:</p>

      <pre class="docs-code">
        <code>{`client = AletheiaClient.from_cloud(
    "http://143.110.246.15:3000",
    api_key="XXX1111AAA",
)`}</code>
      </pre>

      <p>
        The goal is to keep the developer surface stable while the runtime mode
        changes.
      </p>
    </>
  );
});

export const head = createHead(
  "Quickstart | Aletheia",
  "Launch the engine, connect from the SDK, and run your first query.",
  "/docs/quickstart"
);
