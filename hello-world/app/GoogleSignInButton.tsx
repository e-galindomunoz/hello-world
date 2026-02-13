"use client";

import { supabase } from "@/lib/supabaseClient";

export default function GoogleSignInButton() {
  const signIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <button
      onClick={signIn}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px 18px",
        borderRadius: "10px",
        border: "1px solid #dadce0",
        background: "#fff",
        cursor: "pointer",
        fontWeight: 500,
        fontSize: 15,
        boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
        transition: "all 0.15s ease",
      }}
      onMouseOver={(e) =>
        (e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)")
      }
      onMouseOut={(e) =>
        (e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.1)")
      }
    >
      {/* Google SVG Logo */}
      <img
        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
        alt="Google logo"
        width={20}
        height={20}
      />

      Continue with Google
    </button>
  );
}