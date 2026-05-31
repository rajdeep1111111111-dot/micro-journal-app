"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Avatar from "@/components/ui/Avatar";
import { Camera } from "lucide-react";

type Props = {
  username: string;
  email: string;
  avatarUrl?: string | null;
  userId: string;
  message?: string;
  isError?: boolean;
};

const AVATAR_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export default function ProfileHeader({
  username,
  email,
  avatarUrl: initialAvatarUrl,
  userId,
  message,
  isError,
}: Props) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    initialAvatarUrl ?? null,
  );
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = AVATAR_EXTENSIONS[file.type];
    if (!ext) {
      setUploadMsg("Please select a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadMsg("Image must be under 5MB.");
      return;
    }

    setUploading(true);
    setUploadMsg("");

    try {
      const filePath = `${userId}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true, contentType: file.type });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const publicUrl = data.publicUrl;
      const urlWithBust = `${publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("users")
        .update({ avatar_url: publicUrl })
        .eq("id", userId);

      if (updateError) throw updateError;

      setAvatarUrl(urlWithBust);
      setUploadMsg("Photo updated!");
      setTimeout(() => setUploadMsg(""), 3000);
    } catch (err) {
      console.error(err);
      setUploadMsg("Upload failed. Try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div style={{ padding: "52px 28px 24px" }}>
      <div style={{ position: "relative", width: "72px", marginBottom: "12px" }}>
        <button
          type="button"
          onClick={handleAvatarClick}
          disabled={uploading}
          aria-label="Change profile photo"
          style={{
            background: "none",
            border: "none",
            padding: 0,
            cursor: uploading ? "not-allowed" : "pointer",
            borderRadius: "50%",
            display: "block",
          }}
        >
          <Avatar username={username} avatarUrl={avatarUrl} size={72} />
        </button>

        <button
          type="button"
          onClick={handleAvatarClick}
          disabled={uploading}
          aria-hidden="true"
          tabIndex={-1}
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: "22px",
            height: "22px",
            borderRadius: "50%",
            background: "var(--accent)",
            border: "2px solid var(--cream)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <Camera size={11} color="white" strokeWidth={2} />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => void handleFileChange(e)}
          style={{ display: "none" }}
        />
      </div>

      {uploading && (
        <p
          style={{
            fontSize: "12px",
            color: "var(--ink-muted)",
            marginBottom: "4px",
          }}
        >
          Uploading...
        </p>
      )}

      {uploadMsg && (
        <p
          style={{
            fontSize: "12px",
            color: uploadMsg.includes("failed") ? "#DC2626" : "var(--green)",
            marginBottom: "4px",
          }}
        >
          {uploadMsg}
        </p>
      )}

      <div
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "22px",
          color: "var(--ink)",
        }}
      >
        {username || "User"}
      </div>
      <div
        style={{
          fontSize: "12px",
          color: "var(--ink-muted)",
          marginTop: "2px",
        }}
      >
        {email}
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
    </div>
  );
}
