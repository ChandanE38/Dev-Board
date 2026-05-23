import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StatsProvider } from './context/StatsContext';
import Shell from './components/Shell';
import OnboardingModal from './components/OnboardingModal';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OverviewPage from './pages/OverviewPage';
import GitHubPage from './pages/GitHubPage';
import LeetCodePage from './pages/LeetCodePage';
import GoalsPage from './pages/GoalsPage';
import AICoachPage from './pages/AICoachPage';
import SettingsPage from './pages/SettingsPage';
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
      <Route path="/overview" element={<Navigate to="/dashboard/overview" replace />} />
      <Route path="/github" element={<Navigate to="/dashboard/github" replace />} />
      <Route path="/leetcode" element={<Navigate to="/dashboard/leetcode" replace />} />
      <Route path="/goals" element={<Navigate to="/dashboard/goals" replace />} />
      <Route path="/ai-coach" element={<Navigate to="/dashboard/ai-coach" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <StatsProvider>
              <Shell />
            </StatsProvider>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<OverviewPage />} />
        <Route path="github" element={<GitHubPage />} />
        <Route path="leetcode" element={<LeetCodePage />} />
        <Route path="goals" element={<GoalsPage />} />
        <Route path="ai-coach" element={<AICoachPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}

function AppShell() {
  const { user, isNewUser } = useAuth();

  return (
    <>
      <AppRoutes />
      {user && isNewUser && <OnboardingModal />}
    </>
  );
}
