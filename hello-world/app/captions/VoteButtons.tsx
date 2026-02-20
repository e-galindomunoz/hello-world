"use client";

import { useState } from "react";
import { submitVote } from "./actions";

interface VoteButtonsProps {
  captionId: string;
  initialLikeCount: number;
  userVote?: number;
  upvotes?: number;
  downvotes?: number;
}

export default function VoteButtons({
  captionId,
  initialLikeCount,
  userVote,
  upvotes = 0,
  downvotes = 0,
}: VoteButtonsProps) {
  const jade = "#00A86B";
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
    
    let backgroundColor = "transparent";
    if (isActive) backgroundColor = jade;
    else if (isHovered) backgroundColor = "#00C97A";

    return {
      background: backgroundColor,
      color: isActive || isHovered ? "#000" : jade,
      border: `1px solid ${jade}`,
      padding: "10px 20px",
      borderRadius: "8px",
      cursor: isVoting ? "not-allowed" : "pointer",
      opacity: isVoting ? 0.7 : 1,
      transition: "all 0.2s ease",
      fontWeight: "bold" as const,
      flex: 1,
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      gap: "4px"
    };
  };

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px", justifyContent: "center" }}>
        <button
          onClick={() => handleVote(1)}
          onMouseEnter={() => setHovered(1)}
          onMouseLeave={() => setHovered(null)}
          disabled={isVoting}
          style={getButtonStyle(1)}
        >
          <span style={{ fontSize: "18px" }}>▲</span>
          <span style={{ fontSize: "14px" }}>{upvotes}</span>
        </button>

        <button
          onClick={() => handleVote(-1)}
          onMouseEnter={() => setHovered(-1)}
          onMouseLeave={() => setHovered(null)}
          disabled={isVoting}
          style={getButtonStyle(-1)}
        >
          <span style={{ fontSize: "18px" }}>▼</span>
          <span style={{ fontSize: "14px" }}>{downvotes}</span>
        </button>
      </div>
      {error && (
        <div style={{ color: jade, fontSize: "12px", marginTop: "8px", textAlign: "center" }}>
          {error}
        </div>
      )}
    </div>
  );
}
