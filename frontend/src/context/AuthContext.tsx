import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import api from '../services/api';

// User interface
interface User {
  id: number;
  nome_usuario: string;
  email: string;
  foto_perfil: string | null;
}

// Auth context data interface
interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, senha: string) => Promise<boolean>;
  logout: () => void;
}

// Create and export the context with proper typing
const AuthContext = createContext<AuthContextData | undefined>(undefined);

// AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      api.get('/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => setUser(res.data))
      .catch(() => logout());
    }
  }, []);

  const login = async (email: string, senha: string): Promise<boolean> => {
    try {
      const response = await api.post('/auth/login', { email, senha });
      localStorage.setItem('authToken', response.data.token);
      setUser(response.data.user); // Assuming the user data is in response.data.user
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// useAuth hook
export const useAuth = (): AuthContextData => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};