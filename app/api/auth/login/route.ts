import { NextResponse } from "next/server";

import { createSession, validateCredentials } from "@/lib/auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!validateCredentials(email, password)) {
    return NextResponse.redirect(new URL("/login?error=1", request.url), 303);
  }

  await createSession(email);
  return NextResponse.redirect(new URL("/platform", request.url), 303);
}

