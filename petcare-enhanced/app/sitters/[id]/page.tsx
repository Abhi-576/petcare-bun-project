import type { Metadata } from "next";
import { SitterProfileClient } from "@/components/sitter-profile-client";
export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Sitter profile",
    description:
      "View sitter details, care preferences, verification status and pricing.",
  };
}
export default function SitterProfile() {
  return <SitterProfileClient />;
}
