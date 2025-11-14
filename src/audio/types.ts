/**
 * types.ts - v4.5.0
 *
 * Audio synthesizer type definitions
 * Extracted from HarmonyWheel.tsx for clean architecture
 */

export interface SynthParams {
  // Oscillator 1
  osc1Wave: OscillatorType;       // sine, square, sawtooth, triangle
  osc1Gain: number;               // 0-1
  osc1Tune: number;               // cents (-1200 to +1200)
  osc1Pan: number;                // -1 (left) to +1 (right)

  // Oscillator 2
  osc2Wave: OscillatorType;
  osc2Gain: number;
  osc2Tune: number;
  osc2Pan: number;

  // Oscillator 3
  osc3Wave: OscillatorType;
  osc3Gain: number;
  osc3Tune: number;
  osc3Pan: number;

  // Per-Oscillator VCA Envelopes
  osc1VcaA: number;               // ms
  osc1VcaD: number;               // ms
  osc1VcaS: number;               // 0-1
  osc1VcaR: number;               // ms
  osc2VcaA?: number;              // Optional - fallback to osc1
  osc2VcaD?: number;
  osc2VcaS?: number;
  osc2VcaR?: number;
  osc3VcaA?: number;              // Optional - fallback to osc1
  osc3VcaD?: number;
  osc3VcaS?: number;
  osc3VcaR?: number;

  // Per-Oscillator Filters
  osc1FilterType: BiquadFilterType;
  osc1FilterFreq: number;         // Hz (20-20000)
  osc1FilterRes: number;          // Q value (0.1-30)
  osc1FilterKeyTrack: number;     // 0-1 (0=fixed, 1=full tracking)
  osc1FilterA: number;            // ms
  osc1FilterD: number;            // ms
  osc1FilterS: number;            // 0-1
  osc1FilterR: number;            // ms
  osc1FilterAmount: number;       // 0-1 (envelope depth)

  osc2FilterType?: BiquadFilterType;  // Optional - fallback to osc1
  osc2FilterFreq?: number;
  osc2FilterRes?: number;
  osc2FilterKeyTrack?: number;
  osc2FilterA?: number;
  osc2FilterD?: number;
  osc2FilterS?: number;
  osc2FilterR?: number;
  osc2FilterAmount?: number;

  osc3FilterType?: BiquadFilterType;  // Optional - fallback to osc1
  osc3FilterFreq?: number;
  osc3FilterRes?: number;
  osc3FilterKeyTrack?: number;
  osc3FilterA?: number;
  osc3FilterD?: number;
  osc3FilterS?: number;
  osc3FilterR?: number;
  osc3FilterAmount?: number;

  // Output Filter (final stage)
  outputFilterType: BiquadFilterType;
  outputFilterFreq: number;       // Hz (20-20000)
  outputFilterRes: number;        // Q value (0.1-30)
  outputFilterKeyTrack: number;   // 0-1 (0=fixed, 1=full tracking)
  outputFilterA: number;          // ms
  outputFilterD: number;          // ms
  outputFilterS: number;          // 0-1
  outputFilterR: number;          // ms
  outputFilterAmount: number;     // 0-1 (envelope depth)

  // LFO
  lfoSpeed: number;               // Hz (0.01-20) or tempo factor
  lfoSpeedSync: boolean;          // true = sync to tempo, false = Hz
  lfoDepth: number;               // 0-1 (master depth)
  lfoTargetVCA: boolean;          // Modulate VCA gain
  lfoTargetVCF: boolean;          // Modulate filter cutoff
  lfoTargetOsc1Pitch: boolean;    // Modulate osc1 pitch
  lfoTargetOsc2Pitch: boolean;    // Modulate osc2 pitch
  lfoTargetOsc3Pitch: boolean;    // Modulate osc3 pitch
  lfoTargetOsc1Pan: boolean;      // Modulate osc1 pan
  lfoTargetOsc2Pan: boolean;      // Modulate osc2 pan
  lfoTargetOsc3Pan: boolean;      // Modulate osc3 pan
  lfoTargetOsc1Phase: boolean;    // Modulate osc1 phase (FM)
  lfoTargetOsc2Phase: boolean;    // Modulate osc2 phase (FM)
  lfoTargetOsc3Phase: boolean;    // Modulate osc3 phase (FM)

  // Output (final gain stage)
  outputGain: number;             // 0-1
}

export interface ActiveNote {
  oscs: OscillatorNode[];
  oscGains: GainNode[];
  oscFilters: BiquadFilterNode[];
  oscVcas: GainNode[];
  panners: StereoPannerNode[];
  outputFilter: BiquadFilterNode;
  lfo?: OscillatorNode;
  lfoGain?: GainNode;
  synthParams: SynthParams;
  midiNote: number;
}

export const DEFAULT_SYNTH_PARAMS: SynthParams = {
  // Oscillator 1 (active by default)
  osc1Wave: 'sine',
  osc1Gain: 0.25,
  osc1Tune: 0,
  osc1Pan: 0,

  // Oscillator 2 (subtle triangle layer, slightly detuned)
  osc2Wave: 'triangle',
  osc2Gain: 0.05,
  osc2Tune: 10,
  osc2Pan: 0,

  // Oscillator 3 (off by default)
  osc3Wave: 'sine',
  osc3Gain: 0,
  osc3Tune: 0,
  osc3Pan: 0,

  // Per-Oscillator VCA Envelopes (slower attack, longer release for warmth)
  osc1VcaA: 30,
  osc1VcaD: 90,
  osc1VcaS: 0.6,
  osc1VcaR: 1000,
  // osc2/osc3 VCA optional (fallback to osc1)

  // Per-Oscillator Filters (osc1 wide open, osc2 with key tracking)
  osc1FilterType: 'lowpass',
  osc1FilterFreq: 20000,
  osc1FilterRes: 1,
  osc1FilterKeyTrack: 0,
  osc1FilterA: 10,
  osc1FilterD: 90,
  osc1FilterS: 0.5,
  osc1FilterR: 50,
  osc1FilterAmount: 0,

  // osc2 filter with key tracking (prevents high notes from being cut)
  osc2FilterFreq: 800,
  osc2FilterRes: 1,
  osc2FilterKeyTrack: 1,
  // osc3 filters optional (fallback to osc1)

  // Output Filter (wide open by default)
  outputFilterType: 'lowpass',
  outputFilterFreq: 20000,
  outputFilterRes: 1,
  outputFilterKeyTrack: 0,
  outputFilterA: 10,
  outputFilterD: 90,
  outputFilterS: 0.5,
  outputFilterR: 50,
  outputFilterAmount: 0,

  // LFO (off by default)
  lfoSpeed: 4,
  lfoSpeedSync: true,
  lfoDepth: 0,
  lfoTargetVCA: false,
  lfoTargetVCF: false,
  lfoTargetOsc1Pitch: false,
  lfoTargetOsc2Pitch: false,
  lfoTargetOsc3Pitch: false,
  lfoTargetOsc1Pan: false,
  lfoTargetOsc2Pan: false,
  lfoTargetOsc3Pan: false,
  lfoTargetOsc1Phase: false,
  lfoTargetOsc2Phase: false,
  lfoTargetOsc3Phase: false,

  // Output (final gain stage)
  outputGain: 0.6
};

// EOF - types.ts v4.5.0
