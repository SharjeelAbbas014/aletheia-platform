import type { RequestHandler } from "@builder.io/qwik-city";
import { getGraphEdges } from "~/lib/aletheia-core";
import { getCurrentUser } from "~/lib/auth";
import { getAdminSupabaseClient } from "~/lib/supabase";
import { captureError } from "~/lib/sentry";

export const onGet: RequestHandler = async (event) => {
  const user = getCurrentUser(event.cookie);
  if (!user) {
    throw event.json(401, { error: "Unauthorized - no session cookie" });
  }

  try {
    const clusterId = event.params.id;
    if (!clusterId) throw event.json(400, { error: "Cluster ID required" });

    const supabase = getAdminSupabaseClient(event.env);
    const { data: cluster } = await supabase
      .from("clusters")
      .select("user_id, endpoint_url, engine_key")
      .eq("id", clusterId)
      .single();

    if (!cluster) {
      throw event.json(403, { error: `Cluster ${clusterId} not found` });
    }
    if (cluster.user_id !== user.user_id) {
      throw event.json(403, { error: `Owner mismatch`, cluster_owner: cluster.user_id, current_user: user.user_id });
    }

    const edges = await getGraphEdges(clusterId, cluster.endpoint_url, cluster.engine_key);
    if (!edges) throw event.json(503, { error: "Failed to contact engine" });

    event.json(200, edges);
  } catch (e: any) {
    if (e?.headers?.location) throw e;
    captureError(e, { action: "clusterGraphEdges", clusterId: event.params.id });
    throw e;
  }
};
