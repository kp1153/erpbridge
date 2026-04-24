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

  // 1. Google से token लाओ
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

  // 2. User info लाओ
  const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: "Bearer " + tokenData.access_token },
  });

  const user = await userRes.json();

  if (!user.email) {
    return NextResponse.redirect(BASE_URL + "/login?error=no_email");
  }

  // 3. Session cookie payload तैयार
  const payload = btoa(
    JSON.stringify({
      email: user.email,
      name: user.name,
      picture: user.picture,
    })
  );

  const sql = neon(process.env.DATABASE_URL);

  // 4. Developer whitelist — सीधा dashboard
  if (user.email === DEVELOPER_EMAIL) {
    const response = NextResponse.redirect(BASE_URL + "/dashboard");
    response.cookies.set("session", payload, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return response;
  }

  // 5. User check
  const existing = await sql`SELECT * FROM users WHERE email = ${user.email}`;

  if (existing.length === 0) {
    // नया user — 7 दिन का trial दो
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);

    await sql`
      INSERT INTO users (email, name, active, status, expiry_date, reminder_sent, created_at)
      VALUES (${user.email}, ${user.name}, 0, 'trial', ${expiry.toISOString()}, 0, NOW())
    `;

    // pre_activations check — क्या इसने पहले ही pay कर दिया था?
    const preAct = await sql`
      SELECT email FROM pre_activations WHERE email = ${user.email}
    `;

    if (preAct.length > 0) {
      // हाँ — तुरंत activate करो, 1 साल की expiry
      const newExpiry = new Date();
      newExpiry.setFullYear(newExpiry.getFullYear() + 1);

      await sql`
        UPDATE users
        SET status = 'active',
            active = 1,
            expiry_date = ${newExpiry.toISOString()},
            reminder_sent = 0
        WHERE email = ${user.email}
      `;

      await sql`DELETE FROM pre_activations WHERE email = ${user.email}`;
    }
  }

  // 6. ताज़ा user data निकालो (ऊपर INSERT/UPDATE हो चुका है)
  const dbUser = (
    await sql`SELECT active, status, expiry_date FROM users WHERE email = ${user.email}`
  )[0];

  // 7. Redirect decision
  const now = new Date();
  const expiry = dbUser.expiry_date ? new Date(dbUser.expiry_date) : null;

  // Active paid user
  if (dbUser.active === 1 && dbUser.status === "active") {
    const response = NextResponse.redirect(BASE_URL + "/dashboard");
    response.cookies.set("session", payload, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return response;
  }

  // Trial running — expiry future में है
  if (dbUser.status === "trial" && expiry && now < expiry) {
    const response = NextResponse.redirect(BASE_URL + "/dashboard");
    response.cookies.set("session", payload, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return response;
  }

  // बाकी सब — expired
  const response = NextResponse.redirect(BASE_URL + "/expired");
  response.cookies.set("session", payload, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return response;
}