import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('devboard_token') || '');
  const [user, setUser] = useState(null);
  const [isNewUser, setIsNewUser] = useState(false);
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
        setIsNewUser(false);
      } catch {
        localStorage.removeItem('devboard_token');
        setToken('');
        setUser(null);
        setIsNewUser(false);
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
      isNewUser,
      bootstrapping,
      setIsNewUser,
      updateUser(nextUser) {
        setUser((currentUser) => ({ ...(currentUser || {}), ...nextUser }));
      },
      async login(credentials) {
        const { data } = await api.post('/auth/login', credentials);
        localStorage.setItem('devboard_token', data.token);
        setToken(data.token);
        setUser(data.user);
        setIsNewUser(false);
      },
      async register(credentials) {
        const { data } = await api.post('/auth/register', credentials);
        localStorage.setItem('devboard_token', data.token);
        setToken(data.token);
        setUser(data.user);
        setIsNewUser(true);
      },
      async updateProfile(profile) {
        const { data } = await api.patch('/auth/profile', profile);
        setUser(data.user);
        return data.user;
      },
      logout() {
        localStorage.removeItem('devboard_token');
        setToken('');
        setUser(null);
        setIsNewUser(false);
      }
    }),
    [token, user, isNewUser, bootstrapping]
  );

  return <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
