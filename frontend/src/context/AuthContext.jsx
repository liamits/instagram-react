import React, { createContext, useState, useContext, useEffect } from 'react';
import { API } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (token) {
        // Always try to fetch latest user data if we have a token
        try {
          const res = await fetch(API.users.me, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const json = await res.json();
          if (res.ok) {
            localStorage.setItem('user', JSON.stringify(json.data));
            setUser(json.data);
          } else if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        } catch (err) {
          if (storedUser) setUser(JSON.parse(storedUser));
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (emailOrUsername, password) => {
    try {
      const response = await fetch(API.auth.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrUsername, password }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message);
      const { token, user: u } = json.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(u));
      setUser(u);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const signup = async (username, email, password, fullName) => {
    try {
      const response = await fetch(API.auth.register, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, fullName }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message);
      const { token, user: u } = json.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(u));
      setUser(u);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  const updateUser = (updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
