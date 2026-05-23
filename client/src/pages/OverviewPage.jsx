import { useMemo } from 'react';
import { useStats } from '../context/StatsContext';
import StatCard from '../components/StatCard';

function progressPercent(goals) {
  if (!goals.length) return 0;
  return Math.round((goals.filter((goal) => goal.completed).length / goals.length) * 100);
}

export default function OverviewPage() {
  const { github, leetcode, goals } = useStats();

  const goalCompletion = progressPercent(goals);

  const dashboardLoadProgress = useMemo(() => {
    let progress = 18;

    if (github.loading) progress = 42;
    else if (github.data) progress = 58;

    if (leetcode.loading) progress = github.data ? 76 : 62;
    else if (leetcode.data) progress = github.data ? 100 : 82;

    return progress;
  }, [github.loading, github.data, leetcode.loading, leetcode.data]);

  return (
    <div className="space-y-6">
      <div className="fixed left-0 top-0 z-50 h-1 w-full bg-white/5">
        <div
          className={`h-full bg-gradient-to-r from-purple-500 via-cyan-400 to-emerald-400 transition-all duration-500 ease-out ${github.loading || leetcode.loading ? 'animate-progress-pulse' : ''}`}
          style={{ width: `${dashboardLoadProgress}%` }}
        />
      </div>

      <section className="animate-fade-in-up glass-card rounded-[2rem] p-6 shadow-glow">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.35em] text-cyan-300/90">Overview</div>
            <h2 className="mt-2 text-3xl font-semibold text-slate-100 md:text-4xl">Productivity dashboard</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Pull your GitHub and LeetCode data, then track daily goals in MongoDB.
            </p>
          </div>
          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100 shadow-[0_0_30px_rgba(0,212,255,0.18)]">
            Goal completion {goalCompletion}%
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="GitHub repositories" value={github.data?.totalRepos ?? '—'} subtitle="Public repos" accent="cyan" />
        <StatCard title="Followers" value={github.data?.followers ?? '—'} subtitle="Community reach" accent="emerald" />
        <StatCard title="Following" value={github.data?.following ?? '—'} subtitle="Connections" accent="amber" />
        <StatCard title="Recent Activity Streak" value={`${github.data?.streak ?? '—'} days`} subtitle="Based on last 100 public events" accent="rose" />
      </section>

      <section className="animate-fade-in-up delay-2 glass-card rounded-[2rem] p-6 shadow-glow">
        <h3 className="text-2xl font-semibold">Dashboard summary</h3>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <StatCard title="GitHub status" value={github.data ? 'Loaded' : 'Pending'} subtitle="Public profile data" accent="cyan" />
          <StatCard title="LeetCode status" value={leetcode.data ? 'Loaded' : 'Pending'} subtitle="API stats ready" accent="emerald" />
          <StatCard title="Goals stored" value={goals.length} subtitle="Per user in MongoDB" accent="amber" />
          <StatCard title="Completion" value={`${goalCompletion}%`} subtitle="Today&apos;s progress" accent="rose" />
        </div>
      </section>
    </div>
  );
}