import { Trophy, Gamepad2, Waves } from "lucide-react";
import KobbvaktLeaderboard from "@/components/KobbvaktLeaderboard";

export interface Score {
  name: string;
  score: number;
  wave: number;
}

const PLAY_URL = "https://spel.tanumsnaringsliv.com/?utm_source=siten";

const MEDALS = ["#d9a441", "#b8bdc4", "#a86e3c"];

export function Leaderboard({ scores }: { scores: Score[] }) {
  if (!scores.length) return null;
  return (
    <div className="w-full max-w-sm">
      <div className="flex items-center gap-2 mb-3">
        <Trophy className="w-4 h-4" style={{ color: "#d9a441" }} />
        <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "#f0ede2" }}>
          Topplista
        </h3>
      </div>
      <ol className="space-y-2">
        {scores.slice(0, 3).map((s, i) => (
          <li
            key={`${s.name}-${i}`}
            className="flex items-center gap-3 rounded-xl px-3.5 py-2.5"
            style={{ backgroundColor: "rgba(240, 237, 226, 0.08)" }}
          >
            <span
              className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0"
              style={{ backgroundColor: MEDALS[i], color: "#0e2226" }}
            >
              {i + 1}
            </span>
            <span className="flex-1 min-w-0 truncate text-sm font-medium" style={{ color: "#f0ede2" }}>
              {s.name}
            </span>
            <span className="text-sm font-bold tabular-nums" style={{ color: "#d9a441" }}>
              {s.score.toLocaleString("sv-SE")} p
            </span>
            <span className="text-xs shrink-0" style={{ color: "rgba(240, 237, 226, 0.6)" }}>
              våg {s.wave}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

interface Props {
  scores?: Score[];
  variant?: "card" | "hero";
}

export default function GameSection({ scores, variant = "card" }: Props) {
  const hero = variant === "hero";
  return (
    <section
      className={hero ? "" : "border-t border-[var(--border)]"}
      style={{ background: "linear-gradient(180deg, #17444f, #0e2226)" }}
    >
      <div
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${hero ? "py-16 sm:py-20" : "py-10 sm:py-12"}`}
      >
        <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-12">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <span
                className="flex items-center justify-center w-8 h-8 rounded-lg"
                style={{ backgroundColor: "rgba(217, 164, 65, 0.15)" }}
              >
                <Waves className="w-4 h-4" style={{ color: "#d9a441" }} />
              </span>
              <span
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: "#d9a441" }}
              >
                Kobbvakt — spelet
              </span>
            </div>
            <h2
              className={`font-bold mb-3 ${hero ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"}`}
              style={{ color: "#f0ede2" }}
            >
              Försvara Grebbestad!
            </h2>
            <p
              className="leading-relaxed mb-6 max-w-xl"
              style={{ color: "rgba(240, 237, 226, 0.8)" }}
            >
              Ett mobilspel där du bygger torn på kobbarna och håller havsvarelserna borta
              från bryggan — och lär dig om Bohusläns arter på köpet.
            </p>
            <a
              href={PLAY_URL}
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-base transition-transform hover:scale-[1.03]"
              style={{ backgroundColor: "#d9a441", color: "#0e2226" }}
            >
              <Gamepad2 className="w-5 h-5" />
              Spela nu
            </a>
          </div>

          <KobbvaktLeaderboard initialScores={scores} />
        </div>
      </div>
    </section>
  );
}
