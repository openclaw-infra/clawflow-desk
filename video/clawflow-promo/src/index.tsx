import { registerRoot, Composition } from 'remotion';
import { ClawFlowPromo } from './ClawFlowPromo';
import { TOTAL_FRAMES, VIDEO } from './theme';

const Root: React.FC = () => {
  return (
    <Composition
      id="ClawFlowPromo"
      component={ClawFlowPromo}
      durationInFrames={TOTAL_FRAMES}
      fps={VIDEO.fps}
      width={VIDEO.width}
      height={VIDEO.height}
    />
  );
};

registerRoot(Root);
