// src/app/onboarding/get-started/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import WelcomeStep from "@/components/onboarding/WelcomeStep";
import FirstEntryPrompt from "@/components/onboarding/FirstEntryPrompt";
import PhotoImportFlow from "@/components/journal/PhotoImportFlow";

type Step = "loading" | "welcome" | "import" | "first-entry";

export default function GetStartedPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("loading");
  const [username, setUsername] = useState("");
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/auth/login");
        return;
      }

      const { data } = await supabase
        .from("users")
        .select("username, onboarding_completed_at")
        .eq("id", user.id)
        .maybeSingle();

      // If onboarding was already completed, skip straight to dashboard
      if (data?.onboarding_completed_at) {
        router.replace("/dashboard");
        return;
      }

      setUsername(data?.username ?? "");
      setStep("welcome");
    };
    void load();
  }, [supabase, router]);

  const finishOnboarding = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("users")
        .update({ onboarding_completed_at: new Date().toISOString() })
        .eq("id", user.id);
    }
    router.replace("/dashboard");
  };

  if (step === "loading") {
    return (
      <div style={{ minHeight: "100vh", background: "var(--cream)" }} />
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)", maxWidth: "var(--app-width)", margin: "0 auto" }}>
      {step === "welcome" && (
        <WelcomeStep
          username={username}
          onChooseImport={() => setStep("import")}
          onChooseFresh={() => setStep("first-entry")}
        />
      )}

      {step === "import" && (
        <div style={{ padding: "60px 28px 40px" }}>
          <PhotoImportFlow
            title="Import your journal"
            subtitle="Take photos of your handwritten pages — we'll transcribe them and bring them into Reflecto."
            onDone={() => void finishOnboarding()}
          />
        </div>
      )}

      {step === "first-entry" && (
        <FirstEntryPrompt onDone={() => void finishOnboarding()} />
      )}
    </div>
  );
}
