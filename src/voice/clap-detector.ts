/**
 * Starlight Voice — Acoustic Double-Clap & Peak Detector
 *
 * Uses WebAudio API to monitor acoustic amplitude spikes.
 * Triggers callback when two transient peaks (>threshold) occur within windowMs (300-600ms).
 */

export interface ClapDetectorOptions {
  threshold?: number;   // Peak amplitude threshold (0.0 to 1.0)
  minIntervalMs?: number; // Minimum spacing between claps (e.g. 150ms)
  maxIntervalMs?: number; // Maximum window for double-clap (e.g. 600ms)
  onDoubleClap?: () => void;
}

export class DoubleClapDetector {
  private threshold: number;
  private minIntervalMs: number;
  private maxIntervalMs: number;
  private onDoubleClap?: () => void;
  private lastClapTime: number = 0;
  private audioCtx?: AudioContext;
  private analyser?: AnalyserNode;
  private isListening: boolean = false;

  constructor(options: ClapDetectorOptions = {}) {
    this.threshold = options.threshold ?? 0.35;
    this.minIntervalMs = options.minIntervalMs ?? 120;
    this.maxIntervalMs = options.maxIntervalMs ?? 650;
    this.onDoubleClap = options.onDoubleClap;
  }

  public async start(): Promise<boolean> {
    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtx();
      const source = this.audioCtx.createMediaStreamSource(stream);
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 512;
      source.connect(this.analyser);

      this.isListening = true;
      this.processAudio();
      return true;
    } catch {
      return false;
    }
  }

  private processAudio = () => {
    if (!this.isListening || !this.analyser) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteTimeDomainData(dataArray);

    let maxVal = 0;
    for (let i = 0; i < bufferLength; i++) {
      const normalized = Math.abs((dataArray[i] - 128) / 128);
      if (normalized > maxVal) maxVal = normalized;
    }

    if (maxVal > this.threshold) {
      const now = Date.now();
      const delta = now - this.lastClapTime;

      if (delta >= this.minIntervalMs && delta <= this.maxIntervalMs) {
        if (this.onDoubleClap) this.onDoubleClap();
        this.lastClapTime = 0; // Reset
      } else {
        this.lastClapTime = now;
      }
    }

    requestAnimationFrame(this.processAudio);
  };

  public stop() {
    this.isListening = false;
    if (this.audioCtx) {
      this.audioCtx.close();
    }
  }
}
