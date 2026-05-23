export default function StatCard({ title, value, subtitle, accent = 'cyan', children }) {
  const accentClasses = {
    cyan: 'from-cyan-400/20 via-cyan-400/10 to-cyan-500/5 border-cyan-400/30',
    emerald: 'from-emerald-400/20 via-emerald-400/10 to-emerald-500/5 border-emerald-400/30',
    amber: 'from-amber-400/20 via-amber-400/10 to-amber-500/5 border-amber-400/30',
    rose: 'from-rose-400/20 via-rose-400/10 to-rose-500/5 border-rose-400/30'
  };

  return (
    <div className={`group relative overflow-hidden rounded-3xl border bg-gradient-to-br p-5 shadow-glow backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_70px_rgba(0,0,0,0.35)] ${accentClasses[accent]}`}>
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent === 'cyan' ? 'from-cyan-300 via-cyan-400 to-blue-400' : accent === 'emerald' ? 'from-emerald-300 via-emerald-400 to-green-400' : accent === 'amber' ? 'from-amber-300 via-amber-400 to-orange-400' : 'from-rose-300 via-pink-400 to-rose-500'}`} />
      <div className="text-sm text-slate-400">{title}</div>
      <div className="mt-3 text-4xl font-black tracking-tight text-slate-50 sm:text-5xl">{value}</div>
      {subtitle && <div className="mt-2 text-sm text-slate-300/80">{subtitle}</div>}
      {children}
    </div>
  );
}
