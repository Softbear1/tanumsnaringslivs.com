/** Hällristnings-solhjul — inspirerat av Tanums berömda hällristningar. */
export default function RockArtLogo({ size = 24, color = "currentColor" }: { size?: number; color?: string }) {
  const s = size;
  const cx = s / 2;
  const cy = s / 2;
  const r = s * 0.28;
  const sw = s * 0.075;
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none" aria-hidden="true">
      <circle cx={cx} cy={cy - s * 0.06} r={r} stroke={color} strokeWidth={sw} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const x1 = cx + Math.cos(rad) * r;
        const y1 = (cy - s * 0.06) + Math.sin(rad) * r;
        const x2 = cx + Math.cos(rad) * (r + s * 0.14);
        const y2 = (cy - s * 0.06) + Math.sin(rad) * (r + s * 0.14);
        return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={sw} strokeLinecap="round" />;
      })}
      <circle cx={cx - s * 0.26} cy={s * 0.72} r={sw * 0.9} fill={color} />
      <line x1={cx - s * 0.26} y1={s * 0.74} x2={cx - s * 0.26} y2={s * 0.87} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <line x1={cx - s * 0.26} y1={s * 0.87} x2={cx - s * 0.32} y2={s * 0.96} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <line x1={cx - s * 0.26} y1={s * 0.87} x2={cx - s * 0.20} y2={s * 0.96} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <line x1={cx - s * 0.26} y1={s * 0.79} x2={cx - s * 0.34} y2={s * 0.84} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <line x1={cx - s * 0.26} y1={s * 0.79} x2={cx - s * 0.18} y2={s * 0.84} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <circle cx={cx + s * 0.26} cy={s * 0.72} r={sw * 0.9} fill={color} />
      <line x1={cx + s * 0.26} y1={s * 0.74} x2={cx + s * 0.26} y2={s * 0.87} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <line x1={cx + s * 0.26} y1={s * 0.87} x2={cx + s * 0.20} y2={s * 0.96} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <line x1={cx + s * 0.26} y1={s * 0.87} x2={cx + s * 0.32} y2={s * 0.96} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <line x1={cx + s * 0.26} y1={s * 0.79} x2={cx + s * 0.18} y2={s * 0.84} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <line x1={cx + s * 0.26} y1={s * 0.79} x2={cx + s * 0.34} y2={s * 0.84} stroke={color} strokeWidth={sw} strokeLinecap="round" />
    </svg>
  );
}
