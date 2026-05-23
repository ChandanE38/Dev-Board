# DevBoard Source Bundle

This file contains the current code for the DevBoard project in one place.

## /package.json

```json
{
  "name": "devboard",
  "private": true,
  "version": "1.0.0",
  "workspaces": [
    "client",
    "server"
  ],
  "scripts": {
    "dev": "concurrently \"npm run dev -w server\" \"npm run dev -w client\"",
    "build": "npm run build -w client",
    "start": "npm run start -w server",
    "install:all": "npm install && npm install -w client && npm install -w server"
  },
  "devDependencies": {
    "concurrently": "^9.0.1"
  }
}
```

## /client/package.json

```json
{
  "name": "devboard-client",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "^1.7.9",
    "lucide-react": "^0.453.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.28.0",
    "recharts": "^2.13.3"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.3",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.15",
    "vite": "^5.4.10"
  }
}
```

## /client/vite.config.js

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173
    }
});
```

## /client/tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,jsx}'],
    theme: {
        extend: {
            boxShadow: {
                glow: '0 0 0 1px rgba(148, 163, 184, 0.12), 0 24px 80px rgba(15, 23, 42, 0.45)'
            },
            backgroundImage: {
                'grid-fade': 'linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px)'
            }
        }
    },
    plugins: []
};
```

## /client/postcss.config.js

```javascript
export default {
    plugins: {
        tailwindcss: {},
        autoprefixer: {}
    }
};
```

## /client/index.html

```html
<!doctype html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DevBoard</title>
    <meta name="description" content="Developer Productivity Dashboard" />
</head>

<body class="bg-slate-950 text-slate-100">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
</body>

</html>
```

## /client/src/styles.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
:root {
    color-scheme: dark;
}

html,
body,
#root {
    min-height: 100%;
}

body {
    margin: 0;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
    background: radial-gradient(circle at top left, rgba(14, 165, 233, 0.16), transparent 28%), radial-gradient(circle at bottom right, rgba(34, 197, 94, 0.1), transparent 24%), linear-gradient(180deg, #020617 0%, #0f172a 100%);
}

* {
    box-sizing: border-box;
}

::-webkit-scrollbar {
    width: 10px;
    height: 10px;
}

::-webkit-scrollbar-thumb {
    background: rgba(148, 163, 184, 0.28);
    border-radius: 999px;
}
```

## /client/src/api/api.js

```javascript
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('devboard_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
```

## /client/src/main.jsx

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

## /client/src/App.jsx

```javascript
import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Shell from './components/Shell';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import LoadingScreen from './components/LoadingScreen';

function ProtectedRoute({ children }) {
  const { token, bootstrapping } = useAuth();

  if (bootstrapping) {
    return <LoadingScreen />;
  }

  return token ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { token, bootstrapping } = useAuth();

  if (bootstrapping) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={token ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
      />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Shell>
              <DashboardPage />
            </Shell>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
```

## /client/src/context/AuthContext.jsx

```javascript
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('devboard_token') || '');
  const [user, setUser] = useState(null);
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    const init = async () => {
      if (!token) {
        setBootstrapping(false);
        return;
      }

      try {
        const { data } = await api.get('/auth/me');
        setUser(data.user);
      } catch {
        localStorage.removeItem('devboard_token');
        setToken('');
        setUser(null);
      } finally {
        setBootstrapping(false);
      }
    };

    init();
  }, [token]);

  const authValue = useMemo(
    () => ({
      token,
      user,
      bootstrapping,
      async login(credentials) {
        const { data } = await api.post('/auth/login', credentials);
        localStorage.setItem('devboard_token', data.token);
        setToken(data.token);
        setUser(data.user);
      },
      async register(credentials) {
        const { data } = await api.post('/auth/register', credentials);
        localStorage.setItem('devboard_token', data.token);
        setToken(data.token);
        setUser(data.user);
      },
      logout() {
        localStorage.removeItem('devboard_token');
        setToken('');
        setUser(null);
      }
    }),
    [token, user, bootstrapping]
  );

  return <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
```

## /client/src/components/LoadingScreen.jsx

```javascript
export default function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
      <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 shadow-glow backdrop-blur">
        Loading DevBoard...
      </div>
    </div>
  );
}
```

## /client/src/components/Shell.jsx

```javascript
import { LayoutDashboard, LogOut, Target, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '#dashboard' },
  { label: 'Goals', icon: Target, href: '#goals' },
  { label: 'Profile', icon: User, href: '#profile' }
];

