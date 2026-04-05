import { $, component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import {
  Link,
  type DocumentHead,
  type RequestHandler,
} from "@builder.io/qwik-city";
import {
  CALENDLY_30_MIN_URL,
  CONTACT_EMAIL,
  CONTACT_MAILTO,
} from "~/constants/contact";
import {
  privateRepositoryNote,
  publicRepositoryLinks,
} from "~/constants/repositories";
import { setPublicEdgeCache } from "~/lib/cache";
import type { HeroDemoResult, HeroWarmupResult } from "~/lib/hero-demo";
import { buildSeoHead } from "~/lib/seo";

const landingStyles = `
.landing-v2 {
  background: #0a0a0b;
  --mouse-x: 52%;
  --mouse-y: 42%;
  --scroll-progress: 0;
  --hero-progress: 0;
}

.landing-v2 .progress-rail {
  position: fixed;
  left: 0;
  top: 4rem;
  z-index: 45;
  width: 100%;
  height: 2px;
  pointer-events: none;
  background: rgba(148, 163, 184, 0.08);
}

.landing-v2 .progress-rail::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, #6366f1 0%, #67e8f9 65%, #d946ef 100%);
  transform-origin: left center;
  transform: scaleX(var(--scroll-progress));
  transition: transform 120ms linear;
  box-shadow: 0 0 18px rgba(99, 102, 241, 0.55);
}

.landing-v2 .interactive-aurora {
  position: absolute;
  inset: -16%;
  pointer-events: none;
  z-index: 0;
  filter: blur(26px) saturate(130%);
  background:
    radial-gradient(320px circle at var(--mouse-x) var(--mouse-y), rgba(99, 102, 241, 0.34), transparent 64%),
    radial-gradient(440px circle at calc(100% - var(--mouse-x)) calc(110% - var(--mouse-y)), rgba(103, 232, 249, 0.24), transparent 66%);
  opacity: calc(0.45 + (var(--hero-progress) * 0.4));
  transition: opacity 260ms ease;
}

.landing-v2 .hero-orb-left {
  transform: translate3d(calc(var(--hero-progress) * -28px), calc(var(--hero-progress) * -36px), 0);
}

.landing-v2 .hero-orb-right {
  transform: translate3d(calc(var(--hero-progress) * 34px), calc(var(--hero-progress) * 24px), 0);
}

.landing-v2 .tilt-panel {
  position: relative;
  transform-style: preserve-3d;
  will-change: transform;
  transition:
    transform 280ms cubic-bezier(0.2, 0.8, 0.2, 1),
    box-shadow 280ms ease,
    border-color 220ms ease;
}

.landing-v2 .tilt-panel::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  z-index: 2;
  opacity: 0;
  background: radial-gradient(
    circle at var(--glare-x, 50%) var(--glare-y, 0%),
    rgba(255, 255, 255, 0.24),
    transparent 52%
  );
  transition: opacity 180ms ease;
}

.landing-v2 .tilt-panel[data-tilting="true"]::before {
  opacity: 1;
}

.landing-v2 .glass-panel {
  background: rgba(20, 20, 23, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.landing-v2 .obsidian-gradient {
  background: linear-gradient(135deg, #6366f1 0%, #4338ca 100%);
}

.landing-v2 .text-glow {
  text-shadow: 0 0 15px rgba(99, 102, 241, 0.4);
}

.landing-v2 .scroll-reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.22, 1, 0.36, 1);
}

.landing-v2 .scroll-reveal.visible {
  opacity: 1;
  transform: translateY(0);
}

.landing-v2 .distillation-path {
  stroke-dasharray: 10;
  animation: flow-line 2s linear infinite;
}

.landing-v2 ::selection {
  background: rgba(99, 102, 241, 0.3);
}

::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #0a0a0b;
}

::-webkit-scrollbar-thumb {
  background: #2d2d35;
  border-radius: 10px;
}

@media (prefers-reduced-motion: reduce) {
  .landing-v2 .scroll-reveal {
    opacity: 1;
    transform: none;
    transition: none;
  }

  .landing-v2 .interactive-aurora {
    display: none;
  }

  .landing-v2 .progress-rail::after {
    transition: none;
  }

  .landing-v2 .tilt-panel {
    transform: none !important;
    transition: none;
  }

  .landing-v2 .tilt-panel::before {
    display: none;
  }

  .landing-v2 .hero-orb-left,
  .landing-v2 .hero-orb-right {
    transform: none;
  }

  .landing-v2 .animate-float,
  .landing-v2 .animate-fade-in-up,
  .landing-v2 .animate-pulse-slow,
  .landing-v2 .animate-pulse,
  .landing-v2 .distillation-path {
    animation: none !important;
  }
}
`;

const memoryGapCards = [
  {
    title: "Standard Vector DB",
    icon: "layers_clear",
    iconWrapClass: "bg-red-500/20",
    iconClass: "text-red-400",
    panelClass: "",
    items: [
      {
        title: "Static Snapshot",
        body: "Retrieves data from 2 years ago exactly like data from 2 minutes ago.",
        icon: "close",
        iconClass: "text-red-500",
      },
      {
        title: "Context Blind",
        body: "Simply matches keywords. It does not know the difference between a wish and a fact.",
        icon: "close",
        iconClass: "text-red-500",
      },
      {
        title: "Bloated Storage",
        body: "Stores every uh and um instead of the core truth of the conversation.",
        icon: "close",
        iconClass: "text-red-500",
      },
    ],
  },
  {
    title: "Aletheia Memory Engine",
    icon: "psychology",
    iconWrapClass: "bg-primary/20",
    iconClass: "text-primary",
    panelClass: "border-primary/40 shadow-[0_0_50px_rgba(99,102,241,0.1)]",
    items: [
      {
        title: "Temporal Awareness",
        body: "Understands the arrow of time. Newer facts naturally supersede obsolete ones.",
        icon: "check_circle",
        iconClass: "text-primary",
      },
      {
        title: "Truth Extraction",
        body: "Distills 1,000 words into 3 verified semantic facts. Efficiency by design.",
        icon: "check_circle",
        iconClass: "text-primary",
      },
      {
        title: "Active Reasoning",
        body: "Connects the dots between conversations to build a coherent world-view.",
        icon: "check_circle",
        iconClass: "text-primary",
      },
    ],
  },
];

const distillationDetails = [
  {
    icon: "schedule",
    title: "Time-Awareness",
    body: "I used to love coffee, but now I only drink tea. Aletheia does not hallucinate your old preferences. It updates your profile in real time.",
  },
  {
    icon: "filter_center_focus",
    title: "Fact Distillation",
    body: "Our engine automatically discards greetings and filler, keeping only the high-value semantic facts that actually matter for personalization.",
  },
];

const userFlowCards = [
  {
    date: "The First Spark (May 12)",
    quote: "Hey! I just bought a white Mercedes! What should I do first?",
    summary: "GPT-4o detects: User Ownership → Vehicle: Mercedes (White)",
    icon: "chat_bubble",
    iconWrapClass: "bg-primary/20",
    iconClass: "text-primary",
    borderClass: "border-l-4 border-l-primary/30",
    delay: "",
  },
  {
    date: "Aletheia Ingests",
    quote: "Fact Integration",
    summary: "",
    icon: "psychology",
    iconWrapClass: "bg-primary",
    iconClass: "text-white",
    borderClass: "border-primary/40 shadow-[0_20px_40px_rgba(0,0,0,0.3)]",
    delay: "150ms",
    facts: ["Fact: Owns Mercedes", "Context: Initial Purchase"],
  },
  {
    date: "3 Months Later (Aug 20)",
    quote: "What was that maintenance tip for my car?",
    summary: 'Claude 3.5 recalls: "For your white Mercedes, I recommend..."',
    icon: "auto_awesome",
    iconWrapClass: "bg-indigo-500/20",
    iconClass: "text-indigo-400",
    borderClass: "border-l-4 border-l-indigo-400/30",
    delay: "300ms",
  },
];

const uniqueEdges = [
  {
    icon: "all_inclusive",
    title: "Multi-Model Continuity",
    body: "Memory that follows the user, not the model. Switch from GPT-4 to Claude to Llama and Aletheia keeps the brain intact across every integration.",
    delay: "",
  },
  {
    icon: "published_with_changes",
    title: "Fact Supersession",
    body: "When life changes, Aletheia knows. If a user moves from NYC to LA, the old fact is marked as superseded so stale context stops leaking into answers.",
    delay: "150ms",
  },
  {
    icon: "bolt",
    title: "Zero-Config Performance",
    body: "Built with Rust as a single compiled binary. Deployment is fast and recall latency stays in the sub-100ms range without orchestration drama.",
    delay: "300ms",
  },
];

const engineSpecs = [
  {
    icon: "memory",
    title: "Coded in Rust",
    body: "Ultimate memory safety and blazing-fast execution. No garbage collection pauses, just low-level performance where it matters.",
  },
  {
    icon: "deployed_code",
    title: "Single Binary Deployment",
    body: "No complex Docker chains. One file, zero configuration, instant memory synchronization across your stack.",
  },
  {
    icon: "speed",
    title: "Sub-100ms Latency",
    body: "Human-like recall speeds that keep up with your fastest LLM workflows without turning memory into the bottleneck.",
  },
];

const shippedPillars = [
  {
    title: "Retrieval Brain",
    icon: "travel_explore",
    body: "Hybrid retrieval keeps exact tokens and semantic intent in the same decision path so answers stay grounded.",
    capabilities: [
      "Vector + lexical candidate generation",
      "Cross-encoder precision pass",
      "Rank fusion for stable top-k",
    ],
  },
  {
    title: "Temporal Truth",
    icon: "schedule",
    body: "The engine models memory as something that changes over time, not a static bag of embeddings.",
    capabilities: [
      "Kind-aware TTL and decay",
      "Fact supersession and invalidation",
      "Time-windowed query mode",
    ],
  },
  {
    title: "Developer Surfaces",
    icon: "terminal",
    body: "SDK and HTTP entry points are designed to keep local-first workflows aligned with hosted deployments.",
    capabilities: [
      "Python and JavaScript SDK paths",
      "Auth + key lifecycle support",
      "Clear ingest/query contracts",
    ],
  },
  {
    title: "Ops Readiness",
    icon: "deployed_code",
    body: "The system includes practical controls for measurement, tuning, and safe production rollout.",
    capabilities: [
      "Benchmark harness integration",
      "Observability and diagnostics",
      "Single-binary deployment model",
    ],
  },
];

const deliveryTrack = [
  {
    phase: "Phase 01",
    icon: "upload",
    title: "Ingest and Distill",
    body: "Raw events are normalized, deduplicated, and expanded into durable memories with lineage.",
    checkpoints: ["Companion memories", "Dedup table", "Graph relationships"],
  },
  {
    phase: "Phase 02",
    icon: "hub",
    title: "Retrieve and Rerank",
    body: "Semantic and lexical candidates are fused, reranked, then filtered by temporal policy before response.",
    checkpoints: ["HNSW + BM25", "Cross-rerank", "RRF + policy filters"],
  },
  {
    phase: "Phase 03",
    icon: "rocket_launch",
    title: "Ship and Operate",
    body: "Teams deploy one memory engine surface from local bench runs to hosted multi-tenant workloads.",
    checkpoints: ["SDK parity", "Benchmarked quality", "Operational playbooks"],
  },
];

const runtimeSnapshot = `engine: Aletheia
routes: /ingest /query/semantic /query/temporal /memory
indexes: hnsw + bm25 + graph lineage
policy: ttl + decay + supersession
sdk: python + javascript`;

const platformLinks = [
  { label: "Memory Lattice", href: "/#memory" },
  { label: "Vector Store", href: "/docs/local-engine" },
  { label: "Rust SDK", href: "/docs/quickstart" },
  { label: "Integrations", href: "/docs/api-auth" },
];

const companyLinks = [
  { label: "Privacy First", href: "/docs/security" },
  { label: "Security Audit", href: "/docs/security" },
  { label: "Open Source", href: "/docs" },
  { label: "Contact", href: CONTACT_MAILTO },
];

export const onRequest: RequestHandler = (event) => {
  setPublicEdgeCache(event);
};

export default component$(() => {
  const pageRef = useSignal<HTMLElement>();
  const heroMessage = useSignal(
    "I moved to Tokyo and I still prefer jasmine tea over coffee."
  );
  const heroDemoResult = useSignal<HeroDemoResult | null>(null);
  const heroWarmupResult = useSignal<HeroWarmupResult | null>(null);
  const heroDemoRunning = useSignal(false);
  const heroWarmupRunning = useSignal(false);

  const readJsonResponse = $(async (
    response: Response,
    fallbackPrefix: string
  ): Promise<HeroWarmupResult | HeroDemoResult> => {
    const raw = await response.text();
    try {
      return JSON.parse(raw) as HeroWarmupResult | HeroDemoResult;
    } catch {
      return {
        ok: false,
        message: `${fallbackPrefix} ${raw.trim() || response.statusText}`
      };
    }
  });

  const runHeroWarmup = $(async () => {
    heroWarmupRunning.value = true;
    heroWarmupResult.value = null;

    try {
      const response = await fetch("/api/hero/warmup", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        }
      });
      heroWarmupResult.value = (await readJsonResponse(
        response,
        "Warm-up failed."
      )) as HeroWarmupResult;
    } catch (error) {
      heroWarmupResult.value = {
        ok: false,
        message:
          error instanceof Error
            ? `Warm-up transport failed. ${error.message}`
            : "Warm-up transport failed."
      };
    } finally {
      heroWarmupRunning.value = false;
    }
  });

  const runHeroDemo = $(async () => {
    const message = heroMessage.value.trim();
    if (!message) {
      heroDemoResult.value = {
        ok: false,
        message: "Enter a user message so the engine has something real to save."
      };
      return;
    }

    heroDemoRunning.value = true;
    heroDemoResult.value = null;

    try {
      const response = await fetch("/api/hero/demo", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          message
        })
      });
      heroDemoResult.value = (await readJsonResponse(
        response,
        "Demo failed."
      )) as HeroDemoResult;
    } catch (error) {
      heroDemoResult.value = {
        ok: false,
        message:
          error instanceof Error
            ? `Demo transport failed. ${error.message}`
            : "Demo transport failed."
      };
    } finally {
      heroDemoRunning.value = false;
    }
  });

  useVisibleTask$(({ cleanup }) => {
    const root = pageRef.value;

    if (!root) {
      return;
    }

    const revealItems = Array.from(
      root.querySelectorAll<HTMLElement>(".scroll-reveal"),
    );
    const tiltPanels = Array.from(
      root.querySelectorAll<HTMLElement>("[data-tilt]"),
    );
    const heroSection = root.querySelector<HTMLElement>("[data-hero]");
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const supportsHover = window.matchMedia("(hover: hover)").matches;

    const clamp = (value: number, min: number, max: number) =>
      Math.min(max, Math.max(min, value));

    const updateScrollProgress = () => {
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop;
      const maxScroll = Math.max(doc.scrollHeight - window.innerHeight, 1);
      root.style.setProperty(
        "--scroll-progress",
        (scrollTop / maxScroll).toFixed(4),
      );

      if (!heroSection) {
        return;
      }

      const heroRect = heroSection.getBoundingClientRect();
      const rawProgress =
        (window.innerHeight - heroRect.top) /
        (window.innerHeight + heroRect.height);
      root.style.setProperty(
        "--hero-progress",
        clamp(rawProgress, 0, 1).toFixed(4),
      );
    };

    const updatePointer = (clientX: number, clientY: number) => {
      if (!heroSection) {
        return;
      }

      const rect = heroSection.getBoundingClientRect();
      if (clientY < rect.top - 80 || clientY > rect.bottom + 80) {
        return;
      }

      const x = ((clientX - rect.left) / rect.width) * 100;
      const y = ((clientY - rect.top) / rect.height) * 100;
      root.style.setProperty("--mouse-x", `${clamp(x, 0, 100).toFixed(2)}%`);
      root.style.setProperty("--mouse-y", `${clamp(y, 0, 100).toFixed(2)}%`);
    };

    if (prefersReducedMotion) {
      revealItems.forEach((item) => item.classList.add("visible"));
      updateScrollProgress();
      return;
    }

    updateScrollProgress();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add("visible");
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      },
    );

    revealItems.forEach((item) => observer.observe(item));

    const removePanelListeners: Array<() => void> = [];

    if (supportsHover) {
      tiltPanels.forEach((panel) => {
        const onPointerMove = (event: PointerEvent) => {
          const rect = panel.getBoundingClientRect();
          const px = clamp(
            ((event.clientX - rect.left) / rect.width) * 100,
            0,
            100,
          );
          const py = clamp(
            ((event.clientY - rect.top) / rect.height) * 100,
            0,
            100,
          );
          const rotateY = (px - 50) * 0.12;
          const rotateX = (50 - py) * 0.12;

          panel.dataset.tilting = "true";
          panel.style.setProperty("--glare-x", `${px.toFixed(2)}%`);
          panel.style.setProperty("--glare-y", `${py.toFixed(2)}%`);
          panel.style.transform = `perspective(1100px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
        };

        const resetPanel = () => {
          panel.dataset.tilting = "false";
          panel.style.transform =
            "perspective(1100px) rotateX(0deg) rotateY(0deg) translateY(0)";
        };

        panel.addEventListener("pointermove", onPointerMove);
        panel.addEventListener("pointerleave", resetPanel);

        removePanelListeners.push(() => {
          panel.removeEventListener("pointermove", onPointerMove);
          panel.removeEventListener("pointerleave", resetPanel);
        });
      });
    }

    const onPointerMove = (event: PointerEvent) => {
      updatePointer(event.clientX, event.clientY);
    };

    const onScroll = () => {
      updateScrollProgress();
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    cleanup(() => {
      observer.disconnect();
      removePanelListeners.forEach((remove) => remove());
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    });
  });

  return (
    <div ref={pageRef} class="landing-v2 bg-surface text-on-surface font-body">
      <div aria-hidden="true" class="progress-rail" />
      <main class="pt-4">
        <section
          data-hero
          class="relative flex min-h-[95vh] items-center overflow-hidden px-6"
        >
          <div class="absolute inset-0 z-0">
            <div class="interactive-aurora" />
            <div class="hero-orb-left absolute left-[-25%] top-1/4 h-[600px] w-[600px] animate-pulse-slow rounded-full bg-primary/20 blur-[120px]" />
            <div class="hero-orb-right absolute bottom-0 right-[-25%] h-[500px] w-[500px] rounded-full bg-indigo-900/20 blur-[100px]" />
          </div>

          <div class="container mx-auto relative z-10 grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)]">
            <div class="animate-fade-in-up">
              <div class="mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-300/35 bg-emerald-400/10 px-4 py-1.5">
                <span class="relative inline-flex h-2.5 w-2.5">
                  <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
                  <span class="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.95)]" />
                </span>
                <span class="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-300">
                  Protocol v2.0: The Sentient Monolith
                </span>
              </div>

              <h1 class="mb-8 text-6xl font-black leading-[0.95] tracking-tight md:text-8xl">
                AGENTS <br />
                THAT{" "}
                <span class="italic text-[#7df9ff] [text-shadow:0_0_16px_rgba(125,249,255,0.45)]">
                  REMEMBER.
                </span>
              </h1>

              <p class="mb-10 max-w-xl text-xl leading-relaxed text-tertiary">
                Stop treating every chat like a first date. Aletheia gives your
                AI a persistent, evolving brain, a cognitive architecture that
                learns who your users are one interaction at a time.
              </p>

              <div class="mb-10 max-w-2xl space-y-3">
                <div class="glass-panel max-w-[85%] rounded-[1.5rem] rounded-bl-md p-4">
                  <div class="mb-2 flex items-center gap-3">
                    <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/20 text-primary">
                      <img
                        src="/logo-64.png"
                        alt=""
                        width={24}
                        height={24}
                        class="h-6 w-6 object-contain"
                      />
                    </div>
                    <div>
                      <p class="text-sm font-bold text-on-surface">
                        Aletheia Bot
                      </p>
                      <p class="text-[11px] uppercase tracking-[0.24em] text-tertiary">
                        How we work
                      </p>
                    </div>
                  </div>
                  <p class="text-sm leading-relaxed text-tertiary">
                    Tell me something important about the user and I persist it
                    into the memory engine, not a temporary chat buffer.
                  </p>
                </div>

                <div class="ml-auto glass-panel max-w-[80%] rounded-[1.5rem] rounded-br-md border-primary/20 bg-primary/10 p-4">
                  <p class="text-sm leading-relaxed text-on-surface">
                    So you keep the fact even after the model changes?
                  </p>
                </div>

                <div class="glass-panel max-w-[90%] rounded-[1.5rem] rounded-bl-md p-4">
                  <p class="text-sm leading-relaxed text-tertiary">
                    Exactly. The site ingests the event, queries memories back
                    from Aletheia, and shows the engine-only latency from
                    `x-tm-total-ms` so you see the real recall path.
                  </p>
                </div>
              </div>

              <div class="flex flex-wrap gap-5">
                <Link
                  href="/docs/quickstart"
                  class="obsidian-gradient flex items-center gap-3 rounded-xl px-10 py-5 text-lg font-bold text-white transition-all hover:shadow-[0_0_40px_rgba(99,102,241,0.4)] active:scale-95"
                >
                  Truth Disclosed
                  <span class="material-symbols-outlined">bolt</span>
                </Link>
                <Link
                  href="/login"
                  class="glass-panel rounded-xl px-10 py-5 text-lg font-bold text-on-surface transition-all hover:bg-surface-container-high active:scale-95"
                >
                  Watch Demo
                </Link>
              </div>
            </div>

            <div class="relative flex justify-center lg:justify-end">
              <div class="glass-panel relative w-full max-w-[560px] overflow-hidden rounded-[2rem] border-primary/20 shadow-[0_32px_120px_rgba(5,8,18,0.58)]">
                <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(125,249,255,0.16),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.22),transparent_38%)]" />
                <div class="relative border-b border-white/10 px-6 py-5">
                  <div class="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h2 class="text-2xl font-black tracking-tight text-on-surface">
                        Persist a user fact. Pull it back from Aletheia.
                      </h2>
                    </div>
                  </div>
                  <p class="mt-4 max-w-xl text-sm leading-relaxed text-tertiary">
                    This demo stores the message under a stable visitor entity,
                    then fetches related memories back from the engine using the
                    live Runpod load balancer.
                  </p>
                </div>

                <div class="relative space-y-6 p-6">
                  <div class="flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                    <div>
                      <p class="text-[10px] font-bold uppercase tracking-[0.24em] text-tertiary">
                        Serverless Warm-Up
                      </p>
                      <p class="mt-2 text-sm leading-relaxed text-on-surface">
                        Ping the engine before a live demo to reduce cold-start
                        surprises on Runpod serverless.
                      </p>
                    </div>
                    <button
                      type="button"
                      class="glass-panel inline-flex items-center gap-3 rounded-2xl px-5 py-3 text-sm font-bold text-on-surface transition-all hover:bg-surface-container-high active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={heroWarmupRunning.value}
                      onClick$={runHeroWarmup}
                    >
                      {heroWarmupRunning.value ? "Warming..." : "Warm Up"}
                      <span class="material-symbols-outlined text-base">
                        bolt
                      </span>
                    </button>
                  </div>

                  {heroWarmupResult.value?.message ? (
                    <div class="rounded-[1.5rem] border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200">
                      {heroWarmupResult.value.message}
                    </div>
                  ) : null}

                  {heroWarmupResult.value?.ok ? (
                    <div class="grid gap-4 md:grid-cols-2">
                      <div class="rounded-[1.5rem] border border-emerald-400/20 bg-emerald-500/10 p-4">
                        <p class="text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-200/80">
                          Warm-Up Status
                        </p>
                        <p class="mt-2 text-2xl font-black tracking-tight text-white">
                          {heroWarmupResult.value.status}
                        </p>
                        <p class="mt-2 text-xs text-emerald-100/80">
                          The engine answered `/health`.
                        </p>
                      </div>
                      <div class="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                        <p class="text-[10px] font-bold uppercase tracking-[0.24em] text-tertiary">
                          Warm-Up Round Trip
                        </p>
                        <p class="mt-2 text-2xl font-black tracking-tight text-on-surface">
                          {heroWarmupResult.value.roundTripLabel}
                        </p>
                        <p class="mt-2 text-xs text-tertiary">
                          End-to-end response time from `/health`
                          {heroWarmupResult.value.engineLabel !== "n/a"
                            ? `, engine ${heroWarmupResult.value.engineLabel}.`
                            : "."}
                        </p>
                      </div>
                    </div>
                  ) : null}

                  <div class="space-y-4">
                    <label class="block text-[11px] font-bold uppercase tracking-[0.22em] text-tertiary">
                      User Message
                    </label>
                    <textarea
                      class="min-h-[124px] w-full rounded-[1.5rem] border border-white/10 bg-black/25 px-5 py-4 text-base text-on-surface outline-none transition-colors placeholder:text-tertiary/55 focus:border-primary/60"
                      placeholder="I moved to Tokyo and I still prefer jasmine tea over coffee."
                      value={heroMessage.value}
                      onInput$={(_, currentTarget) => {
                        heroMessage.value = currentTarget.value;
                      }}
                      required
                    />
                    <div class="flex flex-wrap items-center justify-between gap-4">
                      <p class="text-xs leading-relaxed text-tertiary">
                        We ingest this as memory, then query the same entity and
                        surface the actual hits below.
                      </p>
                      <button
                        type="button"
                        class="obsidian-gradient inline-flex items-center gap-3 rounded-2xl px-6 py-3.5 text-sm font-bold text-white transition-all hover:shadow-[0_0_32px_rgba(99,102,241,0.35)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={heroDemoRunning.value}
                        onClick$={runHeroDemo}
                      >
                        {heroDemoRunning.value
                          ? "Running..."
                          : "Store and Recall"}
                        <span class="material-symbols-outlined text-base">
                          arrow_forward
                        </span>
                      </button>
                    </div>
                  </div>

                  {heroDemoResult.value?.message ? (
                    <div class="rounded-[1.5rem] border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200">
                      {heroDemoResult.value.message}
                    </div>
                  ) : null}

                  <div class="grid gap-4 md:grid-cols-3">
                    <div class="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                      <p class="text-[10px] font-bold uppercase tracking-[0.24em] text-tertiary">
                        Persist
                      </p>
                      <p class="mt-2 text-2xl font-black tracking-tight text-on-surface">
                        {heroDemoResult.value?.ingestLabel ?? "pending"}
                      </p>
                      <p class="mt-2 text-xs text-tertiary">
                        {heroDemoResult.value?.ingestRoundTripLabel
                          ? `Engine write time from /ingest. Round trip ${heroDemoResult.value.ingestRoundTripLabel}.`
                          : "Engine write time from `/ingest`."}
                      </p>
                    </div>
                    <div class="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                      <p class="text-[10px] font-bold uppercase tracking-[0.24em] text-tertiary">
                        Recall
                      </p>
                      <p class="mt-2 text-2xl font-black tracking-tight text-on-surface">
                        {heroDemoResult.value?.queryLabel ?? "pending"}
                      </p>
                      <p class="mt-2 text-xs text-tertiary">
                        {heroDemoResult.value?.queryRoundTripLabel
                          ? `Engine recall time from /query/semantic. Round trip ${heroDemoResult.value.queryRoundTripLabel}.`
                          : "Engine recall time from `/query/semantic`."}
                      </p>
                    </div>
                    <div class="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                      <p class="text-[10px] font-bold uppercase tracking-[0.24em] text-tertiary">
                        Demo Entity
                      </p>
                      <p class="mt-2 break-all font-mono text-sm text-on-surface">
                        {heroDemoResult.value?.entityId ??
                          "generated on first run"}
                      </p>
                      <p class="mt-2 text-xs text-tertiary">
                        Stable cookie-backed user scope.
                      </p>
                    </div>
                  </div>

                  {heroDemoResult.value?.queryUnderBlink ? (
                    <div class="relative overflow-hidden rounded-[1.75rem] border border-cyan-300/25 bg-[linear-gradient(135deg,rgba(14,165,233,0.18),rgba(99,102,241,0.18),rgba(16,185,129,0.16))] p-5">
                      <div class="absolute right-[-2rem] top-[-2rem] h-24 w-24 rounded-full bg-cyan-300/20 blur-2xl" />
                      <div class="absolute bottom-[-2rem] left-[-1rem] h-20 w-20 rounded-full bg-emerald-300/20 blur-2xl" />
                      <div class="relative flex items-start gap-4">
                        <div class="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-cyan-100">
                          <img
                            src="/logo-64.png"
                            alt=""
                            width={24}
                            height={24}
                            class="h-6 w-6 object-contain"
                          />
                        </div>
                        <div>
                          <p class="text-[10px] font-bold uppercase tracking-[0.26em] text-cyan-100/80">
                            Faster Than Blink
                          </p>
                          <h3 class="mt-2 text-2xl font-black tracking-tight text-white">
                            We get your memories faster than you blink.
                          </h3>
                          <p class="mt-2 max-w-xl text-sm leading-relaxed text-cyan-50/85">
                            The recall path stayed under 100ms at the engine
                            layer, excluding HTTPS and any downstream LLM work.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <div class="rounded-[1.75rem] border border-white/10 bg-black/20 p-5">
                    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p class="text-[10px] font-bold uppercase tracking-[0.24em] text-tertiary">
                          Retrieved Memories
                        </p>
                        <p class="mt-1 text-sm text-on-surface">
                          {heroDemoResult.value?.submittedText
                            ? `Pulled back from Aletheia for "${heroDemoResult.value.submittedText}".`
                            : "Submit a message to store a fact and inspect the returned memories."}
                        </p>
                      </div>
                      {heroDemoResult.value?.memoryId ? (
                        <div class="rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-mono text-[11px] text-tertiary">
                          saved as {heroDemoResult.value.memoryId}
                        </div>
                      ) : null}
                    </div>

                    <div class="space-y-3">
                      {heroDemoResult.value?.hits?.length ? (
                        heroDemoResult.value.hits.map((hit) => (
                          <div
                            key={hit.memory_id}
                            class="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4"
                          >
                            <div class="mb-2 flex flex-wrap items-center justify-between gap-3">
                              <p class="font-mono text-[11px] text-primary">
                                {hit.memory_id}
                              </p>
                              <div class="flex items-center gap-3 text-[11px] text-tertiary">
                                <span>{hit.createdLabel}</span>
                                <span>score {hit.similarity.toFixed(3)}</span>
                              </div>
                            </div>
                            <p class="text-sm leading-relaxed text-on-surface">
                              {hit.textual_content}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div class="rounded-[1.25rem] border border-dashed border-white/10 bg-white/[0.02] p-5 text-sm leading-relaxed text-tertiary">
                          The first successful run will save the message into
                          the engine, query it back, and render the returned
                          memories here.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="memory-gap"
          class="border-y border-outline-variant/10 bg-surface-container-high/20 px-6 py-32"
        >
          <div class="container mx-auto">
            <div class="scroll-reveal mx-auto mb-20 max-w-3xl text-center">
              <h2 class="mb-4 text-sm font-bold uppercase tracking-widest text-primary">
                The Cognition Problem
              </h2>
              <h3 class="mb-6 text-4xl font-black tracking-tight md:text-5xl">
                Standard RAG is{" "}
                <span class="italic text-tertiary">amnesiac.</span>
              </h3>
              <p class="text-lg text-tertiary">
                Vector databases are giant warehouses of static text. They find
                words, but they do not understand life. They lose context,
                ignore the passage of time, and drown in their own noise.
              </p>
            </div>

            <div class="grid grid-cols-1 gap-12 lg:grid-cols-2">
              {memoryGapCards.map((card, cardIndex) => (
                <div
                  key={card.title}
                  class={`glass-panel scroll-reveal tilt-panel rounded-3xl p-10 ${card.panelClass}`}
                  data-tilt
                  style={{
                    transitionDelay: cardIndex === 1 ? "150ms" : undefined,
                  }}
                >
                  <div class="mb-8 flex items-center gap-4">
                    <div
                      class={`flex h-10 w-10 items-center justify-center rounded-full ${card.iconWrapClass}`}
                    >
                      <span
                        class={`material-symbols-outlined ${card.iconClass}`}
                      >
                        {card.icon}
                      </span>
                    </div>
                    <h4 class="text-xl font-bold">{card.title}</h4>
                  </div>

                  <ul class="space-y-6">
                    {card.items.map((item) => (
                      <li key={item.title} class="flex gap-4">
                        <span
                          class={`material-symbols-outlined shrink-0 ${item.iconClass}`}
                        >
                          {item.icon}
                        </span>
                        <div>
                          <span class="mb-1 block font-bold">{item.title}</span>
                          <p class="text-sm text-tertiary">{item.body}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section class="overflow-hidden px-6 py-32">
          <div class="container mx-auto">
            <div class="grid grid-cols-1 items-center gap-20 lg:grid-cols-2">
              <div class="scroll-reveal">
                <h2 class="mb-4 text-sm font-bold uppercase tracking-widest text-primary">
                  The Distillation Loop
                </h2>
                <h3 class="mb-8 text-4xl font-black leading-tight md:text-5xl">
                  We do not store text.
                  <br />
                  We extract <span class="italic text-primary">truth.</span>
                </h3>
                <p class="mb-8 text-lg text-tertiary">
                  Raw chat logs are noise. Aletheia acts as a cognitive filter,
                  distilling human rambling into a clean, queryable lattice of
                  facts.
                </p>

                <div class="space-y-8">
                  {distillationDetails.map((item) => (
                    <div key={item.title} class="flex items-start gap-6">
                      <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5">
                        <span class="material-symbols-outlined text-primary">
                          {item.icon}
                        </span>
                      </div>
                      <div>
                        <h4 class="mb-2 font-bold">{item.title}</h4>
                        <p class="text-sm text-tertiary">{item.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div
                class="glass-panel scroll-reveal relative rounded-3xl border-primary/20 p-8 lg:p-12"
                style={{ transitionDelay: "200ms" }}
              >
                <div class="flex flex-col items-center gap-10">
                  <div class="group flex w-full items-center justify-between">
                    <div class="rounded-xl border border-white/10 bg-white/5 p-4 font-mono text-xs">
                      "Hey! I just bought a white Mercedes!"
                    </div>
                    <span class="material-symbols-outlined animate-pulse text-primary">
                      arrow_forward
                    </span>
                    <div class="rounded-full border border-primary/40 bg-primary/20 px-4 py-2 text-[10px] font-bold uppercase tracking-widest">
                      Raw Chat
                    </div>
                  </div>

                  <div class="flex w-full flex-col items-center border-y border-outline-variant/20 py-8">
                    <div class="obsidian-gradient mb-4 flex h-20 w-20 items-center justify-center rounded-2xl shadow-[0_0_30px_rgba(99,102,241,0.5)]">
                      <span class="material-symbols-outlined text-4xl text-white">
                        settings_input_component
                      </span>
                    </div>
                    <div class="text-sm font-bold uppercase tracking-widest">
                      Distillation Engine
                    </div>
                    <div class="mt-2 font-mono text-[10px] text-tertiary">
                      Running: Rust Semantic Kernel v2
                    </div>
                  </div>

                  <div class="w-full space-y-3">
                    <div class="flex items-center gap-3 rounded-lg border border-green-500/20 bg-green-500/10 p-3">
                      <span class="material-symbols-outlined text-sm text-green-400">
                        verified
                      </span>
                      <span class="font-mono text-xs">
                        Semantic Fact: User owns White Mercedes
                      </span>
                    </div>
                    <div class="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3 opacity-60">
                      <span class="material-symbols-outlined text-sm text-primary">
                        database
                      </span>
                      <span class="font-mono text-xs">
                        Committed to Long-Term Memory
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="memory" class="bg-surface-container/30 px-6 py-32">
          <div class="container mx-auto">
            <div class="scroll-reveal mb-20 max-w-2xl">
              <h2 class="mb-4 text-sm font-bold uppercase tracking-widest text-primary">
                The Human Touch
              </h2>
              <h3 class="text-4xl font-black tracking-tight md:text-5xl">
                One brain,
                <br />
                infinite applications.
              </h3>
              <p class="mt-6 text-tertiary">
                Our White Mercedes engine ensures your user's identity is not
                locked inside a single chat window.
              </p>
            </div>

            <div class="grid grid-cols-1 gap-8 md:grid-cols-3">
              {userFlowCards.map((card) => (
                <div
                  key={card.date}
                  class={`glass-panel scroll-reveal tilt-panel rounded-2xl p-8 ${card.borderClass}`}
                  data-tilt
                  style={{
                    transitionDelay: card.delay || undefined,
                  }}
                >
                  <div
                    class={`mb-6 flex h-12 w-12 items-center justify-center rounded-lg ${card.iconWrapClass}`}
                  >
                    <span class={`material-symbols-outlined ${card.iconClass}`}>
                      {card.icon}
                    </span>
                  </div>

                  <div
                    class={`mb-3 font-mono text-xs uppercase tracking-wider ${
                      card.date === "Aletheia Ingests"
                        ? "text-primary"
                        : "text-tertiary"
                    }`}
                  >
                    {card.date}
                  </div>

                  <p
                    class={`mb-6 text-lg leading-relaxed ${
                      card.facts
                        ? "font-bold"
                        : "font-medium italic text-on-surface/90"
                    }`}
                  >
                    {card.quote}
                  </p>

                  {card.facts ? (
                    <div class="space-y-3">
                      {card.facts.map((fact) => (
                        <div
                          key={fact}
                          class="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3"
                        >
                          <span class="material-symbols-outlined text-sm text-green-400">
                            check_circle
                          </span>
                          <span class="font-mono text-xs">{fact}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <div class="mb-6 h-[1px] w-full bg-outline-variant/20" />
                      <p class="font-mono text-sm text-tertiary">
                        {card.summary.includes("recalls:") ? (
                          <>
                            Claude 3.5 recalls:{" "}
                            <span class="text-indigo-400">
                              "For your white Mercedes, I recommend..."
                            </span>
                          </>
                        ) : (
                          <>
                            GPT-4o detects:{" "}
                            <span class="text-primary">
                              User Ownership → Vehicle: Mercedes (White)
                            </span>
                          </>
                        )}
                      </p>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section class="px-6 py-32">
          <div class="container mx-auto">
            <div class="scroll-reveal mb-20 text-center">
              <h2 class="mb-6 text-4xl font-black md:text-5xl">
                Our Unique <span class="italic text-primary">Edge.</span>
              </h2>
              <p class="mx-auto max-w-xl text-tertiary">
                Engineered for builders who need more than just a place to dump
                text files.
              </p>
            </div>

            <div class="grid grid-cols-1 gap-8 md:grid-cols-3">
              {uniqueEdges.map((item) => (
                <div
                  key={item.title}
                  class="glass-panel scroll-reveal tilt-panel rounded-3xl border-t-2 border-primary/20 p-10"
                  data-tilt
                  style={{
                    transitionDelay: item.delay || undefined,
                  }}
                >
                  <span class="material-symbols-outlined mb-6 text-4xl text-primary">
                    {item.icon}
                  </span>
                  <h4 class="mb-4 text-xl font-bold">{item.title}</h4>
                  <p class="text-sm leading-relaxed text-tertiary">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="tech" class="bg-surface-container-high/40 px-6 py-32">
          <div class="container mx-auto">
            <div class="grid grid-cols-1 items-center gap-20 lg:grid-cols-2">
              <div class="scroll-reveal">
                <h2 class="mb-8 text-4xl font-black leading-tight md:text-5xl">
                  Built for the
                  <br />
                  <span class="italic text-primary">next decade</span> of AI.
                </h2>
                <p class="mb-12 text-lg text-tertiary">
                  We did not just build a wrapper. We built a high-performance
                  memory kernel from the ground up for safety and scale.
                </p>

                <div class="space-y-8">
                  {engineSpecs.map((spec) => (
                    <div key={spec.title} class="flex gap-6">
                      <div class="glass-panel flex h-14 w-14 shrink-0 items-center justify-center rounded-xl">
                        <span class="material-symbols-outlined text-3xl text-primary">
                          {spec.icon}
                        </span>
                      </div>
                      <div>
                        <h4 class="mb-1 text-xl font-bold">{spec.title}</h4>
                        <p class="text-sm leading-relaxed text-tertiary">
                          {spec.body}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div class="scroll-reveal relative">
                <div
                  class="glass-panel group tilt-panel relative aspect-square overflow-hidden rounded-3xl p-1"
                  data-tilt
                >
                  <img
                    class="h-full w-full rounded-2xl object-cover opacity-60 grayscale transition-all duration-1000 group-hover:grayscale-0"
                    src="/next-decade-ai.webp"
                    alt="Close up of abstract circuit board with blue neon highlights"
                    loading="lazy"
                    decoding="async"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
                  <div class="absolute inset-0 flex items-center justify-center">
                    <div class="text-center">
                      <div class="mb-2 text-6xl font-black tracking-tighter text-white">
                        &lt;100ms
                      </div>
                      <div class="font-mono text-sm uppercase tracking-[0.3em] text-primary">
                        Average Recall
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="px-6 py-32">
          <div class="container mx-auto">
            <div class="mb-16 grid grid-cols-1 gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
              <div class="scroll-reveal">
                <h2 class="mb-4 text-sm font-bold uppercase tracking-widest text-primary">
                  Platform Surface
                </h2>
                <h3 class="text-4xl font-black leading-tight md:text-5xl">
                  Built as a complete
                  <br />
                  <span class="italic text-primary">memory stack.</span>
                </h3>
                <p class="mt-6 max-w-2xl text-tertiary">
                  Every layer from ingest semantics to production operations is
                  implemented with one cohesive design system and runtime story.
                </p>

                <div class="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
                  {shippedPillars.map((pillar, index) => (
                    <article
                      key={pillar.title}
                      class="glass-panel scroll-reveal tilt-panel rounded-2xl border border-outline-variant/20 p-6"
                      data-tilt
                      style={{ transitionDelay: `${index * 100}ms` }}
                    >
                      <span class="material-symbols-outlined mb-4 text-3xl text-primary">
                        {pillar.icon}
                      </span>
                      <h4 class="mb-3 text-xl font-bold">{pillar.title}</h4>
                      <p class="mb-5 text-sm leading-relaxed text-tertiary">
                        {pillar.body}
                      </p>
                      <ul class="space-y-2">
                        {pillar.capabilities.map((capability) => (
                          <li
                            key={capability}
                            class="flex items-start gap-2 text-xs text-on-surface/90"
                          >
                            <span class="material-symbols-outlined mt-[1px] text-sm text-primary">
                              check_circle
                            </span>
                            <span>{capability}</span>
                          </li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>
              </div>

              <aside
                class="glass-panel scroll-reveal tilt-panel relative overflow-hidden rounded-3xl border border-primary/20 p-8"
                data-tilt
                style={{ transitionDelay: "180ms" }}
              >
                <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
                <p class="font-mono text-[10px] uppercase tracking-[0.24em] text-primary">
                  Runtime Snapshot
                </p>
                <h4 class="mt-4 text-2xl font-black tracking-tight">
                  Current Build Profile
                </h4>
                <p class="mt-3 text-sm leading-relaxed text-tertiary">
                  Aletheia is shipping as an integrated memory platform, not
                  isolated feature demos.
                </p>
                <pre class="mt-6 overflow-x-auto rounded-xl border border-white/10 bg-surface p-4 font-mono text-xs leading-6 text-secondary">
                  {runtimeSnapshot}
                </pre>
                <div class="mt-5 flex flex-wrap gap-2">
                  <span class="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-primary">
                    production-minded
                  </span>
                  <span class="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-tertiary">
                    local-first
                  </span>
                  <span class="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-tertiary">
                    model-agnostic
                  </span>
                </div>

                <div class="mt-6 rounded-xl border border-outline-variant/20 bg-surface-container-high/40 p-4">
                  <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                    Public Repositories
                  </p>
                  <ul class="mt-3 space-y-2">
                    {publicRepositoryLinks.map((repo) => (
                      <li key={repo.href}>
                        <a
                          href={repo.href}
                          target="_blank"
                          rel="noreferrer"
                          class="flex items-center justify-between rounded-lg border border-white/10 bg-surface/80 px-3 py-2 text-xs text-on-surface transition-colors hover:border-primary/40 hover:bg-surface-container-high"
                        >
                          <span>{repo.label}</span>
                          <span class="material-symbols-outlined text-sm text-primary">
                            open_in_new
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                  <p class="mt-3 text-[11px] text-tertiary">
                    {privateRepositoryNote}
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section class="bg-surface-container-high/35 px-6 py-32">
          <div class="container mx-auto">
            <div class="scroll-reveal mb-14 max-w-3xl">
              <h2 class="mb-4 text-sm font-bold uppercase tracking-widest text-primary">
                Delivery Path
              </h2>
              <h3 class="text-4xl font-black tracking-tight md:text-5xl">
                From prototype to
                <span class="italic text-primary"> production memory.</span>
              </h3>
              <p class="mt-6 text-tertiary">
                The product has a clear progression: ingest fidelity, retrieval
                intelligence, and operational reliability.
              </p>
            </div>

            <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {deliveryTrack.map((step, index) => (
                <article
                  key={step.phase}
                  class="glass-panel scroll-reveal tilt-panel rounded-3xl border border-outline-variant/20 p-8"
                  data-tilt
                  style={{ transitionDelay: `${index * 120}ms` }}
                >
                  <div class="mb-5 flex items-center justify-between">
                    <span class="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
                      {step.phase}
                    </span>
                    <span class="material-symbols-outlined text-2xl text-primary">
                      {step.icon}
                    </span>
                  </div>
                  <h4 class="mb-3 text-2xl font-black tracking-tight">
                    {step.title}
                  </h4>
                  <p class="mb-5 text-sm leading-relaxed text-tertiary">
                    {step.body}
                  </p>
                  <ul class="space-y-2">
                    {step.checkpoints.map((checkpoint) => (
                      <li
                        key={checkpoint}
                        class="flex items-center gap-2 text-xs text-on-surface/90"
                      >
                        <span class="material-symbols-outlined text-sm text-primary">
                          arrow_right_alt
                        </span>
                        <span>{checkpoint}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="calendly" class="px-6 py-24">
          <div class="container mx-auto">
            <div class="glass-panel scroll-reveal rounded-3xl border border-primary/20 p-8 md:p-12">
              <p class="font-mono text-[10px] uppercase tracking-[0.24em] text-primary">
                Book A Session
              </p>
              <h3 class="mt-4 text-4xl font-black tracking-tight md:text-5xl">
                Schedule a 30-minute
                <span class="italic text-primary"> Aletheia walkthrough.</span>
              </h3>
              <p class="mt-4 max-w-2xl text-tertiary">
                Discuss architecture, integration strategy, and production
                rollout for your memory stack.
              </p>
              <div class="mt-8 flex flex-col gap-4 sm:flex-row">
                <a
                  href={CALENDLY_30_MIN_URL}
                  target="_blank"
                  rel="noreferrer"
                  class="obsidian-gradient inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4 text-sm font-black uppercase tracking-[0.16em] text-white shadow-xl shadow-primary/20 transition-transform hover:scale-[1.02]"
                >
                  Open Calendly
                  <span class="material-symbols-outlined text-base">
                    open_in_new
                  </span>
                </a>
                <a
                  href={CONTACT_MAILTO}
                  class="glass-panel inline-flex items-center justify-center rounded-xl px-8 py-4 text-sm font-bold uppercase tracking-[0.16em] text-on-surface transition-colors hover:bg-surface-container-high"
                >
                  Email Instead
                </a>
              </div>
            </div>
          </div>
        </section>

        <section class="px-6 py-32">
          <div class="container mx-auto">
            <div
              id="cta"
              class="glass-panel relative overflow-hidden rounded-[2rem] border-primary/20 p-12 text-center md:p-24"
            >
              <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
              <h2 class="relative z-10 mb-8 text-5xl font-black tracking-tight md:text-7xl">
                UPGRADE TO
                <br />
                <span class="italic text-primary">TRUTH.</span>
              </h2>
              <p class="relative z-10 mx-auto mb-12 max-w-2xl text-xl leading-relaxed text-tertiary">
                Join the next generation of engineers building agents that
                actually understand their users. Start your disclosure today and
                let your AI finally{" "}
                <span class="text-on-surface">remember</span>.
              </p>
              <div class="relative z-10 flex flex-col justify-center gap-6 sm:flex-row">
                <Link
                  href="/login"
                  class="obsidian-gradient rounded-xl px-12 py-5 text-lg font-black uppercase tracking-wider text-white shadow-xl shadow-primary/30 transition-transform hover:scale-105"
                >
                  Initialize Engine
                </Link>
                <a
                  href={CALENDLY_30_MIN_URL}
                  target="_blank"
                  rel="noreferrer"
                  class="glass-panel rounded-xl px-12 py-5 text-lg font-bold uppercase tracking-wider text-on-surface transition-colors hover:bg-surface-container-high"
                >
                  Book a Workshop
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer class="border-t border-outline-variant/10 bg-surface px-8 py-20">
        <div class="container mx-auto grid grid-cols-1 gap-12 md:grid-cols-4">
          <div class="col-span-1 md:col-span-2">
            <span class="mb-6 block text-2xl font-black uppercase tracking-tighter text-on-surface">
              ALETHEIA
            </span>
            <p class="mb-8 max-w-sm text-sm leading-relaxed text-tertiary">
              The persistent memory layer for advanced AI agents. Built for
              humans, powered by Rust, dedicated to the truth.
            </p>
            <p class="mb-6 text-sm text-tertiary">
              Contact:{" "}
              <a href={CONTACT_MAILTO} class="text-primary hover:underline">
                {CONTACT_EMAIL}
              </a>
            </p>
            <div class="flex gap-4">
              <Link
                href="/docs"
                class="glass-panel flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-primary"
              >
                <span class="material-symbols-outlined text-sm">hub</span>
              </Link>
              <Link
                href="/blog"
                class="glass-panel flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-primary"
              >
                <span class="material-symbols-outlined text-sm">
                  edit_square
                </span>
              </Link>
            </div>
          </div>

          <div>
            <h4 class="mb-6 text-sm font-bold uppercase tracking-widest text-primary">
              Platform
            </h4>
            <ul class="space-y-4 text-sm text-tertiary">
              {platformLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    class="transition-colors hover:text-on-surface"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 class="mb-6 text-sm font-bold uppercase tracking-widest text-primary">
              Company
            </h4>
            <ul class="space-y-4 text-sm text-tertiary">
              {companyLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    class="transition-colors hover:text-on-surface"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div class="container mx-auto mt-20 border-t border-outline-variant/5 pt-8 text-center font-mono text-[10px] uppercase tracking-widest text-tertiary/50">
          © 2026 Aletheia Systems. All human memories preserved. Truth
          disclosed.
        </div>
      </footer>
    </div>
  );
});

export const head: DocumentHead = buildSeoHead({
  title: "ALETHEIA | Agents That Remember",
  description:
    "Aletheia is the persistent memory layer for AI agents that need temporal awareness, truth extraction, and continuity across models.",
  pathname: "/",
  keywords: [
    "agent memory",
    "temporal memory",
    "AI memory layer",
    "persistent memory for agents",
    "vector database alternative",
  ],
  styles: [
    {
      key: "landing-template-styles",
      style: landingStyles,
    },
  ],
});
