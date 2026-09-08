import React from 'react';
import {Audio} from '@remotion/media';
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  random,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

type ShotSpec = {
  file: string;
  start: number;
  end: number;
  scaleFrom: number;
  scaleTo: number;
  xFrom: number;
  xTo: number;
  yFrom: number;
  yTo: number;
  focusIn?: boolean;
  handheld?: boolean;
  bloom?: boolean;
};

const shots: ShotSpec[] = [
  {file: 'plate-01-separation.png', start: 0, end: 69, scaleFrom: 1, scaleTo: 1.035, xFrom: 0, xTo: 0, yFrom: 0, yTo: -8},
  {file: 'plate-02-condensation.png', start: 69, end: 216, scaleFrom: 1.1, scaleTo: 1.18, xFrom: 24, xTo: -22, yFrom: 10, yTo: -8, focusIn: true},
  {file: 'plate-03-shadow.png', start: 216, end: 384, scaleFrom: 1.04, scaleTo: 1.12, xFrom: -12, xTo: 20, yFrom: 18, yTo: -18},
  {file: 'plate-04-curtain.png', start: 384, end: 546, scaleFrom: 1.02, scaleTo: 1.075, xFrom: 0, xTo: 0, yFrom: 10, yTo: -10, handheld: true},
  {file: 'plate-05-almost.png', start: 546, end: 732, scaleFrom: 1, scaleTo: 1.09, xFrom: 0, xTo: 0, yFrom: 8, yTo: -14},
  {file: 'plate-06-touch.png', start: 732, end: 900, scaleFrom: 1.02, scaleTo: 1.105, xFrom: 0, xTo: 0, yFrom: 12, yTo: -20, bloom: true},
];

const ease = Easing.bezier(0.22, 0.82, 0.24, 1);

const Shot: React.FC<{spec: ShotSpec; isFirst: boolean; isLast: boolean}> = ({spec, isFirst, isLast}) => {
  const frame = useCurrentFrame();
  const duration = spec.end - spec.start;
  const progress = interpolate(frame, [0, duration - 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });
  const entranceOpacity = isFirst
    ? interpolate(frame, [0, 8], [0, 1], {extrapolateRight: 'clamp'})
    : 1;
  const exitOpacity = isLast
    ? interpolate(frame, [duration - 10, duration - 1], [1, 0], {extrapolateLeft: 'clamp'})
    : 1;
  const edgeOpacity = Math.min(entranceOpacity, exitOpacity);
  const scale = spec.scaleFrom + (spec.scaleTo - spec.scaleFrom) * progress;
  const handheldX = spec.handheld ? Math.sin(frame * 0.19) * 2.4 + Math.sin(frame * 0.053) * 1.4 : 0;
  const handheldY = spec.handheld ? Math.cos(frame * 0.14) * 1.8 : 0;
  const x = spec.xFrom + (spec.xTo - spec.xFrom) * progress + handheldX;
  const y = spec.yFrom + (spec.yTo - spec.yFrom) * progress + handheldY;
  const blur = spec.focusIn
    ? interpolate(frame, [0, 15, 42], [4.5, 1.2, 0], {extrapolateRight: 'clamp'})
    : 0;
  const brightness = spec.bloom
    ? interpolate(frame, [0, duration * 0.55, duration - 1], [0.92, 1.02, 1.12], {extrapolateRight: 'clamp'})
    : 0.98;

  return (
    <AbsoluteFill style={{opacity: edgeOpacity, backgroundColor: '#080808', overflow: 'hidden'}}>
      <Img
        src={staticFile(`plates/${spec.file}`)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          scale,
          translate: `${x}px ${y}px`,
          filter: `blur(${blur}px) brightness(${brightness}) contrast(1.04) saturate(0.88)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,.34), transparent 22%, transparent 70%, rgba(0,0,0,.44))',
        }}
      />
    </AbsoluteFill>
  );
};

const FilmTexture: React.FC = () => {
  const frame = useCurrentFrame();
  const flicker = interpolate(Math.sin(frame * 0.37), [-1, 1], [0.015, 0.045]);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{backgroundColor: '#E8D2AC', opacity: flicker, mixBlendMode: 'soft-light'}} />
      <AbsoluteFill style={{opacity: 0.055, mixBlendMode: 'screen'}}>
        {Array.from({length: 90}, (_, index) => {
          const bucket = Math.floor(frame / 2);
          return (
            <div
              key={index}
              style={{
                position: 'absolute',
                left: `${random(`film-x-${index}-${bucket}`) * 100}%`,
                top: `${random(`film-y-${index}-${bucket}`) * 100}%`,
                width: 1 + random(`film-s-${index}`) * 1.6,
                height: 1 + random(`film-s2-${index}`) * 1.6,
                borderRadius: '50%',
                backgroundColor: '#F8E8CA',
              }}
            />
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Copy: React.FC<{from: number; to: number; children: React.ReactNode; position: 'low' | 'high'}> = ({
  from,
  to,
  children,
  position,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [from, from + 12, to - 16, to], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });
  const y = interpolate(frame, [from, from + 18], [18, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });
  return (
    <AbsoluteFill
      style={{
        justifyContent: position === 'high' ? 'flex-start' : 'flex-end',
        alignItems: 'center',
        padding: position === 'high' ? '190px 92px 0' : '0 92px 220px',
      }}
    >
      <div
        style={{
          opacity,
          translate: `0 ${y}px`,
          color: '#F1E8D9',
          fontFamily: 'Georgia, Times New Roman, serif',
          fontSize: 98,
          lineHeight: 0.94,
          letterSpacing: '-0.045em',
          textAlign: 'center',
          textShadow: '0 4px 28px rgba(0,0,0,.72)',
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};

export const CanIBeHonestCinematic: React.FC = () => {
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{backgroundColor: '#070707'}}>
      {shots.map((spec, index) => (
        <Sequence key={spec.file} from={spec.start} durationInFrames={spec.end - spec.start} premountFor={fps}>
          <Shot spec={spec} isFirst={index === 0} isLast={index === shots.length - 1} />
        </Sequence>
      ))}
      <FilmTexture />
      <Copy from={8} to={63} position="low">CAN I BE<br />HONEST?</Copy>
      <Copy from={786} to={897} position="high">I WANT YOU<br />TO STAY</Copy>
      <Audio src={staticFile('song.mp3')} trimBefore={Math.round(60.1 * fps)} trimAfter={Math.round(90.1 * fps)} />
    </AbsoluteFill>
  );
};
