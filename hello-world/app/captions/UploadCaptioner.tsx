"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const API_BASE = "https://api.almostcrackd.ai";
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
]);

type StepStatus = "idle" | "active" | "complete" | "error";

const PIPELINE_STEPS = [
  { label: "Prepare upload" },
  { label: "Upload image" },
  { label: "Register image" },
  { label: "Generate captions" },
];

type CaptionRecord = {
  id?: string;
  content?: string;
  caption?: string;
  text?: string;
  [key: string]: unknown;
};

function getCaptionText(record: unknown): string {
  if (typeof record === "string") return record;
  const value =
    (record as CaptionRecord).content ??
    (record as CaptionRecord).caption ??
    (record as CaptionRecord).text ??
    JSON.stringify(record);
  return String(value);
}

function formatCaption(record: unknown, index: number) {
  return `${index + 1}. ${getCaptionText(record)}`;
}

function getCaptionKey(record: unknown, index: number) {
  if (record && typeof record === "object" && "id" in record) {
    const id = (record as { id?: unknown }).id;
    if (typeof id === "string" || typeof id === "number") return String(id);
  }
  return String(index);
}

function extractCaptions(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  const candidates = [
    (payload as { captions?: unknown }).captions,
    (payload as { data?: unknown }).data,
    (payload as { results?: unknown }).results,
    (payload as { items?: unknown }).items,
  ];
  for (const value of candidates) {
    if (Array.isArray(value)) return value;
  }
  const single =
    (payload as { caption?: unknown }).caption ??
    (payload as { text?: unknown }).text ??
    (payload as { content?: unknown }).content;
  if (typeof single === "string") return [single];
  return [];
}

async function readErrorMessage(response: Response, fallback: string) {
  try {
    const data = await response.json();
    if (typeof data?.error === "string") return data.error;
    if (typeof data?.message === "string") return data.message;
  } catch {}
  return fallback;
}

function StepIcon({ status }: { status: StepStatus }) {
  const jade = "#00D48A";
  if (status === "complete") {
    return (
      <span style={{
        fontSize: 14,
        color: jade,
        textShadow: "0 0 10px rgba(0,212,138,0.8)",
        fontWeight: 700,
        lineHeight: 1,
      }}>✓</span>
    );
  }
  if (status === "error") {
    return (
      <span style={{
        fontSize: 14,
        color: "#ff6b6b",
        textShadow: "0 0 10px rgba(255,107,107,0.6)",
        fontWeight: 700,
        lineHeight: 1,
      }}>✕</span>
    );
  }
  if (status === "active") {
    return (
      <span style={{
        display: "inline-block",
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: jade,
        boxShadow: "0 0 8px rgba(0,212,138,0.9), 0 0 16px rgba(0,212,138,0.5)",
        animation: "stepPulse 1.2s ease-in-out infinite",
      }} />
    );
  }
  // idle
  return (
    <span style={{
      display: "inline-block",
      width: 8,
      height: 8,
      borderRadius: "50%",
      border: "1px solid rgba(0,212,138,0.25)",
    }} />
  );
}

