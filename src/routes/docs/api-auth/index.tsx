import { component$ } from "@builder.io/qwik";

import { createHead } from "~/lib/docs";

export default component$(() => {
  return (
    <>
      <div class="eyebrow">API Authentication</div>
      <h1>API Authentication</h1>
      <p class="doc-lead">
        Hosted usage should be authenticated with API keys and server-side scope
        enforcement.
      </p>

      <p>
        For testing, the engine and SDKs default to a shared key:
        <code> XXX1111AAA</code>.
      </p>

      <h2>Key expectations</h2>
      <ul>
        <li>Keys identify the calling application or workspace.</li>
        <li>Tenant or project scope is enforced server-side.</li>
        <li>Audit logs attach request IDs and actor context.</li>
        <li>Rate limits are applied per tenant or per key.</li>
      </ul>

      <h2>Example</h2>
      <pre class="docs-code">
        <code>{`curl http://143.110.246.15:3000/query/semantic \\
  -H "x-api-key: XXX1111AAA" \\
  -H "content-type: application/json" \\
  -d '{"textual_query":"what changed?","entity_id":"user-123","limit":5}'`}</code>
      </pre>

      <h2>Platform workflow</h2>
      <p>The platform UI in this repo includes a demo flow for:</p>
      <ul>
        <li>logging in</li>
        <li>creating a key</li>
        <li>viewing the full token</li>
        <li>revoking a key</li>
      </ul>

      <p>
        Swap the cookie-backed demo store for your production database when you
        wire in real auth.
      </p>
    </>
  );
});

export const head = createHead(
  "API Authentication | Aletheia",
  "Platform-issued keys for hosted usage, with a clear path to scoped auth."
);
