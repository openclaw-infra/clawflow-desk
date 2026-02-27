import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { MessageCircle, GitPullRequest, Tag, ArrowRight } from 'lucide-react';
import { COLORS, FONTS } from '../theme';

export const Scene2Request: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Enter
  const enterOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Telegram bubble appears
  const bubbleScale = spring({ frame: frame - 30, fps, from: 0, to: 1, config: { damping: 12 } });
  const bubbleX = interpolate(frame, [150, 190], [0, -200], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const bubbleOpacity = interpolate(frame, [150, 190], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Arrow morph
  const arrowOpacity = interpolate(frame, [140, 160, 200, 220], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const arrowX = interpolate(frame, [140, 220], [-50, 50], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // GitHub Issue card
  const issueScale = spring({ frame: frame - 190, fps, from: 0.5, to: 1, config: { damping: 14 } });
  const issueOpacity = interpolate(frame, [190, 210], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Caption
  const captionOpacity = interpolate(frame, [240, 260], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Exit
  const exitOpacity = interpolate(frame, [290, 320], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Typing animation for message
  const msgText = '加个 Agent Instance 创建表单，支持选 CLI 类型和 Provider';
  const charsVisible = Math.floor(interpolate(frame, [40, 110], [0, msgText.length], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center', opacity: enterOpacity * exitOpacity }}>
      {/* Telegram message bubble */}
      <div style={{
        position: 'absolute',
        transform: `scale(${bubbleScale}) translateX(${bubbleX}px)`,
        opacity: bubbleOpacity,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          fontFamily: FONTS.sans, fontSize: 16, color: COLORS.textMuted,
        }}>
          <MessageCircle size={20} color={COLORS.accent} />
          <span>Telegram</span>
        </div>
        <div style={{
          backgroundColor: '#2b5278',
          borderRadius: '18px 18px 18px 4px',
          padding: '16px 24px',
          maxWidth: 600,
          fontFamily: FONTS.sans,
          fontSize: 24,
          color: COLORS.text,
          lineHeight: 1.5,
        }}>
          <div style={{ fontSize: 14, color: '#7eb8e0', marginBottom: 6, fontWeight: 600 }}>Ken</div>
          {msgText.slice(0, charsVisible)}
          {charsVisible < msgText.length && (
            <span style={{ opacity: frame % 15 < 8 ? 1 : 0, color: COLORS.accent }}>|</span>
          )}
        </div>
      </div>

      {/* Arrow */}
      <div style={{
        position: 'absolute',
        opacity: arrowOpacity,
        transform: `translateX(${arrowX}px)`,
      }}>
        <ArrowRight size={48} color={COLORS.accent} />
      </div>

      {/* GitHub Issue card */}
      <div style={{
        position: 'absolute',
        transform: `scale(${issueScale})`,
        opacity: issueOpacity,
        backgroundColor: COLORS.bgPanel,
        border: `1px solid ${COLORS.bgChat}`,
        borderRadius: 12,
        padding: 32,
        width: 560,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <GitPullRequest size={24} color={COLORS.green} />
          <span style={{ fontFamily: FONTS.sans, fontSize: 14, color: COLORS.textMuted }}>
            openclaw-infra/clawflow-desk
          </span>
        </div>
        <div style={{
          fontFamily: FONTS.sans, fontSize: 26, fontWeight: 700, color: COLORS.text, marginBottom: 12,
        }}>
          #1 feat: Add Agent Instance creation form UI
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            backgroundColor: '#1a3a2a', borderRadius: 20, padding: '4px 12px',
            fontFamily: FONTS.sans, fontSize: 13, color: COLORS.green,
          }}>
            <Tag size={12} /> enhancement
          </div>
        </div>
      </div>

      {/* Caption */}
      <div style={{
        position: 'absolute',
        bottom: 120,
        opacity: captionOpacity,
        fontFamily: FONTS.sans,
        fontSize: 24,
        color: COLORS.textMuted,
      }}>
        一句话需求，自动创建 Issue
      </div>
    </AbsoluteFill>
  );
};
