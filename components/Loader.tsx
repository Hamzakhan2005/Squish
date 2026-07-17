"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion } from "framer-motion";

type Phase = "loading" | "countdown" | "reveal" | "done";

const COUNTDOWN_NUMBERS = [3, 2, 1];

/** The concentric-circle, crosshair "film leader" graphic behind each number. */
function CountdownFrame({ n }: { n: number }) {
  return (
    <svg viewBox="0 0 200 200" className="w-40 h-40 sm:w-56 sm:h-56">
      <line
        x1="100"
        y1="0"
        x2="100"
        y2="200"
        stroke="#00000055"
        strokeWidth="1.5"
      />
      <line
        x1="0"
        y1="100"
        x2="200"
        y2="100"
        stroke="#00000055"
        strokeWidth="1.5"
      />
      <circle
        cx="100"
        cy="100"
        r="88"
        fill="none"
        stroke="#F2EFE9"
        strokeWidth="2"
        opacity="0.9"
      />
      <circle
        cx="100"
        cy="100"
        r="72"
        fill="none"
        stroke="#F2EFE9"
        strokeWidth="2"
        opacity="0.6"
      />
      <text
        x="100"
        y="128"
        textAnchor="middle"
        fontSize="90"
        fontFamily="var(--font-anton)"
        fill="#F2EFE9"
      >
        {n}
      </text>
    </svg>
  );
}

export default function Loader() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [numberIndex, setNumberIndex] = useState(0);
  const [flickerOn, setFlickerOn] = useState(false);
  const wipeRef = useRef<HTMLDivElement>(null);

  // Phase timeline: LOADING -> 3 -> 2 -> 1 -> brand reveal -> fade out.
  // Plays in full every time this component mounts (i.e. every full page
  // load / reload of the site) — it does NOT persist across client-side
  // navigation because Next only remounts the root layout on a hard load.
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const t = (fn: () => void, delay: number) =>
      timers.push(setTimeout(fn, delay));

    const LOADING_MS = 1100;
    const NUMBER_MS = 950;
    const REVEAL_HOLD_MS = 1300;

    t(() => setPhase("countdown"), LOADING_MS);
    COUNTDOWN_NUMBERS.forEach((_, i) => {
      t(() => setNumberIndex(i), LOADING_MS + i * NUMBER_MS);
    });
    t(
      () => setPhase("reveal"),
      LOADING_MS + COUNTDOWN_NUMBERS.length * NUMBER_MS
    );
    t(
      () => setPhase("done"),
      LOADING_MS + COUNTDOWN_NUMBERS.length * NUMBER_MS + REVEAL_HOLD_MS
    );

    return () => timers.forEach(clearTimeout);
  }, []);

  // Re-run the black -> red clock wipe every time the number changes.
  useEffect(() => {
    if (phase !== "countdown" || !wipeRef.current) return;
    const el = wipeRef.current;
    el.style.background = `conic-gradient(from 0deg, var(--squish) 0%, var(--ink) 0%)`;
    const controls = animate(0, 100, {
      duration: 0.85,
      ease: "linear",
      onUpdate: (v) => {
        el.style.background = `conic-gradient(from 0deg, var(--squish) ${v}%, var(--ink) 0%)`;
      },
    });

    // The corner marks (M / 35) flicker in and out once per number, like a
    // scratch or exposure flash on old countdown leader film.
    setFlickerOn(false);
    const flickerDelay = 200 + Math.random() * 500;
    const flickerTimer = setTimeout(() => {
      setFlickerOn(true);
      setTimeout(() => setFlickerOn(false), 220);
    }, flickerDelay);

    return () => {
      controls.stop();
      clearTimeout(flickerTimer);
    };
  }, [phase, numberIndex]);

  if (phase === "done") return null;

  return (
    <AnimatePresence>
      <motion.div
        key="loader"
        className="fixed inset-0 z-[999] flex items-center justify-center overflow-hidden bg-ink"
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        {phase === "loading" && (
          <motion.h1
            className="font-display text-[16vw] sm:text-8xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0.6, 1] }}
            transition={{ duration: 1.0, times: [0, 0.3, 0.6, 0.8, 1] }}
            style={{
              color: "var(--squish)",
              WebkitTextStroke: "1px #000",
            }}
          >
            LOADING
          </motion.h1>
        )}

        {phase === "countdown" && (
          <>
            <div ref={wipeRef} className="absolute inset-0" />

            {/* Corner marks, like the "M" / film-stock numbers on a real
                leader — normally invisible, flickering into view briefly
                once per number, like a flash on old countdown film. */}
            <motion.span
              className="absolute top-10 left-10 sm:top-16 sm:left-16 font-display text-7xl sm:text-7xl text-paper mix-blend-difference"
              animate={{ opacity: flickerOn ? 1 : 0 }}
              transition={{ duration: 0.22 }}
            >
              M
            </motion.span>
            <motion.span
              className="absolute top-10 right-10 sm:top-16 sm:right-16 font-display text-7xl sm:text-7xl text-paper mix-blend-difference"
              animate={{ opacity: flickerOn ? 1 : 0 }}
              transition={{ duration: 0.22 }}
            >
              M
            </motion.span>
            <motion.span
              className="absolute bottom-10 left-10 sm:bottom-16 sm:left-16 font-display text-7xl sm:text-7xl text-paper-dim mix-blend-difference"
              animate={{ opacity: flickerOn ? 1 : 0 }}
              transition={{ duration: 0.22 }}
            >
              35
            </motion.span>
            <motion.span
              className="absolute bottom-10 right-10 sm:bottom-16 sm:right-16 font-display text-7xl sm:text-7xl text-paper-dim mix-blend-difference"
              animate={{ opacity: flickerOn ? 1 : 0 }}
              transition={{ duration: 0.22 }}
            >
              35
            </motion.span>

            <div className="relative mix-blend-difference">
              <CountdownFrame n={COUNTDOWN_NUMBERS[numberIndex]} />
            </div>
          </>
        )}

        {phase === "reveal" && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            style={{ background: "var(--squish)" }}
          >
            <motion.h1
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="font-display text-[18vw] sm:text-8xl text-ink"
            >
              SQUISH
            </motion.h1>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
