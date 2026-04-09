export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export const metadata: Metadata = { title: "Rate Captions" };
import { redirect } from "next/navigation";
import CaptionFeed from "./CaptionFeed";
import { getRandomCaptions } from "./actions";
import HamburgerMenu from "@/components/HamburgerMenu";

export default async function CaptionsPage() {
  const jade = "#00D48A";
  const supabase = await createSupabaseServerClient();

  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;

  if (!user) redirect("/sign-in");

  const initialCaptions = await getRandomCaptions(10);

  return (
    <>
    <HamburgerMenu userEmail={user.email ?? undefined} />
    <main
      style={{
        height: "100vh",
        overflow: "hidden",
        background: "transparent",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "80px 16px 16px",
        color: jade,
      }}
    >
      <div
        style={{
          background: "linear-gradient(160deg, #0a0514 0%, #080f0c 40%, #040806 80%, #020504 100%)",
          padding: "20px",
          borderRadius: "20px",
          maxWidth: 600,
          width: "100%",
          border: "1px solid rgba(168,85,247,0.2)",
          boxShadow: `
            0 0 0 1px rgba(0,212,138,0.05),
            0 8px 40px rgba(168,85,247,0.1),
            0 8px 40px rgba(0,212,138,0.06),
            0 40px 80px rgba(0,0,0,0.95),
            inset 0 1px 0 rgba(168,85,247,0.1)
          `,
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <h1
          style={{
            margin: "0 0 16px 0",
            fontSize: "28px",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            background: "linear-gradient(135deg, #00D48A 0%, #A855F7 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Rate Captions
        </h1>

        <CaptionFeed initialCaptions={initialCaptions} jade={jade} user={user} />
      </div>
    </main>
    </>
  );
}
