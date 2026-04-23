import { NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_URL || "https://erp.nishantsoftwares.in";

export async function GET() {
  const redirectUri = `${BASE_URL.replace(/\/$/, "")}/api/auth/callback`;

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
  });

  return NextResponse.redirect(
    "https://accounts.google.com/o/oauth2/v2/auth?" + params.toString()
  );
}