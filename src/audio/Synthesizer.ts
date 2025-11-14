/**
 * Synthesizer.ts - v4.4.0
 *
 * 🎹 Web Audio synthesizer with:
 * - 3 oscillators (wave, gain, tune, pan)
 * - VCA ADSR envelope
 * - VCF with ADSR + amount
 * - LFO with 13 modulation targets
 * - Anti-click envelope curves
 *
 * Extracted from HarmonyWheel.tsx for clean architecture
 * Can be extracted to separate package later
 */

import { SynthParams, ActiveNote, DEFAULT_SYNTH_PARAMS } from './types';

// Active notes storage (keyed by noteId)
const activeNotes = new Map<string, ActiveNote>();

/**
 * Parse synth parameters from song text
 * Looks for @param directives (e.g., @osc1Wave saw)
 */
export function parseSynthParams(songText: string): SynthParams {
  const params = { ...DEFAULT_SYNTH_PARAMS };

  const lines = songText.split('\n');
  for (const line of lines) {
    const match = line.match(/@(\w+)\s+(.+)/);
    if (!match) continue;

    const [, key, value] = match;
    const trimmedValue = value.trim();

    // Parse based on parameter type
    switch (key) {
      // Oscillator waves
      case 'osc1Wave':
      case 'osc2Wave':
      case 'osc3Wave':
        if (['sine', 'square', 'sawtooth', 'triangle'].includes(trimmedValue)) {
          (params as any)[key] = trimmedValue;
        }
        break;

      // Oscillator gains (0-1)
      case 'osc1Gain':
      case 'osc2Gain':
      case 'osc3Gain':
      case 'vcaS':
      case 'vcfS':
      case 'vcfAmount':
      case 'lfoDepth':
      case 'masterGain':
        (params as any)[key] = Math.max(0, Math.min(1, parseFloat(trimmedValue)));
        break;

      // Oscillator tune (cents)
      case 'osc1Tune':
      case 'osc2Tune':
      case 'osc3Tune':
        (params as any)[key] = Math.max(-1200, Math.min(1200, parseFloat(trimmedValue)));
        break;

      // Oscillator pan (-1 to 1)
      case 'osc1Pan':
      case 'osc2Pan':
      case 'osc3Pan':
        (params as any)[key] = Math.max(-1, Math.min(1, parseFloat(trimmedValue)));
        break;

      // Envelope times (ms)
      case 'vcaA':
      case 'vcaD':
      case 'vcaR':
      case 'vcfA':
      case 'vcfD':
      case 'vcfR':
        (params as any)[key] = Math.max(0, parseFloat(trimmedValue));
        break;

      // Filter type
      case 'vcfType':
        if (['lowpass', 'highpass', 'bandpass', 'notch'].includes(trimmedValue)) {
          params.vcfType = trimmedValue as BiquadFilterType;
        }
        break;

      // Filter frequency (Hz)
      case 'vcfFreq':
        params.vcfFreq = Math.max(20, Math.min(20000, parseFloat(trimmedValue)));
        break;

      // Filter resonance (Q)
      case 'vcfRes':
        params.vcfRes = Math.max(0.1, Math.min(30, parseFloat(trimmedValue)));
        break;

      // LFO speed
      case 'lfoSpeed':
        params.lfoSpeed = Math.max(0.01, Math.min(20, parseFloat(trimmedValue)));
        break;

      // LFO sync
      case 'lfoSpeedSync':
        params.lfoSpeedSync = trimmedValue === 'on' || trimmedValue === 'true';
        break;

      // LFO targets (boolean)
      case 'lfoTargetVCA':
      case 'lfoTargetVCF':
      case 'lfoTargetOsc1Pitch':
      case 'lfoTargetOsc2Pitch':
      case 'lfoTargetOsc3Pitch':
      case 'lfoTargetOsc1Pan':
      case 'lfoTargetOsc2Pan':
      case 'lfoTargetOsc3Pan':
      case 'lfoTargetOsc1Phase':
      case 'lfoTargetOsc2Phase':
      case 'lfoTargetOsc3Phase':
        (params as any)[key] = trimmedValue === 'on' || trimmedValue === 'true';
        break;
    }
  }

  return params;
}

/**
 * Calculate LFO frequency from speed parameter and tempo
 */
function getLFOFrequency(params: SynthParams, currentTempo: number): number {
  if (params.lfoSpeedSync) {
    // Tempo sync: lfoSpeed is a tempo factor
    // 1 = quarter note, 2 = eighth note, 0.5 = half note, etc.
    const beatsPerSecond = currentTempo / 60;
    return beatsPerSecond * params.lfoSpeed;
  } else {
    // Free-running: lfoSpeed is Hz
    return params.lfoSpeed;
  }
}

/**
 * Play a note with the synthesizer
 *
 * @param ctx - Web Audio context
 * @param midiNote - MIDI note number (0-127)
 * @param velocity - Note velocity (0-1)
 * @param synthParams - Synth parameters
 * @param currentTempo - Current tempo (for LFO sync)
 * @param isDesktop - Desktop flag (for mobile boost)
 * @returns noteId - Unique identifier for this note instance
 */
