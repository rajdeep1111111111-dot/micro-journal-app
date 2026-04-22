import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        minHeight: "100vh",
        background: "#E8E2D9",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "430px",
          minHeight: "100vh",
          background: "var(--cream)",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -80,
            width: 280,
            height: 280,
            borderRadius: "50%",
            background: "var(--accent)",
            opacity: 0.12,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 40,
            right: -40,
            width: 160,
            height: 160,
            borderRadius: "50%",
            background: "var(--green)",
            opacity: 0.1,
          }}
        />

        <div style={{ padding: "80px 40px 0", position: "relative" }}>
          <div style={{ marginBottom: "24px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/apple-touch-icon.png"
              alt="Reflecto"
              style={{ width: 72, height: 72, borderRadius: "20px" }}
            />
          </div>
          <div
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "42px",
              fontWeight: 600,
              color: "var(--ink)",
              lineHeight: 1.1,
              marginBottom: "16px",
            }}
          >
            Reflect.
            <br />
            Every day.
          </div>
          <div
            style={{
              fontSize: "16px",
              color: "var(--ink-soft)",
              lineHeight: 1.7,
              fontWeight: 300,
            }}
          >
            A quiet space to journal your thoughts, get AI-powered reflections,
            and share your journey with people you trust.
          </div>
        </div>

        <div style={{ padding: "48px 40px 0" }}>
          {[
            {
              icon: "✍",
              title: "Daily journaling",
              sub: "Write freely, as much or as little as you want",
            },
            {
              icon: "✦",
              title: "AI reflections",
              sub: "Get thoughtful insights on what you've written",
            },
            {
              icon: "◎",
              title: "Share with friends",
              sub: "Share entries with people you choose",
            },
            {
              icon: "⌘",
              title: "Track your streak",
              sub: "Build a journaling habit, one day at a time",
            },
          ].map((feat, i) => (
            <div
              key={feat.title}
              style={{
                display: "flex",
                gap: "16px",
                alignItems: "flex-start",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  background:
                    i % 2 === 0 ? "var(--accent-light)" : "var(--green-light)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  flexShrink: 0,
                }}
              >
                {feat.icon}
              </div>
              <div>
                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: 500,
                    color: "var(--ink)",
                    marginBottom: "2px",
                  }}
                >
                  {feat.title}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "var(--ink-muted)",
                    lineHeight: 1.5,
                  }}
                >
                  {feat.sub}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: "40px 40px 60px", marginTop: "auto" }}>
          <Link href="/auth/login?mode=signup" style={{ textDecoration: "none" }}>
            <div
              style={{
                background: "var(--ink)",
                color: "white",
                borderRadius: "16px",
                padding: "16px",
                textAlign: "center",
                fontSize: "16px",
                fontWeight: 500,
                marginBottom: "12px",
                cursor: "pointer",
              }}
            >
              Get started — it&apos;s free
            </div>
          </Link>
          <Link href="/auth/login" style={{ textDecoration: "none" }}>
            <div
              style={{
                background: "transparent",
                color: "var(--ink-soft)",
                borderRadius: "16px",
                padding: "16px",
                textAlign: "center",
                fontSize: "15px",
                border: "1px solid var(--cream-dark)",
                cursor: "pointer",
              }}
            >
              I already have an account
            </div>
          </Link>
          <p
            style={{
              textAlign: "center",
              fontSize: "12px",
              color: "var(--ink-muted)",
              marginTop: "20px",
              lineHeight: 1.6,
            }}
          >
            No ads. No tracking. Just you and your thoughts.
          </p>
        </div>
      </div>
    </div>
  );
}
