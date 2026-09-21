import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  onComplete: () => void;
};

export default function BatSignalIntro({ onComplete }: Props) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 800),
      setTimeout(() => setStage(2), 2200),
      setTimeout(() => setStage(3), 3600),
      setTimeout(() => setStage(4), 5000),
      setTimeout(() => onComplete(), 6200),
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
        className="fixed inset-0 z-[9999] overflow-hidden bg-black"
      >
        {/* GOTHAM ATMOSPHERE */}

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_65%,rgba(255,193,7,0.12),transparent_35%)]" />

        {/* RAIN */}

        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: 60 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-20 w-px bg-white"
              style={{
                left: `${(i * 37) % 100}%`,
                top: `${(i * 19) % 100}%`,
              }}
              animate={{
                y: ["-100px", "110vh"],
              }}
              transition={{
                duration: 0.8 + (i % 6) * 0.25,
                repeat: Infinity,
                ease: "linear",
                delay: (i % 8) * 0.2,
              }}
            />
          ))}
        </div>

        {/* GOTHAM HORIZON */}

        <div className="absolute bottom-0 left-0 right-0 h-[22%] opacity-80">
          <div className="absolute bottom-0 h-full w-full bg-gradient-to-t from-black via-black/90 to-transparent" />

          {Array.from({ length: 35 }).map((_, i) => (
            <div
              key={i}
              className="absolute bottom-0 bg-[#050505]"
              style={{
                left: `${i * 3}%`,
                width: `${2 + (i % 4)}%`,
                height: `${20 + ((i * 17) % 80)}%`,
              }}
            />
          ))}
        </div>

        {/* BAT SIGNAL LIGHT */}

        <motion.div
          initial={{
            opacity: 0,
            scale: 0.2,
          }}
          animate={{
            opacity: stage >= 1 ? 0.35 : 0,
            scale: stage >= 1 ? 1 : 0.2,
          }}
          transition={{
            duration: 1.5,
          }}
          className="absolute left-1/2 top-[62%] h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-400 blur-[100px]"
        />

        {/* BAT SYMBOL */}

        <motion.div
          initial={{
            opacity: 0,
            scale: 0.3,
            rotate: -8,
          }}
          animate={{
            opacity: stage >= 2 ? 1 : 0,
            scale: stage >= 2 ? 1 : 0.3,
            rotate: 0,
          }}
          transition={{
            duration: 1.2,
            ease: "easeOut",
          }}
          className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2"
        >
          <div className="relative">
            {/* Original bat-inspired emblem */}

            <svg
              width="420"
              height="220"
              viewBox="0 0 420 220"
              fill="none"
              className="drop-shadow-[0_0_35px_rgba(255,193,7,0.65)]"
            >
              <path
                d="
                M210 105
                C185 82 158 67 125 64
                C145 80 151 92 151 105
                C120 89 87 83 48 86
                C74 103 95 116 116 128
                C88 124 58 130 28 145
                C69 151 103 164 137 176
                C160 183 184 178 210 156

                C236 178 260 183 283 176
                C317 164 351 151 392 145
                C362 130 332 124 304 128
                C325 116 346 103 372 86
                C333 83 300 89 269 105
                C269 92 275 80 295 64
                C262 67 235 82 210 105

                Z"
                fill="currentColor"
              />

              <path
                d="M210 105 L196 75 L210 87 L224 75 Z"
                fill="#000"
                opacity="0.7"
              />
            </svg>

            <div className="absolute inset-0 animate-pulse bg-yellow-400/10 blur-3xl" />
          </div>
        </motion.div>

        {/* SYSTEM TEXT */}

        <div className="absolute left-0 right-0 top-[67%] text-center">
          <AnimatePresence mode="wait">
            {stage >= 3 && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="text-yellow-400"
              >
                <p className="text-4xl font-black tracking-[0.5em] md:text-6xl">
                  BATCOM
                </p>

                <p className="mt-3 text-[10px] tracking-[0.45em] text-gray-500 md:text-xs">
                  PRIVATE COMMAND NETWORK
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* INITIALIZING */}

        {stage >= 4 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-[12%] left-0 right-0 text-center"
          >
            <p className="font-mono text-xs tracking-[0.4em] text-gray-500">
              SYSTEM INITIALIZING
            </p>

            <div className="mx-auto mt-3 h-1 w-64 overflow-hidden bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.8 }}
                className="h-full bg-yellow-400"
              />
            </div>

            <p className="mt-3 font-mono text-[10px] tracking-widest text-yellow-400">
              GOTHAM NETWORK // ONLINE
            </p>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}