"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const jade = "#00D48A";
const violet = "#A855F7";
const amber = "#F59E0B";

const navLinks = [
  { href: "/captions", label: "Rate Captions", icon: "⚡", color: jade,   colorRgb: "0,212,138" },
  { href: "/gallery",  label: "Gallery",        icon: "◈", color: violet, colorRgb: "168,85,247" },
  { href: "/generate", label: "Generate",       icon: "✦", color: amber,  colorRgb: "245,158,11" },
];

export default function HamburgerMenu({ userEmail }: { userEmail?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    function handleClick(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("pointerdown", handleClick);
    return () => document.removeEventListener("pointerdown", handleClick);
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <>
      <style>{`
        @keyframes menuFadeIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
        @keyframes burgerGlow {
          0%, 100% { box-shadow: 0 0 12px rgba(0,212,138,0.2), 0 0 20px rgba(168,85,247,0.12), 0 4px 20px rgba(0,0,0,0.6); }
          50%       { box-shadow: 0 0 22px rgba(0,212,138,0.38), 0 0 30px rgba(168,85,247,0.22), 0 4px 20px rgba(0,0,0,0.6); }
        }
        .burger-btn {
          animation: burgerGlow 3s ease-in-out infinite;
        }
        .burger-btn:hover {
          background: linear-gradient(145deg, #130d22 0%, #0a1810 100%) !important;
          box-shadow: 0 0 28px rgba(0,212,138,0.4), 0 0 28px rgba(168,85,247,0.3), 0 4px 20px rgba(0,0,0,0.7) !important;
          animation: none !important;
        }
        .nav-link-item {
          transition: background 0.15s ease, box-shadow 0.15s ease;
        }
        .signout-btn {
          transition: background 0.15s ease, box-shadow 0.15s ease;
        }
        .signout-btn:hover {
          background: rgba(244,63,94,0.1) !important;
          box-shadow: inset 0 0 0 1px rgba(244,63,94,0.25) !important;
        }
      `}</style>

      <div
        ref={ref}
        style={{
          position: "fixed",
          top: 20,
          right: 24,
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 8,
        }}
      >
        {/* Burger button */}
        <button
          className="burger-btn"
          onClick={() => setOpen(v => !v)}
          aria-label="Open menu"
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            border: `1px solid rgba(168,85,247,${open ? "0.55" : "0.3"})`,
            background: open
              ? "linear-gradient(145deg, #130d22 0%, #0a1810 100%)"
              : "linear-gradient(145deg, #0a0514 0%, #050e09 100%)",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
            padding: 0,
            transition: "border-color 0.2s ease, background 0.2s ease",
          }}
        >
          {[0, 1, 2].map(i => (
            <span
              key={i}
              style={{
                display: "block",
                width: 18,
                height: 2,
                borderRadius: 2,
                background: i === 0 ? jade : i === 1 ? violet : amber,
                boxShadow: i === 0
                  ? "0 0 6px rgba(0,212,138,0.8)"
                  : i === 1
                  ? "0 0 6px rgba(168,85,247,0.8)"
                  : "0 0 6px rgba(245,158,11,0.8)",
                transition: "transform 0.2s ease, opacity 0.2s ease",
                transform:
                  open && i === 0
                    ? "translateY(7px) rotate(45deg)"
                    : open && i === 2
                    ? "translateY(-7px) rotate(-45deg)"
                    : "none",
                opacity: open && i === 1 ? 0 : 1,
              }}
            />
          ))}
        </button>

        {/* Dropdown */}
        {open && (
          <div
            style={{
              animation: "menuFadeIn 0.18s ease forwards",
              background: "linear-gradient(160deg, #0a0514 0%, #050408 50%, #040806 100%)",
              border: "1px solid rgba(168,85,247,0.25)",
              borderRadius: 14,
              padding: "8px",
              minWidth: 190,
              boxShadow: `
                0 0 0 1px rgba(168,85,247,0.06),
                0 8px 32px rgba(168,85,247,0.12),
                0 8px 32px rgba(0,212,138,0.06),
                0 20px 60px rgba(0,0,0,0.95),
                inset 0 1px 0 rgba(168,85,247,0.1)
              `,
            }}
          >
            {userEmail && (
              <>
                <div style={{ padding: "10px 14px 8px" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: violet, opacity: 0.45 }}>
                    Signed in as
                  </div>
                  <div style={{
                    fontSize: 12,
                    color: violet,
                    opacity: 0.6,
                    letterSpacing: "0.01em",
                    marginTop: 2,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}>
                    {userEmail}
                  </div>
                </div>
                <div style={{ margin: "0 8px 6px", height: 1, background: "linear-gradient(90deg, rgba(0,212,138,0.15), rgba(168,85,247,0.15))" }} />
              </>
            )}

            {navLinks.map(link => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="nav-link-item"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 14px",
                    borderRadius: 9,
                    textDecoration: "none",
                    color: link.color,
                    fontSize: 14,
                    fontWeight: active ? 700 : 500,
                    letterSpacing: "0.01em",
                    background: active ? `rgba(${link.colorRgb},0.1)` : "transparent",
                    boxShadow: active
                      ? `inset 0 0 0 1px rgba(${link.colorRgb},0.25)`
                      : "none",
                    textShadow: active
                      ? `0 0 14px rgba(${link.colorRgb},0.6)`
                      : "none",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = `rgba(${link.colorRgb},0.08)`;
                    (e.currentTarget as HTMLElement).style.boxShadow = `inset 0 0 0 1px rgba(${link.colorRgb},0.2)`;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = active ? `rgba(${link.colorRgb},0.1)` : "transparent";
                    (e.currentTarget as HTMLElement).style.boxShadow = active ? `inset 0 0 0 1px rgba(${link.colorRgb},0.25)` : "none";
                  }}
                >
                  <span style={{
                    fontSize: 16,
                    filter: `drop-shadow(0 0 4px rgba(${link.colorRgb},0.7))`,
                  }}>
                    {link.icon}
                  </span>
                  {link.label}
                  {active && (
                    <span style={{
                      marginLeft: "auto",
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: link.color,
                      boxShadow: `0 0 6px rgba(${link.colorRgb},0.9)`,
                    }} />
                  )}
                </Link>
              );
            })}

            {userEmail && (
              <>
                <div style={{
                  margin: "6px 8px",
                  height: 1,
                  background: "linear-gradient(90deg, rgba(0,212,138,0.1), rgba(245,158,11,0.1))",
                }} />
                <button
                  className="signout-btn"
                  onClick={handleSignOut}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 14px",
                    borderRadius: 9,
                    width: "100%",
                    border: "none",
                    background: "transparent",
                    color: "rgba(244,63,94,0.8)",
                    fontSize: 14,
                    fontWeight: 500,
                    letterSpacing: "0.01em",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <span style={{ fontSize: 16 }}>→</span>
                  Log out
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
