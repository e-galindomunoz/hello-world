"use client";

import { supabase } from "@/lib/supabaseClient";

export default function GoogleSignInButton() {
  const signIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // MUST be /auth/callback
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <button
      onClick={signIn}
      style={{
        padding: "12px 16px",
        borderRadius: 12,
        border: "1px solid #ccc",
        cursor: "pointer",
        fontSize: 16,
      }}
    >
      Continue with Google
    </button>
  );
}