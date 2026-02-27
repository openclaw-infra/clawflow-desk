import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { GitPullRequest, GitBranch, CheckCircle, Monitor, Apple, Container } from 'lucide-react';
import { COLORS, FONTS } from '../theme';

const ciChecks = [
  { name: 'Test', icon: 'test', delay: 140 },
  { name: 'Build (macOS arm64)', icon: 'apple', delay: 170 },
  { name: 'Build (macOS x64)', icon: 'apple', delay: 200 },
  { name: 'Build (Linux x64)', icon: 'linux', delay: 230 },
  { name: 'Build (Windows x64)', icon: 'win', delay: 260 },
];

export const Scene6PR: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const exitOpacity = interpolate(frame, [350, 380], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Branch animation
  const branchOpacity = interpolate(frame, [20, 40], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const branchWidth = interpolate(frame, [20, 60], [0, 300], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // PR card
  const prScale = spring({ frame: frame - 70, fps, from: 0.8, to: 1, config: { damping: 14 } });
  const prOpacity = interpolate(frame, [70, 90], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Caption
  const captionOpacity = interpolate(frame, [300, 320], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center', opacity: enterOpacity * exitOpacity }}>
      {/* Branch visualization */}
      <div style={{
        position: 'absolute', top: 120, left: 200,
        opacity: branchOpacity,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          backgroundColor: COLORS.bgPanel, borderRadius: 20, padding: '6px 14px',
          fontFamily: FONTS.mono, fontSize: 14, color: COLORS.text,
        }}>
          <GitBranch size={14} color={COLORS.textMuted} />
          main
        </div>
        <div style={{
          width: branchWidth, height: 2, backgroundColor: COLORS.accent,
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute', right: -8, top: -4,
            width: 10, height: 10, borderRadius: '50%',
            backgroundColor: COLORS.accent,
          }} />
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          backgroundColor: COLORS.bgPanel, borderRadius: 20, padding: '6px 14px',
          fontFamily: FONTS.mono, fontSize: 14, color: COLORS.accent,
          opacity: interpolate(frame, [50, 65], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        }}>
          <GitBranch size={14} color={COLORS.accent} />
          fix/issue-1
        </div>
      </div>

      {/* PR Card */}
      <div style={{
        transform: `scale(${prScale})`,
        opacity: prOpacity,
        backgroundColor: COLORS.bgPanel,
        border: `1px solid ${COLORS.bgChat}`,
        borderRadius: 12,
        padding: 36,
        width: 700,
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
      }}>
        {/* PR header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <GitPullRequest size={28} color={COLORS.green} />
          <div>
            <div style={{
              fontFamily: FONTS.sans, fontSize: 22, fontWeight: 700, color: COLORS.text,
            }}>
              fix: Add Agent Instance creation form UI
            </div>
            <div style={{
              fontFamily: FONTS.sans, fontSize: 14, color: COLORS.textMuted, marginTop: 4,
            }}>
              #4 opened by claude-bot • fix/issue-1 → main
            </div>
          </div>
        </div>

        {/* Separator */}
        <div style={{ height: 1, backgroundColor: COLORS.bgChat, margin: '16px 0' }} />

        {/* CI Checks */}
        <div style={{
          fontFamily: FONTS.sans, fontSize: 14, fontWeight: 600,
          color: COLORS.textMuted, marginBottom: 12, textTransform: 'uppercase',
          letterSpacing: 1,
        }}>
          CI Checks
        </div>

        {ciChecks.map((check, i) => {
          const checkProgress = interpolate(frame, [check.delay, check.delay + 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const spinning = frame >= check.delay - 20 && frame < check.delay;
          const spinAngle = frame * 12;

          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '8px 0',
              opacity: interpolate(frame, [check.delay - 30, check.delay - 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
            }}>
              {checkProgress >= 1 ? (
                <CheckCircle size={18} color={COLORS.green} />
              ) : spinning ? (
                <div style={{ transform: `rotate(${spinAngle}deg)`, width: 18, height: 18 }}>
                  <Container size={18} color={COLORS.yellow} />
                </div>
              ) : (
                <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${COLORS.textDim}` }} />
              )}
              <span style={{
                fontFamily: FONTS.sans, fontSize: 15,
                color: checkProgress >= 1 ? COLORS.green : COLORS.textMuted,
              }}>
                {check.name}
              </span>
              {checkProgress >= 1 && (
                <span style={{ fontFamily: FONTS.sans, fontSize: 12, color: COLORS.textDim, marginLeft: 'auto' }}>
                  passed
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Caption */}
      <div style={{
        position: 'absolute', bottom: 60, left: 0, right: 0,
        textAlign: 'center', opacity: captionOpacity,
        fontFamily: FONTS.sans, fontSize: 24, color: COLORS.textMuted,
      }}>
        自动开 PR，4 平台 CI 全绿
      </div>
    </AbsoluteFill>
  );
};
