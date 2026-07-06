import Skeleton from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--bg)]" aria-busy="true" aria-label="Laddar admin-portalen">
      <header className="bg-[var(--brand)] text-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Skeleton className="h-5 w-40 !bg-white/15" />
          <Skeleton className="h-8 w-24 !bg-white/15" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-2">
            <Skeleton className="h-7 w-44" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[var(--border)] p-5 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-20 rounded-full" />
                </div>
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
