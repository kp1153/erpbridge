import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const DEVELOPER_EMAIL = "prasad.kamta@gmail.com";
const BASE_URL = (
  process.env.NEXT_PUBLIC_URL || "https://erp.nishantsoftwares.in"
).replace(/\/$/, "");

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(BASE_URL + "/login?error=no_code");
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: BASE_URL + "/api/auth/callback",
      grant_type: "authorization_code",
    }),
  });

  const tokenData = await tokenRes.json();

  if (!tokenData.access_token) {
    return NextResponse.redirect(BASE_URL + "/login?error=no_token");
  }

  const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: "Bearer " + tokenData.access_token },
  });

  const user = await userRes.json();

  const payload = btoa(
    JSON.stringify({
      email: user.email,
      name: user.name,
      picture: user.picture,
    }),
  );

  const response = NextResponse.redirect(BASE_URL + "/dashboard");
  response.cookies.set("session", payload, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  if (user.email === DEVELOPER_EMAIL) {
    return response;
  }

  const sql = neon(process.env.DATABASE_URL);

  const existing = await sql`SELECT * FROM users WHERE email = ${user.email}`;

  if (existing.length === 0) {
    await sql`
      INSERT INTO users (email, name, active, created_at)
      VALUES (${user.email}, ${user.name}, 0, NOW())
    `;
  }

  const dbUser = (
    await sql`SELECT * FROM users WHERE email = ${user.email}`
  )[0];

  const now = new Date();
  const createdAt = new Date(dbUser.created_at);
  const daysSince = Math.ceil((now - createdAt) / (1000 * 60 * 60 * 24));

  if (dbUser.active === 1) {
    return response;
  }

  if (dbUser.active === 0 && daysSince <= 7) {
    return response;
  }

  return NextResponse.redirect(BASE_URL + "/expired");
}