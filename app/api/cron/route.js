import { neon } from "@neondatabase/serverless";

export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sql = neon(process.env.DATABASE_URL);
  const now = new Date();

  const users = await sql`
    SELECT * FROM users WHERE status IN ('trial', 'active')
  `;

  const results = [];

  for (const user of users) {
    const expiry = new Date(user.expiry_date);
    const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

    let type = null;

    if (daysLeft <= 0) {
      await sql`UPDATE users SET status = 'expired' WHERE email = ${user.email}`;
      type = "trial_expired";
    } else if (daysLeft === 1 || daysLeft === 3 || daysLeft === 7) {
      type = user.status === "trial" ? "trial_expiring" : "renewal_reminder";
    }

    if (type) {
      await fetch(`${process.env.NEXT_PUBLIC_URL}/api/remind`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret: process.env.CRON_SECRET,
          email: user.email,
          name: user.name,
          software: user.software || "erpbridge",
          daysLeft: Math.max(daysLeft, 0),
          type,
        }),
      });
      results.push({ email: user.email, type, daysLeft });
    }
  }

  return Response.json({ success: true, processed: results.length, results });
}