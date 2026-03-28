import { component$ } from "@builder.io/qwik";
import { Link, type DocumentHead } from "@builder.io/qwik-city";

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

const technicalAdvantages = [
  {
    label: "Built in Rust",
    body:
      "The engine is compiled for predictable latency, lower overhead, and a cleaner operational path than a pile of scripting services."
  },
  {
    label: "One binary locally",
    body:
      "The SDK can launch one engine sidecar for local mode, which keeps installs lighter and testing much easier."
  },
  {
    label: "One HTTP contract",
    body:
      "Python, Node, and provider bridges all talk to the same ingest and query surface instead of learning different runtimes."
  },
  {
    label: "Same API in cloud",
    body:
      "Move from a local binary to the hosted path without changing the mental model, signatures, or memory behavior."
  }
];

const crossModelMoments = [
  {
    model: "ChatGPT",
    prompt: "I bought a white Mercedes. What should I do first?",
    result:
      "Aletheia stores the purchase, the car details, and the immediate next-step context."
  },
  {
    model: "Claude",
    prompt: "Make me a checklist for the first week with the car I just bought.",
    result:
      "The next model can continue from the Mercedes purchase without asking the user to restate it."
  },
  {
    model: "Gemini or Grok",
    prompt: "What paperwork, insurance, and accessories should I think about next?",
    result:
      "The follow-up stays grounded in the same car context because the backend memory is shared."
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
      "Keep the quickstart, auth model, local runtime, and SDK surfaces in one place with a straightforward docs experience."
  },
  {
    label: "Platform",
    body:
      "Login, issue API keys, observe usage, and keep the hosted control plane separate from the Rust engine runtime."
  }
];

