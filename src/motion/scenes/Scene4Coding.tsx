import { motion } from "motion/react";

const CODE_LINES = [
  { text: "// AgentForm.tsx — New agent creation form", cls: "text-[#5c6370]" },
  { text: 'import { useState } from "react";', cls: "text-[#c678dd]" },
  { text: 'import { api } from "../lib/api";', cls: "text-[#c678dd]" },
  { text: "", cls: "" },
  { text: "export function AgentForm() {", cls: "text-[#61afef]" },
  { text: '  const [name, setName] = useState("");', cls: "text-[#dbdee1]" },
  { text: '  const [cli, setCli] = useState("claude");', cls: "text-[#dbdee1]" },
  { text: "  const [providerId, setProviderId] = useState(\"\");", cls: "text-[#dbdee1]" },
  { text: "", cls: "" },
  { text: "  const handleSave = async () => {", cls: "text-[#61afef]" },
  { text: "    await api.saveAgent({", cls: "text-[#dbdee1]" },
  { text: "      id: `agent-${Date.now()}`,", cls: "text-[#98c379]" },
  { text: "      name, cli, providerId,", cls: "text-[#dbdee1]" },
  { text: "      createdAt: Date.now(),", cls: "text-[#d19a66]" },
  { text: "      sortOrder: 0,", cls: "text-[#d19a66]" },
  { text: "    });", cls: "text-[#dbdee1]" },
  { text: "  };", cls: "text-[#dbdee1]" },
];

const FILES_CHANGED = [
  { name: "AgentForm.tsx", status: "A", color: "#23a559" },
  { name: "Sidebar.tsx", status: "M", color: "#d29922" },
  { name: "store/index.ts", status: "M", color: "#d29922" },
  { name: "App.tsx", status: "M", color: "#d29922" },
];

export function Scene4Coding() {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Title */}
      <motion.p
        className="absolute top-12 text-[#949ba4] text-sm font-medium uppercase tracking-widest"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Step 3 — 自动编码
      </motion.p>

      {/* File tree */}
      <motion.div
        className="w-[220px] bg-[#1e1f22] rounded-xl p-4 self-start mt-20"
        initial={{ x: -30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <p className="text-xs text-[#949ba4] font-semibold uppercase tracking-wider mb-3">Files Changed</p>
        {FILES_CHANGED.map((f, i) => (
          <motion.div
            key={f.name}
            className="flex items-center gap-2 py-1.5 px-2 rounded text-sm"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1, background: i === 0 ? "rgba(35,165,89,0.1)" : "transparent" }}
            transition={{ delay: 1 + i * 0.5 }}
          >
            <span className="text-xs font-mono font-bold" style={{ color: f.color }}>{f.status}</span>
            <span className="text-[#dbdee1]">{f.name}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* Code editor */}
      <motion.div
        className="w-[700px] bg-[#1e1f22] rounded-xl overflow-hidden border border-[#27272a]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {/* Tab bar */}
        <div className="flex items-center bg-[#181a1b] border-b border-[#27272a]">
          <div className="px-4 py-2.5 bg-[#1e1f22] text-[#dbdee1] text-sm font-medium border-r border-[#27272a] flex items-center gap-2">
            <span className="text-[#61afef]">⚛</span> AgentForm.tsx
          </div>
          <div className="px-4 py-2.5 text-[#949ba4] text-sm">Sidebar.tsx</div>
        </div>

        {/* Code */}
        <div className="p-4 font-mono text-[13px] leading-[1.7]">
          {CODE_LINES.map((line, i) => (
            <motion.div
              key={i}
              className="flex"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 2 + i * 0.3 }}
            >
              <span className="text-[#5c6370] w-8 text-right mr-4 select-none">{i + 1}</span>
              <span className={line.cls}>{line.text}</span>
            </motion.div>
          ))}
          {/* Cursor */}
          <motion.span
            className="inline-block w-[2px] h-[18px] bg-white ml-12"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        </div>
      </motion.div>

      <motion.p
        className="absolute bottom-20 text-[#949ba4] text-base"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 8 }}
      >
        自动定位代码、编写实现、遵循项目规范
      </motion.p>
    </motion.div>
  );
}
