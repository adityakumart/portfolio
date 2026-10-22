import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class BarricadeSoundService {
  private readonly platformId = inject(PLATFORM_ID);
  private audioCtx: AudioContext | null = null;
  private soundEnabled = true;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      } catch {
        this.soundEnabled = false;
      }
    }
  }

  setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
  }

  isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  private ensureAudioContext(): boolean {
    if (!this.soundEnabled || !this.audioCtx) return false;
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return true;
  }

  /**
   * Subtle rolling click sound for dice rolls.
   */
  playDiceRoll(): void {
    if (!this.ensureAudioContext() || !this.audioCtx) return;
    const now = this.audioCtx.currentTime;

    for (let i = 0; i < 4; i++) {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300 + Math.random() * 200, now + i * 0.08);

      gain.gain.setValueAtTime(0.12, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.05);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.05);
    }
  }

  /**
   * Crisp token step / placement sound.
   */
  playTokenMove(): void {
    if (!this.ensureAudioContext() || !this.audioCtx) return;
    const now = this.audioCtx.currentTime;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.08);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  /**
   * Alert tone when a barricade obstacle is captured.
   */
  playBarricadeCapture(): void {
    if (!this.ensureAudioContext() || !this.audioCtx) return;
    const now = this.audioCtx.currentTime;

    [523.25, 659.25, 783.99].forEach((freq, idx) => {
      const osc = this.audioCtx!.createOscillator();
      const gain = this.audioCtx!.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);

      gain.gain.setValueAtTime(0.1, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.12);

      osc.connect(gain);
      gain.connect(this.audioCtx!.destination);

      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.12);
    });
  }

  /**
   * Punchy hit sound when an opponent token is knocked out.
   */
  playKnockout(): void {
    if (!this.ensureAudioContext() || !this.audioCtx) return;
    const now = this.audioCtx.currentTime;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.18);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  /**
   * Triumphant fanfare chord when claiming summit castle victory.
   */
  playWinFanfare(): void {
    if (!this.ensureAudioContext() || !this.audioCtx) return;
    const now = this.audioCtx.currentTime;

    // C major triad ascending fanfare: C5, E5, G5, C6
    const chord = [523.25, 659.25, 783.99, 1046.5];
    chord.forEach((freq, idx) => {
      const osc = this.audioCtx!.createOscillator();
      const gain = this.audioCtx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0.22, now + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.4);

      osc.connect(gain);
      gain.connect(this.audioCtx!.destination);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.4);
    });
  }
}
