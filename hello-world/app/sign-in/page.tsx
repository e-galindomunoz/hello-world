import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import GoogleSignInButton from "@/components/GoogleSignInButton";

export const metadata: Metadata = { title: "Sign In" };

export default async function SignInPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) redirect("/home");

  return (
    <main
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#000",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <style>{`
        @keyframes orb1 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
          50% { transform: translate(30px, -20px) scale(1.08); opacity: 0.75; }
        }
        @keyframes orb2 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
          50% { transform: translate(-20px, 30px) scale(1.05); opacity: 0.5; }
        }
        @keyframes titleGlow {
          0%, 100% { text-shadow: 0 0 40px rgba(0,212,138,0.7), 0 0 80px rgba(0,212,138,0.3), 0 0 120px rgba(0,212,138,0.1); }
          50% { text-shadow: 0 0 60px rgba(0,212,138,0.9), 0 0 100px rgba(0,212,138,0.5), 0 0 160px rgba(0,212,138,0.2); }
        }
        @keyframes cardPulse {
          0%, 100% { box-shadow: 0 0 0 1px rgba(0,212,138,0.15), 0 8px 40px rgba(0,212,138,0.1), 0 40px 100px rgba(0,0,0,0.9), inset 0 1px 0 rgba(0,212,138,0.1); }
          50% { box-shadow: 0 0 0 1px rgba(0,212,138,0.25), 0 8px 60px rgba(0,212,138,0.18), 0 40px 100px rgba(0,0,0,0.9), inset 0 1px 0 rgba(0,212,138,0.15); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Ambient background orbs */}
      <div style={{
        position: "absolute", top: "-10%", left: "20%",
        width: 600, height: 600, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(0,212,138,0.12) 0%, transparent 65%)",
        animation: "orb1 8s ease-in-out infinite",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "-10%", right: "15%",
        width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(0,212,138,0.08) 0%, transparent 65%)",
        animation: "orb2 10s ease-in-out infinite",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", top: "40%", left: "-5%",
        width: 300, height: 300, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(0,212,138,0.05) 0%, transparent 65%)",
        animation: "orb2 12s ease-in-out infinite 2s",
        pointerEvents: "none",
      }} />

      {/* Card */}
      <div
        style={{
          position: "relative",
          textAlign: "center",
          padding: "52px 48px",
          borderRadius: 24,
          width: 380,
          background: "linear-gradient(160deg, #080f0c 0%, #040806 60%, #020504 100%)",
          border: "1px solid rgba(0,212,138,0.2)",
          animation: "cardPulse 4s ease-in-out infinite, fadeUp 0.6s ease forwards",
        }}
      >
        {/* Icon */}
        <div style={{
          fontSize: 36,
          marginBottom: 20,
          filter: "drop-shadow(0 0 12px rgba(0,212,138,0.8))",
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
            color: "#00D48A",
            animation: "titleGlow 3s ease-in-out infinite, fadeUp 0.6s ease 0.15s both",
          }}
        >
          You&apos;re moments away from all the fun!
        </h1>

        {/* Tagline */}
        <p
          style={{
            margin: "0 0 40px 0",
            fontSize: 13,
            color: "#00D48A",
            opacity: 0.4,
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
          background: "linear-gradient(90deg, transparent, rgba(0,212,138,0.2), transparent)",
          marginBottom: 32,
          animation: "fadeUp 0.6s ease 0.25s both",
        }} />

        {/* Button */}
        <div style={{ animation: "fadeUp 0.6s ease 0.3s both" }}>
          <GoogleSignInButton />
        </div>
      </div>
    </main>
  );
}
