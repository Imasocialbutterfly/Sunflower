import { useState } from "react";
import { motion } from "motion/react";
import confetti from "canvas-confetti";

export default function Finale({ onReplay }) {
  const [stage, setStage] = useState("question"); // 'question' | 'accepted'

  const handleYes = () => {
    confetti({
      particleCount: 120,
      spread: 100,
      origin: { y: 0.6 },
      colors: ["#FFD700", "#FFC300", "#FFA500", "#FFF3B0"],
    });
    onReplay();
  };

  if (stage === "accepted") {
    return (
      <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-linear-to-b from-[#1a1206] via-[#2b1d08] to-black px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, type: "spring", bounce: 0.4 }}
          className="mb-6 text-7xl"
        >
          🫂
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="font-serif text-4xl italic text-amber-200 sm:text-6xl"
        >
          Okay, come here
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 1 }}
          className="mt-6 max-w-2xl text-base leading-relaxed text-amber-50/80 sm:text-lg"
        >
          I love you, Sunflower. Happy 4 years. 💛
        </motion.p>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-linear-to-b from-[#1a1206] via-[#2b1d08] to-black px-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.4, rotate: -30 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 1.1, type: "spring", bounce: 0.4 }}
        className="mb-6 text-6xl"
      >
        🌻
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 1 }}
        className="font-serif text-3xl italic text-amber-200 sm:text-5xl"
      >
        Want to watch it again?
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.9 }}
        className="mt-12 flex items-center gap-6"
      >
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={handleYes}
          className="rounded-full bg-amber-400 px-8 py-3 font-semibold text-black shadow-lg transition hover:bg-amber-300"
        >
          Yes 🌻
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setStage("accepted")}
          className="rounded-full border border-white/20 bg-white/5 px-8 py-3 font-sans text-white/70 backdrop-blur-sm"
        >
          No
        </motion.button>
      </motion.div>
    </div>
  );
}
