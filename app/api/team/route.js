import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session");
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = JSON.parse(atob(session.value));
    const sql = neon(process.env.DATABASE_URL);

    const members = await sql`
      SELECT id, member_email, role, created_at
      FROM team_members
      WHERE owner_email = ${user.email}
      ORDER BY created_at DESC
    `;

    return NextResponse.json({ members });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session");
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = JSON.parse(atob(session.value));
    const { member_email, role } = await request.json();

    if (!member_email || !role) {
      return NextResponse.json({ error: "Email और role ज़रूरी है" }, { status: 400 });
    }

    if (!["accountant", "viewer"].includes(role)) {
      return NextResponse.json({ error: "Role सिर्फ accountant या viewer हो सकता है" }, { status: 400 });
    }

    if (member_email === user.email) {
      return NextResponse.json({ error: "खुद को add नहीं कर सकते" }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL);

    await sql`
      INSERT INTO team_members (owner_email, member_email, role)
      VALUES (${user.email}, ${member_email}, ${role})
      ON CONFLICT (owner_email, member_email)
      DO UPDATE SET role = ${role}
    `;

    return NextResponse.json({ message: "Member add हो गया" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session");
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = JSON.parse(atob(session.value));
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID ज़रूरी है" }, { status: 400 });

    const sql = neon(process.env.DATABASE_URL);

    await sql`
      DELETE FROM team_members
      WHERE id = ${parseInt(id, 10)} AND owner_email = ${user.email}
    `;

    return NextResponse.json({ message: "Member remove हो गया" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}