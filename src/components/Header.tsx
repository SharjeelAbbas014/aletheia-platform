import { component$, useSignal } from "@builder.io/qwik";
import { Link, useLocation } from "@builder.io/qwik-city";

export const Header = component$(() => {
  const location = useLocation();
  const pathname = location.url.pathname;
  const mobileOpen = useSignal(false);

  const isDocs = pathname.startsWith("/docs");
  const isBlog = pathname.startsWith("/blog");

  return (
    <header class="app-topbar fixed top-0 z-50 w-full font-body text-sm tracking-tight shadow-[0px_24px_48px_rgba(0,0,0,0.8)] antialiased">
      <div class="flex h-16 w-full items-center justify-between px-4 md:px-6">
        <div class="flex items-center gap-8">
          <Link
            href="/"
            class="inline-flex items-center gap-2 font-headline text-xl font-bold tracking-tighter text-[#E5E2E3]"
            onClick$={() => {
              mobileOpen.value = false;
            }}
          >
            <img
              src="/logo-64.png"
              alt="Aletheia logo"
              class="h-8 w-8 rounded object-contain"
              loading="eager"
              decoding="async"
            />
            <span>Aletheia</span>
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
              href="/blog"
              class={`transition-colors duration-200 ${
                isBlog
                  ? "border-b-2 border-primary pb-1 text-primary"
                  : "text-tertiary hover:text-on-surface"
              }`}
            >
              Blog
            </Link>
          </nav>
        </div>

        <div class="flex items-center gap-3">
          <button
            type="button"
            aria-label={mobileOpen.value ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileOpen.value ? "true" : "false"}
            class="app-topbar-menu-button md:hidden"
            onClick$={() => {
              mobileOpen.value = !mobileOpen.value;
            }}
          >
            <span class={`app-topbar-menu-line ${mobileOpen.value ? "app-topbar-menu-line-top-open" : ""}`} />
            <span class={`app-topbar-menu-line ${mobileOpen.value ? "app-topbar-menu-line-middle-open" : ""}`} />
            <span class={`app-topbar-menu-line ${mobileOpen.value ? "app-topbar-menu-line-bottom-open" : ""}`} />
          </button>
          <Link
            href="/login"
            class="rounded-lg border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary transition-all hover:bg-primary/20 md:px-4"
            onClick$={() => {
              mobileOpen.value = false;
            }}
          >
            Log in
          </Link>
        </div>
      </div>

      {mobileOpen.value ? (
        <div class="app-topbar-mobile-nav md:hidden">
          <nav class="app-topbar-mobile-nav-links" aria-label="Mobile site navigation">
            <Link
              href="/docs"
              class={`app-topbar-mobile-link ${isDocs ? "app-topbar-mobile-link-active" : ""}`}
              onClick$={() => {
                mobileOpen.value = false;
              }}
            >
              Docs
            </Link>
            <Link
              href="/blog"
              class={`app-topbar-mobile-link ${isBlog ? "app-topbar-mobile-link-active" : ""}`}
              onClick$={() => {
                mobileOpen.value = false;
              }}
            >
              Blog
            </Link>
            <Link
              href="/login"
              class="app-topbar-mobile-link"
              onClick$={() => {
                mobileOpen.value = false;
              }}
            >
              Log in
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
});
