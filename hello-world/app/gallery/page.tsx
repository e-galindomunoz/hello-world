export const dynamic = "force-dynamic";

import type { Metadata } from "next";
export const metadata: Metadata = { title: "Gallery" };
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { getGalleryCaptions } from "@/app/captions/actions";
import GalleryGrid from "./GalleryGrid";
import HamburgerMenu from "@/components/HamburgerMenu";
import Link from "next/link";

export default async function GalleryPage() {
  const jade = "#00D48A";

  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;

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
        .signin-btn {
          transition: box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .signin-btn:hover {
          box-shadow: 0 0 22px rgba(0,212,138,0.4), inset 0 1px 0 rgba(0,212,138,0.12) !important;
          border-color: rgba(0,212,138,0.7) !important;
        }
      `}</style>

      <HamburgerMenu userEmail={user?.email ?? undefined} />

      <main
        style={{
          minHeight: "100vh",
          background: "transparent",
          color: jade,
          paddingTop: 84,
          paddingBottom: 80,
          position: "relative",
          overflow: "hidden",
        }}
      >

        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "0 24px",
            position: "relative",
          }}
        >
          {/* Header */}
          <div style={{
            background: "linear-gradient(145deg, #120826 0%, #080412 50%, #020504 100%)",
            border: "1px solid rgba(168,85,247,0.2)",
            borderRadius: 14,
            padding: "18px 24px",
            marginBottom: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 4px 24px rgba(168,85,247,0.1), 0 0 0 1px rgba(0,212,138,0.04)",
          }}>
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: "clamp(28px, 4vw, 40px)",
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.1,
                  background: "linear-gradient(135deg, #00D48A 0%, #A855F7 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Gallery
              </h1>
              <p
                style={{
                  margin: "8px 0 0 0",
                  fontSize: 14,
                  color: "#A855F7",
                  opacity: 0.45,
                  letterSpacing: "0.04em",
                }}
              >
                All image &amp; caption combinations
              </p>
            </div>

            {!user && (
              <Link
                href="/sign-in"
                className="signin-btn"
                style={{
                  padding: "8px 16px",
                  borderRadius: 10,
                  border: "1px solid rgba(168,85,247,0.4)",
                  background: "linear-gradient(145deg, #130d22 0%, #080412 100%)",
                  color: "#A855F7",
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  boxShadow: "0 0 14px rgba(168,85,247,0.2), inset 0 1px 0 rgba(168,85,247,0.08)",
                  textShadow: "0 0 10px rgba(168,85,247,0.5)",
                }}
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Gallery content */}
          <GalleryGrid initialCaptions={captions} initialTotalCount={totalCount} />
        </div>
      </main>
    </>
  );
}
