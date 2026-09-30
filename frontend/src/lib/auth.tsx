import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '../types';
import { loginApi, fetchCurrentUserApi } from './api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (roleCode: UserRole, username?: string) => Promise<string>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('nwis_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    const defaultUser: User = {
      id: 1,
      username: 'drilling_engineer_demo',
      fullName: 'Senior Drilling Engineer (Demo)',
      email: 'drilling_engineer@nwis.internal',
      roleCode: 'DRILLING_ENGINEER',
      roleDisplayName: 'Drilling Engineer',
      defaultLandingPage: '/dashboard',
      dashboardPermissions: {
        dashboard: 'FULL',
        map: 'FULL',
        live: 'FULL',
        alerts: 'FULL',
        historical: 'FULL',
        assistant: 'FULL',
        reports: 'FULL'
      },
      actionPermissions: ['VIEW_RISK', 'EXPORT_REPORT'],
      isDemoAccount: true
    };
    localStorage.setItem('nwis_user', JSON.stringify(defaultUser));
    return defaultUser;
  });

  const [token, setToken] = useState<string | null>(() => {
    const savedToken = localStorage.getItem('nwis_token');
    if (savedToken) return savedToken;
    const defaultToken = 'demo-token-drilling_engineer';
    localStorage.setItem('nwis_token', defaultToken);
    return defaultToken;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('nwis_token');
        if (storedToken) {
          const fetchedUser = await fetchCurrentUserApi(storedToken);
          if (fetchedUser) {
            setUser(fetchedUser);
            localStorage.setItem('nwis_user', JSON.stringify(fetchedUser));
          }
        }
      } catch (e) {
        console.warn('Auth background sync warning:', e);
      }
    };
    initAuth();
  }, []);

  const login = async (roleCode: UserRole, username?: string): Promise<string> => {
    setIsLoading(true);
    try {
      const res = await loginApi(roleCode, username);
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('nwis_token', res.token);
      localStorage.setItem('nwis_user', JSON.stringify(res.user));
      setIsLoading(false);
      return res.user.defaultLandingPage;
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('nwis_token');
    localStorage.removeItem('nwis_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