export default function Shell({ children }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen text-slate-100 lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="border-b border-white/10 bg-slate-950/80 p-5 backdrop-blur lg:min-h-screen lg:border-b-0 lg:border-r">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-[0.3em] text-cyan-300">DevBoard</div>
          <h1 className="mt-2 text-2xl font-semibold">Developer Productivity Dashboard</h1>
          <p className="mt-2 text-sm text-slate-400">Track your work, streaks, and goals in one place.</p>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-slate-200 transition hover:border-cyan-400/30 hover:bg-cyan-400/10"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="mt-8 rounded-2xl border border-white/10 bg-slate-900/70 p-4">
          <div className="text-xs uppercase tracking-[0.25em] text-slate-500">Signed in as</div>
          <div className="mt-2 font-medium">{user?.name || user?.email || 'User'}</div>
          <button
            onClick={logout}
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      <main className="p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
```

## /client/src/components/StatCard.jsx

```javascript
export default function StatCard({ title, value, subtitle, accent = 'cyan', children }) {
  const accentClasses = {
    cyan: 'from-cyan-400/20 to-cyan-500/5 border-cyan-400/20',
    emerald: 'from-emerald-400/20 to-emerald-500/5 border-emerald-400/20',
    amber: 'from-amber-400/20 to-amber-500/5 border-amber-400/20',
    rose: 'from-rose-400/20 to-rose-500/5 border-rose-400/20'
  };

  return (
    <div className={`rounded-3xl border bg-gradient-to-br p-5 shadow-glow backdrop-blur ${accentClasses[accent]}`}>
      <div className="text-sm text-slate-400">{title}</div>
      <div className="mt-3 text-3xl font-semibold tracking-tight">{value}</div>
      {subtitle && <div className="mt-2 text-sm text-slate-300/80">{subtitle}</div>}
      {children}
    </div>
  );
}
```

## /client/src/components/ErrorBanner.jsx

```javascript
export default function ErrorBanner({ title = 'Unable to load data', message }) {
  return (
    <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-rose-100">
      <div className="font-medium">{title}</div>
      <div className="mt-1 text-sm text-rose-100/80">{message}</div>
    </div>
  );
}
```

## /client/src/pages/LoginPage.jsx

```javascript
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-glow backdrop-blur">
        <div className="text-xs uppercase tracking-[0.3em] text-cyan-300">DevBoard</div>
        <h2 className="mt-3 text-3xl font-semibold">Welcome back</h2>
        <p className="mt-2 text-sm text-slate-400">Sign in to continue to your dashboard.</p>

        <form onSubmit={submit} className="mt-8 space-y-4">
          <input
            className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none ring-0 placeholder:text-slate-500 focus:border-cyan-400/50"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none ring-0 placeholder:text-slate-500 focus:border-cyan-400/50"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          {error && <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-100">{error}</div>}
          <button
            disabled={loading}
            className="w-full rounded-2xl bg-cyan-400 px-4 py-3 font-medium text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-400">
          No account yet? <Link className="text-cyan-300 hover:text-cyan-200" to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}
```

## /client/src/pages/RegisterPage.jsx

```javascript
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
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
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-glow backdrop-blur">
        <div className="text-xs uppercase tracking-[0.3em] text-cyan-300">DevBoard</div>
        <h2 className="mt-3 text-3xl font-semibold">Create account</h2>
        <p className="mt-2 text-sm text-slate-400">Register to start tracking your productivity.</p>

        <form onSubmit={submit} className="mt-8 space-y-4">
          <input
            className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none placeholder:text-slate-500 focus:border-cyan-400/50"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none placeholder:text-slate-500 focus:border-cyan-400/50"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none placeholder:text-slate-500 focus:border-cyan-400/50"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          {error && <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-100">{error}</div>}
          <button
            disabled={loading}
            className="w-full rounded-2xl bg-cyan-400 px-4 py-3 font-medium text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
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
```

## /client/src/pages/DashboardPage.jsx

```javascript
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import api from '../api/api';
import StatCard from '../components/StatCard';
import ErrorBanner from '../components/ErrorBanner';

