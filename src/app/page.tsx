"use client";

import { useState } from "react";

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );

  async function handleSubmit() {
    if (!email || !email.includes("@")) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#F5F0E8",
        color: "#1C1917",
        fontFamily: "var(--font-sans), 'DM Sans', sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "0 1.5rem",
      }}
    >
      <nav
        style={{
          width: "100%",
          maxWidth: "1100px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1.5rem 0",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-serif), 'Playfair Display', serif",
            fontSize: "1.4rem",
          }}
        >
          Reflect<span style={{ color: "#C4622D" }}>o</span>
        </span>
        <a
          href="/dashboard"
          style={{
            background: "#1C1917",
            color: "#F5F0E8",
            padding: "0.5rem 1.25rem",
            borderRadius: "100px",
            fontSize: "0.875rem",
            textDecoration: "none",
          }}
        >
          Try web app →
        </a>
      </nav>

      <section
        style={{
          maxWidth: "700px",
          textAlign: "center",
          padding: "5rem 0 3rem",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "#EDE7D9",
            border: "1px solid rgba(28,25,23,0.12)",
            borderRadius: "100px",
            padding: "0.35rem 1rem",
            fontSize: "0.75rem",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "#A8A29E",
            marginBottom: "2rem",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#4A7C59",
              display: "inline-block",
            }}
          />
          Coming soon to iOS & Android
        </div>

        <h1
          style={{
            fontFamily: "var(--font-serif), 'Playfair Display', serif",
            fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            marginBottom: "1.25rem",
          }}
        >
          A few lines a day.
          <br />
          <em style={{ color: "#C4622D" }}>Surprisingly</em> powerful.
        </h1>

        <p
          style={{
            fontSize: "1.1rem",
            color: "#78716C",
            lineHeight: 1.65,
            marginBottom: "2.5rem",
            maxWidth: "480px",
            margin: "0 auto 2.5rem",
          }}
        >
          Reflecto is a micro-journal that fits into your life. Write a sentence
          or five, get an AI reflection, and build a streak worth keeping.
        </p>

        {status === "success" ? (
          <div
            style={{
              background: "rgba(74,124,89,0.1)",
              border: "1px solid rgba(74,124,89,0.2)",
              borderRadius: "16px",
              padding: "1.25rem 2rem",
              color: "#4A7C59",
              fontSize: "1rem",
            }}
          >
            ✦ You&apos;re on the list — we&apos;ll email you when we launch.
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <label htmlFor="waitlist-email" className="sr-only">
              Email address
            </label>
            <input
              id="waitlist-email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              style={{
                padding: "0.85rem 1.25rem",
                borderRadius: "100px",
                border: "1px solid rgba(28,25,23,0.15)",
                background: "#FDFAF5",
                fontSize: "1rem",
                width: "280px",
                outline: "none",
                color: "#1C1917",
              }}
            />
            <button
              type="button"
              onClick={handleSubmit}
              disabled={status === "loading"}
              style={{
                background: "#C4622D",
                color: "#F5F0E8",
                padding: "0.85rem 1.75rem",
                borderRadius: "100px",
                border: "none",
                fontSize: "1rem",
                fontWeight: 500,
                cursor: "pointer",
                opacity: status === "loading" ? 0.7 : 1,
              }}
            >
              {status === "loading" ? "Joining..." : "Join waitlist →"}
            </button>
          </div>
        )}
        {status === "error" && (
          <p
            style={{
              color: "#C4622D",
              fontSize: "0.85rem",
              marginTop: "0.75rem",
            }}
          >
            Something went wrong — try again.
          </p>
        )}

        <div
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            marginTop: "2rem",
            flexWrap: "wrap",
          }}
        >
          {["App Store", "Google Play"].map((store) => (
            <div
              key={store}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "rgba(28,25,23,0.05)",
                border: "1px solid rgba(28,25,23,0.1)",
                borderRadius: "12px",
                padding: "0.6rem 1.25rem",
                opacity: 0.5,
                cursor: "not-allowed",
              }}
            >
              <span style={{ fontSize: "0.8rem", color: "#1C1917" }}>
                {store}
              </span>
              <span
                style={{
                  fontSize: "0.65rem",
                  background: "#EDE7D9",
                  padding: "2px 8px",
                  borderRadius: "100px",
                  color: "#78716C",
                }}
              >
                Soon
              </span>
            </div>
          ))}
        </div>

        <p style={{ marginTop: "1rem", fontSize: "0.8rem", color: "#A8A29E" }}>
          Web app available now →{" "}
          <a href="/onboarding" style={{ color: "#C4622D", textDecoration: "none" }}>
            try it in your browser
          </a>
        </p>
      </section>

      <section style={{ maxWidth: "1000px", width: "100%", padding: "4rem 0" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {[
            {
              icon: "✦",
              title: "AI that actually gets it",
              desc: "After each entry, get a short honest reflection — not a therapy script.",
            },
            {
              icon: "⬡",
              title: "Streak tracking that motivates",
              desc: "Feel the gentle pull of not breaking the chain. It works.",
            },
            {
              icon: "◎",
              title: "Private by default",
              desc: "Every entry is private. Share only what you choose, only with people you trust.",
            },
          ].map((f) => (
            <div
              key={f.title}
              style={{
                background: "#FDFAF5",
                border: "1px solid rgba(28,25,23,0.08)",
                borderRadius: "20px",
                padding: "1.75rem",
              }}
            >
              <div
                style={{
                  fontSize: "1.5rem",
                  marginBottom: "1rem",
                  color: "#C4622D",
                }}
              >
                {f.icon}
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-serif), 'Playfair Display', serif",
                  fontSize: "1.1rem",
                  marginBottom: "0.5rem",
                }}
              >
                {f.title}
              </h3>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "#78716C",
                  lineHeight: 1.65,
                }}
              >
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <footer
        style={{
          width: "100%",
          maxWidth: "1100px",
          borderTop: "1px solid rgba(28,25,23,0.08)",
          padding: "2rem 0",
          marginTop: "auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          fontSize: "0.8rem",
          color: "#A8A29E",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-serif), 'Playfair Display', serif",
            color: "#1C1917",
          }}
        >
          Reflect<span style={{ color: "#C4622D" }}>o</span>
        </span>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          <a
            href="mailto:hello@reflecto.it.com"
            style={{ color: "#A8A29E", textDecoration: "none" }}
          >
            Contact
          </a>
          <a
            href="/onboarding"
            style={{ color: "#A8A29E", textDecoration: "none" }}
          >
            Web app
          </a>
        </div>
      </footer>
    </main>
  );
}
