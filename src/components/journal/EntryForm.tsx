"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { updateStreak } from "@/lib/streaks";
import { Mic, Square, ImagePlus, X } from "lucide-react";

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

  // Dictation
  const [isListening, setIsListening] = useState(false);
  const [dictationSupported, setDictationSupported] = useState(false);
  const [interimText, setInterimText] = useState("");
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  // Image
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const SR =
      (window as unknown as Record<string, unknown>).SpeechRecognition ??
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
    setDictationSupported(!!SR);
  }, []);

  const startDictation = () => {
    const SR =
      (window as unknown as Record<string, unknown>).SpeechRecognition ??
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
    if (!SR) return;
    const recognition = new (SR as new () => SpeechRecognitionInstance)();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (e: SpeechRecognitionEvent) => {
      let interim = "";
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t;
        else interim += t;
      }
      if (final) {
        setContent((prev) => {
          const sep = prev && !prev.endsWith(" ") && !prev.endsWith("\n") ? " " : "";
          return prev + sep + final;
        });
        setInterimText("");
      } else {
        setInterimText(interim);
      }
    };
    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      setIsListening(false);
      setInterimText("");
      if (e.error === "not-allowed") {
        setMessage("Microphone access denied. Please allow it in your browser settings.");
        setIsError(true);
      }
    };
    recognition.onend = () => { setIsListening(false); setInterimText(""); };
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setMessage("Image must be under 5MB.");
      setIsError(true);
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setMessage("");
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadImage = async (userId: string): Promise<string | null> => {
    if (!imageFile) return null;
    setUploadingImage(true);
    try {
      const ext = imageFile.name.split(".").pop() ?? "jpg";
      const path = `${userId}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("entry-images")
        .upload(path, imageFile, { upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("entry-images").getPublicUrl(path);
      return data.publicUrl;
    } catch (err) {
      console.error(err);
      return null;
    } finally {
      setUploadingImage(false);
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

      const imageUrl = await uploadImage(user.id);

      const { data, error } = await supabase
        .from("journal_entries")
        .insert({
          user_id: user.id,
          title: title.trim() || "Untitled",
          content: content.trim(),
          is_private: true,
          ...(imageUrl ? { image_url: imageUrl } : {}),
        })
        .select()
        .single();
      if (error) throw error;
      await updateStreak(user.id);
      setTitle("");
      setContent("");
      removeImage();
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
  const dateStr = now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

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
            width: "100%", border: "1px solid var(--cream-dark)",
            background: "var(--input-bg)", borderRadius: "16px",
            padding: "14px 16px", fontSize: "15px", color: "var(--ink)",
            marginBottom: "10px", outline: "none",
          }}
        />

        <label htmlFor="journal-content" className="sr-only">
          Journal entry
        </label>
        <div style={{ position: "relative" }}>
          <textarea
            id="journal-content"
            placeholder="What's on your mind today?"
            value={content + (interimText ? " " + interimText : "")}
            onChange={(e) => { setContent(e.target.value); setInterimText(""); }}
            rows={6}
            style={{
              width: "100%", border: isListening ? "1.5px solid var(--accent)" : "1px solid var(--cream-dark)",
              background: "var(--input-bg)", borderRadius: "16px",
              padding: "14px 52px 14px 16px", fontSize: "14px",
              color: "var(--ink)", resize: "vertical", outline: "none",
              lineHeight: 1.7, transition: "border-color 0.2s",
            }}
          />
          {/* Mic button */}
          {dictationSupported && (
            <button
              type="button"
              onClick={isListening ? stopDictation : startDictation}
              aria-label={isListening ? "Stop dictation" : "Start dictation"}
              style={{
                position: "absolute", bottom: "12px", right: "12px",
                width: "32px", height: "32px", borderRadius: "50%", border: "none",
                background: isListening ? "var(--accent)" : "var(--cream-dark)",
                color: isListening ? "white" : "var(--ink-muted)",
                cursor: "pointer", display: "flex", alignItems: "center",
                justifyContent: "center", transition: "all 0.2s",
              }}
            >
              {isListening ? <Square size={13} fill="white" /> : <Mic size={15} />}
            </button>
          )}
        </div>

        {/* Dictation status */}
        {isListening && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "6px", fontSize: "12px", color: "var(--accent)" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent)", animation: "pulse 1.2s ease-in-out infinite", display: "inline-block" }} />
            Listening... tap stop when done
          </div>
        )}

        {/* Image picker */}
        <div style={{ marginTop: "10px" }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: "none" }}
            id="image-upload"
            aria-label="Upload image"
          />
          {!imagePreview ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                background: "none", border: "1px dashed var(--cream-dark)",
                borderRadius: "12px", padding: "10px 14px",
                fontSize: "13px", color: "var(--ink-muted)",
                cursor: "pointer", width: "100%", justifyContent: "center",
              }}
            >
              <ImagePlus size={16} />
              Add a photo
            </button>
          ) : (
            <div style={{ position: "relative", borderRadius: "12px", overflow: "hidden" }}>
              <img
                src={imagePreview}
                alt="Entry preview"
                style={{ width: "100%", maxHeight: "200px", objectFit: "cover", display: "block", borderRadius: "12px" }}
              />
              <button
                type="button"
                onClick={removeImage}
                aria-label="Remove image"
                style={{
                  position: "absolute", top: "8px", right: "8px",
                  width: "28px", height: "28px", borderRadius: "50%",
                  background: "rgba(28,25,23,0.7)", border: "none",
                  color: "white", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s",
              }}
            >
                <X size={14} />
              </button>
            </div>
          )}
        </div>

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
            disabled={loading || uploadingImage}
            style={{
              flex: 1,
              background: loading || uploadingImage ? "var(--ink-soft)" : "var(--btn-primary)",
              color: "var(--btn-primary-text)",
              border: "none", borderRadius: "14px",
              padding: "14px", fontSize: "14px",
              fontWeight: 500, cursor: loading || uploadingImage ? "not-allowed" : "pointer",
            }}
          >
            {uploadingImage ? "Uploading..." : loading ? "Saving..." : "Save entry"}
          </button>
        </div>
      </div>
    </div>
  );
}
