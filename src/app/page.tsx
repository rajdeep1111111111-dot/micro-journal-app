"use client";

import { useState, useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback": () => void;
          "error-callback": () => void;
        },
      ) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

const phrases = [
  "Finally finished the presentation.",
  "Finally finished the presentation. Nervous but proud.",
  "Finally finished the presentation. Nervous but proud. The team clapped — didn't expect that.",
];

function TypingAnimation() {
  const [displayed, setDisplayed] = useState("");
  const [showAI, setShowAI] = useState(false);
  const charRef = useRef(0);
  const phaseRef = useRef(0);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    function type() {
      const target = phrases[phaseRef.current];
      charRef.current++;
      setDisplayed(target.slice(0, charRef.current));
      if (charRef.current === target.length) {
        if (phaseRef.current < phrases.length - 1) {
          timeout = setTimeout(() => {
            phaseRef.current++;
            charRef.current = 0;
            type();
          }, 600);
        } else {
          timeout = setTimeout(() => setShowAI(true), 800);
        }
        return;
      }
      timeout = setTimeout(type, 45);
    }
    timeout = setTimeout(type, 1200);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div
      style={{
        background: "#FDFAF5",
        borderRadius: 12,
        padding: "0.75rem",
        marginBottom: "0.65rem",
        border: "1px solid rgba(28,25,23,0.07)",
      }}
    >
      <div
        style={{
          fontSize: "0.55rem",
          color: "#78716C",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          marginBottom: "0.3rem",
        }}
      >
        Today · 9:41 PM
      </div>
      <div
        style={{
          fontSize: "0.65rem",
          color: "#1C1917",
          lineHeight: 1.55,
          minHeight: "1.5rem",
        }}
      >
        {displayed}
        <span
          style={{
            display: "inline-block",
            width: 1,
            height: "0.7rem",
            background: "#1C1917",
            marginLeft: 1,
            animation: "blink 1s infinite",
          }}
        />
      </div>
      {showAI && (
        <div
          style={{
            background: "rgba(74,124,89,0.1)",
            borderRadius: 8,
            padding: "0.5rem 0.65rem",
            marginTop: "0.5rem",
            display: "flex",
            alignItems: "flex-start",
            gap: "0.35rem",
          }}
        >
          <span
            style={{
              fontSize: "0.6rem",
              color: "#4A7C59",
              flexShrink: 0,
              marginTop: 1,
            }}
          >
            ✦
          </span>
          <span
            style={{
              fontSize: "0.58rem",
              color: "#4A7C59",
              lineHeight: 1.5,
            }}
          >
            There&apos;s real growth in that nervousness — it means you care.
            The applause was earned, not given.
          </span>
        </div>
      )}
    </div>
  );
}

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const turnstileRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetIdRef = useRef<string | null>(null);
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!turnstileSiteKey || !turnstileRef.current) return;

    const renderTurnstile = () => {
      if (
        !window.turnstile ||
        !turnstileRef.current ||
        turnstileWidgetIdRef.current
      ) {
        return;
      }

      turnstileWidgetIdRef.current = window.turnstile.render(
        turnstileRef.current,
        {
          sitekey: turnstileSiteKey,
          callback: setTurnstileToken,
          "expired-callback": () => setTurnstileToken(""),
          "error-callback": () => setTurnstileToken(""),
        },
      );
    };

    if (window.turnstile) {
      renderTurnstile();
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://challenges.cloudflare.com/turnstile/v0/api.js"]',
    );
    if (existingScript) {
      existingScript.addEventListener("load", renderTurnstile, { once: true });
      return () => existingScript.removeEventListener("load", renderTurnstile);
    }

    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    script.addEventListener("load", renderTurnstile, { once: true });
    document.body.appendChild(script);

    return () => script.removeEventListener("load", renderTurnstile);
  }, [turnstileSiteKey]);

  async function handleSubmit() {
    if (!email || !email.includes("@")) return;
    if (turnstileSiteKey && !turnstileToken) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, turnstileToken }),
      });
      if (res.ok) {
        setStatus("success");
        setEmail("");
        setTurnstileToken("");
        window.turnstile?.reset(turnstileWidgetIdRef.current ?? undefined);
      } else {
        setStatus("error");
        setTurnstileToken("");
        window.turnstile?.reset(turnstileWidgetIdRef.current ?? undefined);
      }
    } catch {
      setStatus("error");
      setTurnstileToken("");
      window.turnstile?.reset(turnstileWidgetIdRef.current ?? undefined);
    }
  }

  return (
    <main
      style={{
        background: "#F5F0E8",
        color: "#1C1917",
        fontFamily: "'DM Sans', sans-serif",
        minHeight: "100vh",
      }}
    >
      <style>{`
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .hero-content { animation: fadeUp 0.6s ease both; }
        .phone-wrap { animation: fadeUp 0.8s 0.15s ease both; }
      `}</style>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 1.5rem" }}>
        <nav
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1.5rem 0",
          }}
        >
          <span
            style={{
              fontFamily: "'Playfair Display', serif",
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
              borderRadius: 100,
              fontSize: "0.875rem",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Try web app →
          </a>
        </nav>

        <section
          className="hero-content"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            padding: "3rem 0 2rem",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "#EDE7D9",
              border: "1px solid rgba(28,25,23,0.12)",
              borderRadius: 100,
              padding: "0.35rem 1rem",
              fontSize: "0.7rem",
              fontWeight: 500,
              letterSpacing: "0.06em",
              color: "#78716C",
              textTransform: "uppercase",
              marginBottom: "1.75rem",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#4A7C59",
                display: "inline-block",
                flexShrink: 0,
              }}
            />
            Coming soon to iOS & Android
          </div>

          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(2.4rem, 6vw, 4rem)",
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
              fontSize: "1.05rem",
              color: "#78716C",
              lineHeight: 1.65,
              marginBottom: "2.5rem",
              maxWidth: 460,
            }}
          >
            Reflecto is a micro-journal that fits into your life. Write a
            sentence or five, get an AI reflection, and build a streak worth
            keeping.
          </p>

          <div className="phone-wrap" style={{ marginBottom: "2.5rem" }}>
            <div
              style={{
                background: "#1C1917",
                borderRadius: 44,
                padding: "16px 12px",
                boxShadow:
                  "0 40px 80px rgba(28,25,23,0.22), 0 0 0 1px rgba(28,25,23,0.1)",
                position: "relative",
                width: 260,
              }}
            >
              <div
                style={{
                  width: 80,
                  height: 24,
                  background: "#1C1917",
                  borderRadius: "0 0 16px 16px",
                  position: "absolute",
                  top: 0,
                  left: "50%",
                  transform: "translateX(-50%)",
                  zIndex: 2,
                }}
              />
              <div
                style={{
                  background: "#F5F0E8",
                  borderRadius: 30,
                  overflow: "hidden",
                  minHeight: 480,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    background: "#EDE7D9",
                    padding: "1rem 1rem 0.8rem",
                    borderBottom: "1px solid rgba(28,25,23,0.08)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.6rem",
                      color: "#78716C",
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                    }}
                  >
                    Friday, 23 May
                  </div>
                  <div
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "1.05rem",
                      color: "#1C1917",
                      marginTop: "0.1rem",
                    }}
                  >
                    Good evening ✦
                  </div>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 3,
                      background: "#1C1917",
                      color: "#F5F0E8",
                      borderRadius: 100,
                      padding: "2px 10px",
                      fontSize: "0.6rem",
                      marginTop: "0.5rem",
                    }}
                  >
                    🔥 14-day streak
                  </div>
                </div>

                <div style={{ padding: "0.85rem", flex: 1 }}>
                  <div
                    style={{
                      background: "#FDFAF5",
                      borderRadius: 12,
                      padding: "0.8rem",
                      marginBottom: "0.7rem",
                      border: "1px solid rgba(28,25,23,0.07)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.57rem",
                        color: "#78716C",
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                        marginBottom: "0.3rem",
                      }}
                    >
                      Yesterday · 10:12 PM
                    </div>
                    <div
                      style={{
                        fontSize: "0.67rem",
                        color: "#1C1917",
                        lineHeight: 1.55,
                      }}
                    >
                      Quiet day. Made a good coffee. Read 40 pages. Sometimes
                      that&apos;s enough.
                    </div>
                    <div
                      style={{
                        background: "rgba(74,124,89,0.1)",
                        borderRadius: 8,
                        padding: "0.5rem 0.65rem",
                        marginTop: "0.5rem",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "0.35rem",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.6rem",
                          color: "#4A7C59",
                          flexShrink: 0,
                          marginTop: 1,
                        }}
                      >
                        ✦
                      </span>
                      <span
                        style={{
                          fontSize: "0.6rem",
                          color: "#4A7C59",
                          lineHeight: 1.5,
                        }}
                      >
                        Rest days matter too. You gave yourself permission to
                        slow down.
                      </span>
                    </div>
                  </div>
                  <TypingAnimation />
                </div>

                <div
                  style={{
                    background: "#1C1917",
                    padding: "0.65rem 1rem",
                    display: "flex",
                    justifyContent: "space-around",
                    alignItems: "center",
                  }}
                >
                  {[
                    { label: "Home", active: true },
                    { label: "Journal", active: false },
                    { label: "Friends", active: false },
                    { label: "You", active: false },
                  ].map((item) => (
                    <div
                      key={item.label}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 2,
                        opacity: item.active ? 1 : 0.4,
                      }}
                    >
                      <div
                        style={{
                          width: 3,
                          height: 3,
                          borderRadius: "50%",
                          background: item.active ? "#F5F0E8" : "transparent",
                          border: item.active
                            ? "none"
                            : "1px solid rgba(245,240,232,0.3)",
                        }}
                      />
                      <span
                        style={{
                          fontSize: "0.5rem",
                          color: "#F5F0E8",
                          letterSpacing: "0.04em",
                          textTransform: "uppercase",
                          fontWeight: 500,
                        }}
                      >
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {status === "success" ? (
            <div
              style={{
                background: "rgba(74,124,89,0.1)",
                border: "1px solid rgba(74,124,89,0.2)",
                borderRadius: 14,
                padding: "1rem 1.5rem",
                color: "#4A7C59",
                fontSize: "0.9rem",
                marginBottom: "1.25rem",
                width: "100%",
                maxWidth: 420,
              }}
            >
              ✦ You&apos;re on the list — we&apos;ll email you when we launch.
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                gap: "0.6rem",
                flexWrap: "wrap",
                justifyContent: "center",
                marginBottom: "1rem",
                width: "100%",
                maxWidth: 420,
              }}
            >
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                style={{
                  padding: "0.8rem 1.1rem",
                  borderRadius: 100,
                  border: "1px solid rgba(28,25,23,0.15)",
                  background: "#FDFAF5",
                  fontSize: "0.9rem",
                  flex: 1,
                  minWidth: 180,
                  color: "#1C1917",
                  outline: "none",
                  fontFamily: "inherit",
                }}
              />
              <button
                onClick={handleSubmit}
                disabled={status === "loading" || (!!turnstileSiteKey && !turnstileToken)}
                style={{
                  background: "#C4622D",
                  color: "#F5F0E8",
                  padding: "0.8rem 1.5rem",
                  borderRadius: 100,
                  border: "none",
                  fontSize: "0.9rem",
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  opacity:
                    status === "loading" || (!!turnstileSiteKey && !turnstileToken)
                      ? 0.6
                      : 1,
                }}
              >
                {status === "loading" ? "Joining..." : "Join waitlist →"}
              </button>
              {turnstileSiteKey && (
                <div
                  ref={turnstileRef}
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                  }}
                />
              )}
            </div>
          )}

          {status === "error" && (
            <p
              style={{
                color: "#C4622D",
                fontSize: "0.8rem",
                marginBottom: "0.75rem",
              }}
            >
              Something went wrong — try again.
            </p>
          )}

          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              flexWrap: "wrap",
              justifyContent: "center",
              marginBottom: "1rem",
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
                  borderRadius: 10,
                  padding: "0.5rem 1rem",
                  opacity: 0.5,
                  cursor: "not-allowed",
                }}
              >
                <span style={{ fontSize: "0.78rem", color: "#1C1917" }}>
                  {store}
                </span>
                <span
                  style={{
                    fontSize: "0.6rem",
                    background: "#EDE7D9",
                    padding: "2px 7px",
                    borderRadius: 100,
                    color: "#78716C",
                  }}
                >
                  Soon
                </span>
              </div>
            ))}
          </div>

          <p style={{ fontSize: "0.78rem", color: "#78716C" }}>
            Web app available now →{" "}
            <a
              href="/dashboard"
              style={{ color: "#C4622D", textDecoration: "none" }}
            >
              try it in your browser
            </a>
          </p>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "1.25rem",
            padding: "3rem 0 5rem",
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
              desc: "Feel the gentle pull of not breaking the chain. Watch your progress build.",
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
                borderRadius: 18,
                padding: "1.5rem",
              }}
            >
              <div
                style={{
                  fontSize: "1.2rem",
                  color: "#C4622D",
                  marginBottom: "0.9rem",
                }}
              >
                {f.icon}
              </div>
              <h3
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "1rem",
                  marginBottom: "0.4rem",
                }}
              >
                {f.title}
              </h3>
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "#78716C",
                  lineHeight: 1.6,
                }}
              >
                {f.desc}
              </p>
            </div>
          ))}
        </section>

        <footer
          style={{
            borderTop: "1px solid rgba(28,25,23,0.08)",
            padding: "1.75rem 0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "0.78rem",
            color: "#78716C",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <span
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "#1C1917",
            }}
          >
            Reflect<span style={{ color: "#C4622D" }}>o</span>
          </span>
          <div style={{ display: "flex", gap: "1.25rem" }}>
            <a
              href="mailto:hello@reflecto.it.com"
              style={{ color: "#78716C", textDecoration: "none" }}
            >
              Contact
            </a>
            <a
              href="/dashboard"
              style={{ color: "#78716C", textDecoration: "none" }}
            >
              Web app
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}
