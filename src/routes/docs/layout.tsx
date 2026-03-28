import { Slot, component$ } from "@builder.io/qwik";
import { Link, useLocation } from "@builder.io/qwik-city";

import { docsNavigation } from "~/lib/docs";

export default component$(() => {
  const location = useLocation();

  return (
    <main class="page-pad">
      <section class="shell docs-grid">
        <aside class="docs-sidebar">
          <div class="metric-label">Docs</div>
          <nav class="docs-nav" aria-label="Documentation">
            {docsNavigation.map((item) => {
              const active = location.url.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  class={active ? "docs-link docs-link-active" : "docs-link"}
                >
                  <span>{item.title}</span>
                  <small>{item.description}</small>
                </Link>
              );
            })}
          </nav>
        </aside>

        <article class="docs-article">
          <Slot />
        </article>
      </section>
    </main>
  );
});
