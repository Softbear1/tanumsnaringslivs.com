// Shimmering placeholder block. Styling lives in globals.css (.skeleton).
export default function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden />;
}
