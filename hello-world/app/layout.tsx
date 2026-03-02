import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s",
    default: "LetsBeGoofy",
  },
  description: "Generate and rate captions for images.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div
          style={{
            position: "fixed",
            top: 20,
            left: 24,
            zIndex: 1000,
            fontSize: 18,
            fontWeight: 900,
            letterSpacing: "-0.02em",
            color: "#00D48A",
            textShadow: "0 0 18px rgba(0,212,138,0.7), 0 0 40px rgba(0,212,138,0.3)",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          LetsBeGoofy
        </div>
        {children}
      </body>
    </html>
  );
}
