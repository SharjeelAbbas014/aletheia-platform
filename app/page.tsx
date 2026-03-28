import Link from "next/link";

import { SiteNav } from "@/components/site-nav";

const heroStats = [
  { label: "Retrieval stack", value: "ANN + BM25 + rerank" },
  { label: "Memory structure", value: "episodic + fact + summary" },
  { label: "Runtime model", value: "local binary + cloud API" },
  { label: "Shared state", value: "one memory across tools" }
];

const failureModes = [
  {
    title: "Transcript pile-up",
    body:
      "Most assistants keep raw chat history but never distill durable facts, so relevance gets worse as conversations get longer."
  },
  {
    title: "Stale beliefs keep winning",
    body:
      "Without invalidation and supersession, an old claim can still outrank the newer one that should replace it."
  },
  {
    title: "Every tool forgets alone",
    body:
      "You tell one model your preferences, coding rules, or customer facts, and the next model starts from zero again."
  }
];

const repairSteps = [
  {
    step: "01",
    title: "Capture the right signals",
    body:
      "Ingest events, user facts, summaries, and decisions through one surface instead of scattering state across ad hoc prompts."
  },
  {
    step: "02",
    title: "Rank with structure",
    body:
      "Aletheia fuses semantic search, lexical search, reranking, and time-aware weighting so the answer set stays relevant."
  },
  {
    step: "03",
    title: "Correct memory over time",
    body:
      "Fact supersession, provenance, and scoped reads keep the engine aligned with the latest truth instead of freezing old context forever."
  }
];

const memoryLayers = [
  {
    label: "Episodic memory",
    body: "Turn and event level observations keep short-term context grounded in actual interaction history."
  },
  {
    label: "Stable facts",
    body: "Preferences, profile details, and durable truths can supersede older versions instead of duplicating forever."
  },
  {
    label: "Session summaries",
    body: "Long threads collapse into reusable summaries so useful context survives without dragging the whole transcript around."
  },
  {
    label: "Operational controls",
    body: "Scoped API access, auditability, and platform-managed keys make the system usable outside a lab demo."
  }
];

const crossModelMoments = [
  {
    model: "Claude Code",
    prompt: 'Use pnpm for this repo. I do not want npm commands in the workflow.',
    result: "Aletheia stores the preference as shared memory."
  },
  {
    model: "ChatGPT",
    prompt: "Write the install and setup commands for the same project.",
    result: "The assistant recalls pnpm and answers consistently."
  },
  {
    model: "Gemini or Grok",
    prompt: "Generate onboarding notes for the team using this stack.",
    result: "The same memory comes back again because the backend is shared."
  }
];

const controlPlaneCards = [
  {
    label: "Landing page",
    body:
      "Explain the problem clearly, show the architecture visually, and give buyers a concrete reason to trust the engine."
  },
  {
    label: "Docs",
    body:
      "Keep the quickstart, auth model, local runtime, and SDK surfaces in one place with MDX-based documentation."
  },
  {
    label: "Platform",
    body:
      "Login, issue API keys, observe usage, and keep the hosted control plane separate from the Rust engine runtime."
  }
];

function SectionHeader({
  kicker,
  title,
  body
}: {
  kicker: string;
  title: string;
  body: string;
}) {
  return (
    <div className="max-w-3xl">
      <div className="section-kicker">{kicker}</div>
      <h2 className="display mt-4 text-4xl font-semibold tracking-[-0.05em] text-neutral-950 md:text-5xl">
        {title}
      </h2>
      <p className="mt-5 text-base leading-8 text-neutral-700 md:text-lg">
        {body}
      </p>
    </div>
  );
}

