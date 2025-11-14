/**
 * types.ts - v4.4.0
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

  // VCA Envelope
  vcaA: number;                   // ms
  vcaD: number;                   // ms
  vcaS: number;                   // 0-1
  vcaR: number;                   // ms

  // VCF (Filter)
  vcfType: BiquadFilterType;      // lowpass, highpass, bandpass
  vcfFreq: number;                // Hz (20-20000)
  vcfRes: number;                 // Q value (0.1-30)
  vcfA: number;                   // ms
  vcfD: number;                   // ms
  vcfS: number;                   // 0-1
  vcfR: number;                   // ms
  vcfAmount: number;              // 0-1 (envelope depth)

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

  // Master
  masterGain: number;             // 0-1
}

export interface ActiveNote {
  oscs: OscillatorNode[];
  oscGains: GainNode[];
  panners: StereoPannerNode[];
  filter: BiquadFilterNode;
  vca: GainNode;
  lfo?: OscillatorNode;
  lfoGain?: GainNode;
  synthParams: SynthParams;
}

export const DEFAULT_SYNTH_PARAMS: SynthParams = {
  // Oscillator 1 (active by default - matches v4.3.1)
  osc1Wave: 'sine',
  osc1Gain: 0.25,
  osc1Tune: 0,
  osc1Pan: 0,

  // Oscillator 2 (off by default)
  osc2Wave: 'sine',
  osc2Gain: 0,
  osc2Tune: 0,
  osc2Pan: 0,

  // Oscillator 3 (off by default)
  osc3Wave: 'sine',
  osc3Gain: 0,
  osc3Tune: 0,
  osc3Pan: 0,

  // VCA (matches v4.3.1)
  vcaA: 10,
  vcaD: 90,
  vcaS: 0.15,
  vcaR: 50,

  // VCF (wide open by default)
  vcfType: 'lowpass',
  vcfFreq: 20000,
  vcfRes: 1,
  vcfA: 10,
  vcfD: 90,
  vcfS: 0.5,
  vcfR: 50,
  vcfAmount: 0,

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

  // Master
  masterGain: 0.8
};

// EOF - types.ts v4.4.0
