import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { GitMerge, Rocket, Package, Monitor, Globe } from 'lucide-react';
import { COLORS, FONTS } from '../theme';

const platforms = [
  { name: 'macOS arm64', size: '61 MB', delay: 140 },
  { name: 'macOS x64', size: '61 MB', delay: 160 },
  { name: 'Linux x64', size: '111 MB', delay: 180 },
  { name: 'Windows x64', size: '114 MB', delay: 200 },
];

export const Scene8Deploy: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const exitOpacity = interpolate(frame, [290, 320], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Merge animation
  const mergeScale = spring({ frame: frame - 20, fps, from: 0, to: 1, config: { damping: 12 } });
  const mergeOpacity = interpolate(frame, [20, 40, 80, 100], [0, 1, 1, 0.3], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Release tag
  const tagScale = spring({ frame: frame - 100, fps, from: 0, to: 1, config: { damping: 10, stiffness: 80 } });

  // Website update
  const webOpacity = interpolate(frame, [240, 260], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const webScale = spring({ frame: frame - 240, fps, from: 0.9, to: 1, config: { damping: 14 } });

  // Caption
  const captionOpacity = interpolate(frame, [270, 290], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center', opacity: enterOpacity * exitOpacity }}>
      {/* Merge indicator */}
      <div style={{
        position: 'absolute', top: 100,
        opacity: mergeOpacity,
        transform: `scale(${mergeScale})`,
        display: 'flex', alignItems: 'center', gap: 12,
        backgroundColor: '#2a1a3a', borderRadius: 8, padding: '12px 24px',
        border: `1px solid ${COLORS.accent}44`,
      }}>
        <GitMerge size={22} color={COLORS.accent} />
        <span style={{ fontFamily: FONTS.sans, fontSize: 18, fontWeight: 600, color: COLORS.accent }}>
          Merged fix/issue-1 → main
        </span>
      </div>

      {/* Release tag */}
      <div style={{
        position: 'absolute', top: 180,
        transform: `scale(${tagScale})`,
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <Rocket size={28} color={COLORS.orange} />
        <div>
          <div style={{ fontFamily: FONTS.sans, fontSize: 32, fontWeight: 800, color: COLORS.text }}>
            v0.2.0 Released
          </div>
          <div style={{ fontFamily: FONTS.sans, fontSize: 14, color: COLORS.textMuted, marginTop: 4 }}>
            GitHub Actions • Release workflow triggered
          </div>
        </div>
      </div>

      {/* Platform packages */}
      <div style={{
        display: 'flex', gap: 20, flexWrap: 'wrap',
        justifyContent: 'center', maxWidth: 800,
      }}>
        {platforms.map((p, i) => {
          const pScale = spring({ frame: frame - p.delay, fps, from: 0, to: 1, config: { damping: 12 } });
          const pOpacity = interpolate(frame, [p.delay, p.delay + 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          return (
            <div key={i} style={{
              transform: `scale(${pScale})`,
              opacity: pOpacity,
              backgroundColor: COLORS.bgPanel,
              border: `1px solid ${COLORS.bgChat}`,
              borderRadius: 12, padding: '20px 28px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
              minWidth: 170,
            }}>
              <Package size={28} color={COLORS.green} />
              <div style={{ fontFamily: FONTS.sans, fontSize: 15, fontWeight: 600, color: COLORS.text, textAlign: 'center' }}>
                {p.name}
              </div>
              <div style={{ fontFamily: FONTS.mono, fontSize: 13, color: COLORS.textMuted }}>
                {p.size}
              </div>
            </div>
          );
        })}
      </div>

      {/* Website auto-update */}
      <div style={{
        position: 'absolute', bottom: 120,
        opacity: webOpacity,
        transform: `scale(${webScale})`,
        display: 'flex', alignItems: 'center', gap: 12,
        backgroundColor: COLORS.bgPanel, borderRadius: 8, padding: '12px 24px',
        border: `1px solid ${COLORS.green}44`,
      }}>
        <Globe size={18} color={COLORS.green} />
        <span style={{ fontFamily: FONTS.sans, fontSize: 16, color: COLORS.text }}>
          官网自动更新 — GitHub Pages deployed
        </span>
      </div>

      {/* Caption */}
      <div style={{
        position: 'absolute', bottom: 50, left: 0, right: 0,
        textAlign: 'center', opacity: captionOpacity,
        fontFamily: FONTS.sans, fontSize: 24, color: COLORS.textMuted,
      }}>
        合并即发布，4 平台同时构建，官网自动更新
      </div>
    </AbsoluteFill>
  );
};
