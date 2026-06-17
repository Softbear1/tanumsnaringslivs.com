"use client";
import { useState, useEffect, useRef } from "react";
import { Search, Wand2 } from "lucide-react";
import type { SeasonTheme } from "@/lib/season";
import type { Business, Category } from "@/lib/data";
import type { Ad } from "./AdCard";

const PLACEHOLDERS = [
  "Sök företag eller kategori...",
  "Vilket café har bäst frukost i Fjällbacka?",
  "Sök företag eller kategori...",
  "Letar efter snickare i Grebbestad...",
  "Sök företag eller kategori...",
  "Bästa restaurangen med havsvy?",
  "Sök företag eller kategori...",
  "VVS-firma nära Hamburgsund?",
];

type WeatherCondition = "sun" | "partly-cloudy" | "overcast" | "fog" | "rain" | "snow" | "storm";

function getWeatherCondition(code: number): WeatherCondition {
  if (code === 0) return "sun";
  if (code === 1 || code === 2) return "partly-cloudy";
  if (code === 3) return "overcast";
  if (code === 45 || code === 48) return "fog";
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "rain";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "snow";
  if ([95, 96, 99].includes(code)) return "storm";
  return "overcast";
}

type Props = {
  search: string;
  onSearch: (v: string) => void;
  onStartChat: (message: string) => void;
  theme: SeasonTheme;
  businesses: Business[];
  categories: Category[];
  ads: Ad[];
};

// Pre-generate stable random values to avoid hydration issues
/** Hällristnings-solhjul — samma komponent som i headern, kopieras hit för att undvika cirkulär import */
function RockArtLogo({ size = 24, color = "currentColor" }: { size?: number; color?: string }) {
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

/**
 * Subtil hällristningsbakgrund — tunna etsade linjer som ekar berghällens
 * karaktär utan att dominera. Bara synliga som ett svagt mönster mot mörkblå.
 */
function RockArtBackground() {
  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 800 260"
      style={{ opacity: 0.045 }}
    >
      {/* Solhjul uppe till höger */}
      <circle cx="680" cy="70" r="28" stroke="white" strokeWidth="1.5" fill="none" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <line
            key={deg}
            x1={680 + Math.cos(rad) * 28}
            y1={70 + Math.sin(rad) * 28}
            x2={680 + Math.cos(rad) * 42}
            y2={70 + Math.sin(rad) * 42}
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        );
      })}
      {/* Båt med stickfigurer */}
      <path d="M 100 170 Q 180 155 260 170" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M 100 170 Q 180 190 260 170" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {[130, 160, 190, 220].map((x) => (
        <g key={x}>
          <circle cx={x} cy={158} r="4" fill="white" />
          <line x1={x} y1={162} x2={x} y2={172} stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <line x1={x} y1={172} x2={x - 6} y2={180} stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <line x1={x} y1={172} x2={x + 6} y2={180} stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <line x1={x} y1={165} x2={x - 7} y2={170} stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <line x1={x} y1={165} x2={x + 7} y2={170} stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      ))}
      {/* Litet solhjul nere till vänster */}
      <circle cx="60" cy="210" r="16" stroke="white" strokeWidth="1.2" fill="none" />
      {[0, 60, 120, 180, 240, 300].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <line
            key={deg}
            x1={60 + Math.cos(rad) * 16}
            y1={210 + Math.sin(rad) * 16}
            x2={60 + Math.cos(rad) * 25}
            y2={210 + Math.sin(rad) * 25}
            stroke="white"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        );
      })}
      {/* Djurfigur (hjort-siluett) */}
      <path d="M 400 130 L 405 110 M 405 110 L 398 100 M 405 110 L 412 102" stroke="white" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <ellipse cx="410" cy="135" rx="14" ry="8" stroke="white" strokeWidth="1.4" fill="none" />
      <line x1="400" y1="143" x2="397" y2="158" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="406" y1="143" x2="404" y2="158" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="415" y1="143" x2="418" y2="158" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="420" y1="140" x2="424" y2="155" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

// Pre-generate stable random values to avoid hydration issues
const RAIN_DROPS = Array.from({ length: 25 }, (_, i) => ({
  left: ((i * 37 + 13) % 100),
  delay: ((i * 53) % 2000) / 1000,
  duration: 0.8 + ((i * 17) % 10) / 10,
  width: 1 + (i % 2),
}));

