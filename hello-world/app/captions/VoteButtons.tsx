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
  const [hovered, setHovered] = useState<number | null>(null);

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

  const getButtonStyle = (value: number) => {
    const isActive = userVote === value;
    const isHovered = hovered === value;
    
    let backgroundColor = "#333";
    if (value === 1) {
      if (isActive) backgroundColor = "#4CAF50";
      else if (isHovered) backgroundColor = "#66bb6a";
    } else {
      if (isActive) backgroundColor = "#f44336";
      else if (isHovered) backgroundColor = "#ef5350";
    }

    return {
      background: backgroundColor,
      color: "white",
      border: "none",
      padding: "8px 16px",
      borderRadius: "6px",
      cursor: isVoting ? "not-allowed" : "pointer",
      opacity: isVoting ? 0.7 : 1,
      transition: "background-color 0.2s ease",
      fontWeight: "bold" as const,
    };
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <button
        onClick={() => handleVote(1)}
        onMouseEnter={() => setHovered(1)}
        onMouseLeave={() => setHovered(null)}
        disabled={isVoting}
        style={getButtonStyle(1)}
      >
        ▲ Upvote
      </button>
      <span style={{ fontWeight: "bold", minWidth: "20px", textAlign: "center" }}>
        {initialLikeCount}
      </span>
      <button
        onClick={() => handleVote(-1)}
        onMouseEnter={() => setHovered(-1)}
        onMouseLeave={() => setHovered(null)}
        disabled={isVoting}
        style={getButtonStyle(-1)}
      >
        ▼ Downvote
      </button>
      {error && <span style={{ color: "#ff4d4d", fontSize: "12px" }}>{error}</span>}
    </div>
  );
}
