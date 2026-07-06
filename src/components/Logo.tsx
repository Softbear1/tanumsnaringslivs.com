// Logotyp enligt DESIGN.md §6: sol som stiger bakom en granithäll över en havslinje.

const LIGHT = { sol: "#E8A13C", granit: "#C4877A", hav: "#16657A" };
const DARK = { sol: "#F0B45A", granit: "#D49A8C", hav: "#4FA8BE" };

export function TnIcon({ size = 32, dark = false }: { size?: number; dark?: boolean }) {
  const c = dark ? DARK : LIGHT;
  return (
    <svg
      viewBox="0 0 180 132"
      width={size}
      height={(size * 132) / 180}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Tanums Näringsliv"
    >
      <defs>
        <clipPath id="tn-sea-icon">
          <rect x="0" y="0" width="180" height="112" />
        </clipPath>
      </defs>
      <g clipPath="url(#tn-sea-icon)">
        <circle fill={c.sol} cx="118" cy="62" r="26" />
        <path
          fill={c.granit}
          d="M 2 112 C 12 66, 56 44, 90 44 C 124 44, 108 78, 136 96 C 148 104, 162 108, 174 112 Z"
        />
      </g>
      <line stroke={c.hav} strokeWidth="6" strokeLinecap="round" x1="4" y1="114" x2="176" y2="114" />
    </svg>
  );
}