export default component$(() => {
  return (
    <main>
      <section class="hero-section">
        <div class="shell hero-grid">
          <div>
            <div class="eyebrow">
              Memory infrastructure for agents and applications
            </div>
            <h1 class="hero-title">
              A memory engine that explains what went wrong, fixes it, and
              carries context across models.
            </h1>
            <p class="hero-copy">
              Aletheia gives your product durable recall without transcript
              bloat. It captures facts and preferences, retrieves them with
              ranking that respects freshness, and lets the same memory follow
              the user from Claude Code to ChatGPT to Gemini to Grok.
            </p>

            <div class="button-row">
              <Link href="/docs" class="button button-dark">
                Read the docs
              </Link>
              <Link href="/login" class="button button-ghost">
                Open the platform
              </Link>
            </div>

            <div class="stats-grid">
              {heroStats.map((item) => (
                <article key={item.label} class="card metric-card">
                  <div class="metric-label">{item.label}</div>
                  <div class="metric-value">{item.value}</div>
                </article>
              ))}
            </div>
          </div>

          <div class="dark-card hero-visual">
            <div class="hero-glow hero-glow-lime" />
            <div class="hero-glow hero-glow-teal" />
            <div class="hero-orbit">
              <div class="hero-core-label">Aletheia core</div>
              <div class="hero-core-title">retrieval + durable memory</div>
            </div>
            <div class="floating-panel floating-panel-top">
              <div class="floating-title">Input stream</div>
              <p>User prefers pourover coffee.</p>
            </div>
            <div class="floating-panel floating-panel-right">
              <div class="floating-title">Retrieval trace</div>
              <p>semantic + lexical + rerank</p>
              <p class="accent-line">result: pourover, still current</p>
            </div>
            <div class="floating-panel floating-panel-bottom">
              <div class="floating-title">Memory layers</div>
              <p>episodic, facts, summaries, graph links</p>
            </div>
          </div>
        </div>
      </section>

      <section id="problem" class="section">
        <div class="shell">
          <div class="section-intro">
            <div class="eyebrow">Why memory breaks</div>
            <h2>Most assistants have a memory quality problem, not just a memory problem.</h2>
            <p>
              The issue is retrieving the wrong thing, keeping stale facts
              alive, and forcing every model session to relearn the same user
              context from scratch.
            </p>
          </div>

          <div class="three-up">
            {failureModes.map((mode) => (
              <article key={mode.title} class="card feature-card">
                <h3>{mode.title}</h3>
                <p>{mode.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="how" class="section">
        <div class="shell">
          <div class="section-intro">
            <div class="eyebrow">How Aletheia works</div>
            <h2>It repairs the memory loop instead of pretending longer context windows solve everything.</h2>
            <p>
              Aletheia captures durable signals, ranks them with multiple
              retrieval systems working together, and lets truth evolve through
              supersession rather than endless duplication.
            </p>
          </div>

          <div class="three-up">
            {repairSteps.map((step) => (
              <article key={step.step} class="card step-card">
                <div class="step-id">{step.step}</div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="tech" class="section">
        <div class="shell two-column">
          <div>
            <div class="section-intro section-intro-left">
              <div class="eyebrow">Tech details</div>
              <h2>Fast because the engine is compiled, simple because local mode is one binary.</h2>
              <p>
                Aletheia is built around a Rust runtime with one HTTP surface.
                That gives you a local sidecar path that is easy to ship, and a
                hosted path that keeps the same SDK shape when you scale up.
              </p>
            </div>
            <div class="two-up">
              {technicalAdvantages.map((item) => (
                <article key={item.label} class="card feature-card">
                  <h3>{item.label}</h3>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </div>

          <div class="dark-card stack-card">
            <div class="terminal-label">one engine, one API</div>
            <pre class="code-window">
              <code>{`$ ./aletheia-engine --port 3000
engine ready • auth locked • rust runtime active
surface: ingest • query • version • health`}</code>
            </pre>
            <div class="chip-row">
              <span class="chip">Python SDK</span>
              <span class="chip">Node SDK</span>
              <span class="chip">Claude + OpenAI</span>
              <span class="chip">Gemini + Grok</span>
            </div>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="shell two-column">
          <div>
            <div class="section-intro section-intro-left">
              <div class="eyebrow">For normal users</div>
              <h2>The agent can remember across each model, not just inside one app.</h2>
              <p>
                A durable preference or fact can follow the same person from one
                model to the next because they all query the same memory backend.
              </p>
            </div>
            <div class="stack-list">
              {crossModelMoments.map((moment, index) => (
                <article key={moment.model} class="card story-card">
                  <div class="story-heading">
                    <span class="story-count">{index + 1}</span>
                    <h3>{moment.model}</h3>
                  </div>
                  <p class="story-quote">{moment.prompt}</p>
                  <p>{moment.result}</p>
                </article>
              ))}
            </div>
          </div>

          <div class="dark-card stack-card">
            <div class="terminal-label">shared memory record</div>
            <pre class="code-window">
              <code>{`asset: white Mercedes
event: new purchase
next step intent: first-week checklist
related asks: insurance, paperwork, accessories`}</code>
            </pre>
            <p class="subtle-copy">
              Tell one model you bought a white Mercedes. Ask the next one for a
              checklist. Later models can still answer car-related follow-ups
              without reset.
            </p>
          </div>
        </div>
      </section>

      <section id="platform" class="section section-last">
        <div class="shell">
          <div class="platform-panel">
            <div class="section-intro section-intro-left platform-copy">
              <div class="eyebrow eyebrow-dark">Platform</div>
              <h2>One place for the pitch, the docs, the login, and the keys.</h2>
              <p>
                The platform should explain the product, teach developers how to
                use it, and act as the front door for hosted access. That keeps
                onboarding, API keys, and product positioning in one coherent
                surface.
              </p>
              <div class="button-row">
                <Link href="/login" class="button button-lime">
                  Generate a demo key
                </Link>
                <Link href="/docs/quickstart" class="button button-outline-light">
                  See the quickstart
                </Link>
              </div>
            </div>

            <div class="three-up platform-grid">
              {controlPlaneCards.map((card) => (
                <article key={card.label} class="platform-card">
                  <div class="metric-label metric-label-dark">{card.label}</div>
                  <p>{card.body}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
});

export const head: DocumentHead = {
  title: "Aletheia | Memory Infrastructure for Agents",
  meta: [
    {
      name: "description",
      content:
        "Ship a memory system with hybrid retrieval, time-aware ranking, fact supersession, local-first binaries, and cloud APIs."
    }
  ]
};
