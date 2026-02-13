import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import SignOutButton from "../SignOutButton";

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

      <SignOutButton />
    </main>
  );
}