const SNOW_FLAKES = Array.from({ length: 18 }, (_, i) => ({
  left: ((i * 41 + 7) % 100),
  delay: ((i * 67) % 3000) / 1000,
  duration: 3 + ((i * 23) % 20) / 5,
  size: 3 + (i % 4),
}));

const CLOUD_BLOBS = Array.from({ length: 4 }, (_, i) => ({
  top: 10 + i * 20,
  width: 200 + i * 80,
  height: 60 + i * 20,
  duration: 18 + i * 6,
  delay: i * -4,
}));

function WeatherOverlay({ condition }: { condition: WeatherCondition }) {
  if (condition === "sun") {
    return (
      <>
        <style>{`
          @keyframes sun-pulse {
            0%, 100% { transform: scale(1); opacity: 0.18; }
            50% { transform: scale(1.2); opacity: 0.25; }
          }
        `}</style>
        <div
          style={{
            position: "absolute",
            top: "-80px",
            right: "-80px",
            width: "320px",
            height: "320px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(251,191,36,0.6) 0%, rgba(245,158,11,0.3) 40%, transparent 70%)",
            animation: "sun-pulse 4s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />
      </>
    );
  }

  if (condition === "rain") {
    return (
      <>
        <style>{`
          @keyframes rain-fall {
            0% { transform: translateY(-20px); opacity: 0; }
            10% { opacity: 0.12; }
            90% { opacity: 0.12; }
            100% { transform: translateY(100vh); opacity: 0; }
          }
        `}</style>
        {RAIN_DROPS.map((drop, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: 0,
              left: `${drop.left}%`,
              width: `${drop.width}px`,
              height: "60px",
              background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.12))",
              transform: "rotate(15deg)",
              animation: `rain-fall ${drop.duration}s linear ${drop.delay}s infinite`,
              pointerEvents: "none",
            }}
          />
        ))}
      </>
    );
  }

  if (condition === "storm") {
    return (
      <>
        <style>{`
          @keyframes storm-fall {
            0% { transform: translateY(-20px) rotate(20deg); opacity: 0; }
            10% { opacity: 0.2; }
            90% { opacity: 0.2; }
            100% { transform: translateY(100vh) rotate(20deg); opacity: 0; }
          }
          @keyframes lightning-flash {
            0%, 92%, 94%, 96%, 100% { opacity: 0; }
            93%, 95% { opacity: 0.06; }
          }
        `}</style>
        {RAIN_DROPS.map((drop, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: 0,
              left: `${drop.left}%`,
              width: `${drop.width + 1}px`,
              height: "80px",
              background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.2))",
              transform: "rotate(20deg)",
              animation: `storm-fall ${drop.duration * 0.7}s linear ${drop.delay * 0.5}s infinite`,
              pointerEvents: "none",
            }}
          />
        ))}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(180,200,255,1)",
            animation: "lightning-flash 5s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />
      </>
    );
  }

  if (condition === "snow") {
    return (
      <>
        <style>{`
          @keyframes snow-fall {
            0% { transform: translateY(-10px) translateX(0px); opacity: 0; }
            10% { opacity: 0.7; }
            50% { transform: translateY(50vh) translateX(10px); }
            90% { opacity: 0.7; }
            100% { transform: translateY(100vh) translateX(-5px); opacity: 0; }
          }
        `}</style>
        {SNOW_FLAKES.map((flake, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: 0,
              left: `${flake.left}%`,
              width: `${flake.size}px`,
              height: `${flake.size}px`,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.7)",
              animation: `snow-fall ${flake.duration}s ease-in-out ${flake.delay}s infinite`,
              pointerEvents: "none",
            }}
          />
        ))}
      </>
    );
  }

  if (condition === "partly-cloudy") {
    return (
      <>
        <style>{`
          @keyframes cloud-drift {
            0% { transform: translateX(-100px); }
            100% { transform: translateX(calc(100vw + 100px)); }
          }
        `}</style>
        {CLOUD_BLOBS.map((blob, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: `${blob.top}%`,
              left: "-200px",
              width: `${blob.width}px`,
              height: `${blob.height}px`,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.07)",
              filter: "blur(20px)",
              animation: `cloud-drift ${blob.duration}s linear ${blob.delay}s infinite`,
              pointerEvents: "none",
            }}
          />
        ))}
      </>
    );
  }

  if (condition === "fog" || condition === "overcast") {
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(100,110,120,0.12)",
          pointerEvents: "none",
        }}
      />
    );
  }

  return null;
}

