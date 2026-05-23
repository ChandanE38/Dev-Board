import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import api from '../api/api';
import { useAuth } from './AuthContext';

const StatsContext = createContext(null);

export function StatsProvider({ children }) {
  const { user } = useAuth();
  const [githubUsername, setGithubUsername] = useState(user?.githubUsername || '');
  const [leetcodeUsername, setLeetcodeUsername] = useState(user?.leetcodeUsername || '');
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

  const fetchGithub = async (username = githubUsername) => {
    const targetUsername = String(username || '').trim();
    if (!targetUsername) {
      return;
    }

    setGithub({ loading: true, error: '', data: null });

    try {
      const [profileResponse, reposResponse, eventsResponse] = await Promise.all([
        axios.get(`https://api.github.com/users/${targetUsername}`),
        axios.get(`https://api.github.com/users/${targetUsername}/repos?sort=stars&per_page=100`),
        axios.get(`https://api.github.com/users/${targetUsername}/events/public?per_page=100`)
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

  useEffect(() => {
    fetchGithub();
  }, []);

  const fetchLeetCode = async (username = leetcodeUsername) => {
    const targetUsername = String(username || '').trim();
    if (!targetUsername) {
      return;
    }

    setLeetcode({ loading: true, error: '', data: null });
    try {
      const { data } = await api.get(`/leetcode/${targetUsername}`);
      console.log('LeetCode response:', data);
      setLeetcode({ loading: false, error: '', data });
    } catch {
      setLeetcode({
        loading: false,
        error: 'LeetCode stats unavailable. Check username or try again.',
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

  useEffect(() => {
    if (!user) {
      return;
    }

    const nextGithubUsername = user.githubUsername || '';
    const nextLeetcodeUsername = user.leetcodeUsername || '';

    setGithubUsername(nextGithubUsername);
    setLeetcodeUsername(nextLeetcodeUsername);

    if (nextGithubUsername) {
      fetchGithub(nextGithubUsername);
    }

    if (nextLeetcodeUsername) {
      fetchLeetCode(nextLeetcodeUsername);
    }
  }, [user?.githubUsername, user?.leetcodeUsername]);

  const value = useMemo(
    () => ({
      githubUsername,
      setGithubUsername,
      leetcodeUsername,
      setLeetcodeUsername,
      github,
      setGithub,
      leetcode,
      setLeetcode,
      goals,
      setGoals,
      goalText,
      setGoalText,
      goalError,
      setGoalError,
      loadingGoals,
      savingGoal,
      setSavingGoal,
      fetchGithub,
      fetchLeetCode,
      addGoal,
      toggleGoal,
      removeGoal
    }),
    [
      githubUsername,
      leetcodeUsername,
      github,
      leetcode,
      goals,
      goalText,
      goalError,
      loadingGoals,
      savingGoal
    ]
  );

  return <StatsContext.Provider value={value}>{children}</StatsContext.Provider>;
}

export function useStats() {
  return useContext(StatsContext);
}