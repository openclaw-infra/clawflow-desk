import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { MessageSquare, Bot, CheckCircle, GitCommit, User } from 'lucide-react';
import { COLORS, FONTS } from '../theme';

export const Scene7Review: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const exitOpacity = interpolate(frame, [350, 380], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Code diff area
  const diffOpacity = interpolate(frame, [20, 40], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Review comment appears
  const commentScale = spring({ frame: frame - 80, fps, from: 0.8, to: 1, config: { damping: 14 } });
  const commentOpacity = interpolate(frame, [80, 100], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Claude reply
  const replyOpacity = interpolate(frame, [160, 180], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const replyY = interpolate(frame, [160, 180], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Commit push
  const commitOpacity = interpolate(frame, [220, 240], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Approved badge
  const approvedScale = spring({ frame: frame - 280, fps, from: 0, to: 1, config: { damping: 10, stiffness: 80 } });

  // Caption
  const captionOpacity = interpolate(frame, [300, 320], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center', opacity: enterOpacity * exitOpacity }}>
      <div style={{ width: 850, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Code diff block */}
        <div style={{
          opacity: diffOpacity,
          backgroundColor: COLORS.bgDark, borderRadius: 8,
          border: `1px solid ${COLORS.bgChat}`, overflow: 'hidden',
        }}>
          <div style={{
            padding: '8px 16px', backgroundColor: COLORS.bgPanel,
            fontFamily: FONTS.mono, fontSize: 13, color: COLORS.textMuted,
            borderBottom: `1px solid ${COLORS.bgChat}`,
          }}>
            src/components/forms/AgentForm.tsx
          </div>
          <div style={{ padding: '12px 16px' }}>
            {[
              { num: 15, text: '  const handleSubmit = async () => {', type: 'normal' },
              { num: 16, text: '    await createAgent({ name, cli, provider });', type: 'normal' },
              { num: 17, text: '    // TODO: validate workDir path', type: 'remove' },
              { num: 17, text: '    if (!validatePath(workDir)) return;', type: 'add' },
              { num: 18, text: '  };', type: 'normal' },
            ].map((line, i) => (
              <div key={i} style={{
                display: 'flex', fontFamily: FONTS.mono, fontSize: 13, lineHeight: 1.8,
                backgroundColor: line.type === 'add' ? '#1a3a2a' : line.type === 'remove' ? '#3a1a1a' : 'transparent',
                padding: '0 8px',
              }}>
                <span style={{ width: 40, color: COLORS.textDim, textAlign: 'right', marginRight: 12 }}>{line.num}</span>
                <span style={{
                  color: line.type === 'add' ? COLORS.green : line.type === 'remove' ? COLORS.red : COLORS.text,
                }}>
                  {line.type === 'add' ? '+ ' : line.type === 'remove' ? '- ' : '  '}{line.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviewer comment */}
        <div style={{
          opacity: commentOpacity,
          transform: `scale(${commentScale})`,
          backgroundColor: COLORS.bgPanel, borderRadius: 8,
          border: `1px solid ${COLORS.bgChat}`, padding: 20,
          borderLeft: `3px solid ${COLORS.accent}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              backgroundColor: COLORS.bgChat,
              display: 'flex', justifyContent: 'center', alignItems: 'center',
            }}>
              <User size={16} color={COLORS.textMuted} />
            </div>
            <span style={{ fontFamily: FONTS.sans, fontSize: 14, fontWeight: 600, color: COLORS.text }}>@reviewer</span>
            <MessageSquare size={14} color={COLORS.textMuted} />
          </div>
          <div style={{ fontFamily: FONTS.sans, fontSize: 16, color: COLORS.text, lineHeight: 1.6 }}>
            这个表单缺少 workDir 的路径校验
          </div>
        </div>

        {/* Claude auto-reply */}
        <div style={{
          opacity: replyOpacity,
          transform: `translateY(${replyY}px)`,
          backgroundColor: COLORS.bgPanel, borderRadius: 8,
          border: `1px solid ${COLORS.bgChat}`, padding: 20,
          borderLeft: `3px solid ${COLORS.orange}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              backgroundColor: COLORS.orange,
              display: 'flex', justifyContent: 'center', alignItems: 'center',
            }}>
              <Bot size={16} color={COLORS.white} />
            </div>
            <span style={{ fontFamily: FONTS.sans, fontSize: 14, fontWeight: 600, color: COLORS.orange }}>Claude</span>
            <span style={{
              fontFamily: FONTS.sans, fontSize: 10, color: COLORS.white,
              backgroundColor: COLORS.accent, borderRadius: 3, padding: '1px 5px',
            }}>BOT</span>
          </div>
          <div style={{ fontFamily: FONTS.sans, fontSize: 16, color: COLORS.text, lineHeight: 1.6 }}>
            Addressed in commit <span style={{ fontFamily: FONTS.mono, color: COLORS.accent }}>abc123f</span> —
            添加了 workDir 路径校验，支持 ~ 展开和绝对路径检查
          </div>
        </div>

        {/* Commit indicator */}
        <div style={{
          opacity: commitOpacity,
          display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: FONTS.mono, fontSize: 13, color: COLORS.green,
          padding: '0 20px',
        }}>
          <GitCommit size={14} />
          abc123f pushed to fix/issue-1
        </div>

        {/* Approved badge */}
        <div style={{
          transform: `scale(${approvedScale})`,
          alignSelf: 'center',
          display: 'flex', alignItems: 'center', gap: 10,
          backgroundColor: '#1a3a2a', borderRadius: 8, padding: '12px 24px',
          border: `1px solid ${COLORS.green}44`,
        }}>
          <CheckCircle size={22} color={COLORS.green} />
          <span style={{ fontFamily: FONTS.sans, fontSize: 18, fontWeight: 700, color: COLORS.green }}>
            Approved
          </span>
        </div>
      </div>

      {/* Caption */}
      <div style={{
        position: 'absolute', bottom: 60, left: 0, right: 0,
        textAlign: 'center', opacity: captionOpacity,
        fontFamily: FONTS.sans, fontSize: 24, color: COLORS.textMuted,
      }}>
        Review 评论自动处理，推送修复，直到通过
      </div>
    </AbsoluteFill>
  );
};
