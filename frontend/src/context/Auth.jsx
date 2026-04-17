import { createContext, useContext, useEffect, useState } from 'react';
import { api, setAuthToken } from '../lib/Api';

const AuthContext = createContext(null);

const AUTH_STORAGE_KEY = 'vendorflow_auth';

export function AuthProvider({ children }) {
  const [authToken, setAuthTokenState] = useState('');
  const [refreshToken, setRefreshTokenState] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      setAuthTokenState(parsed.authToken || '');
      setRefreshTokenState(parsed.refreshToken || '');
      setUserEmail(parsed.userEmail || '');
      setAuthToken(parsed.authToken || '');
    } catch (error) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, []);

  const persist = (nextState) => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextState));
  };

  const login = ({ authToken: nextAuthToken, refreshToken: nextRefreshToken, userEmail: nextEmail }) => {
    setAuthTokenState(nextAuthToken);
    setRefreshTokenState(nextRefreshToken || '');
    setUserEmail(nextEmail || '');
    setAuthToken(nextAuthToken);
    persist({
      authToken: nextAuthToken,
      refreshToken: nextRefreshToken || '',
      userEmail: nextEmail || '',
    });
  };

  const logout = () => {
    setAuthTokenState('');
    setRefreshTokenState('');
    setUserEmail('');
    setAuthToken('');
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        api,
        authToken,
        refreshToken,
        userEmail,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