function HeroIllustration() {
  return (
    <div className="illustration-shell dark-panel relative min-h-[560px] overflow-hidden rounded-[2.25rem] p-6">
      <div className="ambient-grid absolute inset-0 opacity-20" />
      <div className="spot-glow absolute left-8 top-12 h-28 w-28 rounded-full bg-[var(--accent-lime)]" />
      <div className="spot-glow absolute bottom-14 right-12 h-32 w-32 rounded-full bg-[var(--accent-teal)]" />

      <svg
        viewBox="0 0 520 420"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="hero-beam-lime" x1="40" y1="0" x2="460" y2="0">
            <stop offset="0%" stopColor="#d5ff49" stopOpacity="0.05" />
            <stop offset="45%" stopColor="#d5ff49" stopOpacity="1" />
            <stop offset="100%" stopColor="#59d5c5" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="hero-beam-orange" x1="60" y1="0" x2="460" y2="0">
            <stop offset="0%" stopColor="#ff9156" stopOpacity="0.05" />
            <stop offset="45%" stopColor="#ff9156" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#59d5c5" stopOpacity="0.35" />
          </linearGradient>
        </defs>
        <path
          className="signal-path"
          stroke="url(#hero-beam-lime)"
          d="M104 132 C 176 132, 188 192, 260 192"
        />
        <path
          className="signal-path"
          stroke="url(#hero-beam-orange)"
          d="M118 302 C 190 302, 202 236, 260 224"
        />
        <path
          className="signal-path"
          stroke="url(#hero-beam-lime)"
          d="M290 208 C 350 208, 372 208, 432 208"
        />
      </svg>

      <div className="absolute left-6 top-6 flex flex-wrap gap-2">
        {["retrieval fusion", "fact supersession", "scoped memory"].map((label) => (
          <div
            key={label}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/74"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="story-card float-medium absolute left-6 top-28 w-40 rounded-[1.6rem] border border-white/10 bg-white/7 p-4 text-white">
        <div className="text-[11px] uppercase tracking-[0.22em] text-white/55">
          Input stream
        </div>
        <div className="mt-2 text-lg font-semibold">
          User prefers pourover coffee.
        </div>
        <div className="mt-3 text-sm leading-6 text-white/68">
          Durable preference enters the engine instead of disappearing into one thread.
        </div>
      </div>

      <div className="story-card float-fast absolute bottom-16 left-12 w-44 rounded-[1.6rem] border border-white/10 bg-white/7 p-4 text-white">
        <div className="text-[11px] uppercase tracking-[0.22em] text-white/55">
          Runtime signal
        </div>
        <div className="mt-2 text-lg font-semibold">
          Recent summary and older facts are scored together.
        </div>
      </div>

      <div className="pulse-soft glow-core absolute left-1/2 top-[51%] flex h-44 w-44 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full text-center text-white">
        <div className="text-[11px] uppercase tracking-[0.26em] text-white/55">
          Aletheia
        </div>
        <div className="display mt-2 max-w-[8rem] text-2xl font-semibold leading-tight">
          retrieval + memory core
        </div>
        <div className="mt-3 rounded-full bg-white/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/72">
          live graph
        </div>
      </div>

      <div className="story-card float-slow absolute right-6 top-36 w-44 rounded-[1.6rem] border border-white/10 bg-white/7 p-4 text-white">
        <div className="text-[11px] uppercase tracking-[0.22em] text-white/55">
          Answer shaping
        </div>
        <div className="mt-2 text-lg font-semibold">
          Fresh facts rise. stale claims drop. context stays scoped.
        </div>
        <div className="mt-3 text-sm leading-6 text-white/68">
          The output reflects what changed, not just what was said first.
        </div>
      </div>

      <div className="absolute bottom-6 right-6 flex flex-wrap justify-end gap-2">
        {["local sidecar", "cloud api", "shared entity id"].map((label) => (
          <div
            key={label}
            className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70"
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProblemIllustration() {
  return (
    <div className="illustration-shell relative min-h-[430px] overflow-hidden rounded-[2rem] p-6">
      <div className="ambient-grid absolute inset-0 opacity-45" />
      <div className="spot-glow absolute right-12 top-12 h-28 w-28 rounded-full bg-[var(--accent-orange)]" />

      <svg
        viewBox="0 0 520 360"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="problem-beam" x1="0" y1="0" x2="480" y2="0">
            <stop offset="0%" stopColor="#ff9156" stopOpacity="0.1" />
            <stop offset="55%" stopColor="#ff9156" stopOpacity="1" />
            <stop offset="100%" stopColor="#101413" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <path
          className="signal-path"
          stroke="url(#problem-beam)"
          d="M120 112 C 220 112, 220 200, 318 216"
        />
        <path
          className="signal-path"
          stroke="url(#problem-beam)"
          d="M126 222 C 224 222, 244 222, 318 216"
        />
      </svg>

      <div className="story-card float-medium absolute left-6 top-10 w-44 rounded-[1.6rem] border border-[rgba(255,145,86,0.22)] bg-white/88 p-4">
        <div className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">
          January
        </div>
        <div className="mt-2 text-lg font-semibold text-neutral-950">
          User lives in Berlin.
        </div>
      </div>

      <div className="story-card float-fast absolute left-8 top-40 w-48 rounded-[1.6rem] border border-[rgba(89,213,197,0.22)] bg-white/88 p-4">
        <div className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">
          June
        </div>
        <div className="mt-2 text-lg font-semibold text-neutral-950">
          User moved to Toronto.
        </div>
      </div>

      <div className="absolute right-6 top-24 w-[15.5rem] rounded-[1.8rem] border border-neutral-900/10 bg-neutral-950 px-5 py-5 text-white shadow-[0_25px_90px_rgba(10,12,12,0.26)]">
        <div className="text-[11px] uppercase tracking-[0.22em] text-white/55">
          Wrong answer
        </div>
        <div className="mt-3 text-xl font-semibold leading-8">
          The system still answers as if the user is in Berlin.
        </div>
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm leading-6 text-white/72">
          Without invalidation and supersession, older memory can keep leaking into the top result set.
        </div>
      </div>

      <div className="absolute bottom-6 left-6 rounded-full bg-neutral-950 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white">
        This is the bug Aletheia is fixing.
      </div>
    </div>
  );
}

function RepairIllustration() {
  return (
    <div className="illustration-shell relative overflow-hidden rounded-[2.25rem] px-5 py-8 md:px-8">
      <div className="ambient-grid absolute inset-0 opacity-35" />
      <svg
        viewBox="0 0 1100 260"
        className="absolute inset-0 hidden h-full w-full lg:block"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="repair-beam" x1="0" y1="0" x2="1100" y2="0">
            <stop offset="0%" stopColor="#d5ff49" stopOpacity="0.1" />
            <stop offset="45%" stopColor="#59d5c5" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#ff9156" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <path
          className="signal-path"
          stroke="url(#repair-beam)"
          d="M165 130 H 395 C 470 130, 470 130, 545 130 H 915"
        />
      </svg>

      <div className="grid gap-4 lg:grid-cols-4">
        {[
          {
            label: "Ingest",
            body: "Conversation turns, facts, summaries, and decisions land in one memory substrate."
          },
          {
            label: "Distill",
            body: "Repeated or durable truths are promoted into stronger memory layers."
          },
          {
            label: "Retrieve",
            body: "ANN, BM25, reranking, and decay collaborate instead of competing blindly."
          },
          {
            label: "Answer",
            body: "The assistant responds from scoped, fresher context rather than raw transcript luck."
          }
        ].map((item, index) => (
          <div
            key={item.label}
            className="story-card motion-card relative rounded-[1.8rem] bg-white/88 p-5"
          >
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
              0{index + 1}
            </div>
            <div className="display mt-3 text-2xl font-semibold tracking-[-0.04em] text-neutral-950">
              {item.label}
            </div>
            <p className="mt-3 text-sm leading-7 text-neutral-700">{item.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SharedMemoryIllustration() {
  return (
    <div className="illustration-shell dark-panel relative min-h-[520px] overflow-hidden rounded-[2.25rem] p-6 text-white">
      <div className="ambient-grid absolute inset-0 opacity-15" />
      <div className="spot-glow absolute left-16 top-10 h-28 w-28 rounded-full bg-[var(--accent-lime)]" />
      <div className="spot-glow absolute bottom-10 right-16 h-28 w-28 rounded-full bg-[var(--accent-teal)]" />

      <svg
        viewBox="0 0 520 420"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="shared-beam" x1="0" y1="0" x2="520" y2="0">
            <stop offset="0%" stopColor="#59d5c5" stopOpacity="0.18" />
            <stop offset="45%" stopColor="#d5ff49" stopOpacity="1" />
            <stop offset="100%" stopColor="#59d5c5" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <path
          className="signal-path"
          stroke="url(#shared-beam)"
          d="M110 100 C 178 126, 206 150, 260 200"
        />
        <path
          className="signal-path"
          stroke="url(#shared-beam)"
          d="M408 100 C 342 124, 316 148, 260 200"
        />
        <path
          className="signal-path"
          stroke="url(#shared-beam)"
          d="M110 312 C 178 286, 206 252, 260 200"
        />
        <path
          className="signal-path"
          stroke="url(#shared-beam)"
          d="M410 314 C 344 286, 318 250, 260 200"
        />
      </svg>

      <div className="story-card float-medium absolute left-6 top-10 w-44 rounded-[1.6rem] border border-white/10 bg-white/7 p-4">
        <div className="text-[11px] uppercase tracking-[0.22em] text-white/55">
          Claude Code
        </div>
        <div className="mt-2 text-lg font-semibold">
          "Use pnpm for this repo."
        </div>
      </div>

      <div className="story-card float-fast absolute right-6 top-12 w-44 rounded-[1.6rem] border border-white/10 bg-white/7 p-4">
        <div className="text-[11px] uppercase tracking-[0.22em] text-white/55">
          ChatGPT
        </div>
        <div className="mt-2 text-lg font-semibold">
          "Install with pnpm and keep scripts consistent."
        </div>
      </div>

      <div className="story-card float-fast absolute bottom-10 left-8 w-44 rounded-[1.6rem] border border-white/10 bg-white/7 p-4">
        <div className="text-[11px] uppercase tracking-[0.22em] text-white/55">
          Gemini
        </div>
        <div className="mt-2 text-lg font-semibold">
          "The onboarding guide should use pnpm too."
        </div>
      </div>

      <div className="story-card float-medium absolute bottom-12 right-8 w-44 rounded-[1.6rem] border border-white/10 bg-white/7 p-4">
        <div className="text-[11px] uppercase tracking-[0.22em] text-white/55">
          Grok
        </div>
        <div className="mt-2 text-lg font-semibold">
          "The preference survives because the memory backend is shared."
        </div>
      </div>

      <div className="pulse-soft glow-core absolute left-1/2 top-1/2 flex h-44 w-44 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full text-center">
        <div className="text-[11px] uppercase tracking-[0.26em] text-white/55">
          Shared memory
        </div>
        <div className="display mt-2 max-w-[8rem] text-2xl font-semibold leading-tight">
          one user, one long-term context
        </div>
      </div>

      <div className="absolute left-1/2 top-6 -translate-x-1/2 rounded-full bg-white/8 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">
        same entity id, same backend, same memory
      </div>
    </div>
  );
}

function PlatformIllustration() {
  return (
    <div className="illustration-shell relative min-h-[440px] overflow-hidden rounded-[2rem] p-6">
      <div className="ambient-grid absolute inset-0 opacity-45" />
      <div className="spot-glow absolute left-8 top-10 h-28 w-28 rounded-full bg-[var(--accent-lime)]" />
      <div className="spot-glow absolute right-10 bottom-10 h-32 w-32 rounded-full bg-[var(--accent-orange)]" />

      <div className="story-card float-medium absolute left-6 top-8 w-44 rounded-[1.7rem] p-4">
        <div className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">
          Docs surface
        </div>
        <div className="mt-3 text-xl font-semibold text-neutral-950">
          Quickstart, auth, API shape, local runtime.
        </div>
      </div>

      <div className="story-card float-fast absolute right-6 top-16 w-48 rounded-[1.7rem] bg-neutral-950 p-4 text-white">
        <div className="text-[11px] uppercase tracking-[0.22em] text-white/55">
          Control plane
        </div>
        <div className="mt-3 text-xl font-semibold">
          Login, create key, scope access, inspect usage.
        </div>
      </div>

      <div className="story-card absolute left-1/2 top-[54%] w-[19rem] -translate-x-1/2 -translate-y-1/2 rounded-[2rem] bg-white/92 p-5 shadow-[0_25px_80px_rgba(16,20,19,0.12)]">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">
              API keys
            </div>
            <div className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-neutral-950">
              tm_live_prod_8Y...
            </div>
          </div>
          <div className="rounded-full bg-[var(--accent-lime)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-950">
            active
          </div>
        </div>
        <div className="mt-5 grid gap-3">
          <div className="rounded-2xl border border-neutral-900/8 bg-neutral-950/4 px-4 py-3 text-sm leading-6 text-neutral-700">
            Docs and dashboard live in the same platform, so onboarding and access control stay aligned.
          </div>
          <div className="flex gap-2">
            <div className="flex-1 rounded-full bg-neutral-950 px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-white">
              rotate key
            </div>
            <div className="flex-1 rounded-full border border-neutral-900/10 bg-white px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-700">
              audit request
            </div>
          </div>
        </div>
      </div>

      <div className="story-card float-slow absolute bottom-8 right-10 w-44 rounded-[1.7rem] p-4">
        <div className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">
          Hosted path
        </div>
        <div className="mt-3 text-xl font-semibold text-neutral-950">
          Same SDK, same methods, different runtime mode.
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="overflow-hidden">
      <SiteNav />

      <section className="relative overflow-hidden">
        <div className="ambient-grid absolute inset-x-0 top-0 h-[760px] opacity-55" />
        <div className="hero-orb absolute left-[4%] top-24 h-44 w-44 rounded-full bg-[var(--accent-lime)]" />
        <div className="hero-orb absolute right-[8%] top-40 h-60 w-60 rounded-full bg-[var(--accent-teal)]" />
        <div className="hero-orb absolute right-[28%] top-14 h-32 w-32 rounded-full bg-[var(--accent-orange)]" />

        <div className="mx-auto grid max-w-7xl gap-16 px-6 py-18 lg:grid-cols-[1.02fr_0.98fr] lg:px-10 lg:py-24">
          <div className="relative">
            <div className="section-kicker">
              Memory infrastructure for agents and applications
            </div>

            <h1 className="display mt-6 max-w-5xl text-5xl font-semibold leading-[0.94] tracking-[-0.065em] text-neutral-950 md:text-7xl">
              A memory engine that explains what went wrong, fixes it, and carries context across models.
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-neutral-700">
              Aletheia gives your product durable recall without transcript bloat.
              It captures facts and preferences, retrieves them with ranking that
              respects freshness, and lets the same memory follow the user from
              Claude Code to ChatGPT to Gemini to Grok.
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
                className="rounded-full border border-neutral-900/12 bg-white/75 px-6 py-3 text-sm font-semibold text-neutral-900 transition hover:border-neutral-900/28 hover:bg-white"
              >
                Open the platform
              </Link>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              {heroStats.map((item) => (
                <div
                  key={item.label}
                  className="glass-panel motion-card rounded-3xl px-5 py-4"
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

            <div className="story-card mt-8 max-w-2xl rounded-[1.7rem] px-5 py-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
                Plain language
              </div>
              <p className="mt-3 text-base leading-7 text-neutral-700">
                Tell one assistant something once, and the next assistant can
                still know it later because the memory lives in Aletheia, not in
                one model tab.
              </p>
            </div>
          </div>

          <HeroIllustration />
        </div>
      </section>

      <section id="problem" className="mx-auto max-w-7xl px-6 py-8 lg:px-10 lg:py-18">
        <div className="grid items-center gap-12 lg:grid-cols-[0.92fr_1.08fr]">
          <div>
            <SectionHeader
              kicker="Why memory breaks"
              title="Most assistants do not have a memory problem. They have a memory quality problem."
              body="The issue is not just forgetting. It is retrieving the wrong thing, keeping stale facts alive, and forcing every model session to relearn the same user context from scratch."
            />

            <div className="mt-8 grid gap-4">
              {failureModes.map((mode) => (
                <article
                  key={mode.title}
                  className="story-card motion-card rounded-[1.7rem] px-5 py-5"
                >
                  <h3 className="display text-2xl font-semibold tracking-[-0.04em] text-neutral-950">
                    {mode.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-neutral-700">
                    {mode.body}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <ProblemIllustration />
        </div>
      </section>

      <section id="how" className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-20">
        <SectionHeader
          kicker="How Aletheia works"
          title="It repairs the memory loop instead of pretending longer context windows solve everything."
          body="Aletheia captures durable signals, ranks them with multiple retrieval systems working together, and lets truth evolve through supersession rather than endless duplication."
        />

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {repairSteps.map((step) => (
            <article
              key={step.step}
              className="glass-panel motion-card rounded-[1.9rem] px-6 py-6"
            >
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-500">
                {step.step}
              </div>
              <h3 className="display mt-3 text-3xl font-semibold tracking-[-0.04em] text-neutral-950">
                {step.title}
              </h3>
              <p className="mt-4 text-sm leading-7 text-neutral-700">
                {step.body}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-8">
          <RepairIllustration />
        </div>
      </section>

      <section id="everyone" className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <SectionHeader
              kicker="For normal users"
              title="The agent can remember across each model, not just inside one app."
              body="This matters even if the user never sees the infrastructure. Aletheia sits behind the assistants, so a durable preference or fact can follow the same person from one model to the next."
            />

            <div className="mt-8 space-y-4">
              {crossModelMoments.map((moment, index) => (
                <article
                  key={moment.model}
                  className="story-card motion-card rounded-[1.7rem] px-5 py-5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-xs font-semibold text-white">
                      {index + 1}
                    </div>
                    <div className="display text-2xl font-semibold tracking-[-0.04em] text-neutral-950">
                      {moment.model}
                    </div>
                  </div>
                  <p className="mt-4 rounded-2xl bg-neutral-950 px-4 py-3 text-sm leading-7 text-white">
                    {moment.prompt}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-neutral-700">
                    {moment.result}
                  </p>
                </article>
              ))}
            </div>

            <div className="glass-panel mt-6 rounded-[1.8rem] px-5 py-5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
                Example
              </div>
              <p className="mt-3 text-base leading-7 text-neutral-700">
                If a user tells Claude Code that this repo must use pnpm, then
                later asks ChatGPT for setup commands, the second assistant can
                still answer with pnpm because both assistants query the same
                memory backend.
              </p>
            </div>
          </div>

          <SharedMemoryIllustration />
        </div>
      </section>

      <section id="why" className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_0.92fr]">
          <div>
            <SectionHeader
              kicker="Under the hood"
              title="The engine keeps context structured so long-term recall gets stronger instead of noisier."
              body="Different memory shapes serve different purposes. Aletheia keeps them explicit so the system can reason about freshness, stability, and provenance instead of stuffing everything into one blob."
            />

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {memoryLayers.map((layer) => (
                <article
                  key={layer.label}
                  className="glass-panel motion-card rounded-[1.7rem] px-5 py-5"
                >
                  <h3 className="display text-2xl font-semibold tracking-[-0.04em] text-neutral-950">
                    {layer.label}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-neutral-700">
                    {layer.body}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <PlatformIllustration />
        </div>
      </section>

      <section id="platform" className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-20">
        <div className="rounded-[2.6rem] border border-neutral-900/12 bg-neutral-950 px-8 py-10 text-white shadow-[0_28px_100px_rgba(10,12,12,0.28)] lg:px-12 lg:py-14">
          <div className="grid gap-10 lg:grid-cols-[0.94fr_1.06fr]">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/55">
                Platform
              </div>
              <h2 className="display mt-4 text-4xl font-semibold tracking-[-0.05em] lg:text-5xl">
                One place for the pitch, the docs, the login, and the keys.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-white/72">
                The platform repo should explain the product, teach developers
                how to use it, and act as the front door for hosted access. That
                keeps onboarding, API keys, and product positioning in one
                coherent surface.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/login"
                  className="rounded-full bg-[var(--accent-lime)] px-5 py-3 text-center text-sm font-semibold text-neutral-950 transition hover:brightness-95"
                >
                  Generate a demo key
                </Link>
                <Link
                  href="/docs/quickstart"
                  className="rounded-full border border-white/14 px-5 py-3 text-center text-sm font-semibold text-white transition hover:border-white/32"
                >
                  See the quickstart
                </Link>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {controlPlaneCards.map((card) => (
                <article
                  key={card.label}
                  className="rounded-[1.8rem] border border-white/10 bg-white/6 px-5 py-5"
                >
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/50">
                    {card.label}
                  </div>
                  <p className="mt-4 text-sm leading-7 text-white/75">
                    {card.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
