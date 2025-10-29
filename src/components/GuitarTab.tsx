// >>> FILE START: src/components/GuitarTab.tsx  (title suppressed; fixed light grid)
import React, { useEffect, useRef } from "react";
import { SVGuitarChord } from "svguitar";

type Props = {
  chordLabel: string | null;
  width: number;
  height: number;
};

const THEME = {
  panelBg:    "#0a0a0a",
  panelBorder:"#374151",
  title:      "#f9fafb",
  gridLight:  "#e5e7eb",
  dotsFill:   "#111827",
  dotsText:   "#f9fafb",
};

type Shape = {
  title?: string;
  position?: number;
  fingers?: ReadonlyArray<readonly [number, number, any?]>;
  barres?: Array<{ fromString: number; toString: number; fret: number; text?: string }>;
  mute?: number[];
};

const OPEN_SHAPES: Record<string, Shape> = {
  // ========== MAJOR TRIADS ==========
  C:  { title:"C",  position:1, mute:[6], fingers:[[5,3,"3"],[4,2,"2"],[3,0],[2,1,"1"],[1,0]] },
  Db: { title:"Db", position:4, mute:[6], fingers:[[5,4,"1"],[4,6,"3"],[3,6,"4"],[2,6,"5"],[1,4,"1"]], barres:[{fromString:5,toString:1,fret:4}] },
  D:  { title:"D",  position:1, mute:[6,5], fingers:[[4,0],[3,2,"1"],[2,3,"3"],[1,2,"2"]] },
  Eb: { title:"Eb", position:1, mute:[6], fingers:[[5,1,"2"],[4,3,"3"],[3,3,"4"],[2,4,"5"],[1,3,"1"]] },
  E:  { title:"E",  position:1, fingers:[[6,0],[5,2,"2"],[4,2,"3"],[3,1,"1"],[2,0],[1,0]] },
  F:  { title:"F", position:1, fingers:[[6,1,"1"],[5,3,"3"],[4,3,"4"],[3,2,"2"],[2,1,"1"],[1,1,"1"]], barres:[{fromString:6,toString:1,fret:1}] },
  Gb: { title:"Gb", position:2, mute:[6], fingers:[[5,2,"1"],[4,4,"3"],[3,4,"4"],[2,4,"5"],[1,2,"1"]], barres:[{fromString:5,toString:1,fret:2}] },
  G:  { title:"G",  position:1, fingers:[[6,3,"2"],[5,2,"1"],[4,0],[3,0],[2,0],[1,3,"3"]] },
  Ab: { title:"Ab", position:4, mute:[6], fingers:[[5,4,"1"],[4,6,"3"],[3,6,"4"],[2,6,"5"],[1,4,"1"]], barres:[{fromString:5,toString:1,fret:4}] },
  A:  { title:"A",  position:1, mute:[6], fingers:[[5,0],[4,2,"1"],[3,2,"2"],[2,2,"3"],[1,0]] },
  Bb: { title:"Bb", position:1, mute:[6], fingers:[[5,1,"1"],[4,3,"2"],[3,3,"3"],[2,3,"4"],[1,1,"1"]], barres:[{fromString:5,toString:1,fret:1}] },
  B:  { title:"B",  position:2, mute:[6], fingers:[[5,2,"1"],[4,4,"2"],[3,4,"3"],[2,4,"4"],[1,2,"1"]], barres:[{fromString:5,toString:1,fret:2}] },
  
  // ========== MINOR TRIADS ==========
  Cm: { title:"Cm", position:3, mute:[6], fingers:[[5,3,"1"],[4,5,"3"],[3,5,"4"],[2,4,"2"],[1,3,"1"]], barres:[{fromString:5,toString:1,fret:3}] },
  Dm: { title:"Dm", position:1, mute:[6,5], fingers:[[4,0],[3,2,"2"],[2,3,"3"],[1,1,"1"]] },
  Ebm:{ title:"Ebm",position:1, mute:[6], fingers:[[5,1,"1"],[4,3,"3"],[3,3,"4"],[2,2,"2"],[1,1,"1"]], barres:[{fromString:5,toString:1,fret:1}] },
  Em: { title:"Em", position:1, fingers:[[6,0],[5,2,"2"],[4,2,"3"],[3,0],[2,0],[1,0]] },
  Fm: { title:"Fm", position:1, mute:[6], fingers:[[5,1,"1"],[4,3,"3"],[3,3,"4"],[2,1,"1"],[1,1,"1"]], barres:[{fromString:5,toString:1,fret:1}] },
  Gm: { title:"Gm", position:3, mute:[6], fingers:[[5,3,"1"],[4,5,"3"],[3,5,"4"],[2,3,"2"],[1,3,"1"]], barres:[{fromString:5,toString:1,fret:3}] },
  Abm:{ title:"Abm",position:4, mute:[6], fingers:[[5,4,"1"],[4,6,"3"],[3,6,"4"],[2,4,"2"],[1,4,"1"]], barres:[{fromString:5,toString:1,fret:4}] },
  Am: { title:"Am", position:1, mute:[6], fingers:[[5,0],[4,2,"2"],[3,2,"3"],[2,1,"1"],[1,0]] },
  Bbm:{ title:"Bbm",position:1, mute:[6], fingers:[[5,1,"1"],[4,3,"3"],[3,3,"4"],[2,2,"2"],[1,1,"1"]], barres:[{fromString:5,toString:1,fret:1}] },
  Bm: { title:"Bm", position:2, mute:[6], fingers:[[5,2,"1"],[4,4,"3"],[3,4,"4"],[2,3,"2"],[1,2,"1"]], barres:[{fromString:5,toString:1,fret:2}] },
  
  // ========== DOMINANT 7TH CHORDS ==========
  C7: { title:"C7", position:1, mute:[6], fingers:[[5,3,"3"],[4,2,"2"],[3,3,"4"],[2,1,"1"],[1,0]] },
  D7: { title:"D7", position:1, mute:[6,5], fingers:[[4,0],[3,2,"2"],[2,1,"1"],[1,2,"3"]] },
  E7: { title:"E7", position:1, fingers:[[6,0],[5,2,"2"],[4,0],[3,1,"1"],[2,0],[1,0]] },
  F7: { title:"F7", position:1, mute:[6], fingers:[[5,1,"1"],[4,2,"2"],[3,1,"1"],[2,1,"1"],[1,1,"1"]], barres:[{fromString:5,toString:1,fret:1}] },
  G7: { title:"G7", position:1, fingers:[[6,3,"2"],[5,2,"1"],[4,0],[3,0],[2,0],[1,1,"3"]] },
  A7: { title:"A7", position:1, mute:[6], fingers:[[5,0],[4,2,"2"],[3,0],[2,2,"3"],[1,0]] },
  B7: { title:"B7", position:2, mute:[6], fingers:[[5,2,"1"],[4,1,"2"],[3,2,"3"],[2,0],[1,2,"4"]] },
  Eb7:{ title:"Eb7",position:1, mute:[6], fingers:[[5,1,"2"],[4,1,"1"],[3,3,"4"],[2,1,"1"],[1,3,"3"]], barres:[{fromString:5,toString:2,fret:1}] },
  Ab7:{ title:"Ab7",position:4, mute:[6], fingers:[[5,4,"1"],[4,5,"2"],[3,4,"1"],[2,4,"1"],[1,4,"1"]], barres:[{fromString:5,toString:1,fret:4}] },
  Bb7:{ title:"Bb7",position:1, mute:[6], fingers:[[5,1,"1"],[4,3,"3"],[3,1,"2"],[2,1,"1"],[1,1,"1"]], barres:[{fromString:5,toString:1,fret:1}] },
  
  // ========== MAJOR 7TH CHORDS ==========
  Cmaj7:{ title:"Cmaj7",position:1, mute:[6], fingers:[[5,3,"3"],[4,2,"2"],[3,0],[2,0],[1,0]] },
  Dmaj7:{ title:"Dmaj7",position:1, mute:[6,5], fingers:[[4,0],[3,2,"1"],[2,2,"2"],[1,2,"3"]] },
  Emaj7:{ title:"Emaj7",position:1, fingers:[[6,0],[5,2,"2"],[4,1,"1"],[3,1,"1"],[2,0],[1,0]] },
  Fmaj7:{ title:"Fmaj7",position:1, mute:[6], fingers:[[5,3,"3"],[4,3,"4"],[3,2,"2"],[2,1,"1"],[1,0]] },
  Gmaj7:{ title:"Gmaj7",position:1, fingers:[[6,3,"3"],[5,2,"2"],[4,0],[3,0],[2,0],[1,2,"4"]] },
  Amaj7:{ title:"Amaj7",position:1, mute:[6], fingers:[[5,0],[4,2,"2"],[3,1,"1"],[2,2,"3"],[1,0]] },
  Bbmaj7:{title:"Bbmaj7",position:1,mute:[6], fingers:[[5,1,"1"],[4,3,"3"],[3,2,"2"],[2,1,"1"],[1,1,"1"]], barres:[{fromString:5,toString:1,fret:1}] },
  
  // ========== MINOR 7TH CHORDS ==========
  Cm7:{ title:"Cm7",position:3, mute:[6], fingers:[[5,3,"1"],[4,5,"3"],[3,3,"2"],[2,4,"4"],[1,3,"1"]], barres:[{fromString:5,toString:1,fret:3}] },
  Dm7:{ title:"Dm7",position:1, mute:[6,5], fingers:[[4,0],[3,2,"2"],[2,1,"1"],[1,1,"1"]], barres:[{fromString:2,toString:1,fret:1}] },
  Em7:{ title:"Em7",position:1, fingers:[[6,0],[5,2,"2"],[4,0],[3,0],[2,0],[1,0]] },
  Fm7:{ title:"Fm7",position:1, mute:[6], fingers:[[5,1,"1"],[4,3,"3"],[3,1,"1"],[2,1,"1"],[1,1,"1"]], barres:[{fromString:5,toString:1,fret:1}] },
  Gm7:{ title:"Gm7",position:3, mute:[6], fingers:[[5,3,"2"],[4,3,"1"],[3,3,"1"],[2,3,"1"],[1,3,"1"]], barres:[{fromString:5,toString:1,fret:3}] },
  Am7:{ title:"Am7",position:1, mute:[6], fingers:[[5,0],[4,2,"2"],[3,0],[2,0],[1,0]] },
  Bbm7:{title:"Bbm7",position:1,mute:[6], fingers:[[5,1,"1"],[4,3,"3"],[3,1,"1"],[2,2,"2"],[1,1,"1"]], barres:[{fromString:5,toString:1,fret:1}] },
  Bm7:{ title:"Bm7",position:2, mute:[6], fingers:[[5,2,"1"],[4,4,"3"],[3,2,"2"],[2,3,"4"],[1,2,"1"]], barres:[{fromString:5,toString:1,fret:2}] },
  
  // ========== MINOR MAJOR 7TH CHORDS ==========
  CmMaj7:{title:"CmMaj7",position:3,mute:[6], fingers:[[5,3,"1"],[4,5,"3"],[3,4,"2"],[2,4,"2"],[1,3,"1"]] },
  DmMaj7:{title:"DmMaj7",position:1,mute:[6,5], fingers:[[4,0],[3,2,"2"],[2,2,"3"],[1,1,"1"]] },
  EmMaj7:{title:"EmMaj7",position:1, fingers:[[6,0],[5,2,"2"],[4,1,"1"],[3,0],[2,0],[1,0]] },
  
  // ========== HALF-DIMINISHED (m7♭5) CHORDS ==========
  "Bm7b5":{ title:"Bm7♭5",position:2, mute:[6], fingers:[[5,2,"1"],[4,3,"2"],[3,2,"1"],[2,3,"3"],[1,2,"1"]], barres:[{fromString:5,toString:3,fret:2}] },
  "Cm7b5":{ title:"Cm7♭5",position:3, mute:[6], fingers:[[5,3,"1"],[4,4,"2"],[3,3,"1"],[2,4,"3"],[1,3,"1"]], barres:[{fromString:5,toString:3,fret:3}] },
  "Dm7b5":{ title:"Dm7♭5",position:1, mute:[6,5], fingers:[[4,0],[3,1,"1"],[2,1,"1"],[1,1,"1"]], barres:[{fromString:3,toString:1,fret:1}] },
  "Em7b5":{ title:"Em7♭5",position:1, mute:[6], fingers:[[5,2,"2"],[4,3,"3"],[3,2,"1"],[2,3,"4"],[1,0]] },
  "Fm7b5":{ title:"Fm7♭5",position:1, mute:[6], fingers:[[5,1,"1"],[4,2,"2"],[3,1,"1"],[2,1,"1"],[1,0]], barres:[{fromString:5,toString:2,fret:1}] },
  
  // ========== DIMINISHED 7TH CHORDS ==========
  Bdim7: { title:"Bdim7",position:1, mute:[6], fingers:[[5,2,"1"],[4,3,"2"],[3,2,"1"],[2,3,"3"],[1,2,"1"]], barres:[{fromString:5,toString:3,fret:2}] },
  Cdim7: { title:"Cdim7",position:1, mute:[6,5], fingers:[[4,1,"1"],[3,2,"2"],[2,1,"1"],[1,2,"3"]], barres:[{fromString:4,toString:2,fret:1}] },
  Ddim7: { title:"Ddim7",position:1, mute:[6,5], fingers:[[4,0],[3,1,"1"],[2,0],[1,1,"2"]] },
  Edim7: { title:"Edim7",position:1, mute:[6], fingers:[[5,2,"2"],[4,2,"1"],[3,1,"1"],[2,2,"3"],[1,0]] },
  Fdim7: { title:"Fdim7",position:1, mute:[6], fingers:[[5,0],[4,1,"1"],[3,0],[2,1,"2"],[1,0]] },
  
  // ========== AUGMENTED CHORDS ==========
  Caug: { title:"Caug",position:1, mute:[6,5], fingers:[[4,2,"2"],[3,1,"1"],[2,1,"1"],[1,0]], barres:[{fromString:3,toString:2,fret:1}] },
  Daug: { title:"Daug",position:1, mute:[6,5], fingers:[[4,0],[3,3,"3"],[2,3,"4"],[1,2,"2"]] },
  Eaug: { title:"Eaug",position:1, mute:[6], fingers:[[5,2,"2"],[4,2,"1"],[3,1,"1"],[2,0],[1,0]], barres:[{fromString:5,toString:4,fret:2}] },
  Faug: { title:"Faug",position:1, mute:[6,5], fingers:[[4,3,"3"],[3,2,"2"],[2,2,"1"],[1,1,"1"]], barres:[{fromString:2,toString:1,fret:1},{fromString:3,toString:2,fret:2}] },
  Gaug: { title:"Gaug",position:1, fingers:[[6,3,"3"],[5,2,"2"],[4,1,"1"],[3,0],[2,0],[1,0]] },
  Aaug: { title:"Aaug",position:1, mute:[6], fingers:[[5,0],[4,3,"3"],[3,2,"2"],[2,2,"1"],[1,0]], barres:[{fromString:3,toString:2,fret:2}] },
  
  // ========== SUSPENDED 2ND CHORDS ==========
  Csus2:{ title:"Csus2",position:1, mute:[6], fingers:[[5,3,"3"],[4,0],[3,0],[2,1,"1"],[1,3,"4"]] },
  Dsus2:{ title:"Dsus2",position:1, mute:[6,5], fingers:[[4,0],[3,2,"1"],[2,3,"3"],[1,0]] },
  Esus2:{ title:"Esus2",position:1, fingers:[[6,0],[5,2,"2"],[4,2,"3"],[3,1,"1"],[2,0],[1,0]] },
  Fsus2:{ title:"Fsus2",position:1, mute:[6], fingers:[[5,1,"1"],[4,3,"3"],[3,0],[2,1,"1"],[1,1,"1"]], barres:[{fromString:5,toString:2,fret:1},{fromString:2,toString:1,fret:1}] },
  Gsus2:{ title:"Gsus2",position:1, fingers:[[6,3,"3"],[5,0],[4,0],[3,0],[2,0],[1,3,"4"]] },
  Asus2:{ title:"Asus2",position:1, mute:[6], fingers:[[5,0],[4,2,"1"],[3,2,"2"],[2,0],[1,0]] },
  
  // ========== SUSPENDED 4TH CHORDS ==========
  Csus4:{ title:"Csus4",position:1, mute:[6], fingers:[[5,3,"4"],[4,3,"3"],[3,0],[2,1,"1"],[1,1,"2"]], barres:[{fromString:2,toString:1,fret:1}] },
  Dsus4:{ title:"Dsus4",position:1, mute:[6,5], fingers:[[4,0],[3,2,"1"],[2,3,"3"],[1,3,"4"]] },
  Esus4:{ title:"Esus4",position:1, fingers:[[6,0],[5,2,"2"],[4,2,"3"],[3,2,"4"],[2,0],[1,0]] },
  Fsus4:{ title:"Fsus4",position:1, mute:[6], fingers:[[5,3,"4"],[4,3,"3"],[3,3,"2"],[2,1,"1"],[1,1,"1"]], barres:[{fromString:5,toString:1,fret:1}] },
  Gsus4:{ title:"Gsus4",position:1, fingers:[[6,3,"2"],[5,3,"3"],[4,0],[3,0],[2,1,"1"],[1,3,"4"]] },
  Asus4:{ title:"Asus4",position:1, mute:[6], fingers:[[5,0],[4,2,"1"],[3,2,"2"],[2,3,"4"],[1,0]] },
};

