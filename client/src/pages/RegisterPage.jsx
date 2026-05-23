import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', githubUsername: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="absolute inset-0 animate-gradient-shift bg-[radial-gradient(circle_at_top_left,rgba(108,99,255,0.22),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(0,212,255,0.12),transparent_26%),linear-gradient(135deg,#050816_0%,#0a0f2e_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:72px_72px] opacity-20" />
      <div className="relative w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.05] p-8 shadow-glow backdrop-blur-2xl">
        <div className="text-xs uppercase tracking-[0.35em] text-cyan-300">DevBoard</div>
        <h2 className="mt-3 text-3xl font-semibold text-slate-100">Create account</h2>
        <p className="mt-2 text-sm text-slate-400">Register to start tracking your productivity.</p>

        <form onSubmit={submit} className="mt-8 space-y-4">
          <input
            className="premium-focus w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 outline-none placeholder:text-slate-500 transition focus:border-cyan-400/50"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            className="premium-focus w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 outline-none placeholder:text-slate-500 transition focus:border-cyan-400/50"
            placeholder="Your GitHub username e.g. ChandanE38"
            value={form.githubUsername}
            onChange={(e) => setForm({ ...form, githubUsername: e.target.value })}
            required
          />
          <input
            className="premium-focus w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 outline-none placeholder:text-slate-500 transition focus:border-cyan-400/50"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          {error && <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-100">{error}</div>}
          <button
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-purple-500 via-cyan-400 to-emerald-400 px-4 py-3 font-semibold text-slate-950 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(108,99,255,0.28)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-400">
          Already have an account? <Link className="text-cyan-300 hover:text-cyan-200" to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
