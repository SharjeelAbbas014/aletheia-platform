import type { DocumentHead } from "@builder.io/qwik-city";
import { commonHeadLinks, commonHeadScripts } from "~/constants/theme";

export interface DocsNavItem {
  href: string;
  title: string;
  description?: string;
  icon?: string;
}

export interface DocsCategory {
  category: string;
  items: DocsNavItem[];
}

export const docsNavigation: DocsCategory[] = [
  {
    category: "Fundamentals",
    items: [
      {
        href: "/docs",
        title: "Overview",
        description: "What Aletheia is for and why the engine behaves differently.",
        icon: "rocket_launch"
      },
      {
        href: "/docs/quickstart",
        title: "Quickstart",
        description: "Launch the engine, connect from the SDK, and run your first query.",
        icon: "bolt"
      },
      {
        href: "/docs/api-auth",
        title: "API Reference",
        description: "Platform-issued keys and a clear path to scoped auth.",
        icon: "api"
      }
    ]
  },
  {
    category: "Architecture",
    items: [
      {
        href: "/docs/local-engine",
        title: "Local Engine",
        description: "Run the Rust binary as a sidecar for development.",
        icon: "memory"
      },
      {
        href: "/docs/security",
        title: "Security Model",
        description: "How to think about hosted access and tenant scope.",
        icon: "verified_user"
      }
    ]
  }
];

export function createHead(title: string, description: string): DocumentHead {
  return {
    title,
    meta: [
      {
        name: "description",
        content: description
      }
    ],
    links: commonHeadLinks,
    scripts: commonHeadScripts
  };
}