const COLORS = ['#22d3ee', '#34d399', '#f59e0b'];

const leetcodeLabels = [
  { key: 'easy', label: 'Easy' },
  { key: 'medium', label: 'Medium' },
  { key: 'hard', label: 'Hard' }
];

function progressPercent(goals) {
  if (!goals.length) return 0;
  return Math.round((goals.filter((goal) => goal.completed).length / goals.length) * 100);
}

export default function DashboardPage() {
  const [githubUsername, setGithubUsername] = useState('octocat');
  const [leetcodeUsername, setLeetcodeUsername] = useState('');
  const [github, setGithub] = useState({ loading: false, error: '', data: null });
  const [leetcode, setLeetcode] = useState({ loading: false, error: '', data: null });
  const [goals, setGoals] = useState([]);
  const [goalText, setGoalText] = useState('');
  const [goalError, setGoalError] = useState('');
  const [loadingGoals, setLoadingGoals] = useState(true);
  const [savingGoal, setSavingGoal] = useState(false);

  useEffect(() => {
    const loadGoals = async () => {
      try {
        const { data } = await api.get('/goals');
        setGoals(data.goals);
      } catch {
        setGoalError('Goals could not be loaded right now.');
      } finally {
        setLoadingGoals(false);
      }
    };

    loadGoals();
  }, []);

  const fetchGithub = async () => {
    setGithub({ loading: true, error: '', data: null });

    try {
      const [profileResponse, reposResponse, eventsResponse] = await Promise.all([
        axios.get(`https://api.github.com/users/${githubUsername}`),
        axios.get(`https://api.github.com/users/${githubUsername}/repos?sort=stars&per_page=100`),
        axios.get(`https://api.github.com/users/${githubUsername}/events/public?per_page=100`)
      ]);

      const profile = profileResponse.data;
      const repos = reposResponse.data;
      const events = eventsResponse.data;

      const commitsByDay = new Map();
      for (const event of events) {
        if (event.type !== 'PushEvent') continue;
        const date = new Date(event.created_at).toISOString().slice(0, 10);
        commitsByDay.set(date, (commitsByDay.get(date) || 0) + 1);
      }

      let streak = 0;
      const cursor = new Date();
      for (;;) {
        const key = cursor.toISOString().slice(0, 10);
        if (!commitsByDay.has(key)) break;
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
      }

      setGithub({
        loading: false,
        error: '',
        data: {
          totalRepos: profile.public_repos,
          followers: profile.followers,
          following: profile.following,
          streak,
          topRepos: repos
            .filter((repo) => !repo.fork)
            .sort((a, b) => b.stargazers_count - a.stargazers_count)
            .slice(0, 5)
            .map((repo) => ({
              name: repo.name,
              stars: repo.stargazers_count,
              language: repo.language || 'Unknown'
            }))
        }
      });
    } catch (error) {
      setGithub({
        loading: false,
        error: 'GitHub data is unavailable. Check the username or try again later.',
        data: null
      });
    }
  };

  const fetchLeetCode = async () => {
    setLeetcode({ loading: true, error: '', data: null });

    try {
      const { data } = await axios.get(`https://leetcode-stats-api.herokuapp.com/${leetcodeUsername}`);
      setLeetcode({ loading: false, error: '', data });
    } catch {
      setLeetcode({
        loading: false,
        error: 'LeetCode stats are unavailable. Check the username or try again later.',
        data: null
      });
    }
  };

  const addGoal = async (event) => {
    event.preventDefault();
    if (!goalText.trim()) return;

    setSavingGoal(true);
    setGoalError('');

    try {
      const { data } = await api.post('/goals', { text: goalText.trim() });
      setGoals([data.goal, ...goals]);
      setGoalText('');
    } catch {
      setGoalError('Unable to save this goal right now.');
    } finally {
      setSavingGoal(false);
    }
  };

  const toggleGoal = async (goalId) => {
    try {
      const { data } = await api.patch(`/goals/${goalId}/toggle`);
      setGoals(goals.map((goal) => (goal._id === goalId ? data.goal : goal)));
    } catch {
      setGoalError('Unable to update this goal right now.');
    }
  };

  const removeGoal = async (goalId) => {
    try {
      await api.delete(`/goals/${goalId}`);
      setGoals(goals.filter((goal) => goal._id !== goalId));
    } catch {
      setGoalError('Unable to delete this goal right now.');
    }
  };

  const leetcodeChartData = useMemo(() => {
    if (!leetcode.data) return [];
    return leetcodeLabels.map((item) => ({
      name: item.label,
      value: Number(leetcode.data[item.key] || 0)
    }));
  }, [leetcode.data]);

  const goalCompletion = progressPercent(goals);

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur" id="dashboard">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-cyan-300">Overview</div>
            <h2 className="mt-2 text-3xl font-semibold">Productivity dashboard</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Pull your GitHub and LeetCode data, then track daily goals in MongoDB.
            </p>
          </div>
          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
            Goal completion {goalCompletion}%
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="GitHub repositories" value={github.data?.totalRepos ?? '—'} subtitle="Public repos" accent="cyan" />
        <StatCard title="Followers" value={github.data?.followers ?? '—'} subtitle="Community reach" accent="emerald" />
        <StatCard title="Following" value={github.data?.following ?? '—'} subtitle="Connections" accent="amber" />
        <StatCard title="Public streak" value={`${github.data?.streak ?? '—'} days`} subtitle="Recent activity" accent="rose" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 shadow-glow" id="profile">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1">
              <div className="text-sm text-slate-400">GitHub integration</div>
              <h3 className="text-2xl font-semibold">Fetch profile stats</h3>
            </div>
            <div className="flex gap-3">
              <input
                className="min-w-0 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none placeholder:text-slate-500 focus:border-cyan-400/50"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                placeholder="GitHub username"
              />
              <button onClick={fetchGithub} className="rounded-2xl bg-cyan-400 px-4 py-3 font-medium text-slate-950 transition hover:bg-cyan-300">
                Load
              </button>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {github.loading && <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-300">Loading GitHub data...</div>}
            {github.error && <ErrorBanner message={github.error} />}
            {github.data && (
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <h4 className="font-medium">Top repositories</h4>
                  <div className="mt-4 space-y-3">
                    {github.data.topRepos.map((repo) => (
                      <div key={repo.name} className="rounded-xl border border-white/5 bg-slate-950/60 p-3">
                        <div className="flex items-center justify-between gap-4">
                          <div className="font-medium">{repo.name}</div>
                          <div className="text-sm text-slate-300">{repo.stars} stars</div>
                        </div>
                        <div className="mt-1 text-sm text-slate-400">{repo.language}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
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

        <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 shadow-glow">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm text-slate-400">LeetCode stats</div>
              <h3 className="text-2xl font-semibold">Problem breakdown</h3>
            </div>
            <div className="flex gap-3">
              <input
                className="min-w-0 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none placeholder:text-slate-500 focus:border-cyan-400/50"
                value={leetcodeUsername}
                onChange={(e) => setLeetcodeUsername(e.target.value)}
                placeholder="LeetCode username"
              />
              <button onClick={fetchLeetCode} className="rounded-2xl bg-cyan-400 px-4 py-3 font-medium text-slate-950 transition hover:bg-cyan-300">
                Load
              </button>
            </div>
          </div>

          <div className="mt-6 min-h-[360px]">
            {leetcode.loading && <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-300">Loading LeetCode stats...</div>}
            {leetcode.error && <ErrorBanner message={leetcode.error} />}
            {leetcode.data && (
              <div className="grid gap-6 lg:grid-cols-[1fr_240px] lg:items-center">
                <div className="grid grid-cols-2 gap-4 text-sm text-slate-300">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Solved: {leetcode.data.totalSolved}</div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Acceptance: {leetcode.data.acceptanceRate}%</div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Easy: {leetcode.data.easySolved}</div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Medium: {leetcode.data.mediumSolved}</div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Hard: {leetcode.data.hardSolved}</div>
                </div>
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={leetcodeChartData} dataKey="value" nameKey="name" innerRadius={72} outerRadius={96} paddingAngle={4}>
                        {leetcodeChartData.map((entry, index) => (
                          <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]" id="goals">
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 shadow-glow">
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
            <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-lime-300" style={{ width: `${goalCompletion}%` }} />
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

        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-950/80 p-6 shadow-glow">
          <h3 className="text-2xl font-semibold">Dashboard summary</h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <StatCard title="GitHub status" value={github.data ? 'Loaded' : 'Pending'} subtitle="Public profile data" accent="cyan" />
            <StatCard title="LeetCode status" value={leetcode.data ? 'Loaded' : 'Pending'} subtitle="API stats ready" accent="emerald" />
            <StatCard title="Goals stored" value={goals.length} subtitle="Per user in MongoDB" accent="amber" />
            <StatCard title="Completion" value={`${goalCompletion}%`} subtitle="Today&apos;s progress" accent="rose" />
          </div>
        </div>
      </section>
    </div>
  );
}
```

## /server/package.json

```json
{
  "name": "devboard-server",
  "version": "1.0.0",
  "private": true,
  "main": "index.js",
  "scripts": {
    "dev": "nodemon index.js",
    "start": "node index.js"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.21.1",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.8.3"
  },
  "devDependencies": {
    "nodemon": "^3.1.7"
  }
}
```

## /server/index.js

```javascript
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const goalRoutes = require('./routes/goalRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();
connectDB();

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/goals', goalRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
```

## /server/config/db.js

```javascript
const mongoose = require('mongoose');

async function connectDB() {
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI is required');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
}

module.exports = connectDB;
```

## /server/models/User.js

```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
```

## /server/models/Goal.js

```javascript
const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Goal', goalSchema);
```

## /server/middleware/authMiddleware.js

```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function protect(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Not authorized, token missing' });
    }

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        next();
    } catch {
        return res.status(401).json({ message: 'Not authorized, token invalid' });
    }
}

module.exports = { protect };
```

## /server/middleware/errorMiddleware.js

```javascript
function notFound(req, res, next) {
    const error = new Error(`Not found - ${req.originalUrl}`);
    res.status(404);
    next(error);
}

function errorHandler(err, req, res, next) {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
}

module.exports = { notFound, errorHandler };
```

## /server/controllers/authController.js

```javascript
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

function signToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

async function registerUser(req, res) {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    return res.status(201).json({
        token: signToken(user._id),
        user: { id: user._id, name: user.name, email: user.email }
    });
}

async function loginUser(req, res) {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const matches = await bcrypt.compare(password, user.password);
    if (!matches) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    return res.json({
        token: signToken(user._id),
        user: { id: user._id, name: user.name, email: user.email }
    });
}

async function getMe(req, res) {
    return res.json({ user: { id: req.user._id, name: req.user.name, email: req.user.email } });
}

module.exports = { registerUser, loginUser, getMe };
```

## /server/controllers/goalController.js

```javascript
const Goal = require('../models/Goal');

async function getGoals(req, res) {
    const goals = await Goal.find({ user: req.user._id }).sort({ createdAt: -1 });
    const completedCount = goals.filter((goal) => goal.completed).length;
    const completionPercent = goals.length ? Math.round((completedCount / goals.length) * 100) : 0;

    res.json({ goals, completionPercent });
}

async function createGoal(req, res) {
    const { text } = req.body;

    if (!text || !text.trim()) {
        return res.status(400).json({ message: 'Goal text is required' });
    }

    const goal = await Goal.create({ user: req.user._id, text: text.trim() });
    res.status(201).json({ goal });
}

async function toggleGoal(req, res) {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) {
        return res.status(404).json({ message: 'Goal not found' });
    }

    goal.completed = !goal.completed;
    await goal.save();
    res.json({ goal });
}

async function deleteGoal(req, res) {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!goal) {
        return res.status(404).json({ message: 'Goal not found' });
    }

    res.json({ message: 'Goal deleted' });
}

module.exports = { getGoals, createGoal, toggleGoal, deleteGoal };
```

## /server/routes/authRoutes.js

```javascript
const express = require('express');
const { getMe, loginUser, registerUser } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

module.exports = router;
```

## /server/routes/goalRoutes.js

```javascript
const express = require('express');
const { createGoal, deleteGoal, getGoals, toggleGoal } = require('../controllers/goalController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.get('/', getGoals);
router.post('/', createGoal);
router.patch('/:id/toggle', toggleGoal);
router.delete('/:id', deleteGoal);

module.exports = router;
```

## /server/.env.example

```text
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/devboard
JWT_SECRET=replace_with_a_strong_secret
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

## /client/.env.example

```text
VITE_API_URL=http://localhost:5000/api
```

## /README.md

````markdown
# DevBoard

DevBoard is a full-stack developer productivity dashboard for tracking GitHub activity, LeetCode progress, and daily coding goals.

## Tech Stack

- Frontend: React, Tailwind CSS, Recharts, axios
- Backend: Node.js, Express.js
- Database: MongoDB with Mongoose
- Auth: JWT

## Project Structure

- `client` - React app
- `server` - Express API

## Features

- JWT register/login flow with protected routes
- GitHub profile stats and public activity streak
- LeetCode problem breakdown with donut chart
- Daily goals stored per user in MongoDB
- Dark, responsive dashboard UI with sidebar navigation

## Setup

### 1. Install dependencies

From the repository root:

```bash
npm install
npm install -w client
npm install -w server
```

### 2. Configure environment variables

Copy the example files and fill in the values:

- `client/.env.example` -> `client/.env`
- `server/.env.example` -> `server/.env`

Required server variables:

- `MONGO_URI`
- `JWT_SECRET`
- `CLIENT_URL`
- `PORT`

Required client variable:

- `VITE_API_URL`

### 3. Run locally

```bash
npm run dev
```

This starts:

- Client on `http://localhost:5173`
- Server on `http://localhost:5000`

## Deployment

### Frontend on Vercel

1. Import the `client` folder as the project root in Vercel.
2. Set `VITE_API_URL` to your deployed Render backend URL, for example `https://devboard-api.onrender.com/api`.
3. Deploy the app.

### Backend on Render

1. Create a new Web Service from the `server` folder.
2. Set the environment variables in Render.
3. Use `npm install` as the build command.
4. Use `npm start` as the start command.
5. Add your MongoDB connection string in `MONGO_URI`.

## Notes

- GitHub stats use public endpoints and do not require a token.
- The streak shown is based on recent public activity events.
- API failures are handled with fallback UI messages in the dashboard.
````

## /.github/copilot-instructions.md

````markdown
```markdown
<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->
- [ ] Verify that the copilot-instructions.md file in the .github directory is created.

- [ ] Clarify Project Requirements
	<!-- Ask for project type, language, and frameworks if not specified. Skip if already provided. -->

- [ ] Scaffold the Project
	<!--
	Ensure that the previous step has been marked as completed.
	Call project setup tool with projectType parameter.
	Run scaffolding command to create project files and folders.
	Use '.' as the working directory.
	If no appropriate projectType is available, search documentation using available tools.
	Otherwise, create the project structure manually using available file creation tools.
	-->

- [ ] Customize the Project
	<!--
	Verify that all previous steps have been completed successfully and you have marked the step as completed.
	Develop a plan to modify codebase according to user requirements.
	Apply modifications using appropriate tools and user-provided references.
	Skip this step for "Hello World" projects.
	-->

- [ ] Install Required Extensions
	<!-- ONLY install extensions provided mentioned in the get_project_setup_info. Skip this step otherwise and mark as completed. -->

- [ ] Compile the Project
	<!--
	Verify that all previous steps have been completed.
	Install any missing dependencies.
	Run diagnostics and resolve any issues.
	Check for markdown files in project folder for relevant instructions on how to do this.
	-->

- [ ] Create and Run Task
	<!--
	Verify that all previous steps have been completed.
	Check https://code.visualstudio.com/docs/debugtest/tasks to determine if the project needs a task. If so, use the create_and_run_task to create and launch a task based on package.json, README.md, and project structure.
	Skip this step otherwise.
	 -->

- [ ] Launch the Project
	<!--
	Verify that all previous steps have been completed.
	Prompt user for debug mode, launch only if confirmed.
	 -->

- [ ] Ensure Documentation is Complete
	<!--
	Verify that all previous steps have been completed.
	Verify that README.md and the copilot-instructions.md file in the .github directory exists and contains current project information.
	Clean up the copilot-instructions.md file in the .github directory by removing all HTML comments.
	-->

<!--
## Execution Guidelines
PROGRESS TRACKING:
- If any tools are available to manage the above todo list, use it to track progress through this checklist.
- After completing each step, mark it complete and add a summary.
- Read current todo list status before starting each new step.

COMMUNICATION RULES:
- Avoid verbose explanations or printing full command outputs.
- If a step is skipped, state that briefly (e.g. "No extensions needed").
- Do not explain project structure unless asked.
- Keep explanations concise and focused.

DEVELOPMENT RULES:
- Use '.' as the working directory unless user specifies otherwise.
- Avoid adding media or external links unless explicitly requested.
- Use placeholders only with a note that they should be replaced.
- Use VS Code API tool only for VS Code extension projects.
- Once the project is created, it is already opened in Visual Studio Code—do not suggest commands to open this project in Visual Studio again.
- If the project setup information has additional rules, follow them strictly.

FOLDER CREATION RULES:
- Always use the current directory as the project root.
- If you are running any terminal commands, use the '.' argument to ensure that the current working directory is used ALWAYS.
- Do not create a new folder unless the user explicitly requests it besides a .vscode folder for a tasks.json file.
- If any of the scaffolding commands mention that the folder name is not correct, let the user know to create a new folder with the correct name and then reopen it again in vscode.

EXTENSION INSTALLATION RULES:
- Only install extension specified by the get_project_setup_info tool. DO NOT INSTALL any other extensions.

PROJECT CONTENT RULES:
- If the user has not specified project details, assume they want a "Hello World" project as a starting point.
- Avoid adding links of any type (URLs, files, folders, etc.) or integrations that are not explicitly required.
- Avoid generating images, videos, or any other media files unless explicitly requested.
- If you need to use any media assets as placeholders, let the user know that these are placeholders and should be replaced with the actual assets later.
- Ensure all generated components serve a clear purpose within the user's requested workflow.
- If a feature is assumed but not confirmed, prompt the user for clarification before including it.
- If you are working on a VS Code extension, use the VS Code API tool with a query to find relevant VS Code API references and samples related to that query.

TASK COMPLETION RULES:
- Your task is complete when:
  - Project is successfully scaffolded and compiled without errors
  - copilot-instructions.md file in the .github directory exists in the project
  - README.md file exists and is up to date
  - User is provided with clear instructions to debug/launch the project

Before starting a new task in the above plan, update progress in the plan.
-->
- Work through each checklist item systematically.
- Keep communication concise and focused.
- Follow development best practices.
````

```
