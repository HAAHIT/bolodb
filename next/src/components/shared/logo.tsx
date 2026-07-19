"use client";

interface LogoProps {
  size?: number;
  showText?: boolean;
  tagline?: string;
}

export function Logo({ size = 28, showText = true, tagline }: LogoProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <svg width={size} height={size} viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M 52 44 Q 52 30 66 30 L 190 30 Q 204 30 204 44 L 204 138 Q 204 152 190 152 L 116 152 L 88 176 L 92 152 L 66 152 Q 52 152 52 138 Z" stroke="var(--brand)" strokeWidth="6" fill="none"/>
        <g stroke="var(--brand)" strokeWidth="6" strokeLinecap="round" fill="none">
          <ellipse cx="128" cy="66" rx="34" ry="11"/>
          <path d="M 94 66 L 94 108 Q 94 119 128 119 Q 162 119 162 108 L 162 66"/>
          <path d="M 94 87 Q 94 98 128 98 Q 162 98 162 87"/>
        </g>
        <circle cx="182" cy="46" r="3.5" fill="var(--brand)"/>
      </svg>
      {showText && (
        <div style={{ lineHeight: 1 }}>
          <div style={{ fontWeight: 800, fontSize: size * 0.66, letterSpacing: "-.02em", color: "var(--ink)" }}>
            Bolo<span style={{ color: "var(--brand)" }}>DB</span>
          </div>
          {tagline && (
            <div style={{ fontSize: "11.5px", color: "var(--faint)", fontWeight: 600, marginTop: 3 }}>{tagline}</div>
          )}
        </div>
      )}
    </div>
  );
}
