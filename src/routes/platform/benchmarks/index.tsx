import { component$ } from "@builder.io/qwik";
import { Link, type DocumentHead } from "@builder.io/qwik-city";
import { buildSeoHead } from "~/lib/seo";
import { setPublicEdgeCache } from "~/lib/cache";
import type { RequestHandler } from "@builder.io/qwik-city";
import {
  BarChart3Icon,
  TrophyIcon,
  ClockIcon,
  ZapIcon,
  ExternalLinkIcon,
} from "lucide-qwik";

export const onRequest: RequestHandler = (event) => {
  setPublicEdgeCache(event);
};

const labels = [
  "Overall",
  "Single Session",
  "Temporal",
  "Preferences",
  "Knowledge Updates",
  "Multi-Session",
];
const datasets = [
  {
    name: "AletheiaDB",
    color: "bg-primary",
    values: [90.5, 98.0, 88.3, 95.2, 96.1, 74.8],
  },
  {
    name: "HydraDB",
    color: "bg-orange-500",
    values: [90.8, 100, 91.0, 96.7, 97.4, 76.7],
  },
  {
    name: "Zep",
    color: "bg-blue-500",
    values: [71.2, 92.9, 62.4, 56.7, 83.3, 57.9],
  },
  {
    name: "Mem0",
    color: "bg-purple-500",
    values: [29.1, 38.7, 25.6, 40.0, 52.6, 20.3],
  },
];

export default component$(() => {
  return (
    <div class="flex min-h-screen bg-background text-on-surface font-body antialiased">
      <main class="flex-1 overflow-y-auto p-8 lg:p-12 mb-20 max-w-6xl mx-auto w-full pt-[104px]">
        <header class="mb-12 text-center">
          <div class="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 mb-6">
            <TrophyIcon class="w-4 h-4 text-amber-400" />
            <span class="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-amber-400">
              LongMemEval-S Benchmark
            </span>
          </div>
          <h1 class="font-headline text-5xl font-extrabold tracking-tighter">
            Public Benchmarks
          </h1>
          <p class="text-tertiary mt-4 max-w-2xl mx-auto">
            Transparent, reproducible evaluation of AletheiaDB against industry
            leaders on standard agent memory benchmarks.
          </p>
        </header>

        <div class="grid lg:grid-cols-4 gap-4 mb-12">
          <div class="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-6 text-center">
            <ZapIcon class="w-8 h-8 text-primary mx-auto mb-3" />
            <p class="text-3xl font-extrabold">90.5%</p>
            <p class="text-xs text-tertiary mt-1">Overall Accuracy</p>
          </div>
          <div class="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-6 text-center">
            <ClockIcon class="w-8 h-8 text-green-400 mx-auto mb-3" />
            <p class="text-3xl font-extrabold">&lt;100ms</p>
            <p class="text-xs text-tertiary mt-1">P95 Retrieval Latency</p>
          </div>
          <div class="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-6 text-center">
            <BarChart3Icon class="w-8 h-8 text-orange-400 mx-auto mb-3" />
            <p class="text-3xl font-extrabold">+61pt</p>
            <p class="text-xs text-tertiary mt-1">vs Mem0 Overall</p>
          </div>
          <div class="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-6 text-center">
            <TrophyIcon class="w-8 h-8 text-amber-400 mx-auto mb-3" />
            <p class="text-3xl font-extrabold">#2</p>
            <p class="text-xs text-tertiary mt-1">Overall Ranking</p>
          </div>
        </div>

        <div class="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-6 mb-8 overflow-x-auto">
          <h3 class="text-lg font-bold mb-6">LongMemEval-S Results (%)</h3>
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-outline-variant/10">
                <td class="py-3 font-bold text-tertiary text-xs uppercase tracking-widest">
                  Model
                </td>
                {labels.map((l) => (
                  <td
                    key={l}
                    class="py-3 px-3 font-bold text-tertiary text-xs text-right"
                  >
                    {l}
                  </td>
                ))}
              </tr>
            </thead>
            <tbody>
              {datasets.map((ds) => (
                <tr
                  key={ds.name}
                  class="border-b border-outline-variant/5 hover:bg-surface-container-highest/50"
                >
                  <td class="py-3 font-bold">
                    {ds.name === "AletheiaDB" ? (
                      <span class="text-primary">{ds.name}</span>
                    ) : (
                      ds.name
                    )}
                  </td>
                  {ds.values.map((v, i) => (
                    <td key={i} class="py-3 px-3 text-right font-mono">
                      <span
                        class={
                          ds.name === "AletheiaDB"
                            ? "text-primary font-bold"
                            : "text-tertiary"
                        }
                      >
                        {v.toFixed(1)}%
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bar chart visualization */}
        <div class="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-6 mb-8">
          <h3 class="text-lg font-bold mb-6">Overall Score Comparison</h3>
          <div class="space-y-4">
            {datasets.map((ds) => (
              <div key={ds.name} class="flex items-center gap-4">
                <span class="w-20 text-sm font-bold">{ds.name}</span>
                <div class="flex-1 h-8 rounded-lg bg-black/40 overflow-hidden">
                  <div
                    class={`h-full rounded-lg transition-all flex items-center px-3 text-xs font-bold text-white ${ds.color}`}
                    style={{ width: `${ds.values[0]}%` }}
                  >
                    {ds.values[0].toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div class="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-6">
          <h3 class="text-lg font-bold mb-4">Methodology</h3>
          <ul class="space-y-2 text-sm text-tertiary">
            <li class="flex items-start gap-2">
              <span class="text-primary text-xs mt-0.5">▸</span>Dataset:
              LongMemEval-S benchmark — 6 categories across single/multi-session
              recall, temporal reasoning, preference extraction, knowledge
              updates
            </li>
            <li class="flex items-start gap-2">
              <span class="text-primary text-xs mt-0.5">▸</span>Hardware: All
              tests run on equivalent cloud instances (4 vCPU, 16 GB RAM)
            </li>
            <li class="flex items-start gap-2">
              <span class="text-primary text-xs mt-0.5">▸</span>Evaluation code:
              Open source at{" "}
              <a
                href="https://github.com/SharjeelAbbas014/Aletheia"
                target="_blank"
                rel="noreferrer"
                class="text-primary hover:underline"
              >
                github.com/SharjeelAbbas014/Aletheia
              </a>{" "}
              <ExternalLinkIcon class="w-3 h-3 inline" />
            </li>
            <li class="flex items-start gap-2">
              <span class="text-primary text-xs mt-0.5">▸</span>Competitor
              results sourced from publicly published benchmarks and our own
              evaluation rig. HydraDB results from hydradb.com/benchmarks. Zep
              results from getzep.com benchmarks. Mem0 results from published
              baselines.
            </li>
            <li class="flex items-start gap-2">
              <span class="text-primary text-xs mt-0.5">▸</span>Last updated:
              May 2026. Run them yourself:{" "}
              <code class="text-xs text-primary">
                cargo run --release --bench longmemeval
              </code>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
});

export const head: DocumentHead = buildSeoHead({
  title: "Benchmarks | ALETHEIADB",
  description:
    "AletheiaDB benchmark results against Mem0, Zep, and HydraDB on LongMemEval-S. See how our memory engine performs on temporal reasoning and retrieval.",
  pathname: "/platform/benchmarks",
  keywords: [
    "AI memory benchmarks",
    "memory engine comparison",
    "LongMemEval results",
    "temporal memory evaluation",
    "agent memory performance",
    "Mem0 alternative",
    "Zep alternative",
  ],
});
