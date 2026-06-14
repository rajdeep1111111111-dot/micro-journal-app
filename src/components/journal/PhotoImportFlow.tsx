// src/components/journal/PhotoImportFlow.tsx
"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { updateStreak } from "@/lib/streaks";
import { ImagePlus, X, Loader2, Check, AlertCircle } from "lucide-react";
import UndoToast from "@/components/ui/UndoToast";

type Props = {
  onDone: () => void; // called when flow completes (saved, skipped, or cancelled)
  onSaved?: (entryIds: string[]) => void; // called with inserted entry IDs
  title?: string;
  subtitle?: string;
};

type PendingPhoto = {
  file: File;
  previewUrl: string;
};

type ReviewItem = {
  id: string; // local temp id
  title: string;
  content: string;
  entryDate: string; // YYYY-MM-DD
  status: "pending" | "success" | "error" | "skipped";
  error?: string;
};

const IMAGE_TYPES: Record<string, boolean> = {
  "image/jpeg": true,
  "image/png": true,
  "image/webp": true,
};

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function PhotoImportFlow({ onDone, onSaved, title, subtitle }: Props) {
  const [step, setStep] = useState<"upload" | "processing" | "review" | "saving" | "done">("upload");
  const [photos, setPhotos] = useState<PendingPhoto[]>([]);
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [unavailable, setUnavailable] = useState(false);
  const [savedEntryIds, setSavedEntryIds] = useState<string[]>([]);
  const [showUndo, setShowUndo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = useMemo(() => createClient(), []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const valid: PendingPhoto[] = [];
    for (const file of files) {
      if (!IMAGE_TYPES[file.type]) continue;
      if (file.size > 5 * 1024 * 1024) continue;
      valid.push({ file, previewUrl: URL.createObjectURL(file) });
    }

    if (valid.length === 0) {
      setErrorMsg("Please select JPG, PNG, or WebP images under 5MB.");
      return;
    }

    setPhotos((prev) => [...prev, ...valid].slice(0, 10));
    setErrorMsg("");
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleProcess = async () => {
    if (photos.length === 0) return;
    setStep("processing");
    setErrorMsg("");

    try {
      const formData = new FormData();
      photos.forEach((p) => formData.append("images", p.file));

      const res = await fetch("/api/import-journal", { method: "POST", body: formData });
      const data = await res.json();

      if (res.status === 503 && data.unavailable) {
        setUnavailable(true);
        setStep("upload");
        return;
      }

      if (!res.ok) {
        setErrorMsg(data.error ?? "Something went wrong. Please try again.");
        setStep("upload");
        return;
      }

      const items: ReviewItem[] = (data.results ?? []).map(
        (r: { index: number; success: boolean; title?: string; content?: string; suggestedDate?: string; error?: string }) => ({
          id: `local-${r.index}-${Date.now()}`,
          title: r.success ? (r.title ?? "Untitled") : "Untitled",
          content: r.success ? (r.content ?? "") : "",
          entryDate: r.suggestedDate ?? todayStr(),
          status: r.success ? "success" : "error",
          error: r.error,
        }),
      );

      setReviewItems(items);
      setStep("review");
    } catch (err) {
      console.error(err);
      setErrorMsg("Network error. Please try again.");
      setStep("upload");
    }
  };

  const updateItem = (id: string, updates: Partial<ReviewItem>) => {
    setReviewItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  const skipItem = (id: string) => {
    setReviewItems((prev) => prev.map((item) => (item.id === id ? { ...item, status: "skipped" } : item)));
  };

  const handleSaveAll = async () => {
    const toSave = reviewItems.filter((item) => item.status === "success" && item.content.trim());
    if (toSave.length === 0) {
      onDone();
      return;
    }

    setStep("saving");
    setErrorMsg("");

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("Not authenticated");

      const rows = toSave.map((item) => ({
        user_id: user.id,
        title: item.title.trim() || "Untitled",
        content: item.content.trim(),
        is_private: true,
        source: "imported",
        entry_date: item.entryDate,
        created_at: new Date().toISOString(),
      }));

      const { data: inserted, error } = await supabase
        .from("journal_entries")
        .insert(rows)
        .select("id");

      if (error) throw error;

      await updateStreak(user.id);

      const ids = (inserted ?? []).map((row: { id: string }) => row.id);
      setSavedEntryIds(ids);
      setShowUndo(true);
      setStep("done");
      onSaved?.(ids);
    } catch (err) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : "Failed to save entries.");
      setStep("review");
    }
  };

  const handleUndo = async () => {
    if (savedEntryIds.length === 0) return;
    try {
      const { error } = await supabase.from("journal_entries").delete().in("id", savedEntryIds);
      if (error) throw error;
      setSavedEntryIds([]);
    } catch (err) {
      console.error("Undo failed:", err);
    }
  };

  // ─── Upload step ──────────────────────────────────────────────────────────
  if (step === "upload") {
    return (
      <div>
        {(title || subtitle) && (
          <div style={{ marginBottom: "20px" }}>
            {title && (
              <div style={{ fontFamily: "var(--font-serif)", fontSize: "22px", color: "var(--ink)", marginBottom: "6px" }}>
                {title}
              </div>
            )}
            {subtitle && (
              <div style={{ fontSize: "14px", color: "var(--ink-muted)", lineHeight: 1.6 }}>{subtitle}</div>
            )}
          </div>
        )}

        {unavailable && (
          <div
            style={{
              background: "var(--accent-light)",
              borderRadius: "14px",
              padding: "14px 16px",
              marginBottom: "16px",
              display: "flex",
              gap: "10px",
              alignItems: "flex-start",
            }}
          >
            <AlertCircle size={18} color="var(--accent)" style={{ flexShrink: 0, marginTop: "1px" }} />
            <div style={{ fontSize: "13px", color: "var(--ink)", lineHeight: 1.5 }}>
              AI import is temporarily unavailable. You can write this entry manually for now — we&apos;ll let you know when import is back.
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          style={{ display: "none" }}
          aria-label="Upload journal photos"
        />

        {photos.length === 0 ? (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
              background: "none",
              border: "1.5px dashed var(--cream-dark)",
              borderRadius: "16px",
              padding: "32px 16px",
              cursor: "pointer",
              color: "var(--ink-muted)",
            }}
          >
            <ImagePlus size={28} />
            <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--ink)" }}>Upload journal photos</div>
            <div style={{ fontSize: "12px" }}>JPG, PNG, or WebP — up to 10 photos</div>
          </button>
        ) : (
          <div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "8px",
                marginBottom: "12px",
              }}
            >
              {photos.map((photo, i) => (
                <div key={photo.previewUrl} style={{ position: "relative", aspectRatio: "1", borderRadius: "10px", overflow: "hidden" }}>
                  <Image src={photo.previewUrl} alt={`Page ${i + 1}`} fill style={{ objectFit: "cover" }} unoptimized />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    aria-label={`Remove page ${i + 1}`}
                    style={{
                      position: "absolute", top: "4px", right: "4px",
                      width: "22px", height: "22px", borderRadius: "50%",
                      background: "rgba(28,25,23,0.7)", border: "none",
                      color: "white", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              {photos.length < 10 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Add more photos"
                  style={{
                    aspectRatio: "1", borderRadius: "10px",
                    border: "1.5px dashed var(--cream-dark)", background: "none",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    color: "var(--ink-muted)",
                  }}
                >
                  <ImagePlus size={20} />
                </button>
              )}
            </div>
          </div>
        )}

        {errorMsg && (
          <p style={{ fontSize: "13px", color: "#DC2626", marginTop: "10px" }}>{errorMsg}</p>
        )}

        <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
          {photos.length > 0 && (
            <button
              type="button"
              onClick={() => void handleProcess()}
              style={{
                flex: 1, background: "var(--btn-primary)", color: "var(--btn-primary-text)",
                border: "none", borderRadius: "14px", padding: "14px",
                fontSize: "14px", fontWeight: 500, cursor: "pointer",
              }}
            >
              Transcribe {photos.length} {photos.length === 1 ? "photo" : "photos"}
            </button>
          )}
          <button
            type="button"
            onClick={onDone}
            style={{
              flex: photos.length > 0 ? "0 0 auto" : 1,
              background: "none", border: "1px solid var(--cream-dark)",
              borderRadius: "14px", padding: "14px 18px",
              fontSize: "14px", color: "var(--ink-muted)", cursor: "pointer",
            }}
          >
            {photos.length > 0 ? "Cancel" : "Skip for now"}
          </button>
        </div>
      </div>
    );
  }

  // ─── Processing step ──────────────────────────────────────────────────────
  if (step === "processing") {
    return (
      <div style={{ textAlign: "center", padding: "48px 16px" }}>
        <Loader2 size={32} className="spin" style={{ color: "var(--accent)", marginBottom: "16px" }} />
        <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: "18px", color: "var(--ink)", marginBottom: "6px" }}>
          Reading your pages...
        </div>
        <div style={{ fontSize: "13px", color: "var(--ink-muted)" }}>
          This can take a moment for multiple photos.
        </div>
      </div>
    );
  }

  // ─── Review step ──────────────────────────────────────────────────────────
  if (step === "review" || step === "saving") {
    const successCount = reviewItems.filter((i) => i.status === "success").length;

    return (
      <div>
        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: "20px", color: "var(--ink)", marginBottom: "4px" }}>
            Review your entries
          </div>
          <div style={{ fontSize: "13px", color: "var(--ink-muted)" }}>
            {successCount} of {reviewItems.length} transcribed successfully. Edit anything before saving.
          </div>
        </div>

        {reviewItems.map((item, i) => {
          if (item.status === "skipped") {
            return (
              <div
                key={item.id}
                style={{
                  background: "var(--cream-dark)", borderRadius: "14px", padding: "12px 16px",
                  marginBottom: "10px", fontSize: "13px", color: "var(--ink-muted)",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}
              >
                <span>Page {i + 1} — skipped</span>
              </div>
            );
          }

          if (item.status === "error") {
            return (
              <div
                key={item.id}
                style={{
                  background: "var(--surface)", border: "1px solid var(--cream-dark)",
                  borderRadius: "14px", padding: "14px 16px", marginBottom: "10px",
                }}
              >
                <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                  <AlertCircle size={16} color="#DC2626" style={{ flexShrink: 0, marginTop: "2px" }} />
                  <div style={{ fontSize: "13px", color: "var(--ink)" }}>
                    <div style={{ fontWeight: 500, marginBottom: "2px" }}>Page {i + 1} couldn&apos;t be read</div>
                    <div style={{ color: "var(--ink-muted)" }}>{item.error ?? "Unknown error"}</div>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div
              key={item.id}
              style={{
                background: "var(--surface)", border: "1px solid var(--cream-dark)",
                borderRadius: "14px", padding: "14px 16px", marginBottom: "10px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-muted)" }}>
                  Page {i + 1}
                </span>
                <button
                  type="button"
                  onClick={() => skipItem(item.id)}
                  style={{ background: "none", border: "none", fontSize: "12px", color: "var(--ink-muted)", cursor: "pointer", padding: "2px 4px" }}
                >
                  Skip
                </button>
              </div>

              <label htmlFor={`import-title-${item.id}`} className="sr-only">Title</label>
              <input
                id={`import-title-${item.id}`}
                value={item.title}
                onChange={(e) => updateItem(item.id, { title: e.target.value })}
                style={{
                  width: "100%", border: "1px solid var(--cream-dark)", borderRadius: "10px",
                  padding: "8px 12px", fontSize: "14px", background: "var(--input-bg)",
                  color: "var(--ink)", marginBottom: "8px", outline: "none", fontFamily: "var(--font-serif)",
                }}
              />

              <label htmlFor={`import-date-${item.id}`} className="sr-only">Entry date</label>
              <input
                id={`import-date-${item.id}`}
                type="date"
                value={item.entryDate}
                max={todayStr()}
                onChange={(e) => updateItem(item.id, { entryDate: e.target.value })}
                style={{
                  border: "1px solid var(--cream-dark)", borderRadius: "10px",
                  padding: "6px 10px", fontSize: "12px", background: "var(--input-bg)",
                  color: "var(--ink-muted)", marginBottom: "8px", outline: "none",
                }}
              />

              <label htmlFor={`import-content-${item.id}`} className="sr-only">Entry content</label>
              <textarea
                id={`import-content-${item.id}`}
                value={item.content}
                onChange={(e) => updateItem(item.id, { content: e.target.value })}
                rows={4}
                style={{
                  width: "100%", border: "1px solid var(--cream-dark)", borderRadius: "10px",
                  padding: "10px 12px", fontSize: "13px", background: "var(--input-bg)",
                  color: "var(--ink)", resize: "vertical", outline: "none", lineHeight: 1.6,
                }}
              />
            </div>
          );
        })}

        {errorMsg && <p style={{ fontSize: "13px", color: "#DC2626", marginBottom: "10px" }}>{errorMsg}</p>}

        <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
          <button
            type="button"
            onClick={() => void handleSaveAll()}
            disabled={step === "saving" || successCount === 0}
            style={{
              flex: 1,
              background: step === "saving" || successCount === 0 ? "var(--ink-soft)" : "var(--btn-primary)",
              color: "var(--btn-primary-text)", border: "none", borderRadius: "14px",
              padding: "14px", fontSize: "14px", fontWeight: 500,
              cursor: step === "saving" || successCount === 0 ? "not-allowed" : "pointer",
            }}
          >
            {step === "saving" ? "Saving..." : `Save ${successCount} ${successCount === 1 ? "entry" : "entries"}`}
          </button>
          <button
            type="button"
            onClick={onDone}
            disabled={step === "saving"}
            style={{
              background: "none", border: "1px solid var(--cream-dark)",
              borderRadius: "14px", padding: "14px 18px",
              fontSize: "14px", color: "var(--ink-muted)", cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // ─── Done step ────────────────────────────────────────────────────────────
  return (
    <>
      <div style={{ textAlign: "center", padding: "32px 16px" }}>
        <div
          style={{
            width: "56px", height: "56px", borderRadius: "50%", background: "var(--green-light)",
            display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
          }}
        >
          <Check size={28} color="var(--green)" />
        </div>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: "20px", color: "var(--ink)", marginBottom: "6px" }}>
          {savedEntryIds.length} {savedEntryIds.length === 1 ? "entry" : "entries"} imported
        </div>
        <div style={{ fontSize: "13px", color: "var(--ink-muted)", marginBottom: "20px" }}>
          You can find {savedEntryIds.length === 1 ? "it" : "them"} in your journal, marked as imported.
        </div>
        <button
          type="button"
          onClick={onDone}
          style={{
            background: "var(--btn-primary)", color: "var(--btn-primary-text)",
            border: "none", borderRadius: "14px", padding: "14px 32px",
            fontSize: "14px", fontWeight: 500, cursor: "pointer",
          }}
        >
          Continue
        </button>
      </div>

      {showUndo && savedEntryIds.length > 0 && (
        <UndoToast
          message={`${savedEntryIds.length} ${savedEntryIds.length === 1 ? "entry" : "entries"} imported`}
          onUndo={handleUndo}
          onExpire={() => setShowUndo(false)}
        />
      )}
    </>
  );
}
