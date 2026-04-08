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
          background:
            "#000",
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
            background: "#000",
            border: "1px solid rgba(0,212,138,0.15)",
            borderRadius: 14,
            padding: "18px 24px",
            marginBottom: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
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

            {!user && (
              <Link
                href="/sign-in"
                className="signin-btn"
                style={{
                  padding: "8px 16px",
                  borderRadius: 10,
                  border: "1px solid rgba(0,212,138,0.4)",
                  background: "linear-gradient(145deg, #0d1f17 0%, #060e0a 100%)",
                  color: jade,
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  boxShadow: "0 0 14px rgba(0,212,138,0.2), inset 0 1px 0 rgba(0,212,138,0.08)",
                  textShadow: "0 0 10px rgba(0,212,138,0.5)",
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
