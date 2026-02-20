import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import GoogleSignInButton from "./GoogleSignInButton";

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  // If already logged in, go straight to captions
  if (user) redirect("/captions");

  // Otherwise show the sign-in screen immediately
  return (
    <main
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f0f10",
      }}
    >
      <div
        style={{
          background: "#1c1c1f",
          padding: "48px 40px",
          borderRadius: "18px",
          textAlign: "center",
          width: "340px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
        }}
      >
        {/* New Title */}
        <h1 style={{ marginBottom: 28, fontSize: 28 }}>
          Welcome 👋
        </h1>

        {/* Centered Button */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <GoogleSignInButton />
        </div>
      </div>
    </main>
  );
}