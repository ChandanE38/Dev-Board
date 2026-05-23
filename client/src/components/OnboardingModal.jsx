import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function OnboardingModal() {
  const { user, updateProfile, setIsNewUser } = useAuth();
  const navigate = useNavigate();
  const [githubUsername, setGithubUsername] = useState('');
  const [leetcodeUsername, setLeetcodeUsername] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setGithubUsername(user?.githubUsername || '');
    setLeetcodeUsername(user?.leetcodeUsername || '');
  }, [user?.githubUsername, user?.leetcodeUsername]);

  const closeModal = () => {
    setIsNewUser(false);
    navigate('/dashboard');
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      await updateProfile({
        githubUsername,
        leetcodeUsername
      });
      setIsNewUser(false);
      navigate('/dashboard');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur-xl">
      <div className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-slate-950/95 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
        <div className="text-xs uppercase tracking-[0.35em] text-cyan-300">Welcome to DevBoard</div>
        <h2 className="mt-3 text-3xl font-semibold text-slate-100">Let&apos;s set up your profile</h2>
        <p className="mt-2 text-sm text-slate-400">Add your usernames so the dashboard can fetch the right stats automatically.</p>

        <form onSubmit={handleSave} className="mt-6 space-y-4">
          <input
            className="premium-focus w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 outline-none placeholder:text-slate-500 transition focus:border-cyan-400/50"
            value={githubUsername}
            onChange={(e) => setGithubUsername(e.target.value)}
            placeholder="GitHub username"
            required
          />
          <input
            className="premium-focus w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 outline-none placeholder:text-slate-500 transition focus:border-cyan-400/50"
            value={leetcodeUsername}
            onChange={(e) => setLeetcodeUsername(e.target.value)}
            placeholder="Your LeetCode username"
          />

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-gradient-to-r from-purple-500 via-cyan-400 to-emerald-400 px-5 py-3 font-semibold text-slate-950 transition duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? 'Saving...' : 'Save & Get Started'}
            </button>
            <button type="button" onClick={closeModal} className="text-sm text-slate-400 transition hover:text-slate-200">
              I&apos;ll do this later
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}