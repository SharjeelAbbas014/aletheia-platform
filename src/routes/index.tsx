import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { Link, type DocumentHead } from "@builder.io/qwik-city";

const heroStats = [
  { label: "Stores", value: "facts, preferences, summaries" },
  { label: "Works with", value: "Claude, ChatGPT, Gemini, Grok" },
  { label: "Runs", value: "local for dev, cloud for prod" },
  { label: "Feels like", value: "one memory behind every assistant" }
];

const failureModes = [
  {
    title: "Great first chat, bad second chat",
    body:
      "The demo looks magical, then the assistant asks the same question again because nothing durable was actually saved."
  },
  {
    title: "Yesterday's truth will not leave",
    body:
      "A preference changes, a plan shifts, a customer moves, and the old version still sneaks back into the answer."
  },
  {
    title: "Every tool has amnesia",
    body:
      "You teach one model your tone, your rules, or your customer context, then the next tool walks in like it never met you."
  }
];

const repairSteps = [
  {
    step: "01",
    title: "Save the moments that matter",
    body:
      "Turns, facts, preferences, and decisions land in one memory layer instead of disappearing inside separate chats."
  },
  {
    step: "02",
    title: "Fetch the right thing fast",
    body:
      "Aletheia mixes semantic search, keyword search, reranking, and time signals so the useful detail wins."
  },
  {
    step: "03",
    title: "Let memory change its mind",
    body:
      "New facts can replace old ones, summaries can compact long threads, and stale context can finally stop haunting the reply."
  }
];

const technicalAdvantages = [
  {
    label: "Rust where it counts",
    body:
      "The engine is built for fast retrieval and predictable latency, not a pile of glue scripts pretending to be infrastructure."
  },
  {
    label: "Local-first workflow",
    body:
      "Run it on your machine while you prototype, test, and debug before you ever touch hosted infrastructure."
  },
  {
    label: "One API, less drama",
    body:
      "Your SDKs and apps talk to one HTTP contract instead of learning a new shape for every environment."
  },
  {
    label: "Model-agnostic memory",
    body:
      "OpenAI, Anthropic, Google, xAI, or your own stack can all read from the same memory source."
  }
];

const crossModelMoments = [
  {
    model: "ChatGPT",
    prompt: "I always want aisle seats, unless it is an overnight flight.",
    result:
      "Aletheia stores the preference with the exception instead of flattening it into one fuzzy note."
  },
  {
    model: "Claude",
    prompt: "Plan my trip to Lisbon next month.",
    result:
      "The next model can use the aisle-seat rule without asking the user to repeat it."
  },
  {
    model: "Gemini or Grok",
    prompt: "Make me a packing list and travel checklist.",
    result:
      "The follow-up stays grounded in the same trip and preference context across tools."
  }
];

const controlPlaneCards = [
  {
    label: "Story",
    body:
      "Say what the product does in plain English, with enough proof to make an engineer and a buyer both keep scrolling."
  },
  {
    label: "Docs",
    body:
      "Move people from interesting to I can wire this up today without sending them on a documentation scavenger hunt."
  },
  {
    label: "Access",
    body:
      "Handle logins, demo keys, and the first API call in one clean front door."
  }
];

const heroHighlights = [
  "Semantic + keyword retrieval",
  "Time-aware ranking",
  "Cross-model context",
  "Local to cloud"
];

const heroSignals = [
  {
    label: "Traveler update",
    value: "Use SMS for confirmations"
  },
  {
    label: "Exception rule",
    value: "Aisle seat, except overnight flights"
  }
];

const heroRankings = [
  {
    label: "SMS preference",
    score: "98%"
  },
  {
    label: "Trip to Lisbon",
    score: "92%"
  },
  {
    label: "Old email thread",
    score: "34%"
  }
];

