"use client";

import { supabase } from "@/lib/supabaseClient";

export default function SignOutButton() {
  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <button
      onClick={signOut}
      style={{
        marginTop: 16,
        padding: "12px 16px",
        borderRadius: 12,
        border: "1px solid #ccc",
        cursor: "pointer",
        fontSize: 16,
      }}
    >
      Log out
    </button>
  );
}