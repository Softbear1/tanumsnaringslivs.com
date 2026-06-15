"use client";
import { useState } from "react";
import { Category, Business } from "@/lib/data";
import { staticCategories } from "@/lib/data";

type FormData = {
  name: string;
  category_id: string;
  description: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  initials: string;
};

type Props = {
  categories: Category[];
  business?: Business;
  onSubmit: (data: FormData) => Promise<void>;
  loading: boolean;
};

export default function BusinessForm({ categories, business, onSubmit, loading }: Props) {
  const [form, setForm] = useState<FormData>({
    name: business?.name ?? "",
    category_id: business?.categoryId ?? categories[0]?.id ?? "",
    description: business?.description ?? "",
    phone: business?.phone ?? "",
    email: business?.email ?? "",
    website: business?.website ?? "",
    address: business?.address ?? "",
    initials: business?.initials ?? "",
  });

  const cat = categories.find((c) => c.id === form.category_id) ?? staticCategories[0];

  function set(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Initials preview */}
      <div className="flex items-center gap-4 p-4 bg-[var(--bg)] rounded-xl">
        <div
          className="w-16 h-16 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0"
          style={{ backgroundColor: cat?.bgColor ?? "#F3F4F6", color: cat?.color ?? "#374151" }}
        >
          {form.initials || "??"}
        </div>
        <div>
          <p className="font-semibold text-[var(--primary)]">{form.name || "Företagsnamn"}</p>
          <span
            className="inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1"
            style={{ backgroundColor: cat?.bgColor, color: cat?.color }}
          >
            {cat?.name}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Företagsnamn" required>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            required
            placeholder="Mitt Företag AB"
            className={inputClass}
          />
        </Field>

        <Field label="Initialer (visas i logotyp)" required>
          <input
            type="text"
            value={form.initials}
            onChange={(e) => set("initials", e.target.value.toUpperCase().slice(0, 3))}
            required
            maxLength={3}
            placeholder="MF"
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Kategori" required>
        <select
          value={form.category_id}
          onChange={(e) => set("category_id", e.target.value)}
          className={inputClass}
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </Field>

      <Field label={`Beskrivning (${form.description.length}/200)`} required>
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value.slice(0, 200))}
          required
          rows={3}
          placeholder="Beskriv vad ni erbjuder och vad som gör er unika..."
          className={`${inputClass} resize-none`}
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Telefon" required>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            required
            placeholder="0525-123 45"
            className={inputClass}
          />
        </Field>

        <Field label="E-post" required>
          <input
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            required
            placeholder="info@mittforetag.se"
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Webbplats (valfritt)">
          <input
            type="text"
            value={form.website}
            onChange={(e) => set("website", e.target.value)}
            placeholder="www.mittforetag.se"
            className={inputClass}
          />
        </Field>

        <Field label="Adress" required>
          <input
            type="text"
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
            required
            placeholder="Storgatan 1, Tanumshede"
            className={inputClass}
          />
        </Field>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-[var(--primary)] text-white rounded-xl font-medium hover:bg-[#152E3D] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Sparar..." : business ? "Spara ändringar" : "Lägg till företag"}
      </button>
    </form>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--primary)] mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full px-3 py-2.5 border border-[var(--border)] rounded-lg text-sm text-[var(--primary)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 focus:border-[var(--accent)] transition-all bg-white";
