import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Zap } from 'lucide-react';
import { useStats } from '../context/StatsContext';
import ErrorBanner from '../components/ErrorBanner';

export default function GitHubPage() {
  const { githubUsername, github, fetchGithub } = useStats();
  const [nextActions, setNextActions] = useState([]);
  const [nextActionsLoading, setNextActionsLoading] = useState(false);
  const [nextActionsError, setNextActionsError] = useState('');
  const nextActionsCacheRef = useRef('');

  const languageDotClass = (language) => {
    const normalized = String(language || 'Unknown').toLowerCase();

    if (normalized.includes('javascript') || normalized.includes('typescript')) return 'bg-emerald-400';
    if (normalized.includes('python')) return 'bg-sky-400';
    if (normalized.includes('java')) return 'bg-orange-400';
    if (normalized.includes('c++') || normalized.includes('c#')) return 'bg-violet-400';
    if (normalized.includes('go')) return 'bg-cyan-400';
    if (normalized.includes('ruby')) return 'bg-rose-400';

    return 'bg-slate-400';
  };

  const parseActionCards = (text) => {
    const cleanedText = String(text || '')
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const jsonMatch = cleanedText.match(/\[[\s\S]*\]/);

    try {
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : cleanedText);
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.slice(0, 3).map((item) => ({
        action: String(item.action || '').trim(),
        reason: String(item.reason || '').trim()
      }));
    } catch {
      return [];
    }
  };

  const loadNextActions = async (githubStats, cacheKey) => {
    if (!githubStats || nextActionsCacheRef.current === cacheKey) {
      return;
    }

    setNextActionsLoading(true);
    setNextActionsError('');

    try {
      const prompt = `You are a career coach. Based on this developer's GitHub stats:
${JSON.stringify(githubStats)}
Give exactly 3 specific next actions they should take on GitHub this week.
Format: JSON array of 3 objects with 'action' (5 words max) and 'reason' (1 sentence). Return ONLY the JSON array.`;

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
      const nextActionsText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
      setNextActions(parseActionCards(nextActionsText));
      nextActionsCacheRef.current = cacheKey;
    } catch {
      setNextActions([]);
      setNextActionsError('Smart suggestions unavailable right now.');
      nextActionsCacheRef.current = cacheKey;
    } finally {
      setNextActionsLoading(false);
    }
  };

  useEffect(() => {
    if (!github.data && githubUsername) {
      fetchGithub();
      return;
    }

    if (!github.data) {
      return;
    }

    const cacheKey = JSON.stringify(github.data);
    if (nextActionsCacheRef.current === cacheKey) {
      return;
    }

    loadNextActions(github.data, cacheKey);
  }, [github.data, githubUsername]);

  if (!githubUsername) {
    return (
      <div className="animate-fade-in-up space-y-6">
        <div className="glass-card rounded-[2rem] p-6 shadow-glow">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm text-slate-400">GitHub integration</div>
              <h3 className="text-2xl font-semibold">Fetch profile stats</h3>
            </div>
            <button
              onClick={fetchGithub}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-200 transition hover:bg-white/[0.08] hover:text-white"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-sm text-slate-300">
            <div className="text-base font-semibold text-slate-100">No GitHub username set. Go to Settings to add one.</div>
            <Link
              to="/dashboard/settings"
              className="mt-4 inline-flex rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 font-medium text-cyan-100 transition hover:bg-cyan-400/15"
            >
              Go to Settings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up space-y-6">
      <div className="glass-card rounded-[2rem] p-6 shadow-glow">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex-1">
            <div className="text-sm text-slate-400">GitHub integration</div>
            <h3 className="text-2xl font-semibold">{githubUsername} profile stats</h3>
          </div>
          <div className="flex justify-end">
            <button
              onClick={fetchGithub}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-200 transition hover:bg-white/[0.08] hover:text-white"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {github.loading && <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-300">Loading GitHub data...</div>}
          {github.error && <ErrorBanner message={github.error} />}
          {github.data && (
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur">
                <h4 className="font-medium">Top repositories</h4>
                <div className="mt-4 space-y-3">
                  {github.data.topRepos.map((repo) => (
                    <div key={repo.name} className="rounded-xl border border-white/5 bg-slate-950/50 p-3 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/20 hover:bg-slate-950/70">
                      <div className="flex items-center justify-between gap-4">
                        <div className="font-medium text-slate-100">{repo.name}</div>
                        <div className="text-sm text-slate-300">{repo.stars} stars</div>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-sm text-slate-400">
                        <span className={`h-2.5 w-2.5 rounded-full ${languageDotClass(repo.language)} shadow-[0_0_12px_currentColor]`} />
                        <span>{repo.language}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur">
                <h4 className="font-medium">Summary</h4>
                <div className="mt-4 grid gap-3 text-sm text-slate-300">
                  <div className="rounded-xl border border-white/5 bg-slate-950/60 p-3">Total repos: {github.data.totalRepos}</div>
                  <div className="rounded-xl border border-white/5 bg-slate-950/60 p-3">Followers: {github.data.followers}</div>
                  <div className="rounded-xl border border-white/5 bg-slate-950/60 p-3">Following: {github.data.following}</div>
                  <div className="rounded-xl border border-white/5 bg-slate-950/60 p-3">Contribution streak: {github.data.streak} days</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {github.data && (
        <div className="glass-card rounded-[2rem] p-6 shadow-glow">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm text-slate-400">What to do next</div>
              <h4 className="text-xl font-semibold text-slate-100">GitHub actions for this week</h4>
            </div>
            {nextActionsLoading && <div className="text-sm text-slate-400">Generating smart next steps...</div>}
          </div>

          {nextActionsError && <div className="mt-4"><ErrorBanner message={nextActionsError} /></div>}

          {!nextActionsLoading && nextActions.length > 0 && (
            <div className="mt-5 grid gap-3 lg:grid-cols-3">
              {nextActions.map((item, index) => (
                <div key={`${item.action}-${index}`} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-center gap-2 text-cyan-300">
                    <Zap className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-[0.25em]">Action {index + 1}</span>
                  </div>
                  <div className="mt-3 text-base font-semibold text-slate-100">{item.action}</div>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{item.reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}