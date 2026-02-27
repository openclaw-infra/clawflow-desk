import { useState, useEffect } from "react";
import { AnimatePresence } from "motion/react";
import { Scene1Logo } from "./scenes/Scene1Logo";
import { Scene2Requirement } from "./scenes/Scene2Requirement";
import { Scene3AgentPickup } from "./scenes/Scene3AgentPickup";
import { Scene4Coding } from "./scenes/Scene4Coding";
import { Scene5Testing } from "./scenes/Scene5Testing";
import { Scene6PR } from "./scenes/Scene6PR";
import { Scene7Review } from "./scenes/Scene7Review";
import { Scene8Deploy } from "./scenes/Scene8Deploy";
import { Scene9Feedback } from "./scenes/Scene9Feedback";
import { Scene10Overview } from "./scenes/Scene10Overview";
import { Scene11End } from "./scenes/Scene11End";

const SCENES = [
  { id: 1, duration: 8000, Component: Scene1Logo },
  { id: 2, duration: 10000, Component: Scene2Requirement },
  { id: 3, duration: 12000, Component: Scene3AgentPickup },
  { id: 4, duration: 18000, Component: Scene4Coding },
  { id: 5, duration: 10000, Component: Scene5Testing },
  { id: 6, duration: 12000, Component: Scene6PR },
  { id: 7, duration: 12000, Component: Scene7Review },
  { id: 8, duration: 10000, Component: Scene8Deploy },
  { id: 9, duration: 10000, Component: Scene9Feedback },
  { id: 10, duration: 10000, Component: Scene10Overview },
  { id: 11, duration: 8000, Component: Scene11End },
];

export default function MotionVideo() {
  const [current, setCurrent] = useState(0);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!auto) return;
    const timer = setTimeout(() => {
      setCurrent((c) => (c + 1) % SCENES.length);
    }, SCENES[current].duration);
    return () => clearTimeout(timer);
  }, [current, auto]);

  const scene = SCENES[current];

  return (
    <div
      className="relative w-[1280px] h-[720px] bg-[#0a0a0a] overflow-hidden"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <AnimatePresence mode="wait">
        <scene.Component key={scene.id} />
      </AnimatePresence>

      {/* Controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 z-50">
        <button
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          className="px-3 py-1 rounded bg-white/10 text-white/60 text-sm hover:bg-white/20"
        >
          ◀ Prev
        </button>
        <span className="text-white/40 text-sm font-mono">
          {current + 1}/{SCENES.length}
        </span>
        <button
          onClick={() => setAuto(!auto)}
          className="px-3 py-1 rounded bg-white/10 text-white/60 text-sm hover:bg-white/20"
        >
          {auto ? "⏸ Pause" : "▶ Play"}
        </button>
        <button
          onClick={() => setCurrent((c) => Math.min(SCENES.length - 1, c + 1))}
          className="px-3 py-1 rounded bg-white/10 text-white/60 text-sm hover:bg-white/20"
        >
          Next ▶
        </button>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
        <div
          className="h-full bg-[#5865f2] transition-all duration-300"
          style={{ width: `${((current + 1) / SCENES.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