export function playNoteWithSynth(
  ctx: AudioContext,
  midiNote: number,
  velocity: number,
  synthParams: SynthParams,
  currentTempo: number = 120,
  isDesktop: boolean = true
): string {
  const noteId = `${midiNote}-${Date.now()}-${Math.random()}`;
  const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
  const now = ctx.currentTime;

  // Create oscillators (only if gain > 0)
  const oscs: OscillatorNode[] = [];
  const oscGains: GainNode[] = [];
  const panners: StereoPannerNode[] = [];

  const oscConfigs = [
    { wave: synthParams.osc1Wave, gain: synthParams.osc1Gain, tune: synthParams.osc1Tune, pan: synthParams.osc1Pan },
    { wave: synthParams.osc2Wave, gain: synthParams.osc2Gain, tune: synthParams.osc2Tune, pan: synthParams.osc2Pan },
    { wave: synthParams.osc3Wave, gain: synthParams.osc3Gain, tune: synthParams.osc3Tune, pan: synthParams.osc3Pan }
  ];

  oscConfigs.forEach((config, i) => {
    if (config.gain > 0) {
      const osc = ctx.createOscillator();
      osc.type = config.wave;
      osc.frequency.value = freq * Math.pow(2, config.tune / 1200);

      const gain = ctx.createGain();
      gain.gain.value = config.gain * velocity;

      const panner = ctx.createStereoPanner();
      panner.pan.value = config.pan;

      osc.connect(gain);
      gain.connect(panner);

      oscs.push(osc);
      oscGains.push(gain);
      panners.push(panner);
    }
  });

  // If no oscillators active, bail
  if (oscs.length === 0) {
    console.warn('⚠️ No oscillators enabled (all gains = 0)');
    return '';
  }

  // Create filter
  const filter = ctx.createBiquadFilter();
  filter.type = synthParams.vcfType;
  filter.frequency.value = Math.max(20, Math.min(20000, synthParams.vcfFreq));
  filter.Q.value = Math.max(0.1, Math.min(30, synthParams.vcfRes));

  // VCF envelope (if vcfAmount > 0)
  if (synthParams.vcfAmount > 0) {
    const vcfPeak = synthParams.vcfFreq * (1 + synthParams.vcfAmount * 10);
    const vcfSustain = synthParams.vcfFreq + (vcfPeak - synthParams.vcfFreq) * synthParams.vcfS;

    filter.frequency.setValueAtTime(synthParams.vcfFreq, now);
    filter.frequency.linearRampToValueAtTime(
      Math.min(20000, vcfPeak),
      now + synthParams.vcfA / 1000
    );
    filter.frequency.linearRampToValueAtTime(
      Math.min(20000, vcfSustain),
      now + (synthParams.vcfA + synthParams.vcfD) / 1000
    );
  }

  // VCA envelope
  const vca = ctx.createGain();
  vca.gain.setValueAtTime(0, now);
  vca.gain.linearRampToValueAtTime(1, now + synthParams.vcaA / 1000);
  vca.gain.linearRampToValueAtTime(
    synthParams.vcaS,
    now + (synthParams.vcaA + synthParams.vcaD) / 1000
  );

  // Master gain (with mobile boost)
  const mobileBoost = !isDesktop ? 2.2 : 1.8;
  const masterGain = ctx.createGain();
  masterGain.gain.value = synthParams.masterGain * mobileBoost * 0.8;

  // Connect signal chain: oscs → filter → vca → master → output
  panners.forEach(p => p.connect(filter));
  filter.connect(vca);
  vca.connect(masterGain);
  masterGain.connect(ctx.destination);

  // LFO (if depth > 0 and any target enabled)
  let lfo: OscillatorNode | undefined;
  let lfoGain: GainNode | undefined;

  const anyLFOTarget =
    synthParams.lfoTargetVCA ||
    synthParams.lfoTargetVCF ||
    synthParams.lfoTargetOsc1Pitch ||
    synthParams.lfoTargetOsc2Pitch ||
    synthParams.lfoTargetOsc3Pitch ||
    synthParams.lfoTargetOsc1Pan ||
    synthParams.lfoTargetOsc2Pan ||
    synthParams.lfoTargetOsc3Pan ||
    synthParams.lfoTargetOsc1Phase ||
    synthParams.lfoTargetOsc2Phase ||
    synthParams.lfoTargetOsc3Phase;

  if (synthParams.lfoDepth > 0 && anyLFOTarget) {
    lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = getLFOFrequency(synthParams, currentTempo);

    lfoGain = ctx.createGain();
    lfoGain.gain.value = synthParams.lfoDepth;
    lfo.connect(lfoGain);

    // Connect LFO to targets
    if (synthParams.lfoTargetVCA) {
      const vcaLfoGain = ctx.createGain();
      vcaLfoGain.gain.value = 0.5; // ±50% at full depth
      lfoGain.connect(vcaLfoGain);
      vcaLfoGain.connect(vca.gain);
    }

    if (synthParams.lfoTargetVCF) {
      const vcfLfoGain = ctx.createGain();
      vcfLfoGain.gain.value = synthParams.vcfFreq * 0.5; // ±50% at full depth
      lfoGain.connect(vcfLfoGain);
      vcfLfoGain.connect(filter.frequency);
    }

    // Pitch modulation (vibrato/FM)
    [
      { enabled: synthParams.lfoTargetOsc1Pitch, osc: oscs[0] },
      { enabled: synthParams.lfoTargetOsc2Pitch, osc: oscs[1] },
      { enabled: synthParams.lfoTargetOsc3Pitch, osc: oscs[2] }
    ].forEach(({ enabled, osc }) => {
      if (enabled && osc) {
        const pitchGain = ctx.createGain();
        pitchGain.gain.value = 100; // ±100 cents at full depth
        lfoGain!.connect(pitchGain);
        pitchGain.connect(osc.detune);
      }
    });

    // Pan modulation (auto-pan)
    [
      { enabled: synthParams.lfoTargetOsc1Pan, panner: panners[0] },
      { enabled: synthParams.lfoTargetOsc2Pan, panner: panners[1] },
      { enabled: synthParams.lfoTargetOsc3Pan, panner: panners[2] }
    ].forEach(({ enabled, panner }) => {
      if (enabled && panner) {
        const panLfoGain = ctx.createGain();
        panLfoGain.gain.value = 1; // ±100% at full depth
        lfoGain!.connect(panLfoGain);
        panLfoGain.connect(panner.pan);
      }
    });

    // Phase modulation (FM synthesis)
    [
      { enabled: synthParams.lfoTargetOsc1Phase, osc: oscs[0] },
      { enabled: synthParams.lfoTargetOsc2Phase, osc: oscs[1] },
      { enabled: synthParams.lfoTargetOsc3Phase, osc: oscs[2] }
    ].forEach(({ enabled, osc }) => {
      if (enabled && osc) {
        const phaseGain = ctx.createGain();
        phaseGain.gain.value = 50; // ±50 Hz at full depth (FM)
        lfoGain!.connect(phaseGain);
        phaseGain.connect(osc.frequency);
      }
    });

    lfo.start(now);
  }

  // Start oscillators
  oscs.forEach(osc => osc.start(now));

  // Store for release
  activeNotes.set(noteId, {
    oscs,
    oscGains,
    panners,
    filter,
    vca,
    lfo,
    lfoGain,
    synthParams
  });

  return noteId;
}

