import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function POST(req) {
  try {
    const { email, name, phone, plan, secret } = await req.json();

    if (secret !== process.env.HUB_SECRET) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const sql = neon(process.env.DATABASE_URL);

    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    const existing = await sql`SELECT * FROM users WHERE email = ${email}`;

    if (existing.length > 0) {
      await sql`
        UPDATE users SET status = 'active', expiry_date = ${expiryDate.toISOString()}, name = ${name}
        WHERE email = ${email}
      `;
    } else {
      await sql`
        INSERT INTO users (email, name, status, expiry_date)
        VALUES (${email}, ${name}, 'active', ${expiryDate.toISOString()})
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}