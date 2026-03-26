import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session");
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { so_name, actual_amount, target_amount, amount_pct, month, phone } = await request.json();

    if (!so_name) {
      return NextResponse.json({ error: "SO name ज़रूरी है" }, { status: 400 });
    }

    const shortfall = Number(target_amount) - Number(actual_amount);
    const monthName = new Date(`${month}-01`).toLocaleString("hi-IN", { month: "long", year: "numeric" });

    const message = amount_pct >= 100
      ? `🎉 बधाई हो ${so_name}!\n\n*${monthName}* में आपने target पूरा कर लिया!\n✅ Target: ₹${Number(target_amount).toLocaleString("en-IN")}\n✅ Achieved: ₹${Number(actual_amount).toLocaleString("en-IN")}\n\nशानदार काम! 💪`
      : `⚠️ ${so_name} जी,\n\n*${monthName}* का target अभी बाकी है।\n🎯 Target: ₹${Number(target_amount).toLocaleString("en-IN")}\n📊 Achieved: ₹${Number(actual_amount).toLocaleString("en-IN")} (${amount_pct || 0}%)\n❗ बाकी: ₹${shortfall.toLocaleString("en-IN")}\n\nमेहनत जारी रखें! 🚀`;

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