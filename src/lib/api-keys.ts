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

export async function createApiKey(event: RequestEventCommon, name: string): Promise<ApiKey | null> {
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
            key_value: rawKey
        })
        .select()
        .single();

    if (error || !data) {
        console.error("Supabase API Key Creation Error", error);
        return null;
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
    const { error } = await supabase
        .from("api_keys")
        .delete()
        .eq("id", keyId)
        .eq("user_id", user.user_id);

    return !error;
  } catch (e) {
    return false;
  }
}

export async function getUsageStats(event: RequestEventCommon): Promise<UsageStats | null> {
    // For now we mock the usage stats since it doesn't have a Supabase table.
    return {
        request_count: 0,
        ingest_count: 0,
        query_count: 0,
        temporal_query_count: 0,
        last_request_ms: null
    };
}
