import type { DocumentHead } from "@builder.io/qwik-city";

export const docsNavigation = [
  {
    href: "/docs",
    title: "Overview",
    description:
      "What Aletheia is for and why the engine behaves differently from a naive vector store."
  },
  {
    href: "/docs/quickstart",
    title: "Quickstart",
    description: "Launch the engine, connect from the SDK, and run your first query."
  },
  {
    href: "/docs/api-auth",
    title: "API Authentication",
    description: "Platform-issued keys for hosted usage, with a clear path to scoped auth."
  },
  {
    href: "/docs/local-engine",
    title: "Local Engine",
    description: "Run the Rust binary as a sidecar for development and evaluation."
  },
  {
    href: "/docs/security",
    title: "Security Model",
    description: "How to think about hosted access, tenant scope, and auditability."
  }
] as const;

export function createHead(title: string, description: string): DocumentHead {
  return {
    title,
    meta: [
      {
        name: "description",
        content: description
      }
    ]
  };
}
