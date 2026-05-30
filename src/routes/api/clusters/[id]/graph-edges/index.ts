import type { RequestHandler } from "@builder.io/qwik-city";
import { getStorageStats, getGraphEdges, getAdminKey, getAletheiaDBCoreUrl } from "~/lib/aletheia-core";
import { getCurrentUser } from "~/lib/auth";
import { getAdminSupabaseClient } from "~/lib/supabase";
import { captureError } from "~/lib/sentry";
import type { GraphEdge } from "~/lib/aletheia-core";

export const onGet: RequestHandler = async (event) => {
  const user = getCurrentUser(event.cookie);
  if (!user) throw event.error(401, "Unauthorized");

  try {
    const clusterId = event.params.id;
    if (!clusterId) throw event.error(400, "Cluster ID required");

    const supabase = getAdminSupabaseClient(event.env);
    if (!supabase) throw event.error(500, "Database offline");

    const { data: cluster } = await supabase
      .from("clusters")
      .select("user_id, tier, endpoint_url, engine_key")
      .eq("id", clusterId)
      .single();

    if (!cluster) throw event.error(403, `Cluster ${clusterId} not found`);
    if (cluster.user_id !== user.user_id) throw event.error(403, "Forbidden - owner mismatch");

    const isShared = cluster.tier === "fractional";

    if (isShared) {
      // Shared server: get user-scoped graph data via /graph/export with user's API key
      const { data: apiKeys } = await supabase
        .from("api_keys")
        .select("key_value")
        .eq("user_id", user.user_id)
        .eq("is_active", true)
        .limit(1);

      if (!apiKeys?.length) {
        event.json(200, []);
        return;
      }

      const url = cluster.endpoint_url || getAletheiaDBCoreUrl();
      const key = apiKeys[0].key_value;
      try {
        const ac = new AbortController();
        const to = setTimeout(() => ac.abort(), 8000);
        const res = await fetch(`${url.replace(/\/+$/, "")}/graph/export`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-api-key": key },
          body: JSON.stringify({ seed: user.user_id, max_nodes: 500 }),
          signal: ac.signal,
        });
        clearTimeout(to);
        if (!res.ok) {
          event.json(200, []);
          return;
        }
        const edges: GraphEdge[] = await res.json();
        event.json(200, edges);
      } catch {
        event.json(200, []);
      }
    } else {
      // Dedicated cluster: use admin endpoint with cluster's engine key
      const edges = await getGraphEdges(clusterId, cluster.endpoint_url, cluster.engine_key);
      event.json(200, edges || []);
    }
  } catch (e: any) {
    if (e?.headers?.location) throw e;
    if (e?.status) throw e;
    captureError(e, { action: "clusterGraphEdges", clusterId: event.params.id });
    throw event.error(500, "Internal error");
  }
};
