import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import * as XLSX from "xlsx";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    if (!rows || rows.length === 0) {
      return NextResponse.json({ message: "File is empty or unreadable" }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL);

    let inserted = 0;
    let skipped = 0;

    for (const row of rows) {
      const type = String(row["type"] || row["Type"] || row["TYPE"] || "").trim();
      const party = String(row["party"] || row["Party"] || row["PARTY"] || row["name"] || row["Name"] || "").trim();
      const amount = parseFloat(row["amount"] || row["Amount"] || row["AMOUNT"] || 0);
      const rawDate = row["date"] || row["Date"] || row["DATE"] || "";

      let date = null;
      if (rawDate) {
        const parsed = new Date(rawDate);
        if (!isNaN(parsed.getTime())) {
          date = parsed.toISOString().split("T")[0];
        }
      }

      if (!type || !amount || !date) {
        skipped++;
        continue;
      }

      await sql`
        INSERT INTO transactions (type, party, amount, date)
        VALUES (${type}, ${party}, ${amount}, ${date})
      `;
      inserted++;
    }

    return NextResponse.json({
      message: `Upload complete. ${inserted} records saved, ${skipped} skipped.`,
      inserted,
      skipped,
    });
  } catch (error) {
    return NextResponse.json({ message: "Upload failed: " + error.message }, { status: 500 });
  }
}