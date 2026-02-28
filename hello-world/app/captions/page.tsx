export const dynamic = "force-dynamic";

import { createSupabaseServerClient } from "@/lib/supabaseServer";
import SignOutButton from "../SignOutButton";
import Link from "next/link";
import { redirect } from "next/navigation";
import UploadCaptioner from "./UploadCaptioner";
import CaptionFeed from "./CaptionFeed";
import { getRandomCaptions } from "./actions";

export default async function CaptionsPage() {
  const jade = "#00D48A";
  const supabase = await createSupabaseServerClient();

  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;

  if (!user) redirect("/");

  const initialCaptions = await getRandomCaptions(10);

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(ellipse 120% 40% at 50% -5%, rgba(0, 212, 138, 0.07) 0%, #000 65%)",
        display: "flex",
        justifyContent: "center",
        paddingTop: 60,
        paddingBottom: 60,
        color: jade,
      }}
    >
      <div
        style={{
          background:
            "linear-gradient(160deg, #080f0c 0%, #040806 55%, #020504 100%)",
          padding: "28px",
          borderRadius: "20px",
          width: 600,
          border: "1px solid rgba(0, 212, 138, 0.25)",
          boxShadow: `
            0 0 0 1px rgba(0, 212, 138, 0.05),
            0 8px 40px rgba(0, 212, 138, 0.08),
            0 40px 80px rgba(0, 0, 0, 0.95),
            inset 0 1px 0 rgba(0, 212, 138, 0.1)
          `,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 28,
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "28px",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                textShadow:
                  "0 0 30px rgba(0, 212, 138, 0.6), 0 0 60px rgba(0, 212, 138, 0.2)",
              }}
            >
              Rate Captions
            </h1>
          </div>
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span
                style={{
                  fontSize: "13px",
                  opacity: 0.5,
                  letterSpacing: "0.01em",
                }}
              >
                {user.email}
              </span>
              <SignOutButton />
            </div>
          ) : (
            <Link href="/" style={{ color: jade, textDecoration: "none" }}>
              Sign In to Vote
            </Link>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <UploadCaptioner />
          <CaptionFeed initialCaptions={initialCaptions} jade={jade} user={user} />
        </div>
      </div>
    </main>
  );
}
