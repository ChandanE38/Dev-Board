import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Zap } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useStats } from '../context/StatsContext';
import ErrorBanner from '../components/ErrorBanner';

const COLORS = ['#22d3ee', '#34d399', '#f59e0b'];

export default function LeetCodePage() {
  const { leetcodeUsername, leetcode, fetchLeetCode } = useStats();
  const [nextActions, setNextActions] = useState([]);
  const [nextActionsLoading, setNextActionsLoading] = useState(false);
  const [nextActionsError, setNextActionsError] = useState('');
  const nextActionsCacheRef = useRef('');

  const leetcodeChartData = useMemo(() => {
    if (!leetcode.data) return [];
    return [
      { name: 'Easy', value: Number(leetcode.data.easySolved || 0) },
      { name: 'Medium', value: Number(leetcode.data.mediumSolved || 0) },
      { name: 'Hard', value: Number(leetcode.data.hardSolved || 0) }
    ];
  }, [leetcode.data]);

  const leetcodeTotalSolved = Number(leetcode.data?.totalSolved || 0);

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

  const loadNextActions = async (leetcodeStats, cacheKey) => {
    if (!leetcodeStats || nextActionsCacheRef.current === cacheKey) {
      return;
    }

    setNextActionsLoading(true);
    setNextActionsError('');

    try {
      const prompt = `You are a coding interview coach. Based on these LeetCode stats:
${JSON.stringify(leetcodeStats)}
Give exactly 3 specific next actions for this week.
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
    if (!leetcode.data && leetcodeUsername) {
      fetchLeetCode();
      return;
    }

    if (!leetcode.data) {
      return;
    }

    const cacheKey = JSON.stringify(leetcode.data);
    if (nextActionsCacheRef.current === cacheKey) {
      return;
    }

    loadNextActions(leetcode.data, cacheKey);
  }, [leetcode.data, leetcodeUsername]);

  if (!leetcodeUsername) {
    return (
      <div className="animate-fade-in-up space-y-6">
        <div className="glass-card rounded-[2rem] p-6 shadow-glow">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm text-slate-400">LeetCode stats</div>
              <h3 className="text-2xl font-semibold">Problem breakdown</h3>
            </div>
            <button
              onClick={fetchLeetCode}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-200 transition hover:bg-white/[0.08] hover:text-white"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-sm text-slate-300">
            <div className="text-base font-semibold text-slate-100">No LeetCode username set. Go to Settings to add one.</div>
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
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm text-slate-400">LeetCode stats</div>
            <h3 className="text-2xl font-semibold">{leetcodeUsername} problem breakdown</h3>
          </div>
          <div className="flex justify-end">
            <button
              onClick={fetchLeetCode}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-200 transition hover:bg-white/[0.08] hover:text-white"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        <div className="mt-6 min-h-[360px]">
          {leetcode.loading && <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-300">Loading LeetCode stats...</div>}
          {leetcode.error && <ErrorBanner message={leetcode.error} />}
          {leetcode.data && (
            <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-center">
              <div className="grid grid-cols-2 gap-4 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur">Solved: {leetcode.data.totalSolved}</div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur">Acceptance: {leetcode.data.acceptanceRate}%</div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur">Easy: {leetcode.data.easySolved}</div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur">Medium: {leetcode.data.mediumSolved}</div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur">Hard: {leetcode.data.hardSolved}</div>
              </div>
              <div className="relative h-[340px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={leetcodeChartData} dataKey="value" nameKey="name" innerRadius={92} outerRadius={128} paddingAngle={4}>
                      {leetcodeChartData.map((entry, index) => (
                        <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="rounded-full border border-white/10 bg-slate-950/75 px-6 py-5 text-center shadow-glow backdrop-blur">
                    <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Total Solved</div>
                    <div className="mt-2 text-4xl font-semibold text-slate-100">{leetcodeTotalSolved}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {leetcode.data && (
        <div className="glass-card rounded-[2rem] p-6 shadow-glow">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm text-slate-400">What to do next</div>
              <h4 className="text-xl font-semibold text-slate-100">LeetCode actions for this week</h4>
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