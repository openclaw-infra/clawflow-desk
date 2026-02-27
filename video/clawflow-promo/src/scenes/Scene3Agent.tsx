import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { Bot, Hash, Circle, Plug } from 'lucide-react';
import { COLORS, FONTS } from '../theme';

const TypingDots: React.FC<{ frame: number }> = ({ frame }) => {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '8px 0' }}>
      {[0, 1, 2].map(i => {
        const bounce = Math.sin((frame + i * 5) * 0.15) * 0.5 + 0.5;
        return (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: '50%',
            backgroundColor: COLORS.textMuted,
            opacity: 0.4 + bounce * 0.6,
            transform: `translateY(${-bounce * 4}px)`,
          }} />
        );
      })}
    </div>
  );
};

export const Scene3Agent: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const exitOpacity = interpolate(frame, [350, 380], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Sidebar slide in
  const sidebarX = spring({ frame: frame - 10, fps, from: -300, to: 0, config: { damping: 15 } });

  // Agent light pulse
  const pulseOpacity = interpolate(frame % 40, [0, 20, 40], [0.4, 1, 0.4]);
  const agentLightOn = frame > 40;

  // Channel appears
  const channelOpacity = spring({ frame: frame - 60, fps, from: 0, to: 1, config: { damping: 20 } });

  // System message
  const sysOpacity = interpolate(frame, [100, 120], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const sysY = interpolate(frame, [100, 120], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Claude message
  const claudeOpacity = interpolate(frame, [160, 180], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const claudeY = interpolate(frame, [160, 180], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Typing indicator
  const typingShow = frame > 220 && frame < 350;

  // Caption
  const captionOpacity = interpolate(frame, [250, 270], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, opacity: enterOpacity * exitOpacity }}>
      {/* Discord-style layout */}
      <div style={{ display: 'flex', width: '100%', height: '100%' }}>
        {/* Agent Rail (left narrow bar) */}
        <div style={{
          width: 72, backgroundColor: COLORS.bgDark,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          paddingTop: 16, gap: 8,
          transform: `translateX(${sidebarX}px)`,
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 16,
            backgroundColor: COLORS.accent, display: 'flex',
            justifyContent: 'center', alignItems: 'center',
            position: 'relative',
          }}>
            <Bot size={28} color={COLORS.white} />
            {agentLightOn && (
              <div style={{
                position: 'absolute', bottom: -2, right: -2,
                width: 14, height: 14, borderRadius: '50%',
                backgroundColor: COLORS.green,
                border: `3px solid ${COLORS.bgDark}`,
                opacity: pulseOpacity,
              }} />
            )}
          </div>
        </div>

        {/* Channel Sidebar */}
        <div style={{
          width: 240, backgroundColor: COLORS.bgPanel,
          padding: '16px 8px',
          transform: `translateX(${sidebarX}px)`,
        }}>
          <div style={{
            fontFamily: FONTS.sans, fontSize: 13, fontWeight: 700,
            color: COLORS.textMuted, padding: '8px 8px', textTransform: 'uppercase',
            letterSpacing: 1,
          }}>
            Sessions
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 8px', borderRadius: 4,
            backgroundColor: `${COLORS.bgChat}`,
            opacity: channelOpacity,
            fontFamily: FONTS.sans, fontSize: 15, color: COLORS.text,
          }}>
            <Hash size={18} color={COLORS.textMuted} />
            issue-1
          </div>
        </div>

        {/* Chat area */}
        <div style={{
          flex: 1, backgroundColor: COLORS.bgChat,
          display: 'flex', flexDirection: 'column', padding: 32,
        }}>
          {/* Header */}
          <div style={{
            borderBottom: `1px solid ${COLORS.bgPanel}`,
            paddingBottom: 16, marginBottom: 24,
            display: 'flex', alignItems: 'center', gap: 8,
            fontFamily: FONTS.sans, fontSize: 18, fontWeight: 700, color: COLORS.text,
          }}>
            <Hash size={22} color={COLORS.textMuted} />
            issue-1
          </div>

          {/* System message */}
          <div style={{
            opacity: sysOpacity,
            transform: `translateY(${sysY}px)`,
            display: 'flex', gap: 16, marginBottom: 24,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              backgroundColor: COLORS.bgPanel,
              display: 'flex', justifyContent: 'center', alignItems: 'center',
            }}>
              <Plug size={20} color={COLORS.accent} />
            </div>
            <div>
              <div style={{ fontFamily: FONTS.sans, fontSize: 14, color: COLORS.accent, fontWeight: 600, marginBottom: 4 }}>
                System
              </div>
              <div style={{ fontFamily: FONTS.sans, fontSize: 16, color: COLORS.text, lineHeight: 1.6 }}>
                New issue assigned: #1 — Agent Instance creation form
              </div>
            </div>
          </div>

          {/* Claude message */}
          <div style={{
            opacity: claudeOpacity,
            transform: `translateY(${claudeY}px)`,
            display: 'flex', gap: 16, marginBottom: 24,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              backgroundColor: COLORS.orange,
              display: 'flex', justifyContent: 'center', alignItems: 'center',
            }}>
              <Bot size={20} color={COLORS.white} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontFamily: FONTS.sans, fontSize: 14, color: COLORS.orange, fontWeight: 600 }}>Claude</span>
                <span style={{
                  fontFamily: FONTS.sans, fontSize: 10, color: COLORS.white,
                  backgroundColor: COLORS.accent, borderRadius: 3, padding: '1px 5px',
                }}>BOT</span>
              </div>
              <div style={{ fontFamily: FONTS.sans, fontSize: 16, color: COLORS.text }}>
                分析需求中...
              </div>
            </div>
          </div>

          {/* Typing indicator */}
          {typingShow && (
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                backgroundColor: COLORS.orange,
                display: 'flex', justifyContent: 'center', alignItems: 'center',
              }}>
                <Bot size={20} color={COLORS.white} />
              </div>
              <TypingDots frame={frame} />
            </div>
          )}
        </div>
      </div>

      {/* Caption */}
      <div style={{
        position: 'absolute', bottom: 60, left: 0, right: 0,
        textAlign: 'center', opacity: captionOpacity,
        fontFamily: FONTS.sans, fontSize: 24, color: COLORS.textMuted,
      }}>
        AI Agent 自动接单，开始分析代码库
      </div>
    </AbsoluteFill>
  );
};
