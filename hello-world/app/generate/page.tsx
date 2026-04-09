export const dynamic = "force-dynamic";

import type { Metadata } from "next";
export const metadata: Metadata = { title: "Generate Captions" };
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import HamburgerMenu from "@/components/HamburgerMenu";
import UploadCaptioner from "@/app/captions/UploadCaptioner";

export default async function GeneratePage() {
  const jade = "#00D48A";
  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) redirect("/sign-in");

  return (
    <>
      <HamburgerMenu userEmail={user.email ?? undefined} />
      <main
        style={{
          minHeight: "100vh",
          background: "transparent",
          display: "flex",
          justifyContent: "center",
          padding: "84px 16px",
          color: jade,
        }}
      >
        <div
          style={{
            background: "linear-gradient(160deg, #1a1000 0%, #0a0514 35%, #040806 70%, #020504 100%)",
            padding: "28px",
            borderRadius: "20px",
            maxWidth: 600,
            width: "100%",
            border: "1px solid rgba(245,158,11,0.2)",
            boxShadow: `
              0 0 0 1px rgba(245,158,11,0.04),
              0 8px 40px rgba(245,158,11,0.1),
              0 8px 40px rgba(0,212,138,0.05),
              0 40px 80px rgba(0,0,0,0.95),
              inset 0 1px 0 rgba(245,158,11,0.08)
            `,
            alignSelf: "flex-start",
          }}
        >
          <h1
            style={{
              margin: "0 0 28px 0",
              fontSize: "28px",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              background: "linear-gradient(135deg, #00D48A 0%, #F59E0B 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Generate Captions
          </h1>

          <UploadCaptioner />
        </div>
      </main>
    </>
  );
}
