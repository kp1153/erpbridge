import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session");
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { party, balance, phone } = await request.json();

    if (!party || !balance) {
      return NextResponse.json({ error: "party और balance ज़रूरी है" }, { status: 400 });
    }

    const message = `नमस्ते,\n\n*${party}* का हमारे यहाँ *₹${Number(balance).toLocaleString("en-IN")}* outstanding बाकी है।\n\nकृपया जल्द भुगतान करें।\n\nधन्यवाद 🙏`;
    const encodedMessage = encodeURIComponent(message);

    let waUrl;
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, "");
      const withCountry = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`;
      waUrl = `https://wa.me/${withCountry}?text=${encodedMessage}`;
    } else {
      waUrl = `https://wa.me/?text=${encodedMessage}`;
    }

    return NextResponse.json({ waUrl, message });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}