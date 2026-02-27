import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { MessageCircle, FileText, Bot, Code, TestTube, GitPullRequest, CheckCircle, Rocket, ArrowRight } from 'lucide-react';
import { COLORS, FONTS } from '../theme';

const nodes = [
  { icon: MessageCircle, label: '需求', sub: 'Telegram', color: '#2b5278' },
  { icon: FileText, label: 'Issue', sub: 'GitHub', color: COLORS.accent },
  { icon: Bot, label: 'AI 编码', sub: 'Claude Code', color: COLORS.orange },
  { icon: TestTube, label: '自动测试', sub: 'bun test', color: COLORS.green },
  { icon: GitPullRequest, label: 'PR + Review', sub: 'Auto-fix', color: COLORS.accent },
  { icon: CheckCircle, label: 'CI/CD', sub: 'GitHub Actions', color: COLORS.green },
  { icon: Rocket, label: '发布', sub: '4 platforms', color: COLORS.orange },
  { icon: MessageCircle, label: '反馈', sub: 'Telegram', color: '#2b5278' },
];

export const Scene10Overview: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const exitOpacity = interpolate(frame, [290, 320], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Title
  const titleOpacity = interpolate(frame, [10, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Flow line progress
  const flowProgress = interpolate(frame, [40, 220], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Loop connection (bottom line connecting last to first)
  const loopOpacity = interpolate(frame, [220, 250], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Pulse animation for active node
  const activeNode = Math.floor(flowProgress * nodes.length);

  // Caption
  const captionOpacity = interpolate(frame, [250, 270], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Layout: 4 nodes on top row, 4 on bottom row (reversed), forming a loop
  const topNodes = nodes.slice(0, 4);
  const bottomNodes = nodes.slice(4).reverse();

  const nodeWidth = 180;
  const nodeGap = 40;
  const totalWidth = nodeWidth * 4 + nodeGap * 3;
  const startX = (1920 - totalWidth) / 2;
  const topY = 280;
  const bottomY = 600;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, opacity: enterOpacity * exitOpacity }}>
      {/* Title */}
      <div style={{
        position: 'absolute', top: 80, left: 0, right: 0,
        textAlign: 'center', opacity: titleOpacity,
        fontFamily: FONTS.sans, fontSize: 36, fontWeight: 800, color: COLORS.text,
      }}>
        全链路 AI 自动化
      </div>

      {/* Top row nodes */}
      {topNodes.map((node, i) => {
        const nodeIndex = i;
        const nodeDelay = 40 + nodeIndex * 25;
        const nodeScale = spring({ frame: frame - nodeDelay, fps, from: 0, to: 1, config: { damping: 12 } });
        const isActive = activeNode === nodeIndex;
        const isPast = activeNode > nodeIndex;
        const Icon = node.icon;
        const x = startX + i * (nodeWidth + nodeGap);

        return (
          <div key={i}>
            {/* Node */}
            <div style={{
              position: 'absolute', left: x, top: topY,
              width: nodeWidth,
              transform: `scale(${nodeScale})`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: 16,
                backgroundColor: isPast || isActive ? node.color : COLORS.bgPanel,
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                boxShadow: isActive ? `0 0 20px ${node.color}66` : 'none',
                transition: 'all 0.3s',
              }}>
                <Icon size={28} color={isPast || isActive ? COLORS.white : COLORS.textDim} />
              </div>
              <div style={{ fontFamily: FONTS.sans, fontSize: 16, fontWeight: 600, color: COLORS.text, textAlign: 'center' }}>
                {node.label}
              </div>
              <div style={{ fontFamily: FONTS.sans, fontSize: 12, color: COLORS.textMuted, textAlign: 'center' }}>
                {node.sub}
              </div>
            </div>

            {/* Arrow to next (top row) */}
            {i < 3 && (
              <div style={{
                position: 'absolute',
                left: x + nodeWidth,
                top: topY + 20,
                width: nodeGap,
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                opacity: interpolate(frame, [nodeDelay + 15, nodeDelay + 25], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
              }}>
                <ArrowRight size={20} color={COLORS.accent} />
              </div>
            )}
          </div>
        );
      })}

      {/* Right side down arrow */}
      <div style={{
        position: 'absolute',
        left: startX + 3 * (nodeWidth + nodeGap) + nodeWidth / 2 - 10,
        top: topY + 110,
        opacity: interpolate(frame, [140, 155], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        transform: 'rotate(90deg)',
      }}>
        <ArrowRight size={20} color={COLORS.accent} />
      </div>

      {/* Bottom row nodes (reversed order, right to left) */}
      {bottomNodes.map((node, i) => {
        const nodeIndex = 7 - i;
        const nodeDelay = 40 + nodeIndex * 25;
        const nodeScale = spring({ frame: frame - nodeDelay, fps, from: 0, to: 1, config: { damping: 12 } });
        const isActive = activeNode === nodeIndex;
        const isPast = activeNode > nodeIndex;
        const Icon = node.icon;
        const x = startX + (3 - i) * (nodeWidth + nodeGap);

        return (
          <div key={i + 4}>
            <div style={{
              position: 'absolute', left: x, top: bottomY,
              width: nodeWidth,
              transform: `scale(${nodeScale})`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: 16,
                backgroundColor: isPast || isActive ? node.color : COLORS.bgPanel,
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                boxShadow: isActive ? `0 0 20px ${node.color}66` : 'none',
              }}>
                <Icon size={28} color={isPast || isActive ? COLORS.white : COLORS.textDim} />
              </div>
              <div style={{ fontFamily: FONTS.sans, fontSize: 16, fontWeight: 600, color: COLORS.text, textAlign: 'center' }}>
                {node.label}
              </div>
              <div style={{ fontFamily: FONTS.sans, fontSize: 12, color: COLORS.textMuted, textAlign: 'center' }}>
                {node.sub}
              </div>
            </div>

            {/* Arrow to next (bottom row, going left) */}
            {i < 3 && (
              <div style={{
                position: 'absolute',
                left: x - nodeGap,
                top: bottomY + 20,
                width: nodeGap,
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                opacity: interpolate(frame, [nodeDelay + 15, nodeDelay + 25], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
                transform: 'rotate(180deg)',
              }}>
                <ArrowRight size={20} color={COLORS.accent} />
              </div>
            )}
          </div>
        );
      })}

      {/* Left side up arrow (loop back) */}
      <div style={{
        position: 'absolute',
        left: startX + nodeWidth / 2 - 10,
        top: bottomY - 50,
        opacity: loopOpacity,
        transform: 'rotate(-90deg)',
      }}>
        <ArrowRight size={20} color={COLORS.accent} />
      </div>

      {/* Subtitle */}
      <div style={{
        position: 'absolute', bottom: 100, left: 0, right: 0,
        textAlign: 'center', opacity: captionOpacity,
        fontFamily: FONTS.sans, fontSize: 20, color: COLORS.textDim,
      }}>
        From idea to production — zero manual intervention
      </div>

      {/* Caption */}
      <div style={{
        position: 'absolute', bottom: 50, left: 0, right: 0,
        textAlign: 'center', opacity: captionOpacity,
        fontFamily: FONTS.sans, fontSize: 24, color: COLORS.textMuted,
      }}>
        全链路 AI 自动化 — 从一句话到四平台发布，零人工干预
      </div>
    </AbsoluteFill>
  );
};
