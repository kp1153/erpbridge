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
    const user = JSON.parse(atob(session.value));

    if (user.email === DEVELOPER_EMAIL) {
      return NextResponse.json({ user, active: 1, daysLeft: 999 });
    }

    const sql = neon(process.env.DATABASE_URL);
    const rows = await sql`SELECT active, created_at FROM users WHERE email = ${user.email}`;

    if (rows.length === 0) {
      return NextResponse.json({ user, active: 0, daysLeft: 0 });
    }

    const dbUser = rows[0];
    const now = new Date();
    const createdAt = new Date(dbUser.created_at);
    const daysSince = Math.ceil((now - createdAt) / (1000 * 60 * 60 * 24));
    const daysLeft = Math.max(0, 7 - daysSince);

    return NextResponse.json({ user, active: dbUser.active, daysLeft });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}