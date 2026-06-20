export default function Spinner() {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" aria-label="Laddar..." />
    </div>
  );
}
