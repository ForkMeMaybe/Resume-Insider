import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL + 'api/auth/';

  useEffect(() => {
    console.log('AuthContext: Loading state is', loading);
    const loadUser = () => {
      try {
        const storedToken = localStorage.getItem('authToken');
        if (storedToken) {
          setAuthToken(storedToken);
          // In a real app, you'd decode the token or make an API call to get user info
          // For simplicity, we'll just assume the token means the user is logged in
          setUser({ username: 'User' }); // Placeholder user
        }
      } catch (error) {
        console.error("Failed to load auth token from localStorage", error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}jwt/create/`, { username, password });
      const token = response.data.access;
      localStorage.setItem('authToken', token);
      setAuthToken(token);
      setUser({ username: username }); // Use username for user object
      return true;
    } catch (error) {
      console.error("Login failed", error.response?.data || error);
      setAuthToken(null);
      setUser(null);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setAuthToken(null);
    setUser(null);
  };

  const value = {
    user,
    authToken,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children} {/* Temporarily remove !loading condition for debugging */}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};