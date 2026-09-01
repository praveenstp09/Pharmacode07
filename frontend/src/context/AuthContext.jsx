import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('pharmacode_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      localStorage.removeItem('pharmacode_user');
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('pharmacode_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('pharmacode_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.error('Failed to verify token', err);
          // Only clear session on 401 Unauthorized (expired/invalid token), not network glitches or 500s
          if (err.response?.status === 401) {
            logout();
          }
        }
      }
      setLoading(false);
    };

    checkUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      if (res.data.token) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('pharmacode_token', res.data.token);
        if (res.data.refreshToken) {
          localStorage.setItem('pharmacode_refresh_token', res.data.refreshToken);
        }
        localStorage.setItem('pharmacode_user', JSON.stringify(res.data.user));
      }
      return res.data;
    }
  };

  const register = async (name, email, mobile, password) => {
    const res = await api.post('/auth/register', { name, email, mobile, password });
    if (res.data.success) {
      if (res.data.token) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('pharmacode_token', res.data.token);
        if (res.data.refreshToken) {
          localStorage.setItem('pharmacode_refresh_token', res.data.refreshToken);
        }
        localStorage.setItem('pharmacode_user', JSON.stringify(res.data.user));
      }
      return res.data;
    }
  };

  const verifyEmailOTP = async (email, otp) => {
    const res = await api.post('/auth/verify-email-otp', { email, otp });
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('pharmacode_token', res.data.token);
      if (res.data.refreshToken) {
        localStorage.setItem('pharmacode_refresh_token', res.data.refreshToken);
      }
      localStorage.setItem('pharmacode_user', JSON.stringify(res.data.user));
      return res.data;
    }
  };

  const resendOTP = async (email) => {
    const res = await api.post('/auth/resend-otp', { email });
    return res.data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('pharmacode_token');
    localStorage.removeItem('pharmacode_refresh_token');
    localStorage.removeItem('pharmacode_user');
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem('pharmacode_user', JSON.stringify(res.data.user));
        return res.data.user;
      }
    } catch (err) {
      console.error('Error refreshing user', err);
    }
    return null;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        verifyEmailOTP,
        resendOTP,
        logout,
        refreshUser,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
