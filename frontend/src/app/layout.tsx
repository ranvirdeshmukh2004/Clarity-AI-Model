import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Meeting Clarity AI — Transcript Intelligence",
  description:
    "Analyze meeting transcripts for vague language, contradictions, and missing commitments. Get a clarity score and actionable insights.",
  keywords: [
    "meeting analysis",
    "transcript intelligence",
    "clarity score",
    "action items",
    "AI meeting assistant",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