export default function Hero({ search, onSearch, onStartChat, theme }: Props) {
  const [value, setValue] = useState(search);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [placeholderVisible, setPlaceholderVisible] = useState(true);
  const [focused, setFocused] = useState(false);
  const [weather, setWeather] = useState<WeatherCondition | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch weather from Open-Meteo
  useEffect(() => {
    fetch("https://api.open-meteo.com/v1/forecast?latitude=58.72&longitude=11.32&current=weather_code&timezone=Europe%2FStockholm")
      .then((r) => r.json())
      .then((data) => {
        const code = data?.current?.weather_code;
        if (typeof code === "number") {
          setWeather(getWeatherCondition(code));
        }
      })
      .catch(() => {
        // silently ignore — no overlay shown
      });
  }, []);

  // Rotate placeholder when idle
  useEffect(() => {
    if (focused || value) return;
    const id = setInterval(() => {
      setPlaceholderVisible(false);
      setTimeout(() => {
        setPlaceholderIdx((i) => (i + 1) % PLACEHOLDERS.length);
        setPlaceholderVisible(true);
      }, 200);
    }, 2500);
    return () => clearInterval(id);
  }, [focused, value]);

  // Keep local value in sync when search is cleared externally
  useEffect(() => { setValue(search); }, [search]);

  function handleChange(v: string) {
    setValue(v);
    // Typing naturally → filter mode
    onSearch(v);
  }

  function handleSubmit() {
    const text = value.trim();
    if (!text) return;
    // If it looks like a question rather than a keyword, open AI chat
    if (text.length > 20 || /\?|vill|letar|söker|behöver|hjälp|bästa/i.test(text)) {
      setValue("");
      onSearch("");
      onStartChat(text);
    }
    // else: already filtered by onSearch — no action needed
  }

  return (
    <section id="hero" className="relative overflow-hidden bg-[var(--primary)] text-white">
      {/* Subtil hällristningsbakgrund — etsad sten-känsla */}
      <RockArtBackground />

      {/* Mjuk ljusglow kopplad till årstid */}
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] opacity-[0.15] rounded-full blur-[80px] pointer-events-none" style={{ backgroundColor: theme.glow }} />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 opacity-20 rounded-full blur-[60px] pointer-events-none" style={{ backgroundColor: theme.glow }} />

      {/* Weather overlay */}
      {weather && <WeatherOverlay condition={weather} />}

      {/* Tunn accentlinje längs toppen — färgad efter årstid */}
      <div className="absolute top-0 left-0 right-0 h-[3px] opacity-80" style={{ backgroundColor: theme.accent }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Logga + rubrik — sammanhållen enhet */}
        <div className="flex items-start justify-between mb-7">
          <div className="flex items-center gap-4">
            {/* Hällristningslogga i hero-format */}
            <div
              className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
            >
              <RockArtLogo size={38} color="rgba(255,255,255,0.90)" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white leading-none tracking-tight">Tanum</h1>
              <p className="text-sm sm:text-base text-white/55 font-normal mt-1 leading-snug">
                Näringsliv, hantverk &amp; upplevelser
              </p>
            </div>
          </div>
        </div>

        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]" aria-hidden />
          <input
            ref={inputRef}
            type="search"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder={placeholderVisible ? PLACEHOLDERS[placeholderIdx] : ""}
            aria-label="Sök bland företag eller ställ en fråga"
            className="w-full pl-12 pr-14 py-4 rounded-xl bg-white text-[var(--primary)] placeholder:text-[var(--muted)] text-base shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-shadow"
          />
          {/* AI-trigger button */}
          <button
            onClick={() => { if (value.trim()) { handleSubmit(); } else { onStartChat("Vad kan du hjälpa mig med?"); } }}
            aria-label="Fråga AI:n"
            title="Fråga AI:n"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
          >
            <Wand2 className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-white/40 mt-2.5 tracking-wide">
          Skriv ett namn eller en kategori — eller ställ en fråga med AI
        </p>
      </div>
    </section>
  );
}
