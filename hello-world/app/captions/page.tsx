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
        background:
          "radial-gradient(ellipse 120% 40% at 50% -5%, rgba(0, 212, 138, 0.07) 0%, #000 65%)",
        display: "flex",
        justifyContent: "center",
        padding: "56px 16px 16px",
        color: jade,
      }}
    >
      <div
        style={{
          background:
            "linear-gradient(160deg, #080f0c 0%, #040806 55%, #020504 100%)",
          padding: "20px",
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
            margin: "0 0 16px 0",
            fontSize: "28px",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            textShadow:
              "0 0 30px rgba(0, 212, 138, 0.6), 0 0 60px rgba(0, 212, 138, 0.2)",
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
