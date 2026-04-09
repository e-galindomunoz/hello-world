"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getGalleryCaptions } from "@/app/captions/actions";

const jade = "#00D48A";
const PAGE_SIZE = 50;

interface GalleryCaption {
  id: string;
  content: string;
  created_datetime_utc: string | null;
  images?: { url: string } | null;
}

interface GalleryGridProps {
  initialCaptions: GalleryCaption[];
  initialTotalCount: number;
}

function getPaginationRange(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
  if (current >= total - 3) return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function buildMemeCanvas(imageUrl: string, captionText: string): Promise<HTMLCanvasElement> {
  const proxied = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = proxied;
  });

  const padding = 28;
  const fontSize = Math.min(38, Math.max(18, Math.floor(img.width / 20)));
  const lineHeight = fontSize * 1.55;
  const maxTextWidth = img.width - padding * 2;

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
  canvas.width = img.width;
  canvas.height = img.height + captionBlockHeight;

  ctx.fillStyle = "#020a07";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#ffffff";
  ctx.font = `700 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  lines.forEach((l, i) => {
    ctx.fillText(l, canvas.width / 2, padding + i * lineHeight);
  });

  ctx.drawImage(img, 0, captionBlockHeight);

  return canvas;
}

export default function GalleryGrid({ initialCaptions, initialTotalCount }: GalleryGridProps) {
  const [captions, setCaptions] = useState<GalleryCaption[]>(initialCaptions);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const downloadErrorTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  // Shuffle client-side only to avoid SSR/client mismatch
  useEffect(() => {
    setCaptions(prev => shuffle(prev));
  }, []);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    getGalleryCaptions(sort, page).then(result => {
      if (cancelled) return;
      setCaptions(shuffle(result.captions as GalleryCaption[]));
      setTotalCount(result.totalCount);
      setIsLoading(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    return () => { cancelled = true; };
  }, [sort, page]);

  function handleSortChange(newSort: "newest" | "oldest") {
    if (newSort === sort) return;
    setSort(newSort);
    setPage(1);
  }

  function handlePageChange(newPage: number) {
    if (newPage === page || newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  }

  const handleDownload = useCallback(async (cap: GalleryCaption, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!cap.images?.url || downloadingId) return;
    setDownloadingId(cap.id);
    setDownloadError(null);
    try {
      const canvas = await buildMemeCanvas(cap.images.url, cap.content);
      const link = document.createElement("a");
      link.download = `meme-${cap.id}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Download failed";
      setDownloadError(msg);
      if (downloadErrorTimer.current) clearTimeout(downloadErrorTimer.current);
      downloadErrorTimer.current = setTimeout(() => setDownloadError(null), 4000);
    } finally {
      setDownloadingId(null);
    }
  }, [downloadingId]);

  const paginationRange = getPaginationRange(page, totalPages);

  return (
    <>
      <style>{`
        .gallery-card {
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid rgba(168,85,247,0.18);
          background: linear-gradient(160deg, #0e0620 0%, #050210 55%, #020a07 100%);
          box-shadow: 0 4px 20px rgba(0,0,0,0.7), inset 0 1px 0 rgba(168,85,247,0.07);
          transition: border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;
          display: flex;
          flex-direction: column;
        }
        .gallery-card:hover {
          border-color: rgba(168,85,247,0.5);
          box-shadow: 0 0 0 1px rgba(168,85,247,0.15), 0 12px 48px rgba(168,85,247,0.18), 0 12px 48px rgba(0,212,138,0.06), 0 30px 80px rgba(0,0,0,0.95);
          transform: translateY(-3px);
        }
        .gallery-card img {
          display: block;
          width: 100%;
          height: auto;
        }
        .gallery-dl-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,0.55);
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        .gallery-card:hover .gallery-dl-overlay {
          opacity: 1;
        }
        .gallery-dl-btn {
          background: rgba(14,6,32,0.95);
          border: 1px solid rgba(168,85,247,0.6);
          color: #A855F7;
          padding: 9px 18px;
          border-radius: 9px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          box-shadow: 0 0 18px rgba(168,85,247,0.35);
          transition: box-shadow 0.15s ease, background 0.15s ease;
        }
        .gallery-dl-btn:hover:not(:disabled) {
          background: rgba(14,6,32,1);
          box-shadow: 0 0 28px rgba(168,85,247,0.55), 0 0 14px rgba(0,212,138,0.2);
        }
        .gallery-dl-btn:disabled {
          cursor: default;
          opacity: 0.6;
        }
        .sort-btn {
          transition: background 0.15s ease, box-shadow 0.15s ease;
        }
        .sort-btn:hover {
          box-shadow: 0 0 16px rgba(168,85,247,0.35) !important;
        }
        .page-btn {
          transition: background 0.15s ease, box-shadow 0.15s ease;
        }
        .page-btn:hover:not(:disabled) {
          background: rgba(168,85,247,0.1) !important;
          box-shadow: 0 0 12px rgba(168,85,247,0.3) !important;
        }
        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        @media (max-width: 700px) {
          .gallery-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 420px) {
          .gallery-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Sort controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
        <span style={{ fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", color: "#A855F7", opacity: 0.5, fontWeight: 600 }}>
          Sort
        </span>
        {(["newest", "oldest"] as const).map(option => (
          <button
            key={option}
            className="sort-btn"
            onClick={() => handleSortChange(option)}
            style={{
              padding: "7px 16px",
              borderRadius: 8,
              border: `1px solid rgba(168,85,247,${sort === option ? "0.55" : "0.22"})`,
              background: sort === option ? "linear-gradient(145deg, #130d22 0%, #080412 100%)" : "transparent",
              color: sort === option ? "#A855F7" : "#A855F7",
              fontSize: 12,
              fontWeight: sort === option ? 700 : 500,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              cursor: "pointer",
              boxShadow: sort === option ? "0 0 14px rgba(168,85,247,0.25), inset 0 1px 0 rgba(168,85,247,0.1)" : "none",
              textShadow: sort === option ? "0 0 10px rgba(168,85,247,0.6)" : "none",
              opacity: sort === option ? 1 : 0.55,
            }}
          >
            {option === "newest" ? "↓ Newest" : "↑ Oldest"}
          </button>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 12, color: "#A855F7", opacity: 0.3, letterSpacing: "0.05em" }}>
          {totalCount} entries
        </span>
      </div>

      {/* Download error */}
      {downloadError && (
        <div style={{ marginBottom: 16, padding: "10px 16px", borderRadius: 8, border: "1px solid rgba(255,107,107,0.35)", background: "rgba(255,107,107,0.07)", color: "#ff6b6b", fontSize: 13 }}>
          {downloadError}
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: jade, opacity: 0.4, fontSize: 15, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Loading...
        </div>
      ) : captions.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: jade, opacity: 0.4, fontSize: 15, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          No captions yet
        </div>
      ) : (
        <div className="gallery-grid">
          {captions.filter(cap => cap.images?.url).map(cap => (
            <div key={cap.id} className="gallery-card">
              {/* Caption — always visible, above image */}
              <div style={{ padding: "14px 16px 12px 16px" }}>
                <p style={{
                  margin: 0,
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#ffffff",
                  lineHeight: 1.55,
                  letterSpacing: "0.01em",
                }}>
                  &ldquo;{cap.content}&rdquo;
                </p>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: "linear-gradient(90deg, rgba(0,212,138,0.3), rgba(168,85,247,0.3))", margin: "0 16px" }} />

              {/* Image + download overlay */}
              <div style={{ position: "relative", flex: 1 }}>
                <img src={cap.images!.url} alt="" />
                <div className="gallery-dl-overlay">
                  <button
                    className="gallery-dl-btn"
                    onClick={e => handleDownload(cap, e)}
                    disabled={!!downloadingId}
                  >
                    {downloadingId === cap.id ? "Saving..." : "⬇ Download Meme"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginTop: 48 }}>
          <button
            className="page-btn"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1 || isLoading}
            style={{
              width: 36, height: 36, borderRadius: 8,
              border: `1px solid rgba(168,85,247,${page === 1 ? "0.1" : "0.28"})`,
              background: "transparent", color: "#A855F7", fontSize: 16,
              cursor: page === 1 ? "default" : "pointer",
              opacity: page === 1 ? 0.3 : 1,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >‹</button>

          {paginationRange.map((item, i) =>
            item === "..." ? (
              <span key={`ellipsis-${i}`} style={{ color: "#A855F7", opacity: 0.3, fontSize: 13, padding: "0 4px" }}>...</span>
            ) : (
              <button
                key={item}
                className="page-btn"
                onClick={() => handlePageChange(item as number)}
                disabled={isLoading}
                style={{
                  width: 36, height: 36, borderRadius: 8,
                  border: `1px solid rgba(168,85,247,${page === item ? "0.55" : "0.2"})`,
                  background: page === item ? "linear-gradient(145deg, #130d22 0%, #080412 100%)" : "transparent",
                  color: "#A855F7", fontSize: 13, fontWeight: page === item ? 700 : 400,
                  cursor: "pointer",
                  boxShadow: page === item ? "0 0 14px rgba(168,85,247,0.25)" : "none",
                  textShadow: page === item ? "0 0 10px rgba(168,85,247,0.6)" : "none",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >{item}</button>
            )
          )}

          <button
            className="page-btn"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages || isLoading}
            style={{
              width: 36, height: 36, borderRadius: 8,
              border: `1px solid rgba(168,85,247,${page === totalPages ? "0.1" : "0.28"})`,
              background: "transparent", color: "#A855F7", fontSize: 16,
              cursor: page === totalPages ? "default" : "pointer",
              opacity: page === totalPages ? 0.3 : 1,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >›</button>
        </div>
      )}
    </>
  );
}
