"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase-browser";
import { Leaderboard, type Score } from "@/components/GameSection";

// Module-level cache: repeated navigations within 5 min reuse the last result
// instead of re-querying Supabase. Read-only — we never write to the table.
let cached: { scores: Score[]; at: number } | null = null;
const TTL_MS = 5 * 60 * 1000;

export default function KobbvaktLeaderboard({ initialScores }: { initialScores?: Score[] }) {
  const [scores, setScores] = useState<Score[]>(initialScores ?? cached?.scores ?? []);

  useEffect(() => {
    if (initialScores) return; // server already provided fresh data
    if (cached && Date.now() - cached.at < TTL_MS) return;
    let alive = true;
    (async () => {
      try {
        const supabase = createBrowserClient();
        const { data } = await supabase
          .from("kobbvakt_highscores")
          .select("name, score, wave")
          .order("score", { ascending: false })
          .order("created_at", { ascending: true })
          .limit(3);
        if (data && data.length > 0) {
          cached = { scores: data, at: Date.now() };
          if (alive) setScores(data);
        }
      } catch {
        // Silent: the section renders pitch + CTA without a leaderboard.
      }
    })();
    return () => {
      alive = false;
    };
  }, [initialScores]);

  return <Leaderboard scores={scores} />;
}
