import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Skeleton from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-10" aria-busy="true" aria-label="Laddar dina förfrågningar">
        <Skeleton className="h-7 w-64 mb-2" />
        <Skeleton className="h-4 w-40 mb-8" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[var(--border)] p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <Skeleton className="h-4 w-3/5" />
                <Skeleton className="h-6 w-24 rounded-lg" />
              </div>
              <Skeleton className="h-3 w-28" />
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
