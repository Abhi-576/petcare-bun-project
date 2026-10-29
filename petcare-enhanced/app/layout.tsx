import type { Metadata } from "next";
import "./globals.css";
import { Header, Footer } from "@/components/header";
import { HelpChatbot } from "@/components/help-chatbot";
export const metadata: Metadata = {
  title: {
    default: "PetCare — A loving home, whenever you’re away",
    template: "%s | PetCare",
  },
  description:
    "Find thoughtful local pet sitters, explore welcoming homes and book care that feels right. Find thoughtful local pet sitters, explore welcoming homes and book care that feels right.",
  openGraph: {
    title: "PetCare — A loving home, whenever you’re away",
    description: "Thoughtful care for the ones who make a house a home.",
    type: "website",
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
        <Footer />
        <HelpChatbot />
      </body>
    </html>
  );
}
