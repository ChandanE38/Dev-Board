import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStats } from '../context/StatsContext';

export default function SettingsPage() {
  const { user, updateProfile, logout } = useAuth();
  const { fetchGithub, fetchLeetCode } = useStats();
  const [form, setForm] = useState({ name: '', githubUsername: '', leetcodeUsername: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      name: user?.name || '',
      githubUsername: user?.githubUsername || '',
      leetcodeUsername: user?.leetcodeUsername || ''
    });
  }, [user?.name, user?.githubUsername, user?.leetcodeUsername]);

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      await updateProfile(form);
      setMessage('Settings saved!');

      if (form.githubUsername.trim()) {
        fetchGithub(form.githubUsername.trim());
      }

      if (form.leetcodeUsername.trim()) {
        fetchLeetCode(form.leetcodeUsername.trim());
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to save settings right now.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in-up space-y-6">
      <div className="glass-card rounded-[2rem] p-6 shadow-glow">
        <div>
          <div className="text-sm text-slate-400">Profile Settings</div>
          <h2 className="mt-2 text-3xl font-semibold text-slate-100">Edit your profile</h2>
        </div>

        <form onSubmit={handleSave} className="mt-6 grid gap-4">
          <input
            className="premium-focus w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 outline-none placeholder:text-slate-500 transition focus:border-cyan-400/50"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="premium-focus w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 outline-none placeholder:text-slate-500 transition focus:border-cyan-400/50"
            placeholder="GitHub username"
            value={form.githubUsername}
            onChange={(e) => setForm({ ...form, githubUsername: e.target.value })}
          />
          <input
            className="premium-focus w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 outline-none placeholder:text-slate-500 transition focus:border-cyan-400/50"
            placeholder="LeetCode username"
            value={form.leetcodeUsername}
            onChange={(e) => setForm({ ...form, leetcodeUsername: e.target.value })}
          />

          {message && <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-3 text-sm text-emerald-100">{message}</div>}
          {error && <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-100">{error}</div>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-gradient-to-r from-purple-500 via-cyan-400 to-emerald-400 px-5 py-3 font-semibold text-slate-950 transition duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>

      <div className="glass-card rounded-[2rem] p-6 shadow-glow">
        <div>
          <div className="text-sm text-slate-400">Account</div>
          <h3 className="mt-2 text-2xl font-semibold text-slate-100">Current login</h3>
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-slate-300">
          {user?.githubUsername || 'User'}
        </div>

        <button
          onClick={logout}
          className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 font-semibold text-slate-200 transition hover:bg-white/[0.08] hover:text-white"
        >
          Logout
        </button>
      </div>
    </div>
  );
}