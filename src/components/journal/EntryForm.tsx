"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { updateStreak } from "@/lib/streaks";
import { Mic, Square } from "lucide-react";

type Props = {
  onSaved: (entryId: string) => void;
};

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}
interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

export default function EntryForm({ onSaved }: Props) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const [isListening, setIsListening] = useState(false);
  const [dictationSupported, setDictationSupported] = useState(false);
  const [interimText, setInterimText] = useState("");
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const SpeechRecognition =
      (window as unknown as Record<string, unknown>).SpeechRecognition ??
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
    setDictationSupported(!!SpeechRecognition);
  }, []);

  const startDictation = () => {
    const SpeechRecognition =
      (window as unknown as Record<string, unknown>).SpeechRecognition ??
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new (
      SpeechRecognition as new () => SpeechRecognitionInstance
    )();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      let interim = "";
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcript = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }
      if (final) {
        setContent((prev) => {
          const separator =
            prev && !prev.endsWith(" ") && !prev.endsWith("\n") ? " " : "";
          return prev + separator + final;
        });
        setInterimText("");
      } else {
        setInterimText(interim);
      }
    };

    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", e.error);
      setIsListening(false);
      setInterimText("");
      if (e.error === "not-allowed") {
        setMessage(
          "Microphone access denied. Please allow microphone access in your browser settings.",
        );
        setIsError(true);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimText("");
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    setMessage("");
  };

  const stopDictation = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
    setInterimText("");
  };

  const toggleDictation = () => {
    if (isListening) {
      stopDictation();
    } else {
      startDictation();
    }
  };

  const handleSave = async () => {
    if (isListening) stopDictation();
    if (!content.trim()) {
      setMessage("Write something first.");
      setIsError(true);
      return;
    }
    setLoading(true);
    setMessage("");
    setIsError(false);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("journal_entries")
        .insert({
          user_id: user.id,
          title: title.trim() || "Untitled",
          content: content.trim(),
          is_private: true,
        })
        .select()
        .single();
      if (error) throw error;
      await updateStreak(user.id);
      setTitle("");
      setContent("");
      setMessage("Entry saved! Use Reflect for an AI reflection.");
      setIsError(false);
      onSaved(data.id);
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div>
      <div style={{ padding: "52px 28px 20px" }}>
        <div
          style={{
            fontSize: "12px",
            color: "var(--ink-muted)",
            marginBottom: "4px",
          }}
        >
          {dateStr}
        </div>
        <div
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "26px",
            color: "var(--ink)",
          }}
        >
          Your Daily Journal
        </div>
      </div>
      <div style={{ padding: "0 28px" }}>
        <label htmlFor="journal-title" className="sr-only">
          Title (optional)
        </label>
        <input
          id="journal-title"
          placeholder="Title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            width: "100%",
            border: "1px solid var(--cream-dark)",
            background: "var(--input-bg)",
            borderRadius: "16px",
            padding: "14px 16px",
            fontSize: "15px",
            color: "var(--ink)",
            marginBottom: "10px",
            outline: "none",
          }}
        />
        <label htmlFor="journal-content" className="sr-only">
          Journal entry
        </label>

        <div style={{ position: "relative" }}>
          <textarea
            id="journal-content"
            placeholder="What&apos;s on your mind today?"
            value={content + (interimText ? " " + interimText : "")}
            onChange={(e) => {
              setContent(e.target.value);
              setInterimText("");
            }}
            rows={6}
            style={{
              width: "100%",
              border: isListening
                ? "1.5px solid var(--accent)"
                : "1px solid var(--cream-dark)",
              background: "var(--input-bg)",
              borderRadius: "16px",
              padding: "14px 48px 14px 16px",
              fontSize: "14px",
              color: "var(--ink)",
              resize: "vertical",
              outline: "none",
              lineHeight: 1.7,
              transition: "border-color 0.2s",
            }}
          />
          {dictationSupported && (
            <button
              type="button"
              onClick={toggleDictation}
              aria-label={isListening ? "Stop dictation" : "Start dictation"}
              style={{
                position: "absolute",
                bottom: "12px",
                right: "12px",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                border: "none",
                background: isListening ? "var(--accent)" : "var(--cream-dark)",
                color: isListening ? "white" : "var(--ink-muted)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
                flexShrink: 0,
              }}
            >
              {isListening ? (
                <Square size={13} fill="white" />
              ) : (
                <Mic size={15} />
              )}
            </button>
          )}
        </div>

        {isListening && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginTop: "6px",
              fontSize: "12px",
              color: "var(--accent)",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "var(--accent)",
                animation: "pulse 1.2s ease-in-out infinite",
              }}
            />
            Listening... tap the stop button when done
          </div>
        )}

        {message && (
          <p
            style={{
              marginTop: "8px",
              fontSize: "13px",
              color: isError ? "#DC2626" : "var(--green)",
            }}
          >
            {message}
          </p>
        )}

        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            style={{
              flex: 1,
              background: loading ? "var(--ink-soft)" : "var(--btn-primary)",
              color: "var(--btn-primary-text)",
              border: "none",
              borderRadius: "14px",
              padding: "14px",
              fontSize: "14px",
              fontWeight: 500,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Saving..." : "Save entry"}
          </button>
        </div>
      </div>
    </div>
  );
}
