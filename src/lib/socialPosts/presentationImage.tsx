// Brandad 1200×630-bild för "Dagens företagspresentation", enligt DESIGN.md
// (hav-900 bakgrund, sol-accent, solmotiv över granithäll och havslinje, Inter).
// Renderas med next/og (satori) i edge-runtime. Företagets logga bakas medvetet
// INTE in — satori-fetch av fjärrbilder är ömtåligt (webp m.m.) och får aldrig
// fälla hela bilden; istället visas en initial-avatar och TN-varumärket.

import { ImageResponse } from "next/og";

// Mörka logotypfärger (DESIGN.md §6 – mörk bakgrund).
const SOL = "#F0B45A";
const GRANIT = "#D49A8C";
const HAV = "#4FA8BE";
const BG = "#072B36"; // hav-900
const INK = "#F1EFE8";
const MUTED = "#B4B2A9";

export type BizForImage = {
  name: string;
  description: string;
  categoryName: string;
  postort: string | null;
  initials: string;
};

export type FontSpec = {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 600 | 700;
  style: "normal";
};

function nameSize(name: string): number {
  if (name.length > 34) return 52;
  if (name.length > 24) return 62;
  if (name.length > 16) return 74;
  return 84;
}

function truncate(text: string, max: number): string {
  const t = (text ?? "").trim().replace(/\s+/g, " ");
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd() + "…";
}

// Solen som stiger bakom granithällen över havslinjen — samma geometri som
// src/components/Logo.tsx, här som dekorativt bakgrundselement.
function BrandMark({ size }: { size: number }) {
  return (
    <svg width={size} height={(size * 132) / 180} viewBox="0 0 180 132" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="sea"><rect x="0" y="0" width="180" height="112" /></clipPath>
      </defs>
      <g clipPath="url(#sea)">
        <circle fill={SOL} cx="118" cy="62" r="26" />
        <path fill={GRANIT} d="M 2 112 C 12 66, 56 44, 90 44 C 124 44, 108 78, 136 96 C 148 104, 162 108, 174 112 Z" />
      </g>
      <line stroke={HAV} strokeWidth="6" strokeLinecap="round" x1="4" y1="114" x2="176" y2="114" />
    </svg>
  );
}

export function renderPresentationImage(biz: BizForImage, fonts: FontSpec[]): ImageResponse {
  const place = biz.postort ? `${biz.categoryName} · ${biz.postort}` : biz.categoryName;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: BG,
          color: INK,
          fontFamily: "Inter",
          padding: "72px",
          position: "relative",
        }}
      >
        {/* Dekorativt solmotiv, nedtonat, uppe till höger */}
        <div style={{ position: "absolute", top: "-30px", right: "-10px", display: "flex", opacity: 0.22 }}>
          <BrandMark size={420} />
        </div>

        {/* Eyebrow */}
        <div
          style={{
            display: "flex",
            fontSize: "24px",
            fontWeight: 700,
            letterSpacing: "3px",
            textTransform: "uppercase",
            color: SOL,
          }}
        >
          Dagens företagspresentation
        </div>

        {/* Företaget */}
        <div style={{ display: "flex", flexDirection: "column", maxWidth: "780px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "20px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "96px",
                height: "96px",
                borderRadius: "20px",
                background: GRANIT,
                color: BG,
                fontSize: "40px",
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {(biz.initials || biz.name.slice(0, 2)).toUpperCase()}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: `${nameSize(biz.name)}px`,
                fontWeight: 700,
                lineHeight: 1.05,
                letterSpacing: "-1px",
              }}
            >
              {biz.name}
            </div>
          </div>
          <div style={{ display: "flex", fontSize: "28px", color: HAV, fontWeight: 600, marginBottom: "18px" }}>
            {place}
          </div>
          <div style={{ display: "flex", fontSize: "30px", color: MUTED, lineHeight: 1.4 }}>
            {truncate(biz.description, 150)}
          </div>
        </div>

        {/* Varumärkesrad */}
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <BrandMark size={54} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: "26px", fontWeight: 700 }}>
              <span>Tanums</span>
              <span style={{ color: HAV, marginLeft: "8px" }}>Näringsliv</span>
            </div>
            <div style={{ display: "flex", fontSize: "16px", color: MUTED, letterSpacing: "2px", textTransform: "uppercase" }}>
              Hela Tanum. Ett näringsliv.
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: fonts.map((f) => ({ name: f.name, data: f.data, weight: f.weight, style: f.style })),
    },
  );
}
