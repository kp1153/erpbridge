import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session");
    if (!session) return NextResponse.json({ settings: null }, { status: 401 });

    const user = JSON.parse(atob(session.value));
    const sql = neon(process.env.DATABASE_URL);

    const result = await sql`SELECT * FROM settings WHERE email = ${user.email}`;
    return NextResponse.json({ settings: result[0] || null });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session");
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const user = JSON.parse(atob(session.value));
    const { business_name, erp_type } = await req.json();
    const sql = neon(process.env.DATABASE_URL);

    const existing = await sql`SELECT * FROM settings WHERE email = ${user.email}`;

    if (existing.length > 0) {
      await sql`
        UPDATE settings SET business_name = ${business_name}, erp_type = ${erp_type}, updated_at = NOW()
        WHERE email = ${user.email}
      `;
    } else {
      await sql`
        INSERT INTO settings (email, business_name, erp_type)
        VALUES (${user.email}, ${business_name}, ${erp_type})
      `;
    }

    return NextResponse.json({ message: "Settings saved successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session");
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const sql = neon(process.env.DATABASE_URL);
    await sql`DELETE FROM transactions`;

    return NextResponse.json({ message: "All data cleared successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}