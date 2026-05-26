import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const body = await req.json();
    const { clusterId, region } = body;

    if (!clusterId || !region) {
      return new Response(JSON.stringify({ error: "Missing clusterId or region" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const clientId = Deno.env.get("AZURE_CLIENT_ID") || "";
    const clientSecret = Deno.env.get("AZURE_CLIENT_SECRET") || "";
    const tenantId = Deno.env.get("AZURE_TENANT_ID") || "";
    const subscriptionId = Deno.env.get("AZURE_SUBSCRIPTION_ID") || "";

    if (!clientId || !clientSecret || !tenantId || !subscriptionId) {
      return new Response(JSON.stringify({ error: "Azure credentials not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const authRes = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
      method: "POST",
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
        scope: "https://management.azure.com/.default",
      }),
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    if (!authRes.ok) {
      throw new Error(`Azure OAuth failed: ${await authRes.text()}`);
    }

    const { access_token: token } = await authRes.json();

    const vmName = `aletheia-vm-${clusterId.slice(0, 8)}`;
    const nicName = `${vmName}-nic`;
    const publicIpName = `${vmName}-pip`;
    const nsgName = `${vmName}-nsg`;
    const vnetName = `${vmName}-vnet`;
    const osDiskName = `${vmName}-osdisk`;
    const dataDiskName = `${vmName}-datadisk`;
    const rgName = `aletheia-rg-${region}`;
    const deploymentName = `aletheia-vm-deploy-${clusterId}`;

    const apiBase = `https://management.azure.com/subscriptions/${subscriptionId}/resourcegroups/${rgName}`;

    // Must delete in dependency order: VM → disks → NIC → IP → NSG → VNet
    const resources = [
      { type: "Microsoft.Compute/virtualMachines", name: vmName, ver: "2023-09-01" },
      { type: "Microsoft.Compute/disks", name: osDiskName, ver: "2023-09-01" },
      { type: "Microsoft.Compute/disks", name: dataDiskName, ver: "2023-09-01" },
      { type: "Microsoft.Network/networkInterfaces", name: nicName, ver: "2023-09-01" },
      { type: "Microsoft.Network/publicIPAddresses", name: publicIpName, ver: "2023-09-01" },
      { type: "Microsoft.Network/networkSecurityGroups", name: nsgName, ver: "2023-09-01" },
      { type: "Microsoft.Network/virtualNetworks", name: vnetName, ver: "2023-09-01" },
      { type: "Microsoft.Resources/deployments", name: deploymentName, ver: "2021-04-01" },
    ];

    const results: string[] = [];

    for (const r of resources) {
      const url = `${apiBase}/providers/${r.type}/${r.name}?api-version=${r.ver}`;
      const deleteRes = await fetch(url, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (deleteRes.status === 404) {
        results.push(`${r.name}: not-found`);
      } else if (deleteRes.ok || deleteRes.status === 202) {
        results.push(`${r.name}: deleted`);
      } else {
        const text = await deleteRes.text();
        results.push(`${r.name}: failed (${deleteRes.status})`);
        console.error(`[cleanup-vm] Failed to delete ${r.name}: ${text.slice(0, 200)}`);
      }
    }

    return new Response(JSON.stringify({ deleted: true, results }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error(`[cleanup-vm] Error: ${err.message}`);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});