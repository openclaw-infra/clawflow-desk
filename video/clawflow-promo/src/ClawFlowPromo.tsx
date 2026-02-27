import { AbsoluteFill, Sequence, useCurrentFrame, interpolate } from 'remotion';
import { COLORS, SCENES, TOTAL_FRAMES } from './theme';
import { Scene1Logo } from './scenes/Scene1Logo';
import { Scene2Request } from './scenes/Scene2Request';
import { Scene3Agent } from './scenes/Scene3Agent';
import { Scene4Coding } from './scenes/Scene4Coding';
import { Scene5Test } from './scenes/Scene5Test';
import { Scene6PR } from './scenes/Scene6PR';
import { Scene7Review } from './scenes/Scene7Review';
import { Scene8Deploy } from './scenes/Scene8Deploy';
import { Scene9Feedback } from './scenes/Scene9Feedback';
import { Scene10Overview } from './scenes/Scene10Overview';
import { Scene11Ending } from './scenes/Scene11Ending';

// Subtle animated background that persists across scenes
const PersistentBackground: React.FC = () => {
  const frame = useCurrentFrame();

  // Slow moving gradient
  const hue = interpolate(frame, [0, TOTAL_FRAMES], [220, 280], { extrapolateRight: 'clamp' });
  const x = interpolate(frame, [0, TOTAL_FRAMES], [0, 100]);
  const y = interpolate(frame, [0, TOTAL_FRAMES], [0, 50]);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      {/* Subtle moving orb */}
      <div style={{
        position: 'absolute',
        width: 600,
        height: 600,
        borderRadius: '50%',
        background: `radial-gradient(circle, hsla(${hue}, 60%, 30%, 0.08) 0%, transparent 70%)`,
        left: `${30 + Math.sin(x * 0.02) * 20}%`,
        top: `${20 + Math.cos(y * 0.03) * 15}%`,
        transform: 'translate(-50%, -50%)',
      }} />
      {/* Second orb */}
      <div style={{
        position: 'absolute',
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: `radial-gradient(circle, hsla(${hue + 40}, 50%, 25%, 0.06) 0%, transparent 70%)`,
        right: `${20 + Math.cos(x * 0.015) * 15}%`,
        bottom: `${25 + Math.sin(y * 0.025) * 10}%`,
        transform: 'translate(50%, 50%)',
      }} />
    </AbsoluteFill>
  );
};

export const ClawFlowPromo: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* Persistent background layer */}
      <PersistentBackground />

      {/* Scene sequences with overlapping transitions */}
      <Sequence from={SCENES.s1_logo.from} durationInFrames={SCENES.s1_logo.duration}>
        <Scene1Logo />
      </Sequence>

      <Sequence from={SCENES.s2_request.from} durationInFrames={SCENES.s2_request.duration}>
        <Scene2Request />
      </Sequence>

      <Sequence from={SCENES.s3_agent.from} durationInFrames={SCENES.s3_agent.duration}>
        <Scene3Agent />
      </Sequence>

      <Sequence from={SCENES.s4_coding.from} durationInFrames={SCENES.s4_coding.duration}>
        <Scene4Coding />
      </Sequence>

      <Sequence from={SCENES.s5_test.from} durationInFrames={SCENES.s5_test.duration}>
        <Scene5Test />
      </Sequence>

      <Sequence from={SCENES.s6_pr.from} durationInFrames={SCENES.s6_pr.duration}>
        <Scene6PR />
      </Sequence>

      <Sequence from={SCENES.s7_review.from} durationInFrames={SCENES.s7_review.duration}>
        <Scene7Review />
      </Sequence>

      <Sequence from={SCENES.s8_deploy.from} durationInFrames={SCENES.s8_deploy.duration}>
        <Scene8Deploy />
      </Sequence>

      <Sequence from={SCENES.s9_feedback.from} durationInFrames={SCENES.s9_feedback.duration}>
        <Scene9Feedback />
      </Sequence>

      <Sequence from={SCENES.s10_overview.from} durationInFrames={SCENES.s10_overview.duration}>
        <Scene10Overview />
      </Sequence>

      <Sequence from={SCENES.s11_ending.from} durationInFrames={SCENES.s11_ending.duration}>
        <Scene11Ending />
      </Sequence>
    </AbsoluteFill>
  );
};
