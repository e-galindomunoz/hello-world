export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import SignOutButton from "@/app/SignOutButton";

export const metadata: Metadata = { title: "Welcome" };

const jade = "#00D48A";

const actions = [
  {
    href: "/gallery",
    icon: "◈",
    label: "View Gallery",
    description: "Browse every caption that's been submitted",
  },
  {
    href: "/generate",
    icon: "✦",
    label: "Generate a Caption",
    description: "Upload an image and let the AI do its thing",
  },
  {
    href: "/captions",
    icon: "⚡",
    label: "Vote on Captions",
    description: "Rate the funniest captions in the feed",
  },
];

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/sign-in");

  const fullName =
    data.user.user_metadata?.full_name ||
    data.user.user_metadata?.name ||
    data.user.email?.split("@")[0] ||
    "there";
  const name = fullName.split(" ")[0];

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 20px 40px",
        position: "relative",
        overflow: "hidden",
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
          0%, 100% { text-shadow: 0 0 40px rgba(0,212,138,0.7), 0 0 80px rgba(0,212,138,0.3); }
          50% { text-shadow: 0 0 60px rgba(0,212,138,0.9), 0 0 110px rgba(0,212,138,0.5); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cardGlow {
          0%, 100% { box-shadow: 0 0 0 1px rgba(0,212,138,0.15), 0 8px 40px rgba(0,212,138,0.08), 0 30px 80px rgba(0,0,0,0.9); }
          50% { box-shadow: 0 0 0 1px rgba(0,212,138,0.28), 0 8px 50px rgba(0,212,138,0.15), 0 30px 80px rgba(0,0,0,0.9); }
        }
        .action-card {
          animation: cardGlow 4s ease-in-out infinite;
          transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease, background 0.18s ease;
        }
        .action-card:hover {
          transform: translateY(-4px) scale(1.02);
          border-color: rgba(0,212,138,0.5) !important;
          background: linear-gradient(160deg, #0d1f17 0%, #080f0c 100%) !important;
          box-shadow: 0 0 0 1px rgba(0,212,138,0.35), 0 12px 60px rgba(0,212,138,0.22), 0 40px 100px rgba(0,0,0,0.95) !important;
          animation: none !important;
        }
        .action-card:hover .card-icon {
          filter: drop-shadow(0 0 18px rgba(0,212,138,1));
        }
        .action-card:hover .card-arrow {
          opacity: 1 !important;
          transform: translateX(4px) !important;
        }
      `}</style>

      {/* Sign out */}
      <div style={{ position: "fixed", top: 20, right: 24, zIndex: 1000 }}>
        <SignOutButton />
      </div>


      {/* Header */}
      <div style={{
        textAlign: "center",
        marginBottom: 52,
        animation: "fadeUp 0.55s ease forwards",
      }}>
        <h1 style={{
          margin: "0 0 12px 0",
          fontSize: "clamp(36px, 6vw, 52px)",
          fontWeight: 900,
          letterSpacing: "-0.03em",
          color: jade,
          animation: "titleGlow 3s ease-in-out infinite",
        }}>
          Welcome back, {name}!
        </h1>
        <p style={{
          margin: 0,
          fontSize: 16,
          color: jade,
          opacity: 0.4,
          fontWeight: 500,
          letterSpacing: "0.01em",
        }}>
          What do you want to do today?
        </p>
      </div>

      {/* Cards */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 20,
        justifyContent: "center",
        width: "100%",
        maxWidth: 860,
      }}>
        {actions.map((action, i) => (
          <div
            key={action.href}
            style={{ animation: `fadeUp 0.55s ease ${0.1 + i * 0.12}s both`, flex: "1 1 220px", maxWidth: 260, display: "flex" }}
          >
          <Link
            href={action.href}
            className="action-card"
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              flex: 1,
              padding: "28px 24px 22px",
              borderRadius: 20,
              border: "1px solid rgba(0,212,138,0.2)",
              background: "linear-gradient(160deg, #080f0c 0%, #040806 60%, #020504 100%)",
              textDecoration: "none",
              color: jade,
              cursor: "pointer",
              animation: `cardGlow 4s ease-in-out infinite ${i * 0.3}s`,
            }}
          >
            <div>
              <div className="card-icon" style={{
                fontSize: 30,
                marginBottom: 18,
                filter: "drop-shadow(0 0 10px rgba(0,212,138,0.7))",
                transition: "filter 0.18s ease",
              }}>
                {action.icon}
              </div>
              <h2 style={{
                margin: "0 0 8px 0",
                fontSize: 18,
                fontWeight: 800,
                letterSpacing: "-0.01em",
                textShadow: "0 0 20px rgba(0,212,138,0.4)",
              }}>
                {action.label}
              </h2>
              <p style={{
                margin: 0,
                fontSize: 13,
                opacity: 0.45,
                fontWeight: 500,
                lineHeight: 1.5,
              }}>
                {action.description}
              </p>
            </div>

            <div style={{
              marginTop: 24,
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              opacity: 0.55,
            }}>
              Go
              <span
                className="card-arrow"
                style={{
                  opacity: 0,
                  transform: "translateX(0)",
                  transition: "opacity 0.18s ease, transform 0.18s ease",
                  fontSize: 14,
                }}
              >
                →
              </span>
            </div>
          </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
