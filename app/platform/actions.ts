"use server";

import { revalidatePath } from "next/cache";

import { createApiKey, revokeApiKey } from "@/lib/api-keys";
import { requireAuth } from "@/lib/auth";

export async function createApiKeyAction(formData: FormData) {
  await requireAuth();
  const name = String(formData.get("name") ?? "Default production key");
  await createApiKey(name);
  revalidatePath("/platform");
}

export async function revokeApiKeyAction(formData: FormData) {
  await requireAuth();
  const id = String(formData.get("id") ?? "");
  if (id) {
    await revokeApiKey(id);
  }
  revalidatePath("/platform");
}

