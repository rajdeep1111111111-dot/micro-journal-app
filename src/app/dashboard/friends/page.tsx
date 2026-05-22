import type { Metadata } from "next";
import FriendsPageClient from "./FriendsPageClient";

export const metadata: Metadata = {
  title: "Friends",
  description: "See your friends' reflections and share your own.",
};

export default function FriendsPage() {
  return <FriendsPageClient />;
}