export default function UploadCaptioner() {
  const jade = "#00D48A";
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [steps, setSteps] = useState<StepStatus[]>(["idle", "idle", "idle", "idle"]);
  const [error, setError] = useState<string | null>(null);
  const [captions, setCaptions] = useState<unknown[] | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const previewUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextFile = event.target.files?.[0] ?? null;
      setFile(nextFile);
      setError(null);
      setCaptions(null);
      setSteps(["idle", "idle", "idle", "idle"]);
    },
    []
  );

  const handleGenerate = useCallback(async () => {
    if (!file) { setError("Pick an image first."); return; }
    if (!ALLOWED_TYPES.has(file.type)) {
      setError("Unsupported image type. Use jpg, png, webp, gif, or heic.");
      return;
    }

    setBusy(true);
    setError(null);
    setCaptions(null);
    setSteps(["active", "idle", "idle", "idle"]);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) throw new Error("You must be logged in to generate captions.");

      // Step 0: get presigned URL
      const presignedRes = await fetch(`${API_BASE}/pipeline/generate-presigned-url`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: file.type }),
      });
      if (!presignedRes.ok) throw new Error(await readErrorMessage(presignedRes, "Failed to generate upload URL."));

      const presignedData = await presignedRes.json();
      const presignedUrl = presignedData.presignedUrl as string | undefined;
      const uploadedCdnUrl = presignedData.cdnUrl as string | undefined;
      if (!presignedUrl || !uploadedCdnUrl) throw new Error("Upload URL response was missing data.");

      // Step 1: upload image
      setSteps(["complete", "active", "idle", "idle"]);
      const uploadRes = await fetch(presignedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!uploadRes.ok) throw new Error("Image upload failed.");

      // Step 2: register image
      setSteps(["complete", "complete", "active", "idle"]);
      const registerRes = await fetch(`${API_BASE}/pipeline/upload-image-from-url`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: uploadedCdnUrl, isCommonUse: false }),
      });
      if (!registerRes.ok) throw new Error(await readErrorMessage(registerRes, "Failed to register image."));

      const registerData = await registerRes.json();
      const imageId = registerData.imageId as string | undefined;
      if (!imageId) throw new Error("Image registration response was missing imageId.");

      // Step 3: generate captions
      setSteps(["complete", "complete", "complete", "active"]);
      const captionsRes = await fetch(`${API_BASE}/pipeline/generate-captions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ imageId }),
      });
      if (!captionsRes.ok) throw new Error(await readErrorMessage(captionsRes, "Caption generation failed."));

      const captionsData = await captionsRes.json();
      setSteps(["complete", "complete", "complete", "complete"]);
      setCaptions(extractCaptions(captionsData));
    } catch (err) {
      setSteps(prev => prev.map(s => s === "active" ? "error" : s) as StepStatus[]);
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }, [file]);

  const pipelineStarted = steps.some(s => s !== "idle");

  return (
    <section
      style={{
        border: "1px solid rgba(0, 212, 138, 0.25)",
        background: "linear-gradient(145deg, #060d09 0%, #030806 100%)",
        borderRadius: 16,
        padding: 24,
        boxShadow: `
          0 4px 20px rgba(0, 0, 0, 0.6),
          0 0 40px rgba(0, 212, 138, 0.04),
          inset 0 1px 0 rgba(0, 212, 138, 0.1),
          inset 0 -1px 0 rgba(0, 0, 0, 0.3)
        `,
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <style>{`
        @keyframes stepPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.75); }
        }
        .pick-image-btn {
          transition: box-shadow 0.2s ease, border-color 0.2s ease, background 0.2s ease, transform 0.15s ease;
        }
        .pick-image-btn:hover {
          background: linear-gradient(145deg, #122b1e 0%, #0a1810 100%) !important;
          border-color: rgba(0, 212, 138, 0.65) !important;
          box-shadow: 0 0 20px rgba(0, 212, 138, 0.3), 0 4px 16px rgba(0,0,0,0.6), inset 0 1px 0 rgba(0,212,138,0.15) !important;
          transform: translateY(-1px);
        }
        .pick-image-btn:active {
          transform: translateY(0px);
        }
      `}</style>

      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, letterSpacing: "-0.01em", textShadow: "0 0 20px rgba(0, 212, 138, 0.4)", color: jade }}>
          Generate New Captions
        </h2>
        <p style={{ margin: "6px 0 0 0", opacity: 0.45, fontSize: 13, color: jade, letterSpacing: "0.01em" }}>
          Upload an image and the pipeline will return fresh captions.
        </p>
      </div>

      {/* File + generate controls */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <label
          className="pick-image-btn"
          style={{
            background: "linear-gradient(145deg, #0d1f17 0%, #060e0a 100%)",
            border: "1px solid rgba(0, 212, 138, 0.35)",
            color: jade,
            padding: "10px 18px",
            borderRadius: 10,
            cursor: "pointer",
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: "0.03em",
            display: "inline-block",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(0, 212, 138, 0.08)",
          }}
        >
          {file ? "Change Image" : "Pick Image"}
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/heic"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </label>

        {file && (
          <span style={{ fontSize: 13, color: jade, opacity: 0.55, letterSpacing: "0.02em", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {file.name}
          </span>
        )}

        <button
          onClick={handleGenerate}
          disabled={!file || busy}
          style={{
            background: "linear-gradient(145deg, #00D48A 0%, #00a86d 100%)",
            color: "#000",
            border: "none",
            padding: "10px 18px",
            borderRadius: 10,
            cursor: busy || !file ? "default" : "pointer",
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: "0.03em",
            opacity: !file || busy ? 0.45 : 1,
            boxShadow: !file || busy ? "none" : "0 4px 16px rgba(0, 212, 138, 0.35), inset 0 1px 0 rgba(255,255,255,0.2)",
          }}
        >
          {busy ? "Running..." : "Generate Captions"}
        </button>
      </div>

      {/* Step progress */}
      {pipelineStarted && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 0,
            padding: "4px 0",
            borderRadius: 10,
          }}
        >
          {PIPELINE_STEPS.map((step, i) => {
            const status = steps[i];
            const isActive = status === "active";
            const isComplete = status === "complete";
            const isError = status === "error";
            const isIdle = status === "idle";

            return (
              <div
                key={step.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 14px",
                  borderRadius: 8,
                  background: isActive
                    ? "rgba(0,212,138,0.06)"
                    : "transparent",
                  transition: "background 0.3s ease",
                }}
              >
                {/* Step number */}
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  color: jade,
                  opacity: isIdle ? 0.2 : isActive ? 0.7 : 0.4,
                  minWidth: 20,
                  fontVariantNumeric: "tabular-nums",
                }}>
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Label */}
                <span style={{
                  flex: 1,
                  fontSize: 13,
                  fontWeight: isActive ? 700 : 500,
                  color: isError ? "#ff6b6b" : jade,
                  opacity: isIdle ? 0.25 : isActive ? 1 : 0.6,
                  letterSpacing: "0.02em",
                  textShadow: isActive ? "0 0 12px rgba(0,212,138,0.5)" : "none",
                  transition: "opacity 0.3s ease",
                }}>
                  {step.label}
                </span>

                {/* Status icon */}
                <StepIcon status={status} />
              </div>
            );
          })}
        </div>
      )}

      {/* Error */}
      {error && (
        <p style={{ color: "#ff6b6b", margin: 0, fontSize: 13, textShadow: "0 0 10px rgba(255, 107, 107, 0.3)" }}>
          {error}
        </p>
      )}

      {/* Image preview */}
      {previewUrl && (
        <img
          src={previewUrl}
          alt="Preview"
          style={{
            width: "100%",
            borderRadius: 12,
            objectFit: "cover",
            aspectRatio: "1/1",
            boxShadow: `
              0 0 0 1px rgba(0, 212, 138, 0.18),
              0 8px 32px rgba(0, 0, 0, 0.8),
              0 0 50px rgba(0, 212, 138, 0.07)
            `,
          }}
        />
      )}

      {/* Results */}
      {captions && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            padding: "16px",
            background: "rgba(0, 212, 138, 0.04)",
            borderRadius: 10,
            border: "1px solid rgba(0, 212, 138, 0.12)",
          }}
        >
          <h3 style={{ margin: "0 0 6px 0", fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.6, color: jade }}>
            Results — click to copy
          </h3>
          {captions.length === 0 ? (
            <p style={{ margin: 0, fontSize: 13, opacity: 0.5, color: jade }}>No captions returned.</p>
          ) : (
            captions.map((caption, index) => {
              const copied = copiedIndex === index;
              return (
                <div
                  key={getCaptionKey(caption, index)}
                  onClick={() => {
                    navigator.clipboard.writeText(getCaptionText(caption));
                    setCopiedIndex(index);
                    setTimeout(() => setCopiedIndex(null), 2000);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "10px 12px",
                    borderRadius: 8,
                    cursor: "pointer",
                    border: `1px solid rgba(0,212,138,${copied ? "0.35" : "0.08"})`,
                    background: copied ? "rgba(0,212,138,0.08)" : "transparent",
                    transition: "background 0.2s ease, border-color 0.2s ease",
                  }}
                  onMouseEnter={e => {
                    if (!copied) (e.currentTarget as HTMLDivElement).style.background = "rgba(0,212,138,0.05)";
                  }}
                  onMouseLeave={e => {
                    if (!copied) (e.currentTarget as HTMLDivElement).style.background = "transparent";
                  }}
                >
                  <p style={{ margin: 0, fontSize: 14, color: jade, lineHeight: 1.5, opacity: 0.85, flex: 1 }}>
                    {formatCaption(caption, index)}
                  </p>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: jade,
                    opacity: copied ? 1 : 0,
                    textShadow: "0 0 10px rgba(0,212,138,0.6)",
                    transition: "opacity 0.2s ease",
                    whiteSpace: "nowrap",
                    paddingTop: 2,
                  }}>
                    Copied ✓
                  </span>
                </div>
              );
            })
          )}
        </div>
      )}
    </section>
  );
}
