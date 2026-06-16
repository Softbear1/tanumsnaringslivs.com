"use client";
import { AdDraft, extractAdDraft } from "@/lib/chat";
import AdminChatPanel from "./AdminChatPanel";

type Props = {
  categories: Array<{ id: string; name: string }>;
  businessName: string;
  onDraft: (ad: AdDraft) => void;
};

// Conversational ad creation: the owner says what they want to promote and the
// assistant drafts a headline/body, handed to the ad form for review.
export default function AdChat({ categories, businessName, onDraft }: Props) {
  return (
    <AdminChatPanel<AdDraft>
      endpoint="/api/ad-chat"
      greeting="Vad vill du annonsera om? Beskriv erbjudandet så formulerar jag en annons."
      hint="Beskriv erbjudandet — du får granska annonsen innan den skapas."
      body={{
        categories: categories.map((c) => ({ id: c.id, name: c.name })),
        businessName,
      }}
      parse={(t) => {
        const { clean, ad } = extractAdDraft(t);
        return { clean, result: ad };
      }}
      onResult={onDraft}
    />
  );
}
