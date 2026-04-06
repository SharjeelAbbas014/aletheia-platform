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
import { MemoryLattice } from "~/components/MemoryLattice";

import {
  LayersIcon,
  XIcon,
  BotIcon,
  CheckCircleIcon,
  ClockIcon,
  FocusIcon,
  MessageSquareIcon,
  Wand2Icon,
  InfinityIcon,
  RefreshCwIcon,
  ZapIcon,
  CpuIcon,
  PackageIcon,
  GaugeIcon,
  GlobeIcon,
  TerminalIcon,
  UploadIcon,
  NetworkIcon,
  RocketIcon,
  XCircleIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  LogInIcon,
  FilterIcon,
  GitBranchIcon,
  CalculatorIcon,
  HistoryIcon,
  Settings2Icon,
  DatabaseIcon,
  ExternalLinkIcon,
  EditIcon,
} from "lucide-qwik";

const IconMap: Record<string, any> = {
  layers_clear: LayersIcon,
  close: XIcon,
  psychology: BotIcon,
  check_circle: CheckCircleIcon,
  schedule: ClockIcon,
  filter_center_focus: FocusIcon,
  chat_bubble: MessageSquareIcon,
  auto_awesome: Wand2Icon,
  all_inclusive: InfinityIcon,
  published_with_changes: RefreshCwIcon,
  bolt: ZapIcon,
  memory: CpuIcon,
  deployed_code: PackageIcon,
  speed: GaugeIcon,
  travel_explore: GlobeIcon,
  terminal: TerminalIcon,
  upload: UploadIcon,
  hub: NetworkIcon,
  rocket_launch: RocketIcon,
  cancel: XCircleIcon,
  trending_flat: ArrowRightIcon,
  verified: ShieldCheckIcon,
  input: LogInIcon,
  filter_list: FilterIcon,
  rebase_edit: GitBranchIcon,
  calculate: CalculatorIcon,
  history: HistoryIcon,
  arrow_forward: ArrowRightIcon,
  settings_input_component: Settings2Icon,
  database: DatabaseIcon,
  open_in_new: ExternalLinkIcon,
  arrow_right_alt: ArrowRightIcon,
  edit_square: EditIcon,
};

export const MaterialIcon = component$(
  ({ name, class: className }: { name: string; class?: string }) => {
    const IconComponent = IconMap[name] || ZapIcon;
    return <IconComponent class={className} />;
  },
);

const topTenFeatures = [
  {
    title: "Rust-Powered Core",
    body: "Built in Rust completely from ground up for maximum performance.",
  },
  {
    title: "Fact Supersession",
    body: "Newer truths automatically invalidate stale context.",
  },
  {
    title: "Deterministic Aggregation",
    body: "Perfect math and counting queries at the engine level.",
  },
  {
    title: "Predict-Calibrate Profiling",
    body: "Lean context windows through continuous delta-tracking.",
  },
  {
    title: "Neural BERT-NER",
    body: "Local entity extraction for people, orgs, and places.",
  },
  {
    title: "Implicit Preference Detection",
    body: "Autonomous discovery of user likes and habits.",
  },
  {
    title: "Autonomous Knowledge Graph",
    body: "Self-organizing relationship lattice of user history.",
  },
  {
    title: "Hybrid Retrieval Kernel",
    i: "Fuses semantic, lexical, and neural reranking signals.",
  },
  {
    title: "OpenAI-Compatible Proxy",
    body: "Drop-in memory for any existing OpenAI agent.",
  },
  {
    title: "Temporal Decay Policy",
    body: "Smart ranking that respects the arrow of time.",
  },
];

export const SentientCheckbox = component$(({ delay }: { delay: string }) => {
  return (
    <div
      class="relative h-6 w-6 flex-shrink-0"
      style={{ animationDelay: delay }}
    >
      <div
        class="active-glow absolute inset-[-4px] rounded-md bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ animationDelay: delay }}
      />
      <div class="absolute inset-0 rounded-md border-2 border-primary/30 bg-black transition-colors group-hover:border-primary/60" />
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="4"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="animate-check absolute inset-0 text-primary p-0.5"
        style={{ animationDelay: `calc(${delay} + 300ms)` }}
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </div>
  );
});

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

@keyframes pulse-glow {
  0%, 100% { opacity: 0.3; filter: blur(8px); }
  50% { opacity: 0.6; filter: blur(12px); }
}

.landing-v2 .active-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes check-draw {
  from { stroke-dashoffset: 30; }
  to { stroke-dashoffset: 0; }
}

.landing-v2 .animate-check {
  stroke-dasharray: 30;
  stroke-dashoffset: 30;
  animation: check-draw 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}

