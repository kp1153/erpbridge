import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { Resend } from "resend";

const DEVELOPER_EMAIL = "prasad.kamta@gmail.com";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(process.env.NEXT_PUBLIC_URL + "/login?error=no_code");
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.NEXT_PUBLIC_URL + "/api/auth/callback/google",
      grant_type: "authorization_code",
    }),
  });

  const tokenData = await tokenRes.json();

  if (!tokenData.access_token) {
    return NextResponse.redirect(process.env.NEXT_PUBLIC_URL + "/login?error=no_token");
  }

  const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: "Bearer " + tokenData.access_token },
  });

  const user = await userRes.json();

  const payload = btoa(JSON.stringify({ email: user.email, name: user.name, picture: user.picture }));
  const response = NextResponse.redirect(process.env.NEXT_PUBLIC_URL + "/dashboard");
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
      INSERT INTO users (email, name, status, trial_start, expiry_date)
      VALUES (${user.email}, ${user.name}, 'trial', NOW(), NOW() + INTERVAL '7 days')
    `;
  }

  const dbUser = existing.length > 0 ? existing[0] : (await sql`SELECT * FROM users WHERE email = ${user.email}`)[0];

  const now = new Date();
  const expiry = new Date(dbUser.expiry_date);
  const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

  if (now > expiry) {
    await sql`UPDATE users SET status = 'expired' WHERE email = ${user.email}`;
    return NextResponse.redirect(
      "https://web-developer-kp.com/payment?software=erpbridge&email=" + encodeURIComponent(user.email)
    );
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    if (dbUser.status === "active" && daysLeft <= 7) {
      await resend.emails.send({
        from: "ERPBridge <no-reply@web-developer-kp.com>",
        to: user.email,
        subject: "ERPBridge — Renewal Reminder",
        html: `<p>Dear ${user.name},</p><p>Your ERPBridge subscription expires in <strong>${daysLeft} day(s)</strong>.</p><p>Renew now at just ₹4,999/year: <a href="https://web-developer-kp.com/payment?software=erpbridge&email=${encodeURIComponent(user.email)}">Click here to renew</a></p><p>Team ERPBridge</p>`,
      });
    }
    if (dbUser.status === "trial" && daysLeft <= 1) {
      await resend.emails.send({
        from: "ERPBridge <no-reply@web-developer-kp.com>",
        to: user.email,
        subject: "ERPBridge — Trial समाप्त होने वाला है",
        html: `<p>Dear ${user.name},</p><p>आपका ERPBridge free trial <strong>कल समाप्त</strong> हो जाएगा।</p><p>अभी खरीदें — ₹11,999 (1 साल included): <a href="https://web-developer-kp.com/payment?software=erpbridge&email=${encodeURIComponent(user.email)}">यहाँ click करें</a></p><p>Team ERPBridge</p>`,
      });
    }
  } catch (e) {
    console.error("Resend error:", e);
  }

  return response;
}