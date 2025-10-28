// components/ArrowButton.tsx — compact arrow-only button
import React from "react";
import { iconBtnStyle } from "../lib/ui";

type Props = {
  dir: "prev" | "next";
  onClick: () => void;
  size?: number;
  title?: string;
  active?: boolean;
};

export default function ArrowButton({ dir, onClick, size = 36, title, active = true }: Props) {
  const glyph = dir === "prev" ? "◀" : "▶";
  return (
    <button
      onClick={onClick}
      title={title || (dir === "prev" ? "Previous" : "Next")}
      style={iconBtnStyle(active, size)}
      aria-label={dir === "prev" ? "Previous" : "Next"}
    >
      {glyph}
    </button>
  );
}
