import React, { createContext, useContext, useState } from 'react';
import api from '../services/api';

interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthContextData {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextData | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    try {
      console.log('Enviando dados para o backend:', { email, senha: password });
      const response = await api.post('/auth/login', { email, senha: password });
      console.log('Resposta do backend:', response.data);
      setCurrentUser(response.data);
      localStorage.setItem('authToken', response.data.token);
    } catch (error) {
      if (error instanceof Error) {
        console.error('Erro ao realizar login:', (error as any).response?.data || error.message);
      } else {
        console.error('Erro ao realizar login:', error);
      }
      throw new Error('Erro ao realizar login');
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('authToken');
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextData => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};