import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStats } from '../context/StatsContext';

function progressPercent(goals) {
  if (!goals.length) return 0;
  return Math.round((goals.filter((goal) => goal.completed).length / goals.length) * 100);
}

export default function AICoachPage() {
  const { user } = useAuth();
  const { github, leetcode, goals } = useStats();
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiAnalyzedAt, setAiAnalyzedAt] = useState('');

  function renderMarkdown(text) {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) =>
      i % 2 === 1 ? <strong key={i} className="text-white font-semibold">{part}</strong> : part
    );
  }

  const parseCoachInsights = (text) => {
    const numberedLines = String(text || '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => line.replace(/^\d+[.)]\s*/, ''));

    if (numberedLines.length) {
      return numberedLines;
    }

    return [String(text || '').trim()].filter(Boolean);
  };

  const analyzeProfile = async () => {
    if (!github.data || !leetcode.data) {
      setAiError('Please load your GitHub and LeetCode stats first from their respective pages');
      return;
    }

    setAiLoading(true);
    setAiError('');

    try {
      const payload = {
        github: {
          totalRepos: github.data.totalRepos,
          followers: github.data.followers,
          streak: github.data.streak,
          topRepos: github.data.topRepos.map((repo) => ({ name: repo.name, language: repo.language }))
        },
        leetcode: {
          totalSolved: leetcode.data.totalSolved,
          easySolved: leetcode.data.easySolved,
          mediumSolved: leetcode.data.mediumSolved,
          hardSolved: leetcode.data.hardSolved,
          acceptanceRate: leetcode.data.acceptanceRate
        },
        goals: {
          totalGoals: goals.length,
          completionPercentage: progressPercent(goals)
        }
      };

      const prompt = `You are a senior software engineer and career coach reviewing a developer's profile.
Based on their GitHub and LeetCode stats, give them 4-5 specific, actionable career tips. Be direct, honest, and encouraging. Format your response as a numbered list.
Focus on: what skills to improve, what projects to build next, job readiness, and one motivational insight based on their actual numbers.

Developer profile data:
${JSON.stringify(payload, null, 2)}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      );

      if (!response.ok) {
        throw new Error('Gemini request failed');
      }

      const data = await response.json();
      const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

      setAiAnalysis(parseCoachInsights(aiText));
      setAiAnalyzedAt(new Date().toLocaleString());
    } catch {
      setAiError('Analysis unavailable right now, try again later');
    } finally {
      setAiLoading(false);
    }
  };

  const exportProfile = () => {
    if (!github.data || !leetcode.data) {
      window.alert('Please load your GitHub and LeetCode stats first');
      return;
    }

    const profileData = {
      exportedAt: new Date().toISOString(),
      developer: {
        name: user?.name || '',
        githubUsername: user?.githubUsername || '',
        leetcodeUsername: user?.leetcodeUsername || ''
      },
      github: {
        totalRepos: github.data.totalRepos,
        followers: github.data.followers,
        following: github.data.following,
        activityStreak: github.data.streak,
        topRepositories: github.data.topRepos
      },
      leetcode: {
        totalSolved: leetcode.data.totalSolved,
        easySolved: leetcode.data.easySolved,
        mediumSolved: leetcode.data.mediumSolved,
        hardSolved: leetcode.data.hardSolved,
        acceptanceRate: leetcode.data.acceptanceRate
      },
      goals: {
        total: goals.length,
        completed: goals.filter((goal) => goal.completed).length,
        completionPercentage: progressPercent(goals),
        list: goals
      },
      aiInsights: aiAnalysis || []
    };

    const blob = new Blob([JSON.stringify(profileData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devboard-profile-${user?.githubUsername || 'profile'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-fade-in-up space-y-6">
      <div className="glass-card rounded-[2rem] p-6 shadow-glow">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm text-slate-400">AI Career Coach</div>
            <h3 className="text-2xl font-semibold text-slate-100">Analyze your profile with Gemini</h3>
            <p className="mt-1 text-sm text-slate-400">Turn your current GitHub, LeetCode, and goal data into actionable career guidance.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={analyzeProfile}
              disabled={aiLoading}
              className="rounded-2xl bg-gradient-to-r from-purple-500 via-cyan-400 to-emerald-400 px-5 py-3 font-semibold text-slate-950 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(108,99,255,0.28)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {aiAnalysis ? 'Refresh Analysis' : 'Analyze My Profile'}
            </button>
            <button
              onClick={exportProfile}
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 font-semibold text-slate-200 transition hover:bg-white/[0.08] hover:text-white"
              title="Download your full profile to share with AI tools like ChatGPT"
            >
              Export Profile
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-slate-950/45 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          {aiLoading && <div className="text-sm text-slate-300">Analyzing your profile...</div>}
          {!aiLoading && aiError && <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-100">{aiError}</div>}
          {!aiLoading && !aiError && !aiAnalysis && (
            <div className="text-sm text-slate-400">Run an analysis to get a personalized career plan.</div>
          )}
          {!aiLoading && !aiError && aiAnalysis && (
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1">
                {aiAnalysis.map((tip, index) => (
                  <div
                    key={`${tip.slice(0, 24)}-${index}`}
                    className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.03] p-4 text-sm text-slate-200 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/20"
                  >
                    <div className="mb-2 text-xs uppercase tracking-[0.25em] text-cyan-300">Insight {index + 1}</div>
                    <p className="leading-6 text-slate-200">{renderMarkdown(tip)}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs uppercase tracking-[0.25em] text-slate-500">{aiAnalyzedAt ? `Analyzed at ${aiAnalyzedAt}` : 'Analysis ready'}</div>
                <button
                  onClick={analyzeProfile}
                  disabled={aiLoading}
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-200 transition hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Refresh Analysis
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}