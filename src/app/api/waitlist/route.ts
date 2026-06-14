import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";

const resend = new Resend(process.env.RESEND_API_KEY);
const EMAIL_PATTERN =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

function getClientIp(req: NextRequest) {
  const forwardedFor = req.headers.get("x-forwarded-for");
  const firstForwardedIp = forwardedFor?.split(",")[0]?.trim();
  return firstForwardedIp || req.headers.get("x-real-ip") || "unknown";
}

async function verifyTurnstileToken(token: string | undefined, ip: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    console.warn("TURNSTILE_SECRET_KEY is not configured; skipping CAPTCHA verification.");
    return true;
  }

  if (!token) return false;

  const formData = new FormData();
  formData.append("secret", secret);
  formData.append("response", token);
  if (ip !== "unknown") formData.append("remoteip", ip);

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.ok) return false;
  const result = (await response.json()) as { success?: boolean };
  return result.success === true;
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const supabase = await createClient();
    const { data: allowed, error: rateLimitError } = await supabase.rpc(
      "check_rate_limit",
      {
        key: `waitlist:${ip}`,
        max_count: 5,
        window_seconds: 60 * 60,
      },
    );

    if (rateLimitError || allowed !== true) {
      console.warn("Waitlist rate limit blocked", {
        ip,
        error: rateLimitError?.message,
      });
      return NextResponse.json(
        { error: "Unable to join the waitlist right now." },
        { status: 400 },
      );
    }

    const { email, turnstileToken } = await req.json();
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    if (
      normalizedEmail.length > 254 ||
      !EMAIL_PATTERN.test(normalizedEmail)
    ) {
      console.warn("Invalid waitlist email submitted", { ip });
      return NextResponse.json(
        { error: "Unable to join the waitlist right now." },
        { status: 400 },
      );
    }

    const captchaPassed = await verifyTurnstileToken(
      typeof turnstileToken === "string" ? turnstileToken : undefined,
      ip,
    );
    if (!captchaPassed) {
      console.warn("Waitlist CAPTCHA verification failed", { ip });
      return NextResponse.json(
        { error: "Unable to join the waitlist right now." },
        { status: 400 },
      );
    }

    const { error } = await resend.contacts.create({
      email: normalizedEmail,
      unsubscribed: false,
      audienceId: process.env.RESEND_AUDIENCE_ID!,
    });
    if (error) {
      console.error("Resend waitlist create failed", { error: error.message });
      return NextResponse.json(
        { error: "Unable to join the waitlist right now." },
        { status: 500 },
      );
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Waitlist API error", err);
    return NextResponse.json(
      { error: "Unable to join the waitlist right now." },
      { status: 500 },
    );
  }
}
