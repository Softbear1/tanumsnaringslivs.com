"use client";
import { useEffect, useRef, useState } from "react";

const DURATION = 1800;

type Props = {
  initialCount: number;
};

export default function VisitorCounter({ initialCount }: Props) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / DURATION, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * initialCount));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [started, initialCount]);

  return (
    <div ref={ref} className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-[var(--border)] rounded-full px-4 py-2 shadow-sm">
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-60" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--accent)]" />
      </span>
      <span className="text-sm text-[var(--muted)]">
        <span className="font-bold text-[var(--primary)] tabular-nums">{count.toLocaleString("sv-SE")}</span>
        {" "}besök senaste 30 dagarna
      </span>
    </div>
  );
}
