export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import SignOutButton from "@/app/SignOutButton";

export const metadata: Metadata = { title: "Welcome" };

const actions = [
  {
    href: "/gallery",
    icon: "◈",
    label: "View Gallery",
    description: "Browse every caption that's been submitted",
    color: "#A855F7",
    colorRgb: "168,85,247",
    darkBg: "linear-gradient(160deg, #120826 0%, #080412 60%, #040208 100%)",
    hoverBg: "linear-gradient(160deg, #1a0d35 0%, #0e061a 100%)",
  },
  {
    href: "/generate",
    icon: "✦",
    label: "Generate a Caption",
    description: "Upload an image and let the AI do its thing",
    color: "#F59E0B",
    colorRgb: "245,158,11",
    darkBg: "linear-gradient(160deg, #1a1000 0%, #0e0800 60%, #060400 100%)",
    hoverBg: "linear-gradient(160deg, #241500 0%, #140a00 100%)",
  },
  {
    href: "/captions",
    icon: "⚡",
    label: "Vote on Captions",
    description: "Rate the funniest captions in the feed",
    color: "#00D48A",
    colorRgb: "0,212,138",
    darkBg: "linear-gradient(160deg, #080f0c 0%, #040806 60%, #020504 100%)",
    hoverBg: "linear-gradient(160deg, #0d1f17 0%, #080f0c 100%)",
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
        background: "transparent",
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
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cardGlowViolet {
          0%, 100% { box-shadow: 0 0 0 1px rgba(168,85,247,0.18), 0 8px 40px rgba(168,85,247,0.1), 0 30px 80px rgba(0,0,0,0.85); }
          50% { box-shadow: 0 0 0 1px rgba(168,85,247,0.32), 0 8px 50px rgba(168,85,247,0.2), 0 30px 80px rgba(0,0,0,0.85); }
        }
        @keyframes cardGlowAmber {
          0%, 100% { box-shadow: 0 0 0 1px rgba(245,158,11,0.18), 0 8px 40px rgba(245,158,11,0.1), 0 30px 80px rgba(0,0,0,0.85); }
          50% { box-shadow: 0 0 0 1px rgba(245,158,11,0.32), 0 8px 50px rgba(245,158,11,0.2), 0 30px 80px rgba(0,0,0,0.85); }
        }
        @keyframes cardGlowJade {
          0%, 100% { box-shadow: 0 0 0 1px rgba(0,212,138,0.18), 0 8px 40px rgba(0,212,138,0.1), 0 30px 80px rgba(0,0,0,0.85); }
          50% { box-shadow: 0 0 0 1px rgba(0,212,138,0.32), 0 8px 50px rgba(0,212,138,0.2), 0 30px 80px rgba(0,0,0,0.85); }
        }
        .card-violet {
          animation: cardGlowViolet 4s ease-in-out infinite;
          transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease;
        }
        .card-violet:hover {
          transform: translateY(-5px) scale(1.02);
          border-color: rgba(168,85,247,0.55) !important;
          background: linear-gradient(160deg, #1a0d35 0%, #0e061a 100%) !important;
          box-shadow: 0 0 0 1px rgba(168,85,247,0.4), 0 14px 60px rgba(168,85,247,0.28), 0 40px 100px rgba(0,0,0,0.95) !important;
          animation: none !important;
        }
        .card-amber {
          animation: cardGlowAmber 4s ease-in-out infinite 0.4s;
          transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease;
        }
        .card-amber:hover {
          transform: translateY(-5px) scale(1.02);
          border-color: rgba(245,158,11,0.55) !important;
          background: linear-gradient(160deg, #241500 0%, #140a00 100%) !important;
          box-shadow: 0 0 0 1px rgba(245,158,11,0.4), 0 14px 60px rgba(245,158,11,0.22), 0 40px 100px rgba(0,0,0,0.95) !important;
          animation: none !important;
        }
        .card-jade {
          animation: cardGlowJade 4s ease-in-out infinite 0.8s;
          transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease;
        }
        .card-jade:hover {
          transform: translateY(-5px) scale(1.02);
          border-color: rgba(0,212,138,0.55) !important;
          background: linear-gradient(160deg, #0d1f17 0%, #080f0c 100%) !important;
          box-shadow: 0 0 0 1px rgba(0,212,138,0.4), 0 14px 60px rgba(0,212,138,0.22), 0 40px 100px rgba(0,0,0,0.95) !important;
          animation: none !important;
        }
        .action-card:hover .card-arrow {
          opacity: 1 !important;
          transform: translateX(5px) !important;
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
          background: "linear-gradient(135deg, #00D48A 0%, #A855F7 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}>
          Welcome back, {name}!
        </h1>
        <p style={{
          margin: 0,
          fontSize: 16,
          color: "#A855F7",
          opacity: 0.5,
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
        {actions.map((action, i) => {
          const cardClass = action.color === "#A855F7" ? "card-violet" : action.color === "#F59E0B" ? "card-amber" : "card-jade";
          return (
            <div
              key={action.href}
              style={{ animation: `fadeUp 0.55s ease ${0.1 + i * 0.12}s both`, flex: "1 1 220px", maxWidth: 260, display: "flex" }}
            >
              <Link
                href={action.href}
                className={`action-card ${cardClass}`}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  flex: 1,
                  padding: "28px 24px 22px",
                  borderRadius: 20,
                  border: `1px solid rgba(${action.colorRgb},0.22)`,
                  background: action.darkBg,
                  textDecoration: "none",
                  color: action.color,
                  cursor: "pointer",
                }}
              >
                <div>
                  <div style={{
                    fontSize: 30,
                    marginBottom: 18,
                    filter: `drop-shadow(0 0 10px rgba(${action.colorRgb},0.8))`,
                  }}>
                    {action.icon}
                  </div>
                  <h2 style={{
                    margin: "0 0 8px 0",
                    fontSize: 18,
                    fontWeight: 800,
                    letterSpacing: "-0.01em",
                    textShadow: `0 0 20px rgba(${action.colorRgb},0.45)`,
                  }}>
                    {action.label}
                  </h2>
                  <p style={{
                    margin: 0,
                    fontSize: 13,
                    opacity: 0.45,
                    fontWeight: 500,
                    lineHeight: 1.5,
                    color: action.color,
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
          );
        })}
      </div>
    </main>
  );
}
