import { createApiKeyAction, revokeApiKeyAction } from "./actions";

import { SiteNav } from "@/components/site-nav";
import { getApiKeys } from "@/lib/api-keys";
import { getCurrentUser, requireAuth } from "@/lib/auth";

export default async function PlatformPage() {
  await requireAuth();
  const user = await getCurrentUser();
  const keys = await getApiKeys();
  const codeToken = keys[0]?.token ?? "tm_live_xxxxxxxxxxxxxxxxxxxxxx";

  return (
    <main>
      <SiteNav />

      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="glass-panel rounded-[2.25rem] p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-neutral-500">
                  Platform dashboard
                </div>
                <h1 className="display mt-4 text-4xl font-semibold tracking-[-0.05em] text-neutral-950">
                  Welcome back, {user.email}
                </h1>
              </div>

              <form action="/api/auth/logout" method="post">
                <button
                  type="submit"
                  className="rounded-full border border-neutral-900/12 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:border-neutral-900/28"
                >
                  Log out
                </button>
              </form>
            </div>

            <p className="mt-5 max-w-2xl text-base leading-8 text-neutral-700">
              This shell gives you a place to onboard users, issue API keys, and
              present the docs without splitting your marketing and developer
              product across multiple repos.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.75rem] border border-neutral-900/10 bg-white/80 p-5">
                <div className="text-xs uppercase tracking-[0.24em] text-neutral-500">
                  Active keys
                </div>
                <div className="display mt-3 text-3xl font-semibold tracking-[-0.05em] text-neutral-950">
                  {keys.length}
                </div>
              </div>
              <div className="rounded-[1.75rem] border border-neutral-900/10 bg-white/80 p-5">
                <div className="text-xs uppercase tracking-[0.24em] text-neutral-500">
                  Default scope
                </div>
                <div className="mt-3 text-sm font-semibold text-neutral-900">
                  read:memories write:memories
                </div>
              </div>
              <div className="rounded-[1.75rem] border border-neutral-900/10 bg-white/80 p-5">
                <div className="text-xs uppercase tracking-[0.24em] text-neutral-500">
                  Mode
                </div>
                <div className="mt-3 text-sm font-semibold text-neutral-900">
                  demo auth, cookie persistence
                </div>
              </div>
            </div>
          </div>

          <div className="dark-panel rounded-[2.25rem] p-8">
            <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/55">
              Quickstart snippet
            </div>
            <pre className="mt-5 overflow-x-auto rounded-[1.75rem] border border-white/10 bg-black/20 p-5 text-sm leading-7 text-white/82">
              <code>{`from aletheia import AletheiaClient

client = AletheiaClient.from_cloud(
    "https://api.aletheia.dev",
    api_key="${codeToken}",
)

results = client.query(
    "What changed about the user's preferences?",
    entity_id="user-123",
)`}</code>
            </pre>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 pb-14 lg:grid-cols-[0.88fr_1.12fr] lg:px-10">
        <div className="glass-panel rounded-[2.25rem] p-8">
          <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-neutral-500">
            Create API key
          </div>
          <form action={createApiKeyAction} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-neutral-800"
              >
                Key label
              </label>
              <input
                id="name"
                name="name"
                placeholder="Production app, staging, or local benchmark"
                className="w-full rounded-2xl border border-neutral-900/12 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-900/30"
              />
            </div>
            <button
              type="submit"
              className="rounded-full bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              Generate new key
            </button>
          </form>
        </div>

        <div className="glass-panel rounded-[2.25rem] p-8">
          <div className="flex items-center justify-between gap-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-neutral-500">
              Issued keys
            </div>
            <span className="rounded-full border border-neutral-900/10 bg-white/80 px-3 py-1 text-xs font-medium text-neutral-600">
              cookie-backed demo store
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {keys.length === 0 ? (
              <div className="rounded-[1.75rem] border border-dashed border-neutral-900/16 bg-white/55 px-5 py-8 text-sm leading-7 text-neutral-600">
                No keys yet. Generate one and this dashboard will immediately
                show the token, label, scope, and revocation control.
              </div>
            ) : (
              keys.map((key) => (
                <article
                  key={key.id}
                  className="rounded-[1.75rem] border border-neutral-900/10 bg-white/78 p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-neutral-950">
                        {key.name}
                      </h2>
                      <div className="mt-2 font-mono text-sm text-neutral-700">
                        {key.token}
                      </div>
                    </div>
                    <form action={revokeApiKeyAction}>
                      <input type="hidden" name="id" value={key.id} />
                      <button
                        type="submit"
                        className="rounded-full border border-neutral-900/12 px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:border-neutral-900/28"
                      >
                        Revoke
                      </button>
                    </form>
                  </div>

                  <div className="mt-5 grid gap-3 text-sm text-neutral-700 sm:grid-cols-3">
                    <div className="rounded-2xl border border-neutral-900/8 bg-white/80 px-4 py-3">
                      <div className="text-[11px] uppercase tracking-[0.24em] text-neutral-500">
                        Preview
                      </div>
                      <div className="mt-2 font-mono text-xs">{key.preview}</div>
                    </div>
                    <div className="rounded-2xl border border-neutral-900/8 bg-white/80 px-4 py-3">
                      <div className="text-[11px] uppercase tracking-[0.24em] text-neutral-500">
                        Scope
                      </div>
                      <div className="mt-2">{key.scope}</div>
                    </div>
                    <div className="rounded-2xl border border-neutral-900/8 bg-white/80 px-4 py-3">
                      <div className="text-[11px] uppercase tracking-[0.24em] text-neutral-500">
                        Created
                      </div>
                      <div className="mt-2">
                        {new Date(key.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

