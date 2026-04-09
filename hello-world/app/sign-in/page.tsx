import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import GoogleSignInButton from "@/components/GoogleSignInButton";

export const metadata: Metadata = { title: "Sign In" };

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) redirect("/home");

  const { error } = await searchParams;
  const isUnauthorized = error === "unauthorized_domain";

  return (
    <main
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "transparent",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <style>{`
        @keyframes cardPulse {
          0%, 100% { box-shadow: 0 0 0 1px rgba(168,85,247,0.18), 0 8px 40px rgba(168,85,247,0.12), 0 8px 40px rgba(0,212,138,0.06), 0 40px 100px rgba(0,0,0,0.9), inset 0 1px 0 rgba(168,85,247,0.1); }
          50% { box-shadow: 0 0 0 1px rgba(168,85,247,0.32), 0 8px 60px rgba(168,85,247,0.2), 0 8px 60px rgba(0,212,138,0.1), 0 40px 100px rgba(0,0,0,0.9), inset 0 1px 0 rgba(168,85,247,0.15); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Card */}
      <div
        style={{
          position: "relative",
          textAlign: "center",
          padding: "52px 48px",
          borderRadius: 24,
          width: 380,
          background: "linear-gradient(160deg, #120826 0%, #080412 45%, #040806 80%, #020504 100%)",
          border: "1px solid rgba(168,85,247,0.25)",
          animation: "cardPulse 4s ease-in-out infinite, fadeUp 0.6s ease forwards",
        }}
      >
        {/* Icon */}
        <div style={{
          fontSize: 36,
          marginBottom: 20,
          filter: "drop-shadow(0 0 12px rgba(168,85,247,0.9)) drop-shadow(0 0 6px rgba(0,212,138,0.5))",
          animation: "fadeUp 0.6s ease 0.1s both",
        }}>
          ⚡
        </div>

        {/* Title */}
        <h1
          style={{
            margin: "0 0 10px 0",
            fontSize: 26,
            fontWeight: 900,
            letterSpacing: "-0.02em",
            background: "linear-gradient(135deg, #00D48A 0%, #A855F7 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            animation: "fadeUp 0.6s ease 0.15s both",
          }}
        >
          You&apos;re moments away from all the fun!
        </h1>

        {/* Tagline */}
        <p
          style={{
            margin: "0 0 40px 0",
            fontSize: 13,
            color: "#A855F7",
            opacity: 0.5,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            fontWeight: 600,
            animation: "fadeUp 0.6s ease 0.2s both",
          }}
        >
          Sign in to vote &amp; more
        </p>

        {/* Divider */}
        <div style={{
          height: 1,
          background: "linear-gradient(90deg, transparent, rgba(0,212,138,0.3), rgba(168,85,247,0.3), transparent)",
          marginBottom: 32,
          animation: "fadeUp 0.6s ease 0.25s both",
        }} />

        {/* Unauthorized domain error */}
        {isUnauthorized && (
          <p style={{
            margin: "0 0 20px 0",
            fontSize: 13,
            color: "#F43F5E",
            textShadow: "0 0 10px rgba(244,63,94,0.4)",
            fontWeight: 600,
            animation: "fadeUp 0.4s ease both",
          }}>
            Your email domain isn&apos;t authorized. Please use a school email.
          </p>
        )}

        {/* Button */}
        <div style={{ animation: "fadeUp 0.6s ease 0.3s both" }}>
          <GoogleSignInButton />
        </div>
      </div>
    </main>
  );
}
