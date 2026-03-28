import Link from "next/link";

import { SiteNav } from "@/components/site-nav";

const pillars = [
  {
    title: "Hybrid retrieval that does not guess",
    body:
      "Aletheia fuses semantic search, BM25, reranking, and time-aware decay so fresh facts rise without losing old but critical context."
  },
  {
    title: "Memory that can change its mind",
    body:
      "Fact supersession, invalidation, and provenance links keep stale beliefs from shadowing updated truth."
  },
  {
    title: "Local-first without a fake SDK split",
    body:
      "The same package can launch the Rust sidecar locally or point at hosted cloud APIs with an API key."
  },
  {
    title: "Built for operational reality",
    body:
      "Typed memories, batched ingest, signing-ready binaries, scoped auth, and benchmark instrumentation are part of the system, not afterthoughts."
  }
];

const stats = [
  { label: "Retrieval stack", value: "ANN + BM25 + rerank" },
  { label: "Memory modes", value: "episodic, fact, summary" },
  { label: "Delivery model", value: "local binary + cloud API" },
  { label: "Security posture", value: "scoped keys and audit trail ready" }
];

const workflow = [
  "Ingest events, conversations, and facts through one API surface.",
  "Distill recurring truths into stable memory layers instead of relying on raw transcripts alone.",
  "Query with reranking and time-aware scoring so the answer set stays relevant.",
  "Ship the same code path locally for developers and remotely for production teams."
];

export default function HomePage() {
  return (
    <main>
      <SiteNav />

      <section className="relative overflow-hidden">
        <div className="hero-orb absolute left-[6%] top-24 h-44 w-44 rounded-full bg-[var(--accent-lime)]" />
        <div className="hero-orb absolute right-[12%] top-36 h-56 w-56 rounded-full bg-[var(--accent-teal)]" />
        <div className="mx-auto grid max-w-7xl gap-14 px-6 py-20 lg:grid-cols-[1.15fr_0.85fr] lg:px-10 lg:py-24">
          <div className="relative">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-neutral-900/10 bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-neutral-700 backdrop-blur">
              Memory infra for agents that need durable recall
            </div>

            <h1 className="display max-w-4xl text-5xl font-semibold leading-[0.95] tracking-[-0.06em] text-neutral-950 md:text-7xl">
              Ship a memory engine that actually remembers, updates, and answers.
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-neutral-700">
              Aletheia gives your product a retrieval stack that can ingest fast,
              reason over history, discard stale claims, and run either as a
              local sidecar or a managed platform.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/docs"
                className="rounded-full bg-neutral-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
              >
                Read the docs
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-neutral-900/12 bg-white/70 px-6 py-3 text-sm font-semibold text-neutral-900 transition hover:border-neutral-900/28 hover:bg-white"
              >
                Open the platform
              </Link>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              {stats.map((item) => (
                <div
                  key={item.label}
                  className="glass-panel rounded-3xl px-5 py-4"
                >
                  <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-500">
                    {item.label}
                  </div>
                  <div className="mt-2 text-base font-semibold text-neutral-950">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div className="dark-panel grid-fade rounded-[2rem] p-7">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.28em] text-white/60">
                <span>Engine signal</span>
                <span>live mode</span>
              </div>
              <div className="mt-8 space-y-6">
                <div>
                  <div className="text-sm text-white/60">Memory pipeline</div>
                  <div className="display mt-2 text-3xl font-semibold tracking-[-0.05em]">
                    ingest -> distill -> rerank -> answer
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.22em] text-white/55">
                      Consistency
                    </div>
                    <div className="mt-2 text-xl font-semibold">
                      Fact supersession keeps stale claims out of the top set.
                    </div>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.22em] text-white/55">
                      Speed
                    </div>
                    <div className="mt-2 text-xl font-semibold">
                      Batch ingest and batched reranking cut redundant model work.
                    </div>
                  </div>
                </div>
                <div className="rounded-3xl bg-[linear-gradient(135deg,rgba(213,255,73,0.18),rgba(89,213,197,0.1))] p-4 text-sm leading-7 text-white/86">
                  Build once for laptop demos, evaluation harnesses, and hosted
                  production. The SDK surface stays stable while the runtime
                  switches from local binary to cloud endpoint.
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-[2rem] p-6">
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-500">
                Why teams choose it
              </div>
              <div className="mt-4 space-y-3">
                {workflow.map((step, index) => (
                  <div
                    key={step}
                    className="flex items-start gap-4 rounded-2xl border border-neutral-900/8 bg-white/70 px-4 py-4"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-xs font-semibold text-white">
                      {index + 1}
                    </div>
                    <p className="text-sm leading-7 text-neutral-700">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="why" className="mx-auto max-w-7xl px-6 py-8 lg:px-10 lg:py-16">
        <div className="mb-10 max-w-3xl">
          <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-neutral-500">
            Why it wins
          </div>
          <h2 className="display mt-4 text-4xl font-semibold tracking-[-0.05em] text-neutral-950 md:text-5xl">
            Better recall is not one trick. It is ranking, memory structure, and
            operational discipline together.
          </h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {pillars.map((pillar, index) => (
            <article
              key={pillar.title}
              className={`rounded-[2rem] p-8 ${
                index % 2 === 0 ? "glass-panel" : "dark-panel"
              }`}
            >
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-current/60">
                0{index + 1}
              </div>
              <h3 className="display mt-5 text-3xl font-semibold tracking-[-0.04em]">
                {pillar.title}
              </h3>
              <p className="mt-4 max-w-xl text-base leading-8 text-current/75">
                {pillar.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-20">
        <div className="rounded-[2.5rem] border border-neutral-900/12 bg-neutral-950 px-8 py-10 text-white shadow-[0_25px_90px_rgba(10,12,12,0.28)] lg:px-12 lg:py-14">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr]">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/55">
                Platform
              </div>
              <h2 className="display mt-4 text-4xl font-semibold tracking-[-0.05em] lg:text-5xl">
                One home for docs, onboarding, API keys, and developer velocity.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-white/72">
                Start with the local engine, move to managed API keys when you
                need a hosted control plane, and keep the SDK ergonomics the
                same from the first prototype to production rollout.
              </p>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                <div className="text-xs uppercase tracking-[0.24em] text-white/50">
                  Docs
                </div>
                <p className="mt-3 text-sm leading-7 text-white/78">
                  MDX docs with a real framework, room for API references, and a
                  navigation system built for developer products.
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                <div className="text-xs uppercase tracking-[0.24em] text-white/50">
                  Access
                </div>
                <p className="mt-3 text-sm leading-7 text-white/78">
                  Demo login today, then swap in your production auth provider
                  and persistence layer without redesigning the product shell.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/login"
                  className="rounded-full bg-[var(--accent-lime)] px-5 py-3 text-center text-sm font-semibold text-neutral-950 transition hover:brightness-95"
                >
                  Generate a demo key
                </Link>
                <Link
                  href="/docs/quickstart"
                  className="rounded-full border border-white/12 px-5 py-3 text-center text-sm font-semibold text-white transition hover:border-white/30"
                >
                  See the quickstart
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
