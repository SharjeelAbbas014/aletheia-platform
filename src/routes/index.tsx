import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { Link, type DocumentHead } from "@builder.io/qwik-city";

const tailwindConfigScript = `
tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        surface: "#0a0a0b",
        "surface-container": "#141417",
        "surface-container-high": "#1c1c21",
        primary: "#6366f1",
        secondary: "#818cf8",
        tertiary: "#94a3b8",
        "on-surface": "#f8fafc",
        "outline-variant": "#2d2d35"
      },
      fontFamily: {
        headline: ["Inter"],
        body: ["Inter"],
        mono: ["JetBrains Mono"]
      },
      borderRadius: {
        DEFAULT: "0.375rem",
        lg: "0.5rem",
        xl: "1rem",
        full: "9999px"
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "fade-in-up": "fadeInUp 0.8s ease-out forwards",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "flow-line": "flowLine 3s linear infinite"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" }
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        flowLine: {
          "0%": { strokeDashoffset: "100" },
          "100%": { strokeDashoffset: "0" }
        }
      }
    }
  }
};
`;

const landingStyles = `
.landing-v2 {
  background: #0a0a0b;
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
        body:
          "Retrieves data from 2 years ago exactly like data from 2 minutes ago.",
        icon: "close",
        iconClass: "text-red-500"
      },
      {
        title: "Context Blind",
        body:
          "Simply matches keywords. It does not know the difference between a wish and a fact.",
        icon: "close",
        iconClass: "text-red-500"
      },
      {
        title: "Bloated Storage",
        body:
          "Stores every uh and um instead of the core truth of the conversation.",
        icon: "close",
        iconClass: "text-red-500"
      }
    ]
  },
  {
    title: "Aletheia Memory Engine",
    icon: "psychology",
    iconWrapClass: "bg-primary/20",
    iconClass: "text-primary",
    panelClass:
      "border-primary/40 shadow-[0_0_50px_rgba(99,102,241,0.1)]",
    items: [
      {
        title: "Temporal Awareness",
        body:
          "Understands the arrow of time. Newer facts naturally supersede obsolete ones.",
        icon: "check_circle",
        iconClass: "text-primary"
      },
      {
        title: "Truth Extraction",
        body:
          "Distills 1,000 words into 3 verified semantic facts. Efficiency by design.",
        icon: "check_circle",
        iconClass: "text-primary"
      },
      {
        title: "Active Reasoning",
        body:
          "Connects the dots between conversations to build a coherent world-view.",
        icon: "check_circle",
        iconClass: "text-primary"
      }
    ]
  }
];

const distillationDetails = [
  {
    icon: "schedule",
    title: "Time-Awareness",
    body:
      "I used to love coffee, but now I only drink tea. Aletheia does not hallucinate your old preferences. It updates your profile in real time."
  },
  {
    icon: "filter_center_focus",
    title: "Fact Distillation",
    body:
      "Our engine automatically discards greetings and filler, keeping only the high-value semantic facts that actually matter for personalization."
  }
];

const userFlowCards = [
  {
    date: "The First Spark (May 12)",
    quote: "Hey! I just bought a white Mercedes! What should I do first?",
    summary:
      "GPT-4o detects: User Ownership → Vehicle: Mercedes (White)",
    icon: "chat_bubble",
    iconWrapClass: "bg-primary/20",
    iconClass: "text-primary",
    borderClass: "border-l-4 border-l-primary/30",
    delay: ""
  },
  {
    date: "Aletheia Ingests",
    quote: "Fact Integration",
    summary: "",
    icon: "psychology",
    iconWrapClass: "bg-primary",
    iconClass: "text-white",
    borderClass:
      "border-primary/40 shadow-[0_20px_40px_rgba(0,0,0,0.3)]",
    delay: "150ms",
    facts: ["Fact: Owns Mercedes", "Context: Initial Purchase"]
  },
  {
    date: "3 Months Later (Aug 20)",
    quote: "What was that maintenance tip for my car?",
    summary:
      'Claude 3.5 recalls: "For your white Mercedes, I recommend..."',
    icon: "auto_awesome",
    iconWrapClass: "bg-indigo-500/20",
    iconClass: "text-indigo-400",
    borderClass: "border-l-4 border-l-indigo-400/30",
    delay: "300ms"
  }
];

const uniqueEdges = [
  {
    icon: "all_inclusive",
    title: "Multi-Model Continuity",
    body:
      "Memory that follows the user, not the model. Switch from GPT-4 to Claude to Llama and Aletheia keeps the brain intact across every integration.",
    delay: ""
  },
  {
    icon: "published_with_changes",
    title: "Fact Supersession",
    body:
      "When life changes, Aletheia knows. If a user moves from NYC to LA, the old fact is marked as superseded so stale context stops leaking into answers.",
    delay: "150ms"
  },
  {
    icon: "bolt",
    title: "Zero-Config Performance",
    body:
      "Built with Rust as a single compiled binary. Deployment is fast and recall latency stays in the sub-10ms range without orchestration drama.",
    delay: "300ms"
  }
];

const engineSpecs = [
  {
    icon: "memory",
    title: "Coded in Rust",
    body:
      "Ultimate memory safety and blazing-fast execution. No garbage collection pauses, just low-level performance where it matters."
  },
  {
    icon: "deployed_code",
    title: "Single Binary Deployment",
    body:
      "No complex Docker chains. One file, zero configuration, instant memory synchronization across your stack."
  },
  {
    icon: "speed",
    title: "Sub-10ms Latency",
    body:
      "Human-like recall speeds that keep up with your fastest LLM workflows without turning memory into the bottleneck."
  }
];

const platformLinks = [
  { label: "Memory Lattice", href: "/#memory" },
  { label: "Vector Store", href: "/docs/local-engine" },
  { label: "Rust SDK", href: "/docs/quickstart" },
  { label: "Integrations", href: "/docs/api-auth" }
];

const companyLinks = [
  { label: "Privacy First", href: "/docs/security" },
  { label: "Security Audit", href: "/docs/security" },
  { label: "Open Source", href: "/docs" },
  { label: "Contact", href: "/login" }
];

export default component$(() => {
  const pageRef = useSignal<HTMLElement>();

  useVisibleTask$(({ cleanup }) => {
    const root = pageRef.value;

    if (!root) {
      return;
    }

    const revealItems = Array.from(
      root.querySelectorAll<HTMLElement>(".scroll-reveal")
    );
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      revealItems.forEach((item) => item.classList.add("visible"));
      return;
    }

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
        rootMargin: "0px 0px -50px 0px"
      }
    );

    revealItems.forEach((item) => observer.observe(item));

    cleanup(() => {
      observer.disconnect();
    });
  });

  return (
    <div ref={pageRef} class="landing-v2 bg-surface text-on-surface font-body">
      <header class="fixed top-0 z-50 flex h-20 w-full items-center justify-between border-b border-outline-variant/10 bg-surface/80 px-8 backdrop-blur-md">
        <div class="flex items-center gap-12">
          <Link
            href="/"
            class="font-headline text-2xl font-black uppercase tracking-tighter text-on-surface"
          >
            ALETHEIA
          </Link>
          <nav class="hidden items-center gap-8 md:flex">
            <a
              class="text-sm font-medium text-on-surface/90 transition-colors hover:text-primary"
              href="#memory"
            >
              Memory Lattice
            </a>
            <a
              class="text-sm font-medium text-on-surface/60 transition-colors hover:text-on-surface"
              href="#tech"
            >
              The Engine
            </a>
            <Link
              class="text-sm font-medium text-on-surface/60 transition-colors hover:text-on-surface"
              href="/docs/security"
            >
              Truth Registry
            </Link>
          </nav>
        </div>

        <div class="flex items-center gap-6">
          <Link
            href="/login"
            class="hidden text-sm font-semibold transition-colors hover:text-primary sm:block"
          >
            Login
          </Link>
          <Link
            href="/login"
            class="obsidian-gradient rounded-full px-5 py-2.5 text-sm font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105"
          >
            Start Free
          </Link>
        </div>
      </header>

      <main class="pt-20">
        <section class="relative flex min-h-[95vh] items-center overflow-hidden px-6">
          <div class="absolute inset-0 z-0">
            <div class="absolute left-[-25%] top-1/4 h-[600px] w-[600px] animate-pulse-slow rounded-full bg-primary/20 blur-[120px]" />
            <div class="absolute bottom-0 right-[-25%] h-[500px] w-[500px] rounded-full bg-indigo-900/20 blur-[100px]" />
          </div>

          <div class="container mx-auto relative z-10 grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div class="animate-fade-in-up">
              <div class="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5">
                <span class="h-2 w-2 animate-ping rounded-full bg-primary" />
                <span class="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                  Protocol v2.0: The Sentient Monolith
                </span>
              </div>

              <h1 class="mb-8 text-6xl font-black leading-[0.95] tracking-tight md:text-8xl">
                AGENTS <br />
                THAT <span class="text-glow italic text-primary">REMEMBER.</span>
              </h1>

              <p class="mb-10 max-w-xl text-xl leading-relaxed text-tertiary">
                Stop treating every chat like a first date. Aletheia gives your
                AI a persistent, evolving brain, a cognitive architecture that
                learns who your users are one interaction at a time.
              </p>

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

            <div class="hidden justify-center lg:flex">
              <div class="relative h-[550px] w-[450px] animate-float">
                <div class="glass-panel group absolute inset-0 overflow-hidden rounded-3xl border-primary/20 shadow-2xl">
                  <img
                    class="h-full w-full object-cover opacity-40 mix-blend-screen transition-transform duration-[10s] group-hover:scale-110"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDP6aftP-Z-45zUJ7ikYh5-rv2UZviCj-xVzUKXgrar8B2FmWXde2meuVMHfEpCjUuTqWFvXpk2EShWB8_5_umYPRdG_kAqBXTkYs8okoD-KOxbtJ3aUS4nOT9wUXIXlncUMVqFJAXt5IMnbVCZoAD450qlVPyGV7tx3QNfyhDtGenSH_OV01Z2tcoUVChuhYymWBf_QIQYXFKrf2VG77Kphqz9nr51LpGzn0a8wBrgvXMxj7hQQMzn28lGZOV_V_cv46wOy38KhGPr"
                    alt="Abstract futuristic light sculpture"
                  />
                  <div class="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-surface to-transparent" />
                  <div class="absolute bottom-8 left-8 right-8">
                    <div class="glass-panel rounded-xl border-primary/30 p-6">
                      <div class="mb-1 text-[10px] font-bold uppercase tracking-widest text-primary">
                        Active Memory Node
                      </div>
                      <div class="mb-3 text-sm font-medium">
                        Memory Lattice: 100% Coherent
                      </div>
                      <div class="h-1 w-full overflow-hidden rounded-full bg-white/10">
                        <div class="h-full w-[88%] bg-primary shadow-[0_0_10px_#6366f1]" />
                      </div>
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
                  class={`glass-panel scroll-reveal rounded-3xl p-10 ${card.panelClass}`}
                  style={{
                    transitionDelay: cardIndex === 1 ? "150ms" : undefined
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
                  class={`glass-panel scroll-reveal rounded-2xl p-8 ${card.borderClass}`}
                  style={{
                    transitionDelay: card.delay || undefined
                  }}
                >
                  <div
                    class={`mb-6 flex h-12 w-12 items-center justify-center rounded-lg ${card.iconWrapClass}`}
                  >
                    <span
                      class={`material-symbols-outlined ${card.iconClass}`}
                    >
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
                  class="glass-panel scroll-reveal rounded-3xl border-t-2 border-primary/20 p-10"
                  style={{
                    transitionDelay: item.delay || undefined
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

        <section
          id="tech"
          class="bg-surface-container-high/40 px-6 py-32"
        >
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
                <div class="glass-panel group relative aspect-square overflow-hidden rounded-3xl p-1">
                  <img
                    class="h-full w-full rounded-2xl object-cover opacity-60 grayscale transition-all duration-1000 group-hover:grayscale-0"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDjCFYsvGHWRN6ZMdb3rSxu-5-TbzvmphPPq2CTrpoY68mJFfOKFGHT6QAU4hY98Ub0ZVpIemS2cMuBW8waunO0p-FEJvWj0cUi5l10SEsLRNA0KAXDLX1xmrW9nJ3ZPjAhl01HZAsK8OA7vhm0yILCD_BOEYcD5ROfB_KapjrZZcAWMWurONAAcY8zBycar_q1DBJ02JmClKbfUXOmp34Sp8DUjX4xTEh2Kqz0DmyPaX4u1KnEQPnxNchGfnB5lqgKbTgsHOqnHAgX"
                    alt="Close up of abstract circuit board with blue neon highlights"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
                  <div class="absolute inset-0 flex items-center justify-center">
                    <div class="text-center">
                      <div class="mb-2 text-6xl font-black tracking-tighter text-white">
                        0.008s
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
                let your AI finally <span class="text-on-surface">remember</span>.
              </p>
              <div class="relative z-10 flex flex-col justify-center gap-6 sm:flex-row">
                <Link
                  href="/login"
                  class="obsidian-gradient rounded-xl px-12 py-5 text-lg font-black uppercase tracking-wider text-white shadow-xl shadow-primary/30 transition-transform hover:scale-105"
                >
                  Initialize Engine
                </Link>
                <Link
                  href="/docs"
                  class="glass-panel rounded-xl px-12 py-5 text-lg font-bold uppercase tracking-wider text-on-surface transition-colors hover:bg-surface-container-high"
                >
                  Book a Workshop
                </Link>
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
            <div class="flex gap-4">
              <Link
                href="/docs"
                class="glass-panel flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-primary"
              >
                <span class="material-symbols-outlined text-sm">hub</span>
              </Link>
              <Link
                href="/platform"
                class="glass-panel flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-primary"
              >
                <span class="material-symbols-outlined text-sm">terminal</span>
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
          © 2024 Aletheia Systems. All human memories preserved. Truth disclosed.
        </div>
      </footer>
    </div>
  );
});

export const head: DocumentHead = {
  title: "ALETHEIA | Agents That Remember",
  meta: [
    {
      name: "description",
      content:
        "Aletheia is the persistent memory layer for AI agents that need temporal awareness, truth extraction, and continuity across models."
    }
  ],
  links: [
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap"
    },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
    }
  ],
  styles: [
    {
      key: "landing-template-styles",
      style: landingStyles
    }
  ],
  scripts: [
    {
      key: "tailwind-cdn",
      props: {
        src: "https://cdn.tailwindcss.com?plugins=forms,container-queries"
      }
    },
    {
      key: "tailwind-config",
      props: {
        id: "tailwind-config"
      },
      script: tailwindConfigScript
    }
  ]
};
