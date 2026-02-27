import { motion } from "motion/react";

export function Scene1Logo() {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Logo */}
      <motion.div
        className="text-8xl mb-6"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.3 }}
      >
        ⚡
      </motion.div>

      <motion.h1
        className="text-5xl font-bold text-white tracking-tight"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        ClawFlow Desk
      </motion.h1>

      <motion.p
        className="text-xl text-[#949ba4] mt-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        AI CLI Configuration Manager
      </motion.p>

      <motion.div
        className="mt-12 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 1 }}
      >
        <p className="text-2xl font-semibold text-[#f2f3f5]">从需求到上线，全程 AI 驱动</p>
        <p className="text-lg text-[#949ba4] mt-2">From idea to production — fully AI-powered</p>
      </motion.div>

      {/* Ambient glow */}
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(88,101,242,0.15) 0%, transparent 70%)" }}
        initial={{ scale: 0 }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ delay: 0.3, duration: 3, repeat: Infinity }}
      />
    </motion.div>
  );
}
