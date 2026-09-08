import React from 'react';
import {Composition} from 'remotion';
import {CanIBeHonest, type VideoMode} from './CanIBeHonest';
import {CanIBeHonestCinematic} from './CanIBeHonestCinematic';

const duration = Math.ceil(232.239979 * 30);

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="CanIBeHonest-CinematicV2"
      component={CanIBeHonestCinematic}
      durationInFrames={30 * 30}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="CanIBeHonest-Teaser"
      component={CanIBeHonest}
      durationInFrames={30 * 30}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{mode: 'teaser' satisfies VideoMode}}
    />
    <Composition
      id="CanIBeHonest-Canvas"
      component={CanIBeHonest}
      durationInFrames={8 * 30}
      fps={30}
      width={720}
      height={1280}
      defaultProps={{mode: 'canvas' satisfies VideoMode}}
    />
    <Composition
      id="CanIBeHonest-FullVisualizer"
      component={CanIBeHonest}
      durationInFrames={duration}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{mode: 'full' satisfies VideoMode}}
    />
  </>
);
