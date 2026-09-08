import React from 'react';
import {Audio} from '@remotion/media';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

export type VideoMode = 'teaser' | 'canvas' | 'full';

type Props = {mode: VideoMode};

const palette = {
  void: '#09090A',
  charcoal: '#171719',
  cream: '#E8E1D5',
  gold: '#C9A876',
  ember: '#744A38',
};

const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity: 0.08, mixBlendMode: 'screen'}}>
      {Array.from({length: 120}, (_, index) => {
        const x = random(`x-${index}-${Math.floor(frame / 3)}`) * 100;
        const y = random(`y-${index}-${Math.floor(frame / 3)}`) * 100;
        const size = 1 + random(`s-${index}`) * 2;
        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: `${x}%`,
              top: `${y}%`,
              width: size,
              height: size,
              backgroundColor: palette.cream,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const ConfessionDoor: React.FC<{cycle: number}> = ({cycle}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const local = frame % cycle;
  const opening = interpolate(local, [0, cycle * 0.42, cycle * 0.72, cycle], [0.08, 0.5, 0.62, 0.08], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const slit = width * opening;
  const panelWidth = (width - slit) / 2;
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: width / 2 - slit / 2,
          top: height * 0.08,
          width: slit,
          height: height * 0.84,
          background: `linear-gradient(180deg, ${palette.gold}18, ${palette.ember}88 56%, ${palette.gold}20)`,
          boxShadow: `0 0 ${Math.round(width * 0.16)}px ${palette.gold}35`,
        }}
      />
      <div style={{position: 'absolute', inset: 0, right: 'auto', width: panelWidth, backgroundColor: palette.charcoal}} />
      <div style={{position: 'absolute', inset: 0, left: 'auto', width: panelWidth, backgroundColor: palette.charcoal}} />
    </AbsoluteFill>
  );
};

const Message: React.FC<{from: number; to: number; children: React.ReactNode; compact?: boolean}> = ({
  from,
  to,
  children,
  compact = false,
}) => {
  const frame = useCurrentFrame();
  const {fps, width} = useVideoConfig();
  const opacity = interpolate(frame, [from, from + fps * 0.65, to - fps * 0.65, to], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const translate = interpolate(frame, [from, from + fps * 0.65], [28, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', padding: width * 0.08}}>
      <div style={{opacity, translate: `0 ${translate}px`, textAlign: 'center'}}>
        <div
          style={{
            color: palette.cream,
            fontFamily: 'Georgia, serif',
            fontSize: compact ? width * 0.09 : width * 0.115,
            fontWeight: 400,
            letterSpacing: '-0.05em',
            lineHeight: 0.92,
            textShadow: '0 3px 24px #000',
          }}
        >
          {children}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const TeaserCopy: React.FC<{mode: VideoMode}> = ({mode}) => {
  const {fps} = useVideoConfig();
  if (mode === 'full') {
    return (
      <Message from={fps * 0.4} to={fps * 9} compact>
        CAN I BE<br />HONEST?
      </Message>
    );
  }
  return (
    <>
      <Message from={0} to={fps * 9}>CAN I BE<br />HONEST?</Message>
      <Message from={fps * 12.8} to={fps * 18}>HOLD ME<br />RIGHT HERE</Message>
      <Message from={fps * 18} to={fps * 24}>DON'T LET IT<br />FADE AWAY</Message>
      <Message from={fps * 24} to={fps * 30}>I WANT YOU<br />TO STAY</Message>
    </>
  );
};

export const CanIBeHonest: React.FC<Props> = ({mode}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const cycle = mode === 'canvas' ? 8 * fps : 10 * fps;
  const breathing = interpolate(Math.sin((frame / cycle) * Math.PI * 2), [-1, 1], [0.96, 1.025]);
  return (
    <AbsoluteFill style={{backgroundColor: palette.void, overflow: 'hidden'}}>
      <AbsoluteFill style={{scale: breathing}}>
        <ConfessionDoor cycle={cycle} />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.42), transparent 30%, transparent 70%, rgba(0,0,0,0.6))',
        }}
      />
      <Grain />
      {mode !== 'canvas' ? <TeaserCopy mode={mode} /> : null}
      {mode === 'teaser' ? (
        <Audio src={staticFile('song.mp3')} trimBefore={Math.round(60.1 * fps)} trimAfter={Math.round(90.1 * fps)} />
      ) : null}
      {mode === 'full' ? <Audio src={staticFile('song.mp3')} /> : null}
    </AbsoluteFill>
  );
};
