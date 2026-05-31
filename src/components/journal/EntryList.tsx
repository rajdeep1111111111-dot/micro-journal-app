"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { JournalEntry } from "@/lib/types/database";

type Props = {
  entries: JournalEntry[];
  reflections: Record<string, string>;
  fetching: boolean;
  onRefresh: () => void | Promise<void>;
};

function entryImagePath(value: string) {
  const publicMarker = "/storage/v1/object/public/entry-images/";
  if (value.includes(publicMarker)) {
    return decodeURIComponent(value.split(publicMarker)[1]?.split("?")[0] ?? "");
  }
  return value;
}

export default function EntryList({ entries, reflections, fetching, onRefresh }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [signedImageUrls, setSignedImageUrls] = useState<Record<string, string>>({});

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let cancelled = false;

    async function signEntryImages() {
      const imageEntries = entries
        .map((entry) => ({
          id: entry.id,
          imageUrl: (entry as JournalEntry & { image_url?: string }).image_url,
        }))
        .filter((entry): entry is { id: string; imageUrl: string } => !!entry.imageUrl);

      if (imageEntries.length === 0) {
        setSignedImageUrls({});
        return;
      }

      const pairs = await Promise.all(
        imageEntries.map(async ({ id, imageUrl }) => {
          const path = entryImagePath(imageUrl);
          const { data, error } = await supabase.storage
            .from("entry-images")
            .createSignedUrl(path, 60 * 60);
          return [id, error ? imageUrl : data.signedUrl] as const;
        }),
      );

      if (!cancelled) setSignedImageUrls(Object.fromEntries(pairs));
    }

    void signEntryImages();

    return () => {
      cancelled = true;
    };
  }, [entries, supabase]);

  const startEdit = (entry: JournalEntry) => {
    setEditingId(entry.id);
    setEditTitle(entry.title);
    setEditContent(entry.content);
  };

  const cancelEdit = () => { setEditingId(null); setEditTitle(""); setEditContent(""); };

  const handleSaveEdit = async (id: string) => {
    if (!editContent.trim()) return;
    setSaving(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("journal_entries")
        .update({ title: editTitle.trim() || "Untitled", content: editContent.trim(), updated_at: new Date().toISOString() })
        .eq("id", id).eq("user_id", user.id);
      if (error) throw error;
      cancelEdit();
      onRefresh();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("journal_entries").delete().eq("id", id).eq("user_id", user.id);
      if (error) throw error;
      onRefresh();
    } catch (err) { console.error(err); }
    finally { setDeletingId(null); }
  };

  return (
    <div>
      <div style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-muted)", padding: "24px 28px 12px" }}>
        Past entries
      </div>
      <div style={{ padding: "0 28px 24px" }}>
        {fetching && <p style={{ color: "var(--ink-muted)", fontSize: "14px" }}>Loading...</p>}
        {!fetching && entries.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: "18px", color: "var(--ink)", marginBottom: "8px" }}>No entries yet</div>
            <div style={{ fontSize: "14px", color: "var(--ink-muted)", lineHeight: 1.6 }}>Write your first journal entry above and start your reflection journey.</div>
          </div>
        )}
        {entries.map((entry) => {
          const imageUrl = (entry as JournalEntry & { image_url?: string }).image_url;
          const signedImageUrl = signedImageUrls[entry.id];
          return (
            <div key={entry.id} style={{ background: "var(--surface)", borderRadius: "16px", padding: "16px", marginBottom: "10px", border: "1px solid var(--cream-dark)" }}>
              {editingId === entry.id ? (
                <div>
                  <label htmlFor={`edit-title-${entry.id}`} className="sr-only">Title</label>
                  <input
                    id={`edit-title-${entry.id}`}
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Title"
                    style={{ width: "100%", border: "1px solid var(--cream-dark)", borderRadius: "10px", padding: "10px 12px", fontSize: "14px", background: "var(--input-bg)", color: "var(--ink)", marginBottom: "8px", outline: "none" }}
                  />
                  <label htmlFor={`edit-content-${entry.id}`} className="sr-only">Entry content</label>
                  <textarea
                    id={`edit-content-${entry.id}`}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={5}
                    style={{ width: "100%", border: "1px solid var(--cream-dark)", borderRadius: "10px", padding: "10px 12px", fontSize: "13px", background: "var(--input-bg)", color: "var(--ink)", resize: "vertical", outline: "none", lineHeight: 1.6 }}
                  />
                  <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                    <button type="button" onClick={() => void handleSaveEdit(entry.id)} disabled={saving}
                      style={{ flex: 1, background: "var(--btn-primary)", color: "var(--btn-primary-text)", border: "none", borderRadius: "10px", padding: "10px", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}>
                      {saving ? "Saving..." : "Save changes"}
                    </button>
                    <button type="button" onClick={cancelEdit}
                      style={{ background: "none", border: "1px solid var(--cream-dark)", borderRadius: "10px", padding: "10px 14px", fontSize: "13px", cursor: "pointer", color: "var(--ink-muted)" }}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {/* Image */}
                  {imageUrl && signedImageUrl && (
                    <div
                      style={{
                        marginBottom: "12px",
                        borderRadius: "10px",
                        overflow: "hidden",
                        position: "relative",
                        height: "200px",
                        width: "100%",
                      }}
                    >
                      <Image
                        src={signedImageUrl}
                        alt="Entry image"
                        fill
                        sizes="(max-width: 430px) 100vw, 430px"
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                    <div style={{ fontFamily: "var(--font-serif)", fontSize: "15px", color: "var(--ink)", flex: 1 }}>
                      {entry.title}
                    </div>
                    <div style={{ display: "flex", gap: "8px", marginLeft: "12px", flexShrink: 0 }}>
                      <button type="button" onClick={() => startEdit(entry)}
                        style={{ background: "none", border: "none", cursor: "pointer", fontSize: "13px", color: "var(--ink-muted)", padding: "2px 6px", borderRadius: "6px" }}>
                        Edit
                      </button>
                      <button type="button"
                        onClick={() => { if (window.confirm("Delete this entry? This cannot be undone.")) void handleDelete(entry.id); }}
                        disabled={deletingId === entry.id}
                        style={{ background: "none", border: "none", cursor: "pointer", fontSize: "13px", color: deletingId === entry.id ? "var(--ink-muted)" : "#DC2626", padding: "2px 6px", borderRadius: "6px" }}>
                        {deletingId === entry.id ? "..." : "Delete"}
                      </button>
                    </div>
                  </div>

                  <div style={{ fontSize: "12px", color: "var(--ink-muted)", lineHeight: 1.5, marginBottom: "8px" }}>
                    {entry.content.slice(0, 120)}{entry.content.length > 120 ? "..." : ""}
                  </div>

                  {reflections[entry.id] && (
                    <div style={{ background: "var(--hero-bg)", borderRadius: "12px", padding: "12px", marginBottom: "8px" }}>
                      <div style={{ fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: "6px" }}>AI Reflection</div>
                      <div style={{ fontFamily: "var(--font-serif)", fontSize: "13px", color: "rgba(255,255,255,0.9)", fontStyle: "italic", lineHeight: 1.6 }}>
                        {reflections[entry.id]}
                      </div>
                    </div>
                  )}

                  <div style={{ fontSize: "11px", color: "var(--ink-muted)" }}>
                    {new Date(entry.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
