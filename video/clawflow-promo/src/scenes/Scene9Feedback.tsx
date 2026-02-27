import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { Bell, MessageCircle, CheckCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { COLORS, FONTS } from '../theme';

export const Scene9Feedback: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const exitOpacity = interpolate(frame, [290, 320], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Notification bell shake
  const bellRotate = frame > 20 && frame < 50
    ? Math.sin(frame * 0.8) * 15
    : 0;

  // Notification card
  const notifScale = spring({ frame: frame - 30, fps, from: 0.5, to: 1, config: { damping: 12 } });
  const notifOpacity = interpolate(frame, [30, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // User reply
  const replyOpacity = interpolate(frame, [150, 170], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const replyY = interpolate(frame, [150, 170], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // New issue created
  const issueOpacity = interpolate(frame, [210, 230], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const issueScale = spring({ frame: frame - 210, fps, from: 0.8, to: 1, config: { damping: 14 } });

  // Loop arrow
  const loopOpacity = interpolate(frame, [250, 270], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const loopRotate = interpolate(frame, [250, 320], [0, 360], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Caption
  const captionOpacity = interpolate(frame, [260, 280], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Typing for reply
  const replyText = '表单加个颜色选择器';
  const replyChars = Math.floor(interpolate(frame, [170, 220], [0, replyText.length], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center', opacity: enterOpacity * exitOpacity }}>
      {/* Notification bell */}
      <div style={{
        position: 'absolute', top: 80, right: 200,
        transform: `rotate(${bellRotate}deg)`,
      }}>
        <Bell size={36} color={COLORS.accent} />
        <div style={{
          position: 'absolute', top: -4, right: -4,
          width: 14, height: 14, borderRadius: '50%',
          backgroundColor: COLORS.red,
        }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: 650 }}>
        {/* Bot notification */}
        <div style={{
          opacity: notifOpacity,
          transform: `scale(${notifScale})`,
          backgroundColor: COLORS.bgPanel,
          borderRadius: 12, padding: 24,
          border: `1px solid ${COLORS.bgChat}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <MessageCircle size={18} color={COLORS.accent} />
            <span style={{ fontFamily: FONTS.sans, fontSize: 14, color: COLORS.accent, fontWeight: 600 }}>
              ClawFlow Bot
            </span>
          </div>
          <div style={{ fontFamily: FONTS.sans, fontSize: 16, color: COLORS.text, lineHeight: 1.8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle size={14} color={COLORS.green} />
              Issue #1 已修复并发布
            </div>
            <div style={{ color: COLORS.textMuted, fontSize: 14, marginTop: 4 }}>
              PR: github.com/.../pull/4
            </div>
            <div style={{ color: COLORS.textMuted, fontSize: 14 }}>
              版本: v0.2.0
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: COLORS.accent, fontSize: 14, marginTop: 4 }}>
              <ExternalLink size={12} />
              openclaw-infra.github.io/clawflow-desk
            </div>
          </div>
        </div>

        {/* User reply */}
        <div style={{
          opacity: replyOpacity,
          transform: `translateY(${replyY}px)`,
          alignSelf: 'flex-end',
        }}>
          <div style={{
            backgroundColor: '#2b5278',
            borderRadius: '18px 18px 4px 18px',
            padding: '14px 22px',
            fontFamily: FONTS.sans, fontSize: 20, color: COLORS.text,
          }}>
            <div style={{ fontSize: 13, color: '#7eb8e0', marginBottom: 4, fontWeight: 600 }}>Ken</div>
            {replyText.slice(0, replyChars)}
            {replyChars < replyText.length && (
              <span style={{ opacity: frame % 15 < 8 ? 1 : 0, color: COLORS.accent }}>|</span>
            )}
          </div>
        </div>

        {/* New issue auto-created */}
        <div style={{
          opacity: issueOpacity,
          transform: `scale(${issueScale})`,
          backgroundColor: COLORS.bgPanel,
          borderRadius: 8, padding: '12px 20px',
          border: `1px solid ${COLORS.green}44`,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <CheckCircle size={16} color={COLORS.green} />
          <span style={{ fontFamily: FONTS.sans, fontSize: 15, color: COLORS.text }}>
            #2 feat: Add color picker to Agent form
          </span>
          <span style={{
            fontFamily: FONTS.sans, fontSize: 11, color: COLORS.green,
            backgroundColor: '#1a3a2a', borderRadius: 10, padding: '2px 8px', marginLeft: 'auto',
          }}>
            auto-created
          </span>
        </div>
      </div>

      {/* Loop indicator */}
      <div style={{
        position: 'absolute', right: 120, bottom: 200,
        opacity: loopOpacity,
        transform: `rotate(${loopRotate}deg)`,
      }}>
        <RefreshCw size={48} color={COLORS.accent} />
      </div>

      {/* Caption */}
      <div style={{
        position: 'absolute', bottom: 60, left: 0, right: 0,
        textAlign: 'center', opacity: captionOpacity,
        fontFamily: FONTS.sans, fontSize: 24, color: COLORS.textMuted,
      }}>
        反馈即需求，闭环自动运转
      </div>
    </AbsoluteFill>
  );
};
