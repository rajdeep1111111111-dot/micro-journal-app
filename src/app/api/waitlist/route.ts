import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const ipMap = new Map<string, number>();

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const last = ipMap.get(ip) ?? 0;
  if (Date.now() - last < 60_000) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  ipMap.set(ip, Date.now());

  try {
    const { email } = await req.json();
    if (!email || !email.includes("@") || email.length > 254) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    const { error } = await resend.contacts.create({
      email,
      unsubscribed: false,
      audienceId: process.env.RESEND_AUDIENCE_ID!,
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
