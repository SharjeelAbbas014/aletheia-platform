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

    // Delete the ARM deployment (removes all resources created by it)
    const rgName = `aletheia-rg-${region}`;
    const deploymentName = `aletheia-vm-deploy-${clusterId}`;
    const deleteUrl = `https://management.azure.com/subscriptions/${subscriptionId}/resourcegroups/${rgName}/providers/Microsoft.Resources/deployments/${deploymentName}?api-version=2021-04-01`;

    const deleteRes = await fetch(deleteUrl, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!deleteRes.ok && deleteRes.status !== 404) {
      const text = await deleteRes.text();
      throw new Error(`Azure cleanup failed: ${text}`);
    }

    return new Response(JSON.stringify({ deleted: true }), {
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