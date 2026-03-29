import { Slot, component$ } from "@builder.io/qwik";
import { Link, useLocation } from "@builder.io/qwik-city";

import { docsNavigation } from "~/lib/docs";

export default component$(() => {
  const location = useLocation();
  const rawPath = location.url.pathname;
  const pathname =
    rawPath.length > 1 && rawPath.endsWith("/")
      ? rawPath.slice(0, -1)
      : rawPath;

  const allItems = docsNavigation.flatMap((category) =>
    category.items.map((item) => ({ ...item, category: category.category }))
  );

  const activeItem = allItems.find((item) => item.href === pathname);
  const activeCategory =
    docsNavigation.find((category) => category.category === activeItem?.category) ??
    docsNavigation[0];

  return (
    <div class="docs-shell">
      <aside class="docs-shell-left">
        <div class="docs-shell-left-inner">
          <div class="docs-brand">
            <div class="docs-brand-icon">
              <span class="material-symbols-outlined">terminal</span>
            </div>
            <div>
              <p class="docs-brand-title">Docs</p>
              <p class="docs-brand-subtitle">Temporal Memory Guide</p>
            </div>
          </div>

          <nav class="docs-nav-groups" aria-label="Documentation navigation">
            {docsNavigation.map((category) => (
              <section key={category.category}>
                <h3 class="docs-nav-heading">{category.category}</h3>
                <div class="docs-nav-items">
                  {category.items.map((item) => {
                    const isActive = item.href === pathname;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        class={`docs-nav-link ${isActive ? "docs-nav-link-active" : ""}`}
                      >
                        <span class="material-symbols-outlined docs-nav-icon">
                          {item.icon}
                        </span>
                        <span class="docs-nav-text-wrap">
                          <span class="docs-nav-text-title">{item.title}</span>
                          {item.description ? (
                            <span class="docs-nav-text-description">{item.description}</span>
                          ) : null}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}
          </nav>
        </div>
      </aside>

      <main class="docs-shell-main">
        <div class="docs-main-gradient" aria-hidden="true" />
        <article class="docs-article docs-prose">
          <Slot />
        </article>
      </main>

      <aside class="docs-shell-right">
        <div class="docs-shell-right-inner">
          <h3 class="docs-right-heading">In This Section</h3>
          <div class="docs-right-links">
            {activeCategory.items.map((item) => {
              const isActive = item.href === pathname;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  class={`docs-right-link ${isActive ? "docs-right-link-active" : ""}`}
                >
                  {item.title}
                </Link>
              );
            })}
          </div>

          <div class="docs-right-card">
            <p class="docs-right-card-title">Need a full architecture walkthrough?</p>
            <p class="docs-right-card-copy">
              Start with System Architecture, then move to Ingestion Pipeline and Time Ranking.
            </p>
            <Link href="/docs/architecture" class="docs-right-card-link">
              Start Here
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
});
