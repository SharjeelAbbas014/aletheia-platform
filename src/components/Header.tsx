import { $, component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { Link, useLocation, useNavigate } from "@builder.io/qwik-city";

import { docsNavigation } from "~/lib/docs";

interface HeaderProps {
  authenticated?: boolean;
}

export const Header = component$<HeaderProps>(({ authenticated }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.url.pathname;
  const searchQuery = useSignal("");
  const searchInputRef = useSignal<HTMLInputElement>();

  const isDocs = pathname.startsWith("/docs");
  const isConsole = pathname.startsWith("/platform");
  const docsSearchIndex = docsNavigation.flatMap((category) => category.items);

  useVisibleTask$(({ cleanup }) => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.value?.focus();
        searchInputRef.value?.select();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    cleanup(() => {
      window.removeEventListener("keydown", onKeyDown);
    });
  });

  const runDocsSearch = $(async () => {
    const normalizedQuery = searchQuery.value.trim().toLowerCase();

    if (!normalizedQuery) {
      await navigate("/docs");
      return;
    }

    const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
    let bestHref = "/docs";
    let bestScore = 0;

    docsSearchIndex.forEach((item) => {
      const title = item.title.toLowerCase();
      const description = (item.description || "").toLowerCase();
      const href = item.href.toLowerCase();

      let score = 0;

      if (title === normalizedQuery) score += 300;
      if (title.startsWith(normalizedQuery)) score += 180;
      if (title.includes(normalizedQuery)) score += 120;
      if (description.includes(normalizedQuery)) score += 80;
      if (href.includes(normalizedQuery)) score += 60;

      tokens.forEach((token) => {
        if (title.includes(token)) score += 30;
        if (description.includes(token)) score += 18;
        if (href.includes(token)) score += 10;
      });

      if (score > bestScore) {
        bestScore = score;
        bestHref = item.href;
      }
    });

    await navigate(bestHref);
  });

  return (
    <header class="fixed top-0 z-50 h-16 w-full border-b border-outline-variant/15 bg-background font-body text-sm tracking-tight shadow-[0px_24px_48px_rgba(0,0,0,0.8)] antialiased">
      <div class="flex h-full w-full items-center justify-between px-6">
        <div class="flex items-center gap-8">
          <Link
            href="/"
            class="font-headline text-xl font-bold tracking-tighter text-[#E5E2E3]"
          >
            Aletheia
          </Link>
          <nav class="hidden items-center gap-6 md:flex">
            <Link
              href="/docs"
              class={`transition-colors duration-200 ${
                isDocs
                  ? "border-b-2 border-primary pb-1 text-primary"
                  : "text-tertiary hover:text-on-surface"
              }`}
            >
              Docs
            </Link>
            <Link
              href="/platform"
              class={`transition-colors duration-200 ${
                isConsole
                  ? "border-b-2 border-primary pb-1 text-primary"
                  : "text-tertiary hover:text-on-surface"
              }`}
            >
              Console
            </Link>
          </nav>
        </div>

        <div class="flex items-center gap-3">
          <form
            preventdefault:submit
            onSubmit$={runDocsSearch}
            class="hidden items-center rounded-lg border border-outline-variant/15 bg-surface-container-low px-3 py-1.5 text-tertiary lg:flex"
          >
            <span class="material-symbols-outlined mr-2 text-sm">search</span>
            <input
              ref={searchInputRef}
              type="search"
              value={searchQuery.value}
              onInput$={(_, el) => {
                searchQuery.value = el.value;
              }}
              placeholder="Search documentation..."
              class="w-52 bg-transparent text-xs text-on-surface placeholder:text-tertiary/70 outline-none"
              aria-label="Search documentation"
            />
            <span class="ml-3 text-[10px] opacity-40">⌘K</span>
          </form>

          {authenticated ? (
            <Link
              href="/platform"
              class="rounded-lg border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary transition-all hover:bg-primary/20"
            >
              Console
            </Link>
          ) : (
            <Link
              href="/login"
              class="rounded-lg border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary transition-all hover:bg-primary/20"
            >
              Log in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
});
