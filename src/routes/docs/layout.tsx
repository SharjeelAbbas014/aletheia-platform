import { Slot, component$ } from "@builder.io/qwik";
import { Link, useLocation } from "@builder.io/qwik-city";

import { docsNavigation } from "~/lib/docs";

export default component$(() => {
  const location = useLocation();
  const pathname = location.url.pathname;

  return (
    <div class="flex min-h-screen bg-surface font-body text-on-surface antialiased">
      {/* Side Navigation */}
      <aside class="fixed left-0 top-16 hidden h-[calc(100vh-4rem)] w-64 flex-col border-r border-outline-variant/15 bg-surface font-body text-sm font-medium md:flex">
        <div class="p-6">
          <div class="mb-8 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded bg-primary shadow-lg">
              <span class="material-symbols-outlined text-on-primary font-bold">terminal</span>
            </div>
            <div>
              <h2 class="text-lg font-black leading-tight text-on-surface">Docs</h2>
              <p class="text-[10px] uppercase tracking-widest text-tertiary">Developer Hub</p>
            </div>
          </div>

          <nav class="space-y-6">
            {docsNavigation.map((category) => (
              <div key={category.category}>
                <p class="mb-2 px-4 text-[10px] font-bold uppercase tracking-widest text-tertiary/50">
                  {category.category}
                </p>
                <div class="space-y-1">
                  {category.items.map((item) => {
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        class={`flex items-center gap-3 rounded-md px-4 py-2 transition-all hover:translate-x-1 ${
                          active
                            ? "bg-surface-container-high text-primary"
                            : "text-tertiary hover:bg-surface-container-low hover:text-on-surface"
                        }`}
                      >
                        <span class="material-symbols-outlined text-sm">{item.icon}</span>
                        {item.title}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        <div class="mt-auto p-4 border-t border-outline-variant/10">
          <div class="rounded-lg border border-outline-variant/15 bg-surface-container-low p-4">
            <p class="mb-3 text-xs text-on-surface-variant">Enterprise-grade LLM orchestration at scale.</p>
            <button class="w-full rounded bg-primary px-4 py-2 text-xs font-bold text-on-primary shadow-lg transition-transform active:scale-95">
              Upgrade Plan
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main class="ml-0 flex-1 overflow-y-auto bg-surface relative md:ml-64">
        {/* Decorative Glow */}
        <div class="pointer-events-none absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-secondary/5 blur-[120px]"></div>
        
        <div class="mx-auto max-w-4xl px-8 py-12 lg:px-16 lg:py-24">
          <Slot />
        </div>
      </main>

      {/* Right Sidebar (Table of Contents) */}
      <aside class="fixed right-0 top-16 hidden h-[calc(100vh-4rem)] w-64 border-l border-outline-variant/10 bg-surface p-8 xl:block">
        <h4 class="mb-6 text-[10px] font-bold uppercase tracking-widest text-tertiary/60">On this page</h4>
        <nav class="space-y-4">
          <a class="block border-l-2 border-primary pl-4 text-xs font-medium text-primary" href="#">Introduction</a>
          <a class="block border-l-2 border-transparent pl-4 text-xs text-tertiary transition-all hover:text-on-surface" href="#">Prerequisites</a>
          <a class="block border-l-2 border-transparent pl-4 text-xs text-tertiary transition-all hover:text-on-surface" href="#">Integration Flow</a>
        </nav>
      </aside>
    </div>
  );
});

