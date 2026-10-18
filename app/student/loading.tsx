// Skeleton shown while student pages load their data
export default function StudentLoading() {
  return (
    <div className="min-h-screen bg-[#f8faf9]" aria-busy="true" aria-label="جارٍ التحميل">
      <div className="h-16 bg-emerald-900" />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-5 animate-pulse">
        <div className="h-40 rounded-2xl bg-emerald-900/20" />
        <div className="h-72 rounded-2xl bg-slate-200/70" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="h-44 rounded-2xl bg-slate-200/70" />
          <div className="h-44 rounded-2xl bg-slate-200/70" />
        </div>
      </main>
    </div>
  );
}
