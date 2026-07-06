"use client";
import { useState, useRef } from "react";
import Image from "next/image";
import AIBoostTextarea from "./AIBoostTextarea";

interface Category {
  id: number | string;
  name: string;
}

interface Props {
  categories: Category[];
  business?: {
    name?: string;
    category_id?: string;
    description?: string;
    phone?: string;
    email?: string;
    website?: string | null;
    address?: string;
    initials?: string;
    logo_url?: string | null;
  };
  businessId?: string;
  onSubmit: (data: {
    name: string;
    category_id: string;
    description: string;
    phone: string;
    email: string;
    website: string | null;
    address: string;
    initials: string;
    logo_url: string | null;
  }) => Promise<void>;
  loading: boolean;
}

export default function BusinessForm({ categories, business, businessId, onSubmit, loading }: Props) {
  const [name, setName] = useState(business?.name ?? "");
  const [categoryId, setCategoryId] = useState(business?.category_id ?? "");
  const [description, setDescription] = useState(business?.description ?? "");
  const [phone, setPhone] = useState(business?.phone ?? "");
  const [email, setEmail] = useState(business?.email ?? "");
  const [website, setWebsite] = useState(business?.website ?? "");
  const [address, setAddress] = useState(business?.address ?? "");
  const [initials, setInitials] = useState(business?.initials ?? "");
  const [logoUrl, setLogoUrl] = useState<string | null>(business?.logo_url ?? null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  function handleInitials(v: string) {
    setInitials(v.toUpperCase().slice(0, 3));
  }

  function normalizeWebsite(url: string): string | null {
    if (!url.trim()) return null;
    if (/^https?:\/\//i.test(url)) return url.trim();
    return `https://${url.trim()}`;
  }

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !businessId) return;
    setLogoUploading(true);
    try {
      const { createBrowserClient } = await import("@/lib/supabase-browser");
      const supabase = createBrowserClient();
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${businessId}/logo.${ext}`;
      const { error: upErr } = await supabase.storage.from("logos").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from("logos").getPublicUrl(path);
      setLogoUrl(publicUrl + "?t=" + Date.now());
    } catch (err) {
      alert("Kunde inte ladda upp loggan: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLogoUploading(false);
    }
  }

  async function handleRemoveLogo() {
    setLogoUrl(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit({
        name,
        category_id: categoryId,
        description,
        phone,
        email,
        website: normalizeWebsite(website),
        address,
        initials,
        logo_url: logoUrl,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Något gick fel");
    }
  }

  const inputClass = "w-full px-4 py-3 rounded-xl border border-[var(--border)] text-[var(--primary)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-shadow bg-white";
  const labelClass = "block text-sm font-medium text-[var(--primary)] mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="sm:col-span-2">
          <label className={labelClass}>Företagsnamn *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Mitt Företag AB"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Kategori *</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            className={inputClass}
          >
            <option value="">Välj kategori...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={String(cat.id)}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Initialer (max 3 tecken) *</label>
          <div className="flex gap-3 items-center">
            <input
              type="text"
              value={initials}
              onChange={(e) => handleInitials(e.target.value)}
              required
              placeholder="ABC"
              maxLength={3}
              className={`${inputClass} flex-1 font-mono tracking-widest`}
            />
            <div
              className="w-12 h-12 rounded-xl bg-[var(--brand)] text-white flex items-center justify-center font-bold text-lg shrink-0"
              aria-label="Förhandsgranskning av initialer"
            >
              {initials || "?"}
            </div>
          </div>
        </div>

        {businessId && (
          <div className="sm:col-span-2">
            <label className={labelClass}>Logotyp (valfri)</label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-[var(--border)] flex items-center justify-center overflow-hidden bg-[var(--bg)] shrink-0">
                {logoUrl ? (
                  <Image src={logoUrl} alt="Logotyp" width={64} height={64} className="object-contain w-full h-full" />
                ) : (
                  <span className="text-2xl font-bold text-[var(--muted)]">{initials || "?"}</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                <button
                  type="button"
                  disabled={logoUploading}
                  onClick={() => logoInputRef.current?.click()}
                  className="text-sm px-3 py-1.5 border border-[var(--border)] rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {logoUploading ? "Laddar upp..." : logoUrl ? "Byt logotyp" : "Ladda upp logotyp"}
                </button>
                {logoUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="text-xs text-red-500 hover:text-red-700 text-left"
                  >
                    Ta bort logotyp
                  </button>
                )}
                <p className="text-xs text-[var(--muted)]">PNG eller JPG, max 2 MB</p>
              </div>
            </div>
          </div>
        )}

        <div className="sm:col-span-2">
          <label className={labelClass}>
            Beskrivning * <span className="text-[var(--muted)] font-normal">({description.length}/200)</span>
          </label>
          <AIBoostTextarea
            value={description}
            onChange={setDescription}
            maxLength={200}
            rows={3}
            placeholder="Beskriv verksamheten kortfattat..."
            context="företagsbeskrivning, max 200 tecken"
            className={`${inputClass} resize-none`}
          />
          <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-800 space-y-1">
            <p className="font-semibold">Tips för en bra beskrivning:</p>
            <ul className="list-disc list-inside space-y-0.5 text-blue-700">
              <li>Nämn vad ni erbjuder och var ni finns (t.ex. "i Fjällbacka")</li>
              <li>Lyft något unikt — erfarenhet, certifieringar, specialitet</li>
              <li>Undvik förkortningar och skriv ut hela meningar</li>
              <li><span className="font-medium">Exempel:</span> "Familjeföretag med 20 års erfarenhet av målning i Tanum. Certifierade hantverkare för invändigt och utvändigt arbete."</li>
            </ul>
          </div>
        </div>

        <div>
          <label className={labelClass}>Telefon *</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            placeholder="0525-123 45"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>E-post *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="info@foretag.se"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Webbplats (valfritt)</label>
          <input
            type="text"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="www.foretag.se"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Adress *</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            placeholder="Storgatan 1, Tanumshede"
            className={inputClass}
          />
        </div>
      </div>

      {error && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-6 bg-[var(--brand)] text-white rounded-xl font-semibold hover:bg-[var(--brand-hover)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Sparar..." : "Spara"}
      </button>
    </form>
  );
}
