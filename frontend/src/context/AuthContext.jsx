import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('arcade_token'));
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          setUser(res.data.user);
          setIsGuest(false);
        })
        .catch(() => {
          localStorage.removeItem('arcade_token');
          setToken(null);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await axios.post('/api/auth/login', { email, password });
    const { token: t, user: u } = res.data;
    localStorage.setItem('arcade_token', t);
    setToken(t);
    setUser(u);
    setIsGuest(false);
    return u;
  };

  const register = async (name, email, password) => {
    const res = await axios.post('/api/auth/register', { name, email, password });
    const { token: t, user: u } = res.data;
    localStorage.setItem('arcade_token', t);
    setToken(t);
    setUser(u);
    setIsGuest(false);
    return u;
  };

  const logout = () => {
    localStorage.removeItem('arcade_token');
    setToken(null);
    setUser(null);
    setIsGuest(false);
  };

  const playAsGuest = () => {
    setIsGuest(true);
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isGuest, loading, login, register, logout, playAsGuest }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};

export default AuthContext;
