import { motion } from "motion/react";

function AgentIcon({ color, active, delay }: { color: string; active?: boolean; delay: number }) {
  return (
    <motion.div
      className="relative"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 300, damping: 20 }}
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl"
        style={{ background: active ? color : `${color}44` }}
      >
        {color === "#d97757" ? "🤖" : color === "#10a37f" ? "⚡" : "✨"}
      </div>
      {active && (
        <motion.div
          className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#23a559] border-[3px] border-[#1e1f22]"
          initial={{ scale: 0 }}
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ delay: delay + 0.5, duration: 1, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}

function ChatMessage({ avatar, name, nameColor, text, delay, bot }: {
  avatar: string; name: string; nameColor: string; text: string; delay: number; bot?: boolean;
}) {
  return (
    <motion.div
      className="flex gap-3 px-4 py-1"
      initial={{ x: -30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay, duration: 0.4 }}
    >
      <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0" style={{ background: `${nameColor}22` }}>
        {avatar}
      </div>
      <div>
        <div className="flex items-baseline gap-2">
          <span className="font-semibold" style={{ color: nameColor }}>{name}</span>
          {bot && <span className="text-[10px] px-1 py-0.5 rounded bg-[#5865f2] text-white font-medium">BOT</span>}
          <span className="text-xs text-[#949ba4]">Today at 00:18</span>
        </div>
        <p className="text-[#dbdee1] text-[15px] mt-0.5">{text}</p>
      </div>
    </motion.div>
  );
}

export function Scene3AgentPickup() {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex gap-6">
        {/* Agent Rail */}
        <div className="flex flex-col items-center gap-3 bg-[#1e1f22] rounded-2xl p-4">
          <AgentIcon color="#d97757" active delay={0.5} />
          <AgentIcon color="#10a37f" delay={0.7} />
          <AgentIcon color="#4285f4" delay={0.9} />
        </div>

        {/* Chat area */}
        <motion.div
          className="w-[700px] bg-[#313338] rounded-2xl overflow-hidden border border-[#27272a]"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Header */}
          <div className="h-12 bg-[#313338] border-b border-[#1f2023] flex items-center px-4 gap-2">
            <span className="text-[#80848e] text-xl font-medium">#</span>
            <span className="text-[#f2f3f5] font-semibold">issue-1</span>
            <span className="text-[#3f4147] mx-2">|</span>
            <span className="text-[#949ba4] text-sm">Agent Instance creation form</span>
          </div>

          {/* Messages */}
          <div className="p-4 space-y-3">
            <ChatMessage
              avatar="🔌" name="System" nameColor="#5865f2"
              text="🔌 New issue assigned: #1 — Add Agent Instance creation form UI"
              delay={1.5}
            />
            <ChatMessage
              avatar="🤖" name="Claude" nameColor="#d97757" bot
              text="收到 Issue #1。正在分析代码库，定位相关文件..."
              delay={3}
            />
            <ChatMessage
              avatar="🤖" name="Claude" nameColor="#d97757" bot
              text="📂 找到相关文件: Sidebar.tsx, store/index.ts, agents.ts — 开始编码"
              delay={5}
            />

            {/* Typing indicator */}
            <motion.div
              className="flex items-center gap-2 px-4 py-1 text-sm text-[#949ba4]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 7 }}
            >
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <motion.span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-[#949ba4]"
                    animate={{ y: [0, -3, 0] }}
                    transition={{ delay: 7 + i * 0.15, duration: 0.6, repeat: Infinity }}
                  />
                ))}
              </div>
              <span><strong>Claude</strong> is coding...</span>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <motion.p
        className="absolute bottom-20 text-[#949ba4] text-base"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 6 }}
      >
        AI Agent 自动接单，分析代码库，开始编码
      </motion.p>
    </motion.div>
  );
}
