import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { cookies } from "next/headers";

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session");
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const sql = neon(process.env.DATABASE_URL);
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month") || new Date().toISOString().slice(0, 7);

    const targets = await sql`
      SELECT so_name, month, target_amount, target_qty
      FROM so_targets
      WHERE month = ${month}
      ORDER BY so_name ASC
    `;

    return NextResponse.json({ targets });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session");
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { so_name, month, target_amount, target_qty } = await request.json();

    if (!so_name || !month) {
      return NextResponse.json({ error: "SO name और month ज़रूरी है" }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL);

    await sql`
      INSERT INTO so_targets (so_name, month, target_amount, target_qty, updated_at)
      VALUES (${so_name}, ${month}, ${target_amount || 0}, ${target_qty || 0}, NOW())
      ON CONFLICT (so_name, month)
      DO UPDATE SET
        target_amount = ${target_amount || 0},
        target_qty = ${target_qty || 0},
        updated_at = NOW()
    `;

    return NextResponse.json({ message: "Target save हो गया" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}