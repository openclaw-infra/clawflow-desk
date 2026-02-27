import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { Zap } from 'lucide-react';
import { COLORS, FONTS } from '../theme';

export const Scene1Logo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo icon spring in
  const iconScale = spring({ frame: frame - 20, fps, from: 0, to: 1, config: { damping: 10, stiffness: 100 } });
  const iconRotate = spring({ frame: frame - 20, fps, from: -180, to: 0, config: { damping: 12 } });

  // Text fade in
  const titleOpacity = interpolate(frame, [50, 80], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const titleY = interpolate(frame, [50, 80], [30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Tagline
  const tagOpacity = interpolate(frame, [90, 120], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const tagY = interpolate(frame, [90, 120], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Subtitle (English)
  const subOpacity = interpolate(frame, [120, 150], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Glow pulse
  const glowSize = interpolate(frame, [60, 120, 180, 240], [0, 40, 20, 40], { extrapolateRight: 'clamp' });

  // Particles
  const particles = Array.from({ length: 20 }, (_, i) => {
    const angle = (i / 20) * Math.PI * 2;
    const delay = i * 3;
    const progress = interpolate(frame, [delay, delay + 40], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const radius = interpolate(progress, [0, 1], [300, 0]);
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    return { x, y, opacity: progress, key: i };
  });

  // Exit fade
  const exitOpacity = interpolate(frame, [200, 240], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center', opacity: exitOpacity }}>
      {/* Radial glow */}
      <div style={{
        position: 'absolute',
        width: 600 + glowSize * 4,
        height: 600 + glowSize * 4,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${COLORS.accent}22 0%, transparent 70%)`,
      }} />

      {/* Particles converging */}
      {particles.map(p => (
        <div key={p.key} style={{
          position: 'absolute',
          width: 4,
          height: 4,
          borderRadius: '50%',
          backgroundColor: COLORS.accent,
          opacity: 1 - p.opacity,
          transform: `translate(${p.x}px, ${p.y}px)`,
        }} />
      ))}

      {/* Logo */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <div style={{
          transform: `scale(${iconScale}) rotate(${iconRotate}deg)`,
          filter: `drop-shadow(0 0 ${glowSize}px ${COLORS.accent})`,
        }}>
          <Zap size={120} color={COLORS.accent} fill={COLORS.accent} strokeWidth={1.5} />
        </div>

        <div style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          fontFamily: FONTS.sans,
          fontSize: 72,
          fontWeight: 800,
          color: COLORS.text,
          letterSpacing: -2,
        }}>
          ClawFlow Desk
        </div>

        <div style={{
          opacity: tagOpacity,
          transform: `translateY(${tagY}px)`,
          fontFamily: FONTS.sans,
          fontSize: 32,
          fontWeight: 500,
          color: COLORS.accent,
          letterSpacing: 1,
        }}>
          从需求到上线，全程 AI 驱动
        </div>

        <div style={{
          opacity: subOpacity,
          fontFamily: FONTS.sans,
          fontSize: 22,
          color: COLORS.textMuted,
          letterSpacing: 2,
        }}>
          From idea to production — fully AI-powered
        </div>
      </div>
    </AbsoluteFill>
  );
};
