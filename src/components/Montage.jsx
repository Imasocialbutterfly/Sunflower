import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { media } from "../data/media";
import { captions } from "../data/captions";

const FALLBACK_IMAGE_MS = 2500;

function MutedVideo({ src, className, onEnded }) {
  const ref = useRef(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    v.play().catch(() => {});
  }, [src]);

  return (
    <video
      ref={ref}
      src={src}
      className={className}
      autoPlay
      playsInline
      muted
      preload="auto"
      onEnded={onEnded}
      onError={onEnded}
    />
  );
}

// Floating captions that pop around the screen at random spots
function FloatingCaptions({ playing }) {
  const [active, setActive] = useState([]);
  const idRef = useRef(0);
  const idxRef = useRef(0);

  useEffect(() => {
    if (!playing || captions.length === 0) return;

    const spawn = () => {
      setActive((prev) => {
        if (prev.length >= 3) return prev;

        const id = idRef.current++;
        const text = captions[idxRef.current % captions.length];
        idxRef.current++;

        let x,
          y,
          tries = 0;
        do {
          x = 4 + Math.random() * 72;
          y = 8 + Math.random() * 74;
          tries++;
        } while (Math.abs(x - 46) < 20 && Math.abs(y - 46) < 20 && tries < 15);

        const rotation = -22 + Math.random() * 44;
        const lifetime = 3200 + Math.random() * 800;

        setTimeout(() => {
          setActive((cur) => cur.filter((c) => c.id !== id));
        }, lifetime);

        return [...prev, { id, text, x, y, rotation }];
      });
    };

    const first = setTimeout(spawn, 700);
    const interval = setInterval(spawn, 2100);

    return () => {
      clearTimeout(first);
      clearInterval(interval);
    };
  }, [playing]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <AnimatePresence>
        {active.map((c) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, scale: 0.4, rotate: c.rotation - 15 }}
            animate={{ opacity: 1, scale: 1, rotate: c.rotation }}
            exit={{ opacity: 0, scale: 0.7, rotate: c.rotation + 12 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            style={{ left: `${c.x}%`, top: `${c.y}%` }}
            className="absolute"
          >
            <motion.span
              animate={{ y: [0, -7, 0] }}
              transition={{
                duration: 3.6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="inline-block max-w-[60vw] whitespace-nowrap rounded-2xl border border-white/10 bg-black/40 px-4 py-2 font-serif text-lg italic text-white shadow-lg backdrop-blur-md sm:max-w-[40vw] sm:text-2xl md:text-3xl"
            >
              {c.text}
            </motion.span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default function Montage({ audioRef, onFinish }) {
  const [index, setIndex] = useState(0);
  const [muted, setMuted] = useState(false);
  const [imageMs, setImageMs] = useState(FALLBACK_IMAGE_MS);
  const advanceTimer = useRef(null);

  const current = media[index];

  // keep the mute button in sync with the audio element
  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted;
  }, [muted, audioRef]);

  useEffect(() => {
    let cancelled = false;

    const loadVideoDuration = (src) =>
      new Promise((resolve) => {
        const v = document.createElement("video");
        v.preload = "metadata";
        v.muted = true;
        v.src = src;
        v.onloadedmetadata = () => resolve(v.duration || 0);
        v.onerror = () => resolve(0);
      });

    const compute = async () => {
      const audio = audioRef.current;

      // wait for audio metadata
      const audioDuration = await new Promise((resolve) => {
        if (audio && isFinite(audio.duration) && audio.duration > 0) {
          resolve(audio.duration);
          return;
        }
        const onMeta = () => resolve(audio?.duration || 127);
        audio?.addEventListener("loadedmetadata", onMeta, { once: true });
        setTimeout(() => resolve(audio?.duration || 127), 2000);
      });

      const videos = media.filter((m) => m.type === "video");
      const images = media.filter((m) => m.type === "image");
      if (images.length === 0) return;

      const videoDurations = await Promise.all(
        videos.map((v) => loadVideoDuration(v.src)),
      );
      const totalVideo = videoDurations.reduce((s, d) => s + d, 0);

      // remaining time split across images (min 1.2s each for readability)
      const remaining = Math.max(
        audioDuration - totalVideo,
        images.length * 1.2,
      );
      const perImageMs = (remaining / images.length) * 1000;

      if (!cancelled) setImageMs(perImageMs);
    };

    compute();
    return () => {
      cancelled = true;
    };
  }, [audioRef]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handler = () => onFinish();
    audio.addEventListener("ended", handler);
    return () => audio.removeEventListener("ended", handler);
  }, [audioRef, onFinish]);

  const advance = useCallback(() => {
    setIndex((i) => {
      const next = i + 1;
      if (next >= media.length) {
        // if song still playing, loop back; otherwise finish
        const audio = audioRef.current;
        if (audio && !audio.ended && audio.currentTime < audio.duration - 1) {
          return 0;
        }
        onFinish();
        return i;
      }
      return next;
    });
  }, [onFinish, audioRef]);

  useEffect(() => {
    clearTimeout(advanceTimer.current);
    if (current.type === "image") {
      advanceTimer.current = setTimeout(advance, imageMs);
    }
    return () => clearTimeout(advanceTimer.current);
  }, [index, current, advance, imageMs]);

  return (
    <div className="relative h-dvh w-screen overflow-hidden bg-black">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 1.1, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {current.type === "image" ? (
            <motion.img
              src={current.src}
              alt=""
              className="h-full w-full object-cover"
              initial={{ scale: 1 }}
              animate={{ scale: 1.08 }}
              transition={{ duration: imageMs / 1000 + 1, ease: "easeOut" }}
            />
          ) : (
            <MutedVideo
              src={current.src}
              className="h-full w-full object-cover"
              onEnded={advance}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* vignette for caption readability */}
      <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-black/40" />

      {/* floating captions */}
      <FloatingCaptions playing />

      {/* progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/15">
        <motion.div
          className="h-full bg-amber-300"
          initial={false}
          animate={{ width: `${((index + 1) / media.length) * 100}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>

      {/* mute toggle */}
      <button
        onClick={() => setMuted((m) => !m)}
        aria-label={muted ? "Unmute" : "Mute"}
        className="absolute right-4 rounded-full bg-black/40 p-3 text-xl backdrop-blur-md transition hover:bg-black/60"
        style={{ top: "max(env(safe-area-inset-top), 1rem)" }}
      >
        {muted ? "🔇" : "🔊"}
      </button>
    </div>
  );
}
