/**
 * Synthesizer.ts - v4.5.0
 *
 * 🎹 Web Audio synthesizer with:
 * - 3 oscillators (wave, gain, tune, pan)
 * - Per-oscillator VCA ADSR envelopes
 * - Per-oscillator filters with key tracking
 * - Output filter (final stage) with key tracking
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
 * Calculate filter frequency with key tracking
 * @param baseFreq - Base filter frequency (Hz)
 * @param midiNote - MIDI note number (0-127)
 * @param keyTrack - Key tracking amount (0-1, where 1=full tracking)
 * @returns Actual filter frequency in Hz
 */
function calculateFilterFreq(baseFreq: number, midiNote: number, keyTrack: number): number {
  if (keyTrack === 0) return baseFreq;

  // Convert MIDI note to frequency
  const noteFreq = 440 * Math.pow(2, (midiNote - 69) / 12);

  // Reference frequency (A4 = 440 Hz, MIDI 69)
  const referenceFreq = 440;

  // Calculate scaling factor based on key tracking amount
  const ratio = Math.pow(noteFreq / referenceFreq, keyTrack);

  // Apply to base frequency
  const result = baseFreq * ratio;

  // Clamp to valid range (20-20000 Hz)
  return Math.max(20, Math.min(20000, result));
}

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

      // Gains (0-1)
      case 'osc1Gain':
      case 'osc2Gain':
      case 'osc3Gain':
      case 'osc1VcaS':
      case 'osc2VcaS':
      case 'osc3VcaS':
      case 'osc1FilterS':
      case 'osc2FilterS':
      case 'osc3FilterS':
      case 'osc1FilterAmount':
      case 'osc2FilterAmount':
      case 'osc3FilterAmount':
      case 'outputFilterS':
      case 'outputFilterAmount':
      case 'lfoDepth':
      case 'outputGain':
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
      case 'osc1VcaA':
      case 'osc1VcaD':
      case 'osc1VcaR':
      case 'osc2VcaA':
      case 'osc2VcaD':
      case 'osc2VcaR':
      case 'osc3VcaA':
      case 'osc3VcaD':
      case 'osc3VcaR':
      case 'osc1FilterA':
      case 'osc1FilterD':
      case 'osc1FilterR':
      case 'osc2FilterA':
      case 'osc2FilterD':
      case 'osc2FilterR':
      case 'osc3FilterA':
      case 'osc3FilterD':
      case 'osc3FilterR':
      case 'outputFilterA':
      case 'outputFilterD':
      case 'outputFilterR':
        (params as any)[key] = Math.max(0, parseFloat(trimmedValue));
        break;

      // Filter types
      case 'osc1FilterType':
      case 'osc2FilterType':
      case 'osc3FilterType':
      case 'outputFilterType':
        if (['lowpass', 'highpass', 'bandpass', 'notch'].includes(trimmedValue)) {
          (params as any)[key] = trimmedValue as BiquadFilterType;
        }
        break;

      // Filter frequency (Hz)
      case 'osc1FilterFreq':
      case 'osc2FilterFreq':
      case 'osc3FilterFreq':
      case 'outputFilterFreq':
        (params as any)[key] = Math.max(20, Math.min(20000, parseFloat(trimmedValue)));
        break;

      // Filter resonance (Q)
      case 'osc1FilterRes':
      case 'osc2FilterRes':
      case 'osc3FilterRes':
      case 'outputFilterRes':
        (params as any)[key] = Math.max(0.1, Math.min(30, parseFloat(trimmedValue)));
        break;

      // Key tracking (0-1)
      case 'osc1FilterKeyTrack':
      case 'osc2FilterKeyTrack':
      case 'osc3FilterKeyTrack':
      case 'outputFilterKeyTrack':
        (params as any)[key] = Math.max(0, Math.min(1, parseFloat(trimmedValue)));
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
  const oscFilters: BiquadFilterNode[] = [];
  const oscVcas: GainNode[] = [];
  const panners: StereoPannerNode[] = [];

  const oscConfigs = [
    {
      wave: synthParams.osc1Wave,
      gain: synthParams.osc1Gain,
      tune: synthParams.osc1Tune,
      pan: synthParams.osc1Pan,
      vcaA: synthParams.osc1VcaA,
      vcaD: synthParams.osc1VcaD,
      vcaS: synthParams.osc1VcaS,
      vcaR: synthParams.osc1VcaR,
      filterType: synthParams.osc1FilterType,
      filterFreq: synthParams.osc1FilterFreq,
      filterRes: synthParams.osc1FilterRes,
      filterKeyTrack: synthParams.osc1FilterKeyTrack,
      filterA: synthParams.osc1FilterA,
      filterD: synthParams.osc1FilterD,
      filterS: synthParams.osc1FilterS,
      filterR: synthParams.osc1FilterR,
      filterAmount: synthParams.osc1FilterAmount,
    },
    {
      wave: synthParams.osc2Wave,
      gain: synthParams.osc2Gain,
      tune: synthParams.osc2Tune,
      pan: synthParams.osc2Pan,
      vcaA: synthParams.osc2VcaA ?? synthParams.osc1VcaA,
      vcaD: synthParams.osc2VcaD ?? synthParams.osc1VcaD,
      vcaS: synthParams.osc2VcaS ?? synthParams.osc1VcaS,
      vcaR: synthParams.osc2VcaR ?? synthParams.osc1VcaR,
      filterType: synthParams.osc2FilterType ?? synthParams.osc1FilterType,
      filterFreq: synthParams.osc2FilterFreq ?? synthParams.osc1FilterFreq,
      filterRes: synthParams.osc2FilterRes ?? synthParams.osc1FilterRes,
      filterKeyTrack: synthParams.osc2FilterKeyTrack ?? synthParams.osc1FilterKeyTrack,
      filterA: synthParams.osc2FilterA ?? synthParams.osc1FilterA,
      filterD: synthParams.osc2FilterD ?? synthParams.osc1FilterD,
      filterS: synthParams.osc2FilterS ?? synthParams.osc1FilterS,
      filterR: synthParams.osc2FilterR ?? synthParams.osc1FilterR,
      filterAmount: synthParams.osc2FilterAmount ?? synthParams.osc1FilterAmount,
    },
    {
      wave: synthParams.osc3Wave,
      gain: synthParams.osc3Gain,
      tune: synthParams.osc3Tune,
      pan: synthParams.osc3Pan,
      vcaA: synthParams.osc3VcaA ?? synthParams.osc1VcaA,
      vcaD: synthParams.osc3VcaD ?? synthParams.osc1VcaD,
      vcaS: synthParams.osc3VcaS ?? synthParams.osc1VcaS,
      vcaR: synthParams.osc3VcaR ?? synthParams.osc1VcaR,
      filterType: synthParams.osc3FilterType ?? synthParams.osc1FilterType,
      filterFreq: synthParams.osc3FilterFreq ?? synthParams.osc1FilterFreq,
      filterRes: synthParams.osc3FilterRes ?? synthParams.osc1FilterRes,
      filterKeyTrack: synthParams.osc3FilterKeyTrack ?? synthParams.osc1FilterKeyTrack,
      filterA: synthParams.osc3FilterA ?? synthParams.osc1FilterA,
      filterD: synthParams.osc3FilterD ?? synthParams.osc1FilterD,
      filterS: synthParams.osc3FilterS ?? synthParams.osc1FilterS,
      filterR: synthParams.osc3FilterR ?? synthParams.osc1FilterR,
      filterAmount: synthParams.osc3FilterAmount ?? synthParams.osc1FilterAmount,
    }
  ];

  oscConfigs.forEach((config) => {
    if (config.gain > 0) {
      // Create oscillator
      const osc = ctx.createOscillator();
      osc.type = config.wave;
      osc.frequency.value = freq * Math.pow(2, config.tune / 1200);

      // Create gain node for oscillator level
      const gain = ctx.createGain();
      gain.gain.value = config.gain * velocity;

      // Create per-oscillator filter with key tracking
      const filter = ctx.createBiquadFilter();
      filter.type = config.filterType;
      const trackedFreq = calculateFilterFreq(config.filterFreq, midiNote, config.filterKeyTrack);
      filter.frequency.value = trackedFreq;
      filter.Q.value = Math.max(0.1, Math.min(30, config.filterRes));

      // Per-oscillator filter envelope (if filterAmount > 0)
      if (config.filterAmount > 0) {
        const filterPeak = trackedFreq * (1 + config.filterAmount * 10);
        const filterSustain = trackedFreq + (filterPeak - trackedFreq) * config.filterS;

        filter.frequency.setValueAtTime(trackedFreq, now);
        filter.frequency.linearRampToValueAtTime(
          Math.min(20000, filterPeak),
          now + config.filterA / 1000
        );
        filter.frequency.linearRampToValueAtTime(
          Math.min(20000, filterSustain),
          now + (config.filterA + config.filterD) / 1000
        );
      }

      // Create per-oscillator VCA envelope
      const vca = ctx.createGain();
      vca.gain.setValueAtTime(0, now);
      vca.gain.linearRampToValueAtTime(1, now + config.vcaA / 1000);
      vca.gain.linearRampToValueAtTime(
        config.vcaS,
        now + (config.vcaA + config.vcaD) / 1000
      );

      // Create panner
      const panner = ctx.createStereoPanner();
      panner.pan.value = config.pan;

      // Connect: osc → gain → filter → vca → panner
      osc.connect(gain);
      gain.connect(filter);
      filter.connect(vca);
      vca.connect(panner);

      oscs.push(osc);
      oscGains.push(gain);
      oscFilters.push(filter);
      oscVcas.push(vca);
      panners.push(panner);
    }
  });

  // If no oscillators active, bail
  if (oscs.length === 0) {
    console.warn('⚠️ No oscillators enabled (all gains = 0)');
    return '';
  }

  // Create output filter (final stage) with key tracking
  const outputFilter = ctx.createBiquadFilter();
  outputFilter.type = synthParams.outputFilterType;
  const outputTrackedFreq = calculateFilterFreq(
    synthParams.outputFilterFreq,
    midiNote,
    synthParams.outputFilterKeyTrack
  );
  outputFilter.frequency.value = outputTrackedFreq;
  outputFilter.Q.value = Math.max(0.1, Math.min(30, synthParams.outputFilterRes));

  // Output filter envelope (if outputFilterAmount > 0)
  if (synthParams.outputFilterAmount > 0) {
    const outputFilterPeak = outputTrackedFreq * (1 + synthParams.outputFilterAmount * 10);
    const outputFilterSustain = outputTrackedFreq + (outputFilterPeak - outputTrackedFreq) * synthParams.outputFilterS;

    outputFilter.frequency.setValueAtTime(outputTrackedFreq, now);
    outputFilter.frequency.linearRampToValueAtTime(
      Math.min(20000, outputFilterPeak),
      now + synthParams.outputFilterA / 1000
    );
    outputFilter.frequency.linearRampToValueAtTime(
      Math.min(20000, outputFilterSustain),
      now + (synthParams.outputFilterA + synthParams.outputFilterD) / 1000
    );
  }

  // Output gain (final stage with mobile boost)
  const mobileBoost = !isDesktop ? 2.2 : 1.8;
  const outputGainNode = ctx.createGain();
  outputGainNode.gain.value = synthParams.outputGain * mobileBoost * 0.8;

  // Connect signal chain: panners → outputFilter → outputGain → destination
  panners.forEach(p => p.connect(outputFilter));
  outputFilter.connect(outputGainNode);
  outputGainNode.connect(ctx.destination);

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
      // Modulate all per-osc VCAs
      oscVcas.forEach(vca => {
        const vcaLfoGain = ctx.createGain();
        vcaLfoGain.gain.value = 0.5; // ±50% at full depth
        lfoGain!.connect(vcaLfoGain);
        vcaLfoGain.connect(vca.gain);
      });
    }

    if (synthParams.lfoTargetVCF) {
      // Modulate output filter
      const vcfLfoGain = ctx.createGain();
      vcfLfoGain.gain.value = synthParams.outputFilterFreq * 0.5; // ±50% at full depth
      lfoGain.connect(vcfLfoGain);
      vcfLfoGain.connect(outputFilter.frequency);
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
    oscFilters,
    oscVcas,
    panners,
    outputFilter,
    lfo,
    lfoGain,
    synthParams,
    midiNote
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

  // Release each oscillator's VCA with its own release time
  note.oscVcas.forEach((vca, i) => {
    const config = [
      {
        vcaR: note.synthParams.osc1VcaR,
        filterR: note.synthParams.osc1FilterR,
        filterAmount: note.synthParams.osc1FilterAmount,
        filterFreq: note.synthParams.osc1FilterFreq,
      },
      {
        vcaR: note.synthParams.osc2VcaR ?? note.synthParams.osc1VcaR,
        filterR: note.synthParams.osc2FilterR ?? note.synthParams.osc1FilterR,
        filterAmount: note.synthParams.osc2FilterAmount ?? note.synthParams.osc1FilterAmount,
        filterFreq: note.synthParams.osc2FilterFreq ?? note.synthParams.osc1FilterFreq,
      },
      {
        vcaR: note.synthParams.osc3VcaR ?? note.synthParams.osc1VcaR,
        filterR: note.synthParams.osc3FilterR ?? note.synthParams.osc1FilterR,
        filterAmount: note.synthParams.osc3FilterAmount ?? note.synthParams.osc1FilterAmount,
        filterFreq: note.synthParams.osc3FilterFreq ?? note.synthParams.osc1FilterFreq,
      }
    ][i];

    if (!config) return;

    const releaseTime = config.vcaR / 1000;

    // VCA release (exponential for smooth fadeout)
    vca.gain.cancelScheduledValues(now);
    vca.gain.setValueAtTime(vca.gain.value, now);
    vca.gain.exponentialRampToValueAtTime(0.001, now + releaseTime);

    // Per-osc filter release (if envelope active)
    if (config.filterAmount > 0 && note.oscFilters[i]) {
      const filterRelease = config.filterR / 1000;
      note.oscFilters[i].frequency.cancelScheduledValues(now);
      note.oscFilters[i].frequency.setValueAtTime(note.oscFilters[i].frequency.value, now);
      note.oscFilters[i].frequency.exponentialRampToValueAtTime(
        Math.max(20, config.filterFreq),
        now + filterRelease
      );
    }
  });

  // Output filter release (if envelope active)
  if (note.synthParams.outputFilterAmount > 0) {
    const outputFilterRelease = note.synthParams.outputFilterR / 1000;
    note.outputFilter.frequency.cancelScheduledValues(now);
    note.outputFilter.frequency.setValueAtTime(note.outputFilter.frequency.value, now);
    note.outputFilter.frequency.exponentialRampToValueAtTime(
      Math.max(20, note.synthParams.outputFilterFreq),
      now + outputFilterRelease
    );
  }

  // Stop oscillators and LFO (scheduled to prevent clicks)
  // Use longest release time from all oscillators
  const maxReleaseTime = Math.max(
    note.synthParams.osc1VcaR,
    note.synthParams.osc2VcaR ?? note.synthParams.osc1VcaR,
    note.synthParams.osc3VcaR ?? note.synthParams.osc1VcaR,
    note.synthParams.osc1FilterR,
    note.synthParams.osc2FilterR ?? note.synthParams.osc1FilterR,
    note.synthParams.osc3FilterR ?? note.synthParams.osc1FilterR,
    note.synthParams.outputFilterR
  ) / 1000;

  setTimeout(() => {
    try {
      note.oscs.forEach(osc => osc.stop(now + 0.001));
      if (note.lfo) note.lfo.stop(now + 0.001);
    } catch (e) {
      // Already stopped
    }
    activeNotes.delete(noteId);
  }, maxReleaseTime * 1000 + 50);
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

// EOF - Synthesizer.ts v4.5.0
