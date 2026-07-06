import { Briefcase, MapPin, ArrowRight } from "lucide-react";

const TYPE_LABELS: Record<string, string> = {
  sommarjobb: "Sommarjobb",
  deltid: "Deltid",
  heltid: "Heltid",
  praktik: "Praktik",
};

const TYPE_COLORS: Record<string, string> = {
  sommarjobb: "bg-[var(--boost-bg)] text-[var(--boost)]",
  deltid: "bg-[var(--accent-light)] text-[var(--brand-hover)]",
  heltid: "bg-[var(--success-bg)] text-[var(--success)]",
  praktik: "bg-[var(--granit-50)] text-[var(--granit-700)]",
};

interface Job {
  id: string;
  title: string;
  location: string;
  job_type: string;
}

export default function JobSpotlight({ jobs }: { jobs: Job[] }) {
  if (!jobs.length) return null;
  return (
    <section className="bg-[var(--bg)] border-t border-[var(--border)] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[var(--boost)]" />
            <h2 className="font-semibold text-[var(--primary)] text-base">Aktuella sommarjobb</h2>
          </div>
          <a
            href="/sommarjobb"
            className="flex items-center gap-1 text-sm text-[var(--accent)] font-medium hover:text-[var(--accent-dark)] transition-colors"
          >
            Visa alla <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {jobs.map((job) => (
            <a
              key={job.id}
              href={`/sommarjobb/${job.id}`}
              className="flex flex-col gap-2 p-4 rounded-xl border border-[var(--border)] bg-white card-shadow hover:card-shadow-hover hover:-translate-y-0.5 transition-all duration-150"
            >
              <p className="font-medium text-sm text-[var(--primary)] leading-snug line-clamp-2">
                {job.title}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[job.job_type] ?? "bg-[var(--hover-bg)] text-[var(--muted)]"}`}
                >
                  {TYPE_LABELS[job.job_type] ?? job.job_type}
                </span>
                <span className="flex items-center gap-1 text-xs text-[var(--muted)]">
                  <MapPin className="w-3 h-3" />
                  {job.location}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