/**
 * Stop a specific note by ID
 */
export function stopNoteById(ctx: AudioContext, noteId: string): void {
  const note = activeNotes.get(noteId);
  if (!note) return;

  const now = ctx.currentTime;
  const releaseTime = note.synthParams.vcaR / 1000;

  // VCA release (exponential for smooth fadeout)
  note.vca.gain.cancelScheduledValues(now);
  note.vca.gain.setValueAtTime(note.vca.gain.value, now);
  note.vca.gain.exponentialRampToValueAtTime(0.001, now + releaseTime);

  // VCF release (if envelope active)
  if (note.synthParams.vcfAmount > 0) {
    const vcfRelease = note.synthParams.vcfR / 1000;
    note.filter.frequency.cancelScheduledValues(now);
    note.filter.frequency.setValueAtTime(note.filter.frequency.value, now);
    note.filter.frequency.exponentialRampToValueAtTime(
      Math.max(20, note.synthParams.vcfFreq),
      now + vcfRelease
    );
  }

  // Stop oscillators and LFO (scheduled to prevent clicks)
  setTimeout(() => {
    try {
      note.oscs.forEach(osc => osc.stop(now + 0.001));
      if (note.lfo) note.lfo.stop(now + 0.001);
    } catch (e) {
      // Already stopped
    }
    activeNotes.delete(noteId);
  }, Math.max(releaseTime, note.synthParams.vcfR / 1000) * 1000 + 50);
}

/**
 * Stop all instances of a MIDI note
 */
export function stopNote(ctx: AudioContext, midiNote: number): void {
  const noteIdsToStop: string[] = [];
  activeNotes.forEach((_, noteId) => {
    if (noteId.startsWith(`${midiNote}-`)) {
      noteIdsToStop.push(noteId);
    }
  });
  noteIdsToStop.forEach(id => stopNoteById(ctx, id));
}

/**
 * Stop all active notes (panic button)
 */
export function stopAllNotes(ctx: AudioContext): void {
  const allNoteIds = Array.from(activeNotes.keys());
  allNoteIds.forEach(id => stopNoteById(ctx, id));
}

/**
 * Get active note count (for debugging)
 */
export function getActiveNoteCount(): number {
  return activeNotes.size;
}

// EOF - Synthesizer.ts v4.4.0
