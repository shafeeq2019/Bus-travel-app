import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Transit Line | Bus Travel Planning",
  description: "Routes, schedules, and live delay information for Transit Line bus service."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-body min-h-screen bg-paper text-ink">
        <Providers>
          <SiteHeader />
          <main className="min-h-[calc(100vh-64px)]">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
