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
  C:  { title:"C",  position:1, mute:[6], fingers:[[5,3,"3"],[4,2,"2"],[3,0],[2,1,"1"],[1,0]] },
  G:  { title:"G",  position:1, fingers:[[6,3,"2"],[5,2,"1"],[4,0],[3,0],[2,0],[1,3,"3"]] },
  D:  { title:"D",  position:1, mute:[6,5], fingers:[[4,0],[3,2,"1"],[2,3,"3"],[1,2,"2"]] },
  A:  { title:"A",  position:1, mute:[6], fingers:[[5,0],[4,2,"1"],[3,2,"2"],[2,2,"3"],[1,0]] },
  E:  { title:"E",  position:1, fingers:[[6,0],[5,2,"2"],[4,2,"3"],[3,1,"1"],[2,0],[1,0]] },
  Am: { title:"Am", position:1, mute:[6], fingers:[[5,0],[4,2,"2"],[3,2,"3"],[2,1,"1"],[1,0]] },
  Em: { title:"Em", position:1, fingers:[[6,0],[5,2,"2"],[4,2,"3"],[3,0],[2,0],[1,0]] },
  Dm: { title:"Dm", position:1, mute:[6,5], fingers:[[4,0],[3,2,"2"],[2,3,"3"],[1,1,"1"]] },
  F:  {
    title:"F", position:1,
    fingers:[[6,1,"1"],[5,3,"3"],[4,3,"4"],[3,2,"2"],[2,1,"1"],[1,1,"1"]],
    barres:[{ fromString:6, toString:1, fret:1, text:"1" }],
  },
  Fmaj7: {
    title:"Fmaj7", position:1, mute:[6],
    fingers:[[5,3,"3"],[4,3,"4"],[3,2,"2"],[2,1,"1"],[1,0]],
  },
  G7: {
    title:"G7", position:1,
    fingers:[[6,3,"2"],[5,2,"1"],[4,0],[3,0],[2,0],[1,1,"3"]],
  },
};

function normalizeLabel(label: string): string {
  return label
    .replace(/G#/g, "Ab").replace(/D#/g, "Eb").replace(/A#/g, "Bb")
    .replace(/C#/g, "Db").replace(/F#/g, "Gb");
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
