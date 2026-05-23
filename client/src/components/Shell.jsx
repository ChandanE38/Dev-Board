import { LayoutDashboard, LogOut, Target, Github, Code, Sparkles, Settings } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { label: 'Overview', icon: LayoutDashboard, href: '/dashboard/overview' },
  { label: 'GitHub', icon: Github, href: '/dashboard/github' },
  { label: 'LeetCode', icon: Code, href: '/dashboard/leetcode' },
  { label: 'Goals tracker', icon: Target, href: '/dashboard/goals' },
  { label: 'AI Review', icon: Sparkles, href: '/dashboard/ai-coach' }
];

export default function Shell() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen text-slate-100 lg:grid lg:grid-cols-[300px_1fr]">
      <aside className="border-b border-white/10 bg-slate-950/70 p-5 backdrop-blur-xl lg:sticky lg:top-0 lg:min-h-screen lg:border-b-0 lg:border-r">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 via-cyan-400 to-emerald-400 shadow-[0_0_30px_rgba(108,99,255,0.35)]">
              <span className="text-sm font-black text-slate-950">DB</span>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.35em] text-cyan-300">DevBoard</div>
              <h1 className="text-2xl font-semibold">Developer Productivity Dashboard</h1>
            </div>
          </div>
          <p className="mt-2 text-sm text-slate-400">Track your work, streaks, and goals in one place.</p>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.label}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition duration-300 ${
                    isActive
                      ? 'border-cyan-400/30 bg-white/10 text-white shadow-[0_0_24px_rgba(0,212,255,0.14)]'
                      : 'border-white/5 bg-white/[0.04] text-slate-300 hover:-translate-y-0.5 hover:border-cyan-400/20 hover:bg-white/8'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="my-6 border-t border-white/10" />

        <nav className="space-y-2">
          <NavLink
            to="/dashboard/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition duration-300 ${
                isActive
                  ? 'border-cyan-400/30 bg-white/10 text-white shadow-[0_0_24px_rgba(0,212,255,0.14)]'
                  : 'border-white/5 bg-white/[0.04] text-slate-300 hover:-translate-y-0.5 hover:border-cyan-400/20 hover:bg-white/8'
              }`
            }
          >
            <Settings className="h-4 w-4" />
            Settings
          </NavLink>
        </nav>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur">
          <div className="text-xs uppercase tracking-[0.25em] text-slate-500">Signed in as</div>
          <div className="mt-2 font-medium">{user?.name || user?.githubUsername || 'User'}</div>
          <button
            onClick={logout}
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      <main className="p-4 sm:p-6 lg:p-8"><Outlet /></main>
    </div>
  );
}
