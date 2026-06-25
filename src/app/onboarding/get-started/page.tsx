// src/app/onboarding/get-started/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import WelcomeStep from "@/components/onboarding/WelcomeStep";
import UsernameStep from "@/components/onboarding/UsernameStep";
import StreakGoalStep from "@/components/onboarding/StreakGoalStep";
import TopicsStep from "@/components/onboarding/TopicsStep";
import NotificationStep from "@/components/onboarding/NotificationStep";
import FirstEntryPrompt from "@/components/onboarding/FirstEntryPrompt";
import PhotoImportFlow from "@/components/journal/PhotoImportFlow";

type Step =
  | "loading"
  | "welcome"
  | "username"
  | "streak-goal"
  | "topics"
  | "notification"
  | "first-entry"
  | "import";

export default function GetStartedPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("loading");
  const [username, setUsername] = useState("");
  const [finishError, setFinishError] = useState("");
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/auth/login");
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("username, onboarding_completed_at")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Failed to load onboarding status:", error.message);
      }

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
    setFinishError("");
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/auth/login");
        return;
      }

      const { error } = await supabase
        .from("users")
        .update({ onboarding_completed_at: new Date().toISOString() })
        .eq("id", user.id);

      if (error) {
        console.error("Failed to complete onboarding:", error.message);
        setFinishError(
          "Could not save your progress. If this keeps happening, ask your admin to run the latest database migration.",
        );
        return;
      }

      router.replace("/dashboard");
    } catch (err) {
      console.error("Failed to complete onboarding:", err);
      setFinishError("Could not save your progress. Please try again.");
    }
  };

  if (step === "loading") {
    return <div style={{ minHeight: "100dvh", background: "var(--cream)" }} />;
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "var(--cream)",
        maxWidth: "var(--app-width)",
        margin: "0 auto",
      }}
    >
      {finishError && (
        <div
          style={{
            margin: "16px 28px 0",
            padding: "12px 14px",
            borderRadius: "12px",
            background: "#FEE2E2",
            color: "#DC2626",
            fontSize: "13px",
            lineHeight: 1.5,
          }}
        >
          {finishError}
        </div>
      )}

      {step === "welcome" && (
        <WelcomeStep
          username={username}
          onChooseImport={() => setStep("import")}
          onChooseFresh={() => setStep("username")}
        />
      )}

      {step === "username" && (
        <UsernameStep
          initialUsername={username}
          onContinue={(newUsername) => {
            setUsername(newUsername);
            setStep("streak-goal");
          }}
          onSkip={() => setStep("streak-goal")}
        />
      )}

      {step === "streak-goal" && (
        <StreakGoalStep
          onContinue={() => setStep("topics")}
          onSkip={() => setStep("topics")}
        />
      )}

      {step === "topics" && (
        <TopicsStep
          onContinue={() => setStep("notification")}
          onSkip={() => setStep("notification")}
        />
      )}

      {step === "notification" && (
        <NotificationStep
          onContinue={() => setStep("first-entry")}
          onSkip={() => setStep("first-entry")}
        />
      )}

      {step === "first-entry" && (
        <FirstEntryPrompt onDone={() => void finishOnboarding()} />
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
    </div>
  );
}
