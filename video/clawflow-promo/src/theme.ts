// Discord dark theme colors for ClawFlow Desk
export const COLORS = {
  bg: '#0a0a0a',
  bgDark: '#111214',
  bgPanel: '#1e1f22',
  bgChat: '#313338',
  bgInput: '#383a40',
  accent: '#5865f2',    // Discord blurple
  green: '#23a559',
  orange: '#d97757',    // Claude orange
  text: '#f2f3f5',
  textMuted: '#949ba4',
  textDim: '#6d6f78',
  red: '#ed4245',
  yellow: '#fee75c',
  white: '#ffffff',
};

export const FONTS = {
  sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  mono: '"JetBrains Mono", "Fira Code", "SF Mono", Consolas, monospace',
};

// Video specs
export const VIDEO = {
  width: 1920,
  height: 1080,
  fps: 30,
};

// Scene durations in frames (at 30fps)
export const SCENES = {
  s1_logo:      { from: 0,    duration: 240 },   // 0-8s
  s2_request:   { from: 220,  duration: 320 },   // ~7.3-18s (overlap)
  s3_agent:     { from: 520,  duration: 380 },   // ~17.3-30s
  s4_coding:    { from: 870,  duration: 560 },   // ~29-48s
  s5_test:      { from: 1400, duration: 320 },   // ~46.7-57.3s
  s6_pr:        { from: 1690, duration: 380 },   // ~56.3-69s
  s7_review:    { from: 2040, duration: 380 },   // ~68-80.7s
  s8_deploy:    { from: 2390, duration: 320 },   // ~79.7-90.3s
  s9_feedback:  { from: 2680, duration: 320 },   // ~89.3-100s
  s10_overview: { from: 2970, duration: 320 },   // ~99-109.7s
  s11_ending:   { from: 3260, duration: 240 },   // ~108.7-116.7s
};

export const TOTAL_FRAMES = 3500; // ~116.7s
