"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import VoteButtons from "./VoteButtons";
import { getRandomCaptions } from "./actions";
import { User } from "@supabase/supabase-js";
import ActivityCheck from "./ActivityCheck";

interface Caption {
  id: string;
  content: string;
  images?: { url: string } | null;
  upvotes: number;
  downvotes: number;
  userVote?: number;
}

interface CaptionFeedProps {
  initialCaptions: Caption[];
  jade: string;
  user: User | null;
}

async function buildMemeCanvas(imageUrl: string, captionText: string): Promise<HTMLCanvasElement> {
  const proxied = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("load failed"));
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

export default function CaptionFeed({ initialCaptions, jade, user }: CaptionFeedProps) {
  const [queue, setQueue] = useState<Caption[]>(initialCaptions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [memeLoading, setMemeLoading] = useState(false);
  const [memeError, setMemeError] = useState<string | null>(null);
  const memeErrorTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentCaption = queue[currentIndex];

  const fetchMore = useCallback(async () => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const more = await getRandomCaptions(5);
      const filtered = more.filter(m => !queue.find(q => q.id === m.id));
      setQueue(prev => [...prev, ...filtered]);
    } catch (err) {
      console.error("Failed to fetch more captions", err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, queue]);

  useEffect(() => {
    if (queue.length - currentIndex < 3) {
      fetchMore();
    }
  }, [currentIndex, queue.length, fetchMore]);

  const handleVoteSaved = () => {
    setMemeError(null);
    if (currentIndex < queue.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      fetchMore();
    }
  };

  const downloadMeme = useCallback(async () => {
    if (!currentCaption?.images?.url || !currentCaption.content) return;
    setMemeLoading(true);
    setMemeError(null);

    try {
      const canvas = await buildMemeCanvas(currentCaption.images.url, currentCaption.content);
      const link = document.createElement("a");
      link.download = `meme-${currentCaption.id}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      const msg = "Could not create meme card — try right-clicking the image to save it.";
      setMemeError(msg);
      if (memeErrorTimer.current) clearTimeout(memeErrorTimer.current);
      memeErrorTimer.current = setTimeout(() => setMemeError(null), 5000);
    } finally {
      setMemeLoading(false);
    }
  }, [currentCaption]);

  useEffect(() => {
    return () => {
      if (memeErrorTimer.current) clearTimeout(memeErrorTimer.current);
    };
  }, []);

  if (!currentCaption) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <p
          style={{
            fontSize: "18px",
            color: jade,
            opacity: 0.6,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          Finding more captions...
        </p>
      </div>
    );
  }

  return (
    <>
    <ActivityCheck activityKey={currentIndex} />
    <div
      style={{
        padding: "20px",
        background: "linear-gradient(145deg, #0e0620 0%, #081410 40%, #020a07 75%, #000 100%)",
        borderRadius: "16px",
        border: "1px solid rgba(168, 85, 247, 0.25)",
        boxShadow: `
          0 0 0 1px rgba(168, 85, 247, 0.05),
          0 4px 24px rgba(168, 85, 247, 0.1),
          0 4px 24px rgba(0, 212, 138, 0.06),
          0 20px 60px rgba(0, 0, 0, 0.9),
          inset 0 1px 0 rgba(168, 85, 247, 0.1),
          inset 0 -1px 0 rgba(0, 0, 0, 0.4)
        `,
        transition: "all 0.3s ease",
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {currentCaption.images?.url && (
        <img
          src={currentCaption.images.url}
          alt="Caption Image"
          style={{
            width: "100%",
            flex: 1,
            minHeight: 0,
            objectFit: "contain",
            borderRadius: "12px",
            marginBottom: "16px",
            display: "block",
            boxShadow: `
              0 0 0 1px rgba(0, 212, 138, 0.18),
              0 8px 32px rgba(0, 0, 0, 0.8),
              0 0 50px rgba(0, 212, 138, 0.07)
            `,
          }}
        />
      )}

      <p
        style={{
          margin: "0 0 14px 0",
          fontSize: "21px",
          fontWeight: 600,
          textAlign: "center",
          color: jade,
          textShadow:
            "0 0 20px rgba(0, 212, 138, 0.5), 0 0 30px rgba(168, 85, 247, 0.2)",
          lineHeight: 1.45,
          letterSpacing: "0.01em",
        }}
      >
        &quot;{currentCaption.content}&quot;
      </p>

      {/* Save meme button */}
      {currentCaption.images?.url && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, marginBottom: 14 }}>
          <button
            onClick={downloadMeme}
            disabled={memeLoading}
            style={{
              background: "transparent",
              border: `1px solid rgba(245,158,11,${memeLoading ? "0.15" : "0.4"})`,
              color: "#F59E0B",
              padding: "7px 18px",
              borderRadius: 8,
              cursor: memeLoading ? "default" : "pointer",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              opacity: memeLoading ? 0.5 : 0.75,
              transition: "opacity 0.2s, border-color 0.2s",
            }}
            onMouseEnter={e => { if (!memeLoading) (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
            onMouseLeave={e => { if (!memeLoading) (e.currentTarget as HTMLButtonElement).style.opacity = "0.75"; }}
          >
            {memeLoading ? "Creating..." : "⬇ Save as Meme"}
          </button>
          {memeError && (
            <p style={{ margin: 0, fontSize: 11, color: "#ff6b6b", textAlign: "center", opacity: 0.85 }}>
              {memeError}
            </p>
          )}
        </div>
      )}

      {user && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <VoteButtons
            key={currentCaption.id}
            captionId={currentCaption.id}
            userVote={currentCaption.userVote}
            upvotes={currentCaption.upvotes}
            downvotes={currentCaption.downvotes}
            onVoteSaved={handleVoteSaved}
          />
        </div>
      )}

      <div
        style={{
          marginTop: 16,
          textAlign: "center",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "rgba(168, 85, 247, 0.4)",
        }}
      >
        {queue.length - currentIndex} in queue
      </div>

      {/* Preload next image */}
      {queue[currentIndex + 1]?.images?.url && (
        <link rel="preload" as="image" href={queue[currentIndex + 1].images!.url} />
      )}
    </div>
    </>
  );
}
