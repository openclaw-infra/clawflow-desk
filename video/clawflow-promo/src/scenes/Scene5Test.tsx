import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { CheckCircle, Terminal } from 'lucide-react';
import { COLORS, FONTS } from '../theme';

const testLines = [
  '✓ Agent Instance CRUD > saves and retrieves agent [8ms]',
  '✓ Agent Instance CRUD > updates existing agent [11ms]',
  '✓ Agent Instance CRUD > deletes agent correctly [5ms]',
  '✓ buildAgentEnv > claude env with API key only [6ms]',
  '✓ buildAgentEnv > different providers produce different envs [6ms]',
  '✓ AgentForm > renders all form fields [12ms]',
  '✓ AgentForm > validates required fields [9ms]',
  '✓ AgentForm > submits with correct data [14ms]',
  '✓ Sidebar > shows agent list [7ms]',
  '✓ Sidebar > navigates to agent detail [10ms]',
  '✓ Store > persists agent instances [8ms]',
  '✓ Store > handles concurrent updates [13ms]',
  '✓ CLI detection > finds claude binary [4ms]',
  '✓ CLI detection > finds codex binary [5ms]',
  '✓ Provider config > validates API keys [6ms]',
  '✓ Provider config > handles missing keys [3ms]',
];

export const Scene5Test: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const exitOpacity = interpolate(frame, [290, 320], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Terminal window scale in
  const termScale = spring({ frame: frame - 10, fps, from: 0.9, to: 1, config: { damping: 15 } });

  // Header line
  const headerOpacity = interpolate(frame, [20, 35], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Test lines scroll speed
  const visibleLines = Math.floor(interpolate(frame, [40, 200], [0, testLines.length], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));

  // Final summary
  const summaryOpacity = interpolate(frame, [210, 230], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Counter animation
  const countValue = Math.floor(interpolate(frame, [210, 260], [0, 129], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));

  // Big badge
  const badgeScale = spring({ frame: frame - 250, fps, from: 0, to: 1, config: { damping: 10, stiffness: 80 } });

  // Caption
  const captionOpacity = interpolate(frame, [260, 280], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center', opacity: enterOpacity * exitOpacity }}>
      {/* Terminal window */}
      <div style={{
        width: 900, backgroundColor: COLORS.bgDark,
        borderRadius: 12, overflow: 'hidden',
        border: `1px solid ${COLORS.bgChat}`,
        transform: `scale(${termScale})`,
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}>
        {/* Title bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '12px 16px', backgroundColor: COLORS.bgPanel,
        }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: COLORS.red }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: COLORS.yellow }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: COLORS.green }} />
          <Terminal size={14} color={COLORS.textMuted} style={{ marginLeft: 8 }} />
          <span style={{ fontFamily: FONTS.mono, fontSize: 13, color: COLORS.textMuted }}>bun test</span>
        </div>

        {/* Content */}
        <div style={{ padding: '16px 20px', maxHeight: 500, overflow: 'hidden' }}>
          {/* Header */}
          <div style={{
            opacity: headerOpacity,
            fontFamily: FONTS.mono, fontSize: 14, color: COLORS.textMuted, marginBottom: 12,
          }}>
            bun test v1.3.9
          </div>

          {/* Test lines */}
          {testLines.slice(0, visibleLines).map((line, i) => (
            <div key={i} style={{
              fontFamily: FONTS.mono, fontSize: 13,
              color: COLORS.green, lineHeight: 1.8,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <CheckCircle size={12} color={COLORS.green} />
              <span>{line.slice(2)}</span>
            </div>
          ))}

          {/* Ellipsis for remaining tests */}
          {visibleLines >= testLines.length && (
            <div style={{
              fontFamily: FONTS.mono, fontSize: 13,
              color: COLORS.textDim, lineHeight: 1.8, marginTop: 4,
            }}>
              ... +113 more tests
            </div>
          )}

          {/* Summary line */}
          <div style={{
            opacity: summaryOpacity,
            marginTop: 16, paddingTop: 12,
            borderTop: `1px solid ${COLORS.bgChat}`,
            fontFamily: FONTS.mono, fontSize: 15, color: COLORS.text,
          }}>
            <span style={{ color: COLORS.green, fontWeight: 700 }}>{countValue} pass</span>
            <span style={{ color: COLORS.textMuted }}> | </span>
            <span style={{ color: COLORS.textMuted }}>0 fail</span>
            <span style={{ color: COLORS.textMuted }}> | </span>
            <span style={{ color: COLORS.textMuted }}>217 expect() calls</span>
          </div>
        </div>
      </div>

      {/* Big floating badge */}
      <div style={{
        position: 'absolute', right: 200, top: 180,
        transform: `scale(${badgeScale})`,
        backgroundColor: COLORS.green,
        borderRadius: 16, padding: '16px 32px',
        display: 'flex', alignItems: 'center', gap: 12,
        boxShadow: `0 0 40px ${COLORS.green}44`,
      }}>
        <CheckCircle size={32} color={COLORS.white} />
        <span style={{
          fontFamily: FONTS.sans, fontSize: 28, fontWeight: 800, color: COLORS.white,
        }}>
          129 pass
        </span>
      </div>

      {/* Caption */}
      <div style={{
        position: 'absolute', bottom: 60, left: 0, right: 0,
        textAlign: 'center', opacity: captionOpacity,
        fontFamily: FONTS.sans, fontSize: 24, color: COLORS.textMuted,
      }}>
        自动运行测试套件，129 个测试全部通过
      </div>
    </AbsoluteFill>
  );
};
