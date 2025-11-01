// SkillWheel_Alternative.tsx - Center icon updates on hover
// Radial text labels, no outer icon previews
// Simpler, cleaner design

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
  ROOKIE: "ROOKIE",
  NOVICE: "NOVICE",
  SOPHOMORE: "SOPHOMORE",
  INTERMEDIATE: "INTERMEDIATE",
  ADVANCED: "ADVANCED",
  EXPERT: "EXPERT",
};

export default function SkillWheel({ current, onChange }: SkillWheelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredLevel, setHoveredLevel] = useState<SkillLevel | null>(null);
  const timeoutRef = React.useRef<number>();
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Display hovered level or current level
  const displayLevel = hoveredLevel || current;

  // Open on hover/touch, close with delay when mouse leaves
  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = window.setTimeout(() => {
      setIsOpen(false);
      setHoveredLevel(null);
    }, 200);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  // Closed state
  if (!isOpen) {
    return (
      <div 
        style={{ 
          width: 52, 
          height: 68, // Fixed height to prevent shift
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: 4 
        }}
        onMouseEnter={handleMouseEnter}
        onTouchStart={handleTouchStart}
      >
        <button
          style={{
            width: 52,
            height: 52,
            padding: 6,
            border: `2px solid ${SKILL_COLORS[current]}`,
            borderRadius: "50%",
            background: "#0a0a0a",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
          }}
          title={`Skill Level: ${SKILL_LABELS[current]} - Hover to change`}
        >
          <img 
            src={SKILL_ICONS[current]} 
            alt={current}
            style={{ width: 36, height: 36, display: 'block' }}
          />
        </button>
        <div style={{ fontSize: 9, color: SKILL_COLORS[current], fontWeight: 600, textTransform: 'uppercase' }}>
          {current === 'SOPHOMORE' ? 'SOPH' : current === 'ADVANCED' ? 'ADV' : current}
        </div>
      </div>
    );
  }

  // Open state
  const radius = 125; // Increased to avoid label collision
  const startAngle = 80;
  const endAngle = 190;
  const arcSpan = endAngle - startAngle;
  const segmentAngle = arcSpan / (SKILL_LEVELS.length - 1);
  const reversedLevels = [...SKILL_LEVELS].reverse();

  return (
    <div
      ref={containerRef}
      style={{ 
        position: "relative",
        width: 52, 
        height: 68, // Match closed state
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
    >
      {/* Center button - shows hovered or current level */}
      <button
        style={{
          width: 52,
          height: 52,
          padding: 6,
          border: `3px solid ${SKILL_COLORS[displayLevel]}`,
          borderRadius: "50%",
          background: "#0a0a0a",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 9999,
          transition: "all 0.2s",
          boxShadow: hoveredLevel ? `0 0 20px ${SKILL_COLORS[displayLevel]}` : 'none',
        }}
        title={SKILL_LABELS[displayLevel]}
      >
        <img 
          src={SKILL_ICONS[displayLevel]} 
          alt={displayLevel}
          style={{ width: 36, height: 36, display: 'block', transition: 'all 0.2s' }}
        />
      </button>

      {/* No label below when open - border color indicates selection */}

      {/* SVG for wedges with radial text */}
      <svg
        width={radius * 2.3}
        height={radius * 2.3}
        viewBox={`0 0 ${radius * 2.3} ${radius * 2.3}`}
        style={{
          position: "absolute",
          top: 26 - radius * 1.15,
          left: 26 - radius * 1.15,
          pointerEvents: "none",
          zIndex: 9998,
        }}
      >
        {reversedLevels.map((level, index) => {
          const angle = startAngle + index * segmentAngle;
          const isActive = level === current;
          const isHovered = level === hoveredLevel;
          
          // Wedge path
          const innerR = 0; // Start at center - no gap in hover area
          const outerR = radius;
          const wedgeWidth = segmentAngle * 0.7; // Narrower wedges (70% vs 85%)
          
          const angleRad1 = ((angle - wedgeWidth / 2) * Math.PI) / 180;
          const angleRad2 = ((angle + wedgeWidth / 2) * Math.PI) / 180;
          
          const centerX = radius * 1.15;
          const centerY = radius * 1.15;
          
          const x1 = centerX + innerR * Math.cos(angleRad1);
          const y1 = centerY + innerR * Math.sin(angleRad1);
          const x2 = centerX + outerR * Math.cos(angleRad1);
          const y2 = centerY + outerR * Math.sin(angleRad1);
          const x3 = centerX + outerR * Math.cos(angleRad2);
          const y3 = centerY + outerR * Math.sin(angleRad2);
          const x4 = centerX + innerR * Math.cos(angleRad2);
          const y4 = centerY + innerR * Math.sin(angleRad2);
          
          const pathD = `M ${x1} ${y1} L ${x2} ${y2} A ${outerR} ${outerR} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${innerR} ${innerR} 0 0 0 ${x1} ${y1} Z`;
          
          // Text position and orientation
          // Position text further out on the radius to avoid overlap at center
          const textRadius = outerR * 0.7; // 70% of radius (further out)
          const textAngle = angle;
          const textAngleRad = (textAngle * Math.PI) / 180;
          const textX = centerX + textRadius * Math.cos(textAngleRad);
          const textY = centerY + textRadius * Math.sin(textAngleRad);
          
          // Rotate text to align ALONG the radius, reading from outer to inner
          // Text should point from outside toward center (like a spoke)
          let textRotation = textAngle + 180; // Point inward (180° from the angle)
          
          // Keep text readable - if it would be upside down, flip it
          // For angles on right side (270° to 90°), add 180° to keep readable
          if (textAngle < 90 || textAngle > 270) {
            textRotation += 180;
          }
          
          const labelText = level === 'SOPHOMORE' ? 'SOPH' : level === 'ADVANCED' ? 'ADV' : level;
          
          return (
            <g key={level}>
              {/* Wedge */}
              <path
                d={pathD}
                fill={isHovered ? SKILL_COLORS[level] : isActive ? `${SKILL_COLORS[level]}40` : "#1a1a1a"}
                stroke={SKILL_COLORS[level]}
                strokeWidth={isActive ? 3 : isHovered ? 2.5 : 1.5}
                opacity={isHovered ? 1 : 0.7}
                style={{ 
                  pointerEvents: "all",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={() => setHoveredLevel(level)}
                onMouseLeave={() => setHoveredLevel(null)}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  setHoveredLevel(level);
                }}
                onTouchEnd={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onChange(level);
                  setIsOpen(false);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(level);
                }}
              />
              
              {/* Radial Text - oriented from outer edge toward center */}
              <text
                x={textX}
                y={textY}
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${textRotation}, ${textX}, ${textY})`}
                fill={isHovered ? "#fff" : isActive ? SKILL_COLORS[level] : "#999"}
                fontSize={9}
                fontWeight={isHovered ? 700 : isActive ? 600 : 500}
                letterSpacing={0.3}
                style={{
                  pointerEvents: "none",
                  transition: "all 0.15s",
                  textTransform: "uppercase",
                }}
              >
                {labelText}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}