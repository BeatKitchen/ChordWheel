// >>> PATCH START: src/types/svguitar.d.ts (allow muted strings in fingers)
declare module "svguitar" {
  export class SVGuitarChord {
    constructor(
      container: string | HTMLElement,
      options?: Record<string, any>
    );
    configure(opts?: Record<string, any>): this;
    chord(spec: {
      title?: string;
      position?: number;
      /** Each finger: [stringNumber(1=highE..6=lowE), fretNumber | "x", optionalText] */
      fingers?: (readonly [number, number | "x", any?])[];
      barres?: {
        fromString: number;
        toString: number;
        fret: number;
        text?: string;
        color?: string;
        className?: string;
      }[];
    }): this;
    draw(): void;
  }
}
// >>> PATCH END: src/types/svguitar.d.ts
