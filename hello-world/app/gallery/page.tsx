export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Gallery" };
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { getGalleryCaptions } from "@/app/captions/actions";
import GalleryGrid from "./GalleryGrid";
import HamburgerMenu from "@/components/HamburgerMenu";
import SignOutButton from "../SignOutButton";

export default async function GalleryPage() {
  const jade = "#00D48A";

  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;

  if (!user) redirect("/");

  const { captions, totalCount } = await getGalleryCaptions("newest", 1);

  return (
    <>
      <style>{`
        @keyframes ambientPulse {
          0%, 100% { opacity: 0.06; }
          50%       { opacity: 0.11; }
        }
        .ambient-orb {
          animation: ambientPulse 6s ease-in-out infinite;
        }
      `}</style>

      <HamburgerMenu />

      <main
        style={{
          minHeight: "100vh",
          background:
            "radial-gradient(ellipse 120% 40% at 50% -5%, rgba(0,212,138,0.07) 0%, #000 65%)",
          color: jade,
          paddingTop: 60,
          paddingBottom: 80,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Ambient background orbs */}
        <div
          className="ambient-orb"
          style={{
            position: "absolute",
            top: -120,
            left: "10%",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(0,212,138,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          className="ambient-orb"
          style={{
            position: "absolute",
            bottom: 0,
            right: "5%",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(0,212,138,0.07) 0%, transparent 70%)",
            pointerEvents: "none",
            animationDelay: "3s",
          }}
        />

        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "0 24px",
            position: "relative",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 40,
            }}
          >
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: "clamp(28px, 4vw, 40px)",
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  textShadow:
                    "0 0 40px rgba(0,212,138,0.6), 0 0 80px rgba(0,212,138,0.2)",
                  lineHeight: 1.1,
                }}
              >
                Gallery
              </h1>
              <p
                style={{
                  margin: "8px 0 0 0",
                  fontSize: 14,
                  opacity: 0.4,
                  letterSpacing: "0.04em",
                }}
              >
                All image &amp; caption combinations
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12, paddingRight: 60 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.35, color: jade }}>
                  Signed in as
                </span>
                <span style={{ fontSize: 13, opacity: 0.4, letterSpacing: "0.01em" }}>
                  {user.email}
                </span>
              </div>
              <SignOutButton />
            </div>
          </div>

          {/* Gallery content */}
          <GalleryGrid initialCaptions={captions} initialTotalCount={totalCount} />
        </div>
      </main>
    </>
  );
}
