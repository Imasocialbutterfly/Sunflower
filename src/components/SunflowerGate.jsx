import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";

const NO_MESSAGES = [
  "Nice try 😏",
  "That's not how this works 😌",
  "Babe, you're literally my Sunflower ❤️",
  "One more no and I'll cry 🥺",
  "Last chance... 🌻",
  "You're really committed to this huh? 😂",
  "It's rigged. Just tap yes 🌻",
];

const fireSunflowerConfetti = () => {
  const defaults = {
    spread: 90,
    ticks: 220,
    gravity: 0.9,
    decay: 0.94,
    startVelocity: 38,
    colors: ["#FFD700", "#FFC300", "#FFA500", "#FF8C00", "#FFF3B0"],
  };
  confetti({ ...defaults, particleCount: 80, origin: { x: 0.3, y: 0.7 } });
  confetti({ ...defaults, particleCount: 80, origin: { x: 0.7, y: 0.7 } });
  setTimeout(() => {
    confetti({
      ...defaults,
      particleCount: 140,
      spread: 130,
      origin: { y: 0.6 },
    });
  }, 220);
};

export default function SunflowerGate({ onStart }) {
  const [attempts, setAttempts] = useState(0);
  const [noPos, setNoPos] = useState({ left: "62%", top: "58%" });

  const petals = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 8,
        duration: 9 + Math.random() * 8,
        size: 16 + Math.random() * 22,
      })),
    [],
  );

  const message =
    attempts === 0
      ? "Are you my Sunflower? 🌻"
      : NO_MESSAGES[Math.min(attempts - 1, NO_MESSAGES.length - 1)];

  const yesScale = Math.min(1 + attempts * 0.09, 1.55);

  const handleYes = () => {
    fireSunflowerConfetti();
    onStart();
  };

  const handleNo = () => {
    setAttempts((a) => a + 1);
    // pick a random spot that isn't dead-center where the sunflower is
    let left, top;
    let tries = 0;
    do {
      left = 8 + Math.random() * 76; // 8% .. 84%
      top = 12 + Math.random() * 70; // 12% .. 82%
      tries++;
    } while (Math.abs(left - 50) < 18 && Math.abs(top - 50) < 18 && tries < 20);
    setNoPos({ left: `${left}%`, top: `${top}%` });
  };

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-linear-to-b from-[#1a1206] via-[#2b1d08] to-black px-6 text-center">
      {petals.map((p) => (
        <span
          key={p.id}
          className="pointer-events-none absolute -bottom-15 select-none opacity-0"
          style={{
            left: `${p.left}%`,
            fontSize: `${p.size}px`,
            animation: `floatPetal ${p.duration}s linear ${p.delay}s infinite`,
          }}
        >
          🌻
        </span>
      ))}

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, ease: "easeOut" }}
        className="pointer-events-none absolute h-95 w-95 rounded-full bg-amber-400/20 blur-3xl"
      />

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 1 }}
        className="mb-3 font-sans text-xs uppercase tracking-[0.45em] text-amber-300/80 sm:text-sm"
      >
        Happy 4th Anniversary
      </motion.p>

      <AnimatePresence mode="wait">
        <motion.h1
          key={message}
          initial={{ opacity: 0, y: 14, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.96 }}
          transition={{ duration: 0.5 }}
          className="font-serif text-3xl italic text-amber-100 sm:text-5xl"
        >
          {message}
        </motion.h1>
      </AnimatePresence>

      {/* YES — the sunflower */}
      <motion.button
        onClick={handleYes}
        aria-label="Yes, I'm your Sunflower"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{
          opacity: 1,
          scale: yesScale,
          boxShadow: [
            "0 0 40px 0 rgba(255,200,0,0.5), 0 0 90px 10px rgba(255,160,0,0.25)",
            "0 0 70px 10px rgba(255,220,0,0.85), 0 0 140px 30px rgba(255,160,0,0.4)",
            "0 0 40px 0 rgba(255,200,0,0.5), 0 0 90px 10px rgba(255,160,0,0.25)",
          ],
        }}
        transition={{
          opacity: { delay: 0.7, duration: 0.8 },
          scale: { delay: 0.7, duration: 0.8, type: "spring", bounce: 0.5 },
          boxShadow: { duration: 2.8, repeat: Infinity, ease: "easeInOut" },
        }}
        whileHover={{ scale: yesScale * 1.06, rotate: 8 }}
        whileTap={{ scale: yesScale * 0.92 }}
        className="relative mt-14 flex h-40 w-40 items-center justify-center rounded-full bg-linear-to-br from-amber-300 to-orange-500 text-8xl"
      >
        <span className="drop-shadow-lg">🌻</span>
      </motion.button>

      <p className="mt-8 font-sans text-xs text-amber-200/60">
        yes is the sunflower 🌻
      </p>

      {/* NO — dodges around the screen */}
      <motion.button
        onClick={handleNo}
        animate={{ left: noPos.left, top: noPos.top }}
        transition={{ type: "spring", stiffness: 320, damping: 24 }}
        style={{ position: "absolute" }}
        whileTap={{ scale: 0.9 }}
        className="rounded-full border border-white/20 bg-white/5 px-5 py-2 font-sans text-sm text-white/60 backdrop-blur-sm"
      >
        no 🚫
      </motion.button>
    </div>
  );
}
