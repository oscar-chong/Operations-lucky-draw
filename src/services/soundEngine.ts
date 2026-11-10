/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Procedural Audio Engine using browser Web Audio API
// Guarantees zero-network-dependency, instant, visceral sound effects

class SuspenseSoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private riserOsc: OscillatorNode | null = null;
  private riserGain: GainNode | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.riserOsc) {
      this.stopSuspenseRiser();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Deep cinematic human heartbeat (lub-dub)
   */
  public playHeartbeat(strength = 1.0) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    
    // Lub (First thud)
    this.createThump(now, 58, 0.16, 0.45 * strength);
    // Dub (Second heavier thud)
    this.createThump(now + 0.13, 50, 0.22, 0.7 * strength);
  }

  private createThump(time: number, startFreq: number, duration: number, gainVal: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(32, time + duration);

    gain.gain.setValueAtTime(gainVal, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + duration);
  }

  /**
   * Crisp golden slot tick during fast spinning
   */
  public playSlotTick(pitchModifier = 1.0) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520 * pitchModifier, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.04);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200 * pitchModifier, now);
    filter.Q.setValueAtTime(3.0, now);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  /**
   * Dramatic, heavy bass impact when deceleration reaches a near-miss candidate
   */
  public playNearMissThud(stepIndex = 1) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    
    // Sub bass drop
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const baseFreq = 75 - stepIndex * 8; // Gets lower and heavier each step
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(28, now + 0.5);

    gain.gain.setValueAtTime(0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.5);

    // Metallic chime resonance
    const chime = this.ctx.createOscillator();
    const chimeGain = this.ctx.createGain();
    chime.type = 'sine';
    chime.frequency.setValueAtTime(440 * (1 + stepIndex * 0.25), now);
    chimeGain.gain.setValueAtTime(0.15, now);
    chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

    chime.connect(chimeGain);
    chimeGain.connect(this.ctx.destination);

    chime.start(now);
    chime.stop(now + 0.4);
  }

  /**
   * Ascending cinematic tension riser
   */
  public startSuspenseRiser() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    this.stopSuspenseRiser();

    const now = this.ctx.currentTime;
    this.riserOsc = this.ctx.createOscillator();
    this.riserGain = this.ctx.createGain();

    this.riserOsc.type = 'sawtooth';
    this.riserOsc.frequency.setValueAtTime(80, now);
    this.riserOsc.frequency.exponentialRampToValueAtTime(480, now + 3.5);

    // Lowpass filter to keep it dark and menacing
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(260, now);
    filter.frequency.exponentialRampToValueAtTime(1400, now + 3.5);

    this.riserGain.gain.setValueAtTime(0.01, now);
    this.riserGain.gain.linearRampToValueAtTime(0.25, now + 3.0);

    this.riserOsc.connect(filter);
    filter.connect(this.riserGain);
    this.riserGain.connect(this.ctx.destination);

    this.riserOsc.start(now);
  }

  public stopSuspenseRiser() {
    if (this.riserOsc) {
      try {
        this.riserOsc.stop();
        this.riserOsc.disconnect();
      } catch {
        // ignore
      }
      this.riserOsc = null;
      this.riserGain = null;
    }
  }

  /**
   * Grand celebratory victory fanfare on reveal
   */
  public playGrandFanfare() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Victory chord progression: C4, G4, C5, E5, G5, C6
    const chord = [261.63, 392.00, 523.25, 659.25, 783.99, 1046.50];

    chord.forEach((freq, index) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = index % 2 === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.05);

      gain.gain.setValueAtTime(0, now);
      gain.gain.setValueAtTime(0.28, now + index * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8 + index * 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + index * 0.05);
      osc.stop(now + 2.2);
    });

    // Sub bass boom for the explosion
    this.createThump(now, 110, 0.8, 0.9);

    // Sparkle chimes
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        if (!this.ctx || this.isMuted) return;
        const chimeOsc = this.ctx.createOscillator();
        const chimeGain = this.ctx.createGain();
        chimeOsc.type = 'sine';
        chimeOsc.frequency.setValueAtTime(800 + Math.random() * 1200, this.ctx.currentTime);
        chimeGain.gain.setValueAtTime(0.12, this.ctx.currentTime);
        chimeGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.3);
        chimeOsc.connect(chimeGain);
        chimeGain.connect(this.ctx.destination);
        chimeOsc.start();
        chimeOsc.stop(this.ctx.currentTime + 0.3);
      }, 350 + i * 110);
    }
  }

  /**
   * Sound for UI clicks
   */
  public playButtonPress() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(680, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.06);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  }
}

export const soundEngine = new SuspenseSoundEngine();
