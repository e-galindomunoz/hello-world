"use client";

import { useState } from "react";
import { submitVote } from "./actions";

interface VoteButtonsProps {
  captionId: string;
  initialLikeCount: number;
  userVote?: number;
}

export default function VoteButtons({
  captionId,
  initialLikeCount,
  userVote,
}: VoteButtonsProps) {
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVote = async (value: number) => {
    setIsVoting(true);
    setError(null);
    try {
      const result = await submitVote(captionId, value);
      if (result?.error) {
        setError(result.error);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <button
        onClick={() => handleVote(1)}
        disabled={isVoting}
        style={{
          background: userVote === 1 ? "#4CAF50" : "#333",
          color: "white",
          border: "none",
          padding: "4px 12px",
          borderRadius: "4px",
          cursor: isVoting ? "not-allowed" : "pointer",
          opacity: isVoting ? 0.7 : 1,
        }}
      >
        ▲ Upvote
      </button>
      <span style={{ fontWeight: "bold" }}>{initialLikeCount}</span>
      <button
        onClick={() => handleVote(-1)}
        disabled={isVoting}
        style={{
          background: userVote === -1 ? "#f44336" : "#333",
          color: "white",
          border: "none",
          padding: "4px 12px",
          borderRadius: "4px",
          cursor: isVoting ? "not-allowed" : "pointer",
          opacity: isVoting ? 0.7 : 1,
        }}
      >
        ▼ Downvote
      </button>
      {error && <span style={{ color: "#ff4d4d", fontSize: "12px" }}>{error}</span>}
    </div>
  );
}
