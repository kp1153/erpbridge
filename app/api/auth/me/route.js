import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { neon } from "@neondatabase/serverless";

const DEVELOPER_EMAIL = "prasad.kamta@gmail.com";

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");

  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  try {
    const user = JSON.parse(
      Buffer.from(session.value, "base64").toString("utf-8")
    );

    if (user.email === DEVELOPER_EMAIL) {
      return NextResponse.json({
        user,
        active: 1,
        status: "active",
        daysLeft: 999,
      });
    }

    const sql = neon(process.env.DATABASE_URL);
    const rows = await sql`
      SELECT active, status, expiry_date
      FROM users
      WHERE email = ${user.email}
    `;

    if (rows.length === 0) {
      return NextResponse.json({
        user,
        active: 0,
        status: "expired",
        daysLeft: 0,
      });
    }

    const dbUser = rows[0];
    const now = new Date();
    const expiry = dbUser.expiry_date ? new Date(dbUser.expiry_date) : null;

    let daysLeft = 0;
    if (expiry) {
      const diffMs = expiry - now;
      daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    }

    return NextResponse.json({
      user,
      active: dbUser.active,
      status: dbUser.status,
      daysLeft,
    });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}