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
    <>
      <style>{`
        .google-btn {
          transition: box-shadow 0.2s ease, border-color 0.2s ease, background 0.2s ease, transform 0.15s ease;
        }
        .google-btn:hover {
          background: linear-gradient(145deg, #0d1f17 0%, #0a1810 100%) !important;
          border-color: rgba(0,212,138,0.65) !important;
          box-shadow: 0 0 28px rgba(0,212,138,0.35), 0 8px 24px rgba(0,0,0,0.7), inset 0 1px 0 rgba(0,212,138,0.15) !important;
          transform: translateY(-2px);
        }
        .google-btn:active {
          transform: translateY(0px);
        }
      `}</style>
      <button
        className="google-btn"
        onClick={signIn}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          width: "100%",
          padding: "14px 24px",
          borderRadius: 12,
          border: "1px solid rgba(0,212,138,0.35)",
          background: "linear-gradient(145deg, #081410 0%, #050e09 100%)",
          color: "#00D48A",
          cursor: "pointer",
          fontWeight: 700,
          fontSize: 14,
          letterSpacing: "0.04em",
          boxShadow: "0 0 16px rgba(0,212,138,0.15), 0 4px 20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(0,212,138,0.08)",
          textShadow: "0 0 12px rgba(0,212,138,0.4)",
        }}
      >
        <img
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
          alt="Google logo"
          width={18}
          height={18}
          style={{ filter: "brightness(0) invert(1)", opacity: 0.85 }}
        />
        Continue with Google
      </button>
    </>
  );
}
