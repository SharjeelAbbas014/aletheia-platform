export function getAletheiaCoreUrl(): string {
  return (import.meta.env.ALETHEIA_URL || "http://localhost:3000").replace(/\/+$/, "");
}

export function getAdminKey(): string {
  return import.meta.env.ALETHEIA_ADMIN_KEY || "82a2cd542b86763b5941fba04db9802928c53a27256fcccb64e12f414f69826a";
}

export interface CoreClusterStats {
  memory_count: number;
  entity_count: number;
  fact_count: number;
  storage_bytes: number;
}

export async function provisionCluster(clusterId: string, userId: string): Promise<boolean> {
  try {
    const res = await fetch(`${getAletheiaCoreUrl()}/admin/clusters`, {
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
    const res = await fetch(`${getAletheiaCoreUrl()}/admin/clusters/${encodeURIComponent(clusterId)}`, {
      method: "DELETE",
      headers: { "x-api-key": getAdminKey() },
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function getCoreClusterStats(clusterId: string): Promise<CoreClusterStats | null> {
  try {
    const res = await fetch(
      `${getAletheiaCoreUrl()}/admin/clusters/${encodeURIComponent(clusterId)}/stats`,
      { headers: { "x-api-key": getAdminKey() } }
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
