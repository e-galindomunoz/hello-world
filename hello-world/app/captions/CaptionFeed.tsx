"use client";

import { useState, useEffect, useCallback } from "react";
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

export default function CaptionFeed({ initialCaptions, jade, user }: CaptionFeedProps) {
  const [queue, setQueue] = useState<Caption[]>(initialCaptions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

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
    if (currentIndex < queue.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      fetchMore();
    }
  };

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
        background: "linear-gradient(145deg, #081410 0%, #020a07 55%, #000 100%)",
        borderRadius: "16px",
        border: "1px solid rgba(0, 212, 138, 0.3)",
        boxShadow: `
          0 0 0 1px rgba(0, 212, 138, 0.06),
          0 4px 24px rgba(0, 212, 138, 0.1),
          0 20px 60px rgba(0, 0, 0, 0.9),
          inset 0 1px 0 rgba(0, 212, 138, 0.12),
          inset 0 -1px 0 rgba(0, 0, 0, 0.4)
        `,
        transition: "all 0.3s ease",
      }}
    >
      {currentCaption.images?.url && (
        <img
          src={currentCaption.images.url}
          alt="Caption Image"
          style={{
            width: "100%",
            borderRadius: "12px",
            marginBottom: "16px",
            display: "block",
            maxHeight: "38vh",
            objectFit: "cover",
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
            "0 0 20px rgba(0, 212, 138, 0.5), 0 0 40px rgba(0, 212, 138, 0.2)",
          lineHeight: 1.45,
          letterSpacing: "0.01em",
        }}
      >
        &quot;{currentCaption.content}&quot;
      </p>

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
          color: "rgba(0, 212, 138, 0.35)",
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
