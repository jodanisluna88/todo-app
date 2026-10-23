import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Todo — Next.js + Supabase",
  description: "Todo app with Supabase Auth and Row-Level Security",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
