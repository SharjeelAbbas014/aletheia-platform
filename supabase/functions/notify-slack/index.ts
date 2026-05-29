import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const SLACK_WEBHOOK_URL = Deno.env.get("SLACK_WEBHOOK_URL") || "";

serve(async (req) => {
  try {
    const payload = await req.json();

    const { type, table, record } = payload;

    let text = "";
    if (table === "users" && type === "INSERT") {
      const email = record?.email || record?.raw_user_meta_data?.email || "unknown";
      text = `:bust_in_silhouette: New signup: *${email}*`;
    } else if (table === "clusters" && type === "INSERT") {
      const clusterId = record?.id?.slice(0, 8) || "unknown";
      const tier = record?.tier || "unknown";
      text = `:rocket: New cluster created: *${clusterId}* (tier: ${tier})`;
    } else {
      text = `:bell: Event: \`${type}\` on \`${table}\`\n\`\`\`${JSON.stringify(record, null, 2)}\`\`\``;
    }

    if (SLACK_WEBHOOK_URL) {
      await fetch(SLACK_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
