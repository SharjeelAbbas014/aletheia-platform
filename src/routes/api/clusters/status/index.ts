import type { RequestHandler } from "@builder.io/qwik-city";
import { getCurrentUser } from "~/lib/auth";
import { getAdminSupabaseClient } from "~/lib/supabase";

export const onGet: RequestHandler = async (event) => {
  const user = getCurrentUser(event.cookie);
  if (!user) throw event.error(401, "Unauthorized");

  const supabase = getAdminSupabaseClient(event.env);
  const { data: clusters } = await supabase
    .from("clusters")
    .select("id, status, endpoint_url, tier")
    .eq("user_id", user.user_id)
    .neq("status", "deleted");

  event.json(200, clusters || []);
};