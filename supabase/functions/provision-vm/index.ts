import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface ProvisionRequest {
  clusterId: string;
  tier: string;
  region: string;
  vmSize: string;
  storageGb: number;
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const steps: string[] = [];

  try {
    const body: ProvisionRequest = await req.json();
    const { clusterId, tier, region, vmSize, storageGb } = body;
    steps.push(`parsed body: clusterId=${clusterId}, tier=${tier}, region=${region}, vmSize=${vmSize}, storageGb=${storageGb}`);

    if (!clusterId || !tier || !region || !vmSize) {
      return new Response(JSON.stringify({ error: "Missing required fields", steps }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    const clientId = Deno.env.get("AZURE_CLIENT_ID") || "";
    const clientSecret = Deno.env.get("AZURE_CLIENT_SECRET") || "";
    const tenantId = Deno.env.get("AZURE_TENANT_ID") || "";
    const subscriptionId = Deno.env.get("AZURE_SUBSCRIPTION_ID") || "";
    const adminKey = Deno.env.get("ALETHEIADB_ADMIN_KEY") || "";

    steps.push(`env: clientId=${clientId ? "set" : "MISSING"}, clientSecret=${clientSecret ? "set" : "MISSING"}, tenantId=${tenantId ? "set" : "MISSING"}, subscriptionId=${subscriptionId ? "set" : "MISSING"}`);

    if (!clientId || !clientSecret || !tenantId || !subscriptionId) {
      await supabase.from("clusters").update({ status: "failed" }).eq("id", clusterId);
      return new Response(JSON.stringify({ error: "Azure credentials not configured", steps }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 1. Authenticate with Azure AD
    steps.push("authenticating with Azure AD...");
    const authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
    const authRes = await fetch(authUrl, {
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
      const text = await authRes.text();
      steps.push(`auth failed: ${authRes.status}`);
      await supabase.from("clusters").update({ status: "failed" }).eq("id", clusterId);
      return new Response(JSON.stringify({ error: `Azure OAuth failed (${authRes.status}): ${text}`, steps }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const authData = await authRes.json();
    const token = authData.access_token;
    steps.push(`auth succeeded, token length=${token?.length || 0}`);

    // 2. Ensure resource group
    const rgName = `aletheia-rg-${region}`;
    steps.push(`creating resource group: ${rgName}...`);
    const rgUrl = `https://management.azure.com/subscriptions/${subscriptionId}/resourcegroups/${rgName}?api-version=2021-04-01`;
    const rgRes = await fetch(rgUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ location: region }),
    });

    if (!rgRes.ok) {
      const rgText = await rgRes.text();
      steps.push(`resource group failed: ${rgRes.status}`);
      await supabase.from("clusters").update({ status: "failed" }).eq("id", clusterId);
      return new Response(JSON.stringify({ error: `Resource group creation failed (${rgRes.status}): ${rgText}`, steps }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
    steps.push(`resource group ready: ${rgName}`);

    // 3. Build and submit ARM template
    const vmName = `aletheia-vm-${clusterId.slice(0, 8)}`;
    const armTemplate = buildARMTemplate(clusterId, vmName, vmSize, storageGb, region, adminKey);

    const deploymentName = `aletheia-vm-deploy-${clusterId}`;
    const deployUrl = `https://management.azure.com/subscriptions/${subscriptionId}/resourcegroups/${rgName}/providers/Microsoft.Resources/deployments/${deploymentName}?api-version=2021-04-01`;

    steps.push(`submitting ARM deployment: ${deploymentName} to ${rgName}...`);
    const deployRes = await fetch(deployUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        properties: { mode: "Incremental", template: armTemplate },
      }),
    });

    const deployStatus = deployRes.status;
    const deployText = await deployRes.text();
    steps.push(`ARM response: status=${deployStatus}, ok=${deployRes.ok}, bodyLength=${deployText.length}`);

    if (!deployRes.ok) {
      const isSkuError = deployText.includes("SkuNotAvailable");
      const errorMsg = isSkuError
        ? `VM size ${vmSize} is not available in ${region}. Try a different region.`
        : `ARM deployment failed (${deployStatus}): ${deployText.slice(0, 500)}`;

      await supabase.from("clusters").update({ status: "failed" }).eq("id", clusterId);
      return new Response(JSON.stringify({ error: errorMsg, steps }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    steps.push("deployment accepted by Azure");

    // Update cluster with region
    await supabase.from("clusters").update({ region }).eq("id", clusterId);

    return new Response(JSON.stringify({ submitted: true, region, deploymentName, steps }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    steps.push(`exception: ${err.message}`);
    return new Response(JSON.stringify({ error: err.message, steps }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

function buildARMTemplate(
  clusterId: string,
  vmName: string,
  size: string,
  storageGb: number,
  region: string,
  adminKey: string,
): Record<string, unknown> {
  const nicName = `${vmName}-nic`;
  const publicIpName = `${vmName}-pip`;
  const nsgName = `${vmName}-nsg`;
  const vnetName = `${vmName}-vnet`;

  return {
    $schema: "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
    contentVersion: "1.0.0.0",
    parameters: {},
    resources: [
      {
        type: "Microsoft.Network/publicIPAddresses",
        apiVersion: "2023-09-01",
        name: publicIpName,
        location: region,
        sku: { name: "Standard" },
        properties: {
          publicIPAllocationMethod: "Static",
          dnsSettings: { domainNameLabel: vmName.toLowerCase() },
        },
      },
      {
        type: "Microsoft.Network/networkSecurityGroups",
        apiVersion: "2023-09-01",
        name: nsgName,
        location: region,
        properties: {
          securityRules: [
            {
              name: "SSH",
              properties: {
                protocol: "Tcp",
                sourcePortRange: "*",
                destinationPortRange: "22",
                sourceAddressPrefix: "*",
                destinationAddressPrefix: "*",
                access: "Allow",
                priority: 1000,
                direction: "Inbound",
              },
            },
            {
              name: "AletheiaDB-API",
              properties: {
                protocol: "Tcp",
                sourcePortRange: "*",
                destinationPortRange: "8443",
                sourceAddressPrefix: "*",
                destinationAddressPrefix: "*",
                access: "Allow",
                priority: 1001,
                direction: "Inbound",
              },
            },
          ],
        },
      },
      {
        type: "Microsoft.Network/virtualNetworks",
        apiVersion: "2023-09-01",
        name: vnetName,
        location: region,
        properties: {
          addressSpace: { addressPrefixes: ["10.0.0.0/16"] },
          subnets: [
            {
              name: "default",
              properties: {
                addressPrefix: "10.0.0.0/24",
                networkSecurityGroup: {
                  id: `[resourceId('Microsoft.Network/networkSecurityGroups', '${nsgName}')]`,
                },
              },
            },
          ],
        },
        dependsOn: [nsgName],
      },
      {
        type: "Microsoft.Network/networkInterfaces",
        apiVersion: "2023-09-01",
        name: nicName,
        location: region,
        properties: {
          ipConfigurations: [
            {
              name: "ipconfig1",
              properties: {
                subnet: {
                  id: `[resourceId('Microsoft.Network/virtualNetworks/subnets', '${vnetName}', 'default')]`,
                },
                publicIPAddress: {
                  id: `[resourceId('Microsoft.Network/publicIPAddresses', '${publicIpName}')]`,
                },
              },
            },
          ],
        },
        dependsOn: [vnetName, publicIpName],
      },
      {
        type: "Microsoft.Compute/virtualMachines",
        apiVersion: "2023-09-01",
        name: vmName,
        location: region,
        properties: {
          hardwareProfile: { vmSize: size },
          storageProfile: {
            imageReference: {
              publisher: "Canonical",
              offer: "0001-com-ubuntu-server-jammy",
              sku: "22_04-lts-gen2",
              version: "latest",
            },
            osDisk: {
              createOption: "FromImage",
              managedDisk: { storageAccountType: "Premium_LRS" },
              diskSizeGB: 30,
            },
            dataDisks: [
              {
                lun: 0,
                createOption: "Empty",
                diskSizeGB: storageGb,
                managedDisk: { storageAccountType: "Premium_LRS" },
              },
            ],
          },
          osProfile: {
            computerName: vmName,
            adminUsername: "aletheia",
            adminPassword: generatePassword(),
            linuxConfiguration: { disablePasswordAuthentication: false },
          },
          networkProfile: {
            networkInterfaces: [
              { id: `[resourceId('Microsoft.Network/networkInterfaces', '${nicName}')]`, properties: { primary: true } },
            ],
          },
          diagnosticsProfile: { bootDiagnostics: { enabled: false } },
        },
        dependsOn: [nicName],
      },
      {
        type: "Microsoft.Compute/virtualMachines/extensions",
        apiVersion: "2023-09-01",
        name: `${vmName}/bootstrap`,
        location: region,
        properties: {
          publisher: "Microsoft.Azure.Extensions",
          type: "CustomScript",
          typeHandlerVersion: "2.1",
          autoUpgradeMinorVersion: true,
          settings: {
            commandToExecute: `curl -sSfL "https://aletheiadb.com/install.sh" | bash -s -- --admin-key "${adminKey}" --cluster-id "${clusterId}" --data-disk "/dev/disk/azure/scsi1/lun0"`,
          },
        },
        dependsOn: [vmName],
      },
    ],
  };
}

function generatePassword(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
  let p = "Aletheia1!";
  for (let i = 0; i < 20; i++) {
    p += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return p;
}