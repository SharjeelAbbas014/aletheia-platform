import type { RequestEventCommon } from "@builder.io/qwik-city";
import { getAdminSupabaseClient } from "./supabase";
import { getCurrentUser } from "./auth";

export const DEFAULT_TEST_API_KEY = "82a2cd542b86763b5941fba04db9802928c53a27256fcccb64e12f414f69826a";

export interface ApiKey {
  key_id: string;
  name: string;
  key_prefix: string;
  created_at_ms: number;
  last_used_ms: number | null;
  disabled: boolean;
  token?: string; // Only returned on creation
}

export interface UsageStats {
    request_count: number;
    ingest_count: number;
    query_count: number;
    temporal_query_count: number;
    last_request_ms: number | null;
}

export async function getApiKeys(event: RequestEventCommon): Promise<ApiKey[]> {
  try {
    const user = getCurrentUser(event.cookie);
    if (!user) return [];

    const supabase = getAdminSupabaseClient(event.env);
    const { data, error } = await supabase
        .from("api_keys")
        .select("*")
        .eq("user_id", user.user_id)
        .order("created_at", { ascending: false });

    if (error || !data) return [];

    return data.map((d: any) => ({
        key_id: d.id,
        name: d.name,
        key_prefix: d.key_value.substring(0, 8),
        created_at_ms: new Date(d.created_at).getTime(),
        last_used_ms: d.last_used_at ? new Date(d.last_used_at).getTime() : null,
        disabled: !d.is_active
    }));
  } catch (e) {
    return [];
  }
}

export async function createApiKey(event: RequestEventCommon, name: string, clusterId?: string): Promise<ApiKey | null> {
  try {
    const user = getCurrentUser(event.cookie);
    if (!user) return null;

    const supabase = getAdminSupabaseClient(event.env);
    // Generate a secure API Key prefix
    const rawKey = `aletheia-sk-${crypto.randomUUID().replace(/-/g, '')}${crypto.randomUUID().replace(/-/g, '').substring(0, 16)}`;

    const { data, error } = await supabase
        .from("api_keys")
        .insert({
            user_id: user.user_id,
            name,
            key_value: rawKey,
            cluster_id: clusterId || null
        })
        .select()
        .single();

    if (error || !data) {
        console.error("Supabase API Key Creation Error", error);
        return null;
    }

    // Push the key to the cluster if it's a dedicated / user-deployed server
    if (clusterId) {
      const { data: cluster } = await supabase
          .from("clusters")
          .select("endpoint_url, engine_key")
          .eq("id", clusterId)
          .maybeSingle();

      if (cluster && cluster.engine_key) {
        try {
          const res = await fetch(`${cluster.endpoint_url.replace(/\/+$/, "")}/admin/api_keys`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": cluster.engine_key,
            },
            body: JSON.stringify({
              key_id: data.id,
              user_id: user.user_id,
              name,
              token: rawKey,
              cluster_id: clusterId,
            }),
          });
          if (!res.ok) {
            console.error(`Failed to inject key to custom cluster ${clusterId}: ${res.status} ${await res.text()}`);
          }
        } catch (injectErr: any) {
          console.error(`Failed to connect to cluster ${clusterId} for key injection:`, injectErr.message);
        }
      }
    }

    return {
        key_id: data.id,
        name: data.name,
        key_prefix: data.key_value.substring(0, 8),
        created_at_ms: new Date(data.created_at).getTime(),
        last_used_ms: null,
        disabled: !data.is_active,
        token: rawKey // Intentionally return the full raw token only upon creation
    };
  } catch (e) {
    return null;
  }
}

export async function revokeApiKey(event: RequestEventCommon, keyId: string): Promise<boolean> {
  try {
    const user = getCurrentUser(event.cookie);
    if (!user) return false;

    const supabase = getAdminSupabaseClient(event.env);
    
    // Get cluster info for this key to revoke it from the custom server if needed
    const { data: keyInfo } = await supabase
        .from("api_keys")
        .select("cluster_id")
        .eq("id", keyId)
        .eq("user_id", user.user_id)
        .maybeSingle();

    const { error } = await supabase
        .from("api_keys")
        .delete()
        .eq("id", keyId)
        .eq("user_id", user.user_id);

    if (error) return false;

    if (keyInfo && keyInfo.cluster_id) {
      const { data: cluster } = await supabase
          .from("clusters")
          .select("endpoint_url, engine_key")
          .eq("id", keyInfo.cluster_id)
          .maybeSingle();

      if (cluster && cluster.engine_key) {
        try {
          const res = await fetch(`${cluster.endpoint_url.replace(/\/+$/, "")}/admin/api_keys/${encodeURIComponent(keyId)}`, {
            method: "DELETE",
            headers: {
              "x-api-key": cluster.engine_key,
            },
          });
          if (!res.ok) {
            console.error(`Failed to revoke key from custom cluster ${keyInfo.cluster_id}: ${res.status}`);
          }
        } catch (revokeErr: any) {
          console.error(`Failed to connect to cluster ${keyInfo.cluster_id} for key revocation:`, revokeErr.message);
        }
      }
    }

    return true;
  } catch (e) {
    return false;
  }
}


export async function getUsageStats(event: RequestEventCommon): Promise<UsageStats | null> {
  try {
    const user = getCurrentUser(event.cookie);
    if (!user) return null;

    const supabase = getAdminSupabaseClient(event.env);

    // 1. Fetch all clusters for the user to get their IDs
    const { data: clusters, error: clustersErr } = await supabase
      .from("clusters")
      .select("id")
      .eq("user_id", user.user_id)
      .neq("status", "deleted");

    if (clustersErr || !clusters || clusters.length === 0) {
      return {
        request_count: 0,
        ingest_count: 0,
        query_count: 0,
        temporal_query_count: 0,
        last_request_ms: null
      };
    }

    const clusterIds = clusters.map(c => c.id);

    // 2. Fetch daily usage for all these clusters
    const { data: usageData, error: usageErr } = await supabase
      .from("usage_daily")
      .select("request_count, ingest_count, query_count, graph_ops")
      .in("cluster_id", clusterIds);

    if (usageErr || !usageData) {
      return {
        request_count: 0,
        ingest_count: 0,
        query_count: 0,
        temporal_query_count: 0,
        last_request_ms: null
      };
    }

    // 3. Aggregate usage
    const totals = usageData.reduce(
      (acc, d) => ({
        request_count: acc.request_count + (d.request_count || 0),
        ingest_count: acc.ingest_count + (d.ingest_count || 0),
        query_count: acc.query_count + (d.query_count || 0),
        temporal_query_count: acc.temporal_query_count + (d.graph_ops || 0),
      }),
      { request_count: 0, ingest_count: 0, query_count: 0, temporal_query_count: 0 }
    );

    return {
      ...totals,
      last_request_ms: null
    };
  } catch (e) {
    console.error("Error fetching usage stats:", e);
    return null;
  }
}
