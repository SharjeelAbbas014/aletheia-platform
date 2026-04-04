import { component$ } from "@builder.io/qwik";

import { createHead } from "~/lib/docs";

export default component$(() => {
  return (
    <>
      <div class="eyebrow">Security Model</div>
      <h1>Security Model</h1>
      <p class="doc-lead">
        Aletheia is strongest when auth and retrieval scope are treated as
        first-class system boundaries.
      </p>

      <h2>Hosted platform guidance</h2>
      <ul>
        <li>Never trust payload scope alone.</li>
        <li>Apply tenant and project claims before retrieval.</li>
        <li>Keep audit logs for ingest, query, and delete.</li>
        <li>Expose request IDs for traceability.</li>
      </ul>

      <h2>Release guidance</h2>
      <ul>
        <li>Publish checksums for downloadable binaries.</li>
        <li>Prefer signatures for release artifacts.</li>
        <li>Keep the OpenAPI contract versioned alongside engine releases.</li>
      </ul>

      <h2>Product guidance</h2>
      <p>The platform repo is where your public trust story should live:</p>
      <ul>
        <li>docs</li>
        <li>changelog</li>
        <li>sign-up and login</li>
        <li>API key management</li>
        <li>status and release notes later</li>
      </ul>
    </>
  );
});

export const head = createHead(
  "Security Model | Aletheia",
  "How to think about hosted access, tenant scope, and auditability.",
  "/docs/security"
);
