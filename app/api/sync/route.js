import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session");
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const user = JSON.parse(atob(session.value));
    const sql = neon(process.env.DATABASE_URL);

    const existing = await sql`SELECT token FROM sync_tokens WHERE email = ${user.email}`;
    if (existing.length > 0) {
      return NextResponse.json({ token: existing[0].token });
    }

    const token = crypto.randomBytes(32).toString("hex");
    await sql`INSERT INTO sync_tokens (email, token) VALUES (${user.email}, ${token})`;

    return NextResponse.json({ token });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { token, transactions } = await req.json();

    if (!token || !transactions || !Array.isArray(transactions)) {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL);

    const tokenResult = await sql`SELECT email FROM sync_tokens WHERE token = ${token}`;
    if (tokenResult.length === 0) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const email = tokenResult[0].email;

    const validRows = [];
    for (const row of transactions) {
      const { type, party, amount, date } = row;
      if (!type || !amount || !date) continue;
      validRows.push({ email, type, party: party || "", amount: parseFloat(amount), date });
    }

    if (validRows.length === 0) {
      return NextResponse.json({ message: "No valid records", inserted: 0 });
    }

    const result = await sql`
      INSERT INTO transactions (email, type, party, amount, date)
      SELECT * FROM json_to_recordset(${JSON.stringify(validRows)}::json)
      AS t(email text, type text, party text, amount numeric, date date)
      ON CONFLICT DO NOTHING
      RETURNING id
    `;

    return NextResponse.json({
      message: `Sync complete. ${result.length} records inserted.`,
      inserted: result.length,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}