"use client";
import { useState, useRef } from "react";
import { Sparkles } from "lucide-react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  context?: string;
  rows?: number;
  placeholder?: string;
  maxLength?: number;
  required?: boolean;
  className?: string;
  name?: string;
}

export default function AIBoostTextarea({
  value,
  onChange,
  context,
  rows = 3,
  placeholder,
  maxLength,
  required,
  className = "",
  name,
}: Props) {
  const [boosting, setBoosting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function handleBoost() {
    if (!value.trim() || boosting) return;
    setBoosting(true);
    try {
      const res = await fetch("/api/ai-boost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: value, context }),
      });
      const data = await res.json() as { text?: string; error?: string };
      if (data.text) {
        const capped = maxLength ? data.text.slice(0, maxLength) : data.text;
        onChange(capped);
      }
    } finally {
      setBoosting(false);
      textareaRef.current?.focus();
    }
  }

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        name={name}
        value={value}
        onChange={(e) => onChange(maxLength ? e.target.value.slice(0, maxLength) : e.target.value)}
        required={required}
        rows={rows}
        placeholder={placeholder}
        className={`${className} pr-10`}
      />
      <button
        type="button"
        onClick={handleBoost}
        disabled={boosting || !value.trim()}
        title="AI-boost: förbättra texten"
        className={`absolute right-2.5 top-2.5 p-1 rounded-md transition-colors ${
          boosting
            ? "text-[var(--accent)] opacity-60 cursor-wait"
            : value.trim()
            ? "text-[var(--accent)] hover:bg-[var(--accent)]/10"
            : "text-[var(--muted)] opacity-30 cursor-not-allowed"
        }`}
      >
        <Sparkles className={`w-4 h-4 ${boosting ? "animate-pulse" : ""}`} />
      </button>
    </div>
  );
}
