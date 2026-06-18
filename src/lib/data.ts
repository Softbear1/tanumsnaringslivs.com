export type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  sortOrder: number;
};

export type Business = {
  id: string;
  name: string;
  categoryId: string;
  description: string;
  phone: string;
  email: string;
  website?: string;
  address: string;
  initials: string;
  boosted: boolean;
  featured: boolean;
  rating: number;
  reviewCount: number;
  logoUrl?: string;
  claimed: boolean;
};

// Keep static data for SQL seed generation reference and local fallback
export const staticCategories: Category[] = [
  { id: "bygg",      name: "Bygg & Hantverk",       icon: "Hammer",          color: "#C2410C", bgColor: "#FFF7ED", sortOrder: 1 },
  { id: "restaurang",name: "Restaurang & Café",      icon: "UtensilsCrossed", color: "#0369A1", bgColor: "#F0F9FF", sortOrder: 2 },
  { id: "skonhet",   name: "Skönhet & Hälsa",        icon: "Sparkles",        color: "#7C3AED", bgColor: "#F5F3FF", sortOrder: 3 },
  { id: "tjanster",  name: "Tjänster & Konsult",     icon: "Briefcase",       color: "#1D4ED8", bgColor: "#EFF6FF", sortOrder: 4 },
  { id: "butiker",   name: "Butiker & Handel",       icon: "ShoppingBag",     color: "#0F766E", bgColor: "#F0FDFA", sortOrder: 5 },
  { id: "turism",    name: "Turism & Upplevelser",   icon: "Map",             color: "#047857", bgColor: "#ECFDF5", sortOrder: 6 },
  { id: "fastighet", name: "Fastighet",              icon: "Home",            color: "#B45309", bgColor: "#FFFBEB", sortOrder: 7 },
  { id: "transport", name: "Transport",              icon: "Truck",           color: "#334155", bgColor: "#F8FAFC", sortOrder: 8 },
  { id: "lantbruk",  name: "Lantbruk & Fiske",       icon: "Fish",            color: "#15803D", bgColor: "#F0FDF4", sortOrder: 9 },
  { id: "industri",  name: "Industri & Tillverkning",icon: "Factory",         color: "#78716C", bgColor: "#F5F5F4", sortOrder: 10 },
  { id: "it",        name: "IT & Teknik",            icon: "Monitor",         color: "#374151", bgColor: "#F9FAFB", sortOrder: 11 },
];

// Inga exempelföretag — katalogen seedas från SCB:s företagsregister och fylls
// på av riktiga företagare. Tom fallback = aldrig fiktiva företag i UI.
export const staticBusinesses: Business[] = [];

// Helper used by components when data is passed as props
export function getCategory(categories: Category[], id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}
