import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import Link from "next/link";

export const metadata: Metadata = { title: "LetsBeGoofy" };

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
    cta: "Go",
  },
  {
    href: "/sign-in",
    icon: "🔓",
    label: "There's more...",
    description: "Generate captions, vote on the funniest ones, and more — sign in to unlock it all",
    color: "#F59E0B",
    colorRgb: "245,158,11",
    darkBg: "linear-gradient(160deg, #1a1000 0%, #0e0800 60%, #060400 100%)",
    hoverBg: "linear-gradient(160deg, #241500 0%, #140a00 100%)",
    cta: "Sign in",
  },
];

export default async function RootPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) redirect("/home");

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
          50%       { box-shadow: 0 0 0 1px rgba(168,85,247,0.32), 0 8px 50px rgba(168,85,247,0.2), 0 30px 80px rgba(0,0,0,0.85); }
        }
        @keyframes cardGlowAmber {
          0%, 100% { box-shadow: 0 0 0 1px rgba(245,158,11,0.18), 0 8px 40px rgba(245,158,11,0.1), 0 30px 80px rgba(0,0,0,0.85); }
          50%       { box-shadow: 0 0 0 1px rgba(245,158,11,0.32), 0 8px 50px rgba(245,158,11,0.2), 0 30px 80px rgba(0,0,0,0.85); }
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
          animation: cardGlowAmber 4s ease-in-out infinite 0.5s;
          transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease;
        }
        .card-amber:hover {
          transform: translateY(-5px) scale(1.02);
          border-color: rgba(245,158,11,0.55) !important;
          background: linear-gradient(160deg, #241500 0%, #140a00 100%) !important;
          box-shadow: 0 0 0 1px rgba(245,158,11,0.4), 0 14px 60px rgba(245,158,11,0.22), 0 40px 100px rgba(0,0,0,0.95) !important;
          animation: none !important;
        }
        .action-card:hover .card-arrow {
          opacity: 1 !important;
          transform: translateX(5px) !important;
        }
      `}</style>

      {/* Header */}
      <div style={{
        textAlign: "center",
        marginBottom: 52,
        animation: "fadeUp 0.55s ease forwards",
      }}>
        <h1 style={{
          margin: 0,
          fontSize: "clamp(32px, 5vw, 48px)",
          fontWeight: 900,
          letterSpacing: "-0.03em",
          background: "linear-gradient(135deg, #00D48A 0%, #A855F7 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}>
          What do you want to do today?
        </h1>
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
            style={{ animation: `fadeUp 0.55s ease ${0.1 + i * 0.12}s both`, flex: "1 1 220px", maxWidth: 280, display: "flex" }}
          >
            <Link
              href={action.href}
              className={`action-card ${action.color === "#A855F7" ? "card-violet" : "card-amber"}`}
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
                  color: action.color,
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
                {action.cta}
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
