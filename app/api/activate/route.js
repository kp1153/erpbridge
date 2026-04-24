import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function POST(req) {
  try {
    const authHeader = req.headers.get("authorization");
    const body = await req.json();
    const { email, name, secret } = body;

    // Secret — header OR body दोनों accept करो (master rule: body में भी)
    const secretValid =
      authHeader === `Bearer ${process.env.HUB_SECRET}` ||
      secret === process.env.HUB_SECRET;

    if (!secretValid) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email required" },
        { status: 400 }
      );
    }

    const sql = neon(process.env.DATABASE_URL);

    // 1 साल की expiry
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1);

    // Check — user पहले से मौजूद है?
    const existing = await sql`SELECT id FROM users WHERE email = ${email}`;

    if (existing.length === 0) {
      // User अभी login नहीं किया — pre_activations में save करो
      try {
        await sql`
          INSERT INTO pre_activations (email)
          VALUES (${email})
          ON CONFLICT (email) DO NOTHING
        `;
      } catch (_) {
        // duplicate ignore
      }

      return NextResponse.json({
        success: true,
        message: "pre-activated — user will be activated on next login",
      });
    }

    // User मौजूद है — सीधे activate करो
    await sql`
      UPDATE users
      SET status = 'active',
          active = 1,
          expiry_date = ${expiry.toISOString()},
          reminder_sent = 0,
          name = COALESCE(${name}, name)
      WHERE email = ${email}
    `;

    return NextResponse.json({ success: true, message: "activated" });
  } catch (error) {
    console.error("[activate]", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}