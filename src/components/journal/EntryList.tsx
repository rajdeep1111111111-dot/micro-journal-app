import type { JournalEntry } from "@/lib/types/database";

type Props = {
  entries: JournalEntry[];
  reflections: Record<string, string>;
  fetching: boolean;
};

export default function EntryList({ entries, reflections, fetching }: Props) {
  return (
    <div>
      <div
        style={{
          fontSize: "11px",
          fontWeight: 500,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--ink-muted)",
          padding: "24px 28px 12px",
        }}
      >
        Past entries
      </div>
      <div style={{ padding: "0 28px 24px" }}>
        {fetching && (
          <p style={{ color: "var(--ink-muted)", fontSize: "14px" }}>
            Loading...
          </p>
        )}
        {!fetching && entries.length === 0 && (
          <p style={{ color: "var(--ink-muted)", fontSize: "14px" }}>
            No entries yet. Write your first one above.
          </p>
        )}
        {entries.map((entry) => (
          <div
            key={entry.id}
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "16px",
              marginBottom: "10px",
              border: "1px solid var(--cream-dark)",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "15px",
                color: "var(--ink)",
                marginBottom: "4px",
              }}
            >
              {entry.title}
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "var(--ink-muted)",
                lineHeight: 1.5,
                marginBottom: "8px",
              }}
            >
              {entry.content.slice(0, 100)}...
            </div>
            {reflections[entry.id] && (
              <div
                style={{
                  background: "var(--ink)",
                  borderRadius: "12px",
                  padding: "12px",
                  marginBottom: "8px",
                }}
              >
                <div
                  style={{
                    fontSize: "10px",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.5)",
                    marginBottom: "6px",
                  }}
                >
                  AI Reflection
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "13px",
                    color: "rgba(255,255,255,0.9)",
                    fontStyle: "italic",
                    lineHeight: 1.6,
                  }}
                >
                  {reflections[entry.id]}
                </div>
              </div>
            )}
            <div style={{ fontSize: "11px", color: "var(--ink-muted)" }}>
              {new Date(entry.created_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
