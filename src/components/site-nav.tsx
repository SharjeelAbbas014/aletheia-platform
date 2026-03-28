import { component$ } from "@builder.io/qwik";
import { Link, useLocation } from "@builder.io/qwik-city";

type SiteNavProps = {
  authenticated: boolean;
};

export const SiteNav = component$<SiteNavProps>(({ authenticated }) => {
  const location = useLocation();
  const currentPath = location.url.pathname;

  const navClass = (href: string) =>
    currentPath === href || (href === "/docs" && currentPath.startsWith("/docs"))
      ? "nav-link nav-link-active"
      : "nav-link";

  return (
    <header class="site-header">
      <div class="shell site-header-inner">
        <Link href="/" class="brand-mark">
          <span class="brand-badge">Al</span>
          <span class="brand-word">Aletheia</span>
        </Link>

        <nav class="nav-links" aria-label="Primary">
          <a href="/#problem" class={currentPath === "/" ? "nav-link" : "nav-link nav-link-muted"}>
            Problem
          </a>
          <a href="/#how" class={currentPath === "/" ? "nav-link" : "nav-link nav-link-muted"}>
            How it works
          </a>
          <a href="/#tech" class={currentPath === "/" ? "nav-link" : "nav-link nav-link-muted"}>
            Tech
          </a>
          <a href="/#platform" class={currentPath === "/" ? "nav-link" : "nav-link nav-link-muted"}>
            Platform
          </a>
          <Link href="/docs" class={navClass("/docs")}>
            Docs
          </Link>
        </nav>

        <div class="nav-actions">
          {authenticated ? (
            <>
              <Link href="/platform" class="button button-ghost">
                Dashboard
              </Link>
              <form method="post" action="/logout">
                <button type="submit" class="button button-dark-outline">
                  Log out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" class="button button-ghost">
                Log in
              </Link>
              <Link href="/docs" class="button button-dark">
                Start building
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
});
