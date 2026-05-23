import { useStats } from '../context/StatsContext';
import ErrorBanner from '../components/ErrorBanner';

function progressPercent(goals) {
  if (!goals.length) return 0;
  return Math.round((goals.filter((goal) => goal.completed).length / goals.length) * 100);
}

export default function GoalsPage() {
  const {
    goals,
    goalText,
    setGoalText,
    goalError,
    loadingGoals,
    savingGoal,
    addGoal,
    toggleGoal,
    removeGoal
  } = useStats();

  const goalCompletion = progressPercent(goals);

  return (
    <div className="animate-fade-in-up space-y-6">
      <div className="glass-card rounded-[2rem] p-6 shadow-glow">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-sm text-slate-400">Daily goals tracker</div>
            <h3 className="text-2xl font-semibold">Capture today&apos;s work</h3>
          </div>
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-100">
            {goalCompletion}% complete
          </div>
        </div>

        <form onSubmit={addGoal} className="mt-5 flex gap-3">
          <input
            className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none placeholder:text-slate-500 focus:border-cyan-400/50"
            value={goalText}
            onChange={(e) => setGoalText(e.target.value)}
            placeholder='e.g. "Solve 3 LeetCode problems"'
          />
          <button
            disabled={savingGoal}
            className="rounded-2xl bg-cyan-400 px-4 py-3 font-medium text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Add
          </button>
        </form>

        {goalError && <div className="mt-4"><ErrorBanner message={goalError} /></div>}

        <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-gradient-to-r from-purple-500 via-cyan-400 to-emerald-400 transition-all duration-500" style={{ width: `${goalCompletion}%` }} />
        </div>

        <div className="mt-6 space-y-3">
          {loadingGoals && <div className="text-sm text-slate-400">Loading goals...</div>}
          {!loadingGoals && !goals.length && <div className="text-sm text-slate-400">No goals yet. Add one above.</div>}
          {goals.map((goal) => (
            <div key={goal._id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <button onClick={() => toggleGoal(goal._id)} className={`text-left text-sm ${goal.completed ? 'text-slate-500 line-through' : 'text-slate-100'}`}>
                {goal.text}
              </button>
              <button onClick={() => removeGoal(goal._id)} className="text-xs uppercase tracking-[0.2em] text-rose-300 transition hover:text-rose-200">
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}