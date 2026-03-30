import { component$ } from "@builder.io/qwik";
import { Link, useLocation } from "@builder.io/qwik-city";

export const Header = component$(() => {
  const location = useLocation();
  const pathname = location.url.pathname;

  const isDocs = pathname.startsWith("/docs");
  const isConsole = pathname.startsWith("/platform");

  return (
    <header class="app-topbar fixed top-0 z-50 h-16 w-full font-body text-sm tracking-tight shadow-[0px_24px_48px_rgba(0,0,0,0.8)] antialiased">
      <div class="flex h-full w-full items-center justify-between px-6">
        <div class="flex items-center gap-8">
          <Link
            href="/"
            class="inline-flex items-center gap-2 font-headline text-xl font-bold tracking-tighter text-[#E5E2E3]"
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
          <Link
            href={isConsole ? "/platform" : "/login"}
            class="rounded-lg border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary transition-all hover:bg-primary/20"
          >
            {isConsole ? "Console" : "Log in"}
          </Link>
        </div>
      </div>
    </header>
  );
});
