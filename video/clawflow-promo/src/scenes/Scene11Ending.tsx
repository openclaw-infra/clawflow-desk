import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { Zap, Github, ExternalLink } from 'lucide-react';
import { COLORS, FONTS } from '../theme';

export const Scene11Ending: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Logo
  const logoScale = spring({ frame: frame - 20, fps, from: 0.5, to: 1, config: { damping: 10, stiffness: 80 } });

  // Title
  const titleOpacity = interpolate(frame, [40, 60], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const titleY = interpolate(frame, [40, 60], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Subtitle
  const subOpacity = interpolate(frame, [70, 90], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // GitHub URL
  const urlScale = spring({ frame: frame - 100, fps, from: 0, to: 1, config: { damping: 12 } });

  // Glow pulse
  const glowIntensity = interpolate(frame % 60, [0, 30, 60], [20, 40, 20]);

  // Fade out at very end
  const fadeOut = interpolate(frame, [210, 240], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{
      backgroundColor: COLORS.bg,
      justifyContent: 'center',
      alignItems: 'center',
      opacity: enterOpacity * fadeOut,
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute',
        width: 800,
        height: 800,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${COLORS.accent}15 0%, transparent 60%)`,
      }} />

      {/* Content */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
        {/* Logo */}
        <div style={{
          transform: `scale(${logoScale})`,
          filter: `drop-shadow(0 0 ${glowIntensity}px ${COLORS.accent})`,
        }}>
          <Zap size={96} color={COLORS.accent} fill={COLORS.accent} strokeWidth={1.5} />
        </div>

        {/* Title */}
        <div style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          fontFamily: FONTS.sans,
          fontSize: 64,
          fontWeight: 800,
          color: COLORS.text,
          letterSpacing: -2,
        }}>
          ClawFlow Desk
        </div>

        {/* Subtitle */}
        <div style={{
          opacity: subOpacity,
          fontFamily: FONTS.sans,
          fontSize: 22,
          color: COLORS.textMuted,
          letterSpacing: 2,
        }}>
          AI CLI Configuration Manager
        </div>

        {/* GitHub URL */}
        <div style={{
          transform: `scale(${urlScale})`,
          display: 'flex', alignItems: 'center', gap: 12,
          backgroundColor: COLORS.bgPanel,
          borderRadius: 12,
          padding: '16px 32px',
          border: `1px solid ${COLORS.bgChat}`,
          marginTop: 16,
        }}>
          <Github size={22} color={COLORS.text} />
          <span style={{
            fontFamily: FONTS.mono,
            fontSize: 18,
            color: COLORS.accent,
          }}>
            github.com/openclaw-infra/clawflow-desk
          </span>
          <ExternalLink size={16} color={COLORS.textMuted} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
