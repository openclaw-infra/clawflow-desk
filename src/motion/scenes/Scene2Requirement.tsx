import { motion } from "motion/react";

function TelegramBubble({ text, delay }: { text: string; delay: number }) {
  return (
    <motion.div
      className="flex justify-end mb-3"
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay, type: "spring", stiffness: 300, damping: 25 }}
    >
      <div className="bg-[#2b5278] text-white px-4 py-2.5 rounded-2xl rounded-br-sm max-w-[400px] text-[15px] leading-relaxed">
        {text}
      </div>
    </motion.div>
  );
}

function IssueCard({ delay }: { delay: number }) {
  return (
    <motion.div
      className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 max-w-[480px]"
      initial={{ scale: 0.8, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 200, damping: 20 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 rounded-full bg-[#238636] flex items-center justify-center text-white text-xs">●</div>
        <span className="text-[#58a6ff] font-semibold text-base">#1</span>
        <span className="text-[#c9d1d9] font-semibold text-base">feat: Add Agent Instance creation form UI</span>
      </div>
      <div className="flex gap-2 mb-3">
        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#1f6feb33] text-[#58a6ff] border border-[#1f6feb66]">enhancement</span>
      </div>
      <div className="text-[#8b949e] text-sm leading-relaxed">
        When clicking the + button in the Agent Rail, there should be a form to create a new Agent Instance...
      </div>
    </motion.div>
  );
}

export function Scene2Requirement() {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center gap-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Title */}
      <motion.p
        className="text-[#949ba4] text-sm font-medium uppercase tracking-widest"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Step 1 — 需求提出
      </motion.p>

      {/* Telegram */}
      <motion.div
        className="w-[500px] bg-[#17212b] rounded-xl p-5"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#ffffff10]">
          <div className="w-8 h-8 rounded-full bg-[#5865f2] flex items-center justify-center text-white text-sm font-bold">K</div>
          <span className="text-white font-medium text-sm">Ken → ClawFlow Bot</span>
        </div>
        <TelegramBubble text="加个 Agent Instance 创建表单，支持选 CLI 类型和 Provider" delay={1} />
      </motion.div>

      {/* Arrow */}
      <motion.div
        className="text-4xl text-[#5865f2]"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2.5, type: "spring" }}
      >
        ↓
      </motion.div>

      {/* GitHub Issue */}
      <IssueCard delay={3} />

      <motion.p
        className="text-[#949ba4] text-base"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 4 }}
      >
        一句话需求 → 自动创建 Issue
      </motion.p>
    </motion.div>
  );
}
