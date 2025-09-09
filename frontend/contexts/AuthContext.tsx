import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define the shape of our mock user
interface User {
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// A simple provider component that wraps our app
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Mock login function - in a real app, this would involve API calls
  const login = () => {
    // For now, just set a mock user object
    setUser({ name: 'Mock User' });
  };

  // Logout function
  const logout = () => {
    setUser(null);
  };

  const value = { user, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to easily access auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
