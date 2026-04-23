import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function POST(req) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.HUB_SECRET}`) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { email, name } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, message: "Email required" }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL);

    const existing = await sql`SELECT * FROM users WHERE email = ${email}`;

    if (existing.length > 0) {
      await sql`
        UPDATE users SET active = 1, name = ${name}
        WHERE email = ${email}
      `;
    } else {
      await sql`
        INSERT INTO users (email, name, active, created_at)
        VALUES (${email}, ${name}, 1, NOW())
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}