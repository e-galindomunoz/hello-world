"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
      <span style={{ fontSize: 14, color: jade, textShadow: "0 0 10px rgba(0,212,138,0.8)", fontWeight: 700, lineHeight: 1 }}>✓</span>
    );
  }
  if (status === "error") {
    return (
      <span style={{ fontSize: 14, color: "#ff6b6b", textShadow: "0 0 10px rgba(255,107,107,0.6)", fontWeight: 700, lineHeight: 1 }}>✕</span>
    );
  }
  if (status === "active") {
    return (
      <span style={{
        display: "inline-block", width: 8, height: 8, borderRadius: "50%",
        background: jade,
        boxShadow: "0 0 8px rgba(0,212,138,0.9), 0 0 16px rgba(0,212,138,0.5)",
        animation: "stepPulse 1.2s ease-in-out infinite",
      }} />
    );
  }
  return (
    <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", border: "1px solid rgba(0,212,138,0.25)" }} />
  );
}

interface FileResult {
  captions: unknown[];
  error: string | null;
}

async function buildMemeCanvas(blobUrl: string, captionText: string): Promise<HTMLCanvasElement> {
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("load failed"));
    img.src = blobUrl;
  });

  const MIN_WIDTH = 1200;
  const scale = img.naturalWidth < MIN_WIDTH ? MIN_WIDTH / img.naturalWidth : 1;
  const drawWidth = Math.round(img.naturalWidth * scale);
  const drawHeight = Math.round(img.naturalHeight * scale);

  const padding = Math.round(28 * scale);
  const fontSize = Math.min(Math.round(48 * scale), Math.max(Math.round(22 * scale), Math.floor(drawWidth / 18)));
  const lineHeight = fontSize * 1.55;
  const maxTextWidth = drawWidth - padding * 2;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  ctx.font = `700 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  const words = captionText.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxTextWidth) {
      if (line) lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);

  const captionBlockHeight = lines.length * lineHeight + padding * 2.2;
  canvas.width = drawWidth;
  canvas.height = drawHeight + captionBlockHeight;

  ctx.fillStyle = "#020a07";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#ffffff";
  ctx.font = `700 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  lines.forEach((l, i) => {
    ctx.fillText(l, canvas.width / 2, padding + i * lineHeight);
  });

  ctx.drawImage(img, 0, captionBlockHeight, drawWidth, drawHeight);

  return canvas;
}