export default component$(() => {
  const mainRef = useSignal<HTMLElement>();

  useVisibleTask$(({ cleanup }) => {
    const root = mainRef.value;

    if (!root) {
      return;
    }

    const revealTargets = Array.from(
      root.querySelectorAll<HTMLElement>("[data-reveal]")
    );
    const trackedSections = Array.from(
      root.querySelectorAll<HTMLElement>("[data-track]")
    );
    const heroSection = root.querySelector<HTMLElement>(".hero-section");

    revealTargets.forEach((target, index) => {
      target.style.setProperty("--reveal-order", `${index % 7}`);
    });

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      revealTargets.forEach((target) => target.classList.add("is-visible"));
      root.style.setProperty("--hero-progress", "0");

      trackedSections.forEach((section) => {
        section.style.setProperty("--section-progress", "0.5");
      });

      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add("is-visible");
          }
        }
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -8% 0px"
      }
    );

    revealTargets.forEach((target) => observer.observe(target));

    let frame = 0;

    const updateProgress = () => {
      frame = 0;

      const viewportHeight = window.innerHeight || 1;

      if (heroSection) {
        const heroRect = heroSection.getBoundingClientRect();
        const heroProgress = Math.max(
          0,
          Math.min(1, -heroRect.top / Math.max(heroRect.height * 0.75, 1))
        );

        root.style.setProperty("--hero-progress", heroProgress.toFixed(3));
      }

      trackedSections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const progress = Math.max(
          0,
          Math.min(1, (viewportHeight - rect.top) / (viewportHeight + rect.height))
        );

        section.style.setProperty("--section-progress", progress.toFixed(3));
      });
    };

    const queueUpdate = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(updateProgress);
      }
    };

    updateProgress();
    window.addEventListener("scroll", queueUpdate, { passive: true });
    window.addEventListener("resize", queueUpdate);

    cleanup(() => {
      observer.disconnect();

      if (frame) {
        window.cancelAnimationFrame(frame);
      }

      window.removeEventListener("scroll", queueUpdate);
      window.removeEventListener("resize", queueUpdate);
    });
  });

  return (
    <main ref={mainRef} class="landing-page">
      <section class="hero-section section-tone-lime" data-track>
        <div class="shell hero-grid">
          <div>
            <div class="eyebrow" data-reveal>
              Memory for AI that should stop asking the same thing twice
            </div>
            <h1 class="hero-title" data-reveal>
              AI that remembers the useful stuff, forgets the junk, and picks
              up where the last model left off.
            </h1>
            <p class="hero-copy" data-reveal>
              Most AI feels brilliant for one conversation and weirdly needy by
              the next. Aletheia gives your product a memory worth having: it
              stores what matters, updates what changed, and brings back the
              right context whether the next reply comes from Claude, ChatGPT,
              Gemini, Grok, or your own agent stack.
            </p>

            <div class="button-row" data-reveal>
              <Link href="/docs" class="button button-dark">
                See the quickstart
              </Link>
              <Link href="/login" class="button button-ghost">
                Try the demo
              </Link>
            </div>

            <div class="hero-pill-row" data-reveal>
              {heroHighlights.map((item) => (
                <span key={item} class="pill hero-pill">
                  {item}
                </span>
              ))}
            </div>

            <div class="scroll-cue" data-reveal>
              <span class="scroll-cue-dot" />
              Scroll a little. The page does the remembering too.
            </div>

            <div class="stats-grid" data-reveal>
              {heroStats.map((item) => (
                <article key={item.label} class="card metric-card">
                  <div class="metric-label">{item.label}</div>
                  <div class="metric-value">{item.value}</div>
                </article>
              ))}
            </div>
          </div>

          <div class="dark-card hero-visual" data-reveal>
            <div class="hero-glow hero-glow-lime" />
            <div class="hero-glow hero-glow-teal" />
            <div class="hero-gridlines" />
            <div class="hero-scene-grid">
              <div class="floating-panel hero-stream-card">
                <div class="floating-title">Fresh signal</div>
                <div class="hero-event-list">
                  {heroSignals.map((item) => (
                    <div key={item.label} class="hero-event-row">
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div class="hero-orbit">
                <div class="hero-ring hero-ring-one" />
                <div class="hero-ring hero-ring-two" />
                <div class="hero-core-label">Aletheia core</div>
                <div class="hero-core-title">memory that keeps up</div>
                <p class="hero-core-copy">
                  Signal in, useful context out, no repeated onboarding.
                </p>
              </div>

              <div class="floating-panel hero-rank-card">
                <div class="floating-title">What comes back</div>
                <div class="hero-rank-list">
                  {heroRankings.map((item) => (
                    <div key={item.label} class="hero-rank-item">
                      <div class="hero-rank-copy">
                        <span>{item.label}</span>
                        <strong>{item.score}</strong>
                      </div>
                      <div class="hero-rank-bar">
                        <span style={{ width: item.score }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div class="floating-panel hero-store-card">
                <div class="floating-title">What sticks</div>
                <div class="hero-memory-grid">
                  <span class="chip hero-memory-chip">facts</span>
                  <span class="chip hero-memory-chip">preferences</span>
                  <span class="chip hero-memory-chip">summaries</span>
                  <span class="chip hero-memory-chip">recent moments</span>
                </div>
                <p class="accent-line">Result: send the SMS version, not the stale email one.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="problem" class="section section-tone-orange" data-track>
        <div class="shell">
          <div class="section-intro" data-reveal>
            <div class="eyebrow">Why memory breaks</div>
            <h2>Most AI feels smart until the follow-up question.</h2>
            <p>
              Bad memory is not just forgetting. It is dragging old facts back
              into the room, missing the detail that matters, and making every
              new session start from zero.
            </p>
          </div>

          <div class="three-up">
            {failureModes.map((mode) => (
              <article key={mode.title} class="card feature-card" data-reveal>
                <h3>{mode.title}</h3>
                <p>{mode.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="how" class="section section-tone-teal" data-track>
        <div class="shell">
          <div class="section-intro" data-reveal>
            <div class="eyebrow">How Aletheia works</div>
            <h2>Keep the important bits. Bring them back fast. Update them when reality changes.</h2>
            <p>
              That is the product. Aletheia turns messy conversation history
              into usable memory so agents stay helpful without dragging an
              entire transcript around forever.
            </p>
          </div>

          <div class="three-up step-grid">
            {repairSteps.map((step) => (
              <article key={step.step} class="card step-card" data-reveal>
                <div class="step-id">{step.step}</div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="tech" class="section section-tone-lime" data-track>
        <div class="shell two-column">
          <div>
            <div class="section-intro section-intro-left" data-reveal>
              <div class="eyebrow">Why developers like it</div>
              <h2>Built for teams that want durable memory, not another AI science project.</h2>
              <p>
                Run it locally while you build. Ship the same memory layer in
                production. Keep the API stable even while the models around it
                change every other week.
              </p>
            </div>
            <div class="two-up">
              {technicalAdvantages.map((item) => (
                <article key={item.label} class="card feature-card" data-reveal>
                  <h3>{item.label}</h3>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </div>

          <div class="dark-card stack-card" data-reveal>
            <div class="terminal-label">one memory layer, one API</div>
            <pre class="code-window">
              <code>{`$ aletheia start --port 3000
memory online • local mode ready
store facts • query context • ship the same API in cloud`}</code>
            </pre>
            <div class="chip-row">
              <span class="chip">Python SDK</span>
              <span class="chip">Node SDK</span>
              <span class="chip">Agent apps</span>
              <span class="chip">Internal copilots</span>
            </div>
          </div>
        </div>
      </section>

      <section class="section section-tone-orange" data-track>
        <div class="shell two-column">
          <div>
            <div class="section-intro section-intro-left" data-reveal>
              <div class="eyebrow">What users feel</div>
              <h2>The magic is simple: the next assistant already knows the backstory.</h2>
              <p>
                Users do not care about your retrieval pipeline. They care that
                the assistant remembers the aisle-seat rule, the product
                preference, the customer note, or the new deadline without being
                told all over again.
              </p>
            </div>
            <div class="stack-list">
              {crossModelMoments.map((moment, index) => (
                <article key={moment.model} class="card story-card" data-reveal>
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

          <div class="dark-card stack-card" data-reveal>
            <div class="terminal-label">shared memory record</div>
            <pre class="code-window">
              <code>{`preference: aisle seat
exception: overnight flights
trip: Lisbon next month
next asks: itinerary, packing list, reminder checklist`}</code>
            </pre>
            <p class="subtle-copy">
              Tell one assistant the travel preference. Ask the next one to plan
              the trip. Ask another for the packing list. It still feels like
              one conversation.
            </p>
          </div>
        </div>
      </section>

      <section id="platform" class="section section-last section-tone-teal" data-track>
        <div class="shell">
          <div class="platform-panel" data-reveal>
            <div class="section-intro section-intro-left platform-copy" data-reveal>
              <div class="eyebrow eyebrow-dark">Platform</div>
              <h2>Your pitch, docs, and key management should live in the same front door.</h2>
              <p>
                If someone is ready to try the product, do not send them
                through three different websites and a mystery dashboard.
                Aletheia gives you one place to explain the value, teach the
                setup, and hand over access.
              </p>
              <div class="button-row">
                <Link href="/login" class="button button-lime">
                  Get a demo key
                </Link>
                <Link href="/docs/quickstart" class="button button-outline-light">
                  Read the quickstart
                </Link>
              </div>
            </div>

            <div class="three-up platform-grid">
              {controlPlaneCards.map((card) => (
                <article key={card.label} class="platform-card" data-reveal>
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
  title: "Aletheia | AI Memory That Actually Sticks",
  meta: [
    {
      name: "description",
      content:
        "Give your AI a memory worth having. Aletheia stores what matters, updates what changed, and keeps context moving across models."
    }
  ]
};
