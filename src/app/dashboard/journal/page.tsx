import type { Metadata } from "next";
import JournalPageClient from "./JournalPageClient";

export const metadata: Metadata = {
  title: "Journal",
  description: "Write, edit and revisit your journal entries.",
};

export default function JournalPage() {
  return <JournalPageClient />;
}
