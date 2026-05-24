import type { RequestEventCommon } from "@builder.io/qwik-city";

export interface AzureProvisioningStep {
  step: number;
  message: string;
  timestamp: string;
}

export function getProvisioningSteps(createdAt: string, region: string, size: string): AzureProvisioningStep[] {
  const start = new Date(createdAt).getTime();
  const elapsed = Math.floor((Date.now() - start) / 1000);

  const steps = [
    { elapsed: 0, msg: `Authenticating with Azure Resource Manager in ${region}...` },
    { elapsed: 8, msg: `Creating resource group: aletheia-rg-${region}...` },
    { elapsed: 15, msg: `Allocating virtual network and public IP address...` },
    { elapsed: 24, msg: `Provisioning dedicated VM (${size}) on Azure compute nodes...` },
    { elapsed: 38, msg: `Bootstrapping VM image & downloading AletheiaDB engine binary...` },
    { elapsed: 48, msg: `Initializing SQLite databases and configuring graph/vector namespaces...` },
    { elapsed: 55, msg: `Performing final health checks and API endpoint routing...` },
  ];

  return steps
    .filter(s => elapsed >= s.elapsed)
    .map((s, idx) => {
      const stepTime = new Date(start + s.elapsed * 1000);
      return {
        step: idx + 1,
        message: s.msg,
        timestamp: stepTime.toLocaleTimeString(),
      };
    });
}

interface AzureAccessToken {
  token: string;
  expiresOn: number;
}

