"use client";

import { useState, useEffect, useRef } from "react";

const phrases = [
  "Finally finished the presentation.",
  "Finally finished the presentation. Nervous but proud.",
  "Finally finished the presentation. Nervous but proud. The team clapped — didn't expect that.",
];

function TypingAnimation() {
  const [displayed, setDisplayed] = useState("");
  const [, setPhase] = useState(0);
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
            setPhase(phaseRef.current);
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
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

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
        background: "#F5F0E8",
        color: "#1C1917",
        fontFamily: "var(--font-sans), 'DM Sans', sans-serif",
        minHeight: "100vh",
      }}
    >
      <style>{`
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .hero-left { animation: fadeUp 0.6s ease both; }
        .phone-wrap { animation: fadeUp 0.8s 0.2s ease both; }
        .join-btn:hover { opacity: 0.88; }
        .store-badge { transition: opacity 0.2s; }
        .feat-card:hover { transform: translateY(-3px); transition: transform 0.2s; }
        @media (max-width: 700px) {
          .hero { grid-template-columns: 1fr !important; }
          .hero-right { order: -1; }
          .features-grid { grid-template-columns: 1fr !important; }
          footer { flex-direction: column; gap: 1rem; text-align: center; }
        }
      `}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 1.5rem" }}>
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
          className="hero"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "4rem",
            alignItems: "center",
            padding: "4rem 0 5rem",
            minHeight: "80vh",
          }}
        >
          <div className="hero-left">
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
                fontFamily: "var(--font-serif), 'Playfair Display', serif",
                fontSize: "clamp(2.2rem, 4vw, 3.8rem)",
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
                fontSize: "1rem",
                color: "#78716C",
                lineHeight: 1.65,
                marginBottom: "2rem",
                maxWidth: 400,
              }}
            >
              Reflecto is a micro-journal that fits into your life. Write a
              sentence or five, get an AI reflection, and build a streak worth
              keeping.
            </p>

            {status === "success" ? (
              <div
                style={{
                  background: "rgba(74,124,89,0.1)",
                  border: "1px solid rgba(74,124,89,0.2)",
                  borderRadius: 14,
                  padding: "1rem 1.5rem",
                  color: "#4A7C59",
                  fontSize: "0.9rem",
                  marginBottom: "1rem",
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
                  marginBottom: "1rem",
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
                    padding: "0.75rem 1.1rem",
                    borderRadius: 100,
                    border: "1px solid rgba(28,25,23,0.15)",
                    background: "#FDFAF5",
                    fontSize: "0.9rem",
                    width: 230,
                    color: "#1C1917",
                    outline: "none",
                    fontFamily: "inherit",
                  }}
                />
                <button
                  type="button"
                  className="join-btn"
                  onClick={handleSubmit}
                  disabled={status === "loading"}
                  style={{
                    background: "#C4622D",
                    color: "#F5F0E8",
                    padding: "0.75rem 1.5rem",
                    borderRadius: 100,
                    border: "none",
                    fontSize: "0.9rem",
                    fontWeight: 500,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    opacity: status === "loading" ? 0.6 : 1,
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
                marginBottom: "1rem",
              }}
            >
              {["App Store", "Google Play"].map((store) => (
                <div
                  key={store}
                  className="store-badge"
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
          </div>

          <div
            className="hero-right"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div className="phone-wrap" style={{ width: 240 }}>
              <div
                style={{
                  background: "#1C1917",
                  borderRadius: 36,
                  padding: "14px 10px",
                  boxShadow:
                    "0 40px 80px rgba(28,25,23,0.2), 0 0 0 1px rgba(28,25,23,0.1)",
                  position: "relative",
                  width: 240,
                }}
              >
                <div
                  style={{
                    width: 70,
                    height: 20,
                    background: "#1C1917",
                    borderRadius: "0 0 14px 14px",
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
                    borderRadius: 26,
                    overflow: "hidden",
                    minHeight: 460,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      background: "#EDE7D9",
                      padding: "0.85rem 0.85rem 0.7rem",
                      borderBottom: "1px solid rgba(28,25,23,0.08)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.58rem",
                        color: "#78716C",
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                      }}
                    >
                      Friday, 23 May
                    </div>
                    <div
                      style={{
                        fontFamily:
                          "var(--font-serif), 'Playfair Display', serif",
                        fontSize: "1rem",
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
                        padding: "2px 8px",
                        fontSize: "0.58rem",
                        marginTop: "0.4rem",
                      }}
                    >
                      🔥 14-day streak
                    </div>
                  </div>

                  <div style={{ padding: "0.8rem", flex: 1 }}>
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
                        Yesterday · 10:12 PM
                      </div>
                      <div
                        style={{
                          fontSize: "0.65rem",
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
                            fontSize: "0.58rem",
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
                      padding: "0.6rem 0.8rem",
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
                      <span
                        key={item.label}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 2,
                          opacity: item.active ? 1 : 0.4,
                        }}
                      >
                        <span
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
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          className="features-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1.25rem",
            padding: "2rem 0 5rem",
          }}
        >
          {[
            {
              icon: "✦",
              title: "AI that actually gets it",
              desc: "After each entry, get a short honest reflection — not a therapy script. Something that makes you think twice.",
            },
            {
              icon: "⬡",
              title: "Streak tracking that motivates",
              desc: "Feel the gentle pull of not breaking the chain. Watch your progress build day by day.",
            },
            {
              icon: "◎",
              title: "Private by default",
              desc: "Every entry is private. Share only what you choose, only with people you trust.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="feat-card"
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
                  fontFamily: "var(--font-serif), 'Playfair Display', serif",
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
              fontFamily: "var(--font-serif), 'Playfair Display', serif",
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
