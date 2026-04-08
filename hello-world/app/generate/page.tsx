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
          background:
            "#000",
          display: "flex",
          justifyContent: "center",
          padding: "84px 16px",
          color: jade,
        }}
      >
        <div
          style={{
            background:
              "linear-gradient(160deg, #080f0c 0%, #040806 55%, #020504 100%)",
            padding: "28px",
            borderRadius: "20px",
            maxWidth: 600,
            width: "100%",
            border: "1px solid rgba(0, 212, 138, 0.25)",
            boxShadow: `
              0 0 0 1px rgba(0, 212, 138, 0.05),
              0 8px 40px rgba(0, 212, 138, 0.08),
              0 40px 80px rgba(0, 0, 0, 0.95),
              inset 0 1px 0 rgba(0, 212, 138, 0.1)
            `,
          }}
        >
          <h1
            style={{
              margin: "0 0 28px 0",
              fontSize: "28px",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              textShadow:
                "0 0 30px rgba(0, 212, 138, 0.6), 0 0 60px rgba(0, 212, 138, 0.2)",
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
