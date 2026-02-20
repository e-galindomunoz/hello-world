import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import SignOutButton from "../SignOutButton";
import Link from "next/link";

export default async function ProtectedPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  // Not logged in → back to sign-in page
  if (!user) redirect("/");

  return (
    <main style={{ padding: 32, maxWidth: 700, margin: "0 auto" }}>
      <h1>Protected Page</h1>
      <p>If you can see this page, you’re authenticated.</p>
      <p>
        Signed in as: <b>{user.email}</b>
      </p>

      <div style={{ marginTop: 24, display: "flex", gap: 16 }}>
        <Link href="/captions" style={{ 
          padding: "12px 16px", 
          borderRadius: 12, 
          background: "#3b82f6", 
          color: "white", 
          textDecoration: "none" 
        }}>
          Go to Captions
        </Link>
        <SignOutButton />
      </div>
    </main>
  );
}