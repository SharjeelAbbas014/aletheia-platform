import { component$ } from "@builder.io/qwik";
import { Link, useLocation } from "@builder.io/qwik-city";

interface HeaderProps {
  authenticated?: boolean;
}

export const Header = component$<HeaderProps>(({ authenticated }) => {
  const location = useLocation();
  const pathname = location.url.pathname;

  const isDocs = pathname.startsWith("/docs");
  const isConsole = pathname.startsWith("/platform");

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
            <Link
              href="/docs/api-auth"
              class="text-tertiary transition-colors duration-200 hover:text-on-surface"
            >
              API
            </Link>
            <a
              href="#"
              class="text-tertiary transition-colors duration-200 hover:text-on-surface"
            >
              Status
            </a>
          </nav>
        </div>

        <div class="flex items-center gap-4">
          <div class="hidden items-center rounded-lg border border-outline-variant/15 bg-surface-container-low px-3 py-1.5 text-tertiary lg:flex">
            <span class="material-symbols-outlined mr-2 text-sm">search</span>
            <span class="text-xs">Search documentation...</span>
            <span class="ml-4 text-[10px] opacity-40">⌘K</span>
          </div>
          
          <button class="rounded-lg p-2 transition-all hover:bg-surface-container-high active:scale-95">
            <span class="material-symbols-outlined text-primary">notifications</span>
          </button>
          
          <button class="rounded-lg p-2 transition-all hover:bg-surface-container-high active:scale-95">
            <span class="material-symbols-outlined text-primary">settings</span>
          </button>

          {authenticated ? (
            <div class="h-8 w-8 overflow-hidden rounded-full border border-outline-variant/30 bg-surface-container-high">
              <img
                alt="User profile avatar"
                class="h-full w-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKzct_4oNEzAOzzfiwKaE1cbRxW-2lesUUqWUUhpRhWdV7DY2ljJMBIpdLuPHEeDvhYVVQ2Qlh8lhvX6wY4gPl_UzJsjWTufqJYVegBlICcVqyGzM2cry3Dwq1XQiyN45qUZ5kjOISnsLsMpTTLkxSSsyc-u63Wmy2vp3y5kVKozjPJhFqwHeHIhnxi-FsmvDhFueQqmTN29v88-yelIkn5mTmDZuv6Y3RNpXcQ0AyhAo0cysy7LxbGJkjA3DEHC2zZjMVL5K4hLOI"
              />
            </div>
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
