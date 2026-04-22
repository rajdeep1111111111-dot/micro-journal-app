"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { JournalEntry, AiReflection } from "@/lib/types/database";
import EntryForm from "@/components/journal/EntryForm";
import ReflectButton from "@/components/journal/ReflectButton";
import EntryList from "@/components/journal/EntryList";

type EntryRow = JournalEntry & {
  ai_reflections?: AiReflection[] | null;
};

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [reflections, setReflections] = useState<Record<string, string>>({});
  const [fetching, setFetching] = useState(true);
  const [savedEntryId, setSavedEntryId] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);

  const fetchEntries = useCallback(async () => {
    try {
      setFetching(true);
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*, ai_reflections(*)")
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

  const savedEntryContent =
    entries.find((e) => e.id === savedEntryId)?.content ?? "";

  return (
    <div>
      <EntryForm onSaved={handleSaved} />
      <ReflectButton
        entryId={savedEntryId}
        entryContent={savedEntryContent}
        onReflection={handleReflection}
      />
      <EntryList
        entries={entries}
        reflections={reflections}
        fetching={fetching}
      />
    </div>
  );
}
