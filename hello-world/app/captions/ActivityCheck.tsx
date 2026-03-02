"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface Props {
  activityKey: number;
}

type TriggerType = "speed" | "milestone" | "inactivity";

interface MathChallenge {
  type: "math";
  question: string;
  options: number[];
  answer: number;
}

interface ColorChallenge {
  type: "color";
  color: string;
  hex: string;
  options: string[];
}

type Challenge = MathChallenge | ColorChallenge;

const SPEED_PROMPTS = [
  "Slow down!",
  "Woah, easy there!",
  "Speed voter detected 👀",
  "Are you even reading these?",
];

const MILESTONE_PROMPTS = [
  "Checkpoint!",
  "30 captions deep!",
  "You've been busy!",
  "Taking a breather?",
];

const INACTIVITY_PROMPTS = [
  "Still there?",
  "Zoning out?",
  "Hello? 👋",
  "Wakey wakey!",
];

const COLORS = [
  { color: "Red", hex: "#e74c3c" },
  { color: "Blue", hex: "#3498db" },
  { color: "Green", hex: "#2ecc71" },
  { color: "Pink", hex: "#e91e8c" },
  { color: "Orange", hex: "#e67e22" },
  { color: "Purple", hex: "#9b59b6" },
  { color: "Yellow", hex: "#f1c40f" },
  { color: "Teal", hex: "#1abc9c" },
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeMathChallenge(): MathChallenge {
  const a = randInt(1, 12);
  const b = randInt(1, 12);
  const answer = a + b;
  const wrongs = new Set<number>();
  while (wrongs.size < 3) {
    const w = answer + randInt(-5, 5);
    if (w !== answer && w > 0) wrongs.add(w);
  }
  const options = [answer, ...wrongs].sort(() => Math.random() - 0.5);
  return { type: "math", question: `${a} + ${b} = ?`, options, answer };
}

function makeColorChallenge(): ColorChallenge {
  const correct = pickRandom(COLORS);
  const others = COLORS.filter((c) => c.color !== correct.color);
  const distractors = others.sort(() => Math.random() - 0.5).slice(0, 3);
  const options = [correct.color, ...distractors.map((d) => d.color)].sort(
    () => Math.random() - 0.5
  );
  return { type: "color", color: correct.color, hex: correct.hex, options };
}

function makeChallenge(): Challenge {
  return Math.random() < 0.5 ? makeMathChallenge() : makeColorChallenge();
}

const INACTIVITY_MS = 45_000;
const SPEED_WINDOW_MS = 10_000;
const SPEED_THRESHOLD = 5;

const keyframes = `
@keyframes acFadeIn {
  from { opacity: 0; transform: scale(0.92) translateY(12px); }
  to   { opacity: 1; transform: scale(1)    translateY(0);    }
}
@keyframes acShake {
  0%,100% { transform: translateX(0); }
  20%     { transform: translateX(-10px); }
  40%     { transform: translateX(10px); }
  60%     { transform: translateX(-7px); }
  80%     { transform: translateX(7px); }
}
@keyframes acPulse {
  0%,100% { box-shadow: 0 0 0 2px rgba(0,212,138,0.4), 0 0 30px rgba(0,212,138,0.15), 0 20px 60px rgba(0,0,0,0.9); }
  50%     { box-shadow: 0 0 0 3px rgba(0,212,138,0.7), 0 0 50px rgba(0,212,138,0.35), 0 20px 60px rgba(0,0,0,0.9); }
}
.ac-option {
  background: rgba(0,212,138,0.06);
  border: 1px solid rgba(0,212,138,0.25);
  color: #e0fff3;
  border-radius: 10px;
  padding: 14px 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s, border-color 0.18s, transform 0.18s, box-shadow 0.18s;
  letter-spacing: 0.03em;
  text-align: center;
}
.ac-option:hover {
  background: rgba(0,212,138,0.14);
  border-color: rgba(0,212,138,0.6);
  transform: translateY(-2px);
  box-shadow: 0 0 18px rgba(0,212,138,0.3);
}
`;

export default function ActivityCheck({ activityKey }: Props) {
  const [visible, setVisible] = useState(false);
  const [challenge, setChallenge] = useState<Challenge>(makeMathChallenge);
  const [prompt, setPrompt] = useState("");
  const [wrong, setWrong] = useState(false);
  const [shake, setShake] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const voteTimestampsRef = useRef<number[]>([]);
  const voteCountRef = useRef(0);
  const nextMilestoneRef = useRef(randInt(30, 40));
  const prevKeyRef = useRef<number | null>(null);

  const show = useCallback((trigger: TriggerType) => {
    clearTimeout(timerRef.current!);
    let promptText: string;
    if (trigger === "speed") promptText = pickRandom(SPEED_PROMPTS);
    else if (trigger === "milestone") promptText = pickRandom(MILESTONE_PROMPTS);
    else promptText = pickRandom(INACTIVITY_PROMPTS);
    setChallenge(makeChallenge());
    setPrompt(promptText);
    setWrong(false);
    setShake(false);
    setVisible(true);
  }, []);

  const resetInactivityTimer = useCallback(() => {
    clearTimeout(timerRef.current!);
    timerRef.current = setTimeout(() => show("inactivity"), INACTIVITY_MS);
  }, [show]);

  // Start inactivity timer on mount
  useEffect(() => {
    resetInactivityTimer();
    return () => clearTimeout(timerRef.current!);
  }, [resetInactivityTimer]);

  // React to each vote
  useEffect(() => {
    if (prevKeyRef.current === null) {
      prevKeyRef.current = activityKey;
      return;
    }
    if (activityKey === prevKeyRef.current) return;
    prevKeyRef.current = activityKey;

    const now = Date.now();

    // Record timestamp
    voteTimestampsRef.current.push(now);

    // Prune timestamps older than window
    voteTimestampsRef.current = voteTimestampsRef.current.filter(
      (t) => now - t <= SPEED_WINDOW_MS
    );

    // Speed check
    if (voteTimestampsRef.current.length >= SPEED_THRESHOLD) {
      voteTimestampsRef.current = [];
      show("speed");
      return;
    }

    // Milestone check
    voteCountRef.current += 1;
    if (voteCountRef.current >= nextMilestoneRef.current) {
      voteCountRef.current = 0;
      nextMilestoneRef.current = randInt(30, 40);
      show("milestone");
      return;
    }

    // Normal: reset inactivity timer
    resetInactivityTimer();
  }, [activityKey, show, resetInactivityTimer]);

  const handleAnswer = (answer: string | number) => {
    const correct =
      challenge.type === "math"
        ? answer === challenge.answer
        : answer === challenge.color;

    if (correct) {
      setVisible(false);
      resetInactivityTimer();
    } else {
      setWrong(true);
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
  };

  if (!visible) return null;

  return (
    <>
      <style>{keyframes}</style>
      {/* Backdrop */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          background: "rgba(0,0,0,0.7)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        {/* Card */}
        <div
          style={{
            background: "linear-gradient(145deg, #081410 0%, #020a07 55%, #000 100%)",
            borderRadius: "20px",
            padding: "32px 28px 28px",
            maxWidth: "360px",
            width: "100%",
            animation: shake
              ? "acShake 0.5s ease"
              : "acFadeIn 0.3s ease, acPulse 2.5s ease-in-out infinite",
            willChange: "transform",
          }}
        >
          {/* Small label */}
          <p
            style={{
              margin: "0 0 8px",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "rgba(0,212,138,0.5)",
            }}
          >
            Quick Check
          </p>

          {/* Headline */}
          <h2
            style={{
              margin: "0 0 24px",
              fontSize: "22px",
              fontWeight: 700,
              color: "#00d48a",
              textShadow: "0 0 20px rgba(0,212,138,0.55), 0 0 40px rgba(0,212,138,0.2)",
              lineHeight: 1.3,
            }}
          >
            {prompt}
          </h2>

          {/* Challenge visual */}
          {challenge.type === "color" ? (
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 12,
                background: challenge.hex,
                margin: "0 auto 24px",
                boxShadow: `0 0 24px ${challenge.hex}66`,
              }}
            />
          ) : (
            <p
              style={{
                margin: "0 0 24px",
                textAlign: "center",
                fontSize: "28px",
                fontWeight: 700,
                color: "#e0fff3",
                letterSpacing: "0.04em",
              }}
            >
              {challenge.question}
            </p>
          )}

          {/* Options grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
            }}
          >
            {challenge.type === "math"
              ? challenge.options.map((opt) => (
                  <button
                    key={opt}
                    className="ac-option"
                    onClick={() => handleAnswer(opt)}
                  >
                    {opt}
                  </button>
                ))
              : challenge.options.map((opt) => (
                  <button
                    key={opt}
                    className="ac-option"
                    onClick={() => handleAnswer(opt)}
                  >
                    {opt}
                  </button>
                ))}
          </div>

          {/* Wrong answer message */}
          {wrong && (
            <p
              style={{
                margin: "16px 0 0",
                textAlign: "center",
                fontSize: "13px",
                fontWeight: 600,
                color: "#ff6b6b",
                letterSpacing: "0.04em",
              }}
            >
              Nope — try again!
            </p>
          )}
        </div>
      </div>
    </>
  );
}
