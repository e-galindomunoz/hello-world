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
        padding: "8px 16px",
        borderRadius: 10,
        border: "1px solid rgba(0, 212, 138, 0.4)",
        background: "linear-gradient(145deg, #0d1f17 0%, #060e0a 100%)",
        color: "#00D48A",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        boxShadow: "0 0 14px rgba(0, 212, 138, 0.2), inset 0 1px 0 rgba(0, 212, 138, 0.08)",
        textShadow: "0 0 10px rgba(0, 212, 138, 0.5)",
        transition: "box-shadow 0.2s ease, border-color 0.2s ease",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 22px rgba(0, 212, 138, 0.4), inset 0 1px 0 rgba(0, 212, 138, 0.12)";
        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(0, 212, 138, 0.7)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 14px rgba(0, 212, 138, 0.2), inset 0 1px 0 rgba(0, 212, 138, 0.08)";
        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(0, 212, 138, 0.4)";
      }}
    >
      Log out
    </button>
  );
}
