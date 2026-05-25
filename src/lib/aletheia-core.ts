export function getAletheiaDBCoreUrl(): string {
  return (import.meta.env.ALETHEIADB_URL || "http://localhost:3000").replace(/\/+$/, "");
}

export function getAdminKey(): string {
  return import.meta.env.ALETHEIADB_ADMIN_KEY || "82a2cd542b86763b5941fba04db9802928c53a27256fcccb64e12f414f69826a";
}

export interface CoreClusterStats {
  memory_count: number;
  entity_count: number;
  fact_count: number;
  storage_bytes: number;
  request_count?: number;
  ingest_count?: number;
  query_count?: number;
}

export async function provisionCluster(clusterId: string, userId: string): Promise<boolean> {
  try {
    const res = await fetch(`${getAletheiaDBCoreUrl()}/admin/clusters`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": getAdminKey() },
      body: JSON.stringify({ cluster_id: clusterId, user_id: userId }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function deprovisionCluster(clusterId: string): Promise<boolean> {
  try {
    const res = await fetch(`${getAletheiaDBCoreUrl()}/admin/clusters/${encodeURIComponent(clusterId)}`, {
      method: "DELETE",
      headers: { "x-api-key": getAdminKey() },
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function getCoreClusterStats(
  clusterId: string,
  endpointUrl?: string,
  engineKey?: string
): Promise<CoreClusterStats | null> {
  try {
    const url = endpointUrl ? endpointUrl.replace(/\/+$/, "") : getAletheiaDBCoreUrl();
    const key = engineKey || getAdminKey();
    
    const res = await fetch(
      `${url}/admin/clusters/${encodeURIComponent(clusterId)}/stats`,
      { headers: { "x-api-key": key } }
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export interface HardwareStats {
  cpu_usage_percent: number;
  ram_total_mb: number;
  ram_used_mb: number;
  storage_total_gb: number;
  storage_used_gb: number;
  gpu_usage_percent: number | null;
  gpu_ram_total_mb: number | null;
  gpu_ram_used_mb: number | null;
}

export async function getHardwareStats(
  endpointUrl?: string,
  engineKey?: string
): Promise<HardwareStats | null> {
  try {
    const url = endpointUrl ? endpointUrl.replace(/\/+$/, "") : getAletheiaDBCoreUrl();
    const key = engineKey || getAdminKey();
    
    const res = await fetch(
      `${url}/admin/stats/hardware`,
      { headers: { "x-api-key": key } }
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}