function normalizeLabel(label: string): string {
  // First normalize enharmonics (sharps to flats)
  let normalized = label
    .replace(/G#/g, "Ab").replace(/D#/g, "Eb").replace(/A#/g, "Bb")
    .replace(/C#/g, "Db").replace(/F#/g, "Gb");
  
  // Handle half-diminished variations: m7♭5, m7b5, ø, ø7 → all become m7b5
  normalized = normalized
    .replace(/m7♭5/g, "m7b5")
    .replace(/ø7?/g, "m7b5");
  
  return normalized;
}
function lookupOpenShape(label: string): Shape | null {
  const base = normalizeLabel(label).trim();
  if (OPEN_SHAPES[base]) return OPEN_SHAPES[base];
  const root = base.split(/[\/\s]/)[0];
  return OPEN_SHAPES[root] || null;
}

function restyleSvg(svg: SVGElement) {
  svg.querySelectorAll("line, path, rect").forEach((el: any) => {
    const cls = (el.getAttribute("class") || "").toLowerCase();
    if (cls.includes("string") || cls.includes("fret") || cls.includes("nut") || el.tagName === "line") {
      el.setAttribute("stroke", THEME.gridLight);
    }
    if (cls.includes("nut") && el.tagName === "rect") {
      el.setAttribute("fill", THEME.gridLight);
    }
  });
  svg.querySelectorAll("circle").forEach((el: any) => {
    el.setAttribute("fill", THEME.dotsFill);
    el.setAttribute("stroke", THEME.dotsFill);
  });
  svg.querySelectorAll("text").forEach((el: any) => {
    // we suppress internal title; keep numbers light
    el.setAttribute("fill", THEME.dotsText);
  });
}

export default function GuitarTab({ chordLabel, width, height }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hostRef.current) return;
    hostRef.current.innerHTML = "";

    const PAD = 10;
    const w = Math.max(0, Math.floor(width));
    const h = Math.max(0, Math.floor(height));
    const innerSize = Math.max(48, Math.min(w, h) - PAD * 2);

    const chart = new SVGuitarChord(hostRef.current, {
      width: innerSize,
      height: innerSize,
      fixedDiagramPosition: true,
      watermark: "",
      fontFamily: "ui-sans-serif, system-ui",
      // do NOT set titleColor: we won't render title inside the SVG
    });

    const label = (chordLabel || "").trim();

    if (label) {
      const shape = lookupOpenShape(label);
      const safe = {
        title: "", // suppress internal title to avoid vertical jitter
        position: (shape?.position ?? 1),
        fingers: Array.isArray(shape?.fingers) ? shape!.fingers : ([] as Shape["fingers"]),
        barres: Array.isArray(shape?.barres) ? shape!.barres : ([] as NonNullable<Shape["barres"]>),
      };
      chart.configure({}).chord(safe as any);

      if (shape?.mute?.length) {
        const extra = shape.mute.map((s) => [s, 0, "x"] as const);
        chart.chord({
          title: "",
          position: safe.position,
          fingers: [...(safe.fingers || []), ...extra],
          barres: safe.barres,
        } as any);
      }
      chart.draw();
      const svg = hostRef.current.querySelector("svg");
      if (svg) restyleSvg(svg);
    } else {
      hostRef.current.textContent = "";
    }
  }, [chordLabel, width, height]);

  return (
    <div
      ref={hostRef}
      style={{
        width,
        height,
        padding: 10,
        border: `1px solid ${THEME.panelBorder}`,
        borderRadius: 10,
        background: THEME.panelBg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: THEME.title,
        fontFamily: "ui-sans-serif, system-ui",
        overflow: "hidden",
      }}
    />
  );
}
// >>> FILE END: src/components/GuitarTab.tsx