export default function UploadCaptioner() {
  const jade = "#00D48A";
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(-1);
  const [steps, setSteps] = useState<StepStatus[]>(["idle", "idle", "idle", "idle"]);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<FileResult[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [memeSaving, setMemeSaving] = useState<string | null>(null); // key of caption being saved
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Blob URLs for selected files — recreated when files change
  const previewUrls = useMemo(() => files.map(f => URL.createObjectURL(f)), [files]);

  useEffect(() => {
    return () => previewUrls.forEach(u => URL.revokeObjectURL(u));
  }, [previewUrls]);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const selected = Array.from(event.target.files ?? []);
      setFiles(selected);
      setError(null);
      setResults([]);
      setCurrentFileIndex(-1);
      setSteps(["idle", "idle", "idle", "idle"]);
    },
    []
  );

  const handleGenerate = useCallback(async () => {
    if (files.length === 0) { setError("Pick at least one image first."); return; }

    const badFile = files.find(f => !ALLOWED_TYPES.has(f.type));
    if (badFile) {
      setError(`Unsupported file type: ${badFile.name}. Use jpg, png, webp, gif, or heic.`);
      return;
    }

    setBusy(true);
    setError(null);
    setResults([]);

    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;
    if (!accessToken) {
      setError("You must be logged in to generate captions.");
      setBusy(false);
      return;
    }

    const allResults: FileResult[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setCurrentFileIndex(i);
      setSteps(["active", "idle", "idle", "idle"]);

      try {
        // Step 0: presigned URL
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
          body: JSON.stringify({ imageId, humorFlavorId: 360 }),
        });
        if (!captionsRes.ok) throw new Error(await readErrorMessage(captionsRes, "Caption generation failed."));

        const captionsData = await captionsRes.json();
        setSteps(["complete", "complete", "complete", "complete"]);
        allResults.push({ captions: extractCaptions(captionsData), error: null });
      } catch (err) {
        setSteps(prev => prev.map(s => s === "active" ? "error" : s) as StepStatus[]);
        allResults.push({ captions: [], error: err instanceof Error ? err.message : "Something went wrong." });
      }

      setResults([...allResults]);
    }

    setCurrentFileIndex(-1);
    setBusy(false);
  }, [files]);

  const handleCopy = useCallback((key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    if (copiedTimer.current) clearTimeout(copiedTimer.current);
    copiedTimer.current = setTimeout(() => setCopiedKey(null), 2000);
  }, []);

  const handleSaveMeme = useCallback(async (fileIndex: number, captionIndex: number, captionText: string) => {
    const key = `${fileIndex}-${captionIndex}`;
    const blobUrl = previewUrls[fileIndex];
    if (!blobUrl) return;

    setMemeSaving(key);
    try {
      const canvas = await buildMemeCanvas(blobUrl, captionText);
      const link = document.createElement("a");
      link.download = `meme-${fileIndex + 1}-${captionIndex + 1}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      // silently ignore — blob URL should always work for local files
    } finally {
      setMemeSaving(null);
    }
  }, [previewUrls]);

  useEffect(() => {
    return () => { if (copiedTimer.current) clearTimeout(copiedTimer.current); };
  }, []);

  const pipelineStarted = steps.some(s => s !== "idle");
  const hasResults = results.length > 0;
  const isMultiple = files.length > 1;

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
        .pick-image-btn:active { transform: translateY(0px); }
        .caption-row:hover { background: rgba(0,212,138,0.05) !important; }
      `}</style>

      <div>
        <h2 style={{
          margin: 0, fontSize: 18, fontWeight: 700, letterSpacing: "-0.01em",
          background: "linear-gradient(135deg, #00D48A 0%, #F59E0B 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}>
          Generate New Captions
        </h2>
        <p style={{ margin: "6px 0 0 0", opacity: 0.5, fontSize: 13, color: "#F59E0B", letterSpacing: "0.01em" }}>
          Upload one or more images and the pipeline will return fresh captions.
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
          {files.length > 0 ? "Change Images" : "Pick Images"}
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/heic"
            onChange={handleFileChange}
            multiple
            style={{ display: "none" }}
          />
        </label>

        {files.length > 0 && (
          <span style={{ fontSize: 13, color: jade, opacity: 0.55, letterSpacing: "0.02em" }}>
            {files.length === 1 ? files[0].name : `${files.length} images selected`}
          </span>
        )}

        <button
          onClick={handleGenerate}
          disabled={files.length === 0 || busy}
          style={{
            background: files.length === 0 || busy ? "rgba(245,158,11,0.25)" : "linear-gradient(135deg, #00D48A 0%, #F59E0B 100%)",
            color: "#000",
            border: "none",
            padding: "10px 18px",
            borderRadius: 10,
            cursor: busy || files.length === 0 ? "default" : "pointer",
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: "0.03em",
            opacity: files.length === 0 || busy ? 0.5 : 1,
            boxShadow: files.length === 0 || busy ? "none" : "0 4px 16px rgba(245,158,11,0.3), 0 4px 16px rgba(0,212,138,0.2), inset 0 1px 0 rgba(255,255,255,0.2)",
          }}
        >
          {busy ? `Processing ${currentFileIndex + 1} of ${files.length}...` : hasResults ? "↺ Generate More Captions" : "Generate Captions"}
        </button>
      </div>

      {/* Thumbnail strip for selected files (before/during processing) */}
      {files.length > 0 && !hasResults && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {previewUrls.map((url, i) => (
            <div
              key={i}
              style={{
                position: "relative",
                width: 72,
                height: 72,
                borderRadius: 8,
                overflow: "hidden",
                border: `1px solid rgba(0,212,138,${busy && currentFileIndex === i ? "0.7" : "0.2"})`,
                boxShadow: busy && currentFileIndex === i ? "0 0 12px rgba(0,212,138,0.4)" : "none",
                transition: "border-color 0.3s, box-shadow 0.3s",
              }}
            >
              <img src={url} alt={files[i].name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              {busy && currentFileIndex === i && (
                <div style={{
                  position: "absolute", inset: 0,
                  background: "rgba(0,212,138,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{
                    width: 10, height: 10, borderRadius: "50%", background: jade,
                    boxShadow: "0 0 8px rgba(0,212,138,0.9)",
                    animation: "stepPulse 1.2s ease-in-out infinite",
                    display: "inline-block",
                  }} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Step progress */}
      {pipelineStarted && (
        <div style={{ display: "flex", flexDirection: "column", gap: 0, padding: "4px 0", borderRadius: 10 }}>
          {isMultiple && busy && (
            <p style={{ margin: "0 0 8px 0", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: jade, opacity: 0.5 }}>
              Image {currentFileIndex + 1} of {files.length}
            </p>
          )}
          {PIPELINE_STEPS.map((step, i) => {
            const status = steps[i];
            const isActive = status === "active";
            const isError = status === "error";
            const isIdle = status === "idle";

            return (
              <div
                key={step.label}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 14px", borderRadius: 8,
                  background: isActive ? "rgba(0,212,138,0.06)" : "transparent",
                  transition: "background 0.3s ease",
                }}
              >
                <span style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: jade,
                  opacity: isIdle ? 0.2 : isActive ? 0.7 : 0.4,
                  minWidth: 20, fontVariantNumeric: "tabular-nums",
                }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span style={{
                  flex: 1, fontSize: 13,
                  fontWeight: isActive ? 700 : 500,
                  color: isError ? "#ff6b6b" : jade,
                  opacity: isIdle ? 0.25 : isActive ? 1 : 0.6,
                  letterSpacing: "0.02em",
                  textShadow: isActive ? "0 0 12px rgba(0,212,138,0.5)" : "none",
                  transition: "opacity 0.3s ease",
                }}>
                  {step.label}
                </span>
                <StepIcon status={status} />
              </div>
            );
          })}
        </div>
      )}

      {/* Top-level error */}
      {error && (
        <p style={{ color: "#ff6b6b", margin: 0, fontSize: 13, textShadow: "0 0 10px rgba(255, 107, 107, 0.3)" }}>
          {error}
        </p>
      )}

      {/* Results — one card per image */}
      {hasResults && results.map((result, fileIndex) => (
        <div
          key={fileIndex}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            padding: 16,
            background: "rgba(0, 212, 138, 0.03)",
            borderRadius: 12,
            border: "1px solid rgba(0, 212, 138, 0.12)",
          }}
        >
          {/* Image thumbnail + filename header */}
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <img
              src={previewUrls[fileIndex]}
              alt={files[fileIndex]?.name ?? ""}
              style={{
                width: 80, height: 80, objectFit: "cover", borderRadius: 8, flexShrink: 0,
                border: "1px solid rgba(0,212,138,0.2)",
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                margin: "0 0 4px 0", fontSize: 12, fontWeight: 700,
                color: jade, opacity: 0.6, letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}>
                {isMultiple ? `Image ${fileIndex + 1}` : "Results"}
              </p>
              <p style={{
                margin: 0, fontSize: 12, color: jade, opacity: 0.4,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {files[fileIndex]?.name}
              </p>
            </div>
          </div>

          {result.error ? (
            <p style={{ margin: 0, fontSize: 13, color: "#ff6b6b", opacity: 0.85 }}>{result.error}</p>
          ) : result.captions.length === 0 ? (
            <p style={{ margin: 0, fontSize: 13, color: jade, opacity: 0.45 }}>No captions returned.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <p style={{ margin: "0 0 4px 0", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: jade, opacity: 0.5 }}>
                Click to copy · Save as meme
              </p>
              {result.captions.map((caption, captionIndex) => {
                const text = getCaptionText(caption);
                const rowKey = `${fileIndex}-${captionIndex}-${getCaptionKey(caption, captionIndex)}`;
                const copied = copiedKey === rowKey;
                const saving = memeSaving === `${fileIndex}-${captionIndex}`;

                return (
                  <div
                    key={rowKey}
                    className="caption-row"
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 8,
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: `1px solid rgba(0,212,138,${copied ? "0.35" : "0.08"})`,
                      background: copied ? "rgba(0,212,138,0.08)" : "transparent",
                      transition: "background 0.2s ease, border-color 0.2s ease",
                    }}
                  >
                    {/* Caption text — click to copy */}
                    <p
                      onClick={() => handleCopy(rowKey, text)}
                      style={{ margin: 0, fontSize: 14, color: jade, lineHeight: 1.5, opacity: 0.85, flex: 1, cursor: "pointer" }}
                    >
                      {captionIndex + 1}. {text}
                    </p>

                    {/* Actions */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                        color: jade, opacity: copied ? 1 : 0,
                        textShadow: "0 0 10px rgba(0,212,138,0.6)",
                        transition: "opacity 0.2s ease", whiteSpace: "nowrap",
                        cursor: "pointer",
                      }}
                        onClick={() => handleCopy(rowKey, text)}
                      >
                        Copied ✓
                      </span>
                      {!copied && (
                        <button
                          onClick={() => handleSaveMeme(fileIndex, captionIndex, text)}
                          disabled={saving}
                          style={{
                            background: "transparent",
                            border: "1px solid rgba(0,212,138,0.25)",
                            color: jade,
                            padding: "3px 8px",
                            borderRadius: 5,
                            cursor: saving ? "default" : "pointer",
                            fontSize: 10,
                            fontWeight: 600,
                            letterSpacing: "0.05em",
                            textTransform: "uppercase",
                            opacity: saving ? 0.5 : 0.7,
                            whiteSpace: "nowrap",
                            transition: "opacity 0.15s",
                          }}
                        >
                          {saving ? "..." : "⬇ Meme"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
