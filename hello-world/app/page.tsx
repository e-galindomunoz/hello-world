import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import GoogleSignInButton from "./GoogleSignInButton";

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  // If already logged in, go straight to protected area
  if (user) redirect("/protected");

  // Otherwise show the sign-in screen immediately
  return (
    <main style={{ padding: 32, maxWidth: 560, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 8 }}>Please sign in</h1>
      <p style={{ marginTop: 0, marginBottom: 20 }}>
        Please sign in with Google to continue.
      </p>

      <GoogleSignInButton />
    </main>
  );
}