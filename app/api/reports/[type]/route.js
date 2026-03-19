import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const { type } = await params;
  return NextResponse.json({ type, data: [] });
}