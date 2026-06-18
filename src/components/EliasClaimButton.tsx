"use client";
import { useState } from "react";
import { BadgeCheck } from "lucide-react";
import dynamic from "next/dynamic";

const EliasClaimModal = dynamic(() => import("./EliasClaimModal"), { ssr: false });

interface Props {
  businessId: string;
  businessName: string;
}

export default function EliasClaimButton({ businessId, businessName }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center gap-1.5 bg-[var(--primary)] text-white px-4 py-2.5 rounded-xl font-medium hover:bg-[var(--primary)]/90 transition-colors text-sm whitespace-nowrap"
      >
        <BadgeCheck className="w-4 h-4" />
        Ta över företaget →
      </button>

      {open && (
        <EliasClaimModal
          businessId={businessId}
          businessName={businessName}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
