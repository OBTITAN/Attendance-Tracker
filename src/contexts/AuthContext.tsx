import React, { createContext, useState, useContext, ReactNode } from 'react';

type UserRole = 'lecturer' | 'admin' | null;

interface User {
  role: UserRole;
  courseCode?: string;
  courseName?: string;
}

interface AuthContextType {
  user: User | null;
  login: (role: UserRole, courseCode?: string, courseName?: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (role: UserRole, courseCode?: string, courseName?: string) => {
    const newUser = { role, courseCode, courseName };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};