@keyframes feature-entrance {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.landing-v2 .feature-entrance {
  opacity: 0;
  animation: feature-entrance 0.5s ease-out forwards;
}



@keyframes bar-grow {
  from { transform: scaleY(0); }
  to { transform: scaleY(1); }
}

.landing-v2 .animate-bar {
  transform-origin: bottom;
  animation: bar-grow 1.2s cubic-bezier(0.17, 0.67, 0.83, 0.67) forwards;
}

@keyframes line-draw {
  from { stroke-dashoffset: 100; }
  to { stroke-dashoffset: 0; }
}

.landing-v2 .animate-line {
  stroke-dasharray: 100;
  animation: line-draw 1.5s ease-out forwards;
}

@keyframes fade-in-stale {
  0% { opacity: 0; transform: scale(0.8); }
  100% { opacity: 0.4; transform: scale(1); }
}

.landing-v2 .stale-node {
  animation: fade-in-stale 1s ease-out forwards;
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
        title: "Amnesiac & Static",
        body: "Retrieves conflicting data from 2 years ago exactly like data from 2 minutes ago. No concept of evolving truth.",
        icon: "close",
        iconClass: "text-red-500",
      },
      {
        title: "Fails at Counting",
        body: "Cannot accurately aggregate or count facts (e.g. 'How many cars do I own?'). Relies entirely on the LLM to do math.",
        icon: "close",
        iconClass: "text-red-500",
      },
      {
        title: "Bloated Storage",
        body: "Stores every single conversational 'uh' and 'um' instead of maintaining a clean, structured user profile.",
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
        title: "Fact Supersession (Temporal Truth)",
        body: "When life changes (e.g. moving from NYC to SF), Aletheia marks the old fact as stale, ensuring the LLM always gets the latest truth.",
        icon: "check_circle",
        iconClass: "text-primary",
      },
      {
        title: "Deterministic Aggregation",
        body: "Built-in execution layer accurately computes numeric and temporal queries before hitting the LLM, fixing benchmark failures.",
        icon: "check_circle",
        iconClass: "text-primary",
      },
      {
        title: "Predict-Calibrate Profile",
        body: "Distills thousands of words into compact, continuous user profiles. We track the deltas, you save on context windows.",
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
    title: "Cognitive Extraction",
    icon: "psychology",
    body: "Transform raw text into structured knowledge using integrated Neural and Symbolic extractors.",
    capabilities: [
      "Neural Entity Extraction (BERT-NER)",
      "Autonomous Relationship Discovery",
      "Implicit Preference Detection",
    ],
  },
  {
    title: "Metric Vault",
    icon: "calculate",
    body: "Track and aggregate numeric truth (money, counts, distances) with absolute deterministic precision.",
    capabilities: [
      "Deterministic Regex Extraction",
      "B-Tree range aggregation",
      "Exact Sum/Count Query API",
    ],
  },
  {
    title: "Temporal Truth",
    icon: "schedule",
    body: "The engine models memory as something that changes over time, not a static bag of embeddings.",
    capabilities: [
      "Kind-aware TTL and decay",
      "Fact supersession and invalidation",
      "Graph-based version lineage",
    ],
  },
  {
    title: "Developer Surfaces",
    icon: "terminal",
    body: "SDK and HTTP entry points are designed to keep local-first workflows aligned with hosted deployments.",
    capabilities: [
      "Graph Walking & Analytics APIs",
      "Auth + key lifecycle support",
      "OpenAI-Compatible Proxy Path",
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

const ecosystemItems = [
  {
    title: "OpenAI Proxy",
    body: "An OpenAI-compatible gateway that automatically injects memories into your agent's system prompt. Zero code changes required.",
    icon: "database",
    link: "/docs/memory-proxy",
  },
  {
    title: "Aletheia CLI",
    body: "Unified command-line tool to manage your engine, run local benchmarks, and monitor memory logs in real-time.",
    icon: "terminal",
    link: "/docs/local-engine",
  },
  {
    title: "MCP Server",
    body: "Built-in support for the Model Context Protocol. Connect Aletheia directly to Claude Code, Cursor, and agentic IDEs.",
    icon: "hub",
    link: "/docs",
  },
];

export default component$(() => {
  const pageRef = useSignal<HTMLElement>();
  const heroMessage = useSignal(
    "I moved to Tokyo and I still prefer jasmine tea over coffee.",
  );
  const heroDemoResult = useSignal<HeroDemoResult | null>(null);
  const heroWarmupResult = useSignal<HeroWarmupResult | null>(null);
  const heroDemoRunning = useSignal(false);
  const heroWarmupRunning = useSignal(false);
  const heroDemoMode = useSignal<"store" | "recall" | null>(null);

  const readJsonResponse = $(
    async (
      response: Response,
      fallbackPrefix: string,
    ): Promise<HeroWarmupResult | HeroDemoResult> => {
      const raw = await response.text();
      try {
        return JSON.parse(raw) as HeroWarmupResult | HeroDemoResult;
      } catch {
        return {
          ok: false,
          message: `${fallbackPrefix} ${raw.trim() || response.statusText}`,
        };
      }
    },
  );

  const runHeroWarmup = $(async () => {
    heroWarmupRunning.value = true;
    heroWarmupResult.value = null;

    try {
      const response = await fetch("/api/hero/warmup", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
      });
      heroWarmupResult.value = (await readJsonResponse(
        response,
        "Warm-up failed.",
      )) as HeroWarmupResult;
    } catch (error) {
      heroWarmupResult.value = {
        ok: false,
        message:
          error instanceof Error
            ? `Warm-up transport failed. ${error.message}`
            : "Warm-up transport failed.",
      };
    } finally {
      heroWarmupRunning.value = false;
    }
  });

  const runHeroDemo = $(async (action: "store" | "recall") => {
    const message = heroMessage.value.trim();
    if (!message) {
      heroDemoResult.value = {
        ok: false,
        action,
        message:
          action === "store"
            ? "Enter a user message so the engine has something real to save."
            : "Enter a query to recall memories for this demo user.",
      };
      return;
    }

    heroDemoRunning.value = true;
    heroDemoMode.value = action;

    try {
      const response = await fetch("/api/hero/demo", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          action,
          message,
        }),
      });
      const nextResult = (await readJsonResponse(
        response,
        "Demo failed.",
      )) as HeroDemoResult;
      heroDemoResult.value = nextResult.ok
        ? {
            ...(heroDemoResult.value ?? {}),
            ...nextResult,
            message: undefined,
          }
        : {
            ...(heroDemoResult.value ?? {}),
            ...nextResult,
          };
    } catch (error) {
      heroDemoResult.value = {
        ok: false,
        action,
        message:
          error instanceof Error
            ? `Demo transport failed. ${error.message}`
            : "Demo transport failed.",
      };
    } finally {
      heroDemoRunning.value = false;
      heroDemoMode.value = null;
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

          <div class="container mx-auto relative z-10 grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div class="animate-fade-in-up">
              <div class="mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-300/35 bg-emerald-400/10 px-4 py-1.5">
                <span class="relative inline-flex h-2.5 w-2.5">
                  <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
                  <span class="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.95)]" />
                </span>
                <span class="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-300">
                  The Sentient Monolith
                </span>
              </div>

              <h1 class="mb-8 text-6xl font-black leading-[0.95] tracking-tight md:text-8xl text-white">
                AGENTS <br />
                THAT{" "}
                <span class="italic text-[#7df9ff] [text-shadow:0_0_16px_rgba(125,249,255,0.45)]">
                  REMEMBER.
                </span>
              </h1>

              <p class="mb-10 max-w-xl text-xl leading-relaxed text-tertiary">
                Stop treating every chat like a first date. Aletheia gives your
                AI a persistent, evolving brain that learns who your users are
                one interaction at a time.
              </p>

              <div class="flex flex-wrap gap-5">
                <Link
                  href="/signup"
                  class="obsidian-gradient flex items-center gap-3 rounded-xl px-10 py-5 text-lg font-bold text-white transition-all hover:shadow-[0_0_40px_rgba(99,102,241,0.4)] active:scale-95"
                >
                  Truth Disclosed
                  <MaterialIcon name="bolt" class="" />
                </Link>
                <Link
                  href="/login"
                  class="glass-panel rounded-xl px-10 py-5 text-lg font-bold text-on-surface transition-all hover:bg-surface-container-high active:scale-95"
                >
                  Mission Control
                </Link>
              </div>
            </div>

            <div class="relative glass-panel rounded-[2.5rem] border border-primary/20 p-8 md:p-12 shadow-2xl bg-black/40 backdrop-blur-xl group/container">
              <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.05),transparent_70%)]" />
              <div class="relative z-10 mb-10 flex items-center justify-between">
                <div>
                  <h2 class="text-xs font-black uppercase tracking-[0.3em] text-primary">
                    Engine Capabilities
                  </h2>
                  <p class="text-[10px] text-tertiary mt-1">
                    Autonomous cognitive primitives established.
                  </p>
                </div>
                <div class="flex gap-1">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      class="h-1 w-4 bg-primary/20 rounded-full animate-pulse"
                      style={{ animationDelay: `${i * 200}ms` }}
                    />
                  ))}
                </div>
              </div>
              <div class="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-8">
                {topTenFeatures.map((f, i) => (
                  <div
                    key={f.title}
                    class="feature-entrance flex gap-4 group/item"
                    style={{ animationDelay: `${i * 400}ms` }}
                  >
                    <SentientCheckbox delay={`${i * 400}ms`} />
                    <div class="flex flex-col">
                      <span class="text-[13px] font-black text-white group-hover/item:text-primary transition-colors tracking-tight uppercase">
                        {f.title}
                      </span>
                      <p class="text-[10px] text-tertiary/80 leading-snug mt-1 group-hover/item:text-tertiary transition-colors">
                        {f.body || (f as any).i}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1 rounded-full border border-white/5 bg-white/5 backdrop-blur-md mt-2">
                <div class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span class="text-[9px] font-mono text-tertiary uppercase tracking-widest flex items-center justify-center">
                  <a href="/docs" class="">
                    Learn how are we doing it
                  </a>
                </span>
              </div>
            </div>
          </div>
        </section>

        <section
          id="interactive-tester"
          class="px-6 py-32 bg-surface-container-low/5 border-t border-outline-variant/10"
        >
          <div class="container mx-auto">
            <div class="scroll-reveal mb-20 text-center">
              <h2 class="mb-4 text-sm font-bold uppercase tracking-widest text-primary">
                Interactive Demo
              </h2>
              <h3 class="text-4xl font-black tracking-tight md:text-5xl">
                Live Memory <span class="italic text-primary">Simulation.</span>
              </h3>
              <p class="mt-6 mx-auto max-w-2xl text-tertiary">
                Experience Aletheia's real-time ingestion and recall loop. Store
                a fact, then retrieve it across model contexts.
              </p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Left Side: Store/Warmup */}
              <div class="glass-panel relative rounded-[2rem] border border-outline-variant/10 p-8 shadow-xl overflow-hidden">
                <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.05),transparent_50%)]" />
                <div class="relative z-10 space-y-8">
                  <div class="flex items-center gap-4 border-b border-outline-variant/10 pb-6">
                    <div class="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                      <MaterialIcon name="input" class=" text-2xl" />
                    </div>
                    <div>
                      <h4 class="text-xl font-bold">Input & Warm-up</h4>
                      <p class="text-[10px] uppercase font-black tracking-widest text-tertiary">
                        Ingestion Layer
                      </p>
                    </div>
                  </div>

                  <div class="rounded-[1.5rem] border border-white/5 bg-black/20 p-6">
                    <p class="text-[10px] font-bold uppercase tracking-[0.24em] text-tertiary mb-4">
                      Serverless Pulse
                    </p>
                    <p class="text-sm leading-relaxed text-on-surface mb-6">
                      Ping the engine to reduce cold-start latency before
                      testing the demo.
                    </p>
                    <button
                      type="button"
                      class="glass-panel inline-flex items-center gap-3 rounded-2xl px-6 py-3 text-sm font-bold text-on-surface transition-all hover:bg-surface-container-high active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={heroWarmupRunning.value}
                      onClick$={runHeroWarmup}
                    >
                      {heroWarmupRunning.value
                        ? "Warming..."
                        : "Warm Up Engine"}
                      <MaterialIcon name="bolt" class=" text-base" />
                    </button>
                  </div>

                  <div class="space-y-4">
                    <label class="block text-[11px] font-bold uppercase tracking-[0.22em] text-tertiary">
                      Message to Persist
                    </label>
                    <textarea
                      class="min-h-[140px] w-full rounded-[1.5rem] border border-white/10 bg-black/25 px-5 py-4 text-base text-on-surface outline-none transition-colors placeholder:text-tertiary/55 focus:border-primary/60 shadow-inner"
                      placeholder="I moved to Tokyo and I still prefer jasmine tea over coffee."
                      value={heroMessage.value}
                      onInput$={(_, currentTarget) => {
                        heroMessage.value = currentTarget.value;
                      }}
                      required
                    />
                    <button
                      type="button"
                      class="obsidian-gradient w-full inline-flex items-center justify-center gap-3 rounded-2xl py-4 text-sm font-bold text-white transition-all hover:shadow-[0_0_32px_rgba(99,102,241,0.35)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 shadow-xl"
                      disabled={heroDemoRunning.value}
                      onClick$={() => runHeroDemo("store")}
                    >
                      {heroDemoRunning.value && heroDemoMode.value === "store"
                        ? "Processing..."
                        : "Commit to Long-Term Memory"}
                      <MaterialIcon
                        name="published_with_changes"
                        class=" text-lg"
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Side: Recall & Results */}
              <div class="space-y-8">
                <div class="glass-panel relative rounded-[2rem] border border-primary/20 p-8 shadow-xl overflow-hidden bg-primary/5">
                  <div class="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.1),transparent_50%)]" />
                  <div class="relative z-10 space-y-6">
                    <div class="flex items-center gap-4 border-b border-primary/10 pb-6">
                      <div class="h-12 w-12 rounded-2xl obsidian-gradient flex items-center justify-center text-white shadow-xl">
                        <MaterialIcon name="travel_explore" class=" text-2xl" />
                      </div>
                      <div>
                        <h4 class="text-xl font-bold text-white">
                          Truth Recall
                        </h4>
                        <p class="text-[10px] uppercase font-black tracking-widest text-primary">
                          Retrieval Kernel
                        </p>
                      </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                      <div class="rounded-2xl border border-white/5 bg-black/20 p-4">
                        <p class="text-[9px] font-bold uppercase tracking-widest text-tertiary">
                          Ingest Latency
                        </p>
                        <p class="mt-1 text-xl font-black text-on-surface">
                          {heroDemoResult.value?.ingestLabel ?? "---"}
                        </p>
                      </div>
                      <div class="rounded-2xl border border-white/5 bg-black/20 p-4 border-primary/20">
                        <p class="text-[9px] font-bold uppercase tracking-widest text-primary">
                          Query Latency
                        </p>
                        <p class="mt-1 text-xl font-black text-white">
                          {heroDemoResult.value?.queryLabel ?? "---"}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      class="glass-panel w-full inline-flex items-center justify-center gap-3 rounded-2xl py-4 text-sm font-bold text-on-surface transition-all hover:bg-surface-container-high active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 border border-white/10"
                      disabled={heroDemoRunning.value}
                      onClick$={() => runHeroDemo("recall")}
                    >
                      {heroDemoRunning.value && heroDemoMode.value === "recall"
                        ? "Retrieving..."
                        : "Query Memory Surface"}
                      <MaterialIcon name="speed" class=" text-lg" />
                    </button>

                    <div class="rounded-2xl border border-white/10 bg-black/40 p-5 shadow-inner">
                      <div class="flex items-center justify-between mb-4">
                        <p class="text-[10px] font-bold uppercase tracking-widest text-tertiary">
                          Retrieved Memory Hits
                        </p>
                        {heroDemoResult.value?.memoryId && (
                          <span class="px-2 py-1 rounded bg-primary/20 text-[9px] font-mono text-primary border border-primary/20">
                            {heroDemoResult.value.entityId}
                          </span>
                        )}
                      </div>
                      <div class="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                        {heroDemoResult.value?.ok &&
                        heroDemoResult.value.hits &&
                        heroDemoResult.value.hits.length > 0 ? (
                          heroDemoResult.value.hits.map((hit, idx) => (
                            <div
                              key={idx}
                              class="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-tertiary leading-relaxed animate-fade-in"
                            >
                              {hit.textual_content}
                            </div>
                          ))
                        ) : (
                          <p class="text-xs text-tertiary italic text-center py-8">
                            No memories retrieved yet. Ingest a fact first.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {heroDemoResult.value?.queryUnderBlink && (
                  <div class="feature-entrance rounded-[1.5rem] border border-cyan-300/25 bg-cyan-400/5 p-6 flex items-start gap-4 shadow-lg shadow-cyan-500/5">
                    <MaterialIcon name="verified" class=" text-cyan-400 mt-1" />
                    <div>
                      <h5 class="text-sm font-bold text-white">
                        Sub-100ms Verified
                      </h5>
                      <p class="text-xs text-tertiary mt-1">
                        This recall session operated faster than a human blink
                        at the engine layer.
                      </p>
                    </div>
                  </div>
                )}
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
                      <MaterialIcon
                        name={card.icon}
                        class={`${card.iconClass}`.trim()}
                      />
                    </div>
                    <h4 class="text-xl font-bold">{card.title}</h4>
                  </div>

                  <ul class="space-y-6">
                    {card.items.map((item) => (
                      <li key={item.title} class="flex gap-4">
                        <MaterialIcon
                          name={item.icon}
                          class={`shrink-0 ${item.iconClass}`.trim()}
                        />
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

            <div class="mt-24 grid grid-cols-1 gap-12 lg:grid-cols-2">
              <div class="glass-panel scroll-reveal rounded-3xl p-10 border-primary/20">
                <h4 class="mb-8 text-xl font-black tracking-tight">
                  Recall Precision Benchmarks
                </h4>
                <div class="flex items-end gap-10 h-64 border-b border-outline-variant/20 pb-2 px-4 relative">
                  <div class="absolute left-0 top-0 h-full w-px bg-outline-variant/10 flex flex-col justify-between text-[10px] text-tertiary pr-2 -translate-x-full">
                    <span>100%</span>
                    <span>75%</span>
                    <span>50%</span>
                    <span>25%</span>
                    <span>0%</span>
                  </div>
                  <div class="flex-1 h-full flex flex-col justify-end items-center gap-4">
                    <div
                      class="w-full bg-surface-container-highest rounded-t-lg relative overflow-hidden"
                      style="height: 68%;"
                    >
                      <div class="absolute inset-0 bg-red-500/30 rounded-t-lg transition-all animate-bar" />
                      <span class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-red-400 z-10">
                        68%
                      </span>
                    </div>
                    <span class="text-[10px] uppercase font-bold tracking-widest text-tertiary">
                      Standard RAG
                    </span>
                  </div>
                  <div class="flex-1 h-full flex flex-col justify-end items-center gap-4">
                    <div
                      class="w-full bg-surface-container-highest rounded-t-lg relative overflow-hidden"
                      style="height: 95.4%;"
                    >
                      <div class="absolute inset-0 obsidian-gradient rounded-t-lg transition-all animate-bar shadow-[0_0_20px_rgba(99,102,241,0.5)]" />
                      <span class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-primary z-10">
                        95%+
                      </span>
                    </div>
                    <span class="text-[10px] uppercase font-bold tracking-widest text-primary">
                      Aletheia (Target)
                    </span>
                  </div>
                </div>
                <p class="mt-8 text-xs leading-relaxed text-tertiary">
                  Aletheia is architected to resolve the fundamental recall
                  failures of standard vector databases. Preliminary benchmarks
                  on LongMemEval-S indicate significant improvements in handling
                  numeric and temporal aggregation tasks.
                </p>
              </div>

              <div class="glass-panel scroll-reveal rounded-3xl p-10 border-primary/20">
                <h4 class="mb-8 text-xl font-black tracking-tight">
                  Temporal Fact Evolution
                </h4>
                <div class="relative py-12 px-8">
                  <div class="absolute left-0 top-1/2 h-0.5 w-full bg-outline-variant/20 -translate-y-1/2 z-0" />
                  <div class="relative z-10 flex justify-between items-center h-24">
                    <div class="flex flex-col items-center gap-3">
                      <div class="h-10 w-10 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center stale-node">
                        <MaterialIcon
                          name="cancel"
                          class=" text-sm text-red-400"
                        />
                      </div>
                      <div class="text-center">
                        <span class="block text-[10px] uppercase tracking-widest text-tertiary font-bold">
                          2025
                        </span>
                        <span class="block text-[10px] text-red-400/60 line-through">
                          "Living in NYC"
                        </span>
                      </div>
                    </div>

                    <div class="flex h-10 w-10 items-center justify-center">
                      <MaterialIcon
                        name="trending_flat"
                        class=" text-primary animate-pulse"
                      />
                    </div>

                    <div class="flex flex-col items-center gap-3">
                      <div class="h-10 w-10 rounded-full obsidian-gradient shadow-[0_0_15px_rgba(99,102,241,0.4)] flex items-center justify-center">
                        <MaterialIcon
                          name="verified"
                          class=" text-sm text-white"
                        />
                      </div>
                      <div class="text-center">
                        <span class="block text-[10px] uppercase tracking-widest text-primary font-bold">
                          Today
                        </span>
                        <span class="block text-[10px] font-bold text-white">
                          "Moving to SF"
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 text-center p-2 rounded-lg bg-primary/10 border border-primary/20">
                    <span class="text-[9px] uppercase tracking-[0.2em] text-primary font-black">
                      Fact Supersession Triggered
                    </span>
                  </div>
                </div>
                <p class="mt-8 text-xs leading-relaxed text-tertiary">
                  Aletheia tracks the evolution of truth. When new facts arrive,
                  old ones are superseded, preventing stale data from leaking
                  into your agent's current worldview.
                </p>
              </div>
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
                        <MaterialIcon name={item.icon} class=" text-primary" />
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
                    <MaterialIcon
                      name="arrow_forward"
                      class=" animate-pulse text-primary"
                    />
                    <div class="rounded-full border border-primary/40 bg-primary/20 px-4 py-2 text-[10px] font-bold uppercase tracking-widest">
                      Raw Chat
                    </div>
                  </div>

                  <div class="flex w-full flex-col items-center border-y border-outline-variant/20 py-8">
                    <div class="obsidian-gradient mb-4 flex h-20 w-20 items-center justify-center rounded-2xl shadow-[0_0_30px_rgba(99,102,241,0.5)]">
                      <MaterialIcon
                        name="settings_input_component"
                        class=" text-4xl text-white"
                      />
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
                      <MaterialIcon
                        name="verified"
                        class=" text-sm text-green-400"
                      />
                      <span class="font-mono text-xs">
                        Semantic Fact: User owns White Mercedes
                      </span>
                    </div>
                    <div class="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3 opacity-60">
                      <MaterialIcon
                        name="database"
                        class=" text-sm text-primary"
                      />
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
                    <MaterialIcon
                      name={card.icon}
                      class={`${card.iconClass}`.trim()}
                    />
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
                          <MaterialIcon
                            name="check_circle"
                            class=" text-sm text-green-400"
                          />
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
                  <MaterialIcon
                    name={item.icon}
                    class=" mb-6 text-4xl text-primary"
                  />
                  <h4 class="mb-4 text-xl font-bold">{item.title}</h4>
                  <p class="text-sm leading-relaxed text-tertiary">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="architecture"
          class="bg-surface-container-high/10 px-6 py-32 border-t border-outline-variant/10"
        >
          <div class="container mx-auto">
            <div class="scroll-reveal mb-20 text-center">
              <h2 class="mb-4 text-sm font-bold uppercase tracking-widest text-primary">
                The Architecture of Truth
              </h2>
              <h3 class="text-4xl font-black tracking-tight md:text-5xl">
                Sentient Memory{" "}
                <span class="italic text-primary">Pipeline.</span>
              </h3>
              <p class="mt-6 mx-auto max-w-2xl text-tertiary">
                Aletheia is not just storage; it is a multi-stage cognitive
                processor that transforms raw noise into reliable agentic state.
              </p>
            </div>

            <div class="relative glass-panel rounded-[2.5rem] border border-primary/20 p-8 md:p-16 overflow-hidden">
              <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05),transparent_70%)]" />

              <div class="relative z-10 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                <div class="flex flex-col items-center text-center gap-4">
                  <div class="h-16 w-16 rounded-2xl bg-surface-container-highest flex items-center justify-center border border-outline-variant/20 shadow-xl">
                    <MaterialIcon
                      name="input"
                      class=" text-3xl text-tertiary"
                    />
                  </div>
                  <div>
                    <span class="block text-sm font-black">Ingest</span>
                    <span class="block text-[10px] uppercase tracking-widest text-tertiary font-bold mt-1">
                      Raw Events
                    </span>
                  </div>
                </div>

                <div class="hidden md:flex justify-center">
                  <svg
                    width="40"
                    height="20"
                    viewBox="0 0 40 20"
                    fill="none"
                    class="text-primary/40"
                  >
                    <path
                      d="M0 10H38M38 10L30 2M38 10L30 18"
                      stroke="currentColor"
                      stroke-width="2"
                      class="animate-line"
                    />
                  </svg>
                </div>

                <div class="flex flex-col items-center text-center gap-4 p-6 rounded-3xl bg-primary/10 border border-primary/30 shadow-[0_0_40px_rgba(99,102,241,0.1)]">
                  <div class="h-16 w-16 rounded-2xl obsidian-gradient flex items-center justify-center shadow-xl">
                    <MaterialIcon
                      name="psychology"
                      class=" text-3xl text-white"
                    />
                  </div>
                  <div>
                    <span class="block text-sm font-black">
                      Distill & Store
                    </span>
                    <span class="block text-[10px] uppercase tracking-widest text-primary font-black mt-1">
                      Cognitive Controller
                    </span>
                  </div>
                  <div class="mt-2 flex flex-wrap justify-center gap-1">
                    <span class="text-[8px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                      HNSW
                    </span>
                    <span class="text-[8px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                      BM25
                    </span>
                    <span class="text-[8px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                      GRAPH
                    </span>
                  </div>
                </div>

                <div class="hidden md:flex justify-center">
                  <svg
                    width="40"
                    height="20"
                    viewBox="0 0 40 20"
                    fill="none"
                    class="text-primary/40"
                  >
                    <path
                      d="M0 10H38M38 10L30 2M38 10L30 18"
                      stroke="currentColor"
                      stroke-width="2"
                      class="animate-line"
                    />
                  </svg>
                </div>

                <div class="flex flex-col items-center text-center gap-4">
                  <div class="h-16 w-16 rounded-2xl bg-surface-container-highest flex items-center justify-center border border-outline-variant/20 shadow-xl">
                    <MaterialIcon
                      name="verified"
                      class=" text-3xl text-primary"
                    />
                  </div>
                  <div>
                    <span class="block text-sm font-black">Final Truth</span>
                    <span class="block text-[10px] uppercase tracking-widest text-tertiary font-bold mt-1">
                      Grounded Context
                    </span>
                  </div>
                </div>
              </div>

              <div class="mt-16 pt-16 border-t border-outline-variant/10 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div class="flex gap-4">
                  <MaterialIcon name="filter_list" class=" text-primary" />
                  <div>
                    <h5 class="font-bold text-sm">Intent-Aware Filtering</h5>
                    <p class="text-xs text-tertiary mt-2">
                      Automatically detects if the user is asking for numbers,
                      preferences, or narrative history.
                    </p>
                  </div>
                </div>
                <div class="flex gap-4">
                  <MaterialIcon name="rebase_edit" class=" text-primary" />
                  <div>
                    <h5 class="font-bold text-sm">Neural Reranking</h5>
                    <p class="text-xs text-tertiary mt-2">
                      Applies a secondary precision pass to ensure the top-k
                      candidates are semantically perfect.
                    </p>
                  </div>
                </div>
                <div class="flex gap-4">
                  <MaterialIcon name="calculate" class=" text-primary" />
                  <div>
                    <h5 class="font-bold text-sm">Deterministic Compute</h5>
                    <p class="text-xs text-tertiary mt-2">
                      Computes aggregates (sums, counts) before delivery,
                      preventing LLM arithmetic errors.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="lattice" class="px-6 py-32 bg-black">
          <div class="container mx-auto">
            <div class="scroll-reveal mb-20">
              <h2 class="mb-4 text-sm font-bold uppercase tracking-widest text-primary">
                Interactive Graph
              </h2>
              <h3 class="text-4xl font-black tracking-tight md:text-5xl">
                Sentient{" "}
                <span class="italic text-primary">Memory Lattice.</span>
              </h3>
              <p class="mt-6 max-w-2xl text-tertiary">
                Experience how Aletheia organizes memories. Drag nodes to
                interact with the underlying graph logic where new facts
                supersede the old.
              </p>
            </div>

            <div class="glass-panel relative rounded-[3rem] border border-primary/20 bg-surface-container-low/20 overflow-hidden">
              <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.08),transparent_50%)]" />
              <MemoryLattice />
            </div>

            <div class="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-tertiary">
              <div class="flex gap-4 p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
                <MaterialIcon name="hub" class=" text-primary" />
                <p>
                  Nodes represent discrete semantic facts, preferences, and
                  entities stored within the Rust engine.
                </p>
              </div>
              <div class="flex gap-4 p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
                <MaterialIcon name="history" class=" text-red-400" />
                <p>
                  Red nodes indicate **superseded memories**—stale data that has
                  been automatically invalidated by more recent truths.
                </p>
              </div>
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
                        <MaterialIcon
                          name={spec.icon}
                          class=" text-3xl text-primary"
                        />
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
                      <MaterialIcon
                        name={pillar.icon}
                        class=" mb-4 text-3xl text-primary"
                      />
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
                            <MaterialIcon
                              name="check_circle"
                              class=" mt-[1px] text-sm text-primary"
                            />
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
                          <MaterialIcon
                            name="open_in_new"
                            class=" text-sm text-primary"
                          />
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
                    <MaterialIcon
                      name={step.icon}
                      class=" text-2xl text-primary"
                    />
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
                        <MaterialIcon
                          name="arrow_right_alt"
                          class=" text-sm text-primary"
                        />
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
                  <MaterialIcon name="open_in_new" class=" text-base" />
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
                  href="/signup"
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
        <section
          id="ecosystem"
          class="px-6 py-32 bg-surface-container-low/10 border-t border-outline-variant/10"
        >
          <div class="container mx-auto">
            <div class="scroll-reveal mb-20 text-center">
              <h2 class="mb-4 text-sm font-bold uppercase tracking-widest text-primary">
                The Aletheia Ecosystem
              </h2>
              <h3 class="text-4xl font-black tracking-tight md:text-5xl">
                Integrate Memory{" "}
                <span class="italic text-primary">Anywhere.</span>
              </h3>
              <p class="mt-6 mx-auto max-w-2xl text-tertiary">
                We provide the tooling to make persistent memory a first-class
                citizen in your development workflow, from local testing to
                global scale.
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
              {ecosystemItems.map((item) => (
                <Link
                  key={item.title}
                  href={item.link}
                  class="glass-panel group rounded-[2rem] border border-outline-variant/10 p-10 transition-all hover:border-primary/40 hover:bg-primary/5 shadow-xl hover:shadow-primary/10"
                >
                  <div class="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-container-highest transition-transform group-hover:scale-110 shadow-lg">
                    <MaterialIcon
                      name={item.icon}
                      class=" text-2xl text-primary"
                    />
                  </div>
                  <h4 class="mb-4 text-xl font-bold">{item.title}</h4>
                  <p class="mb-8 text-sm leading-relaxed text-tertiary">
                    {item.body}
                  </p>
                  <div class="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    Explore Docs
                    <MaterialIcon name="arrow_forward" class=" text-sm" />
                  </div>
                </Link>
              ))}
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
                <MaterialIcon name="hub" class=" text-sm" />
              </Link>
              <Link
                href="/blog"
                class="glass-panel flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-primary"
              >
                <MaterialIcon name="edit_square" class=" text-sm" />
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
