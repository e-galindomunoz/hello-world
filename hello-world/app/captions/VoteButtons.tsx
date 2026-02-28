"use client";

import { useEffect, useState } from "react";
import { submitVote } from "./actions";

interface VoteButtonsProps {
  captionId: string;
  userVote?: number;
  upvotes?: number;
  downvotes?: number;
  onVoteSaved?: () => void;
}

export default function VoteButtons({
  captionId,
  userVote,
  upvotes = 0,
  downvotes = 0,
  onVoteSaved,
}: VoteButtonsProps) {
  const jade = "#00D48A";
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [currentVote, setCurrentVote] = useState<number | undefined>(userVote);
  const [currentUpvotes, setCurrentUpvotes] = useState(upvotes);
  const [currentDownvotes, setCurrentDownvotes] = useState(downvotes);

  useEffect(() => {
    setCurrentVote(userVote);
    setCurrentUpvotes(upvotes);
    setCurrentDownvotes(downvotes);
  }, [userVote, upvotes, downvotes, captionId]);

  const handleVote = async (value: number) => {
    const previousVote = currentVote;
    let nextUpvotes = currentUpvotes;
    let nextDownvotes = currentDownvotes;

    if (previousVote === 1) nextUpvotes -= 1;
    if (previousVote === -1) nextDownvotes -= 1;
    if (value === 1) nextUpvotes += 1;
    if (value === -1) nextDownvotes += 1;

    setCurrentVote(value);
    setCurrentUpvotes(nextUpvotes);
    setCurrentDownvotes(nextDownvotes);
    setIsVoting(true);
    setError(null);

    try {
      const result = await submitVote(captionId, value);
      if (result?.error) {
        setCurrentVote(previousVote);
        setCurrentUpvotes(currentUpvotes);
        setCurrentDownvotes(currentDownvotes);
        setError(result.error);
      } else {
        onVoteSaved?.();
      }
    } catch (err: unknown) {
      setCurrentVote(previousVote);
      setCurrentUpvotes(currentUpvotes);
      setCurrentDownvotes(currentDownvotes);
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsVoting(false);
    }
  };

  const getButtonStyle = (value: number) => {
    const isActive = currentVote === value;
    const isHovered = hovered === value && !isVoting;

    const base = {
      padding: "14px 28px",
      borderRadius: "12px",
      cursor: isVoting ? "not-allowed" : "pointer",
      opacity: isVoting ? 0.55 : 1,
      transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
      fontWeight: 700 as const,
      flex: 1,
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      gap: "6px",
      fontSize: "13px",
      letterSpacing: "0.04em",
    };

    if (isActive) {
      return {
        ...base,
        background: "linear-gradient(145deg, #00D48A 0%, #00a86d 100%)",
        color: "#000",
        border: "1px solid #00D48A",
        boxShadow: `
          0 0 24px rgba(0, 212, 138, 0.55),
          0 0 48px rgba(0, 212, 138, 0.18),
          inset 0 1px 0 rgba(255, 255, 255, 0.25),
          inset 0 -2px 0 rgba(0, 0, 0, 0.2)
        `,
        transform: "translateY(1px)",
      };
    }

    if (isHovered) {
      return {
        ...base,
        background: "linear-gradient(145deg, #0d2a1d 0%, #081a10 100%)",
        color: jade,
        border: "1px solid rgba(0, 212, 138, 0.65)",
        boxShadow: `
          0 0 22px rgba(0, 212, 138, 0.32),
          0 8px 24px rgba(0, 0, 0, 0.6),
          inset 0 1px 0 rgba(0, 212, 138, 0.2)
        `,
        transform: "translateY(-2px)",
      };
    }

    return {
      ...base,
      background: "linear-gradient(145deg, #0d1f17 0%, #060e0a 100%)",
      color: jade,
      border: "1px solid rgba(0, 212, 138, 0.28)",
      boxShadow: `
        0 4px 14px rgba(0, 0, 0, 0.55),
        inset 0 1px 0 rgba(0, 212, 138, 0.08),
        inset 0 -1px 0 rgba(0, 0, 0, 0.3)
      `,
      transform: "translateY(0px)",
    };
  };

  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          justifyContent: "center",
        }}
      >
        <button
          onClick={() => handleVote(1)}
          onMouseEnter={() => setHovered(1)}
          onMouseLeave={() => setHovered(null)}
          disabled={isVoting}
          style={getButtonStyle(1)}
        >
          <span style={{ fontSize: "22px", lineHeight: 1 }}>▲</span>
          <span>{currentUpvotes}</span>
        </button>

        <button
          onClick={() => handleVote(-1)}
          onMouseEnter={() => setHovered(-1)}
          onMouseLeave={() => setHovered(null)}
          disabled={isVoting}
          style={getButtonStyle(-1)}
        >
          <span style={{ fontSize: "22px", lineHeight: 1 }}>▼</span>
          <span>{currentDownvotes}</span>
        </button>
      </div>

      {isVoting && (
        <div
          style={{
            color: "#00D48A",
            fontSize: "12px",
            marginTop: "10px",
            textAlign: "center",
            opacity: 0.7,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Saving...
        </div>
      )}

      {error && (
        <div
          style={{
            color: "#ff6b6b",
            fontSize: "12px",
            marginTop: "10px",
            textAlign: "center",
            opacity: 0.85,
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
