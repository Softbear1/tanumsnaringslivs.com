"use client";
import { BusinessDraft, extractDraft } from "@/lib/chat";
import AdminChatPanel from "./AdminChatPanel";

type Props = {
  categories: Array<{ id: string; name: string }>;
  onDraft: (draft: BusinessDraft) => void;
  // When editing, pass the current listing so the assistant only changes what's asked.
  current?: BusinessDraft | null;
  greeting?: string;
};

// Conversational onboarding/editing: the owner describes (or amends) their
// business and the assistant assembles a listing draft, handed to a prefilled
// form for review.
export default function ListingChat({ categories, onDraft, current, greeting }: Props) {
  return (
    <AdminChatPanel<BusinessDraft>
      endpoint="/api/listing-chat"
      greeting={greeting ?? "Hej! Berätta vad ditt företag heter och vad ni gör, så fixar jag listningen åt dig."}
      hint="Beskriv ditt företag i chatten — du får granska allt innan det sparas."
      body={{
        categories: categories.map((c) => ({ id: c.id, name: c.name })),
        current: current ?? null,
      }}
      parse={(t) => {
        const { clean, draft } = extractDraft(t);
        return { clean, result: draft };
      }}
      onResult={onDraft}
    />
  );
}
