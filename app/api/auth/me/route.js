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
      return NextResponse.json({ user, status: "active", daysLeft: 999 });
    }

    const sql = neon(process.env.DATABASE_URL);
    const rows = await sql`SELECT status, expiry_date FROM users WHERE email = ${user.email}`;

    if (rows.length === 0) {
      return NextResponse.json({ user, status: "expired", daysLeft: 0 });
    }

    const dbUser = rows[0];
    const now = new Date();
    const expiry = new Date(dbUser.expiry_date);
    const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

    if (now > expiry) {
      return NextResponse.json({ user, status: "expired", daysLeft: 0 });
    }

    return NextResponse.json({ user, status: dbUser.status, daysLeft: Math.max(0, daysLeft) });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}