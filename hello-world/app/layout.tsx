import type { Metadata, Viewport } from "next";
import Link from "next/link";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

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
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 72,
          background: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          zIndex: 999,
          borderBottom: "1px solid rgba(0,212,138,0.07)",
          pointerEvents: "none",
        }} />
        <Link
          id="site-logo"
          href="/home"
          style={{
            position: "fixed",
            top: 27,
            left: 24,
            zIndex: 1000,
            fontSize: 22,
            fontWeight: 900,
            letterSpacing: "-0.02em",
            color: "#00D48A",
            textShadow: "0 0 18px rgba(0,212,138,0.7), 0 0 40px rgba(0,212,138,0.3)",
            textDecoration: "none",
            userSelect: "none",
          }}
        >
          LetsBeGoofy
        </Link>
        {children}
      </body>
    </html>
  );
}
