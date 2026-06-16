import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Skeleton from "@/components/Skeleton";

export default function Loading() {
  return (
    <>
      <Header />
      <main className="flex-1" aria-busy="true" aria-label="Laddar innehåll">
        {/* Hero placeholder */}
        <section className="bg-[var(--primary)] px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-2xl space-y-4">
              <Skeleton className="h-7 w-44 rounded-full !bg-white/10" />
              <Skeleton className="h-12 w-full !bg-white/10" />
              <Skeleton className="h-12 w-2/3 !bg-white/10" />
              <Skeleton className="h-14 w-full mt-4 !bg-white/15" />
            </div>
          </div>
        </section>

        {/* Category + card grid placeholder */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-wrap gap-2 mb-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-28 rounded-full" />
            ))}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[var(--border)] p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-12 h-12 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
