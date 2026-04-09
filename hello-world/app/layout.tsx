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
        {/* Navbar backdrop */}
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 72,
          background: "rgba(0,0,0,0.88)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          zIndex: 999,
          pointerEvents: "none",
        }} />
        {/* Gradient border line under nav */}
        <div style={{
          position: "fixed",
          top: 71,
          left: 0,
          right: 0,
          height: 1,
          background: "linear-gradient(90deg, transparent 0%, rgba(0,212,138,0.35) 30%, rgba(168,85,247,0.35) 70%, transparent 100%)",
          zIndex: 999,
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
            background: "linear-gradient(135deg, #00D48A 0%, #A855F7 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
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
