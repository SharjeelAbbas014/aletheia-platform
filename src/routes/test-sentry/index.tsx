import { component$ } from "@builder.io/qwik";

export default component$(() => {
  return (
    <div class="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 class="text-2xl font-bold">Sentry Test</h1>
      <button
        class="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
        onClick$={async () => {
          const body = JSON.stringify({
            event_id: crypto.randomUUID().replace(/-/g, "").slice(0, 32),
            timestamp: Date.now() / 1000,
            level: "error",
            platform: "javascript",
            exception: { values: [{ type: "TestError", value: "Direct button test" }] },
            extra: { source: "test_page" },
            tags: { environment: "development" },
          });
          const envelope =
            JSON.stringify({ event_id: JSON.parse(body).event_id, sent_at: new Date().toISOString(), dsn: import.meta.env.PUBLIC_SENTRY_DSN }) +
            "\n" +
            JSON.stringify({ type: "event", content_type: "application/json", length: body.length }) +
            "\n" +
            body;

          const res = await fetch("/api/sentry", {
            method: "POST",
            headers: { "Content-Type": "text/plain" },
            body: envelope,
          });
          console.log("Sentry proxy response:", res.status, await res.text());
          alert(`Sent to Sentry proxy. Status: ${res.status}. Check Sentry dashboard.`);
        }}
      >
        Test Sentry (Direct Call)
      </button>
      <p class="text-gray-500 text-sm">Click the button to send a test error directly to /api/sentry</p>
    </div>
  );
});
