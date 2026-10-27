import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('staymate_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('staymate_token') || null);
  const [loading, setLoading] = useState(true);

  // Clear auth data
  const clearAuth = useCallback(() => {
    localStorage.removeItem('staymate_token');
    localStorage.removeItem('staymate_user');
    setToken(null);
    setUser(null);
  }, []);

  // Check auth session on startup
  const checkAuth = useCallback(async () => {
    const savedToken = localStorage.getItem('staymate_token');
    if (!savedToken) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/auth/me');
      if (response.data && response.data.user) {
        setUser(response.data.user);
        localStorage.setItem('staymate_user', JSON.stringify(response.data.user));
      } else {
        clearAuth();
      }
    } catch (error) {
      console.warn('[AuthContext] Session expired or invalid token:', error.response?.data?.message || error.message);
      clearAuth();
    } finally {
      setLoading(false);
    }
  }, [clearAuth]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Login handler
  const login = async (identifier, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { identifier, password });
      const { token: receivedToken, user: loggedInUser } = response.data;

      localStorage.setItem('staymate_token', receivedToken);
      localStorage.setItem('staymate_user', JSON.stringify(loggedInUser));

      setToken(receivedToken);
      setUser(loggedInUser);

      return { success: true, user: loggedInUser };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Register handler
  const register = async (formData) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register', formData);
      const { token: receivedToken, user: newUser } = response.data;

      localStorage.setItem('staymate_token', receivedToken);
      localStorage.setItem('staymate_user', JSON.stringify(newUser));

      setToken(receivedToken);
      setUser(newUser);

      return { success: true, user: newUser };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = () => {
    clearAuth();
    window.location.href = '/login';
  };

  // Helper to update user details in state
  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const nextUser = { ...prev, ...updatedFields };
      localStorage.setItem('staymate_user', JSON.stringify(nextUser));
      return nextUser;
    });
  };

  const isManager = user?.role === 'manager' || user?.role === 'admin';
  const isWarden = user?.role === 'warden';
  const isAccountant = user?.role === 'accountant';
  const isStudent = user?.role === 'student';

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    isManager,
    isWarden,
    isAccountant,
    isStudent,
    isAdmin: isManager, // backward compatibility
    login,
    register,
    logout,
    checkAuth,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
