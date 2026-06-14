"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { JournalEntry, AiReflection } from "@/lib/types/database";
import EntryForm from "@/components/journal/EntryForm";
import ReflectButton from "@/components/journal/ReflectButton";
import EntryList from "@/components/journal/EntryList";
import PhotoImportFlow from "@/components/journal/PhotoImportFlow";
import { ImagePlus, X } from "lucide-react";

type EntryRow = JournalEntry & {
  ai_reflections?: AiReflection[] | null;
};

export default function JournalPageClient() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [reflections, setReflections] = useState<Record<string, string>>({});
  const [fetching, setFetching] = useState(true);
  const [savedEntryId, setSavedEntryId] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);

  const supabase = useMemo(() => createClient(), []);

  const fetchEntries = useCallback(async () => {
    try {
      setFetching(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("journal_entries")
        .select("*, ai_reflections(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const rows = (data as EntryRow[] | null) ?? [];
      setEntries(rows);
      const refs: Record<string, string> = {};
      rows.forEach((e) => {
        if (e.ai_reflections?.[0]) refs[e.id] = e.ai_reflections[0].reflection;
      });
      setReflections(refs);
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  }, [supabase]);

  useEffect(() => {
    void fetchEntries();
  }, [fetchEntries]);

  const handleSaved = (entryId: string) => {
    setSavedEntryId(entryId);
    void fetchEntries();
  };

  const handleReflection = (entryId: string, reflection: string) => {
    setReflections((prev) => ({ ...prev, [entryId]: reflection }));
  };

  const closeImportModal = () => {
    setShowImportModal(false);
    void fetchEntries();
  };

  return (
    <div>
      <EntryForm onSaved={handleSaved} />

      <div style={{ padding: "0 28px 10px" }}>
        <button
          type="button"
          onClick={() => setShowImportModal(true)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            width: "100%",
            background: "none",
            border: "1px dashed var(--cream-dark)",
            borderRadius: "12px",
            padding: "10px 14px",
            fontSize: "13px",
            color: "var(--ink-muted)",
            cursor: "pointer",
          }}
        >
          <ImagePlus size={15} />
          Import from old journal photos
        </button>
      </div>

      <ReflectButton
        entryId={savedEntryId}
        onReflection={handleReflection}
      />
      <EntryList
        entries={entries}
        reflections={reflections}
        fetching={fetching}
        onRefresh={fetchEntries}
      />

      {showImportModal && (
        <div
          role="presentation"
          onClick={closeImportModal}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 200,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "var(--app-width)",
              maxHeight: "85vh",
              overflowY: "auto",
              background: "var(--surface)",
              borderRadius: "28px 28px 0 0",
              padding: "28px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "4px",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "4px",
                  background: "var(--cream-dark)",
                  borderRadius: "2px",
                  margin: "0 auto",
                  position: "absolute",
                  left: "50%",
                  top: "14px",
                  transform: "translateX(-50%)",
                }}
              />
              <div style={{ flex: 1 }} />
              <button
                type="button"
                onClick={closeImportModal}
                aria-label="Close"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--ink-muted)",
                  padding: "4px",
                  marginTop: "12px",
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ marginTop: "8px" }}>
              <PhotoImportFlow
                title="Import from photos"
                subtitle="Take photos of your handwritten journal pages — we'll transcribe them for you to review."
                onDone={closeImportModal}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
