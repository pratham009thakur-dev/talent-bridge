import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('jobportal_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem('jobportal_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.get('/auth/me');
      if (data.success) {
        setUser(data.user);
        setProfile(data.profile);
        localStorage.setItem('jobportal_user', JSON.stringify(data.user));
      }
    } catch (error) {
      localStorage.removeItem('jobportal_token');
      localStorage.removeItem('jobportal_user');
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.success) {
      localStorage.setItem('jobportal_token', data.token);
      localStorage.setItem('jobportal_user', JSON.stringify(data.user));
      setUser(data.user);
      await fetchCurrentUser();
    }
    return data;
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    if (data.success) {
      localStorage.setItem('jobportal_token', data.token);
      localStorage.setItem('jobportal_user', JSON.stringify(data.user));
      setUser(data.user);
      await fetchCurrentUser();
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem('jobportal_token');
    localStorage.removeItem('jobportal_user');
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        setProfile,
        loading,
        login,
        register,
        logout,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};