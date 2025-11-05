/*
 * SkillWheel.tsx - v3.3.1 USABILITY FIX
 * 
 * Changes:
 * - Increased timeout from 200ms to 2000ms (2 seconds)
 * - Much easier to select skills without menu disappearing
 * 
 * v3.3.0 Grid layout that opens on hover:
 * - Closed state: Square border (not circle), bigger icon (40px)
 * - Selected skill color shown in text
 * - Expert shows "EXPERT\n(all functions)" 
 * - Better readability
 */

import React, { useState } from "react";

type SkillLevel = "ROOKIE" | "NOVICE" | "SOPHOMORE" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";

interface SkillWheelProps {
  current: SkillLevel;
  onChange: (level: SkillLevel) => void;
}

const SKILL_LEVELS: SkillLevel[] = ["ROOKIE", "NOVICE", "SOPHOMORE", "ADVANCED", "EXPERT"];

const SKILL_ICONS: Record<SkillLevel, string> = {
  ROOKIE: "/assets/rookie.png",
  NOVICE: "/assets/novice.png",
  SOPHOMORE: "/assets/sophomore.png",
  INTERMEDIATE: "/assets/sophomore.png",
  ADVANCED: "/assets/advanced.png",
  EXPERT: "/assets/expert.png",
};

const SKILL_COLORS: Record<SkillLevel, string> = {
  ROOKIE: "#F2D74B",
  NOVICE: "#F0AD21",
  SOPHOMORE: "#5EEAD4",
  INTERMEDIATE: "#5EEAD4",
  ADVANCED: "#0EA5E9",
  EXPERT: "#39FF14",
};

const SKILL_LABELS: Record<SkillLevel, string> = {
  ROOKIE: "1. ROOKIE",
  NOVICE: "2. NOVICE",
  SOPHOMORE: "3. SOPHOMORE",
  INTERMEDIATE: "4. INTERMEDIATE",
  ADVANCED: "4. ADVANCED",
  EXPERT: "5. EXPERT\n(all functions)", // v3.3.0: Added line break
};

export default function SkillWheel({ current, onChange }: SkillWheelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = React.useRef<number>();

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = window.setTimeout(() => {
      setIsOpen(false);
    }, 2000); // ✅ v3.3.1: Increased from 200ms - much easier to use!
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  // Closed state - v3.3.0: Square border, bigger icon, better text
  if (!isOpen) {
    return (
      <div 
        style={{ 
          width: 100, // Wider for text
          height: 72, // Taller for multi-line text
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'flex-end', // Right-justify
          gap: 4 
        }}
        onMouseEnter={handleMouseEnter}
        onTouchStart={handleTouchStart}
      >
        <button
          style={{
            width: 50,  // v3.3.0: Increased from 44
            height: 50, // v3.3.0: Increased from 44
            padding: 5,
            border: `2px solid ${SKILL_COLORS[current]}`,
            borderRadius: 8, // v3.3.0: Square corners (was 50% circle)
            background: "#0a0a0a",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
          }}
          title={`Skill Level: ${SKILL_LABELS[current].replace('\n', ' ')} - Hover to change`}
        >
          <img 
            src={SKILL_ICONS[current]} 
            alt={current}
            style={{ width: 40, height: 40, display: 'block' }} // v3.3.0: Increased from 32
          />
        </button>
        <div style={{ 
          fontSize: 9, 
          color: SKILL_COLORS[current], // v3.3.0: Always in color
          fontWeight: 600, 
          textTransform: 'uppercase',
          whiteSpace: 'pre-line', // v3.3.0: Allow line breaks for EXPERT
          textAlign: 'right',
          lineHeight: 1.2
        }}>
          {SKILL_LABELS[current]}
        </div>
      </div>
    );
  }

  // Open state - grid tray anchored to right, expands left
  return (
    <div
      style={{ 
        width: 100, // Match closed state
        height: 72, // Match closed state (updated)
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end", // Align to right
        gap: 4,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
    >
      {/* Grid of skill buttons with labels */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0, // Anchor to right
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 12, // More space between buttons
          padding: 8,
          background: "#0a0a0a",
          border: "2px solid #374151",
          borderRadius: 8,
          boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
          zIndex: 10000,
        }}
      >
        {SKILL_LEVELS.map((level, index) => {
          const isActive = level === current;
          const num = index + 1;
          const shortLabel = level === 'ROOKIE' ? 'ROOKIE'
            : level === 'NOVICE' ? 'NOVICE'
            : level === 'SOPHOMORE' ? 'SOPH'
            : level === 'ADVANCED' ? 'ADV'
            : 'EXPERT';
          
          return (
            <div
              key={level}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
              }}
            >
              <button
                onClick={() => {
                  onChange(level);
                  setIsOpen(false);
                }}
                style={{
                  width: 40,
                  height: 40,
                  padding: 3,
                  border: `2px solid ${isActive ? SKILL_COLORS[level] : '#374151'}`,
                  borderRadius: 6,
                  background: isActive ? '#1a1a1a' : '#0a0a0a',
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = SKILL_COLORS[level];
                  e.currentTarget.style.boxShadow = `0 0 8px ${SKILL_COLORS[level]}`;
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = '#374151';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
                title={`${num}. ${level}`}
              >
                <img 
                  src={SKILL_ICONS[level]} 
                  alt={level}
                  style={{ width: 30, height: 30, display: 'block' }}
                />
                {/* Number badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: -6,
                    right: -6,
                    width: 16,
                    height: 16,
                    background: SKILL_COLORS[level],
                    color: '#000',
                    borderRadius: '50%',
                    fontSize: 10,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {num}
                </div>
              </button>
              {/* Label below each button */}
              <div
                style={{
                  fontSize: 8,
                  fontWeight: 600,
                  color: isActive ? SKILL_COLORS[level] : '#999',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                  textAlign: 'center',
                }}
              >
                {shortLabel}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}