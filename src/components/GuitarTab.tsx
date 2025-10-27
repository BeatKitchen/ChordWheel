import React from "react";

type Props = {
  chordLabel: string | null;   // e.g., "Am7", "G7sus4", etc.
  width: number;
  height: number;
};

// Placeholder implementation.
// Later, replace inner div with svguitar output:
//   import { Svguitar } from "svguitar";
//   ...generate diagram into a ref...
export default function GuitarTab({ chordLabel, width, height }: Props){
  return (
    <div
      style={{
        width, height,
        border: "1px solid #374151",
        borderRadius: 8,
        background: "#0f172a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#e5e7eb",
        fontFamily: "ui-sans-serif, system-ui",
      }}
    >
      {chordLabel ? `Guitar: ${chordLabel}` : "Guitar Tab"}
    </div>
  );
}
