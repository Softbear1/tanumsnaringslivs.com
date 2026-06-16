import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Skeleton from "@/components/Skeleton";

export default function Loading() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-[var(--bg)]" aria-busy="true" aria-label="Laddar offertförfrågan">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="bg-white rounded-2xl border border-[var(--border)] p-6 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
          <div className="bg-white rounded-2xl border border-[var(--border)] p-6 space-y-3">
            <Skeleton className="h-4 w-40" />
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
