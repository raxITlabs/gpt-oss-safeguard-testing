import type { Metadata } from "next";
// Temporarily disabled Google Fonts due to network issues
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SettingsProvider } from "@/contexts/settings-context";
import { NuqsAdapter } from "nuqs/adapters/next/app";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "raxIT | AI Safety Testing Dashboard",
  description: "Monitor and analyze AI safety and security testing results for content moderation policies using openai gpt oss safeguard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <NuqsAdapter>
          <SettingsProvider>
            {children}
          </SettingsProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
