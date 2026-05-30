import type { RequestHandler } from "@builder.io/qwik-city";
import { getStorageStats } from "~/lib/aletheia-core";
import { getCurrentUser } from "~/lib/auth";
import { getAdminSupabaseClient } from "~/lib/supabase";
import { captureError } from "~/lib/sentry";

export const onGet: RequestHandler = async (event) => {
  const user = getCurrentUser(event.cookie);
  if (!user) throw event.error(401, "Unauthorized");

  try {
    const clusterId = event.params.id;
    if (!clusterId) throw event.error(400, "Cluster ID required");

    const supabase = getAdminSupabaseClient(event.env);
    const { data: cluster } = await supabase
      .from("clusters")
      .select("user_id, endpoint_url, engine_key")
      .eq("id", clusterId)
      .single();

    if (!cluster) throw event.error(403, "Forbidden");
    if (cluster.user_id !== user.user_id) throw event.error(403, "Forbidden");

    const stats = await getStorageStats(clusterId, cluster.endpoint_url, cluster.engine_key);
    if (!stats) throw event.error(503, "Failed to contact engine");

    event.json(200, stats);
  } catch (e: any) {
    if (e?.headers?.location) throw e;
    captureError(e, { action: "clusterStorageStats", clusterId: event.params.id });
    throw e;
  }
};
