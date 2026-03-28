import Link from "next/link";

import { isAuthenticated } from "@/lib/auth";

const linkClass =
  "text-sm font-medium text-neutral-700 transition hover:text-neutral-950";

export async function SiteNav() {
  const authenticated = await isAuthenticated();

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-900/10 bg-[rgba(245,242,233,0.86)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-900/15 bg-neutral-950 text-[11px] font-semibold uppercase tracking-[0.32em] text-white">
            Al
          </span>
          <span className="font-[family:var(--font-display)] text-lg font-semibold tracking-tight text-neutral-950">
            Aletheia
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/#problem" className={linkClass}>
            Problem
          </Link>
          <Link href="/#how" className={linkClass}>
            How it works
          </Link>
          <Link href="/#everyone" className={linkClass}>
            For users
          </Link>
          <Link href="/#platform" className={linkClass}>
            Platform
          </Link>
          <Link href="/docs" className={linkClass}>
            Docs
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href={authenticated ? "/platform" : "/login"}
            className="rounded-full border border-neutral-900/15 px-4 py-2 text-sm font-medium text-neutral-800 transition hover:border-neutral-900/30 hover:bg-white"
          >
            {authenticated ? "Dashboard" : "Log in"}
          </Link>
          <Link
            href="/docs"
            className="rounded-full bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
          >
            Start building
          </Link>
        </div>
      </div>
    </header>
  );
}