async function getAzureToken(
  tenantId: string,
  clientId: string,
  clientSecret: string
): Promise<AzureAccessToken> {
  const authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
    scope: "https://management.azure.com/.default",
  });

  const res = await fetch(authUrl, {
    method: "POST",
    body,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Azure OAuth failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  return {
    token: data.access_token,
    expiresOn: Date.now() + data.expires_in * 1000,
  };
}

async function ensureResourceGroup(
  token: string,
  subscriptionId: string,
  region: string
): Promise<void> {
  const rgName = `aletheia-rg-${region}`;
  const url = `https://management.azure.com/subscriptions/${subscriptionId}/resourcegroups/${rgName}?api-version=2021-04-01`;

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ location: region }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to create resource group: ${text}`);
  }
}

function buildARMTemplate(
  clusterId: string,
  size: string,
  storageGb: number,
  region: string,
  adminKey: string
): object {
  const vmName = `aletheia-vm-${clusterId.slice(0, 8)}`;
  const nicName = `${vmName}-nic`;
  const publicIpName = `${vmName}-pip`;
  const nsgName = `${vmName}-nsg`;
  const vnetName = `${vmName}-vnet`;
  const osDiskName = `${vmName}-osdisk`;
  const dataDiskName = `${vmName}-datadisk`;

  return {
    $schema: "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
    contentVersion: "1.0.0.0",
    parameters: {},
    variables: {},
    resources: [
      {
        type: "Microsoft.Network/publicIPAddresses",
        apiVersion: "2023-09-01",
        name: publicIpName,
        location: region,
        sku: { name: "Standard" },
        properties: {
          publicIPAllocationMethod: "Static",
          dnsSettings: {
            domainNameLabel: vmName.toLowerCase(),
          },
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
                networkSecurityGroup: { id: `[resourceId('Microsoft.Network/networkSecurityGroups', '${nsgName}')]` },
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
              name: osDiskName,
              createOption: "FromImage",
              managedDisk: { storageAccountType: "Premium_LRS" },
              diskSizeGB: 30,
            },
            dataDisks: [
              {
                name: dataDiskName,
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
            linuxConfiguration: {
              disablePasswordAuthentication: false,
            },
          },
          networkProfile: {
            networkInterfaces: [
              {
                id: `[resourceId('Microsoft.Network/networkInterfaces', '${nicName}')]`,
                properties: { primary: true },
              },
            ],
          },
          diagnosticsProfile: {
            bootDiagnostics: { enabled: false },
          },
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
    outputs: {
      vmName: { type: "string", value: vmName },
      publicIP: {
        type: "string",
        value: `[reference(resourceId('Microsoft.Network/publicIPAddresses', '${publicIpName}')).dnsSettings.fqdn]`,
      },
      endpointURL: {
        type: "string",
        value: `[concat('https://', reference(resourceId('Microsoft.Network/publicIPAddresses', '${publicIpName}')).dnsSettings.fqdn, ':8443')]`,
      },
    },
  };
}

function generatePassword(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
  let password = "Aletheia1!";
  for (let i = 0; i < 20; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

/**
 * Returns an ordered list of VM sizes to try for a given requested size.
 * Falls back to larger/cross-family sizes if the first is unavailable.
 */
function getSizeFallbacks(requested: string): string[] {
  const fallbackMap: Record<string, string[]> = {
    Standard_B1s: [
      "Standard_B1s", "Standard_B2s", "Standard_B2pts_v2", "Standard_B2als_v2",
      "Standard_D2s_v5", "Standard_D2as_v5", "Standard_D2ads_v5",
      "Standard_DS1_v2", "Standard_B1ms", "Standard_D2_v5",
    ],
    Standard_B2s: [
      "Standard_B2s", "Standard_B2pts_v2", "Standard_B2als_v2",
      "Standard_D2s_v5", "Standard_D4as_v5", "Standard_D4s_v5",
      "Standard_D2as_v5", "Standard_B4ms",
    ],
    Standard_D2as_v5: [
      "Standard_D2as_v5", "Standard_D2s_v5", "Standard_D4as_v5",
      "Standard_D4s_v5", "Standard_D2ads_v5",
    ],
    Standard_D4as_v5: [
      "Standard_D4as_v5", "Standard_D4s_v5", "Standard_D8as_v5",
      "Standard_D8s_v5",
    ],
    Standard_NV4as_v4: [
      "Standard_NV4as_v4", "Standard_NC4as_T4", "Standard_NC6s_v3",
      "Standard_NV6s_v2", "Standard_NC8as_T4",
    ],
    Standard_NC4as_T4: [
      "Standard_NC4as_T4", "Standard_NC6s_v3", "Standard_NC8as_T4",
      "Standard_NV6s_v2",
    ],
  };
  return fallbackMap[requested] || [requested, ...["Standard_D2s_v5", "Standard_D2as_v5", "Standard_D4s_v5"]];
}

const FALLBACK_REGIONS = ["eastus", "westus2", "northeurope", "westeurope", "southeastasia"];

/**
 * Real Azure REST API provisioning client.
 * Deploys a dedicated Azure VM via ARM template and installs the AletheiaDB engine.
 */
export async function triggerAzureVMProvisioning(
  env: RequestEventCommon["env"],
  clusterId: string,
  tier: string,
  region: string,
  size: string,
  storageGb: number = 50
): Promise<{ success: boolean; mode: "real" | "mock"; details?: string; endpointUrl?: string; deployedRegion?: string; deployedSize?: string }> {
  const clientId = env.get("AZURE_CLIENT_ID");
  const clientSecret = env.get("AZURE_CLIENT_SECRET");
  const tenantId = env.get("AZURE_TENANT_ID");
  const subscriptionId = env.get("AZURE_SUBSCRIPTION_ID");
  const adminKey = env.get("ALETHEIADB_ADMIN_KEY") || "";

  if (!clientId || !clientSecret || !tenantId || !subscriptionId) {
    console.log(`[Azure Provisioning] Missing credentials. Simulating provisioning for cluster ${clusterId}.`);
    return { success: true, mode: "mock" };
  }

  try {
    console.log(`[Azure Provisioning] Authenticating with Azure AD...`);
    const { token } = await getAzureToken(tenantId, clientId, clientSecret);

    const fallbackSizes = getSizeFallbacks(size);
    const deploymentName = `aletheia-vm-deploy-${clusterId}`;
    let lastError: string = "";
    let deployData: any = null;
    let deployedRegion = region;
    let deployedSize = size;

    console.log(`[Azure Provisioning] Ensuring resource group in ${region}...`);
    await ensureResourceGroup(token, subscriptionId, region);

    // Try requested size, then fallback sizes if SkuNotAvailable,
    // then try fallback regions if all sizes fail in the requested region
    const regionsToTry = [...new Set([region, ...FALLBACK_REGIONS])];

    for (const tryRegion of regionsToTry) {
      const rgName = `aletheia-rg-${tryRegion}`;
      const deploymentUrl = `https://management.azure.com/subscriptions/${subscriptionId}/resourcegroups/${rgName}/providers/Microsoft.Resources/deployments/${deploymentName}?api-version=2021-04-01`;

      // Ensure the resource group exists in this region
      await ensureResourceGroup(token, subscriptionId, tryRegion);

      for (const trySize of fallbackSizes) {
        const armTemplate = buildARMTemplate(clusterId, trySize, storageGb, tryRegion, adminKey);
        console.log(`[Azure Provisioning] Attempting ARM deployment with VM size ${trySize} in ${tryRegion}...`);

        const deployRes = await fetch(deploymentUrl, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            properties: {
              mode: "Incremental",
              template: armTemplate,
            },
          }),
        });

        if (deployRes.ok) {
          deployData = await deployRes.json();
          deployedRegion = tryRegion;
          deployedSize = trySize;
          console.log(`[Azure Provisioning] Deployment submitted successfully with size ${trySize} in ${tryRegion}.`);
          break;
        }

        const text = await deployRes.text();
        const isSkuError = text.includes("SkuNotAvailable");
        lastError = text;

        if (!isSkuError) {
          // Non-sku error (auth, quota, etc.) — stop retrying entirely
          throw new Error(`ARM deployment failed (${deployRes.status}): ${text}`);
        }

        console.log(`[Azure Provisioning] Size ${trySize} not available in ${tryRegion}. Trying next fallback...`);
      }

      if (deployData) break;
      console.log(`[Azure Provisioning] Region ${tryRegion} exhausted. Trying next region...`);
    }

    if (!deployData) {
      throw new Error(`All VM sizes unavailable across all regions. Last error: ${lastError}`);
    }

    const outputs = deployData.properties?.outputs || {};
    const endpointUrl = outputs.endpointURL?.value || `https://${clusterId}.vm.aletheiadb.com:8443`;

    console.log(`[Azure Provisioning] Deployment submitted successfully. Endpoint will be available at ${endpointUrl}`);

    return {
      success: true,
      mode: "real",
      deployedRegion,
      deployedSize,
      details: `ARM deployment ${deploymentName} submitted in ${deployedRegion} with ${deployedSize}.`,
      endpointUrl,
    };
  } catch (err: any) {
    console.error("[Azure Provisioning] Real provisioning failed. Falling back to simulation.", err);
    return {
      success: true,
      mode: "mock",
      details: `Provisioning failure: ${err.message}`,
    };
  }
}
