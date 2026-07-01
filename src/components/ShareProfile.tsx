"use client";
import { useEffect, useRef, useState } from "react";
import { Copy, Check, QrCode } from "lucide-react";
import QRCode from "qrcode";

interface Props {
  businessId: string;
  businessName: string;
}

export default function ShareProfile({ businessId, businessName }: Props) {
  const url = `https://tanumsnaringsliv.com/foretag/${businessId}`;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, { width: 160, margin: 1 }, () => {});
    }
  }, [url]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  return (
    <div className="bg-white rounded-2xl border border-[var(--border)] shadow-sm p-6">
      <div className="flex items-center gap-2 mb-1">
        <QrCode className="w-5 h-5 text-[var(--accent)]" />
        <h2 className="font-semibold text-[var(--primary)]">Dela din profil</h2>
      </div>
      <p className="text-sm text-[var(--muted)] mb-4">
        Länka från din webbplats eller sociala medier, eller skriv ut QR-koden till
        skyltfönstret — &quot;Hitta oss på Tanums Näringsliv&quot;.
      </p>
      <div className="flex flex-col sm:flex-row items-start gap-5">
        <div className="flex-1 w-full min-w-0">
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={url}
              onFocus={(e) => e.currentTarget.select()}
              className="flex-1 min-w-0 text-sm px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--muted)]"
            />
            <button
              onClick={copy}
              className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] transition-colors shrink-0"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Kopierad" : "Kopiera"}
            </button>
          </div>
        </div>
        <div className="text-center">
          <canvas ref={canvasRef} className="rounded-lg border border-[var(--border)]" aria-label={`QR-kod till ${businessName}s profil`} />
          <p className="text-[11px] text-[var(--muted)] mt-1.5">Högerklicka för att spara bilden</p>
        </div>
      </div>
    </div>
  );
}
