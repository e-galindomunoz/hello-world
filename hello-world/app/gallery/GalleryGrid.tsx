"use client";

import { useState, useEffect, useRef } from "react";
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

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getPaginationRange(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
  if (current >= total - 3) return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
}

export default function GalleryGrid({ initialCaptions, initialTotalCount }: GalleryGridProps) {
  const [captions, setCaptions] = useState<GalleryCaption[]>(initialCaptions);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const isFirstRender = useRef(true);

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
      setCaptions(result.captions as GalleryCaption[]);
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

  const paginationRange = getPaginationRange(page, totalPages);

  return (
    <>
      <style>{`
        @keyframes cardFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-3px); }
        }
        .gallery-card {
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
        }
        .gallery-card:hover {
          transform: translateY(-6px) !important;
          box-shadow:
            0 0 0 1px rgba(0,212,138,0.25),
            0 12px 48px rgba(0,212,138,0.18),
            0 30px 80px rgba(0,0,0,0.95),
            inset 0 1px 0 rgba(0,212,138,0.2) !important;
          border-color: rgba(0,212,138,0.45) !important;
        }
        .gallery-card img {
          transition: transform 0.35s ease;
        }
        .gallery-card:hover img {
          transform: scale(1.03);
        }
        .sort-btn {
          transition: background 0.15s ease, box-shadow 0.15s ease, color 0.15s ease;
        }
        .sort-btn:hover {
          box-shadow: 0 0 16px rgba(0,212,138,0.3) !important;
        }
        .page-btn {
          transition: background 0.15s ease, box-shadow 0.15s ease;
        }
        .page-btn:hover:not(:disabled) {
          background: rgba(0,212,138,0.1) !important;
          box-shadow: 0 0 12px rgba(0,212,138,0.25) !important;
        }
      `}</style>

      {/* Sort controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
        <span style={{ fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", color: jade, opacity: 0.45, fontWeight: 600 }}>
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
              border: `1px solid rgba(0,212,138,${sort === option ? "0.5" : "0.2"})`,
              background: sort === option ? "linear-gradient(145deg, #0d1f17 0%, #081410 100%)" : "transparent",
              color: jade,
              fontSize: 12,
              fontWeight: sort === option ? 700 : 500,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              cursor: "pointer",
              boxShadow: sort === option ? "0 0 14px rgba(0,212,138,0.2), inset 0 1px 0 rgba(0,212,138,0.1)" : "none",
              textShadow: sort === option ? "0 0 10px rgba(0,212,138,0.5)" : "none",
            }}
          >
            {option === "newest" ? "↓ Newest" : "↑ Oldest"}
          </button>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 12, color: jade, opacity: 0.3, letterSpacing: "0.05em" }}>
          {totalCount} entries
        </span>
      </div>

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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
          {captions.map(cap => (
            <div
              key={cap.id}
              className="gallery-card"
              style={{
                background: "linear-gradient(160deg, #081410 0%, #040a08 60%, #020504 100%)",
                border: "1px solid rgba(0,212,138,0.2)",
                borderRadius: 16,
                overflow: "hidden",
                boxShadow: `
                  0 0 0 1px rgba(0,212,138,0.04),
                  0 4px 24px rgba(0,212,138,0.07),
                  0 16px 48px rgba(0,0,0,0.9),
                  inset 0 1px 0 rgba(0,212,138,0.09)
                `,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ overflow: "hidden", borderBottom: "1px solid rgba(0,212,138,0.1)", flexShrink: 0 }}>
                <img
                  src={cap.images!.url}
                  alt=""
                  style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" }}
                />
              </div>
              <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: jade, lineHeight: 1.5, textShadow: "0 0 16px rgba(0,212,138,0.35)", letterSpacing: "0.01em", flex: 1 }}>
                  &ldquo;{cap.content}&rdquo;
                </p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", paddingTop: 10, borderTop: "1px solid rgba(0,212,138,0.08)" }}>
                  <span style={{ fontSize: 11, color: jade, opacity: 0.3, letterSpacing: "0.07em", fontWeight: 500 }}>
                    {formatDate(cap.created_datetime_utc)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginTop: 48 }}>
          {/* Prev */}
          <button
            className="page-btn"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1 || isLoading}
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              border: `1px solid rgba(0,212,138,${page === 1 ? "0.1" : "0.25"})`,
              background: "transparent",
              color: jade,
              fontSize: 16,
              cursor: page === 1 ? "default" : "pointer",
              opacity: page === 1 ? 0.3 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ‹
          </button>

          {paginationRange.map((item, i) =>
            item === "..." ? (
              <span key={`ellipsis-${i}`} style={{ color: jade, opacity: 0.3, fontSize: 13, padding: "0 4px" }}>
                ...
              </span>
            ) : (
              <button
                key={item}
                className="page-btn"
                onClick={() => handlePageChange(item as number)}
                disabled={isLoading}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  border: `1px solid rgba(0,212,138,${page === item ? "0.5" : "0.2"})`,
                  background: page === item ? "linear-gradient(145deg, #0d1f17 0%, #081410 100%)" : "transparent",
                  color: jade,
                  fontSize: 13,
                  fontWeight: page === item ? 700 : 400,
                  cursor: "pointer",
                  boxShadow: page === item ? "0 0 14px rgba(0,212,138,0.2)" : "none",
                  textShadow: page === item ? "0 0 10px rgba(0,212,138,0.5)" : "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {item}
              </button>
            )
          )}

          {/* Next */}
          <button
            className="page-btn"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages || isLoading}
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              border: `1px solid rgba(0,212,138,${page === totalPages ? "0.1" : "0.25"})`,
              background: "transparent",
              color: jade,
              fontSize: 16,
              cursor: page === totalPages ? "default" : "pointer",
              opacity: page === totalPages ? 0.3 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ›
          </button>
        </div>
      )}
    </>
  );
}
