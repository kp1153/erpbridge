import { NextResponse } from "next/server";

export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!file) {
    return NextResponse.json({ message: "No file received" }, { status: 400 });
  }

  return NextResponse.json({ message: "File received: " + file.name });
}